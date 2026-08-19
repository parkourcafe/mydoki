# Doki.help — Indonesia content plan (HR/agency)

> Контент-движок для индонезийского рынка (HR/рекрутинг/агентства, BI/EN).
> Зеркалит структуру RU-контент-пакета, но переориентирован на сбор документов
> у кандидатов/клиентов, а не на «семейный сейф».
> Правила правдивости — как в `docs/seo/page-briefs.md` §0 и гардрейлы
> (`lib/ai/guardrails.ts`, `tests/lexicon.mjs`): только подтверждённые фичи,
> beta-честность, без юр/иммиграционных гарантий, без скоринга/вердиктов.

---

## 0. Что правда про продукт сегодня (source of truth)

Только это можно утверждать в контенте (проверено по коду):
- Работодатель создаёт вакансию/чек-лист с нужными документами (`lib/segments.ts` employers, шаблоны `lib/vacancyTemplates.ts`).
- Кандидат грузит по ссылке **без регистрации** (`app/apply/[slug]`), чувствительные ID/мед-документы откладываются на пост-оффер (`filterApplicationStageDocuments`).
- Статус пакета «полный / не хватает» для HR (`ApplicationsBoard`).
- Отзывные ссылки (истечение, лимит просмотров, watermark), напоминания о сроках, AI-распознавание сроков (opt-in), 2FA, экспорт.
- Аналитика воронки: `link_opened → pack_completed`, `consent_given`, `reminder_sent` (PostHog).
Всё, что за этим — «факт нужен от бизнеса», в контенте не утверждаем.

## 1. Позиционирование и аудитории

**One-liner (из `lib/segments.ts` employers):** «Kirim satu ceklis — terima paket dokumen lengkap».

| Аудитория | Боль | Угол контента |
|---|---|---|
| Рекрутинговые/стаффинговые агентства (клин) | Документы кандидатов по кускам в WA | Собрать пакеты пачками по ссылке |
| Hospitality-работодатели (Бали) | Частая текучка, сроки справок | Шаблоны паков, напоминания |
| Визовые/релокационные агенты | Документы клиента для KITAS | Чек-лист-ссылка клиенту |
| HR SMB (Джакарта) | Онбординг, комплектность | Онбординг-документы, статусы |
| Кандидаты (виральность) | «Кто увидит мой KTP» | Приватность, сохранить сейф |

## 2. Карта кластеров → реальные реестры

Контента-блога нет; всё идёт в типизированные реестры (sitemap+hreflang авто).

| Кластер | Главный запрос (BI) | Реестр (файл) | Slug |
|---|---|---|---|
| SKCK | dokumen skck untuk kerja | `lib/checklists.ts` | `skck-checklist` ✅ |
| KITAS | dokumen kitas izin kerja | `lib/checklists.ts` | `kitas-work-permit-checklist` ✅ |
| Онбординг | dokumen onboarding karyawan | `lib/checklists.ts` | `employee-onboarding-11-checklist` ✅ |
| Кандидат | dokumen yang diminta hr | `lib/checklists.ts` | `candidate-documents-requested-checklist` ✅ |
| Villa staff | dokumen staf vila | `lib/checklists.ts` | `villa-staff-documents-checklist` ✅ |
| Driver | dokumen sopir sim | `lib/checklists.ts` | `driver-documents-checklist` ✅ |
| Hospitality | dokumen karyawan restoran | `lib/checklists.ts` | `hospitality-hiring-checklist` ✅ |
| ART/PRT | dokumen art prt | `lib/checklists.ts` | `domestic-worker-documents-checklist` ✅ |
| Agencies | agensi rekrutmen kumpulkan dokumen | `lib/segments.ts` | `/for/recruitment-agencies` ✅ |
| Hospitality | rekrut staf vila f&b | `lib/segments.ts` | `/for/hospitality` ✅ |
| Visa agents | agen visa kumpulkan dokumen klien | `lib/segments.ts` | `/for/visa-agents` ✅ |
| vs Google Form | google form vs kumpulkan dokumen | `lib/comparisons.ts` | `/vs/google-form` ✅ |
| vs WhatsApp (HR) | kumpulkan dokumen lewat whatsapp | `lib/comparisons.ts` | `/vs/hr-whatsapp` ✅ |
| vs Email | kirim dokumen lewat email | `lib/comparisons.ts` | `/vs/email-attachments` ✅ |
| vs Spreadsheet | lacak dokumen kandidat excel | `lib/comparisons.ts` | `/vs/spreadsheet-tracker` ✅ |
| Landing | kumpulkan dokumen kandidat | `lib/landings.ts` | `/candidate-document-collection` ✅ |
| Landing | checklist dokumen hr | `lib/landings.ts` | `/hr-document-checklist` ✅ |

