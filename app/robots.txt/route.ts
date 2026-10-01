// robots.txt с явными правилами для ИИ-краулеров и сигналами об использовании
// контента (contentsignals.org). Стандартный MetadataRoute.Robots не умеет
// выводить директиву Content-Signal и группы под конкретных ИИ-ботов,
// поэтому отдаём текст вручную (правила — lib/robotsTxt.ts).
import { buildRobotsTxt } from "@/lib/robotsTxt";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

export function GET() {
  const body = buildRobotsTxt(APP_URL);

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      // Кэшируем на сутки — содержимое статично.
      "cache-control": "public, max-age=86400",
    },
  });
}
