
## PART 2: Non-Functional Requirements (NFRs)

### 1. Security & Data Isolation

*   **NFR-1.1 (Multi-Tenancy / RLS):** The system must use PostgreSQL Row-Level Security (RLS) on all tenant-owned tables.
    *   The `gasflow_app` role must **never** read/write data without `app.tenant_id` set via `SET LOCAL`.
    *   Application-level queries must always go through a helper that sets the tenant context (`withTenantContext` or `withTenantPrisma`).
*   **NFR-1.2 (Password Hashing):** Passwords must never be stored in plaintext. Argon2id must be used with the specified parameters.
*   **NFR-1.3 (Rate Limiting):** Login, password reset, and OTP endpoints must be rate-limited (e.g., 5 attempts per 15 minutes per IP/email) to prevent brute force.
*   **NFR-1.4 (CSRF Protection):** All state-changing API endpoints (POST, PUT, DELETE) must require a CSRF token in headers, matching a double-submit cookie.

### 2. Financial Accuracy & Integrity

*   **NFR-2.1 (Money Representation):** All financial values must be stored as integers in **paise** (BIGINT). Floating-point arithmetic is strictly forbidden.
*   **NFR-2.2 (Atomic Transactions):** Any operation that updates multiple tables (e.g., Delivery updates stock, customer balance, and invoice) must be wrapped in a single DB transaction.
*   **NFR-2.3 (Idempotency):** Critical write operations (Delivery, Payment) must enforce idempotency using a unique `request_key` (scoped to tenant + operation) to prevent duplicate entries on network retries.
*   **NFR-2.4 (Row Locking):** Stock and custody updates must use `SELECT ... FOR UPDATE` to prevent race conditions when multiple delivery men update the same stock concurrently.

### 3. Performance & Scalability

*   **NFR-3.1 (API Latency):** Typical read APIs (e.g., Customer list, Trip details) must respond in < 200ms (p95). Write APIs (e.g., Delivery entry) must respond in < 500ms.
*   **NFR-3.2 (Concurrency):** The system must handle at least 100 concurrent delivery entries without data corruption or deadlocks.
*   **NFR-3.3 (Pagination):** All list APIs (Customers, Invoices, Audit logs) must support pagination (limit/offset) to prevent memory overload.
*   **NFR-3.4 (Caching Strategy):**
    *   **Frontend:** TanStack Query on the frontend must cache GET requests (5-minute stale time) to reduce server load.
    *   **Backend:** Heavy dashboard aggregations (Total Sales, Stock Summary) may be cached in-memory (e.g., Node-Cache) for 60 seconds.

### 4. Reliability & Availability

*   **NFR-4.1 (Offline Resilience - Phase 2):** The Delivery Man app must be able to queue delivery entries locally when the network is unavailable and sync them when connectivity is restored. Sync must respect idempotency.
*   **NFR-4.2 (Graceful Error Handling):** All errors must return a standard JSON format: `{ "error": { "code": "...", "message": "...", "details": [...] } }`. Internal stack traces must never be exposed to clients.
*   **NFR-4.3 (Database Backup):** Automated daily backups of the PostgreSQL database must be configured, with a tested restore procedure.

### 5. Maintainability & Architecture

*   **NFR-5.1 (Modular Structure):** The backend must follow a modular structure: `modules/<feature>/` containing controllers, services, and routes. Shared utilities belong in `shared/`.
*   **NFR-5.2 (DB Layer Isolation):** The API layer must never import `pg` or Prisma directly. It must use the exported helpers from `packages/db`.
*   **NFR-5.3 (Type Safety):** Strict TypeScript must be enforced across all packages. No use of `any` in production code (except for controlled exceptions with explicit comments).
*   **NFR-5.4 (API Documentation):** Every endpoint must be documented using OpenAPI/Swagger, including request/response schemas, authentication requirements, and example payloads.
*   **NFR-5.5 (Logging):** The system must emit structured JSON logs (e.g., using Pino) containing timestamp, log level, request ID, tenant ID, and user ID for every request.

---
