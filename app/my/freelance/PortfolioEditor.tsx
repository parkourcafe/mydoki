"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  savePortfolio,
  setPortfolioPublic,
  type PortfolioItem,
} from "./actions";

const IMG_MIME = ["image/jpeg", "image/png", "image/webp"];
const IMG_MAX = 5 * 1024 * 1024;

export type PortfolioData = {
  display_name: string;
  tagline: string;
  about: string;
  contact_whatsapp: string;
  contact_email: string;
  is_public: boolean;
  items: PortfolioItem[];
};

const M = {
  ru: {
    title: "Портфолио фрилансера",
    subtitle:
      "Соберите витрину работ и поделитесь одной ссылкой с клиентом. Вход клиенту не нужен.",
    name: "Имя / никнейм",
    namePh: "Как вас представить",
    tagline: "Кто вы",
    taglinePh: "напр. Фотограф · Бали",
    about: "О себе",
    aboutPh: "Пара предложений о вас и услугах",
    whatsapp: "WhatsApp для связи",
    email: "Email для связи",
    worksTitle: "Работы",
    worksHint: "Добавьте работы — ссылка ведёт на пример (сайт, Instagram, Google Drive, YouTube).",
    workTitle: "Название работы",
    workTitlePh: "напр. Свадебная съёмка в Убуде",
    workDesc: "Описание",
    workDescPh: "Коротко: что это и ваша роль",
    workLink: "Ссылка",
    workLinkPh: "https://…",
    addImage: "🖼 Добавить фото",
    changeImage: "Заменить фото",
    removeImage: "Убрать фото",
    uploading: "Загрузка…",
    imgType: "Только изображения (JPG, PNG, WebP).",
    imgBig: "Файл больше 5 МБ.",
    addWork: "＋ Добавить работу",
    remove: "Удалить",
    save: "Сохранить",
    saving: "Сохраняю…",
    saved: "Сохранено ✓",
    failed: "Не удалось сохранить. Попробуйте ещё раз.",
    shareTitle: "Ссылка для клиента",
    publicOn: "Портфолио опубликовано — ссылку можно отправлять.",
    publicOff: "Портфолио скрыто. Включите публикацию, чтобы получить ссылку.",
    publish: "Опубликовать",
    unpublish: "Снять с публикации",
    openLink: "Открыть",
    saveFirst: "Сначала сохраните портфолио, затем включите публикацию.",
  },
  en: {
    title: "Freelancer portfolio",
    subtitle:
      "Build a showcase of your work and share one link with a client. No login needed for them.",
    name: "Name / nickname",
    namePh: "How to introduce you",
    tagline: "Who you are",
    taglinePh: "e.g. Photographer · Bali",
    about: "About you",
    aboutPh: "A couple of sentences about you and your services",
    whatsapp: "Contact WhatsApp",
    email: "Contact email",
    worksTitle: "Works",
    worksHint: "Add works — the link points to an example (site, Instagram, Google Drive, YouTube).",
    workTitle: "Work title",
    workTitlePh: "e.g. Wedding shoot in Ubud",
    workDesc: "Description",
    workDescPh: "Briefly: what it is and your role",
    workLink: "Link",
    workLinkPh: "https://…",
    addImage: "🖼 Add photo",
    changeImage: "Replace photo",
    removeImage: "Remove photo",
    uploading: "Uploading…",
    imgType: "Images only (JPG, PNG, WebP).",
    imgBig: "File is larger than 5 MB.",
    addWork: "＋ Add work",
    remove: "Remove",
    save: "Save",
    saving: "Saving…",
    saved: "Saved ✓",
    failed: "Couldn't save. Please try again.",
    shareTitle: "Link for the client",
    publicOn: "Portfolio is published — you can send the link.",
    publicOff: "Portfolio is hidden. Turn on publishing to get a link.",
    publish: "Publish",
    unpublish: "Unpublish",
    openLink: "Open",
    saveFirst: "Save the portfolio first, then turn on publishing.",
  },
  id: {
    title: "Portofolio freelancer",
    subtitle:
      "Susun etalase karya Anda dan bagikan satu tautan ke klien. Klien tak perlu login.",
    name: "Nama / nama panggilan",
    namePh: "Cara memperkenalkan Anda",
    tagline: "Siapa Anda",
    taglinePh: "mis. Fotografer · Bali",
    about: "Tentang Anda",
    aboutPh: "Beberapa kalimat tentang Anda dan layanan Anda",
    whatsapp: "WhatsApp kontak",
    email: "Email kontak",
    worksTitle: "Karya",
    worksHint: "Tambah karya — tautan menuju contoh (situs, Instagram, Google Drive, YouTube).",
    workTitle: "Judul karya",
    workTitlePh: "mis. Pemotretan pernikahan di Ubud",
    workDesc: "Deskripsi",
    workDescPh: "Singkat: apa ini dan peran Anda",
    workLink: "Tautan",
    workLinkPh: "https://…",
    addImage: "🖼 Tambah foto",
    changeImage: "Ganti foto",
    removeImage: "Hapus foto",
    uploading: "Mengunggah…",
    imgType: "Hanya gambar (JPG, PNG, WebP).",
    imgBig: "File lebih dari 5 MB.",
    addWork: "＋ Tambah karya",
    remove: "Hapus",
    save: "Simpan",
    saving: "Menyimpan…",
    saved: "Tersimpan ✓",
    failed: "Gagal menyimpan. Coba lagi.",
    shareTitle: "Tautan untuk klien",
    publicOn: "Portofolio dipublikasikan — tautan bisa dikirim.",
    publicOff: "Portofolio tersembunyi. Aktifkan publikasi untuk dapat tautan.",
    publish: "Publikasikan",
    unpublish: "Batalkan publikasi",
    openLink: "Buka",
    saveFirst: "Simpan portofolio dulu, lalu aktifkan publikasi.",
  },
  uz: {
    title: "Frilanser portfoliosi",
    subtitle:
      "Ishlaringiz vitrinasini yig‘ing va mijozga bitta havola ulashing. Mijozga kirish shart emas.",
    name: "Ism / taxallus",
    namePh: "Sizni qanday tanishtiraylik",
    tagline: "Kimsiz",
    taglinePh: "mas. Fotograf · Bali",
    about: "O‘zingiz haqingizda",
    aboutPh: "O‘zingiz va xizmatlaringiz haqida bir necha gap",
    whatsapp: "Aloqa WhatsApp",
    email: "Aloqa email",
    worksTitle: "Ishlar",
    worksHint: "Ishlar qo‘shing — havola namunaga olib boradi (sayt, Instagram, Google Drive, YouTube).",
    workTitle: "Ish nomi",
    workTitlePh: "mas. Ubudda to‘y suratga olish",
    workDesc: "Tavsif",
    workDescPh: "Qisqacha: bu nima va sizning rolingiz",
    workLink: "Havola",
    workLinkPh: "https://…",
    addImage: "🖼 Foto qo‘shish",
    changeImage: "Fotoni almashtirish",
    removeImage: "Fotoni olib tashlash",
    uploading: "Yuklanmoqda…",
    imgType: "Faqat rasm (JPG, PNG, WebP).",
    imgBig: "Fayl 5 MB dan katta.",
    addWork: "＋ Ish qo‘shish",
    remove: "O‘chirish",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi ✓",
    failed: "Saqlab bo‘lmadi. Yana urinib ko‘ring.",
    shareTitle: "Mijoz uchun havola",
    publicOn: "Portfolio chop etilgan — havolani yuborish mumkin.",
    publicOff: "Portfolio yashirilgan. Havola olish uchun chop etishni yoqing.",
    publish: "Chop etish",
    unpublish: "Chop etishni bekor qilish",
    openLink: "Ochish",
    saveFirst: "Avval portfolioni saqlang, keyin chop etishni yoqing.",
  },
} as const;

