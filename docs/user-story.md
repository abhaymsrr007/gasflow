
---

# 📘 GASFlow — Detailed User Stories (v2.1)

## Module A: Staff & Team Management

### US-A1: Owner - Direct Add Manager/Accountant
**As an** Agency Owner, 
**I want to** directly add a Manager or Accountant by entering their details and setting a temporary password, 
**So that** they can log in immediately without waiting for an email invitation flow.

**Acceptance Criteria:**
*   **AC-1:** Owner dashboard mein "Add Team Member" button ho.
*   **AC-2:** Form mein **Name, Email, Role (Manager/Accountant)** aur **Temporary Password** ke fields hon.
*   **AC-3:** Agar email pehle se kisi user ka registered hai, toh system error de ("Email already in use").
*   **AC-4:** User create hone par, system us email par ek welcome email bheje jisme login link aur temporary password ho.
*   **AC-5:** Naya user jab pehli baar login karega, toh system usse force karega ki wo apna naya password set kare (before accessing dashboard).
*   **AC-6:** Sirf `owner` role hi ye action perform kar sakta hai. Manager ye nahi kar sakta.

### US-A2: Manager - Add Field Staff (Driver/Delivery Man)
**As a** Manager, 
**I want to** add Drivers and Delivery Men with just their Name, Phone, and a 4-digit PIN, 
**So that** they can log into the app quickly on the field without needing an email.

**Acceptance Criteria:**
*   **AC-1:** Manager dashboard mein "Add Staff" ka option ho.
*   **AC-2:** Form mein **Name, Phone Number (10 digit), Role (Driver/Delivery Man), aur 4-digit PIN** ke fields hon.
*   **AC-3:** Phone number unique hona chahiye (ek phone number se do staff nahi ban sakte).
*   **AC-4:** Staff create hone par, system us phone par ek SMS bheje: *"Aapko GASFlow par add kiya gaya hai. Aapka PIN: 1234. Login karne ke liye app kholें."*
*   **AC-5:** Staff app mein login karte waqt sirf Phone aur PIN daalega.
*   **AC-6:** Manager apne staff ko **Deactivate** kar sakta hai. Deactivate hone par staff login nahi kar payega, par uska past data safe rahega.

---

## Module B: Trip & Delivery Operations

### US-B1: Manager - Create Trip (Subah Load Karna)
**As a** Manager, 
**I want to** create a Trip by assigning a vehicle, driver, delivery man, and loading the total number of filled cylinders, 
**So that** I can track exactly how much stock left the godown.

**Acceptance Criteria:**
*   **AC-1:** Trip creation form mein **Vehicle Number, Driver (Dropdown), Delivery Man (Dropdown), aur Loaded Filled Cylinders (Number)** ke fields hon.
*   **AC-2:** Driver aur Delivery Man sirf wo log dikhein jo "Active" hain.
*   **AC-3:** Trip create hote hi ek unique **Trip ID** generate ho (e.g., TRIP-101).
*   **AC-4:** Trip create hone par godown ka stock (Stock Balances table) se `Loaded Cylinders` minus ho jaye (atomic transaction).
*   **AC-5:** Delivery Man ke app par ye trip turant dikhe.

### US-B2: Delivery Man - Delivery Entry
**As a** Delivery Man, 
**I want to** select a customer and enter the Filled Cylinders given and Empty Cylinders received, 
**So that** the customer's balance is updated immediately.

**Acceptance Criteria:**
*   **AC-1:** Delivery Man app mein apni active trip kholenga, wahan "Add Delivery" ka button ho.
*   **AC-2:** Form mein **Customer Select (Searchable list), Filled Out (Number), Empty In (Number)** ke fields hon.
*   **AC-3:** Empty In mein customer ke paas jitne empty hain usse zyada nahi daal sakte (validation).
*   **AC-4:** "Confirm" dabane par system ek atomic transaction chalaye jo Customer Balance update kare, Trip ka delivered stock update kare, aur Audit log banaye.
*   **AC-5:** Agar network fail ho jaye aur user dobara try kare, toh idempotency key ki wajah se **double entry na ho**.
*   **AC-6:** Delivery complete hone par customer ke WhatsApp par invoice/update jaye.