✅ = засижено и в проде. Все записи календаря §3 (#1–#20) реализованы, включая кейс-блоки на трёх HR-сегментах (`caseStudy` в `lib/segments.ts`, рендерится в `app/for/[segment]/page.tsx`); #21+ — GSC-driven расширение. title/meta приведены к ≤60/≤155 через `doki-id-seo-optimizer`.

## 3. Контент-календарь (первые 30 дней, порядок публикации)

Порядок: сначала сегменты (клин), потом чек-листы (движок статей), потом сравнения, потом landings. По 1–2 сильных материала в день, с редактурой, не «ферма».

| # | Материал | Тип | Запрос (BI) |
|---|---|---|---|
| 1 | /for/recruitment-agencies | Segment | agensi rekrutmen kumpulkan dokumen |
| 2 | /for/hospitality | Segment | rekrut staf vila f&b bali |
| 3 | /for/visa-agents | Segment | agen visa kumpulkan dokumen klien |
| 4 | skck-checklist | Checklist | dokumen skck untuk kerja |
| 5 | kitas-work-permit-checklist | Checklist | dokumen kitas izin kerja |
| 6 | employee-onboarding-11-checklist | Checklist | dokumen onboarding karyawan |
| 7 | candidate-documents-requested-checklist | Checklist | dokumen yang diminta hr dari kandidat |
| 8 | villa-staff-documents-checklist | Checklist | dokumen staf vila |
| 9 | driver-documents-checklist | Checklist | dokumen sopir yang dibutuhkan |
| 10 | hospitality-hiring-checklist | Checklist | dokumen karyawan restoran/hotel |
| 11 | /vs/google-form | Comparison | google form vs kumpulkan dokumen kandidat |
| 12 | /vs/hr-whatsapp | Comparison | kumpulkan dokumen kandidat lewat whatsapp |
| 13 | /vs/email-attachments | Comparison | kirim dokumen lamaran lewat email |
| 14 | domestic-worker-documents-checklist | Checklist | dokumen art/prt |
| 15 | /candidate-document-collection | Landing | kumpulkan dokumen kandidat satu link |
| 16 | /hr-document-checklist | Landing | checklist dokumen hr |
| 17 | /vs/spreadsheet-tracker | Comparison | lacak dokumen kandidat excel |
| 18 | Case: агентство виллы | Case → блок на /for/hospitality ✅ | — |
| 19 | Case: KITAS-релокация | Case → блок на /for/visa-agents ✅ | — |
| 20 | Case: массовый F&B-найм | Case → блок на /for/recruitment-agencies ✅ | — |
| 21–30 | GSC-driven: расширение по реальным запросам из Search Console | — | из GSC |

С 21-го дня — только GSC-driven (см. §7): берём запросы с показами, но низким CTR / позицией 8–30 и усиливаем.

## 3a. Партия 2 — отбор из внешнего intent-реестра (август 2026)

Источник: внешний `intent-registry-combined.json` (268 интентов). **Взято 22 из 112**
индонезийских запросов; 156 запросов реестра — на русском (не ищутся в Индонезии),
а ~90 индонезийских обслуживают семейный B2C (COLLAB/LEGACY/MAINT/BACKUP,
`dokumen keluarga`, `akta kelahiran`, `warisan`) — это позиция, от которой продукт
ушёл, поэтому в работу не берутся.

⚠️ Реестр использовать только как список запросов, не как архитектуру: в нём все
268 интентов ведут на 26 URL (32 записи ORG → один `/organize-documents/`),
иерархия пустая (`parent_intent` = null у всех), `cannibalization_risk` = "Low"
у всех 268 при фактическом наложении 32:1.

**Статус:** A и B реализованы (см. отметки ✅ ниже). Осталось вне кода — вычитка
BI носителем для новых страниц.

**A. Новые страницы (запрос достаточно отличается от уже сидящих):**

| Запрос (BI) | Интенты | Реестр | Slug | Почему отдельная страница |
|---|---|---|---|---|
| ijazah dan transkrip untuk lamaran kerja | ORG_059, ORG_060, TYPES_112 | `lib/checklists.ts` | `ijazah-transkrip-checklist` ✅ | Легализир ижазы/транскрипта — самостоятельная и очень частая боль индонезийского найма, в текущих чек-листах не раскрыта |
| privasi dokumen kandidat / siapa yang melihat KTP saya | ORG_065, SAFE_074, SAFE_080, SAFE_082 | `lib/landings.ts` | `candidate-document-privacy` ✅ | Закрывает боль кандидата из §1 («кто увидит мой KTP»), питает виральную петлю; сейчас страницы нет |
| dokumen untuk permohonan cepat | SPEED_096, DISC_028, DISC_029 | `lib/checklists.ts` | `fast-document-submission` ✅ | Ценность «быстро подать полный пакет» — угол кандидата, а не HR; реализовано чек-листом |

**B. Дозаливка в существующие страницы (FAQ/секция, не новый URL — иначе каннибализация):**

| Запрос (BI) | Интенты | Куда добавить |
|---|---|---|
| ✅ dokumen kadaluarsa kapan diperbarui · reminder dokumen kadaluarsa · jadwal perpanjangan · masa berlaku dokumen | TRACK_097–099, ORG_045 | `document-expiry-reminder` + HR-угол (сроки SKCK/KITAS) в `skck-checklist`, `kitas-work-permit-checklist` |
| ✅ dokumen identitas apa saja | TYPES_100 | FAQ в `candidate-documents-requested-checklist` |
| ✅ persyaratan dokumen administrasi · dokumen sah dan resmi | COMPLY_018, COMPLY_019 | FAQ в `employee-onboarding-11-checklist` (описательно + «cek syarat resmi») |
| ✅ perjanjian kontrak · dokumen legal dan kontrak | ORG_062, TYPES_105 | FAQ в `employee-onboarding-11-checklist` (трудовой договор в онбординге) |
| ✅ paspor dan visa dokumen | ORG_063 | FAQ в `kitas-work-permit-checklist` / `/for/visa-agents` |
| ✅ fotokopi digital dokumen | ORG_048 | FAQ в `/candidate-document-collection` (скан с телефона вместо фотокопии) |

**C. Исключено намеренно:**

- `ORG_071 «Verifikasi dokumen asli»` — запрос про проверку подлинности. Прямо
  конфликтует с гардрейлами (`lib/ai/guardrails.ts` — без вердиктов о подлинности)
  и `tests/lexicon.mjs`. Брать можно **только** как FAQ-ответ в формате «мы этого
  не делаем: doki собирает и показывает комплектность, подлинность проверяет
  работодатель у официального источника».
- `SAFE_077 «Enkripsi dokumen digital»`, `SAFE_081 «Enkripsi end-to-end»` — брать
  лишь если формулировки совпадут с тем, что реально заявлено на `/security`;
  E2E не заявлять, если это не так (beta-честность §0).

## 4. Структуры (совпадают с формой реестров)

**Checklist** (`ChecklistContent`): navLabel · title ≤60 · metaDescription ≤155 · h1 · intro (answer-first, 2–3 фразы) · ctaPrimary · groups[{h2, items[]}] (2–3 группы) · faqHeading · faq[{q,a}] (3). Все 4 локали обязательны. Отдаёт Article+FAQPage+ItemList+BreadcrumbList.
**Comparison** (`ComparisonContent`): navLabel · altName · title · subtitle · intro (answer-first) · rows[{aspect, alt, doki}] · verdict · faq. `ru` обязателен, id/en добавляем.
**Segment** (`SegmentContent`): navLabel · title · subtitle · pains[] · solutions[] · docs[] · ctaLabel?. Все 4 локали.
**Landing** (`lib/landings.ts` + 13-строчный `app/<slug>/page.tsx`).

Правила копирайтинга (наследуются из гардрейлов):
- Никаких гарантий («100% защита», «точно пройдёте KITAS»).
- Юр/иммиграционное — описательно + «cek syarat resmi di imigrasi/Polri/Disnaker».
- Никакого скоринга/ранжирования/вердиктов о подлинности (иначе падает `tests/lexicon.mjs`).
- Beta-честность где уместно; не выдавать план за факт.

## 5. Идеи кейсов (анонимные, guardrail-safe)

1. **Агентство персонала для вилл (Бали):** собирало документы 20 кандидатов вручную в WA → перешло на чек-лист-ссылку → полные пакеты и статус «чего не хватает». Вывод: меньше переписки, быстрее шортлист.
2. **Визовый агент / KITAS:** клиенты слали паспорт и справки частями → одна ссылка-чек-лист → пакет клиента в одном месте + напоминание о сроке KITAS.
3. **Массовый F&B-найм:** ресторанная группа нанимала посменно → шаблоны паков (F&B, ресепшн) → онбординг-документы собираются в 1 клик.
Формат: 3 длины (лендинг / блог-блок / email). Приватность: без реальных имён, без номеров документов, без точных дат.

## 6. Arvow / Autoblog — фиды (только черновики + редактура)

Не автопилот. Финальная редактура обязательна (визы/труд легко испортить неточностью).

- **Фид Recruiting:** сбор документов кандидатов, онбординг, чек-листы по ролям, статусы комплектности.
- **Фид Hospitality Bali:** найм персонала виллы/F&B, документы линейного персонала, сроки справок.
- **Фид Visa/KITAS:** документы для KITAS/izin tinggal, сроки, что готовить заранее (с дисклеймером «cek resmi»).
- **Фид Comparison:** сбор документов через WhatsApp/Google Form/email vs один линк.

## 7. Измерение (GSC уже подключён)

- **Google Search Console — уже верифицирован** (`app/layout.tsx` verification.google + `public/google701d47690a232c57.html`). Действие владельца: submit `sitemap.xml`, затем еженедельный разбор запросов.
- **GA4 не нужен** — есть PostHog (`lib/analytics.ts`) + Yandex Metrika + Vercel Analytics. Продуктовая воронка `link_opened→pack_completed`, `consent_given`, `reminder_sent` уже есть.
- **Indexing API НЕ используем** — он для job postings/livestream, не для контента. Индексация — через sitemap + внутреннюю перелинковку.
- **GSC-driven цикл (с 21 дня):** брать запросы с высоким показом/низким CTR (→ переписать title/meta), позиция 8–15 (→ расширить страницу/FAQ), 16–30 (→ отдельная целевая страница), вопросительные запросы (→ FAQ/AEO-блок).
- **AEO:** уже есть FAQ JSON-LD везде + answer-first `intro` у сравнений/чек-листов. Дополнительный «короткий ответ» — опционально через тот же `intro`.

## 8. Brand Monitor — запросы (ChatGPT/Claude/Gemini/Perplexity)

**BI (коммерческие):**
- aplikasi kumpulkan dokumen kandidat
- cara HR minta dokumen kandidat online
- checklist dokumen karyawan baru
- aplikasi pengingat masa berlaku KITAS / SKCK
- kirim dokumen lamaran tanpa ribet
- cara agensi kumpulkan berkas kandidat

**EN:**
- collect candidate documents via one link
- HR document checklist app Indonesia
- KITAS document reminder app
- how recruiters collect documents from candidates
- staffing agency document collection tool

**AEO-вопросы:**
- Bagaimana cara HR mengumpulkan dokumen dari banyak kandidat?
- Dokumen apa yang biasanya diminta saat onboarding karyawan?
- What documents are usually needed for a KITAS?
- How can an agency collect candidate documents without WhatsApp chaos?

## 9. Отличие от RU-пакета

Тот пакет — про семью/поездки/детей (B2C). Здесь — про **сбор документов у кандидатов/клиентов** (B2B2C, HR). Не смешивать на одних страницах: RU-family-контент гейтится на `/ru` (`/keep/*`, `/vs/gosuslugi`), индонезийский HR-контент — BI/EN. Виральность даёт петля агентство→кандидаты→новые отправители, а не семейный шеринг.

---

*Все evergreen-записи §2/§3 реализованы и в проде. Осталось (вне кода): вычитка BI-копии носителем (B1) и ревью юр/иммиграционных формулировок юристом (compliance-gate) перед активным продвижением; кейсы (#18–20) — через `doki-id-casestudy`; дальнейшее расширение — GSC-driven.*
