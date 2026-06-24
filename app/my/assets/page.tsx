import Link from "next/link";
import { getOrCreateHouseholdId, listAssets } from "@/lib/queries";
import { assetTypes, type AssetType } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import SubmitButton from "@/components/SubmitButton";
import { createAsset } from "../actions";

const M = {
  ru: {
    title: "Имущество",
    intro:
      "Машины, недвижимость и прочие объекты — со своими документами (ПТС, ОСАГО, договоры, квитанции).",
    empty:
      "Объектов пока нет. Добавьте первый ниже — например, машину или квартиру.",
    addObject: "+ Добавить объект",
    type: "Тип",
    name: "Название",
    namePlaceholder: "BMW X5 / Квартира на Ленина",
    details: "Детали (необязательно)",
    detailsPlaceholder: "госномер, VIN, адрес, кадастровый номер…",
    add: "Добавить",
  },
  en: {
    title: "Assets",
    intro:
      "Cars, real estate and other items — each with its own documents (title, insurance, contracts, receipts).",
    empty:
      "No items yet. Add your first one below — for example, a car or an apartment.",
    addObject: "+ Add item",
    type: "Type",
    name: "Name",
    namePlaceholder: "BMW X5 / Apartment on Lenina St.",
    details: "Details (optional)",
    detailsPlaceholder: "plate number, VIN, address, cadastral number…",
    add: "Add",
  },
  id: {
    title: "Aset",
    intro:
      "Mobil, properti, dan barang lainnya — masing-masing dengan dokumennya sendiri (BPKB, asuransi, kontrak, kuitansi).",
    empty:
      "Belum ada barang. Tambahkan yang pertama di bawah — misalnya mobil atau apartemen.",
    addObject: "+ Tambah barang",
    type: "Jenis",
    name: "Nama",
    namePlaceholder: "BMW X5 / Apartemen di Jl. Sudirman",
    details: "Detail (opsional)",
    detailsPlaceholder: "nomor pelat, VIN, alamat, nomor sertifikat…",
    add: "Tambah",
  },
  uz: {
    title: "Mol-mulk",
    intro:
      "Mashinalar, koʻchmas mulk va boshqa obʼyektlar — har biri oʻz hujjatlari bilan (texpasport, sugʻurta, shartnomalar, kvitansiyalar).",
    empty:
      "Hozircha obʼyektlar yoʻq. Quyida birinchisini qoʻshing — masalan, mashina yoki kvartira.",
    addObject: "+ Obʼyekt qoʻshish",
    type: "Turi",
    name: "Nomi",
    namePlaceholder: "BMW X5 / Lenin koʻchasidagi kvartira",
    details: "Tafsilotlar (ixtiyoriy)",
    detailsPlaceholder: "davlat raqami, VIN, manzil, kadastr raqami…",
    add: "Qoʻshish",
  },
} as const;

export default async function AssetsPage() {
  const locale = await getLocale();
  const t = M[locale];
  const types = assetTypes(locale);
  const householdId = await getOrCreateHouseholdId();
  const assets = await listAssets(householdId);

  const byType = new Map<AssetType, typeof assets>();
  for (const a of assets) {
    const arr = byType.get(a.type) ?? [];
    arr.push(a);
    byType.set(a.type, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
      </div>

      {assets.length === 0 ? (
        <div className="card text-center text-slate-500">{t.empty}</div>
      ) : (
        <div className="space-y-6">
          {types.filter((at) => byType.has(at.key)).map((at) => (
            <section key={at.key}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {at.emoji} {at.label}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byType.get(at.key)!.map((a) => (
                  <Link
                    key={a.id}
                    href={`/my/assets/${a.id}`}
                    className="card transition hover:border-brand-300 hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg">
                        {at.emoji}
                      </div>
                      <div>
                        <div className="font-medium">{a.title}</div>
                        {a.details && (
                          <div className="text-xs text-slate-500">{a.details}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <details className="card">
        <summary className="cursor-pointer font-medium">{t.addObject}</summary>
        <form action={createAsset} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">{t.type}</label>
            <select name="type" className="input" defaultValue="vehicle">
              {types.map((at) => (
                <option key={at.key} value={at.key}>
                  {at.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t.name}</label>
            <input
              name="title"
              required
              className="input"
              placeholder={t.namePlaceholder}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="label">{t.details}</label>
            <input
              name="details"
              className="input"
              placeholder={t.detailsPlaceholder}
            />
          </div>
          <div className="sm:col-span-3">
            <SubmitButton>{t.add}</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}
