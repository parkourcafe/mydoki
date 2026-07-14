"use client";

import { track } from "./analytics";

// =====================================================================
// UBA — каталог продуктовых событий (единый источник истины).
//
// Зачем: без типизации имена событий и их свойства расходятся (typo → «мёртвое»
// событие в PostHog, которое не попадёт в воронку). Этот файл фиксирует
// таксономию: имя события → форма свойств. Новые события шлём через
// trackEvent() — с автокомплитом и проверкой типов. Существующие вызовы track()
// перечислены здесь же как канон и мигрируются постепенно (см. docs/analytics/UBA.md).
//
// Правила именования: snake_case, «объект_действие» в прошедшем времени
// (document_added, application_submitted). В свойства НЕ кладём PII — фильтр в
// analytics.track() вырежет name/email/phone/token как страховку.
// =====================================================================

export interface EventMap {
  // ── Аккаунт и жизненный цикл ──────────────────────────────────────
  signed_up: { method: "google" | "email" | "phone" };
  logged_in: { method: "google" | "email" | "phone" };

  // ── Активация семейного сейфа (сторона /my) ───────────────────────
  member_added: Record<string, never>;
  document_added: {
    category?: string;
    /** Как добавлен документ: вручную, нативной камерой или через AI-распознавание. */
    via: "manual" | "camera" | "ai";
  };
  document_recognized: { category?: string; success: boolean };
  reminder_set: { doc_category?: string };
  document_shared: { kind: "link" | "package"; expires_days?: number };
  document_exported: Record<string, never>;

  // ── Работодатель: создание вакансии (T11 Vacancy Composer) ────────
  vacancy_create_started: { source: "manual" | "template" | "ai_freeform" };
  vacancy_template_selected: { template_id: string; category: string };
  vacancy_ai_prompt_submitted: { input_length: number; role_category_detected: string };
  vacancy_ai_draft_generated: {
    fields_generated_count: number;
    generation_success: boolean;
    error_type?: string;
  };
  vacancy_ai_draft_applied: { fields_applied_count: number };
  vacancy_quality_check_run: {
    clarity_score: number;
    missing_fields_count: number;
    warnings_count: number;
  };
  vacancy_created: { vacancy_id: string };
  vacancy_published: {
    source: string;
    time_to_publish_seconds: number;
    fields_completed_count: number;
    clarity_score: number;
  };
  vacancy_creation_abandoned: { last_step: string; source: string };

  // ── Кандидат: просмотр и отклик ───────────────────────────────────
  vacancy_viewed: { vacancy_id: string; src?: string };
  application_started: { vacancy_id: string };
  document_uploaded: { vacancy_id: string; doc_type: string };
  video_recorded: { vacancy_id: string };
  application_submitted: { vacancy_id: string };

  // ── Работодатель: работа с откликами ──────────────────────────────
  application_status_changed: { to: string; vacancy_id: string };
  whatsapp_clicked: { vacancy_id: string };
}

export type EventName = keyof EventMap;

/**
 * Типобезопасная отправка продуктового события. Предпочитайте её сырому
 * track(): имя и свойства проверяются по EventMap.
 */
export function trackEvent<K extends EventName>(name: K, props: EventMap[K]): void {
  track(name, props as Record<string, string | number | boolean | null | undefined>);
}
