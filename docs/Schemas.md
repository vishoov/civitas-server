# Civitas — Collection Schemas

Mongoose schema definitions for every collection described in the System Design Document and Feature Breakdown. Naming follows the one agreed convention: **camelCase fields, `*Code` for LGD references, `*Id` for ObjectId references** — never `district_id` or `distCode`.

**Collections:**

| Collection | Type | Written by |
|---|---|---|
| `states` | Reference (read-only) | Seed script |
| `districts` | Reference (read-only) | Seed script |
| `subdistricts` | Reference (read-only) | Seed script |
| `users` | Core | Auth endpoints |
| `categories` | Reference (admin-managed) | Seed / admin |
| `reports` | Core entity | Citizens + admins |
| `auditLogs` | Append-only log | Backend only |

---

## 1. `states`

Seeded from LGD/Bharatlas. Never written to at runtime.

```js
const stateSchema = new mongoose.Schema({
  stateCode: { type: String, required: true, unique: true, trim: true },
  name:      { type: String, required: true, trim: true },
  type:      { type: String, enum: ['state', 'ut'], required: true },
  isActive:  { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

stateSchema.index({ name: 1 });
```

**Notes**
- `stateCode` is the LGD state code, stored as a **String** (LGD codes can carry leading zeros — storing them as Numbers silently corrupts them).
- `isActive` supports future district/state reorganisation without deleting rows that existing reports point at.

---

## 2. `districts`

```js
const districtSchema = new mongoose.Schema({
  districtCode: { type: String, required: true, unique: true, trim: true },
  name:         { type: String, required: true, trim: true },
  stateCode:    { type: String, required: true, trim: true }, // -> states.stateCode
  isActive:     { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

districtSchema.index({ stateCode: 1, name: 1 });
```

**Notes**
- `stateCode` is a **code reference, not an ObjectId** — this is what lets `GET /districts?stateCode=X` serve the cascading picker with a single indexed lookup and no populate.
- Compound index `{ stateCode, name }` covers both the picker query and its alphabetical sort.

---

## 3. `subdistricts`

```js
const subdistrictSchema = new mongoose.Schema({
  subdistrictCode: { type: String, required: true, unique: true, trim: true },
  name:            { type: String, required: true, trim: true },
  districtCode:    { type: String, required: true, trim: true }, // -> districts.districtCode
  stateCode:       { type: String, required: true, trim: true }, // denormalized, see notes
  isActive:        { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

subdistrictSchema.index({ districtCode: 1, name: 1 });
subdistrictSchema.index({ stateCode: 1 });
```

**Notes**
- `stateCode` is deliberately denormalized here. It's reference data that effectively never changes, and carrying it avoids a two-step lookup for state-level rollups.

---

## 4. `users`

```js
const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true, maxlength: 100 },
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true,
                   match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  passwordHash:  { type: String, required: true, select: false },
  role:          { type: String, enum: ['user', 'admin'], default: 'user', required: true },
  districtCode:  { type: String, default: null }, // optional home district
  isActive:      { type: Boolean, default: true },
  schemaVersion: { type: Number, default: 1 }
}, { timestamps: true });

userSchema.index({ role: 1 });
```

**Notes**
- `select: false` on `passwordHash` means it is never returned unless explicitly asked for — the cheapest way to stop a junior-team leak through `GET /users`.
- `role` as a flat enum keeps the door open for RBAC later without a migration, as the design doc requires.
- `unique: true` on email creates the index; enforce it in code too and translate the E11000 duplicate error into a clean 409.

---

## 5. `categories`

The design doc lists tags/categories as many-to-many, cross-referenced by ID array.

```js
const categorySchema = new mongoose.Schema({
  slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  name:     { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
```

Seed values: `pothole`, `garbage`, `streetlight`, `water-supply`, `drainage`, `road-damage`, `other`.

**Notes**
- A collection rather than a hardcoded enum, so admins can add categories without a deploy. If the hackathon timeline is tight, a Mongoose `enum` on `reports.category` is an acceptable shortcut — but then the frontend dropdown must be generated from the same constant, not hand-copied.

---

## 6. `reports` — core entity

