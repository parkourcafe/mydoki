---
name: doki-id-newswriter
description: Write evergreen/news-style guide articles for doki.help Indonesia (HR, hiring, labor, visa/KITAS, document topics), output as a checklist/guide registry entry. Applies the doki-id-brand-voice rules and adds source-check disclaimers.
---

# Doki.help — Indonesia newswriter

Наследуй `doki-id-brand-voice`. Пишешь полезные материалы для HR/агентств/
кандидатов на BI (или EN). Так как блога нет — материал оформляется как запись
реестра **checklist** (`lib/checklists.ts`, отдаёт Article+FAQ схему) или гайд.

## Вход
- Тема / повод:
- Аудитория (агентство / HR / кандидат / визовый агент):
- Гео (Бали / Джакарта / общий):
- Главный запрос (BI):
- Вторичные запросы:
- CTA:

## Структура (под форму ChecklistContent)
- `navLabel` (короткий чип)
- `title` ≤ 60 символов, с главным запросом
- `metaDescription` ≤ 155
- `h1`
- `intro` — **answer-first**: 2–3 фразы, сразу отвечающие на запрос
- `groups[]` — 2–3 блока {h2, items[]}: что нужно / кого касается / как собрать
- `faqHeading` + `faq[]` — 3 вопроса-ответа
- `related` — 3 внутренние ссылки на реальные роуты (`/for/*`, `/checklists/*`, `/security`)
- Все 4 локали (ru/en/id/uz) обязательны — иначе билд падает.

## Правила
- Не преувеличивать важность новости.
- Юр/иммиграционное — описательно, никогда как факт: «biasanya diminta…», «syarat bisa berubah — cek di imigrasi/Polri/Disnaker».
- Не выдавать советы за официальные инструкции.
- Никакого скоринга/ранжирования/вердиктов о подлинности.
- CTA мягкий и продуктовый: «kumpulkan dokumen ini lewat satu tautan», не «срочно регистрируйтесь».

## Пример запроса
Напиши checklist-запись для doki.help.
Тема: какие документы обычно нужны при онбординге нового сотрудника в Индонезии.
Аудитория: HR SMB. Гео: Джакарта.
Главный запрос: dokumen onboarding karyawan.
CTA: собрать эти документы у сотрудника по одной ссылке.
Выдай TS-объект под тип Checklist (slug, emoji, locales ru/en/id/uz, related), с дисклеймером про официальные источники.
