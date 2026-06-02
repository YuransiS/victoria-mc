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
*   **CRM & Legacy Sync:** Google Sheets (Google Apps Script API)
*   **Notifications:** Telegram Bot API

---

## 📂 File Map & Routing Structure

### 🛣️ App Router Routes (`src/app/`)
*   `layout.tsx` — Root layout initialized with global styles, fonts, and the visitor analytics logger.
*   `page.tsx` — Core landing page.
*   `price/` — Price selection and package landing page.
*   `price/thanks/` — Thanks/success confirmation page after checkout.
*   `price/fail/` — Payment failure handling page.
*   `practicum/` — Dedicated masterclass practicum page.
*   `practicum/thanks/` — Thanks/success page for the practicum.
*   `practicum/fail/` — Failure page for the practicum.
*   `free-lection/` — VSL funnel start landing page.
*   `free-lection/vsl-form/` — VSL Step 2 form questionnaire.
*   `rozbir/` — Personal video breakdown offer page.
*   `checkout/` — Dynamic checkout client page.
*   `admin/` — CRM Dashboard area with Role-Based Access Control (RBAC).

### 🌐 API Endpoints (`src/app/api/`)
*   `api/lead/` — Primary leads registration proxy. Submits leads in parallel to Google Sheets CRM (Unified Sheets + Stvoryui) and Telegram, and registers the customer inside Supabase (`victoria_leads`) with visitor stitching. Now omits individual Telegram notifications for VSL Stage 1 leads.
*   `api/create-payment/` — Initiate checkout route. Registers pending payments in Google Sheets, starts Telegram payment alerts, and persists the lead details into Supabase (`victoria_leads`). Returns signed WayForPay configuration.
*   `api/payment-callback/` — [NEW] Webhook target invoked by WayForPay to confirm transaction status. Syncs status updates back to Supabase (`victoria_leads`) and Google Sheets CRM.
*   `api/leads/` — Secondary CRM status synchronization proxy. Updates Telegram messages and Google Sheets when users reach thanks/fail landing pages or manually update states.
*   `api/analytics/log/` — Traffic tracking telemetry receiver. Logs page views (`Клик`) and form modal actions directly in Supabase (`victoria_leads`).
*   `api/video-progress/` — [NEW] Video watching progress tracking receiver. Logs played status, watch seconds, and updates lead status to `'полностью посмотрел'` once 20 minutes are reached.
*   `api/country/` — [NEW] Vercel Edge API endpoint that extracts `x-vercel-ip-country` from incoming CDN headers to resolve user country instantly on mount.
*   `api/cron/vsl-report/` — [NEW] Analytical cron route.
    *   **Daily:** Runs at 9:00 AM Kyiv time (`0 6 * * *` UTC) with 24-hour period.
    *   **Weekly:** Runs on Mondays at 10:00 AM Kyiv time (`0 7 * * 1` UTC) when `?type=weekly` is specified, reporting over a 7-day period.
    Aggregates `/free-lection` registration counts, performs visitor stitching for Step 2 conversions, identifies the best source, and sends a styled summary report to Telegram.

### 🧩 UI Components (`src/components/`)
*   `Form.tsx` — Core registration form component.
*   `Analytics.tsx` — Client-side React tracking component. Generates a secure `visitor_id`, extracts UTM parameters, and logs telemetric sessions on load.
*   `pricing/BookingModal.tsx` — Premium checkout modal. Triggers payment generation and redirects user to WayForPay. Uses `react-phone-number-input` for exact international numbers with Edge CDN geo-detection.
*   `practicum/PracticumHeroForm.tsx` — Practicum subscription form.

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

### 🔗 B&W Analytics Sync (Единая сквозная аналитика)
Вся таблица `victoria_leads` находится под постоянным наблюдением авто-триггера **`trg_sync_victoria_lead`** на стороне Supabase. 
При любой вставке (INSERT) в `victoria_leads` данные автоматически обрабатываются триггером на уровне БД и реплицируются в централизованные таблицы сквозной аналитики под идентификатором проекта Victoria (`b526cfcf-2856-43b9-a299-65239e0f6c27`):
*   **`unified_customers`** — таблица уникальных профилей. Триггер проверяет уникальность телефона/email/telegram строго внутри проекта Victoria, дедуплицируя контакты и предотвращая перезапись данных других экспертов холдинга.
*   **`unified_orders`** — таблица лид-событий/заказов. Каждое действие, заявка или оплата регистрируется в виде **новой строки** со своими UTM-метками, суммами и рекламными ID (`campaign_id`, `ad_id`), сохраняя полную когортную историю и точный расчет LTV.
*   **Бесшовность:** Исключает необходимость доработки или изменения серверного API-кода самого приложения Victoria.

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
    Browser->>API: POST /api/analytics/log (path + visitorId)
    API->>DB: Save visitor cold click session ('Клик')

    User->>Browser: Click Pay Button (Open BookingModal)
    Browser->>Browser: Track InitiateCheckout
    
    User->>Browser: Fill & submit details form
    Browser->>API: POST /api/create-payment (leadData + visitorId)
    API->>DB: Search for previous lead with same phone
    DB-->>API: Returns earlier records (if found)
    Note over API: Stitches UUID to first record's visitor_uuid if phone exists
    API->>DB: Save full lead details (stitching UUID)
    API->>GAS: Parallel sync lead to legacy Sheets CRM
    API-->>Browser: Return signed WayForPay payment config
    Browser->>User: Redirect to WayForPay Checkout
```
