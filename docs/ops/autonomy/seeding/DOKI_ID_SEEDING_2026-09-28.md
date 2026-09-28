# DOKI.help Indonesia — план посевов для HR и агентств (2026-09-28)

- **task_id:** T-DOKI-D4
- **статус:** DONE_CODE (документ). **Ничего не отправлено и не опубликовано.**
  Это план. Публикует только владелец или локальный представитель после согласования.
- **голос и правила:** `.claude/skills/doki-id-brand-voice/SKILL.md`: без скоринга и вердиктов,
  без гарантий, для SKCK/KITAS — «cek syarat resmi»; массовые WhatsApp-рассылки запрещены
  (`docs/gtm-dashboard.md` §2, `docs/launch-indonesia.md` ч. 5).

## 0. Что подтверждено и что нет

| Утверждение | Источник |
|---|---|
| Клин — рекрутинговые и стаффинговые агентства | `docs/gtm-dashboard.md` §2, `docs/launch-indonesia.md` ч. 5 |
| Обещание «Kirim satu ceklis — terima paket dokumen lengkap» | `docs/gtm-dashboard.md` §2, `lib/segments.ts` (`employers`, id `title`) |
| Кандидат загружает без аккаунта, у HR статус «lengkap / kurang», напоминания о сроках SKCK/KITAS | `docs/seo/indonesia-content-plan.md` §0, `lib/comparisons.ts` (`hr-whatsapp`) |
| Каналы при нулевом бюджете: тёплые контакты, представитель 1:1 в WA, офлайн-обход, коворкинги Бали, HR-сообщества FB/WA/TG, контент на бахаса (Reels, чек-листы как лид-магнит) | `docs/launch-indonesia.md:46`, `docs/gtm-dashboard.md:50-56` |
| «Вступить в 3–5 HR-сообществ с бесплатным чек-листом как лид-магнитом» — неделя 2 плана владельца | `docs/launch-indonesia.md:53`, `docs/gtm-dashboard.md:69` |
| Гейты до платных каналов (≥3 активных отправителя, completion ≥40 %, органические новые отправители, ≥1 отзыв) | `docs/gtm-dashboard.md` §4 |

**Не подтверждено:** в репозитории нет ни одного **названия** конкретной группы, чата, коворкинга
или страницы. Сети этой сессии закрыт доступ к сторонним сайтам, поэтому площадки на уровне
«группа X, N участников, правила разрешают ссылки» проверить нельзя. Ниже площадки даны на уровне
**канала** с источником. Конкретные названия и ссылки — **BLOCKED_DECISION** (см. §6).

## 1. Площадки (8, все из репозитория)

| # | Площадка (канал) | Источник | Формат | Ограничение |
|---|---|---|---|---|
| P1 | Тёплые контакты владельца → design-партнёры | `launch-indonesia.md:46`, `gtm-dashboard.md:52` | личное сообщение, текст T2 | только люди, которых владелец знает лично |
| P2 | Локальный представитель, 1:1 в WhatsApp | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | текст T2, демо на звонке | 1:1, без рассылок и списков |
| P3 | Офлайн-обход агентств и работодателей (Бали) | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | разговор + QR на T3 | — |
| P4 | Коворкинги Бали (доска объявлений, комьюнити-чат) | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | T3 | только где правила места разрешают |
| P5 | HR-сообщества в Facebook | `launch-indonesia.md:46`, `gtm-dashboard.md:54` | пост T1 с чек-листом как пользой | правила группы; разрешение админа, если ссылки запрещены |
| P6 | HR-сообщества в WhatsApp (группы/сообщества) | там же | короткая версия T1 | только если сам участник; без холодных добавлений |
| P7 | HR-сообщества в Telegram | там же | T1 | правила чата |
| P8 | Контент на бахаса: Reels + чек-лист как лид-магнит | `launch-indonesia.md:46` | сценарий Reels на основе T1 (не в этом плане) | аккаунт бренда в соцсетях в репозитории не указан → BLOCKED_DECISION |

Интерпретация: P5–P7 — это одна задача из плана («3–5 HR-сообществ»), разбитая по платформам.
Больше 8 площадок не добавляю: джоб-борды Glints и KitaLulus упомянуты в
`docs/pricing-pilot-id.md:16` и `gtm-dashboard.md:91` только как ориентир цены, не как канал посева.

