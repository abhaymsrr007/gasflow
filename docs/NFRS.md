3. Non-Functional Requirements (NFRs)
NFRs batate hain ki system kitna secure, fast aur reliable hoga. (Ye Master Plan ke Section 4 se aaye hain).

3.1 Security & Isolation (Sabse important)
NFR-S1 (Tenant Isolation): Data ko database level par RLS (Row Level Security) se protect kiya jayega. Client kabhi bhi doosre tenant ka data read/write nahi kar payega, chahe wo API se request modify hi kyu na kar le.

NFR-S2 (Database Roles): Application runtime ke liye restricted role gasflow_app use karegi. Koi BYPASSRLS access nahi hoga.

NFR-S3 (Authentication): Secure HttpOnly cookies, CSRF protection, aur rate limiting (brute force se bachne ke liye) hoga.

NFR-S4 (Data Validation): Har input ko Zod schema se validate kiya jayega (Frontend + Backend dono par).

3.2 Performance & Reliability
NFR-P1 (Atomicity): Inventory aur financial transactions strictly atomic honge (ya toh poora succeed ho, ya poora rollback).

NFR-P2 (Concurrency): Do delivery boys ek hi time par same stock update karne ki koshish karein, toh row locks use honge (data corrupt nahi hoga).

NFR-P3 (Database): PostgreSQL use hoga with connection pooling. Queries parameterized hongi (SQL injection se bachne ke liye).

3.3 Architecture & Maintainability
NFR-A1 (Tech Stack): Turborepo monorepo, Next.js (Frontend), Express.js (Backend), pg (Database).

NFR-A2 (Testing): Core business logic aur cross-tenant access ke liye automated integration tests honge (Vitest + Supertest).

NFR-A3 (Logging): Structured JSON logs honge debugging ke liye.

3.4 Financial Accuracy
NFR-F1 (Precision): Paise ka calculation float mein nahi hoga. Sab kuch Integer BIGINT (paise) mein save hoga taaki 0.01 rupaye ka bhi error na aaye.

NFR-F2 (Audit): Ledger entries immutable hongi. Galti hone par reverse entry banegi, purani delete nahi hogi.
