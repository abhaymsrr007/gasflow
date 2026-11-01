---

# 🚀 GASFlow — Master Developer Guide (Final)

Welcome to **GASFlow**! Ye ek Multi-tenant SaaS platform hai jo LPG Cylinder distribution agencies ke liye banaya ja raha hai.

**Architecture Note:** Is project mein Database access ke liye **Hybrid Approach** use hota hai:
1. **Prisma ORM:** Simple CRUD (Users, Tenants, Customers, Products) aur type-safety ke liye.
2. **Native SQL (`pg` Pool):** Complex operations (Stock, Deliveries, Invoices, Payments) aur strict Row Level Security (RLS) ke liye.

---

## 1. System Prerequisites

System mein ye cheezein honi chahiye:
1. **Node.js** (v20.11.0 ya usse naya)
2. **pnpm** (v9.12.0) — *Agar global `pnpm` install nahi hai, toh har command ke aage `npx pnpm@9.12.0` use karein.*
3. **PostgreSQL** (v16 recommended) — *(Local setup ke liye)*
4. **Docker Desktop** — *(Docker setup ke liye)*

---

## 2. Initial Setup

```bash
git clone <repo-url>
cd gasflow
npx pnpm@9.12.0 install
```

### Environment Variables
`.env.example` ko copy karke `.env` banao:
```bash
cp .env.example .env
```
Ab `.env` file kholo aur saare `CHANGE_ME_*` placeholders ki jagah apne real random passwords daalo (`GASFLOW_APP_PASSWORD`, `GASFLOW_OWNER_PASSWORD`, `POSTGRES_SUPERUSER_PASSWORD`, `SESSION_SECRET`).

---

## 3. Database Setup (Do Options)

### Option A: Local Postgres Setup (Bina Docker ke)
1. PostgreSQL install karte time jo **`postgres` superuser ka password** diya tha, wo yaad rakhna.
2. Beekeeper Studio / pgAdmin kholo aur `postgres` user se connect karo.
3. Naya SQL Editor kholo aur ye script run karo (isme apne `.env` wale passwords daalna):
   ```sql
   -- gasflow_owner aur gasflow_app roles banao, gasflow database banao
   -- (Pura SQL script pichhle messages mein diya gaya hai)
   ```

### Option B: Docker Desktop Setup
```bash
docker compose up -d
```
Docker khud `00-run-roles.sh` script chala kar database aur roles bana dega.
Reset karne ke liye: `docker compose down -v && docker compose up -d`.

---

## 4. Beekeeper Studio Connection

| Field | Value |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `gasflow` |
| **User** | `gasflow_owner` (Migrations/Tables dekhne ke liye) |
| **Password** | `.env` se `GASFLOW_OWNER_PASSWORD` ki value |

*(Note: `gasflow_app` user RLS ke bina kuch nahi dikhayega. Abhi ke liye owner use karo).*

---

## 5. Detail Folder Structure (Kahan Kya Hai)

```text
gasflow/
├── apps/
│   ├── api/                      # Express Backend
│   │   ├── src/
│   │   │   ├── index.ts          # Entry point (server start)
│   │   │   ├── app.ts            # Express app setup (middleware, routes)
│   │   │   ├── middleware/       # Auth, Tenant Context, Error Handling
│   │   │   ├── routes/           # API Routes (auth, customers, etc.)
│   │   │   └── services/         # Business Logic (DB queries)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                      # Next.js Frontend
│       ├── app/                  # Next.js App Router (Pages)
│       ├── components/           # Reusable UI Components
│       ├── lib/                  # API Client & TanStack Query setup
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                       # Database Layer (Sabse Important)
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Prisma Models (Users, Customers, etc.)
│   │   ├── migrations/           # Native SQL Migrations (Tables + RLS)
│   │   │   ├── 0001_extensions_and_indexes.sql
│   │   │   ├── 0002_users_and_auth.sql
│   │   │   └── 0003_tenants_and_core.sql
│   │   ├── src/
│   │   │   ├── pool.ts           # Native pg Pool (RLS & Complex Queries)
│   │   │   ├── prisma.ts         # Prisma Client + withTenantPrisma helper
│   │   │   ├── tx.ts             # withTenantContext helper (Native SQL)
│   │   │   └── migrate.ts        # Migration Runner Script
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                   # Common Code (Frontend + Backend)
│   │   ├── src/
│   │   │   ├── schemas/          # Zod Validation Schemas
│   │   │   ├── types/            # TypeScript Types & Interfaces
│   │   │   └── constants/        # Enums, Roles, etc.
│   │   └── package.json
│   │
│   └── config/                   # Shared TS/Lint Config
│
├── tests/                        # Integration & E2E Tests
│
├── docker/                       # Docker Init Scripts
│   └── postgres/
│       └── init/
│           ├── 00-roles.sql.template
│           └── 00-run-roles.sh
│
├── scripts/                      # Helper Scripts
│   ├── guard-npm.mjs             # Blocks npm, enforces pnpm
│   └── verify-db-roles.ps1       # Verifies DB security setup
│
├── .env                          # Real Secrets (Gitignored)
├── .env.example                  # Template
├── docker-compose.yml            # Docker Setup
├── package.json                  # Root Workspace Scripts
├── pnpm-workspace.yaml           # Monorepo Config
├── turbo.json                    # Build Pipeline Config
└── README.md                     # This File
```