## 2. Посадочные страницы с UTM

Все маршруты реальные: реестры `lib/checklists.ts`, `lib/segments.ts`, `lib/comparisons.ts`,
`lib/landings.ts`; все URL с префиксом языка и совпадают со своим canonical (после
коммита 353e67c в этой ветке). Схема UTM: `utm_source` — площадка, `utm_medium` — формат,
`utm_campaign=id_hr_seed_2026q4`, `utm_content` — номер текста.

| Для | Landing URL |
|---|---|
| P5/P7 пост (польза: чек-лист) | `https://www.doki.help/id/checklists/candidate-documents-requested-checklist?utm_source=facebook&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` (для TG — `utm_source=telegram`) |
| P6 WA-сообщество | `https://www.doki.help/id/vs/hr-whatsapp?utm_source=whatsapp&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` |
| P1/P2 агентство, 1:1 | `https://www.doki.help/id/for/recruitment-agencies?utm_source=whatsapp&utm_medium=direct&utm_campaign=id_hr_seed_2026q4&utm_content=t2` |
| P3/P4 вилла, F&B (EN) | `https://www.doki.help/en/for/hospitality?utm_source=offline&utm_medium=qr&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |
| P3/P4 вилла, F&B (BI) | `https://www.doki.help/id/checklists/villa-staff-documents-checklist?utm_source=offline&utm_medium=qr&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |

Про измерение (интерпретация, не проверено): `lib/analytics.ts` инициализирует `posthog-js`
и шлёт `$pageview` вручную (`components/PostHogProvider.tsx`). Обычно posthog-js сам
сохраняет `utm_*` из URL в свойствах события. Работает это только при заданном
`NEXT_PUBLIC_POSTHOG_KEY` в продакшене, а его наличие из этой сессии проверить нельзя.

## 3. Три адаптированных текста

### T1 — пост в HR-сообществе (FB/TG; для WA короче). BI

> **Ceklis dokumen kandidat — gratis, silakan dipakai**
>
> Rekan HR, saat rekrutmen banyak posisi, dokumen kandidat sering datang sepotong-sepotong
> di WhatsApp: CV di satu chat, KTP di chat lain, SKCK menyusul. Saya rangkum ceklis dokumen
> yang biasanya diminta HR dari kandidat, lengkap dengan catatan kapan dokumen sensitif
> sebaiknya diminta.
>
> 👉 [link P5/P7]
>
> Ceklisnya bisa dipakai tanpa daftar. Kalau mau kirim ceklis ke kandidat dalam bentuk satu
> tautan, di halaman yang sama ada Doki: kandidat unggah tanpa akun, dan HR melihat status
> lengkap / kurang. Untuk SKCK dan KITAS, syarat bisa berubah, jadi selalu cek syarat resmi
> di Polri / imigrasi.
>
> Masukan dari tim HR di sini sangat membantu: dokumen apa yang paling sering kurang?

Почему так: польза (чек-лист) идёт первой, продукт — вторым; в конце вопрос к сообществу, чтобы
начался разговор, а не только клики. Без гарантий и без оценки кандидатов.

### T2 — личное сообщение, 1:1 (тёплый контакт или представитель). BI

> Halo [nama], saya lagi uji coba alat kecil untuk agensi rekrutmen: kirim satu tautan
> ceklis ke kandidat, lalu dokumen masuk lengkap dalam satu paket dan kelihatan siapa yang
> masih kurang. Kandidat tidak perlu bikin akun.
>
> Boleh saya tunjukkan 10 menit? Atau lihat dulu di sini: [link P1/P2]
>
> Masih tahap awal, jadi masukan dari agensi seperti [nama agensi] sangat berharga.

Почему так: одно сообщение одному знакомому человеку, без списков. Честно сказано «tahap
awal» — продукт в пилоте, разговоров о цене пока 0 (`gtm-dashboard.md`, «Ключевые цифры»).
О цене здесь ни слова: сценарий разговора о цене — `docs/pricing-pilot-id.md`.

### T3 — офлайн / коворкинг: карточка с QR. EN + BI

