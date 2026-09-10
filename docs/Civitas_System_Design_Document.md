# Civitas — System Design Document

**Project type:** Hackathon project (pre-revenue, future scaling potential)
**Stack:** MERN (MongoDB, Express, React, Node.js)
**Team:** 5 people, junior level
**Scope:** Pan-India design, built for future trust and normalization

---

## 1. Design Philosophy

Since this is a hackathon project with no revenue yet, the priority is **correctness and demoability now**, with **cheap evolution later**. The two things that matter most from day one:

1. A reliable, canonical pan-India location reference (not free-text city/state strings).
2. Normalized, validated data so trust isn't assumed — it's enforced by schema.

Everything else — caching, sharding, microservices, complex auth — can wait until there's real usage or funding.

---

## 2. Pan-India Location Reference Layer

India's administrative hierarchy should be treated as a **read-only reference dataset**, not something the team invents or lets users free-type.

- Use **Local Government Directory (LGD) codes**, the official Government of India dataset giving a canonical State → District → Sub-district/Taluk → Village/Town hierarchy with stable codes.
- Open mirrors like Bharatlas replicate this: 36 states/UTs, 785 districts, and tehsil/taluka layers, all joined by LGD codes.
- Survey of India also publishes an authoritative administrative boundary database down to taluk level with headquarters.

**Model as three small reference collections:**

- `states` — LGD state code, name
- `districts` — LGD district code, name, parent state code
- `subdistricts` — LGD sub-district code, name, parent district code

Every user-facing record (business, report, listing, complaint — whatever Civitas's core entity is) stores only a `districtCode` (or lowest known level) — never a free-text "state" or "city" field. This single decision prevents "Mumbai" / "mumbai" / "Bombay" style duplication and makes pan-India queries reliable.

---

## 3. Normalized Schema Design

MongoDB doesn't force normalization, but for trustworthy data, normalize core entities and denormalize only deliberately for read speed.

| Collection | Relationship type | Design choice | Why |
|---|---|---|---|
| States / Districts / Subdistricts | Reference data, rarely changes | Separate collections, referenced by code | Avoids duplicating India's geography in every record |
| Users | One-to-many with their content | Own collection, referenced by ID elsewhere | Independent access pattern, changes often |
| Core entity (posts/listings/reports) | Many-to-one with location, many-to-one with user | Store `userId` and `districtCode` as references; embed small display fields like `userName`, `districtName` for fast reads | Balances write-integrity with read speed |
| Tags / Categories | Many-to-many | Cross-referenced by ID array | Standard MongoDB many-to-many pattern |
| Audit / Verification log | One-to-many, append-only, grows large | Separate collection, never embedded | Keeps parent documents small and arrays bounded |

**Implementation notes (Mongoose):**

- Define strict schemas with required fields, enums, and validators — this is what actually keeps junior-team data trustworthy, since MongoDB won't stop bad data unless the schema does.
- Add a `status` field (`pending`, `verified`, `rejected`) on user-submitted records, plus `verifiedBy` / `verifiedAt`, so trust is explicit and auditable.
- Index `districtCode`, `stateCode`, and any frequently filtered/sorted field — the single highest-leverage performance step for a small team, avoiding slow collection scans as data grows.
- Rule of thumb: **embed** data that's small, read together, and changes rarely (e.g., a district name for display); **reference** data that's large, changes often, or needs independent querying (users, verification logs).

---

## 4. Team Structure (5 People, Junior Level)

Split ownership so no one blocks anyone else:

- **1 person — Data/DB layer**: owns MongoDB schemas, seeds pan-India reference collections from LGD/Bharatlas data, writes validation logic. Most critical role — bad schema decisions here cascade everywhere.
- **2 people — Backend (Express/Node)**: one on core CRUD + auth, one on location-filtering and search/aggregation endpoints (state → district → subdistrict drilldown).
- **2 people — Frontend (React)**: one on the pan-India location picker (cascading dropdowns) and core UI, one on dashboards/lists and the future admin/verification views.

Use a single shared Git repo with a documented folder structure (`/models`, `/routes`, `/controllers`, `/client/src/components`), and agree on **one naming convention** for fields (always `districtCode`, never mixing `district_id` / `distCode`). Inconsistent naming is the most common way junior teams accidentally corrupt normalization without realizing it.

---

## 5. Building for a Future, Unpaid-So-Far Project

Since there's no revenue yet but the project may scale later, avoid decisions that are expensive to undo:

- Keep **reference data separate from app logic** so swapping in a live government LGD API later doesn't require a schema change.
- Use **MongoDB Atlas's free tier** now; its upgrade path (replica sets, sharding) requires no redesign if concerns are already separated properly.
- Add a lightweight `schemaVersion` field (e.g., `schemaVersion: 1`) on core documents — a low-effort habit now that avoids painful migrations once there are real users.
- Since nobody pays yet, skip complex auth (OAuth, tiered RBAC) — use simple JWT plus a `role` field (`user` / `admin`) that can be extended later without migration.

---

## 6. Summary

This design gives Civitas a demo-ready pan-India MERN architecture for the hackathon, while keeping the data foundation trustworthy and normalized enough to support real growth if the project moves beyond hackathon stage.
