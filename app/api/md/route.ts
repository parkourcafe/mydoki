// Markdown-версия публичных страниц для ИИ-агентов (Markdown negotiation).
// Сюда переписывает middleware, когда агент запрашивает Accept: text/markdown.
import { getLocale } from "@/lib/i18n";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const HOME = {
  ru: `# doki — Семейный сейф

Одно спокойное и приватное место для всех важных документов семьи.

## Что это

doki хранит документы семьи в одном месте и раскладывает их по людям, по
имуществу (машина, квартира) и по разделам: удостоверения, образование,
работа, медицина, финансы, налоги, юридические — и свои разделы.

## Зачем

Чтобы каждый важный документ находился за секунды — когда нужно продлить
паспорт, собрать ребёнка в школу, поехать в поездку или сходить к врачу.

## Возможности

- Папки по людям и по имуществу, разложенные по категориям
- Свои разделы, которые семья заводит сама
- Напоминания о сроках действия документов
- Безопасные ссылки с ограниченным сроком и числом просмотров
- Несколько семейных пространств с ролями доступа
- Двухфакторная защита (TOTP)

## Приватность

Документы лежат в приватном хранилище семьи, файлы открываются только по
коротким подписанным ссылкам. Обучать ИИ-модели на нашем контенте мы не
разрешаем.

## Языки

Русский, английский, индонезийский, узбекский.

## Начать

Бесплатный аккаунт: ${APP_URL}/login
`,
  // EN/ID — карьерный продукт для Индонезии (лендинг /en и /id).
  en: `# doki.help — collect candidate and employee documents with one link

doki.help helps companies in Indonesia collect candidate and employee
documents through a checklist link shared over WhatsApp — with clear status
tracking instead of messy chats and spreadsheets.

## What it is

A web app for document collection during hiring and onboarding. The company
defines a checklist of required documents (KTP, CV, certificates,
contracts), sends one WhatsApp-ready link, and the candidate uploads files
through that link without creating an account. HR sees per-person status:
what arrived, what is missing, what needs updating.

## How it works

1. Create a document checklist for a role or onboarding stage
2. Send one link to the candidate (WhatsApp, email, or your workflow)
3. The candidate uploads files and sees what is still missing
4. HR tracks completion status without chasing individual chats

## Who uses it

HR teams, business owners and admins, recruitment agencies, visa agents,
candidates and new employees — hospitality, villas, F&B, retail, drivers,
domestic staff and other teams in Indonesia.

## Privacy

Files open only through controlled links; access is restricted to authorized
team members. Candidate data is not sold or shared for advertising. We do
not allow AI model training on this site's content (see robots.txt,
the Content-Signal directive).

## Languages

Hiring flows: English and Indonesian. The family vault product is available
in Russian, English, Indonesian and Uzbek.

## Get started

Create a free checklist: ${APP_URL}/login
`,
  id: `# doki.help — kumpulkan dokumen kandidat & karyawan lewat satu link

doki.help membantu perusahaan di Indonesia mengumpulkan dokumen kandidat dan
karyawan melalui tautan checklist yang dibagikan lewat WhatsApp — dengan
status yang jelas tanpa chat berantakan atau spreadsheet.

## Apa ini

Aplikasi web untuk pengumpulan dokumen saat rekrutmen dan onboarding.
Perusahaan menyusun checklist dokumen yang diminta (KTP, CV, sertifikat,
kontrak), mengirim satu tautan siap-WhatsApp, dan kandidat mengunggah berkas
lewat tautan itu tanpa membuat akun. HR memantau status per orang: apa yang
sudah masuk, kurang, atau perlu diperbarui.

## Cara kerja

1. Buat checklist dokumen untuk posisi atau tahap onboarding
2. Kirim satu tautan ke kandidat (WhatsApp, email, atau alur internal)
3. Kandidat mengunggah berkas dan melihat apa yang masih kurang
4. HR memantau kelengkapan tanpa mengejar tiap chat

## Siapa penggunanya

Tim HR, pemilik bisnis dan admin, agen rekrutmen, agen visa, kandidat dan
karyawan baru — hospitality, vila, F&B, ritel, pengemudi, staf rumah tangga
dan tim lainnya di Indonesia.

## Privasi

Berkas hanya terbuka lewat tautan terkontrol; akses dibatasi untuk anggota
tim yang berwenang. Data kandidat tidak dijual atau dibagikan untuk iklan.
Kami tidak mengizinkan pelatihan model AI pada konten situs ini (lihat
robots.txt, direktif Content-Signal).

## Bahasa

Alur rekrutmen: bahasa Inggris dan Indonesia. Produk brankas keluarga
tersedia dalam bahasa Rusia, Inggris, Indonesia dan Uzbek.

## Mulai

Buat checklist gratis: ${APP_URL}/login
`,
  uz: `# doki — Oilaviy seyf

Oilangizning barcha muhim hujjatlari uchun bitta xotirjam va shaxsiy joy.

## Bu nima

doki oila hujjatlarini bitta joyda saqlaydi va ularni odamlar, mulk (mashina,
kvartira) va boʻlimlar boʻyicha ajratadi: shaxsiy hujjatlar, taʼlim, ish,
tibbiyot, moliya, soliqlar, yuridik — va oʻzingiz yaratadigan boʻlimlar.

## Nega kerak

Har bir muhim hujjat bir necha soniyada topilishi uchun — pasportni yangilash,
bolani maktabga tayyorlash, sayohat yoki shifokorga borishda.

## Imkoniyatlar

- Odamlar va mulk boʻyicha papkalar, toifalarga ajratilgan
- Oila oʻzi yaratadigan boʻlimlar
- Hujjat muddati haqida eslatmalar
- Muddatli va koʻrishlar soni cheklangan xavfsiz havolalar
- Rollar bilan bir nechta oilaviy makon
- Ikki bosqichli himoya (TOTP)

## Maxfiylik

Hujjatlar oilaning shaxsiy xotirasida saqlanadi; fayllar faqat qisqa muddatli
imzolangan havolalar orqali ochiladi. Kontentimizda AI modellarini oʻqitishga
ruxsat bermaymiz.

## Tillar

Rus, ingliz, indonez, oʻzbek.

## Boshlash

Bepul hisob: ${APP_URL}/login
`,
} as const;

export async function GET() {
  const locale = await getLocale();
  return new Response(HOME[locale], {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=600",
      vary: "Accept, Accept-Language, Cookie",
    },
  });
}
