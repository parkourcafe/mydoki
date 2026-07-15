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
  en: `# doki — Family Vault

One calm, private place for all of your family's important documents.

## What it is

doki keeps your family's documents in one place, organized by person, by asset
(car, apartment) and by section: identity, education, work, medical, finance,
taxes, legal — plus sections you create yourself.

## Why

So every important paper is found in seconds — renewing a passport, getting a
child ready for school, travelling, or visiting a doctor.

## Features

- Per-person and per-asset folders, grouped by category
- Custom sections your family defines
- Expiry reminders for documents with a validity date
- Secure expiring links with optional view limits and watermark
- Multiple family spaces with role-based access
- Two-factor authentication (TOTP)

## Privacy

Documents live in your family's private storage; files open only through
short-lived signed links. We do not allow AI model training on our content.

## Languages

Russian, English, Indonesian, Uzbek.

## Get started

Free account: ${APP_URL}/login
`,
  id: `# doki — Brankas Keluarga

Satu tempat tenang dan pribadi untuk semua dokumen penting keluarga Anda.

## Apa ini

doki menyimpan dokumen keluarga di satu tempat, ditata per orang, per aset
(mobil, apartemen) dan per bagian: identitas, pendidikan, pekerjaan, medis,
keuangan, pajak, hukum — plus bagian yang Anda buat sendiri.

## Mengapa

Agar setiap dokumen penting ditemukan dalam hitungan detik — memperpanjang
paspor, menyiapkan anak ke sekolah, bepergian, atau ke dokter.

## Fitur

- Folder per orang dan per aset, dikelompokkan menurut kategori
- Bagian khusus yang keluarga tentukan sendiri
- Pengingat masa berlaku dokumen
- Tautan berbagi aman dengan batas waktu dan tampilan
- Beberapa ruang keluarga dengan akses berbasis peran
- Autentikasi dua faktor (TOTP)

## Privasi

Dokumen tersimpan di penyimpanan pribadi keluarga; berkas hanya terbuka lewat
tautan bertanda tangan yang berumur pendek. Kami tidak mengizinkan pelatihan
model AI pada konten kami.

## Bahasa

Rusia, Inggris, Indonesia, Uzbek.

## Mulai

Akun gratis: ${APP_URL}/login
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
