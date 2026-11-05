Bhai, ye raha tumhara **Detailed Functional Requirements Specification (FRS)** aur **Non-Functional Requirements (NFRs)**. Ye document developers, testers, aur architects ke liye ek "blueprint" ki tarah kaam karega. Isme har feature ka exact behaviour, API response, aur security rules likhe hain.

---

# 📘 GASFlow — Detailed Specifications

## PART 1: Functional Requirements Specification (FRS)

### Module 1: Authentication & User Management

*   **FRS-1.1 (Signup):** System must allow a user to sign up using Email, Password, and Full Name.
    *   Password must be hashed using **Argon2id** (Memory: 64MB, Time: 3 iterations, Parallelism: 1).
    *   System must check if the email already exists (case-insensitive) and return `409 Conflict` if it does.
*   **FRS-1.2 (Session Management):** Upon successful login, system must issue a secure session token.
    *   Token must be a 32-byte random string, hashed (SHA-256) and stored in the `sessions` table.
    *   The raw token must be sent to the client via an **HttpOnly, Secure (in prod), SameSite=Lax** cookie.
    *   Session must expire after 14 days of inactivity.
*   **FRS-1.3 (Role Hierarchy):** The system must enforce strict role-based access control (RBAC).
    *   `owner`: Can do everything within their tenant.
    *   `manager`: Can manage staff, customers, deliveries, and view reports. Cannot change Agency billing settings or delete the owner.
    *   `accountant`: Can view invoices, record payments, and view ledgers. Cannot modify inventory or delivery records.
    *   `driver` / `delivery_man`: Field staff with PIN-based login. Can only view assigned trips and create delivery entries.

### Module 2: Staff & Team Management

*   **FRS-2.1 (Direct Add):** Owner/Manager can add system users (Manager/Accountant) by providing Name, Email, Role, and a Temporary Password.
    *   System must force the user to change the password upon first login.
*   **FRS-2.2 (Field Staff Add):** Manager can add Driver/Delivery Man with Name, Phone (10 digits), and a 4-digit PIN.
    *   Phone numbers must be unique per tenant.
*   **FRS-2.3 (Owner Protection):** The system must **prevent** the deletion, deactivation, or role-downgrade of the `owner` user. Any attempt via API must return `403 Forbidden`.

### Module 3: Trip & Delivery Operations

*   **FRS-3.1 (Trip Creation):** Manager creates a Trip with a Vehicle, Driver ID, Delivery Man ID, and Total Loaded Filled Cylinders.
    *   System must generate a unique Trip ID.
    *   Trip creation must trigger an atomic deduction from the `stock_balances` table (decrement filled cylinders).
*   **FRS-3.2 (Delivery Entry):** Delivery Man can enter delivery details: Customer ID, Filled Out, Empty In.
    *   System must validate that `Empty In` does not exceed the customer's current empty cylinder balance (unless manager override is enabled).
    *   System must update the customer's custody (add filled, subtract empty) and the trip's delivered count.
    *   **Idempotency:** Every delivery request must include an `Idempotency-Key`. If the same key is received again, return the original response without duplicating the entry.
*   **FRS-3.3 (End Trip & Reconcile):** Delivery Man enters the remaining stock upon return.
    *   System must compute `Expected Remaining = Loaded - Delivered`.
    *   If entered quantity differs, system must flag a "Discrepancy" and prevent final stock update until Manager approval.

### Module 4: Customer Management & Custody

*   **FRS-4.1 (Quick Add):** Delivery Man can add a customer on the field using Name, Phone, and Area.
    *   Customer is instantly marked `is_active = true`.
    *   Manager receives an audit notification to verify details.
*   **FRS-4.2 (Custody Ledger):** System must maintain an immutable ledger of cylinder movements per customer.
    *   Customer's current balance (Filled/Empty) must be derived from the ledger and cached in `stock_balances`.
*   **FRS-4.3 (WhatsApp Notification):** After every delivery, system must send a WhatsApp message containing Delivery Date, Filled Delivered, Empty Received, Total Bill, and a "Pay Now" link.

### Module 5: Billing & Payments

*   **FRS-5.1 (Invoice Generation):** System must generate an invoice for every completed delivery.
    *   Invoice must include Tax (GST) calculations if applicable.
    *   Invoice number must follow a sequential format (e.g., INV-2026-001).
*   **FRS-5.2 (Cash Collection):** Delivery Man can record cash collected during delivery.
    *   If full amount is collected within the discount window, apply discount.
    *   If partial amount is collected, **no discount** is applied.
*   **FRS-5.3 (Online Payment Link):** System must generate a fixed-amount payment link (e.g., Razorpay/UPI) and send it via WhatsApp.
    *   Link must expire after the configured discount window (default 10 minutes).
    *   On successful payment webhook, system must mark invoice as `paid` and update the customer ledger.
*   **FRS-5.4 (Early Payment Discount):** System must apply a discount % only if the **full invoice amount** is paid within the configured time window (default 10 min).
    *   Partial payments must never trigger a discount.
    *   Manager can override the discount % and time window per customer.

### Module 6: Audit & System Logs

*   **FRS-6.1 (Audit Logging):** System must log the following events with Timestamp, User ID, Tenant ID, IP Address, and Metadata (JSON):
    *   User login/logout, password change.
    *   Staff added/deactivated.
    *   Trip created/ended.
    *   Delivery confirmed.
    *   Payment received (cash/online).
    *   Discount applied.
*   **FRS-6.2 (Immutable Logs):** Audit logs must be read-only. No API or user shall have permission to modify or delete them.

---
