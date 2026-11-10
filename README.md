# GASFlow SaaS

Multi-tenant SaaS for commercial LPG cylinder distribution agencies (India).

See `PROJECT_STATUS.md` for phase status and test evidence.

## Prerequisites

- Node.js >= 20.11
- pnpm >= 9 (via Corepack: `corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- Docker + Docker Compose

## Bootstrap

```bash
cp .env.example .env
# edit .env — generate SESSION_SECRET with: openssl rand -base64 48
pnpm install




gasflow/
│
├── ── ROOT (Step 1) ──────────────────────────────────────────
├── package.json                     ROOT SCRIPT RUNNER
├── pnpm-workspace.yaml              WORKSPACE DECLARATION
├── pnpm-lock.yaml                   LOCKFILE (commit karo)
├── turbo.json                       BUILD PIPELINE CONFIG
├── tsconfig.base.json               SHARED TYPESCRIPT FLAGS
├── .npmrc                           PNPM SETTINGS
├── .gitignore                       GIT EXCLUSIONS
├── .env.example                     ENV TEMPLATE (no secrets)
├── .env                             YOUR REAL ENV (gitignored)
├── README.md                        HUMAN DOCS
├── docker-compose.yml               POSTGRES SERVICE
│
├── ── DOCKER (Step 2) ───────────────────────────────────────
├── docker/
│   └── postgres/
│       └── init/
│           ├── 00-roles.sql.template    ROLES SQL (invoked by wrapper)
│           └── 00-run-roles.sh          INIT WRAPPER (missing!)
│
├── ── SCRIPTS (Step 1+2) ────────────────────────────────────
├── scripts/
│   ├── guard-npm.mjs                BLOCKS npm install
│   └── verify-db-roles.ps1          STEP 2 CHECKS
│
├── ── PACKAGES (shared code, Step 3+) ──────────────────────
├── packages/
│   │
│   ├── config/                       SHARED TS / LINT CONFIG
│   │   ├── package.json
│   │   ├── tsconfig.base.json        extends root, per-package base
│   │   ├── tsconfig.node.json        for Node apps (api)
│   │   └── eslint.config.js          shared lint rules
│   │
│   ├── shared/                       ZOD SCHEMAS + TYPES + ENUMS
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              barrel export
│   │       ├── env.ts                Zod-validated env schema
│   │       ├── roles.ts              'owner' | 'manager' | 'accountant'
│   │       ├── errors.ts             AppError class + codes
│   │       └── schemas/
│   │           ├── auth.ts           signup/login/reset Zod schemas
│   │           └── tenant.ts         tenant onboarding Zod schema
│   │
│   └── db/                           DATABASE ACCESS LAYER
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── index.ts              barrel
│       │   ├── pool.ts               pg Pool (DATABASE_URL_APP)
│       │   ├── tx.ts                 withTenantContext() helper
│       │   └── migrate.ts            migration runner (uses OWNER url)
│       └── migrations/
│           ├── 0001_extensions_and_roles.sql
│           ├── 0002_users_sessions.sql
│           ├── 0003_tenants_members.sql
│           ├── 0004_rls_policies.sql
│           ├── 0005_subscriptions_plans.sql
│           └── 0006_audit_logs.sql
│
├── ── APPS (deployable, Step 3+) ────────────────────────────
├── apps/
│   │
│   ├── api/                          EXPRESS BACKEND
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       ├── index.ts              bootstrap (listen)
│   │       ├── app.ts                express app (testable, no listen)
│   │       ├── env.ts                Zod-validated env
│   │       ├── logger.ts             structured JSON logger
│   │       ├── middleware/
│   │       │   ├── auth.ts           session cookie → req.user
│   │       │   ├── tenantContext.ts  validates membership, opens tx
│   │       │   ├── csrf.ts           double-submit cookie
│   │       │   ├── rateLimit.ts      login + reset limits
│   │       │   └── errorHandler.ts   AppError → JSON response
│   │       ├── routes/
│   │       │   ├── health.ts         GET /health (DB ping)
│   │       │   ├── auth.ts           signup/login/logout/reset
│   │       │   ├── tenants.ts        create/list/members
│   │       │   └── admin.ts          platform-admin-only suspend/activate
│   │       ├── services/
│   │       │   ├── authService.ts
│   │       │   ├── sessionService.ts
│   │       │   ├── passwordResetService.ts
│   │       │   └── tenantService.ts
│   │       └── __tests__/
│   │           ├── auth.test.ts
│   │           ├── session.test.ts
│   │           ├── tenant-isolation.test.ts
│   │           └── rls.test.ts
│   │
│   └── web/                          NEXT.JS FRONTEND
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── app/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── (auth)/
│           │   ├── login/page.tsx
│           │   ├── signup/page.tsx
│           │   └── reset/page.tsx
│           └── (app)/
│               ├── layout.tsx        tenant switcher shell
│               └── dashboard/page.tsx
│
└── ── TESTS (cross-cutting, Step 3+) ───────────────────────
└── tests/
    ├── package.json
    ├── integration/
    │   └── auth-flow.test.ts
    ├── security/
    │   ├── cross-tenant.test.ts
    │   ├── role-escalation.test.ts
    │   └── pool-context-leak.test.ts
    └── e2e/
        └── smoke.spec.ts              Playwright






-------------------------------------------------------------------------------------------------

### 1. ERD (Entity Relationship Diagram)

Humare paas 3 main layers hain: **Auth**, **Agency (Tenant)**, aur **Operations**.

```text
[ AUTH LAYER ]                                                                          ----------------
+---------------+
|     User      | (Email, Password, isActive)
+---------------+
       |
       | 1-to-Many (Ek user multiple agencies mein ho sakta hai)
       V
+-----------------+
| TenantMember    | (Role: Owner, Manager, etc.)
+-----------------+
       |                     |
       | Many-to-1           | Many-to-1
       V                     V
+-------------+       +---------------+
|   Tenant    |<------|     Role      | (System ya Custom)                             ---------------------
| (Agency)    |       +---------------+
+-------------+               |
       |                      | Many-to-Many
       |                      V
       |              +---------------+
       |              |  Permission   | (customer:view, delivery:create)
       |              +---------------+
       |
       | 1-to-Many (Agency ke paas kai customers hain)
       V
[ OPERATIONS LAYER ]                                                                  ------------------------
+----------------+
|    Customer    | (Dhaba/Hotel, Phone, Balance)
+----------------+
       ^
       | 1-to-Many (Customer ke paas kai Trips/Deliveries jayengi)
       |
+----------------+          +------------------+
|     Trip       |--------->|   Delivery       |
| (Vehicle, Load)| 1-to-Many| (Filled Out/In)  |
+----------------+          +------------------+
       |                           |
       | 1-to-Many                 | 1-to-1 (Delivery se Invoice banta hai)
       V                           V
+----------------+          +------------------+
|    Staff       |          |     Invoice      | (Total Amount, GST)
| (Driver/Deliv) |          +------------------+
+----------------+                  |
                                    | 1-to-Many
                                    V
                            +------------------+
                            |     Payment      | (Cash/Online)
                            +------------------+
```

**Summary:**
1.  Ek **User** kai **Tenants** (Agencies) se jud sakta hai (lekin ek time par ek hi active hota hai).
2.  Har **Tenant** ke paas apne **Roles** aur **Customers** honge.
3.  Ek **Trip** mein kai **Deliveries** hongi (ek gaadi ne 60 cylinder uthaye, 10 dhabo par baante).
4.  Har **Delivery** ka ek **Invoice** banega, aur us invoice ka **Payment** record hoga.

---

### 2. Core Flow Diagram - Ek Trip (Gaadi) Kaise Chalega?

Ye diagram tumhe batayega ki ek subah gaadi nikalne se lekar shaam ko wapas aane tak system mein kya hota hai.

```text
[MORNING: MANAGER]
1. Manager naya Trip banata hai.
   -> Vehicle No: MH-12-1234
   -> Driver: Ramesh
   -> Delivery Man: Suresh
   -> Total Loaded: 60 Cylinders
   |
   v
[SYSTEM]
2. Trip Database mein 'active' save hota hai.
   -> Godown Stock: 60 minus ho jate hain.
   |
   v
[DAYTIME: DELIVERY MAN (Mobile App)]
3. Delivery Man apni Trip kholta hai.
   |
   +---> Customer A (Sharma Hotel): 4 Filled diye, 3 Empty liye.
   |     -> Payment: ₹4000 Cash diya.
   |     -> System check karta hai: 10 min timer (Discount applicable).
   |
   +---> Customer B (New Dhaba): 2 Filled diye, 0 Empty liye.
   |     -> (Quick Add Customer karke delivery ki).
   |     -> Payment: Udhaar (Pending).
   |
   +---> Customer C (Patel Restaurant): 5 Filled diye, 5 Empty liye.
         -> Online Payment link WhatsApp par bheja.
   |
   v
[EVENING: DELIVERY MAN]
4. Trip End karta hai.
   -> Input: "Gaadi mein 12 Filled bache hain."
   |
   v
[SYSTEM + MANAGER]
5. System calculation:
   -> Loaded (60) - Delivered (45) = 15 Expected.
   -> Actual Remaining: 12.
   -> ❌ Discrepancy Alert! (3 cylinders missing).
   |
   v
6. Manager alert dekhta hai aur reconciliation karta hai.
```

---

### 3. System Architecture Flow (Kaun Kisko Call Karega?)

Jab tum code likhoge, toh API kaise kaam karegi, ye samajhna zaroori hai:

```text
[FRONTEND (Next.js / React)]
       |
       | (API Call via TanStack Query)
       | Headers: { Authorization: Bearer <Token>, X-Tenant-Id: <Tenant> }
       V
[API GATEWAY (Express Routes)]
       |
       | (1. requireAuth Middleware -> JWT Verify)
       | (2. authorize Middleware -> Check Permissions in DB)
       V
[CONTROLLER (HTTP Request/Response)]
       |
       | (Zod Validation - DTOs)
       V
[SERVICE LAYER (Business Logic)]
       |
       | (Custom rules, e.g., Early Payment Discount, Trip Reconcile)
       V
[DATABASE LAYER (packages/db)]
       |
       | (Prisma Client with Adapter + Native pg for Complex)
       V
[POSTGRESQL]
       |
       | (RLS Enforced: SET LOCAL app.tenant_id = '...')
       V
```

---
