# Doki.help — пилот ценообразования в Индонезии (ручной, через WhatsApp)

> Контекст: монетизация уже наполовину работает — бесплатный лимит 3 вакансии
> (`employer_profiles.vacancy_limit`), при упоре в лимит показывается экран
> `app/employer/vacancies/new/VacancyLimitReached.tsx` со ссылками на WhatsApp
> и email («pilot: оплата переводом в переписке»). Решение этой сессии: **пока
> не строить платёжную интеграцию** (Midtrans/Xendit) — сначала вручную
> проверить, на какую цену вообще соглашаются первые 5–10 клиентов, и только
> потом кодировать тарифную логику. Ничего в коде/на `/pricing` менять не
> нужно, пока цифры не подтверждены разговорами.

---

## 1. Гипотеза тарифов (для проверки, не финальная цена)

Ориентир взят не от джоб-бордов (Glints/KitaLulus размещают вакансии
бесплатно — не наш конкурент по модели), а от того, что индонезийский SMB
уже платит за HR-софт (Mekari Talenta — ~Rp 25–50k/сотрудник/мес за полноценный
HRIS). Doki делает меньше, чем HRIS, но экономит конкретное время на сборе
документов — поэтому цена не «за вакансию», а «за то, что не гоняешься за
кандидатами по WA вручную».

| Тариф | Кому | Цена/мес (гипотеза) | Что даёт |
|---|---|---|---|
| Free | как сейчас | Rp 0 | 3 активные вакансии |
| Employer | одиночный работодатель (villa/hotel/kantor kecil) | **Rp 149.000–299.000** | ~10 вакансий, приоритет в WA-поддержке |
| Agency | рекрутинговое/визовое/relocation-агентство | **Rp 499.000–990.000** | 50+ вакансий / безлимит, много кандидатов параллельно |

Начинайте разговор с верхней границы диапазона — торговаться вниз всегда
легче, чем поднимать цену после того, как назвали низкую.

## 2. Как тестировать, не трогая код

1. Ничего не автоматизируем. Поток тот же: клиент упирается в лимит →
   пишет в WhatsApp/email → вы называете цену голосом/текстом → если
   согласен — перевод на счёт → вручную:
   ```sql
   update employer_profiles set vacancy_limit = 10 where id = '<employer_id>';
   ```
2. На каждый разговор фиксируйте (таблица/заметка — вне кода):
   дата · компания · сегмент (агентство/отель/визовое) · какую цену назвали ·
   реакция (согласился / торговался до … / отказался) · итоговая цена ·
   оплатил ли фактически.
3. Цель первых 5–10 разговоров — не продать любой ценой, а понять, где
   находится реальный порог «это дорого» по каждому сегменту.

## 3. Скрипт для WhatsApp (Bahasa Indonesia, готово копировать)

Клиент уже приходит с преднаполненным сообщением («Hi! I'd like to post more
vacancies on doki.help» / индонезийская версия) — это стартовая точка.

**Открытие:**
> Halo [Nama]! Terima kasih sudah pakai doki.help 🙌
> Paket gratis memang dibatasi 3 lowongan aktif. Boleh tahu dulu — ini untuk
> bisnis sendiri atau agensi yang bantu banyak klien rekrutmen?

**Если единичный работодатель (Employer):**
> Untuk kebutuhan seperti ini biasanya kami tawarkan paket Rp 299.000/bulan —
> dapat 10 lowongan aktif + prioritas respons di WhatsApp kalau ada kendala.
> Mau saya aktifkan?

**Если агентство (Agency):**
> Karena agensi biasanya proses banyak kandidat sekaligus, ada paket khusus
> Rp 990.000/bulan — lowongan tanpa batas + prioritas support. Ini juga bantu
> tim Anda nggak perlu kejar-kejar dokumen kandidat manual satu-satu lewat WA.
> Cocok?

**Возражение «слишком дорого»:**
> Dimengerti — boleh tahu kira-kira budget yang pas berapa? Kami masih tahap
> awal di Indonesia jadi harga sekarang fleksibel untuk pengguna pertama.

*(Записывайте, на какой цифре останавливаются — это и есть реальный порог.)*

**Возражение «у конкурента бесплатно» (job board):**
> Betul, platform lowongan seperti Glints/KitaLulus memang gratis untuk
> posting — tapi itu untuk cari kandidat baru. Doki.help beda: begitu
> kandidat melamar, mereka upload dokumen (KTP/ijazah/SKCK) lewat 1 link, dan
> Anda langsung lihat siapa yang berkasnya sudah lengkap — nggak perlu WA
> bolak-balik minta dokumen kurang.

**Закрытие / оплата:**
> Baik, saya aktifkan [N] lowongan untuk [durasi]. Untuk pembayaran bisa
> transfer ke [rekening] — begitu masuk, saya update akun Anda dalam
> beberapa menit. Boleh minta nama & email akun doki.help-nya untuk saya
> cocokkan?

## 4. Когда переходить к автоматизации

Не раньше, чем наберётся сигнал:
- ≥5 успешных ручных апгрейдов с примерно одинаковым ценовым порогом по
  сегменту (это и будет реальная цена тарифа, не гипотеза из таблицы выше);
- повторяющееся неудобство от ручного процесса (либо вы, либо клиенты жалуются
  на задержку между переводом и активацией).

Тогда: подключить Midtrans или Xendit, завести `plan`/`tier` в
`employer_profiles` вместо ручного `vacancy_limit`, автоматический webhook →
апдейт лимита. До этого момента — просто разговоры и Excel/заметка.
