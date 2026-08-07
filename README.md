# Job Application Tracker

A personal Chrome extension for tracking job applications. Save applications from any job posting via a popup form, then review activity on a full-page dashboard backed by Supabase.

## Setup

From a fresh clone on a new machine:

```bash
npm install
```

Create a `.env` file in the project root with your Supabase credentials (from **Project Settings → API** in the Supabase dashboard):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Use the project URL (no `/rest/v1/` suffix).

Build the extension:

```bash
npm run build
```

Load it in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### Reload after code changes

Chrome does not hot-reload extension popups or the dashboard. After every change:

```bash
npm run build
```

Then click the **refresh** icon on the extension card in `chrome://extensions`. Re-open the popup or refresh the dashboard tab if it was already open.

## Database schema

There are no SQL migrations in this repo; the schema below is taken from the TypeScript types and Supabase queries used in the codebase.

### `applications`

| Column | Type (inferred) | Notes |
|--------|-----------------|-------|
| `id` | `uuid` | Primary key |
| `company` | `text` | Nullable |
| `job_title` | `text` | Nullable |
| `url` | `text` | Nullable; normalized on save (host lowercased, trailing path slash stripped) |
| `source` | `text` | Nullable; hostname derived from URL on insert |
| `applied_date` | `date` | Nullable; `YYYY-MM-DD` |
| `applied_time` | `text` or `time` | Selected for duplicate checks; not set by the popup |
| `applied_timestamp` | `timestamptz` | Defaults to `now()` on insert; popup does not send this field |
| `status` | `text` | Popup sets `'applied'` on insert |
| `cv_used` | `text` | Nullable |
| `effort_level` | `text` | Nullable; `low`, `medium`, or `high` |

### `interviews`

| Column | Type (inferred) | Notes |
|--------|-----------------|-------|
| `id` | `uuid` | Primary key |
| `application_id` | `uuid` | Foreign key → `applications.id` |
| `interview_stage` | `text` | Nullable (e.g. phone screen, technical round) |
| `interviewer_name` | `text` | Nullable |
| `interview_date` | `date` | Nullable; `YYYY-MM-DD` |
| `interview_type` | `text` | Nullable (e.g. phone, video, on-site) |
| `is_positive` | `boolean` | Nullable; `true` = successful, `false` = unsuccessful, `null` = pending |
| `notes` | `text` | Nullable |

The dashboard also reads a `recruiter_outreach` table (outreach logging and response counts) but that table is not part of the schema documented above.

## Features

- **Popup capture form** — save company, job title, URL, applied date, CV used, and effort level from the active tab
- **Tab autofill** — URL and page title parsed automatically; hostname stored as source
- **LinkedIn autofill** — on `linkedin.com/jobs/*`, company and job title are read from the page DOM via a content script
- **Duplicate URL detection** — warns if the same job URL was already saved (normalized comparison)
- **Dashboard** — scorecards, applications-per-day chart, CV breakdown, source breakdown, GitHub-style activity heatmap, and date-range filters (last 7 days, last month, all time, custom)
- **Applications table** — search, pagination, and per-row interview management
- **Interview tracking** — add, edit, and delete interview rounds per application; upcoming interviews in “Next events”
- **Recruiter outreach** — log outreach from the dashboard; response counts appear on scorecards

## Tech stack

- **Vite** — build tooling
- **React** + **TypeScript**
- **@crxjs/vite-plugin** — Chrome extension bundling
- **Supabase** (`@supabase/supabase-js`) — database and API
- **Recharts** — dashboard charts
- **Tailwind CSS** — styling
- **date-fns**, **react-day-picker**, **lucide-react** — dates and icons
- **Vitest** — unit tests for pure data logic

## Running tests

```bash
npm run test
```

Watch mode: `npm run test:watch`

Tests cover streak calculation, date-range filtering, duplicate URL normalization, averages, and weekday stats in `src/lib/` — not UI or live Supabase calls.

## Known limitations

- Personal single-user tool; not published to the Chrome Web Store
- LinkedIn autofill depends on specific DOM selectors (`job-details-jobs-unified-top-card__job-title`, `job-details-jobs-unified-top-card__company-name`) and may break if LinkedIn changes their job page layout
- Duplicate detection compares normalized URLs in the client; older rows saved before normalization may not match unless URLs were stored consistently
- Extension popups have a fixed max height (~600px); the date picker calendar can be clipped near the bottom of the popup
- No migrations or seed scripts in this repo — schema lives in Supabase only
