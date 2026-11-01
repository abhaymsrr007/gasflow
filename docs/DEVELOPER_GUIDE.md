# 🚀 GASFlow — Developer Guide

Welcome to **GASFlow**! Ye ek Multi-tenant SaaS platform hai jo LPG Cylinder distribution agencies ke liye banaya ja raha hai.

Ye guide do tarah ke development environments ko support karti hai:
1. **Local Postgres:** (Recommended for low-end PCs / jinke system par Docker Desktop nahi chalta).
2. **Docker Desktop:** (Recommended for Production parity, aur unke liye jinke system par Docker aaram se chalta hai).

---

## 1. System Prerequisites

System mein ye cheezein honi chahiye:
1. **Node.js** (v20.11.0 ya usse naya)
2. **pnpm** (v9.12.0) — *`npm` use mat karna, `guard-npm.mjs` block kar dega.*
3. **PostgreSQL** (v16 recommended) — *(Sirf Local setup ke liye)*
4. **Docker Desktop** — *(Sirf Docker setup ke liye)*

---

## 2. Initial Setup (Pehli baar ka Setup)

### Step 2.1: Code aur Dependencies
```bash
git clone <repo-url>
cd gasflow
pnpm install
```
*(Note: Agar koi galti se `npm install` chalayega, toh guard script use block kar dega).*

### Step 2.2: Environment Variables
`.env.example` ko copy karke `.env` banao:
```bash
cp .env.example .env
```
Ab `.env` file kholo aur saare `CHANGE_ME_*` placeholders ki jagah apne real random passwords daalo (`GASFLOW_APP_PASSWORD`, `GASFLOW_OWNER_PASSWORD`, `POSTGRES_SUPERUSER_PASSWORD`, `SESSION_SECRET`).

---

## 3. Database Setup (Do Options)

Tumhe apne hisaab se ek rasta chunna hai. Dono ka final result same hota hai: **Ek `gasflow` database jisme `gasflow_owner` aur `gasflow_app` roles bane hue hain.**

### Option A: Local Postgres Setup (Bina Docker ke)

Agar tumhare system par Docker Desktop nahi chal raha, toh native Postgres install karo.
1. PostgreSQL install karte time jo **`postgres` superuser ka password** diya tha, wo yaad rakhna.
2. Apne Beekeeper Studio / pgAdmin kholo aur `postgres` user se connect karo.
3. Ek naya SQL Editor kholo aur ye script run karo (isme apne `.env` wale passwords daalna):

```sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gasflow_owner') THEN
        CREATE ROLE gasflow_owner LOGIN PASSWORD 'YAHAN_OWNER_PASSWORD_PASTE_KAREIN';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gasflow_app') THEN
        CREATE ROLE gasflow_app LOGIN PASSWORD 'YAHAN_APP_PASSWORD_PASTE_KAREIN';
    END IF;
END
$$;

ALTER ROLE gasflow_owner NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION;
ALTER ROLE gasflow_app NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION;

CREATE DATABASE gasflow;
ALTER DATABASE gasflow OWNER TO gasflow_owner;

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE gasflow FROM PUBLIC;
GRANT CONNECT ON DATABASE gasflow TO gasflow_app;
GRANT USAGE ON SCHEMA public TO gasflow_app;
ALTER SCHEMA public OWNER TO gasflow_owner;
GRANT CREATE ON SCHEMA public TO gasflow_owner;

ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gasflow_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO gasflow_app;
```
4. **Important:** `DATABASE_URL_APP` aur `DATABASE_URL_OWNER` mein host `localhost` hi rahega.

---

### Option B: Docker Desktop Setup

Agar tumhare system par Docker chal raha hai, toh ye ekdum automatic hai.
1. Apne terminal mein ye chalao:
```bash
docker compose up -d
```
2. Bas! Docker khud `00-run-roles.sh` script chala kar database aur roles bana dega.
3. Agar kabhi database reset karna ho (saara data delete karke naya start karna ho):
```bash
docker compose down -v
docker compose up -d
```

---

## 4. Beekeeper Studio / pgAdmin se Connect Kaise Karein?

Chahe tumne Local setup kiya ho ya Docker, connection details bilkul same rahengi:

| Field | Value |
|---|---|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `gasflow` |
| **User** | `gasflow_owner` (Migrations/Tables dekhne ke liye) |
| **Password** | `.env` se `GASFLOW_OWNER_PASSWORD` ki value |

*(Note: `gasflow_app` user se bhi connect kar sakte ho, par uske paas RLS policies ke bina kuch nahi dikhega. Abhi ke liye owner use karo).*

---

## 5. Daily Development Workflow

Rozana kaam karne ka tarika dono environments mein alag hai:

### Agar Local Postgres Use Kar Rahe Ho:
1. **Database Start:** Apne Windows Services / pgAdmin se Postgres start rakho.
2. **Migrations Chalana:** `pnpm db:migrate` (Jab tables banani ho).
3. **App Start:** `pnpm dev` (Frontend `:3000`, Backend `:4000` par chalega).

### Agar Docker Use Kar Rahe Ho:
1. **Database Start:** `docker compose up -d`
2. **Migrations Chalana:** `pnpm db:migrate` (Ye command Docker container ke andar connect karegi).
3. **App Start:** `pnpm dev`
4. **Kaam khatam hone par:** `docker compose down`

---

## 6. Important Rules (Security & Architecture)

1. **`npm` use mat karna:** Project strictly `pnpm` par chalta hai.
2. **`.env` commit mat karna:** Isme saare real secrets hain.
3. **`gasflow_app` Role:** Kabhi bhi database schema change karne ke liye `gasflow_app` use mat karna. Tables banane ke liye hamesha `gasflow_owner` use hota hai.
4. **Migrations Change:** Agar koi SQL migration file change ki hai jo pehle run ho chuki hai, toh local par `docker compose down -v` (ya local db drop) karke dobara `up -d` karna padega.
5. **RLS (Row Level Security):** API banate time yaad rakhna ki `gasflow_app` role ko data dekhne ke liye har query se pehle transaction mein `SET app.tenant_id` karna zaroori hai (Step 3 mein hum iska helper banayenge).

---

## 7. Troubleshooting (Aam Samasya aur Hal)

- **`psql: command not found` (Local setup mein):**
  PostgreSQL ka `bin` folder System PATH mein add karo (`C:\Program Files\PostgreSQL\16\bin`).
- **`password authentication failed` (Beekeeper mein):**
  Check karo ki tum `postgres` (root) ki jagah `gasflow_owner` use kar rahe ho, aur password mein variables ke naam nahi, asli values daali hain.
- **`No such file or directory: 00-run-roles.sh` (Docker mein):**
  Ye Windows CRLF issue hai. Ensure karo ki `.sh` file LF format mein save ho aur usme BOM (Byte Order Mark) na ho.
- **`ELIFECYCLE Command failed` (during install):**
  Iska matlab `preinstall` script fail hui. Check karo ki `guard-npm.mjs` file exist karti hai aur `package.json` mein `preinstall` command `node scripts/guard-npm.mjs` set hai.

---
