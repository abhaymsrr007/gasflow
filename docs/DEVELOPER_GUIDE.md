# 🚀 GASFlow — Master Developer Guide

Welcome to **GASFlow**! Ye ek multi-tenant SaaS platform hai jo LPG cylinder distribution agencies ke liye banaya ja raha hai. Is guide mein project setup, modular architecture, database access rules, coding standards aur core business logic explain kiya gaya hai.

**Architecture Note:** Project mein database access ke liye **Hybrid Database Approach** use hota hai:

1. **Prisma ORM:** Simple CRUD (Users, Tenants, Customers, Staff, Products) aur type-safety ke liye.
2. **Native SQL (`pg` Pool):** Complex financial aur inventory operations (Trips, Deliveries, Stock, Invoices, Payments), row locking aur strict Row Level Security (RLS) ke liye.

> **Important:** API modules database ko directly access nahi karenge. Saara database access `packages/db` ke approved helpers ke through hoga.

---

## 1. System Prerequisites

System mein ye cheezein honi chahiye:

1. **Node.js** (v20.11.0 ya usse naya)
2. **pnpm** (v9.12.0) — Agar global `pnpm` install nahi hai, toh har command ke aage `npx pnpm@9.12.0` use karein.
3. **PostgreSQL** (v16 recommended) — Local setup ke liye.
4. **Docker Desktop** — Docker setup ke liye.

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

Ab `.env` file kholo aur saare `CHANGE_ME_*` placeholders ki jagah apne secure random secrets daalo. Existing database setup ke liye in variables ko configure karein:

- `GASFLOW_APP_PASSWORD`
- `GASFLOW_OWNER_PASSWORD`
- `POSTGRES_SUPERUSER_PASSWORD`
- `DATABASE_URL_OWNER`
- `DATABASE_URL_APP`
- `SESSION_SECRET`

Feature integrations configure karte waqt, agar enabled hon, toh ye variables bhi set karein:

- `WHATSAPP_API_KEY` — Invoice/notification delivery ke liye.
- `RAZORPAY_KEY_ID`
- `RAZORPAY_SECRET` — Online payment integration ke liye.

`.env` ko Git mein commit **kabhi nahi** karna. `.env.example` mein sirf placeholder values rakhein.

---

## 3. Database Setup (Do Options)

### Option A: Local PostgreSQL Setup (Bina Docker ke)

1. PostgreSQL install karte waqt jo `postgres` superuser ka password diya tha, use securely note karein.
2. Beekeeper Studio / pgAdmin kholo aur `postgres` user se connect karo.
3. Naya SQL Editor kholo aur project ke database-role bootstrap SQL ko run karo. Is setup mein `gasflow_owner`, `gasflow_app` roles aur `gasflow` database create/configure hote hain.
4. `.env` mein configured passwords aur connection strings verify karein.

### Option B: Docker Desktop Setup

```bash
docker compose up -d
```

Docker initialization scripts database aur required roles create karengi.

Reset karne ke liye:

```bash
docker compose down -v
docker compose up -d
```

> **Warning:** `docker compose down -v` database volumes delete karta hai. Isse local database ka data permanently remove ho sakta hai. Zaroorat aur backup confirm karke hi run karein.

---

## 4. Beekeeper Studio Connection

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `gasflow` |
| User | `gasflow_owner` (Migrations/Tables inspect karne ke liye) |
| Password | `.env` se `GASFLOW_OWNER_PASSWORD` ki value |

**Note:** `gasflow_app` runtime role restricted hai aur RLS policies ke under kaam karta hai. Database inspect/admin tasks ke liye `gasflow_owner` use karein. Application runtime ko kabhi owner ya PostgreSQL superuser credentials se connect na karein.

---

## 5. Project Folder Structure

Project **Turborepo + pnpm monorepo** hai. Backend mein feature-based **Modular Architecture** follow hoti hai. Har feature ka apna module folder hoga, jisme controller, service aur routes rahenge.