> **Hiring villa or F&B staff?**
> Send candidates one checklist link — get the full document package back.
> No account for candidates. See who's complete and who's missing what.
>
> **Rekrut staf vila atau F&B?**
> Kirim satu tautan ceklis — terima paket dokumen lengkap.
>
> [QR → link P3/P4]

Почему так: слоган взят из `lib/segments.ts` (`employers`, en/id `title`). Про сроки справок
на карточке ничего нет — без дисклеймера такое обещание не уместить.

## 4. Критерий результата (через 14 дней после первого посева)

Опираемся на гейты `docs/gtm-dashboard.md` §4, но считаем только вклад посевов:

- **Успех:** ≥ 3 разговора с агентствами или работодателями (P1–P4) **и** ≥ 1 новый отправитель —
  работодатель, который создал вакансию или чек-лист и отправил ссылку хотя бы одному
  кандидату после перехода по `utm_campaign=id_hr_seed_2026q4` или после разговора.
- **Сигнал продолжать сообщества:** из P5–P7 есть хотя бы один комментарий или вопрос
  по существу либо один переход, который дошёл до `/employer/vacancies/new`.
- **Стоп-сигнал:** за 14 дней 0 разговоров и 0 новых отправителей. Тогда меняем
  лид-магнит или сегмент, а не увеличиваем объём публикаций.
- Во время посевов **никаких платных каналов**: гейты §4 не пройдены, число активных
  отправителей в репозитории не зафиксировано.

## 5. Очередь на 14 дней (черновик; день 1 наступает после согласования владельцем)

| День | Площадка | Действие | Текст / URL |
|---|---|---|---|
| 1 | P1 | 3 личных сообщения тёплым контактам | T2, URL P1/P2 |
| 2 | P5 | Вступить в 1–2 HR-группы в FB, прочитать правила, ничего не постить | — |
| 3 | P2 | Представитель: 3 сообщения 1:1 знакомым агентствам | T2 |
| 4 | P3 | Офлайн-обход: 2–3 агентства или виллы, оставить карточку | T3 |
| 5 | P1/P2 | Ответить на ответы, назначить демо | — |
| 6 | P5 | Один пост в группе, где правила это разрешают | T1, URL P5 |
| 7 | — | Промежуточный итог: разговоры, переходы по UTM, новые отправители | — |
| 8 | P7 | Одно HR-сообщество в TG: пост, если правила разрешают | T1 (`utm_source=telegram`) |
| 9 | P4 | Коворкинг: карточка на доске или сообщение в чате с разрешения | T3 |
| 10 | P6 | WA-сообщество, где владелец или представитель уже участник: короткий T1 | T1 short, URL P6 |
| 11 | P1/P2 | Повторное сообщение тем, кто не ответил (одно, не больше) | — |
| 12 | P5 | Ответить в комментариях к посту дня 6 | — |
| 13 | P3 | Второй офлайн-обход по откликам | T3 |
| 14 | — | Итог по критерию §4 → решение «продолжать / менять» | — |

Темп — не больше одного поста в день и одного поста на группу: «с редактурой, не ферма»
(`docs/seo/indonesia-content-plan.md` §3).

## 6. Блокеры и решения владельца

- **BLOCKED_DECISION — конкретные площадки.** Нужны названия и ссылки 3–5 HR-групп
  (FB/WA/TG) и коворкингов, где владелец или представитель уже состоит, и их правила
  о ссылках. В репозитории их нет, а сеть сессии закрыта.
- **BLOCKED_DECISION — вычитка BI носителем** перед публикацией T1–T3
  (`gtm-dashboard.md` §1: «блокер для продвижения»).
- **BLOCKED_DECISION — P8 (Reels):** аккаунт бренда и кто снимает ролики.
- **BLOCKED_EXTERNAL — измерение.** Проверить, что `NEXT_PUBLIC_POSTHOG_KEY` задан
  в продакшене и что `utm_*` видны в событиях `$pageview`: одна тестовая ссылка с UTM,
  потом просмотр события в PostHog (≈ 5 минут).
- **Зависимость:** контакты поддержки на страницах (`NEXT_PUBLIC_SUPPORT_WHATSAPP`,
  `NEXT_PUBLIC_ID_REP_NAME`) — `gtm-dashboard.md` §1. Без них посетителю из посева
  негде задать вопрос, кроме формы входа.