### US-B3: Delivery Man/Manager - End Trip (Reconciliation)
**As a** Delivery Man, 
**I want to** end the trip by entering the remaining stock in the vehicle, 
**So that** the manager can verify if the stock matches the delivery log.

**Acceptance Criteria:**
*   **AC-1:** "End Trip" button dabane par system puchega: *"Gaadi mein kitne Filled bache hain?"*
*   **AC-2:** System calculation dikhaye: `Loaded (Start) - Delivered (App) = Expected Remaining`.
*   **AC-3:** Agar entered quantity `Expected Remaining` se match nahi karti, toh system warning de ("Discrepancy found: Expected 15, Entered 12").
*   **AC-4:** Manager ko dashboard par ye discrepancy dikhe, aur wo isko "Approve" (with reason) ya "Reject" kar sake.
*   **AC-5:** Approve hone par hi stock wapas godown (Stock Balance) mein add ho.

### US-B4: Delivery Man - Customer Verification (QR/OTP)
**As a** Delivery Man, 
**I want to** scan a QR or take an OTP from the customer during delivery, 
**So that** there is proof that the customer actually received the cylinders.

**Acceptance Criteria:**
*   **AC-1:** Delivery entry screen par **"Verify via QR"** aur **"Verify via OTP"** ke options hon.
*   **AC-2:** QR scan karne par system validate kare ki QR valid hai aur usi customer ka hai.
*   **AC-3:** OTP generate hone par customer ke phone par 6-digit code jaye, jo delivery man app mein daale.
*   **AC-4:** Verify hone ke baad delivery entry complete ho. (MVP mein ye optional rahega, par audit ke liye recommended hai).

---

## Module C: Customers & Inventory

### US-C1: Delivery Man - Quick Add New Customer
**As a** Delivery Man, 
**I want to** add a new customer on the spot (just Name and Phone) when I am at a new Dhaba, 
**So that** I can deliver the cylinders without waiting for the office to add them.

**Acceptance Criteria:**
*   **AC-1:** Delivery app mein "Quick Add Customer" ka button ho.
*   **AC-2:** Form mein **Business Name, Phone Number, aur Area/Location** ke fields hon.
*   **AC-3:** Naya customer turant "Active" ho jaye taaki delivery ruk na sake.
*   **AC-4:** Manager ko dashboard par ek alert jaye: *"New customer added by [Delivery Man Name]. Please verify details."*
*   **AC-5:** Naye customer par agency ka standard rate apply ho (custom rate manager baad mein set kare).

### US-C2: Owner - Customer Custody Tracking
**As an** Owner, 
**I want to** see exactly how many Filled and Empty cylinders each customer holds, 
**So that** I can recover my assets and maintain accurate records.

**Acceptance Criteria:**
*   **AC-1:** Customer profile page par **Filled Cylinders, Empty Cylinders, aur Outstanding Balance (₹)** dikhe.
*   **AC-2:** Har delivery ke baad ye balance automatically update ho.
*   **AC-3:** Customer ledger mein har entry dikhe (Date, Delivery ID, Filled Out, Empty In, Amount).

### US-C3: Customer - WhatsApp Notification
**As a** Customer, 
**I want to** receive a WhatsApp message immediately after delivery with my updated balance and invoice, 
**So that** I trust the agency and don't need to call them for confirmation.

**Acceptance Criteria:**
*   **AC-1:** Delivery complete hone par customer ke registered WhatsApp number par message jaye.
*   **AC-2:** Message mein **Delivery Date, Filled Delivered, Empty Received, Total Bill, aur Balance Due** ho.
*   **AC-3:** Agar bill pay nahi hua, toh message mein ek **"Pay Now"** link ho.

---

## Module D: Billing & Payments

