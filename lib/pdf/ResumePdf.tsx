import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { Locale } from "../i18n";
import { formatPeriod, sortExperienceDesc, type ResumeSections } from "../resume";
import { styles } from "./styles";

// =====================================================================
// CV кандидата на одной странице. Собирается из структурного резюме
// (lib/resume.ts) — того же, что редактируется на /my/resume и уходит
// работодателю снимком вместе с откликом.
// =====================================================================

export type ResumePdfData = {
  fullName: string;
  headline: string;
  location: string;
  contact: string;
  email: string;
  about: string;
  /** Старое текстовое поле опыта — показываем, если структурных записей нет. */
  legacyExperience: string;
  sections: ResumeSections;
  customFields: { label: string; value: string }[];
};

const M: Record<Locale, Record<string, string>> = {
  ru: {
    experience: "Опыт работы",
    education: "Обучение",
    skills: "Навыки",
    languages: "Языки",
    about: "О себе",
    other: "Дополнительно",
    present: "по настоящее время",
    verified: "подтверждено в doki",
    footer: "Резюме составлено на doki.help",
  },
  en: {
    experience: "Work experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    about: "About",
    other: "Other",
    present: "present",
    verified: "verified in doki",
    footer: "Resume made on doki.help",
  },
  id: {
    experience: "Pengalaman kerja",
    education: "Pendidikan",
    skills: "Keterampilan",
    languages: "Bahasa",
    about: "Tentang",
    other: "Lainnya",
    present: "sekarang",
    verified: "terverifikasi di doki",
    footer: "Resume dibuat di doki.help",
  },
  uz: {
    experience: "Ish tajribasi",
    education: "Ta’lim",
    skills: "Ko‘nikmalar",
    languages: "Tillar",
    about: "O‘zim haqimda",
    other: "Qo‘shimcha",
    present: "hozirgacha",
    verified: "doki’da tasdiqlangan",
    footer: "Rezyume doki.help’da tuzilgan",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ResumePdf({ locale, data }: { locale: Locale; data: ResumePdfData }) {
  const t = M[locale];
  const { sections } = data;

  const contactParts = [data.location, data.contact, data.email].filter(Boolean);
  const experience = sortExperienceDesc(sections.experience);

  return (
    <Document
      title={data.fullName || "Resume"}
      author={data.fullName || undefined}
      creator="doki.help"
      producer="doki.help"
    >
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{data.fullName}</Text>
          {data.headline ? <Text style={styles.headline}>{data.headline}</Text> : null}
          {contactParts.length > 0 ? (
            <Text style={styles.contactLine}>{contactParts.join("  ·  ")}</Text>
          ) : null}
        </View>

        <View style={styles.rule} />

        {data.about ? (
          <Section title={t.about}>
            <Text>{data.about}</Text>
          </Section>
        ) : null}

        {experience.length > 0 ? (
          <Section title={t.experience}>
            {experience.map((e) => {
              const period = formatPeriod(e, t.present);
              return (
                <View key={e.id} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>
                    {[e.position, e.company].filter(Boolean).join(" · ")}
                  </Text>
                  {period || e.verified ? (
                    <Text style={styles.entryMeta}>
                      {period}
                      {period && e.verified ? "  ·  " : ""}
                      {e.verified ? t.verified : ""}
                    </Text>
                  ) : null}
                  {e.description ? <Text style={styles.body}>{e.description}</Text> : null}
                </View>
              );
            })}
          </Section>
        ) : data.legacyExperience ? (
          <Section title={t.experience}>
            <Text>{data.legacyExperience}</Text>
          </Section>
        ) : null}

        {sections.education.length > 0 ? (
          <Section title={t.education}>
            {sections.education.map((e) => {
              const period = formatPeriod({ ...e, current: false }, t.present);
              return (
                <View key={e.id} style={styles.entry} wrap={false}>
                  <Text style={styles.entryTitle}>
                    {[e.institution, e.program].filter(Boolean).join(" · ")}
                  </Text>
                  {period ? <Text style={styles.entryMeta}>{period}</Text> : null}
                </View>
              );
            })}
          </Section>
        ) : null}

        {sections.skills.length > 0 ? (
          <Section title={t.skills}>
            <View style={styles.chips}>
              {sections.skills.map((skill, i) => (
                <Text key={`${skill}-${i}`} style={styles.chip}>
                  {skill}
                </Text>
              ))}
            </View>
          </Section>
        ) : null}

        {sections.languages.length > 0 ? (
          <Section title={t.languages}>
            {sections.languages.map((l) => (
              <View key={l.id} style={styles.row}>
                <Text style={styles.label}>{l.name}</Text>
                <Text style={styles.value}>{l.level}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {data.customFields.length > 0 ? (
          <Section title={t.other}>
            {data.customFields.map((f, i) => (
              <View key={`${f.label}-${i}`} style={styles.row}>
                <Text style={styles.label}>{f.label}</Text>
                <Text style={styles.value}>{f.value}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        <Text style={styles.footer} fixed>
          {t.footer}
        </Text>
      </Page>
    </Document>
  );
}