### Important Folders Samjhayein:
- **`packages/db/src/pool.ts`**: Native `pg` connection. Ye RLS aur complex inventory queries ke liye use hota hai. Isme `DATABASE_URL_APP` (restricted role) use hota hai.
- **`packages/db/src/prisma.ts`**: Prisma Client. Simple CRUD ke liye. Isme `withTenantPrisma` helper hai jo har Prisma query se pehle tenant context set karta hai.
- **`packages/db/src/tx.ts`**: `withTenantContext` helper. Native SQL ke liye. Ye ek transaction kholta hai aur `SET LOCAL app.tenant_id` karta hai, phir tumhari callback run karta hai.
- **`packages/db/migrations/`**: Yahan SQL files hain jo tables banati hain aur **RLS policies** lagati hain. Prisma migrations nahi use kar rahe, kyunki humein RLS aur custom roles par pura control chahiye.

---

## 6. Database Access Rules: Prisma vs Native SQL

Ye table yaad rakhna:

| Kaam | Tool | Kaunsi File Use Karein |
| :--- | :--- | :--- |
| Users, Tenants, Customers, Products ki CRUD | **Prisma** | `prisma.ts` → `withTenantPrisma` |
| Stock Movements, Deliveries, Invoices, Payments | **Native SQL** | `tx.ts` → `withTenantContext` |
| Complex JOINs, Aggregations, `FOR UPDATE` locks | **Native SQL** | `pool.ts` → `withTenantContext` |
| Simple Custom Reports | **Prisma Raw** | `prisma.ts` → `$queryRaw` (withTenantPrisma ke andar) |

### ⚠️ Sabse Badi Security Rule:
Kabhi bhi Prisma ke standard methods (`prisma.customer.findMany()`) ko direct call mat karo. Hamesha `withTenantPrisma` ke andar call karo, warna RLS (Row Level Security) apply nahi hoga aur data leak ho sakta hai.

```typescript
// ❌ GALAT (RLS bypass ho jayega)
const customers = await prisma.customer.findMany();

// ✅ SAHI
await withTenantPrisma(tenantId, userId, async (tx) => {
  return await tx.customer.findMany();
});
```

---

## 7. Daily Development Workflow

Root folder se ye commands chalao:

```bash
# 1. Dependencies install karna
npx pnpm@9.12.0 install

# 2. Prisma types generate karna (Jab schema.prisma change karo)
npx pnpm@9.12.0 --filter @gasflow/db prisma:generate

# 3. Native SQL Migrations chalana (Jab tables/policies change karo)
npx pnpm@9.12.0 db:migrate

# 4. Development Server start karna (Frontend + Backend dono)
npx pnpm@9.12.0 dev

# 5. Docker database start/stop
docker compose up -d
docker compose down
```

---

## 8. Important Rules (Security & Architecture)

1. **`npm` ya `yarn` use mat karna:** Project strictly `pnpm` par chalta hai. Guard script block kar dega.
2. **`.env` commit mat karna:** Isme saare real secrets hain.
3. **Database Connection Roles:**
   - **Migrations hamesha `gasflow_owner` se chalengi** (tables banane ke liye).
   - **App (API) hamesha `gasflow_app` se connect karegi** (runtime queries ke liye).
   - **Kabhi bhi `postgres` (root) se app connect mat karna.**
4. **RLS (Row Level Security):** Koi bhi query (Prisma ya Native) chalane se pehle `app.tenant_id` set hona chahiye.
5. **Financial Data:** Paise ka calculation hamesha Integer (BIGINT) mein hoga, float/double mein kabhi nahi.
6. **Idempotency:** Delivery/Payment complete karne se pehle request key check karo, taaki duplicate entries na ho.

---

## 9. Troubleshooting

- **`pnpm: command not found`**: `npx pnpm@9.12.0 <command>` use karo.
- **`psql: command not found` (Local setup)**: PostgreSQL ka `bin` folder System PATH mein add karo (`C:\Program Files\PostgreSQL\16\bin`).
- **`password authentication failed` (Beekeeper)**: Check karo ki tum `gasflow_owner` use kar rahe ho aur `.env` se asli password daal rahe ho.
- **`No such file or directory: 00-run-roles.sh` (Docker)**: `.sh` file LF format mein save karo (CRLF nahi), aur BOM (Byte Order Mark) remove karo.
- **Migration fail ho gayi**: `.env` mein `DATABASE_URL_OWNER` check karo. Postgres service running honi chahiye.

---

   ======= important file kis liye hai ============================
 > guard-npm.mjs	npm/yarn ko block karta hai, sirf pnpm allow karta hai 
 > turbo.json	Build pipeline manage karta hai (kaunsa kaam pehle)
 > package.json (db)	@gasflow/db package define karta hai, dependencies list karta hai
 > pool.ts	Database se connection banata hai (app + owner dono ke liye)
 > tx.ts	Transaction with tenant context - RLS ka base
 > migrate.ts	SQL files ko run karta hai, track karta hai kaunsi chali
 > 0001, 0002, 0003.sql	Tables banate hain aur RLS policies lagate hain
---