### US-D1: Delivery Man - Cash Collection
**As a** Delivery Man, 
**I want to** enter the cash collected from the customer into the app, 
**So that** the manager can reconcile the cash at the end of the day.

**Acceptance Criteria:**
*   **AC-1:** Delivery entry karte waqt "Payment Received" ka option ho.
*   **AC-2:** Delivery man **Cash** select karke amount daale.
*   **AC-3:** Agar cash full amount ka hai, toh discount rules apply hon (agar window ke andar hai).
*   **AC-4:** Agar cash partial hai, toh **koi discount apply nahi hoga**.
*   **AC-5:** Manager dashboard par "Cash Collection Report" dikhe, jisme har delivery man ka total collect kiya hua cash ho.

### US-D2: Customer - Online Payment Link
**As a** Customer, 
**I want to** receive a "Pay Now" link on WhatsApp if I don't have cash, 
**So that** I can pay via UPI or Card instantly.

**Acceptance Criteria:**
*   **AC-1:** Agar delivery man "Send Payment Link" dabata hai, toh customer ke WhatsApp par link jaye.
*   **AC-2:** Link par full invoice amount fixed ho (partial amount ka koi option nahi).
*   **AC-3:** Link ki validity **10 minutes** ho (ya jo owner ne set kiya hai).
*   **AC-4:** Payment successful hone par system webhook receive kare aur invoice ko "Paid" mark kare.
*   **AC-5:** Link expire hone ke baad discount hat jaye.

### US-D3: Owner - Early Payment Discount (Full Payment Only)
**As an** Owner, 
**I want to** offer a 1%-2% discount if the customer pays the **full amount** within 10 minutes, 
**So that** I can encourage fast payments and improve cash flow.

**Acceptance Criteria:**
*   **AC-1:** Owner settings mein "Discount Percentage" aur "Time Window" (default 10 min) set kar sake.
*   **AC-2:** Discount tabhi calculate ho jab **poora bill amount** pay ho raha ho.
*   **AC-3:** Partial payment par discount **nahi** milega (system ko explicitly check karna hoga).
*   **AC-4:** Discount ki entry audit log mein ho (Kisko mila, Kitna, Kis mode se).

### US-D4: Manager - Override VIP Customer Discount
**As a** Manager, 
**I want to** change the discount % and time window for specific VIP customers, 
**So that** big hotels and dhabas get preferential treatment.

**Acceptance Criteria:**
*   **AC-1:** Customer profile mein "Discount Settings" ka section ho.
*   **AC-2:** Manager global default (e.g., 2%, 10 min) ko override kar sake (e.g., 3%, 20 min).
*   **AC-3:** Override sirf us specific customer par apply ho, poore business par nahi.

---

## Module E: Audit & Security

### US-E1: Owner - Owner Cannot Be Deleted/Downgraded
**As a** System, 
**I must ensure** that the Owner role can never be deleted, deactivated, or have their role changed by anyone, including themselves.

**Acceptance Criteria:**
*   **AC-1:** Koi bhi API call jo Owner ko delete/downgrade karne ki koshish kare, 403 Forbidden return kare.
*   **AC-2:** Agar Owner account delete karna hi hai, toh pehle naya Owner assign karna padega (ya platform admin se contact kare).
*   **AC-3:** UI mein Owner ke row par delete/downgrade button hide ho.

### US-E2: System - Audit Logging
**As a** System, 
**I must log** every critical action (Trip start, Delivery, Payment, Discount, Staff add), 
**So that** disputes can be resolved and fraudulent activity can be tracked.

**Acceptance Criteria:**
*   **AC-1:** Har critical action ke liye `audit_logs` table mein entry ho.
*   **AC-2:** Log mein **Timestamp, User ID, Tenant ID, Action Type, IP Address, Device Info, aur Metadata (JSON)** ho.
*   **AC-3:** Audit logs sirf read-only hon, koi edit ya delete nahi kar sakta.
*   **AC-4:** Owner aur Manager dashboard se audit logs filter kar sake (Date, User, Action Type).

---
