import { descriptionBlocks } from "@/lib/vacancyDescription";

// Единый рендер описания вакансии (блоки 👤🎯✅🧩). Используется и на публичной
// apply-странице, и в превью работодателя — без дублирования разметки.
export default function VacancyDescription({
  description,
  className,
}: {
  description: string | null | undefined;
  className?: string;
}) {
  const blocks = descriptionBlocks(description);
  if (!blocks.length) return null;

  return (
    <div className={className ?? "space-y-3"}>
      {blocks.map((b, i) => (
        <div key={i}>
          {b.header && (
            <p className="text-sm font-semibold text-slate-800">{b.header}</p>
          )}
          {b.body && (
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {b.body}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
