# Victoria Architecture Guide

This live document outlines the architecture, routing structure, components, database schemas, and integration details for the **Victoria** application.

> [!TIP]
> For a detailed, 1-to-1 blueprint of the leads capture, tracking analytics, and CRM stitching integrations designed for developers to clone on other projects, see the dedicated [CRM Architecture Guide](file:///c:/Users/yura3/Documents/Repositories/B&W%20Prod/EXPERTS/VICTORIA/victoria-mc/CRM_ARCHITECTURE.md).

---

## 🚀 Stack & Core Systems
*   **Frontend Framework:** Next.js (App Router, TS, React 19)
*   **Styling & UI:** CSS Modules, TailwindCSS, Framer Motion
*   **Database:** Supabase (PostgreSQL)
*   **Payment Gateway:** WayForPay
*   **CRM & Legacy Sync:** Google Sheets (Removed to maximize checkout redirect speed, all data now managed in Supabase)
*   **Notifications:** Telegram Bot API
*   **Marketing Automation:** SendPulse Chatbot API (for subscriber funnel tracking)

---

## 📂 File Map & Routing Structure

### 🛣️ App Router Routes (`src/app/`)
*   `layout.tsx` — Root layout initialized with global styles, fonts, and the visitor analytics logger.
*   `page.tsx` — Core landing page. Now supports dynamic headline testing via `?offer=1/2/3`, `?v=1/2/3`, or `utm_content` values, defaulting to Variant 1 (completely removing the old "ВІД ХАОСУ ДО СИСТЕМИ" version). Stitches selection into lead analytics.
*   `price/` — Price selection and package landing page.
*   `price/thanks/` — Thanks/success confirmation page after checkout.
*   `price/fail/` — Payment failure handling page.
*   `practicum/` — Dedicated masterclass practicum page.
*   `practicum/thanks/` — Thanks/success page for the practicum.
*   `practicum/fail/` — Failure page for the practicum.
*   `free-lection/` — VSL funnel start landing page. Supports `?uavslab=160626` query parameter for A/B testing redirect to an alternative Telegram chatbot chain.
*   `free-lection/vsl-form/` — VSL Step 2 form questionnaire.
*   `rozbir/` — Personal video breakdown offer page.
*   `anketa/` — Pre-registration Questionnaire Landing Page for lead capturing. Supports `?v=2` query parameter for A/B testing a different bonus structure (Consultation, Maximum Discount, Warming-up Structure) instead of the default layout. Form requires checking "Я очікую на дзвінок від команди" to submit.
*   `anketa/thanks/` — [NEW] Pre-registration video thank you landing page with YouTube auto-embed, Telegram pre-registration channel CTA, and direct links to YouTube & Instagram profiles.
*   `intensive/5-likes/` — [NEW] 4-Lesson Intensive landing page ("5 Лайків") with dark luxury aesthetic, 10-min countdown timer, 125€ bonus package (4 bonuses), "Це про тебе якщо", "Кому не підійде", "Що зміниться", Expert profile, 4-lesson curriculum breakdown, before/after cases & reviews lightbox, format & curation, why price explanation, 100% money-back guarantee, FAQ accordions, and resilient 9€ (EUR) WayForPay checkout integration.
*   `checkout/` — Dynamic checkout client page.
*   `admin/` — CRM Dashboard area with Role-Based Access Control (RBAC).
*   `minicourse/` — [NEW] Mini-Course Student LMS Dashboard. Dynamically displays course checkpoints progress, unlocked/locked module cards based on active lessons configuration, dynamic leaderboard with masked Telegram usernames, and rules agreement modal.
*   `minicourse/lessons/[id]/` — [NEW] Interactive lesson viewer with YouTube Iframe API 80% auto-watch detection, dynamic materials and custom links (Google Sheets, Notion, files), rich description/notes under video, Supabase Storage homework submission form, 24h deadline countdown timer, and Telegram group redirect modal.
*   `minicourse/login/` — [NEW] Student login interface supporting manual Telegram handle entry and seamless magic link autologin (`?token=...`).
*   `minicourse/claim/` — [NEW] Promo & prize code claim page (`/minicourse/claim?code=...`).
*   `minicourse/admin/` — [NEW] Curator & admin management portal: homework grading queue (Accept / Request rework + comments), student progress manager & lockout toggles, dynamic lesson builder (add/delete N lessons, auto YouTube ID parsing from URLs, dynamic custom material links up to 5 per lesson, notes under video), and gift code generator.
*   `minicourse/admin/login/` — [NEW] Curator & admin authentication gateway.

### 🌐 API Endpoints (`src/app/api/`)
*   `api/bot/webhook/` — [NEW] Telegram Bot Webhook endpoint handling `/start`, payment activations (`pay_...`), gift code redemptions (`gift_...`), contest codes (`prize_...`), and welcome-back flows.
*   `api/minicourse/bot/notify/` — [NEW] Internal dispatcher for triggering Telegram bot notifications on homework submissions, curator approvals, reworks, and lesson unlock events.
*   `api/minicourse/token-auth/` — [NEW] One-time magic link token validator and session creator for Telegram-to-LMS single-click transitions.
*   `api/minicourse/telegram-auth/` — [NEW] Telegram Login Widget HMAC-SHA256 signature verifier.
*   `api/minicourse/reminders/` — [NEW] Vercel Cron backup endpoint checking >18h pending homeworks.
*   `api/minicourse/prize/verify/` — [NEW] Promo / prize code validation endpoint.
*   `api/homework/assign/` — [NEW] Upstash QStash job creator scheduling homework reminder 3 hours before the 24-hour deadline.
*   `api/homework/cancel-reminder/` — [NEW] Upstash QStash reminder cancellation when homework is submitted.
*   `api/notifications/send/` — [NEW] Webhook receiver triggered by QStash to send Telegram reminders.
*   `api/lead/` — Primary leads registration proxy. Submits leads in parallel to Telegram and BaseCRM (for VSL & Anketa funnels), and registers the customer inside Supabase (`victoria_leads`) with visitor stitching (Google Sheets sync removed for performance). BaseCRM payload `comment` field is dynamically constructed to include all questionnaire answers, explicit UTM parameters (`Source`, `Medium`, `Campaign`, `Content`, `Term`), and prior product/funnel visit history (`Бул(а) на інших продуктах/воронках: Так` with timestamps in Kiev time) if the user previously interacted with other funnels. Now omits individual Telegram notifications for VSL Stage 1 leads. Supports questionnaire fields (purpose, difficulties, readiness) from the pre-registration landing. Triggers SendPulse status `'3. Заповнив анкету'` if `sp_contact_id` is supplied.
*   `api/create-payment/` — Initiate checkout route. Starts Telegram payment alerts and persists the lead details into Supabase (`victoria_leads`). Returns signed WayForPay configuration.
*   `api/payment-callback/` — [NEW] Webhook target invoked by WayForPay to confirm transaction status. Syncs status updates back to Supabase (`victoria_leads`).
*   `api/leads/` — Secondary CRM status synchronization proxy. Updates Telegram messages and updates database status when users reach thanks/fail landing pages or manually update states.
*   `api/analytics/log/` — Traffic tracking telemetry receiver. Logs page views (`Клик`) and form modal actions directly in Supabase (`victoria_leads`). Triggers SendPulse status `'1. Зайшов на сайт'` for VSL funnel if `sp_contact_id` is supplied.
*   `api/video-progress/` — [NEW] Video watching progress tracking receiver. Logs played status, watch seconds, and updates lead status to `'полностью посмотрел'` once 20 minutes are reached. Triggers SendPulse status `'2. Подивився відео'` once the watch progress threshold (15 minutes) is met. Omits real-time Telegram alerts to prevent channel spam.
*   `api/country/` — [NEW] Vercel Edge API endpoint that extracts `x-vercel-ip-country` from incoming CDN headers to resolve user country instantly on mount.
*   `api/cron/sync-payments/` — [NEW] WayForPay payment reconciliation cron endpoint. Performs bidirectional 3-day (or customizable `?days=N` / `?start=...&end=...`) transaction synchronization with WayForPay API (`TRANSACTION_LIST`), idempotently reconciles lead statuses (`Approved`, `Declined`, `Expired`), and inserts missing direct/invoice purchases without duplication.
*   `api/cron/vsl-report/` — Analytical cron route.
    *   **Daily:** Runs at 9:00 AM Kyiv time (`0 6 * * *` UTC) with 24-hour period.
    *   **Weekly:** Runs on Mondays at 10:00 AM Kyiv time (`0 7 * * 1` UTC) when `?type=weekly` is specified, reporting over a 7-day period.
    *   **Pre-Report Auto-Sync:** Executes `syncWayForPayTransactions({ daysBack: 3 })` directly before lead extraction to guarantee 100% accurate financial reconciliation.
    *   Aggregates all funnels (VSL, Practicum, Pre-registration Anketa, Video Breakdown, Booking, Autoweb) and traffic/clicks metrics across all landing sites, performs conversion cohort matching, determines the best UTM source per funnel, and sends a comprehensive summary report to Telegram. Includes detailed VSL cohort analysis (site visits, watch button clicks, completed views, average watch duration, and questionnaire fill-out moment distributions).


### 🧩 UI Components & Data (`src/components/`, `src/data/`)
*   `src/data/cases.ts` — Centralized real student cases (Ksenia, Anastasia) with before/after visual metrics and reviews registry.
*   `CASES_REGISTRY.md` — Central documentation registry of client cases, copy, and media assets.
*   `Form.tsx` — Core registration form component.
*   `Analytics.tsx` — Client-side React tracking component. Generates a secure `visitor_id`, extracts UTM parameters, and logs telemetric sessions on load.
*   `pricing/BookingModal.tsx` — Premium checkout modal. Triggers payment generation and redirects user to WayForPay. Uses `react-phone-number-input` for exact international numbers with Edge CDN geo-detection.
*   `practicum/PracticumHeroForm.tsx` — Practicum subscription form.
*   `blocks/BlockCases.tsx` — Before-and-after student visual cases grid connected to `REAL_CASES`.
*   `blocks/BlockReviews.tsx` — Student reviews grid with interactive lightbox connected to `REVIEWS_GALLERY`.
*   `blocks/BlockBonusTimer.tsx` — Active bonuses showcase with persistent 10-minute countdown timer.
*   `blocks/BlockGuarantee.tsx` — Dynamic pricing details copy, money-back guarantee, and doubts resolution.
*   `intensive/IntensiveCasesReviews.tsx` — High-converting Before/After cases and reviews section for 5-Likes Intensive.
*   `intensive/IntensiveCheckoutModal.tsx` — [NEW] Dedicated 9€ EUR checkout modal with instant validation and WayForPay integration.
*   `intensive/use10MinTimer.ts` — [NEW] Synchronized persistent 10-minute countdown timer hook.

### 🧪 QA Regression Tests (`tests/`)
*   `tests/test_all_landings.js` — Universal E2E test script simulating page views and form submissions across all 6 landing pages.
*   `tests/check_supabase.js` — DB validation script using `@supabase/supabase-js` to inspect and assert QA test lead records in Supabase.

---

## 🗄️ Database Schema & Supabase (`victoria_leads`)

Table name: `victoria_leads`

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | Unique lead row identifier (Primary Key) |
| `created_at` | `timestamptz` | `now()` | Date and time of insertion |
| `name` | `text` | `NULL` | Customer full name |
| `phone` | `text` | `NULL` | Normalized phone number or Telegram nick |
| `social` | `text` | `NULL` | Telegram social handle/nickname |
| `instagram` | `text` | `NULL` | Instagram nickname / handle |
| `niche` | `text` | `NULL` | Chosen professional niche/topic |
| `amount` | `numeric` | `0` | Paid or pending order amount |
| `status` | `text` | `'Зареєстровано'` | Lead status (`Клик`, `КликФормы`, `Зареєстровано`, `Approved`) |
| `is_free` | `boolean` | `true` | Free or paid trial flag |
| `order_id` | `text` | `NULL` | WayForPay unique order reference |
| `sheet_id` | `text` | `NULL` | Associated Google Sheet ID |
| `target_sheet` | `text` | `NULL` | Target sheet name in CRM |
| `utm_source` | `text` | `NULL` | UTM Campaign Source |
| `utm_medium` | `text` | `NULL` | UTM Campaign Medium |
| `utm_campaign`| `text` | `NULL` | UTM Campaign Name |
| `utm_content` | `text` | `NULL` | UTM Campaign Content |
| `utm_term` | `text` | `NULL` | UTM Campaign Term |
| `page_path` | `text` | `NULL` | Current path string (e.g. `'/price'`) |
| `page_url` | `text` | `NULL` | Full page absolute URL |
| `visitor_uuid`| `uuid` | `NULL` | Persistent device identifier for stitching |
| `raw_payload` | `jsonb` | `NULL` | Original parsed request body |
| `tg_msg_id`   | `text`  | `NULL` | Telegram bot notification message identifier for editing |


### 🔗 B&W Analytics Sync (Единая сквозная аналитика v2.0)
Вся таблица `victoria_leads` находится под постоянным наблюдением авто-триггера **`trg_sync_victoria_lead`** на стороне Supabase. 
При любой вставке (INSERT) в `victoria_leads` данные автоматически обрабатываются триггером на уровне БД и реплицируются в централизованные таблицы сквозной аналитики под идентификатором проекта Victoria (`b526cfcf-2856-43b9-a299-65239e0f6c27`):
*   **`unified_customers`** — таблица уникальных профилей. Проверяет уникальность телефона/email/telegram строго внутри проекта Victoria, дедуплицируя контакты.
*   **`unified_orders`** — таблица лид-событий/заказов. Сохраняет полную когортную историю, канонические статусы (`closed_won`, `declined`, `pending`, `new`, `внесена предоплата`, `Клик`), суммы (`amount` float), валюты (`currency: "UAH" | "USD" | "EUR"`), `product_type` (`"course" | "tripwire" | "subscription" | "consultation" | "lead"`), и сквозную атрибуцию (`campaign_id`, `adset_id`, `ad_id`, `fbclid`, `gclid`, `fbp`, `fbc`).

---

## 🎓 Mini-Course LMS Database Tables (`supabase_minicourse_schema.sql`)
1. **`victoria_mc_minicourse_users`** — Student & Admin profiles (`id`, `name`, `email`, `telegram`, `telegram_chat_id`, `phone`, `role: 'student' | 'admin'`, `is_paid`, `payment_status`, `device_uuids`, `status: 'active' | 'under_investigation'`, `access_opened_at`, `homework_access_opened_at`, `terms_accepted`).
2. **`victoria_mc_minicourse_progress`** — Student lesson progression (`user_id`, `progress_percent`, `lessons: JSONB` containing checkpoints, video watches, homework links, grading statuses, and QStash reminder IDs).
3. **`victoria_mc_minicourse_lessons_config`** — Dynamic lesson configuration (`lesson_id`, `title`, `description`, `youtube_id`, `links: JSONB`, `description_under_video`, `hw_instructions`, `sort_order`).
4. **`victoria_mc_minicourse_bot_templates`** — Dynamic Telegram bot message templates (`id`, `event_key`, `lesson_id`, `title`, `description`, `message_text`, `buttons: JSONB`, `is_enabled`, `sort_order`).
5. **`victoria_mc_minicourse_broadcasts`** — Mass bot broadcasts history and dispatch records (`id`, `message_text`, `button_text`, `button_url`, `target_audience`, `total_recipients`, `sent_count`, `failed_count`, `status`, `created_by`).
6. **`victoria_mc_minicourse_bot_config`** — Telegram bot configuration & webhook connection parameters (`id: 'default'`, `bot_token`, `bot_username`, `bot_name`, `bot_photo_url`, `webhook_url`, `is_connected`, `updated_at`).
7. **`victoria_mc_minicourse_gift_tokens`** — Gift tokens (`token: 'GIFT-XXXX'`, `is_used`, `used_by_chat_id`, `used_at`).
8. **`victoria_mc_minicourse_prize_codes`** — Contest & promo prize codes (`code: 'prize-XXXX'`, `description`, `status: 'active' | 'used' | 'cancelled'`, `used_by_id`, `used_at`).
9. **`victoria_mc_minicourse_autologin_tokens`** — Cryptographic magic tokens (`token: UUID`, `user_id`, `is_used`, `expires_at`).
10. **Storage Bucket `homeworks`** — Public Supabase bucket for homework attachments.

### 🤖 Telegram Bot Communication Scenarios (Victoria Course)
The Telegram bot handles 12 distinct communication scenarios with universal template interpolation (`{userName}` / `{name}` / `{firstName}`, `{lessonId}` / `{lesson_id}`, `{lessonTitle}` / `{lesson_title}`, `{comment}`):
1. **Успішна оплата курсу (Активація кабінету)** (`payment_success` / `welcome`): Activates LMS access and greets student.
2. **Підтвердження отримання домашнього завдання** (`hw_submitted`): Confirms homework received and under review.
3. **Домашнє завдання прийнято куратором** (`hw_accepted`): Delivers curator comment and next lesson button.
4. **Домашнє завдання потребує доопрацювання** (`hw_needs_improvement`): Delivers curator suggestions and revision link.
5. **Відкрито доступ до нового уроку** (`lesson_unlocked` / `new_lesson_unlocked`): Dynamic lesson unlock notification with direct autologin.
6. **Нагадування про дедлайн здачі завдання** (`reminder`): Scheduled motivation and checkpoint reminder.
7. **Активація подарункового коду / призового доступу** (Webhook 7.1 & 7.2): Sequential welcome and access duration notices.
8. **Помилка: Подарунковий код уже використано** (Webhook 8): Notifies code single-use constraint.
9. **Помилка: Недійсний подарунковий код** (Webhook 9): Notifies invalid token format with support handle `@YuransiS`.
10. **Старт бота неоплаченим користувачем** (Webhook 10): Prompts payment completion or gift code input.
11. **Повернення діючого студента в бота** (Webhook 11): Welcome-back flow with 1-click autologin to dashboard.
12. **Старт бота невідомим користувачем** (Webhook 12): Guest greeting with prompt to submit gift/prize token.

---

## 💎 B&W CRM v2.0 Enrichment Protocol Specification
Все клиентские формы, серверные API и фоновые процессы синхронизации соблюдают 5 правил протокола обогащения:
1. **Валюта (`currency`)**: Строго верхний регистр (`"UAH"`, `"USD"`, `"EUR"`). Спецсимволы (`$`, `₴`, `€`) удаляются, дефолт — `"UAH"`.
2. **Сумма (`amount`)**: Число с плавающей точкой (`1490.00`, для бесплатных лидов `0.00`).
3. **Тип продукта (`product_type`)**: `"course"`, `"tripwire"`, `"subscription"`, `"consultation"`, `"lead"`.
4. **Канонические статусы (`status`)**:
   - Успешная оплата: `"closed_won"` (также распознает `"paid"`, `"approved"`, `"оплачено"`).
   - Предоплата: `"внесена предоплата"`, `"передплата"`.
   - Ожидание/новый: `"pending"`, `"new"`.
   - Отказ/ошибка: `"declined"`, `"failed"`.
   - Клик: `"Клик"`, `"КликФормы"`.
5. **Маркетинговая атрибуция и контакты**:
   - Атрибуция: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `campaign_id`, `adset_id`, `ad_id`, `fbclid`, `gclid`, cookie `_fbp` / `_fbc`, `visitor_uuid`, `page_path`, `page_url`.
   - Нормализация контактов: `phone` в формате `+380XXXXXXXXX` (E.164), `email` в `toLowerCase().trim()`, `telegram` username без `@`.

---

## 📈 Analytics & Lead Stitching Workflow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client Browser
    participant API as NextJS API
    participant DB as Supabase (victoria_leads)
    participant GAS as Google Sheets (GAS)

    User->>Browser: Visit landing page
    Browser->>Browser: Load Analytics component (init visitor_id & UTMs)
    Browser->>API: POST /api/analytics/log (path + visitorId + full attribution)
    API->>DB: Save visitor cold click session ('Клик' / 'КликФормы')

    User->>Browser: Click Pay Button (Open BookingModal)
    Browser->>Browser: Track InitiateCheckout
    
    User->>Browser: Fill & submit details form
    Browser->>API: POST /api/create-payment (leadData + visitorId)
    API->>DB: Search for previous lead with same phone
    DB-->>API: Returns earlier records (if found)
    Note over API: Stitches UUID to first record's visitor_uuid if phone exists
    API->>DB: Save full lead details with Enrichment Protocol metadata
    API->>GAS: Parallel sync lead to legacy Sheets CRM
    API-->>Browser: Return signed WayForPay payment config
    Browser->>User: Redirect to WayForPay Checkout
```

---

## ✉️ SendPulse Chatbot Integration Workflow

The VSL funnel tracks user interactions and updates contact variables in SendPulse in real time:

1. **Link Parameter**: The Telegram Bot button should direct the user to the landing page with the parameter `?sp_contact_id={{contact_id}}`.
2. **Client-side Capture**: The [Analytics.tsx](file:///c:/B&W%20Prod/B&W%20Prod/victoria-mc/src/components/Analytics.tsx) component parses this parameter and stores it in `localStorage`.
3. **Funnel Status Mapping**:
   * **State 1: `1. Зайшов на сайт`** — Set when the user lands on the page (handled via `/api/analytics/log`).
   * **State 2: `2. Подивився відео`** — Set when the video progress reaches 15 minutes or more, or is marked as `'полностью посмотрел'` (handled via `/api/video-progress`).
   * **State 3: `3. Заповнив анкету`** — Set when the user submits the questionnaire form (handled via `/api/lead`).
4. **State Persistence**: The contact ID is stored in the lead's `raw_payload` as `sp_contact_id` along with `vsl_sendpulse_stage` (1, 2, or 3) to prevent duplicate API requests.
5. **SendPulse API Helper**: The backend calls [sendpulse.ts](file:///c:/B&W%20Prod/B&W%20Prod/victoria-mc/src/lib/sendpulse.ts) to handle OAuth token caching and set the `vsl_status` variable.