```textgasflow/
│
├── apps/
│   │
│   ├── api/                          # Express + TypeScript Backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   ├── staff/
│   │       │   ├── trips/
│   │       │   ├── deliveries/
│   │       │   ├── customers/
│   │       │   └── billing/
│   │       ├── shared/
│   │       │   ├── middlewares/
│   │       │   └── utils/
│   │       ├── routes.ts
│   │       ├── app.ts
│   │       ├── index.ts
│   │       └── swagger.ts
│   │
│   ├── web/                          # Next.js Web Application
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                       # React Native + Expo
│       ├── app/                      # Expo Router
│       │   ├── (auth)/
│       │   │   └── login.tsx
│       │   ├── (tabs)/
│       │   │   ├── index.tsx         # Home Dashboard
│       │   │   ├── trips.tsx         # My Trips
│       │   │   └── profile.tsx       # Profile
│       │   ├── trip/
│       │   │   └── [tripId].tsx
│       │   ├── delivery/
│       │   │   └── [customerId].tsx
│       │   ├── _layout.tsx
│       │   └── +not-found.tsx
│       │
│       ├── components/
│       │   ├── ui/
│       │   ├── trip/
│       │   ├── delivery/
│       │   └── common/
│       │
│       ├── services/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── auth.api.ts
│       │   │   ├── trips.api.ts
│       │   │   └── deliveries.api.ts
│       │   └── storage/
│       │       └── secure-storage.ts
│       │
│       ├── hooks/
│       ├── stores/
│       ├── types/
│       ├── constants/
│       ├── assets/
│       ├── app.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                           # Prisma + PostgreSQL
│   ├── shared/                       # Shared Zod + TypeScript
│   └── config/                       # Shared configurations
│
├── tests/
├── docker/
├── scripts/
│
├── .env
├── .env.example
├── .gitignore
├── .npmrc
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Modular Architecture Rules

1. Naya feature hamesha `apps/api/src/modules/<feature>/` ke andar banega.
2. Har module apna controller, service aur routes rakhega.
3. **Controller:** HTTP request/response handle karega; business logic yahan nahi likhenge.
4. **Service:** Business rules implement karega aur `packages/db` ke approved functions call karega.
5. **Routes:** Endpoints, middleware, request validation aur Swagger/OpenAPI documentation define karenge.
6. `routes.ts` central router mein naye module router ko mount karein. Naye feature ke liye `app.ts` ko baar-baar modify na karein.
7. Common middleware/helpers `shared/` mein rahenge. Feature-specific logic ko bina zaroorat shared folder mein na daalein.

---

## 6. Database Layer & Access Rules (`packages/db`)

Database access hamesha **DB Layer** ke through hoga. API module ke controllers/services mein direct Prisma Client ya `pg` Pool connection create/use nahi karna hai.

### Important DB files

| File | Responsibility |
|---|---|
| `packages/db/src/prisma.ts` | Prisma Client, Prisma adapter aur `withTenantPrisma()` helper |
| `packages/db/src/tx.ts` | `withTenantContext()` helper; tenant-scoped native SQL transaction |
| `packages/db/src/pool.ts` | Native PostgreSQL `pg` Pool; runtime connection role |
| `packages/db/src/migrate.ts` | SQL migration runner; executed migrations track karta hai |
| `packages/db/prisma/schema.prisma` | Prisma models aur generated types |
| `packages/db/prisma/migrations/*.sql` | Tables, indexes, constraints aur RLS policies |
| `packages/db/package.json` | `@gasflow/db` package dependencies/scripts |
| `packages/db/prisma.config.ts` | Prisma configuration (including environment loading) |
| `scripts/guard-npm.mjs` | `npm`/`yarn` ko block karke `pnpm` enforce karta hai |
| `turbo.json` | Monorepo build/task pipeline define karta hai |

### Prisma vs Native SQL

| Use case | Tool | Required access path |
|---|---|---|
| Users, Tenants, Customers, Staff, Products ka simple CRUD | Prisma | `prisma.ts` → `withTenantPrisma()` |
| Stock movements, Trips, Deliveries, Invoices, Payments | Native SQL | `tx.ts` → `withTenantContext()` |
| Complex JOINs, aggregations, `FOR UPDATE` locks | Native SQL | `pool.ts` through `withTenantContext()` |
| Simple custom reports | Prisma Raw, where suitable | `$queryRaw` inside `withTenantPrisma()` |

### RLS (Row Level Security) Rule

Bina tenant context set kiye tenant-scoped query execute nahi honi chahiye. Har tenant-scoped DB operation se pehle `app.tenant_id` transaction/session context set hona zaroori hai.

- Prisma queries ke liye `withTenantPrisma(tenantId, userId, callback)` use karein.
- Native SQL ke liye `withTenantContext(...)` use karein.
- Runtime application connection `gasflow_app` restricted role se chalegi.
- `gasflow_owner` migrations/admin inspection ke liye hai; application runtime ke liye nahi.

Example:

```typescript
// ❌ WRONG: tenant context ke bina direct Prisma query
const customers = await prisma.customer.findMany();

// ✅ RIGHT: approved tenant-scoped helper
const customers = await withTenantPrisma(tenantId, userId, async (tx) => {
  return tx.customer.findMany();
});
```

Native SQL ka example/helper signature project ke actual `withTenantContext()` implementation ke mutabik use karein; raw pool query ko tenant context ke bahar execute na karein.

---

## 7. Core Business Rules (Must Follow)

Ye rules backend/service layer par enforce hone chahiye. Frontend validation sirf user experience ke liye hai; security ya financial correctness ka source of truth backend rahega.

### 7.1 Trip & Delivery Flow

- Manager jab **Trip** create karega, toh assigned trip ke liye godown stock se cylinders issue/deduct honge.
- Delivery Man ki har **Delivery** entry `Idempotency-Key` ke saath submit hogi, taaki retry/double-click/network retry se duplicate delivery record ya stock movement na bane.
- **End Trip** par system reconciliation karega:

  `Loaded - Delivered = Remaining`

- Agar calculated remaining aur physically returned/recorded remaining match nahi karte, toh reconciliation mismatch record hoga aur Manager ko alert/exception dikhaya jayega.
- Stock deduction, delivery posting aur trip reconciliation jaise critical operations atomic database transactions mein honge.

### 7.2 Early Payment Discount (Full Payment Only)

- Discount calculation **backend** par hoga; frontend se bheja gaya discount amount/percentage trusted nahi hoga.
- Customer agar configured time window (default rule: 10 minutes) ke andar **full payable amount** pay karta hai, tabhi early-payment discount apply hoga.
- Eligible payment Cash ya Online ho sakta hai.
- Partial payment par early-payment discount **nahi** milega.
- Manager VIP customers ke liye discount percentage aur time window override/configure kar sakta hai, subject to backend validation and authorization.
- Payment, discount calculation aur invoice balance update ek consistent transaction mein process hon, taaki duplicate payment ya incorrect outstanding balance na bane.

### 7.3 Staff Management & Owner Protection

- **Manager** ko email + temporary password ke through add kiya jayega.
- **Driver/Delivery Man** ko phone number + 4-digit PIN ke through add kiya jayega.
- PIN/password ko plain text mein store nahi karna; secure hash aur appropriate authentication controls use hon.
- **Owner** ko koi user delete, deactivate, ya downgrade nahi kar sakta. Ye restriction sirf UI par nahi, API/service authorization layer par enforce honi chahiye.
- Staff create/update actions tenant boundary aur caller ke permissions ke against validate hon.

---

## 8. Daily Development Workflow

Root folder se commands run karein:

```bash

1. Dependencies Install
npx pnpm@9.12.0 install
(Jab bhi package.json mein nayi library add ho, root folder se chalao)

2. Prisma Client Generate
npx pnpm@9.12.0 --filter @gasflow/db prisma:generate
(Schema.prisma mein naya model/field add karne ke baad, root folder se chalao)

<<<<<<< HEAD
# 3. Native SQL migrations chalana (tables/indexes/RLS change ke baad)
npx pnpm@9.12.0 db:migrate    

# 4. run seed for system roles and permissions
npx pnpm@9.12.0 --filter @gasflow/db seed

# Frontend + Backend development servers start karna
npx pnpm@9.12.0 dev
=======
3. Database Migrations Run
npx pnpm@9.12.0 db:migrate
(Jab bhi migrations folder mein nayi .sql file banao, root folder se chalao)

4. Database Seed
npx pnpm@9.12.0 --filter @gasflow/db seed
(Jab database fresh reset ho ya naye permissions add karo, root folder se chalao)

5. API Server Start
npx pnpm@9.12.0 --filter @gasflow/api dev
(Backend API ko local par run karne ke liye, root folder se chalao)

6.  For mobile application start 
pnpm --filter mobile start -- --clear 


GRANT CONNECT ON DATABASE gasflow TO gasflow_app;
GRANT USAGE ON SCHEMA public TO gasflow_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gasflow_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gasflow_app;

# 7. Docker database start/stop
docker compose up -d
docker compose down
```

Prisma schema change hone par client generate karein. Table, index, constraint ya RLS policy change hone par project ka native SQL migration workflow use karein.

---

## 9. Security & Coding Standards

1. **Package manager:** `npm` ya `yarn` use mat karein. Project strictly `pnpm` use karta hai.
2. **Secrets:** `.env` commit mat karein; secrets ko logs, API responses ya source control mein expose na karein.
3. **DB roles:** Migrations `gasflow_owner` se; API runtime `gasflow_app` se connect kare.
4. **RLS:** Har tenant-scoped query se pehle correct tenant context set hona chahiye.
5. **DB isolation:** API modules direct Prisma/`pg` access na karein; `packages/db` layer use karein.
6. **Financial values:** Money ko integer `BIGINT` minor units (India mein paise) mein store/calculate karein. `float`/`double` use na karein.
7. **Idempotency:** Delivery, Payment aur Trip jaise critical write actions mein idempotency key/check enforce karein.
8. **Validation:** API request inputs ko Zod schemas se validate karein. TypeScript mein `any` avoid karein; explicit types use karein.
9. **Authorization:** Tenant isolation, role permissions aur Owner-protection rules backend par enforce karein.
10. **Transactions:** Stock, delivery, invoice aur payment ke interdependent updates ko database transaction mein rakhein.
11. **API documentation:** Har naye/modified endpoint ke Swagger/OpenAPI docs update karein.
12. **Module boundaries:** Controller thin rakhein; business rules service layer mein rakhein; reusable cross-module code hi `shared/` mein rakhein.

---

## 10. Troubleshooting

- **`pnpm: command not found`:** `npx pnpm@9.12.0 <command>` use karein.
- **`psql: command not found` (Local setup):** PostgreSQL ka `bin` folder System PATH mein add karein (Windows example: `C:\Program Files\PostgreSQL\16\bin`).
- **`password authentication failed` (Beekeeper):** Host, port, database, `gasflow_owner` username aur `.env` ka `GASFLOW_OWNER_PASSWORD` verify karein.
- **`No such file or directory: 00-run-roles.sh` (Docker):** `.sh` file LF format mein save karein (CRLF nahi) aur BOM remove karein.
- **Migration fail:** PostgreSQL service running hai ya nahi, `DATABASE_URL_OWNER` sahi hai ya nahi, aur migration SQL error check karein.
- **RLS query empty/denied:** Confirm karein ki request ka tenant ID sahi hai aur query `withTenantPrisma()` ya `withTenantContext()` ke andar execute ho rahi hai.
- **Duplicate delivery/payment:** Confirm karein ki idempotency key request ke saath aa rahi hai aur database mein uski uniqueness/deduplication enforce hai.

---

## 11. Quick Reference: Important Files

| File | Purpose |
|---|---|
| `scripts/guard-npm.mjs` | `npm`/`yarn` block karta hai; `pnpm` enforce karta hai |
| `turbo.json` | Build/task pipeline manage karta hai |
| `packages/db/package.json` | `@gasflow/db` package aur dependencies define karta hai |
| `packages/db/src/pool.ts` | Native PostgreSQL connection pool |
| `packages/db/src/prisma.ts` | Prisma Client aur `withTenantPrisma()` |
| `packages/db/src/tx.ts` | Tenant context ke saath native SQL transaction helper |
| `packages/db/src/migrate.ts` | SQL migrations run aur track karta hai |
| `packages/db/prisma/migrations/*.sql` | Tables, indexes aur RLS policies define karti hain |
| `apps/api/src/modules/*` | Feature-wise controllers, services aur routes |
| `apps/api/src/routes.ts` | Feature routers ko central API router mein mount karta hai |
| `apps/api/src/shared/` | Common middleware aur utilities |
| `packages/shared/src/schemas/` | Shared Zod schemas |
| `packages/shared/src/types/` | Shared TypeScript types |

---

**Development principle:** Har feature tenant-safe, transaction-safe, idempotent (jahan critical writes hain), validated aur documented hona chahiye. Business logic service layer mein aur database access `packages/db` ke through hi rahega.
