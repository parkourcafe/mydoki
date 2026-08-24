import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { Locale } from "../i18n";
import { employmentTypeLabel, type EmploymentType } from "../employment";
import { MUTED, styles } from "./styles";

// =====================================================================
// Справка о работе. Данные у нас уже есть (employments), не хватало только
// файла на выходе: работодатель не мог выдать сотруднику бумагу из системы.
//
// Doki.help ничего не заверяет и ничего не подтверждает от себя: справка —
// это выписка из записей самого работодателя. Подпись и печать — вне системы.
// В справке нет ни зарплаты, ни причин ухода, ни оценок — тот же принцип,
// что на публичной странице подтверждения занятости.
// =====================================================================

export type EmploymentLetterData = {
  companyName: string;
  employeeName: string;
  position: string;
  employmentType: EmploymentType | string;
  startDate: string | null;
  endDate: string | null;
  status: "active" | "ended" | string;
  /** Дата составления, YYYY-MM-DD. */
  issuedOn: string;
  /** Публичная ссылка подтверждения, если работник её уже создал. */
  verifyUrl: string | null;
};

const M: Record<Locale, Record<string, string>> = {
  ru: {
    title: "Справка о работе",
    employee: "Сотрудник",
    position: "Должность",
    type: "Тип занятости",
    period: "Период работы",
    status: "Статус",
    active: "работает по настоящее время",
    ended: "трудовые отношения завершены",
    present: "по настоящее время",
    issued: "Дата составления",
    body: "Настоящим подтверждается, что указанный сотрудник работает (работал) в компании на условиях, приведённых выше.",
    verify: "Проверить онлайн",
    disclaimer:
      "Справка сформирована из записей работодателя в doki.help. Doki.help не заверяет содержание; подпись и печать работодателя ставятся вне системы.",
  },
  en: {
    title: "Employment letter",
    employee: "Employee",
    position: "Position",
    type: "Employment type",
    period: "Period of employment",
    status: "Status",
    active: "currently employed",
    ended: "employment ended",
    present: "present",
    issued: "Issued on",
    body: "This confirms that the person named above works (or worked) at the company on the terms listed here.",
    verify: "Verify online",
    disclaimer:
      "Generated from the employer's own records in doki.help. Doki.help does not certify the contents; the employer signs and stamps it outside the system.",
  },
  id: {
    title: "Surat keterangan kerja",
    employee: "Karyawan",
    position: "Posisi",
    type: "Jenis hubungan kerja",
    period: "Masa kerja",
    status: "Status",
    active: "masih bekerja",
    ended: "hubungan kerja berakhir",
    present: "sekarang",
    issued: "Tanggal dibuat",
    body: "Dengan ini diterangkan bahwa karyawan tersebut bekerja (atau pernah bekerja) di perusahaan dengan ketentuan di atas.",
    verify: "Verifikasi daring",
    disclaimer:
      "Dibuat dari catatan pemberi kerja di doki.help. Doki.help tidak mengesahkan isinya; tanda tangan dan stempel dibubuhkan di luar sistem.",
  },
  uz: {
    title: "Ish haqida ma’lumotnoma",
    employee: "Xodim",
    position: "Lavozim",
    type: "Bandlik turi",
    period: "Ish davri",
    status: "Holat",
    active: "hozir ishlamoqda",
    ended: "mehnat munosabatlari tugagan",
    present: "hozirgacha",
    issued: "Tuzilgan sana",
    body: "Ushbu hujjat bilan yuqorida ko‘rsatilgan xodim kompaniyada yuqoridagi shartlar asosida ishlashi (ishlaganligi) tasdiqlanadi.",
    verify: "Onlayn tekshirish",
    disclaimer:
      "Ma’lumotnoma ish beruvchining doki.help’dagi yozuvlaridan tuzilgan. Doki.help mazmunini tasdiqlamaydi; imzo va muhr tizimdan tashqarida qo‘yiladi.",
  },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.row, { marginTop: 4 }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function EmploymentLetterPdf({
  locale,
  data,
}: {
  locale: Locale;
  data: EmploymentLetterData;
}) {
  const t = M[locale];
  const period =
    data.startDate && data.endDate
      ? `${data.startDate} — ${data.endDate}`
      : data.startDate
        ? `${data.startDate} — ${t.present}`
        : data.endDate
          ? `— ${data.endDate}`
          : "—";

  return (
    <Document title={t.title} creator="doki.help" producer="doki.help">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.companyName}</Text>
        <View style={styles.rule} />

        <Text style={styles.letterTitle}>{t.title}</Text>

        <Row label={t.employee} value={data.employeeName || "—"} />
        <Row label={t.position} value={data.position || "—"} />
        <Row label={t.type} value={employmentTypeLabel(locale, data.employmentType)} />
        <Row label={t.period} value={period} />
        <Row label={t.status} value={data.status === "ended" ? t.ended : t.active} />
        <Row label={t.issued} value={data.issuedOn} />

        <Text style={styles.paragraph}>{t.body}</Text>

        {data.verifyUrl ? (
          <Text style={[styles.paragraph, { color: MUTED }]}>
            {t.verify}: {data.verifyUrl}
          </Text>
        ) : null}

        <Text style={styles.footer} fixed>
          {t.disclaimer}
        </Text>
      </Page>
    </Document>
  );
}
