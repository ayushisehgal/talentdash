# TalentDash

India's career intelligence platform — structured, comparable, decision-ready salary data for tech professionals.

**Live URL:** https://talentdash-y8kp.onrender.com  
**GitHub:** https://github.com/ayushisehgal/talentdash

---

## What It Does

TalentDash is a compensation intelligence platform that answers:
- "What does a Software Engineer L4 earn at Amazon in Bengaluru?"
- "Which pays more — Google or Microsoft for an SDE-II?"
- "What is the median TC at Razorpay?"

Every answer comes from structured, normalised, deduplicated data served via a static-first architecture.

---

## Quick Start (under 5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL database (free at neon.tech)

### 1. Clone the repo
```bash
git clone https://github.com/ayushisehgal/talentdash.git
cd talentdash
npm install
```

### 2. Set up environment variables
Create a `.env` file in the root:

DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_INR_TO_USD="0.012"

### 3. Set up the database
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the development server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Pages

| Page | URL | Description |
|---|---|---|
| Homepage | `/` | Landing page with CTAs |
| Salaries | `/salaries` | Filterable salary table |
| Company | `/companies/[slug]` | Per-company compensation data |
| Compare | `/compare` | Side-by-side offer comparison |

---

## API Endpoints

### POST `/api/ingest-salary`
Ingest a new salary record with full validation and normalisation.

**Request body:**
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "level": "L4",
  "location": "Bengaluru",
  "currency": "INR",
  "experience_years": 3,
  "base_salary": 3200000,
  "bonus": 700000,
  "stock": 1200000,
  "source": "CONTRIBUTOR",
  "confidence_score": 0.95
}
```

**Validation rules:**
- `level` must be one of: L3, L4, L5, L6, SDE_I, SDE_II, SDE_III, STAFF, PRINCIPAL, IC4, IC5
- `experience_years` must be between 1 and 50
- `base_salary` must be greater than 0
- `confidence_score` must be between 0.0 and 1.0
- `total_compensation` is always recomputed server-side — never trusted from client

**Responses:**
- `201` — record created successfully
- `400` — validation error with per-field messages
- `409` — duplicate record detected within 48 hours

---

### GET `/api/salaries`
List salary records with filters and pagination.

**Query parameters:**
| Param | Type | Description |
|---|---|---|
| `company` | string | Partial match on company name |
| `role` | string | Partial match on role |
| `level` | string | Exact match, comma-separated for multiple |
| `location` | string | Partial match on location |
| `sort` | string | `total_comp_desc` (default), `total_comp_asc`, `date_desc` |
| `page` | int | Page number, default 1 |
| `limit` | int | Records per page, default 25, max 100 |

**Response:**
```json
{
  "data": [...],
  "meta": { "total": 35, "page": 1, "limit": 25, "totalPages": 2 }
}
```

---

### GET `/api/companies/:slug`
Get company data with median TC and level distribution.

**Response:**
```json
{
  "name": "Google",
  "slug": "google",
  "industry": "Technology",
  "median_total_compensation": 8400000,
  "level_distribution": { "L3": 1, "L4": 2, "L5": 2, "L6": 1 },
  "salaries": [...]
}
```

- Returns `404` for unknown slugs
- Cache-Control: `s-maxage=3600, stale-while-revalidate=86400`

---

### GET `/api/compare`
Compare two salary records side by side.

**Query parameters:** `s1` and `s2` (salary record UUIDs)

**Response:**
```json
{
  "record1": {...},
  "record2": {...},
  "delta": {
    "base_delta": 400000,
    "bonus_delta": 100000,
    "stock_delta": 200000,
    "tc_delta": 700000,
    "experience_delta": 1
  }
}
```

- Returns `400` if s1 === s2
- Returns `404` if either record not found

---

## Data Contract

Every salary record follows this exact schema:

| Field | Type | Rules |
|---|---|---|
| `company` | string | Normalised to lowercase slug |
| `role` | string | Preserved as submitted |
| `level` | enum | L3\|L4\|L5\|L6\|SDE_I\|SDE_II\|SDE_III\|STAFF\|PRINCIPAL\|IC4\|IC5 |
| `location` | string | City name only |
| `currency` | enum | INR\|USD\|GBP\|EUR |
| `experience_years` | int | 1–50 |
| `base_salary` | bigint | Annual gross in smallest unit |
| `bonus` | bigint | Defaults to 0 |
| `stock` | bigint | Defaults to 0 |
| `total_compensation` | bigint | Always computed: base + bonus + stock |
| `source` | enum | CONTRIBUTOR\|SCRAPED\|AI_INFERRED |
| `confidence_score` | float | 0.0–1.0 |

---

## Architecture Decisions

### Static vs Dynamic rendering
- `/salaries` — Server Component with `no-store` cache. Filters handled client-side via API calls. Chosen because data changes frequently and filter combinations cannot be prebuilt.
- `/companies/[slug]` — `force-dynamic` server component. Fetches from API on each request. Chosen because Render's deployment environment requires dynamic rendering for database-connected pages.
- `/compare` — `use client` with Suspense boundary. Fully interactive, URL-state driven. Chosen because selections require client-side interactivity.
- API routes — Cache-Control headers set for CDN edge caching: `s-maxage=300` for salaries (changes more often), `s-maxage=3600` for company pages (changes rarely).

### Why page-based pagination over cursor-based
Primary sort is `total_compensation` which is a non-unique column. Cursor pagination on non-unique columns causes records to be skipped or duplicated when the cursor value appears multiple times. Page-based pagination is simpler, predictable, and correct for this use case.

### Cache TTLs
- `GET /api/salaries`: `s-maxage=300, stale-while-revalidate=3600` — salary data can be slightly stale for 5 minutes, acceptable for non-realtime use
- `GET /api/companies/:slug`: `s-maxage=3600, stale-while-revalidate=86400` — company metadata changes rarely, 1 hour cache is safe

### What I would build with more time
- Typesense integration for fuzzy search and autocomplete
- Salary submission form for contributor data
- ISR revalidation triggered automatically after each ingest
- Heatmap page showing salary by role × city
- Better mobile layout with card view for small screens
- Rate limiting on the ingest endpoint

### What I cut due to time pressure
- Community / forum section
- Workplace Index scoring system
- Interview experiences section
- Email verification for contributors
- Admin moderation panel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS + inline styles |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma with migrations |
| Deployment | Render |
| Language | TypeScript (strict mode) |

---

## Database Schema

```prisma
model Company {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  normalized_name String
  industry        String?
  headquarters    String?
  founded_year    Int?
  headcount_range String?
  salaries        Salary[]
}

model Salary {
  id                 String   @id @default(uuid())
  company_id         String
  role               String
  level              Level
  location           String
  currency           Currency
  experience_years   Int
  base_salary        BigInt
  bonus              BigInt   @default(0)
  stock              BigInt   @default(0)
  total_compensation BigInt
  source             Source
  confidence_score   Decimal
  is_verified        Boolean  @default(false)
  submitted_at       DateTime @default(now())
}
```

---

## Edge Cases Handled

- Negative `base_salary` → 400 error
- Invalid level string → 400 error  
- Client-submitted `total_compensation` → stripped and recomputed
- Duplicate record within 48 hours → 409 conflict
- `GET /salaries?limit=10000` → capped at 100
- `GET /companies/nonexistent` → 404
- `GET /compare?s1=x&s2=x` → 400
- Zero bonus/stock → displays "—" not NaN
- Very large salary → formatted in lakh/crore system
- All filters applied simultaneously → works correctly
