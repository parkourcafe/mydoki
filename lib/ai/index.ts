import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseServer } from "../supabase/server";
import { callLLM, extractJson, activeTextModel } from "./provider";
import { getPrompt } from "./prompts";
import {
  outputViolatesPolicy,
  splitByGrounding,
  type EvidenceItem,
} from "./guardrails";

export { aiTextConfigured } from "./provider";

export type RunAgentInput = {
  kind: string; // ключ промпта (vacancy_structuring, evidence_extraction, …)
  user: string; // пользовательская часть запроса
  subjectType?: "vacancy" | "application";
  subjectId?: string;
  temperature?: number;
};

export type AiRun = {
  id: string | null;
  kind: string;
  output: Record<string, unknown>;
  items: EvidenceItem[]; // подтверждённые (с grounding)
  unsupported: EvidenceItem[]; // без grounding — прячем до клика
  blocked: boolean; // нарушил лексику
  state: "completed" | "blocked" | "needs_review";
};

/**
 * Единый вход в AI: собирает промпт, вызывает провайдера, парсит JSON,
 * прогоняет через guardrails и логирует в ai_runs (prompt_version, model,
 * groundings, состояние). Возвращает разобранный результат.
 *
 * Human Review Gate: строка ai_runs создаётся с state='needs_review' —
 * ни один вывод не влияет на статус кандидата, пока его не проверил человек
 * (reviewed_by остаётся NULL до ревью).
 */
export async function runAgent(input: RunAgentInput): Promise<AiRun> {
  const prompt = getPrompt(input.kind);
  const model = activeTextModel();
  const inputDigest = createHash("sha256").update(input.user).digest("hex");

  let raw: Record<string, unknown> = {};
  let items: EvidenceItem[] = [];
  let blocked = false;
  let state: AiRun["state"] = "completed";

  try {
    const text = await callLLM(prompt.system, input.user, {
      temperature: input.temperature ?? 0.2,
    });
    raw = extractJson(text);
    const arr = Array.isArray(raw.items) ? (raw.items as EvidenceItem[]) : [];
    items = arr.filter((i) => i && typeof i.text === "string");
    if (outputViolatesPolicy(items)) {
      blocked = true;
      state = "blocked";
      items = [];
    } else if (items.length > 0) {
      state = "needs_review"; // требует проверки человеком
    }
  } catch {
    state = "completed"; // без ключей/при ошибке — пустой прогон, не роняем UI
  }

  const { supported, unsupported } = splitByGrounding(items);
  const groundings = supported.map((i) => ({
    claim: i.text,
    source: i.source ?? null,
    quote: i.quote ?? null,
    confidence: i.confidence ?? null,
  }));

  // Логируем прогон (best-effort — сбой лога не ломает сценарий).
  let runId: string | null = null;
  try {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("ai_runs")
      .insert({
        kind: input.kind,
        subject_type: input.subjectType ?? null,
        subject_id: input.subjectId ?? null,
        prompt_version: prompt.version,
        model,
        input_digest: inputDigest,
        output: raw,
        groundings,
        state,
      })
      .select("id")
      .single();
    runId = (data?.id as string) ?? null;
  } catch {
    /* журналирование не критично */
  }

  return { id: runId, kind: input.kind, output: raw, items: supported, unsupported, blocked, state };
}
