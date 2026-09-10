# Civitas — Frontend, Backend & Database Features

A feature-by-feature breakdown covering what to build, why it's needed, and how it's used. Organized by layer (Frontend, Backend, Database) to match the MERN stack split across the 5-person team.

---

## 1. Frontend Features (React)

### 1.1 Cascading Location Picker (State → District → Sub-district)
**Reasoning:** Free-text location input causes duplicate/inconsistent data ("Mumbai" vs "mumbai" vs "Bombay"), which breaks pan-India aggregation. A structured picker forces every user into the canonical LGD hierarchy.
**Usage:** User selects state, which loads districts for that state, which loads sub-districts — each dropdown calls a backend API populated from the reference collections.

### 1.2 Issue Reporting Form
**Reasoning:** This is the core citizen-facing action; it must be low-friction (few fields, photo upload, auto-location) since drop-off is highest at first-time reporting.
**Usage:** Citizen fills title, description, category (dropdown), photo, and location (via 1.1); on submit, a new report is created with `status: pending`.

### 1.3 Report List / Feed View
**Reasoning:** Citizens and admins need to see existing reports filtered by location and status, both to avoid duplicate reporting and to track progress publicly.
**Usage:** Paginated list, filterable by district/state and status; each card shows title, photo thumbnail, status badge, and submission date.

### 1.4 Report Detail View
**Reasoning:** Full context (photo, description, location, status history) is needed for verification and public accountability, not just a summary.
**Usage:** Clicking a report opens its full record, including the audit trail (who verified/resolved it and when).

### 1.5 Status Badge / Trust Indicator
**Reasoning:** The product's core differentiator is visible trust, so status must be a persistent, obvious UI element, not buried text.
**Usage:** Color-coded badge (`pending` = yellow, `verified` = blue, `resolved` = green) shown on every card and detail view.

### 1.6 Admin Dashboard (Verification Panel)
**Reasoning:** Someone needs a way to move reports through the trust pipeline; without this, "verified" and "resolved" have no real mechanism behind them.
**Usage:** Admin/role-restricted view listing pending reports with buttons to mark verified/resolved, which writes to the audit log.

### 1.7 Aggregated Stats View (by District/State)
**Reasoning:** Demonstrates the pan-India value proposition — showing issue counts and resolution rates by region is only possible because location is normalized, not free text.
**Usage:** Dashboard charts/tables showing report counts and resolution percentage per district or state, using backend aggregation endpoints.

### 1.8 Auth Screens (Login/Signup)
**Reasoning:** Basic identity is needed to attribute reports and restrict admin actions; hackathon scope means simple, not enterprise-grade.
**Usage:** Standard email/password form issuing a JWT stored client-side, sent with subsequent API requests.

---

## 2. Backend Features (Express/Node)

### 2.1 Location Reference APIs (`/states`, `/districts`, `/subdistricts`)
**Reasoning:** The frontend's cascading picker and aggregation views both depend on serving the canonical LGD-based hierarchy; this must be a stable, read-only API layer.
**Usage:** `GET /districts?stateCode=X` returns districts for a state; consumed by the location picker and filters.

### 2.2 Report CRUD APIs
**Reasoning:** Core functionality — citizens create reports, admins/users read and update them; this is the primary data flow of the whole app.
**Usage:** `POST /reports` to create, `GET /reports` with query filters, `PATCH /reports/:id` to update status (admin-only).

### 2.3 Authentication & Authorization Middleware
**Reasoning:** Without this, anyone could mark reports as resolved or impersonate other users, breaking the trust model entirely.
**Usage:** JWT verification middleware on protected routes; a `role` check (`user` vs `admin`) gates status-change endpoints.

### 2.4 Input Validation Layer
**Reasoning:** Junior-team schemas won't catch bad data unless validation is enforced at the API boundary before it ever reaches the database.
**Usage:** Middleware (e.g., `express-validator` or Joi) checks required fields, valid enum values (category, status), and rejects malformed requests with clear errors.

### 2.5 Audit Log Write Logic
**Reasoning:** Every status change must be traceable to a specific admin and timestamp for the platform's core "trust" promise to hold up; without a log, verification is just an unverifiable claim.
**Usage:** Whenever `PATCH /reports/:id` changes status, a new document is appended to the `auditLogs` collection referencing the report, admin, old/new status, and timestamp.