```js
const reportSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },

  // Author (reference + small denormalized display field)
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: { type: String, required: true, trim: true },

  // Location (LGD codes + small denormalized display fields)
  stateCode:       { type: String, required: true, trim: true },
  districtCode:    { type: String, required: true, trim: true },
  subdistrictCode: { type: String, default: null, trim: true },
  stateName:       { type: String, required: true, trim: true },
  districtName:    { type: String, required: true, trim: true },

  // Classification
  categoryIds: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    required: true,
    validate: [arr => arr.length > 0 && arr.length <= 5, 'Between 1 and 5 categories required']
  },

  photoUrl: { type: String, default: null, trim: true },

  // Trust pipeline
  status:     { type: String, enum: ['pending', 'verified', 'rejected', 'resolved'],
                default: 'pending', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt: { type: Date, default: null },
  resolvedAt: { type: Date, default: null },

  schemaVersion: { type: Number, default: 1 }
}, { timestamps: true });

// Primary list query: reports in a district, filtered by status, newest first
reportSchema.index({ districtCode: 1, status: 1, createdAt: -1 });
// State-level rollups and stats endpoints
reportSchema.index({ stateCode: 1, status: 1 });
// "My reports"
reportSchema.index({ userId: 1, createdAt: -1 });
```

**Notes**
- **Denormalized fields (`userName`, `stateName`, `districtName`) are display copies, never sources of truth.** Filtering and aggregation must always go through the `*Code` / `*Id` fields. Geography names effectively never change; `userName` can drift if a user renames themselves — acceptable for a hackathon, and a backfill script is the fix if it ever matters.
- The API must **derive** `stateCode`/`stateName`/`districtName` server-side from the submitted `districtCode` by looking up the reference collections — never trust the client to send them, or the denormalized copies become forgeable.
- `photoUrl` stores a URL only; binary never goes in the document (Feature Breakdown 2.7).
- Status enum resolves a discrepancy between the two docs — the System Design Document lists `pending/verified/rejected`, the Feature Breakdown lists `pending/verified/resolved`. Both are included so the verification panel and the rejection path both work. Legal transitions: `pending → verified | rejected`, `verified → resolved | rejected`. Enforce these in the service layer, not the schema.

---

## 7. `auditLogs`

Append-only. Never embedded in `reports` — it grows unbounded.

```js
const auditLogSchema = new mongoose.Schema({
  reportId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:    { type: String, enum: ['created', 'status_changed', 'updated'], required: true },
  oldStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'resolved', null],
               default: null },
  newStatus: { type: String, enum: ['pending', 'verified', 'rejected', 'resolved', null],
               default: null },
  note:      { type: String, trim: true, maxlength: 500, default: null }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

auditLogSchema.index({ reportId: 1, createdAt: -1 });
auditLogSchema.index({ changedBy: 1, createdAt: -1 });
```

**Notes**
- `updatedAt: false` — an audit entry that can be updated isn't an audit entry. Expose no update or delete route for this collection.
- Written by the backend inside the same request that changes report status (Feature Breakdown 2.5). Without transactions on the Atlas free tier, write the report update first, then the log; a missing log is recoverable, a log for a change that didn't happen is not.

---

## 8. Index Summary

| Collection | Index | Serves |
|---|---|---|
| `states` | `{ stateCode: 1 }` unique | Picker level 1, code lookup |
| `districts` | `{ districtCode: 1 }` unique, `{ stateCode: 1, name: 1 }` | Picker level 2 |
| `subdistricts` | `{ subdistrictCode: 1 }` unique, `{ districtCode: 1, name: 1 }` | Picker level 3 |
| `users` | `{ email: 1 }` unique, `{ role: 1 }` | Login, admin list |
| `categories` | `{ slug: 1 }` unique | Category dropdown |
| `reports` | `{ districtCode: 1, status: 1, createdAt: -1 }` | Feed + filters (primary) |
| `reports` | `{ stateCode: 1, status: 1 }` | `/stats/state/:code` |
| `reports` | `{ userId: 1, createdAt: -1 }` | "My reports" |
| `auditLogs` | `{ reportId: 1, createdAt: -1 }` | Report history panel |

---

## 9. Conventions

- Every core document (`users`, `reports`) carries `schemaVersion: 1`. Reference collections don't need it — they're re-seedable.
- All collections use `timestamps: true` for `createdAt` / `updatedAt`; don't hand-roll date fields.
- LGD codes are **Strings**, always. ObjectId references end in `Id`, LGD references end in `Code`.
- Validation is enforced twice: at the API boundary (`express-validator`/Joi) and in the schema. The schema is the second line of defense, not the only one.
