"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Что проверить в договоре аренды квартиры?",
  "Как составить претензию в магазин на возврат товара?",
  "Просрочил ОСАГО — что грозит и что делать?",
  "Как оформить согласие на выезд ребёнка за границу?",
];

export default function LawyerPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setErr(null);
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/lawyer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Не удалось получить ответ.");
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setErr("Сеть недоступна — попробуйте ещё раз.");
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">AI-юрист</h1>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          ✨ Premium · на тесте бесплатно
        </span>
      </div>

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
        Это справочный помощник, а не юридическая консультация. В важных случаях
        обращайтесь к живому юристу. Юрист не видит ваши документы — при
        необходимости вставьте нужный текст или детали прямо в сообщение.
      </p>

      <div className="card min-h-[300px] space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              Задайте вопрос по бытовому праву — например:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm " +
                    (m.role === "user"
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-800")
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-3.5 py-2 text-sm text-slate-400">
                  Думаю…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ваш вопрос юристу…"
          className="input flex-1"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary">
          {busy ? "…" : "Спросить"}
        </button>
      </form>
    </div>
  );
}
