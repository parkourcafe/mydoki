import "server-only";
import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getLocale } from "./i18n";
import { altLangs } from "./seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

/**
 * Trust-страницы (security / ai-processing / data-deletion). Прозаический
 * контент в стиле privacy/terms, 4 языка. Только подтверждённые факты:
 * Supabase + приватный bucket, HTTPS, RLS, роли, 2FA, истекающие/отзываемые
 * ссылки, AI-распознавание полей, AI≠консультация (terms), beta, экспорт
 * архива (/my/export). Неподтверждённое — TODO, не выдаётся за факт.
 */

export type TrustSection = { h2: string; body?: string; bullets?: string[] };
export type TrustContent = {
  navLabel: string;
  title: string; // ≤60
  metaDescription: string; // ≤155
  h1: string;
  intro: string;
  sections: TrustSection[];
};
export type TrustPage = {
  slug: string;
  emoji: string;
  locales: Record<Locale, TrustContent>;
};

export const TRUST_KEYS = ["ai-processing", "data-deletion"] as const;
export type TrustKey = (typeof TRUST_KEYS)[number];

const DATA: Record<TrustKey, TrustPage> = {
  "ai-processing": {
    slug: "ai-processing",
    emoji: "🤖",
    locales: {
      en: {
        navLabel: "AI processing",
        title: "How Doki.help uses AI",
        metaDescription:
          "What AI does at Doki.help: it suggests a document's category, type, number and dates when you upload. AI answers are not professional advice.",
        h1: "How Doki.help uses AI",
        intro:
          "AI in Doki.help is there to save you typing, not to make decisions for you. Here is what it does and what it doesn't.",
        sections: [
          {
            h2: "What AI does",
            body: "AI recognition is optional and off by default — it runs only if you turn it on. When it's on, uploading a document lets it suggest the category, type, number and important dates so you don't fill them in by hand. You can review and edit every field.",
          },
          {
            h2: "What is processed",
            body: "To suggest those fields, the uploaded image or scan is processed by a third-party AI provider.",
          },
          {
            h2: "AI is not professional advice",
            body: "Any AI-generated answer is for convenience only and is not legal, medical or other professional advice. Always confirm important matters with a qualified professional.",
          },
          {
            h2: "You stay in control",
            body: "AI assistance is optional help with data entry. Your documents remain yours, visible only to your family. Doki.help is in beta and these features may change.",
          },
        ],
      },
      ru: {
        navLabel: "Обработка ИИ",
        title: "Как Doki.help использует ИИ",
        metaDescription:
          "Что делает ИИ в Doki.help: при загрузке подсказывает категорию, тип, номер и даты документа. Ответы ИИ не являются профессиональной консультацией.",
        h1: "Как Doki.help использует ИИ",
        intro:
          "ИИ в Doki.help нужен, чтобы вы меньше печатали, а не чтобы принимать решения за вас. Вот что он делает и чего не делает.",
        sections: [
          {
            h2: "Что делает ИИ",
            body: "Распознавание необязательно и по умолчанию выключено — работает, только если вы его включили. Когда включено, при загрузке документа оно подсказывает категорию, тип, номер и важные даты, чтобы вы не вписывали их вручную. Каждое поле можно проверить и поправить.",
          },
          {
            h2: "Что обрабатывается",
            body: "Чтобы подсказать эти поля, загруженное фото или скан обрабатывается сторонним ИИ-провайдером.",
          },
          {
            h2: "ИИ — не профессиональная консультация",
            body: "Любой ответ ИИ дан только для удобства и не является юридической, медицинской или иной профессиональной консультацией. Важные вопросы всегда подтверждайте у квалифицированного специалиста.",
          },
          {
            h2: "Контроль остаётся за вами",
            body: "Помощь ИИ — это необязательная помощь с вводом данных. Документы остаются вашими и видны только вашей семье. Doki.help в стадии beta, и эти функции могут меняться.",
          },
        ],
      },
      id: {
        navLabel: "Pemrosesan AI",
        title: "Cara Doki.help memakai AI",
        metaDescription:
          "Apa yang dilakukan AI di Doki.help: menyarankan kategori, jenis, nomor, dan tanggal dokumen saat unggah. Jawaban AI bukan nasihat profesional.",
        h1: "Cara Doki.help memakai AI",
        intro:
          "AI di Doki.help ada untuk menghemat pengetikan Anda, bukan untuk mengambil keputusan. Berikut yang dilakukannya dan yang tidak.",
        sections: [
          {
            h2: "Apa yang dilakukan AI",
            body: "Pengenalan AI bersifat opsional dan nonaktif secara bawaan — hanya berjalan jika Anda mengaktifkannya. Saat aktif, mengunggah dokumen membuatnya menyarankan kategori, jenis, nomor, dan tanggal penting agar Anda tidak mengisinya manual. Anda dapat meninjau dan menyunting tiap kolom.",
          },
          {
            h2: "Apa yang diproses",
            body: "Untuk menyarankan kolom itu, gambar atau pindaian yang diunggah diproses oleh penyedia AI pihak ketiga.",
          },
          {
            h2: "AI bukan nasihat profesional",
            body: "Jawaban AI hanya untuk kenyamanan dan bukan nasihat hukum, medis, atau profesional lain. Selalu pastikan hal penting dengan profesional yang berkualifikasi.",
          },
          {
            h2: "Anda tetap memegang kendali",
            body: "Bantuan AI bersifat opsional untuk pengisian data. Dokumen tetap milik Anda dan hanya terlihat oleh keluarga Anda. Doki.help masih beta dan fitur ini bisa berubah.",
          },
        ],
      },
      uz: {
        navLabel: "AI ishlovi",
        title: "Doki.help AI’dan qanday foydalanadi",
        metaDescription:
          "Doki.help’da AI nima qiladi: yuklashda hujjat toifasi, turi, raqami va sanalarini taklif qiladi. AI javoblari professional maslahat emas.",
        h1: "Doki.help AI’dan qanday foydalanadi",
        intro:
          "Doki.help’dagi AI siz uchun qaror qabul qilish uchun emas, kamroq yozishingiz uchun. Mana u nima qiladi va nima qilmaydi.",
        sections: [
          {
            h2: "AI nima qiladi",
            body: "AI tanish ixtiyoriy va sukut boʻyicha oʻchiq — faqat siz yoqsangiz ishlaydi. Yoqilganda, hujjat yuklashda u toifa, tur, raqam va muhim sanalarni taklif qiladi, qoʻlda kiritmasligingiz uchun. Har bir maydonni koʻrib chiqib, tahrirlashingiz mumkin.",
          },
          {
            h2: "Nima ishlanadi",
            body: "Bu maydonlarni taklif qilish uchun yuklangan surat yoki skan uchinchi tomon AI provayderi tomonidan ishlanadi.",
          },
          {
            h2: "AI — professional maslahat emas",
            body: "AI bergan har qanday javob faqat qulaylik uchun va yuridik, tibbiy yoki boshqa professional maslahat emas. Muhim masalalarni doimo malakali mutaxassis bilan tasdiqlang.",
          },
          {
            h2: "Nazorat sizda qoladi",
            body: "AI yordami — maʼlumot kiritishda ixtiyoriy yordam. Hujjatlar sizniki boʻlib qoladi va faqat oilangizga koʻrinadi. Doki.help beta bosqichida, bu funksiyalar oʻzgarishi mumkin.",
          },
        ],
      },
    },
  },
  "data-deletion": {
    slug: "data-deletion",
    emoji: "🗑️",
    locales: {
      en: {
        navLabel: "Data deletion",
        title: "Deleting your data — Doki.help",
        metaDescription:
          "How to export and delete your data at Doki.help: remove documents and files, export your archive, and request account deletion.",
        h1: "Exporting and deleting your data",
        intro:
          "Your data is yours. You can take it with you or remove it. Here is how. Doki.help is in beta — if anything below is unclear, contact support@doki.help.",
        sections: [
          {
            h2: "Delete a document or file",
            body: "You can delete individual documents and their files from your vault at any time. Deleting a document also removes its attached files from storage.",
          },
          {
            h2: "Export your archive",
            body: "You can export an archive of your documents from your account (the Export page in your dashboard), so you keep a copy before deleting anything.",
          },
          {
            h2: "Delete your account",
            body: "You can delete your account and associated data yourself, from your dashboard under Settings → Security. Deletion is permanent. If anything is unclear, contact support@doki.help.",
          },
          {
            h2: "What happens to shared links",
            body: "Deleting a document invalidates the links you shared for it — recipients can no longer open it. You can also revoke any share link manually at any time.",
          },
        ],
      },
      ru: {
        navLabel: "Удаление данных",
        title: "Удаление данных — Doki.help",
        metaDescription:
          "Как выгрузить и удалить данные в Doki.help: удалить документы и файлы, экспортировать архив и запросить удаление аккаунта.",
        h1: "Экспорт и удаление ваших данных",
        intro:
          "Ваши данные принадлежат вам. Их можно забрать с собой или удалить. Вот как. Doki.help в стадии beta — если что-то ниже непонятно, напишите на support@doki.help.",
        sections: [
          {
            h2: "Удалить документ или файл",
            body: "Вы можете в любой момент удалить отдельные документы и их файлы из сейфа. Удаление документа удаляет и прикреплённые к нему файлы из хранилища.",
          },
          {
            h2: "Экспортировать архив",
            body: "Архив ваших документов можно выгрузить из аккаунта (страница «Экспорт» в кабинете) — чтобы сохранить копию перед удалением.",
          },
          {
            h2: "Удалить аккаунт",
            body: "Удалить аккаунт и связанные данные можно самостоятельно — в кабинете, в разделе «Безопасность». Удаление необратимо. Если что-то непонятно, напишите на support@doki.help.",
          },
          {
            h2: "Что будет с общими ссылками",
            body: "Удаление документа делает выданные на него ссылки недействительными — получатели больше не смогут его открыть. Любую ссылку можно также отозвать вручную в любой момент.",
          },
        ],
      },
      id: {
        navLabel: "Penghapusan data",
        title: "Menghapus data Anda — Doki.help",
        metaDescription:
          "Cara mengekspor dan menghapus data di Doki.help: hapus dokumen dan berkas, ekspor arsip Anda, dan minta penghapusan akun.",
        h1: "Mengekspor dan menghapus data Anda",
        intro:
          "Data Anda milik Anda. Anda bisa membawanya atau menghapusnya. Begini caranya. Doki.help masih beta — jika ada yang kurang jelas, hubungi support@doki.help.",
        sections: [
          {
            h2: "Hapus dokumen atau berkas",
            body: "Anda bisa menghapus dokumen dan berkasnya dari brankas kapan saja. Menghapus dokumen juga menghapus berkas yang terlampir dari penyimpanan.",
          },
          {
            h2: "Ekspor arsip Anda",
            body: "Anda bisa mengekspor arsip dokumen dari akun (halaman Ekspor di dasbor), jadi Anda punya salinan sebelum menghapus apa pun.",
          },
          {
            h2: "Hapus akun Anda",
            body: "Anda bisa menghapus akun dan data terkait sendiri, dari dasbor di bagian Keamanan. Penghapusan bersifat permanen. Jika ada yang kurang jelas, hubungi support@doki.help.",
          },
          {
            h2: "Apa yang terjadi pada tautan berbagi",
            body: "Menghapus dokumen membuat tautan yang Anda bagikan untuknya tidak berlaku — penerima tak bisa lagi membukanya. Anda juga bisa mencabut tautan kapan saja secara manual.",
          },
        ],
      },
      uz: {
        navLabel: "Maʼlumotni oʻchirish",
        title: "Maʼlumotingizni oʻchirish — Doki.help",
        metaDescription:
          "Doki.help’da maʼlumotni eksport va oʻchirish: hujjat va fayllarni oʻchirish, arxivni eksport qilish va akkauntni oʻchirishni soʻrash.",
        h1: "Maʼlumotingizni eksport va oʻchirish",
        intro:
          "Maʼlumotingiz sizniki. Uni olib ketishingiz yoki oʻchirishingiz mumkin. Mana qanday. Doki.help beta bosqichida — quyida nimadir tushunarsiz boʻlsa, support@doki.help’ga yozing.",
        sections: [
          {
            h2: "Hujjat yoki faylni oʻchirish",
            body: "Seyfdan alohida hujjat va ularning fayllarini istalgan vaqt oʻchirishingiz mumkin. Hujjatni oʻchirish unga biriktirilgan fayllarni ombordan ham oʻchiradi.",
          },
          {
            h2: "Arxivingizni eksport qilish",
            body: "Hujjatlaringiz arxivini akkauntdan eksport qilishingiz mumkin (kabinetdagi “Eksport” sahifasi) — biror narsani oʻchirishdan oldin nusxa saqlab qoʻyish uchun.",
          },
          {
            h2: "Akkauntingizni oʻchirish",
            body: "Akkaunt va bogʻliq maʼlumotlarni kabinetdagi «Xavfsizlik» boʻlimida oʻzingiz oʻchira olasiz. Oʻchirish qaytarilmas. Nimadir tushunarsiz boʻlsa, support@doki.help’ga yozing.",
          },
          {
            h2: "Ulashilgan havolalarga nima boʻladi",
            body: "Hujjatni oʻchirish unga ulashgan havolalaringizni bekor qiladi — qabul qiluvchilar uni ocholmaydi. Istalgan havolani qoʻlda ham bekor qilishingiz mumkin.",
          },
        ],
      },
    },
  },
};

export function getTrustPage(slug: string): TrustPage | undefined {
  return DATA[slug as TrustKey];
}

export async function trustMetadata(slug: string): Promise<Metadata> {
  const p = getTrustPage(slug);
  if (!p) return {};
  const locale = await getLocale();
  const c = p.locales[locale] ?? p.locales.en;
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: await altLangs(),
    openGraph: {
      title: c.title,
      description: c.metaDescription,
      url: `${APP_URL}/${locale}/${slug}`,
    },
  };
}

/** Ссылки на trust-страницы для футера. */
export function trustLinks(locale: Locale) {
  return TRUST_KEYS.map((key) => ({
    key,
    label: DATA[key].locales[locale].navLabel,
  }));
}
