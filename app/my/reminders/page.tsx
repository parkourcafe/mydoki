import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listExpiring,
  listMembers,
  listReminders,
} from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import SubmitButton from "@/components/SubmitButton";
import {
  createReminder,
  deleteReminderItem,
  toggleReminder,
} from "@/app/my/actions";

const M = {
  ru: {
    title: "Сроки",
    subtitle: "Документы, срок действия которых истекает в ближайшие 60 дней.",
    empty: "Ничего не истекает в ближайшее время 🎉",
    until: "до",
    overdue: (n: number) => `просрочен на ${n} дн.`,
    daysLeft: (n: number) => `${n} дн.`,
    myReminders: "Мои напоминания",
    myRemindersHint: "Свои напоминания с датой и порогами письма.",
    rTitle: "Напоминание",
    rTitlePh: "Продлить страховку",
    rDate: "Дата",
    rOffsets: "Напомнить за (дней)",
    rOffsetsPh: "30, 7, 1",
    addReminder: "Добавить напоминание",
    noReminders: "Пока нет своих напоминаний.",
    done: "выполнено",
    reopen: "вернуть",
    del: "удалить",
  },
  en: {
    title: "Deadlines",
    subtitle: "Documents expiring within the next 60 days.",
    empty: "Nothing expires anytime soon 🎉",
    until: "until",
    overdue: (n: number) => `overdue by ${n} d.`,
    daysLeft: (n: number) => `${n} d.`,
    myReminders: "My reminders",
    myRemindersHint: "Your own reminders with a date and email thresholds.",
    rTitle: "Reminder",
    rTitlePh: "Renew insurance",
    rDate: "Date",
    rOffsets: "Remind before (days)",
    rOffsetsPh: "30, 7, 1",
    addReminder: "Add reminder",
    noReminders: "No reminders of your own yet.",
    done: "done",
    reopen: "reopen",
    del: "delete",
  },
  uz: {
    title: "Muddatlar",
    subtitle: "Keyingi 60 kun ichida amal qilish muddati tugaydigan hujjatlar.",
    empty: "Yaqin orada hech narsaning muddati tugamaydi 🎉",
    until: "gacha",
    overdue: (n: number) => `${n} kunga kechikkan`,
    daysLeft: (n: number) => `${n} kun`,
    myReminders: "Mening eslatmalarim",
    myRemindersHint: "Sana va xat chegaralari bilan shaxsiy eslatmalar.",
    rTitle: "Eslatma",
    rTitlePh: "Sugʻurtani yangilash",
    rDate: "Sana",
    rOffsets: "Necha kun oldin eslatish",
    rOffsetsPh: "30, 7, 1",
    addReminder: "Eslatma qoʻshish",
    noReminders: "Hozircha shaxsiy eslatmalar yoʻq.",
    done: "bajarildi",
    reopen: "qaytarish",
    del: "oʻchirish",
  },
  id: {
    title: "Tenggat waktu",
    subtitle: "Dokumen yang masa berlakunya habis dalam 60 hari ke depan.",
    empty: "Tidak ada yang akan habis masa berlakunya dalam waktu dekat 🎉",
    until: "hingga",
    overdue: (n: number) => `terlambat ${n} hr`,
    daysLeft: (n: number) => `${n} hr`,
    myReminders: "Pengingat saya",
    myRemindersHint: "Pengingat Anda sendiri dengan tanggal dan ambang email.",
    rTitle: "Pengingat",
    rTitlePh: "Perpanjang asuransi",
    rDate: "Tanggal",
    rOffsets: "Ingatkan sebelum (hari)",
    rOffsetsPh: "30, 7, 1",
    addReminder: "Tambah pengingat",
    noReminders: "Belum ada pengingat sendiri.",
    done: "selesai",
    reopen: "buka lagi",
    del: "hapus",
  },
} as const;

function daysLeft(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86400_000);
}

export default async function RemindersPage() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const [docs, members, reminders] = await Promise.all([
    listExpiring(householdId, 60),
    listMembers(householdId),
    listReminders(householdId),
  ]);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.subtitle}
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">
          {t.empty}
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const left = daysLeft(d.expires_at!);
            const overdue = left < 0;
            return (
              <li key={d.id}>
                <Link
                  href={`/my/documents/${d.id}`}
                  className="card flex items-center justify-between transition hover:border-brand-300"
                >
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-slate-500">
                      {nameOf.get(d.member_id ?? "") ?? "—"} · {t.until} {d.expires_at}
                    </div>
                  </div>
                  <span
                    className={
                      overdue
                        ? "rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600"
                        : left <= 14
                          ? "rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                    }
                  >
                    {overdue ? t.overdue(-left) : t.daysLeft(left)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Мои напоминания (ручные) */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">{t.myReminders}</h2>
          <p className="text-sm text-slate-500">{t.myRemindersHint}</p>
        </div>

        {reminders.length > 0 && (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className={r.done ? "text-slate-400 line-through" : ""}>
                  <div className="text-sm font-medium">
                    {r.title ?? r.message}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.until} {r.due_at} · {Array.isArray(r.offsets) ? r.offsets.join(", ") : ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2 text-xs">
                  <form action={toggleReminder}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="done" value={String(r.done)} />
                    <button className="text-brand-600 hover:underline">
                      {r.done ? t.reopen : t.done}
                    </button>
                  </form>
                  <form action={deleteReminderItem}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-red-500 hover:underline">
                      {t.del}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {reminders.length === 0 && (
          <p className="text-sm text-slate-400">{t.noReminders}</p>
        )}

        <details className="card">
          <summary className="cursor-pointer font-medium">
            {t.addReminder}
          </summary>
          <form action={createReminder} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">{t.rTitle}</label>
              <input
                name="title"
                required
                className="input"
                placeholder={t.rTitlePh}
              />
            </div>
            <div>
              <label className="label">{t.rDate}</label>
              <input name="due_at" type="date" required className="input" />
            </div>
            <div>
              <label className="label">{t.rOffsets}</label>
              <input
                name="offsets"
                className="input"
                defaultValue="30, 7, 1"
                placeholder={t.rOffsetsPh}
              />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>{t.addReminder}</SubmitButton>
            </div>
          </form>
        </details>
      </section>
    </div>
  );
}
