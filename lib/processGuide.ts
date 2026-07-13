import type { Locale } from "./i18n";
import type { LegalCategory } from "./legal";

// ========================== Process Guide =============================
// P3-4 (арх. §11.3): контекстные ИНФОРМАЦИОННЫЕ подсказки по ходу трудовых
// процессов. НЕ даёт вердиктов, НЕ выполняет автодействий — только указывает
// на курируемые справочные материалы (/my/legal) с дисклеймером. Здесь —
// чистый маппинг контекст → категория + текст подсказки под юнит-тесты.

export type GuideContext =
  | "employment"
  | "amendment"
  | "onboarding"
  | "documents";

export const GUIDE_CONTEXTS: GuideContext[] = [
  "employment",
  "amendment",
  "onboarding",
  "documents",
];

type Guide = { category: LegalCategory; hint: string };

const GUIDES: Record<Locale, Record<GuideContext, Guide>> = {
  ru: {
    employment: { category: "employment", hint: "Полезно знать права и обязанности по трудовым отношениям — справочные материалы в разделе «Правовая информация»." },
    amendment: { category: "contract", hint: "Перед принятием изменений условий ознакомьтесь со справочными материалами о договоре. Это не юридическая консультация." },
    onboarding: { category: "probation", hint: "Об оформлении и испытательном сроке — в справочных материалах раздела «Правовая информация»." },
    documents: { category: "work_permit", hint: "О разрешениях на работу и визах — в курируемых справочных материалах." },
  },
  en: {
    employment: { category: "employment", hint: "It helps to know your rights and duties in the employment relationship — see reference materials in “Legal information”." },
    amendment: { category: "contract", hint: "Before accepting a change of terms, review the reference materials on contracts. This is not legal advice." },
    onboarding: { category: "probation", hint: "On onboarding and the probation period — see the reference materials in “Legal information”." },
    documents: { category: "work_permit", hint: "On work permits and visas — see the curated reference materials." },
  },
  id: {
    employment: { category: "employment", hint: "Penting mengetahui hak dan kewajiban dalam hubungan kerja — lihat materi rujukan di “Informasi hukum”." },
    amendment: { category: "contract", hint: "Sebelum menerima perubahan ketentuan, tinjau materi rujukan tentang kontrak. Ini bukan nasihat hukum." },
    onboarding: { category: "probation", hint: "Tentang proses dan masa percobaan — lihat materi rujukan di “Informasi hukum”." },
    documents: { category: "work_permit", hint: "Tentang izin kerja dan visa — lihat materi rujukan kurasi." },
  },
  uz: {
    employment: { category: "employment", hint: "Mehnat munosabatlaridagi huquq va majburiyatlarni bilish foydali — “Huquqiy ma’lumot” bo‘limidagi materiallarni ko‘ring." },
    amendment: { category: "contract", hint: "Shartlar o‘zgarishini qabul qilishdan oldin shartnoma bo‘yicha materiallarni ko‘rib chiqing. Bu yuridik maslahat emas." },
    onboarding: { category: "probation", hint: "Rasmiylashtirish va sinov muddati haqida — “Huquqiy ma’lumot” materiallarida." },
    documents: { category: "work_permit", hint: "Ishlash ruxsatnomalari va vizalar haqida — kuratsiya qilingan materiallarda." },
  },
};

/** Информационная подсказка для контекста (категория + текст). */
export function processGuideFor(
  context: GuideContext | string,
  locale: Locale
): Guide | null {
  const byCtx = GUIDES[locale];
  return byCtx[context as GuideContext] ?? null;
}
