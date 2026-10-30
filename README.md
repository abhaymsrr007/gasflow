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