### 2.6 Aggregation/Stats Endpoints
**Reasoning:** Pan-India dashboards need pre-aggregated counts, not raw report dumps, or the frontend would have to process large datasets client-side, which doesn't scale.
**Usage:** `GET /stats/district/:code` runs a MongoDB aggregation pipeline (group by status, count) and returns summarized numbers.

### 2.7 Image Upload Handling
**Reasoning:** Photo evidence is central to civic issue credibility; storing images needs a dedicated handler rather than embedding binary data in MongoDB documents.
**Usage:** Multipart form upload via `multer`, storing files either locally (hackathon scope) or to a free-tier cloud bucket, saving only the URL in the report document.

### 2.8 Error Handling & Logging Middleware
**Reasoning:** A junior team debugging a live demo needs consistent, centralized error responses instead of scattered try/catch blocks that hide root causes.
**Usage:** Global Express error-handling middleware catches thrown errors and returns consistent JSON error shapes; logs errors server-side for debugging.

---

## 3. Database Features (MongoDB)

### 3.1 Reference Collections (`states`, `districts`, `subdistricts`)
**Reasoning:** Pan-India location data must be canonical and centrally maintained, not duplicated or re-typed per report; this is what makes cross-region queries reliable.
**Usage:** Seeded once from open LGD/Bharatlas data; referenced by code (`districtCode`) from every report, never duplicated as free text.

### 3.2 Users Collection
**Reasoning:** User identity, role, and profile info change independently of reports and need their own lifecycle (e.g., password reset) separate from report data.
**Usage:** Stores `name`, `email`, `passwordHash`, `role` (`user`/`admin`); referenced by `userId` in reports, not embedded.

### 3.3 Reports Collection
**Reasoning:** This is the core entity; keeping it lean (references, not embedded blobs) keeps documents small and queries fast as volume grows.
**Usage:** Stores `title`, `description`, `category`, `photoUrl`, `districtCode`, `userId`, `status`, `createdAt`, plus small denormalized display fields (`districtName`) for fast reads without extra joins.

### 3.4 Audit Logs Collection
**Reasoning:** Status-change history must never be embedded inside the report document, since it grows unboundedly and embedding would bloat every read of a report.
**Usage:** Each status change appends one document referencing `reportId`, `changedBy`, `oldStatus`, `newStatus`, `timestamp`; queried separately when viewing a report's history.

### 3.5 Indexes on `districtCode`, `stateCode`, `status`
**Reasoning:** Without indexes, filtering reports by location or status forces a full collection scan, which becomes slow as report volume increases — the single highest-leverage performance step available to a small team.
**Usage:** Compound indexes support fast filtered queries like "all pending reports in District X," used directly by the report list and stats endpoints.

### 3.6 Schema Validation Rules
**Reasoning:** MongoDB's flexible schema is a liability for a trust-focused product unless validation rules are enforced at the database level as a second line of defense behind API validation.
**Usage:** Mongoose schema definitions with `required`, `enum` (for `status`, `category`), and type constraints reject invalid documents before they're saved.

### 3.7 Schema Version Field
**Reasoning:** A pre-revenue hackathon project may change its data model as it evolves; tracking version now avoids painful, ambiguous migrations later.
**Usage:** Every core document includes `schemaVersion: 1`; future migrations can check this field to know which documents need transformation.

---

## Summary Table

| Layer | Feature | Core Reasoning |
|---|---|---|
| Frontend | Cascading location picker | Prevents free-text location duplication |
| Frontend | Reporting form | Low-friction citizen entry point |
| Frontend | Status badge | Makes trust visible, not implicit |
| Frontend | Admin dashboard | Gives the verification pipeline a real interface |
| Backend | Location reference APIs | Serves canonical geography to frontend |
| Backend | Auth middleware | Protects trust-critical actions |
| Backend | Validation layer | Stops bad data before it's stored |
| Backend | Audit log writer | Makes every status change traceable |
| Database | Reference collections | Single source of truth for geography |
| Database | Reports collection | Lean, indexed core entity |
| Database | Audit logs | Unbounded history kept separate from core entity |
| Database | Schema validation | Second line of defense for data integrity |
