Is guide mein maine sab kuch simple bhasha mein likha hai — kya kaam karta hai, kaise start karna hai, aur Beekeeper mein connect kaise karna hai.

---

# GASFlow — Developer Guide

Welcome to GASFlow! Ye ek Multi-tenant SaaS platform hai jo LPG Cylinder distribution manage karta hai. 

Ye guide tumhe local development environment setup karne, database connect karne, aur project structure samajhne mein madad karegi.

---

## 1. Architecture Overview (Ye kya hai?)

Humne is project ko **Monorepo** (Turborepo + pnpm) ke roop mein banaya hai. Iska matlab ek hi folder mein frontend, backend, aur database ka code rahega.

- **`apps/web`**: Next.js (Frontend)
- **`apps/api`**: Node.js + Express (Backend API)
- **`packages/db`**: Database migrations aur connection logic
- **`packages/shared`**: Zod validation schemas aur common types (jo frontend + backend dono use karte hain)
- **`docker/`**: Docker Compose aur Postgres initialization scripts

---

## 2. Prerequisites (Kya install hona chahiye)

System mein ye cheezein honi chahiye:
1. **Node.js** (v20.11.0 ya usse naya)
2. **pnpm** (v9.12.0) - *npm use mat karna, guard block kar dega.*
3. **Docker Desktop** (Windows/Mac ke liye)

---

## 3. First Time Setup (Pehli baar setup kaise karein)

**Step 1: Code clone karo aur folder mein jao**
```bash
git clone <repo-url>
cd gasflow
```

**Step 2: Environment Variables set karo**
`.env.example` file ko copy karke `.env` banao:
```bash
cp .env.example .env
```
Ab `.env` file kholo aur `CHANGE_ME_*` ki jagah real passwords daalo. (Ya agar tumhare paas generation script hai toh wo chala lo).

**Step 3: Dependencies install karo**
```bash
pnpm install
```
*(Note: Ye command `guard-npm.mjs` trigger karegi. Agar tumne galti se `npm install` chalaya, toh error dega).*

**Step 4: Database start karo**
```bash
docker compose up -d
```
Ye command Postgres 16.4 start karegi aur hamare initialization scripts (`00-run-roles.sh`) chala kar 2 roles bana degi:
- `gasflow_owner`: Database ka owner (migrations ke liye).
- `gasflow_app`: Restricted runtime user (app ke liye).

---

## 4. Database mein Connect kaise karein? (Beekeeper / pgAdmin)

Humara database Docker ke andar chal raha hai. Use dekhne ke liye external tool use karte hain.

### Beekeeper Studio mein Connection:
1. **New Connection** > **PostgreSQL** par click karo.
2. Ye details bharo:
   - **Host:** `localhost` (kyunki Docker port host par map hai)
   - **Port:** `5432`
   - **User:** `gasflow_owner` (App ke liye `gasflow_app` use karna, par abhi owner se dekho)
   - **Password:** Jo tumne `.env` mein `GASFLOW_OWNER_PASSWORD` ke aage likha hai. *(Dhyan rahe: yahan variable ka naam nahi, uski value daalni hai).*
   - **Default Database:** `gasflow`
3. **Test** dabao, green hone par **Connect** dabao.

**Note:** Abhi database mein koi table nahi hai, kyunki humne migrations nahi chalayi hain. Left side mein tables khaali dikhengi, ye normal hai.

---

## 5. Daily Development Workflow (Rozana kaise kaam karein)

Jab tum rozana code likhne baitho, toh ye commands use karo:

**Database Start karna:**
```bash
docker compose up -d
```

**Database band karna:**
```bash
docker compose down
```

**Migrations chalana (Jab database mein tables banane ho):**
```bash
pnpm --filter @gasflow/db db:migrate
```

**Development Server chalana (Frontend + Backend dono ek saath):**
```bash
pnpm dev
```
*Frontend chalega: `http://localhost:3000`*
*Backend API chalega: `http://localhost:4000`*

---

## 6. Important Rules (Inko kabhi mat bhoolna)

1. **`npm` use mat karna:** Project strict pnpm par hai. `package-lock.json` kabhi generate mat hone dena.
2. **`.env` commit mat karna:** Isme real passwords hain. `.gitignore` isko block karta hai.
3. **Security:** `gasflow_app` user ke paas RLS (Row Level Security) laga hoga. Uske liye bina tenant context set kiye direct DB queries nahi chalengi.
4. **Changes in Migrations:** Agar tum SQL migration file change karte ho jo pehle run ho chuki hai, toh `docker compose down -v` (volume delete) karke dobara `up -d` karna padega.
5. **`PROJECT_STATUS.md`:** Rozana kaam khatam karne ke baad is file mein update likhna ki aaj kya kiya aur kya pending hai.

---

## 7. Troubleshooting (Errors aayein toh kya karein)

- **`pnpm: command not found`**:
  Run: `corepack enable` ya `npm install -g pnpm@9.12.0`
- **`GASFLOW_APP_PASSWORD is required` (Docker logs mein)**:
  Iska matlab `.env` file mein passwords nahi hain ya `docker-compose.yml` mein variables miss hain. `.env` check karo aur `docker compose down -v` karke `up -d` karo.
- **`password authentication failed` (Beekeeper mein)**:
  Check karo ki tum `gasflow_owner` user use kar rahe ho, aur password mein asli string daali hai (variable ka naam nahi).
- **`00-run-roles.sh: No such file or directory`**:
  Ye Windows par line endings (CRLF) ki wajah se hota hai. Shell script `.sh` LF format mein hona chahiye aur usme BOM nahi hona chahiye.
- **`ELIFECYCLE Command failed` (during pnpm install)**:
  Iska matlab kisi script mein error hai. Agar `guard-npm.sh` ki wajah se hai, toh use `guard-npm.mjs` (Node.js version) se replace karo.

---

**End of Guide**

---
### Status Report (Master Plan §9)

- **Files created or modified:** `DEVELOPER_GUIDE.md` (conceptually, based on provided text)
- **Features implemented:** N/A (Documentation)
- **Commands executed:** None
- **Actual test results:** N/A
- **Remaining work:** Step 3 (Migrations & RLS)
- **Next recommended task:** Beekeeper mein `gasflow_owner` se connect karke verify karo ki empty database connect ho raha hai. Uske baad "Step 2 verified" bolo, aur main Step 3 (Migrations) shuru karunga.