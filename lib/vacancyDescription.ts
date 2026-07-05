// Разбор описания вакансии (одно поле `description` с блоками-заголовками,
// помеченными эмодзи 👤🎯✅🧩) на блоки для рендера. Язык-независимо: делим
// по эмодзи, заголовок — сама строка-заголовок. Старый сплошной текст →
// один безымянный блок. Общий помощник для apply-страницы и превью
// работодателя (единый компонент рендера, без дублирования разметки).

const MARKERS = ["🏠", "👤", "🎯", "✅", "🧩"];

export type DescBlock = { header: string; body: string };

export function descriptionBlocks(desc: string | null | undefined): DescBlock[] {
  if (!desc || !desc.trim()) return [];
  const hasMarkers = MARKERS.some((e) => desc.includes(e));
  if (!hasMarkers) return [{ header: "", body: desc.trim() }];

  const blocks: DescBlock[] = [];
  let cur: DescBlock | null = null;
  for (const line of desc.split("\n")) {
    const isHeader = MARKERS.some((e) => line.trimStart().startsWith(e));
    if (isHeader) {
      if (cur) blocks.push(cur);
      cur = { header: line.trim(), body: "" };
    } else if (cur) {
      cur.body += (cur.body ? "\n" : "") + line;
    } else {
      cur = { header: "", body: line };
    }
  }
  if (cur) blocks.push(cur);

  return blocks
    .map((b) => ({ header: b.header, body: b.body.trim() }))
    .filter((b) => b.header || b.body);
}
