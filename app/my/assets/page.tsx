import Link from "next/link";
import { getOrCreateHouseholdId, listAssets } from "@/lib/queries";
import { ASSET_TYPES, type AssetType } from "@/lib/categories";
import { createAsset } from "../actions";

export default async function AssetsPage() {
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
        <h1 className="text-2xl font-semibold">Имущество</h1>
        <p className="mt-1 text-sm text-slate-500">
          Машины, недвижимость и прочие объекты — со своими документами
          (ПТС, ОСАГО, договоры, квитанции).
        </p>
      </div>

      {assets.length === 0 ? (
        <div className="card text-center text-slate-500">
          Объектов пока нет. Добавьте первый ниже — например, машину или квартиру.
        </div>
      ) : (
        <div className="space-y-6">
          {ASSET_TYPES.filter((t) => byType.has(t.key)).map((t) => (
            <section key={t.key}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t.emoji} {t.label}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byType.get(t.key)!.map((a) => (
                  <Link
                    key={a.id}
                    href={`/my/assets/${a.id}`}
                    className="card transition hover:border-brand-300 hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg">
                        {t.emoji}
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
        <summary className="cursor-pointer font-medium">+ Добавить объект</summary>
        <form action={createAsset} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Тип</label>
            <select name="type" className="input" defaultValue="vehicle">
              {ASSET_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Название</label>
            <input
              name="title"
              required
              className="input"
              placeholder="BMW X5 / Квартира на Ленина"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Детали (необязательно)</label>
            <input
              name="details"
              className="input"
              placeholder="госномер, VIN, адрес, кадастровый номер…"
            />
          </div>
          <div className="sm:col-span-3">
            <button className="btn-primary">Добавить</button>
          </div>
        </form>
      </details>
    </div>
  );
}
