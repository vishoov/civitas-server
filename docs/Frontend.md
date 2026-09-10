# Civitas — Frontend Handbook

Implementation guidance for the React client. Covers stack choices, folder structure, routing, state, every page and component, and the reasoning behind each. Companion to the System Design Document, Feature Breakdown, and Schemas.

**Assumptions made here** (the other docs don't specify them; change once, in this file, if the team disagrees):

| Decision | Choice | Why |
|---|---|---|
| Build tool | **Vite** | Instant dev server, no CRA maintenance risk; junior-friendly. |
| Routing | **react-router-dom v6** | Standard, nested-route support for the admin shell. |
| Server state | **TanStack Query** | Every screen is "fetch, cache, filter, refetch" — hand-rolled `useEffect` fetching is where junior teams leak bugs (races, stale spinners, double fetches). |
| Client state | **React Context** for auth only | Auth is the only truly global client state; everything else is server state or URL state. |
| Forms | **react-hook-form + zod** | Mirrors the backend's double validation rule (Schemas §9) on the client. |
| Styling | **Tailwind CSS** | Status colors, badges, and layout without a CSS-naming debate mid-hackathon. |
| Charts | **Recharts** | Only needed on the stats page; small and declarative. |

---

## 1. Frontend Principles

These four rules exist to protect the data model. Break them and the backend's normalization guarantees stop being worth anything.

1. **Never send display names to the API.** The client sends `districtCode` (and optionally `subdistrictCode`). The server derives `stateCode`, `stateName`, `districtName` (Schemas §6). If the client sends them, the denormalized copies become forgeable.
2. **Never free-type a location.** Every location input is the cascading picker (§5.1). No text field ever writes to a `*Code` field.
3. **Filters live in the URL, not in `useState`.** `/reports?districtCode=...&status=pending&page=2` must be shareable, back-button-safe, and reload-safe. This is also what makes TanStack Query cache keys fall out for free.
4. **Status is rendered by one component, everywhere.** `<StatusBadge/>` (§5.2) is the only place that maps a status string to a color or label. Trust is the product; it can't look different on two screens.

---

## 2. Folder Structure

Matches the `/client/src/components` path agreed in the System Design Document §4, expanded so two frontend devs don't collide.

```
client/
├─ src/
│  ├─ api/                  # One file per backend resource. No fetch() outside this folder.
│  │  ├─ client.js          # axios instance: baseURL, JWT interceptor, error normalizer
│  │  ├─ locations.js       # getStates, getDistricts, getSubdistricts
│  │  ├─ reports.js         # listReports, getReport, createReport, updateReportStatus
│  │  ├─ categories.js
│  │  ├─ stats.js
│  │  └─ auth.js
│  ├─ hooks/                # TanStack Query wrappers around api/. Components call these.
│  │  ├─ useStates.js  useDistricts.js  useSubdistricts.js
│  │  ├─ useReports.js  useReport.js  useCreateReport.js  useUpdateStatus.js
│  │  ├─ useCategories.js  useStats.js
│  │  └─ useAuth.js
│  ├─ components/
│  │  ├─ ui/                # Dumb primitives: Button, Input, Select, Card, Modal, Spinner
│  │  ├─ layout/            # Navbar, Footer, PageContainer, AdminShell
│  │  ├─ location/          # LocationPicker, LocationFilter
│  │  ├─ reports/           # ReportCard, ReportList, ReportFilters, ReportForm,
│  │  │                     # PhotoUpload, StatusBadge, StatusTimeline, StatusActions
│  │  └─ stats/             # StatCard, StatusBreakdownChart, DistrictTable
│  ├─ pages/                # One file per route. Composes components; holds no business logic.
│  ├─ routes/               # AppRoutes.jsx, ProtectedRoute.jsx, AdminRoute.jsx
│  ├─ context/AuthContext.jsx
│  ├─ constants/            # statuses.js, categories.js, config.js
│  ├─ utils/                # formatDate.js, buildQueryString.js, validators.js
│  ├─ App.jsx
│  └─ main.jsx
```

**Why this shape:** the `api/` → `hooks/` → `pages/` chain means a backend URL change touches exactly one file, and a component never knows whether data came from cache or network. `components/ui` vs `components/reports` is the split that lets one dev work on the picker while the other builds dashboards without merge conflicts (System Design Document §4).

---

## 3. Routes

| Path | Page | Access | Purpose |
|---|---|---|---|
| `/` | `HomePage` | Public | Landing + entry points; live counters for credibility. |
| `/login` | `LoginPage` | Public | JWT issue (Feature Breakdown 1.8). |
| `/signup` | `SignupPage` | Public | Account creation. |
| `/reports` | `ReportsPage` | Public | Filterable feed (1.3). |
| `/reports/:id` | `ReportDetailPage` | Public | Full record + audit trail (1.4). |
| `/report/new` | `NewReportPage` | Auth | Reporting form (1.2). |
| `/my-reports` | `MyReportsPage` | Auth | Uses the `{ userId, createdAt }` index. |
| `/stats` | `StatsPage` | Public | District/state aggregates (1.7). |
| `/admin` | `AdminDashboardPage` | Admin | Verification queue (1.6). |
| `/admin/reports/:id` | `AdminReportPage` | Admin | Single-report review + status actions. |
| `*` | `NotFoundPage` | Public | — |

**Why public reads:** the trust promise is *public* accountability. Requiring login to view reports would kill demo value. Auth gates writing; admin role gates status changes only (Feature Breakdown 2.3).

`ProtectedRoute` redirects unauthenticated users to `/login?next=<path>`. `AdminRoute` additionally checks `user.role === 'admin'` and renders a 403 page rather than redirecting — a silent redirect makes admins think the app is broken.

> **Client-side role checks are UX, not security.** The server re-checks the role on every `PATCH` (Feature Breakdown 2.3). Never treat a hidden button as a permission.

---

## 4. Pages

### 4.1 HomePage (`/`)
**Reasoning:** Judges and first-time citizens land here; it has ~5 seconds to communicate "report an issue, watch it get verified."
**Contents:** Hero with a primary "Report an Issue" CTA; three live stat tiles (total reports / verified / resolved) from `/stats`; a strip of the 6 most recent reports; a short "how verification works" three-step explainer mirroring the status colors.
**Why the live tiles:** static marketing copy proves nothing. Real counts pulled from the aggregation endpoint demonstrate the pan-India claim on the first screen.

### 4.2 NewReportPage (`/report/new`)
**Reasoning:** Highest-drop-off screen in the product (Feature Breakdown 1.2), so it is a single column, one visible section at a time, no optional fields above required ones.
**Fields, in order:** title (max 140, counter) → description (max 2000, counter) → categories (multi-select, 1–5) → photo (optional) → location picker.
**Why this order:** the picker is the slowest interaction (three network round-trips); putting it last means the user has already invested effort and won't abandon. Max lengths mirror the schema exactly (Schemas §6) so the client never allows what the server will reject.
**Submit payload — exactly this:**
```json
{ "title": "...", "description": "...", "categoryIds": ["..."],
  "photoUrl": "...", "districtCode": "...", "subdistrictCode": null }
```
No `stateName`, no `districtName`, no `userName`, no `status`. All server-derived (Principle 1).
**On success:** navigate to `/reports/:id` of the new report, not back to the feed — the citizen needs to see their own submission with its `pending` badge, which is the moment the trust pipeline becomes tangible.

### 4.3 ReportsPage (`/reports`)
**Reasoning:** Duplicate-reporting prevention and public progress tracking (1.3).
**Layout:** filter bar on top (or a left rail ≥ lg), card grid below, pagination at the bottom.
**Filters:** state → district → subdistrict (reusing the picker in "filter mode"), status multi-select, category, sort (newest / oldest).
**Why these exact filters:** they map one-to-one onto the compound index `{ districtCode, status, createdAt }` (Schemas §8). Filters the index can't serve (e.g. free-text search) are deliberately omitted for now — offering them would silently trigger collection scans.
**Empty state must be actionable:** "No pending reports in Pune district — Report one" with a CTA, never a bare "No results."

### 4.4 ReportDetailPage (`/reports/:id`)
**Reasoning:** Full context for verification and accountability (1.4).
**Contents:** photo (click to zoom), title, `StatusBadge`, category chips, full location breadcrumb (State › District › Sub-district), description, author name + submitted date, and the **status timeline** built from `GET /reports/:id/audit`.
**Why the audit trail is visible to the public:** an audit log nobody can see is indistinguishable from no audit log. This panel *is* the trust differentiator (Feature Breakdown 2.5) — it should be prominent, not collapsed behind a toggle.
**Fetch it separately** from the report (two queries, two loading states). The log is a separate collection and grows unbounded; the page must render fully before the history resolves.

### 4.5 StatsPage (`/stats`)
**Reasoning:** Demonstrates the payoff of normalized location data (1.7) — this page is literally impossible with free-text locations, so it's the strongest argument in a demo.
**Contents:** four `StatCard`s (total, pending, verified, resolved) → a state selector → a status-breakdown bar chart → a sortable district table (district, total, resolved, resolution %).
**Why a table beside the chart:** charts read well, tables are checkable. Judges will look for a real number.
**Never compute these client-side.** Call `/stats/...` (Feature Breakdown 2.6). Fetching raw reports to count them in the browser defeats the aggregation design and will not survive real volume.

### 4.6 AdminDashboardPage (`/admin`)
**Reasoning:** Without this screen "verified" is an unbacked claim (1.6).
**Layout:** queue-first — tabs for Pending / Verified / Resolved / Rejected, default **Pending**, sorted **oldest first** (a verification queue is FIFO; newest-first buries the backlog).
**Row actions:** Verify, Reject, Resolve — shown only for legal transitions (`pending → verified | rejected`, `verified → resolved | rejected`; Schemas §6). Illegal actions are not rendered, so the UI can't produce a request the service layer will refuse.
**Every action opens a confirm modal with an optional note field** feeding `auditLogs.note`. The friction is intentional: these writes are irreversible from the UI, and the note is what makes the log readable later.
**After a mutation:** invalidate the report list, that report's detail, its audit log, and `/stats`. A stale count on the admin screen is the fastest way to lose a judge's trust.

### 4.7 MyReportsPage (`/my-reports`)
**Reasoning:** A citizen's follow-up loop — "what happened to what I filed?" — is what turns a one-time reporter into a returning user.
**Contents:** the same `ReportCard` grid, filtered server-side by the authenticated user, grouped or filterable by status.

### 4.8 Login / Signup
**Reasoning:** Identity for attribution and admin gating; hackathon scope means simple (1.8).
**Behavior:** on success store the JWT (`localStorage`, key `civitas_token`) and the decoded user in `AuthContext`; redirect to `?next=` or `/`. On 401 show one inline error — never reveal whether the email exists.
**Signup collects an optional home district** via the picker, matching `users.districtCode` (Schemas §4), and pre-fills the report form's location later.

---

## 5. Key Components

### 5.1 `LocationPicker` — the most important component in the app
**Reasoning:** The System Design Document's central bet is that no location is ever free-typed (§2). This component is where that bet is enforced or lost.

**Props:** `value: { stateCode, districtCode, subdistrictCode }`, `onChange`, `required`, `showSubdistrict` (default true), `mode: 'form' | 'filter'`.

**Behavior:**
- Three dependent selects. District is disabled until a state is chosen; sub-district until a district is.
- Changing state clears district and sub-district. Changing district clears sub-district. **Never leave a stale child selection** — that's how a Maharashtra state code gets paired with a Kerala district code.
- Each level fetches on demand: `useStates()`, `useDistricts(stateCode)`, `useSubdistricts(districtCode)`, each `enabled` only when its parent code exists.
- Options are searchable (785 districts is past the point where a plain `<select>` is usable).
- Sub-district is optional; the schema allows `subdistrictCode: null`.

**Caching:** reference data effectively never changes (System Design Document §2). Set `staleTime: Infinity` and `gcTime` high. States load once per session; the picker feels instant on the second use, which matters on the highest-drop-off screen.

**Why `mode`:** in `form` mode it renders labels and validation and is required; in `filter` mode it renders compact, is fully optional, and writes to URL params instead of form state. Same fetching logic, two behaviors — one component, no duplicated cascade bugs.

### 5.2 `StatusBadge`
**Reasoning:** Status must be a persistent, obvious element, not buried text (1.5).
**Single source of truth**, `constants/statuses.js`:

| Status | Color | Label | Meaning |
|---|---|---|---|
| `pending` | amber | Pending | Submitted, awaiting review |
| `verified` | blue | Verified | Confirmed real by an admin |
| `resolved` | green | Resolved | Fixed |
| `rejected` | red / slate | Rejected | Not a valid issue |

Also carry an icon or shape per status, not color alone — colorblind users and greyscale projectors both exist, and a demo often runs on someone else's screen.
`rejected` is included because the schema has four statuses (Schemas §6) even though the Feature Breakdown lists three; a badge that renders blank for a real status is a visible bug.

### 5.3 `ReportCard`
Photo thumbnail (with a category-icon placeholder when `photoUrl` is null — a broken image reads as a broken app), title (2-line clamp), `StatusBadge`, `districtName`, relative date. The whole card is the link.
**Reads the denormalized `districtName` / `userName` straight off the report** — that is exactly what those fields exist for (Schemas §6). Never fetch the district to display its name.

### 5.4 `ReportFilters`
Owns the URL. Reads `useSearchParams`, renders `LocationFilter` + status + category + sort, and writes params back. **Resets `page` to 1 on any filter change** — page 4 of a new filter set is the classic empty-screen bug.

### 5.5 `PhotoUpload`
Single file, image types only, client-side max ~5 MB with a clear message, local preview before upload, and a remove button. Uploads as multipart to the upload endpoint (Feature Breakdown 2.7) and keeps only the returned **URL** in form state. Show a progress state — photo upload is the slowest step in reporting and silence reads as failure.

### 5.6 `StatusTimeline`
Vertical list from `auditLogs`, newest at top: actor name, `oldStatus → newStatus` rendered as two badges, timestamp (absolute on hover, relative in text), and the note. Read-only, with no edit affordance anywhere — the collection is append-only by design (Schemas §7) and the UI should say so implicitly.

### 5.7 `StatusActions`
Admin-only. Given a report, renders only the legal next transitions, opens the confirm modal, calls `useUpdateStatus`, and handles the invalidations from §4.6. Buttons are disabled while the mutation is in flight so a double-click can't emit two audit entries.

---

## 6. Data Fetching Rules

**Query keys** — always include every input that changes the result:
```js
['states']
['districts', stateCode]
['subdistricts', districtCode]
['categories']
['reports', { districtCode, status, categoryId, page, sort }]
['report', id]
['auditLogs', reportId]
['stats', { level, code }]
```

| Data | staleTime | Why |
|---|---|---|
| states / districts / subdistricts / categories | `Infinity` | Reference data; re-seeded, not edited at runtime. |
| report lists | ~30s | Fresh enough for a demo without hammering the API. |
| single report / audit log | 0 | Correctness matters most exactly where status is shown. |
| stats | ~60s | Aggregations are the most expensive endpoint. |

**Error handling:** `api/client.js` normalizes every backend error (Feature Breakdown 2.8) into `{ status, message, fields }`. A 401 clears auth and redirects to login; `fields` maps onto react-hook-form field errors so server validation surfaces next to the offending input, not in a toast.

**Loading:** skeletons for lists and cards, not full-page spinners — a layout that doesn't jump makes the app feel finished.

---

## 7. Build Order

Two frontend devs, split along the seam in System Design Document §4.

| Phase | Dev A (picker + core UI) | Dev B (lists + dashboards) |
|---|---|---|
| 1 | `ui/` primitives, layout, `api/client.js`, AuthContext, routes | Login/Signup pages, ProtectedRoute/AdminRoute |
| 2 | `LocationPicker` + location hooks | `ReportCard`, `StatusBadge`, `ReportsPage` with filters |
| 3 | `NewReportPage` + `PhotoUpload` | `ReportDetailPage` + `StatusTimeline` |
| 4 | HomePage, MyReportsPage | AdminDashboardPage + `StatusActions` |
| 5 | Polish: empty states, skeletons, responsive | StatsPage + charts |

**Why this order:** `StatusBadge` and `LocationPicker` are the two components everything else consumes; they land in phase 2 so nothing downstream is blocked. The admin panel comes before stats because the demo needs a report to actually *move* through the pipeline before any chart is worth showing.

**Unblock the frontend on day one** with a mock layer in `api/` behind a `VITE_USE_MOCKS` flag returning fixture data shaped exactly like the schemas. Neither frontend dev should wait on a live endpoint.

---

## 8. Checklist Before the Demo

- [ ] No component sends `stateName`, `districtName`, or `userName` to the API.
- [ ] No free-text input writes to a `*Code` field.
- [ ] Every filter is reflected in the URL and survives a reload.
- [ ] Changing state clears district and sub-district.
- [ ] All four statuses render a distinct badge with a non-color cue.
- [ ] Admin actions only offer legal transitions and invalidate list + detail + audit + stats.
- [ ] Every list has a designed empty state with a CTA.
- [ ] Reports with no photo render a placeholder, not a broken image.
- [ ] 401 clears the token and redirects; a stale JWT never leaves the app stuck.
- [ ] The full flow works on a phone-width screen — report, verify, resolve.
