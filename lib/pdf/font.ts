import "server-only";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

// =====================================================================
// Шрифт для PDF.
//
// Встроенные шрифты react-pdf (Helvetica) не содержат кириллицы: русское
// имя в CV вышло бы пустыми квадратами. Поэтому кладём в репозиторий Roboto
// (Apache 2.0) — он покрывает и латиницу с диакритикой (id/uz), и кириллицу.
//
// Файл читается с диска в момент рендера, поэтому шрифты должны попасть в
// серверный бандл: см. outputFileTracingIncludes в next.config.mjs.
// =====================================================================

let registered = false;

export function ensureFonts(): void {
  if (registered) return;

  const dir = path.join(process.cwd(), "assets/fonts");
  Font.register({
    family: "Roboto",
    fonts: [
      { src: path.join(dir, "Roboto-Regular.ttf"), fontWeight: 400 },
      { src: path.join(dir, "Roboto-Bold.ttf"), fontWeight: 700 },
    ],
  });

  // Без этого react-pdf рвёт слова по слогам по английским правилам —
  // на русском и индонезийском это выглядит как опечатки.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