export default function PortfolioEditor({
  locale,
  initial,
  publicUrl,
  defaultName,
  userId,
}: {
  locale: Locale;
  initial: PortfolioData;
  publicUrl: string | null;
  defaultName: string;
  userId: string;
}) {
  const t = M[locale];
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  const imgUrl = (path: string) =>
    supabase.storage.from("portfolio-images").getPublicUrl(path).data.publicUrl;

  async function pickImage(i: number, file: File | null) {
    if (!file) return;
    if (!IMG_MIME.includes(file.type)) return setError(t.imgType);
    if (file.size > IMG_MAX) return setError(t.imgBig);
    setError(null);
    setUploading((u) => ({ ...u, [i]: true }));
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("portfolio-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading((u) => ({ ...u, [i]: false }));
    if (upErr) return setError(t.failed);
    updateItem(i, { image_path: path });
  }

  const [name, setName] = useState(initial.display_name || defaultName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [about, setAbout] = useState(initial.about);
  const [whatsapp, setWhatsapp] = useState(initial.contact_whatsapp);
  const [email, setEmail] = useState(initial.contact_email);
  const [items, setItems] = useState<PortfolioItem[]>(initial.items);
  const [isPublic, setIsPublic] = useState(initial.is_public);

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pubBusy, setPubBusy] = useState(false);

  function addItem() {
    setItems((p) => [...p, { title: "", description: "", link: "" }]);
  }
  function updateItem(i: number, patch: Partial<PortfolioItem>) {
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function removeItem(i: number) {
    setItems((p) => p.filter((_, idx) => idx !== i));
  }

  async function onSave() {
    setBusy(true);
    setError(null);
    setDone(false);
    const res = await savePortfolio({
      display_name: name,
      tagline,
      about,
      contact_whatsapp: whatsapp,
      contact_email: email,
      items,
    });
    setBusy(false);
    if ("error" in res) {
      setError(t.failed);
    } else {
      setDone(true);
      setTimeout(() => setDone(false), 2500);
      router.refresh();
    }
  }

  async function togglePublic() {
    const next = !isPublic;
    setPubBusy(true);
    setError(null);
    const res = await setPortfolioPublic(next);
    setPubBusy(false);
    if ("error" in res) {
      setError(t.failed);
    } else {
      setIsPublic(next);
      router.refresh(); // подтянуть ссылку, если строка только что создана
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Профиль */}
        <div className="card grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">{t.name}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePh} />
          </div>
          <div>
            <label className="label">{t.tagline}</label>
            <input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={t.taglinePh} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t.about}</label>
            <textarea className="input min-h-[80px]" value={about} onChange={(e) => setAbout(e.target.value)} placeholder={t.aboutPh} />
          </div>
          <div>
            <label className="label">{t.whatsapp}</label>
            <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+62 …" inputMode="tel" />
          </div>
          <div>
            <label className="label">{t.email}</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
          </div>
        </div>

        {/* Работы */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-medium">{t.worksTitle}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.worksHint}</p>
          </div>

          {items.map((it, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="space-y-2">
                <input
                  className="input"
                  value={it.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder={t.workTitlePh}
                />
                <input
                  className="input"
                  value={it.link}
                  onChange={(e) => updateItem(i, { link: e.target.value })}
                  placeholder={t.workLinkPh}
                  inputMode="url"
                />
                <textarea
                  className="input min-h-[60px]"
                  value={it.description}
                  onChange={(e) => updateItem(i, { description: e.target.value })}
                  placeholder={t.workDescPh}
                />

                {/* Фото работы */}
                {it.image_path ? (
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl(it.image_path)}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                    />
                    <div className="flex flex-col gap-1 text-sm">
                      <label className="cursor-pointer text-brand-600 hover:underline">
                        {t.changeImage}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => pickImage(i, e.target.files?.[0] ?? null)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => updateItem(i, { image_path: null })}
                        className="text-left text-red-500 hover:underline"
                      >
                        {t.removeImage}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600 hover:text-slate-800">
                    <span className="rounded-lg border border-dashed border-slate-300 px-3 py-2">
                      {uploading[i] ? t.uploading : t.addImage}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploading[i]}
                      onChange={(e) => pickImage(i, e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
              <div className="mt-2 text-right">
                <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-500 hover:underline">
                  {t.remove}
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn-ghost">
            {t.addWork}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onSave} disabled={busy} className="btn-primary">
            {busy ? t.saving : t.save}
          </button>
          {done && <span className="text-sm font-medium text-green-600">{t.saved}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        {/* Публичная ссылка */}
        <div className="card space-y-3">
          <h2 className="font-medium">{t.shareTitle}</h2>
          <p className="text-sm text-slate-500">{isPublic ? t.publicOn : t.publicOff}</p>

          {isPublic && publicUrl && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input readOnly value={publicUrl} className="input sm:flex-1" onFocus={(e) => e.currentTarget.select()} />
              <div className="flex gap-2">
                <CopyButton text={publicUrl} locale={locale} className="btn-ghost" />
                <a href={publicUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                  {t.openLink}
                </a>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={togglePublic}
            disabled={pubBusy}
            className={isPublic ? "btn-ghost" : "btn-primary"}
          >
            {isPublic ? t.unpublish : t.publish}
          </button>
        </div>
      </div>
    </div>
  );
}
