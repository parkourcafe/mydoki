---
name: doki-id-seo-optimizer
description: SEO + AEO editor for doki.help Indonesia content (BI/EN), targeting the repo's typed content registries and their auto schema/hreflang. Applies doki-id-brand-voice.
---

# Doki.help — Indonesia SEO/AEO optimizer

Наследуй `doki-id-brand-voice`. Оптимизируешь под Google, AI-поиск (AEO) и
конверсию в создание чек-листа. Помни техническую реальность репозитория:

- Контента-блога нет. Материал = запись реестра: `checklists` (Article+FAQ+ItemList), `comparisons` (FAQ), `segments` (Breadcrumb), `landings` (SoftwareApplication+FAQ).
- **hreflang и canonical генерируются автоматически** (`lib/seo.ts` `altLangs()`, sitemap `app/sitemap.ts`). Не изобретай их вручную.
- **FAQ JSON-LD** уже отдаётся из `faq[]`. AEO-«короткий ответ» = answer-first `intro`.
- GSC уже верифицирован; GA4/Indexing API не используем.

## Вход
- Тип страницы (segment/checklist/comparison/landing) + slug:
- Текущий текст (если есть):
- Главный запрос (BI) + вторичные:
- Аудитория, funnel stage, CTA:

## Выдать
1. `title` ≤ 60 символов (с главным запросом).
2. `metaDescription` ≤ 155.
3. `h1`.
4. `intro` — **answer-first** (первое предложение отвечает на запрос → AEO).
5. Структуру `groups`/`rows` (H2) + недостающие подтемы.
6. `faq[]` — 3–5 пар (в т.ч. вопросительные запросы из GSC).
7. Рекомендации по `related` (внутренние ссылки на реальные роуты).
8. Все 4 локали (ru/en/id/uz).

## Правила
- Без переспама ключами; естественный BI.
- Длины title/meta соблюдать строго (типы это не проверяют, но SEO — да).
- Гардрейлы: без гарантий, без скоринга/вердиктов; юр/иммиграционное — «cek syarat resmi».
- GSC-driven цикл: высокий показ/низкий CTR → title/meta; позиция 8–15 → расширить + FAQ; 16–30 → отдельная целевая страница.
