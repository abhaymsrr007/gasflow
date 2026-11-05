
---

# 📘 Product Requirements Document (PRD)
**Product:** GASFlow SaaS (Commercial LPG Distribution Management)
**Version:** 2.0 (Detailed & Finalized for MVP)
**Target Audience:** Commercial LPG Cylinder Distribution Agencies in India
**Objective:** Ek Multi-tenant SaaS platform jo agencies ko unke staff, trips, inventory, customers, deliveries, aur cash flow ko digitally manage karne mein madad kare.

---

## 1. Problem Statement
India mein commercial LPG agencies (jo restaurants, dhabas, hotels ko 19kg aur 47.5kg cylinders deti hain) apna hisaab-kitaab abhi bhi manual (khata/Excel) par karti hain. Isse ye problems aati hain:

1.  **Cylinder Custody Tracking:** Customer ke paas kitne filled hain aur kitne empty aaye, iska record match karna mushkil hota hai. Delivery boy par poora bharosa (trust) karna padta hai.
2.  **Cash Flow & Udhaar:** Cash delivery boy collect karta hai, par manager ko shaam tak pata nahi chalta ki kitna cash aana chahiye. Udhaar (outstanding) track karna mushkil hota hai.
3.  **Naye Customers:** Naye dhabe/dhabe walon ko turant on-board karna mushkil hota hai kyunki system office mein hota hai.
4.  **Delivery Verification:** Customer ne maal liya ya nahi, uska koi digital proof nahi hota.
5.  **Multi-tenancy:** Agar ek owner ke paas 2 agencies hain, toh dono ka data mix ho jata hai.

---

## 2. Target Users (Roles)

### 2.1 System Users (Login Access)
*   **Owner:** Business ka maalik. Iske paas global settings, billing, aur reports ka access hai. Ye kisi ko bhi add/remove kar sakta hai. **Owner ko koi delete ya downgrade nahi kar sakta.**
*   **Manager:** Daily operations sambhalta hai. Ye Staff (Driver/Delivery Man) add kar sakta hai, Trips banata hai, aur naye customers verify karta hai.
*   **Accountant:** Sirf billing, invoices, payments, aur customer ledger dekhta hai.

### 2.2 Field Staff (PIN-based Access - No Email)
*   **Driver:** Gaadi chalata hai. Uska record rakha jayega taaki dispute na ho.
*   **Delivery Man:** Gaadi par maal deliver karta hai. Uske paas ek simple mobile app hoga jahan wo delivery entries karega.

### 2.3 Customer (No Login)
*   Customer ka koi login nahi hoga. Unhe delivery confirm karne ke liye **WhatsApp par invoice aur payment link** jayega. (QR/OTP verification future phase mein).

---

## 3. Key Features (MVP Scope)

### 3.1 Staff & Team Management
*   **Direct Add (No Invites):** Owner/Manager direct email aur temporary password daal kar Manager/Accountant add karega.
*   **Field Staff Add:** Manager driver/delivery man ka naam, phone, aur 4-digit PIN daal kar add karega.
*   **Role Hierarchy:** Manager naya Manager nahi add kar sakta. Owner delete nahi ho sakta.

### 3.2 Trip Management (Gaadi ka Chakkar)
*   Manager ek naya **Trip** banayega: Gaadi no, Driver, Delivery Man, aur Loaded Filled Cylinders (e.g., 60).
*   Trip start hote hi godown stock se 60 cylinders minus ho jayenge.
*   Delivery Man app se delivery entry karega.
*   **End Trip:** Delivery Man shaam ko bache hue stock ki entry karega. System verify karega ki `Start - Delivered = Remaining`. Match na hone par Manager ko alert jayega (Reconciliation).

### 3.3 Customer Management & Quick Add
*   **On-the-Spot Add:** Delivery Man app se naya dhaba/hotel add kar sakta hai (sirf Naam, Phone, Location).
*   Naya customer turant active hoga, Manager ko verify karne ka alert jayega.
*   Har customer ke paas current balance dikhega: **Filled Cylinders, Empty Cylinders, Pending Amount (₹)**.

### 3.4 Deliveries & Verification
*   Delivery Man customer select karke **Filled Out (Diye)** aur **Empty In (Wapas Liye)** daalega.
*   **Idempotency:** Network fail hone par double entry nahi hogi.
*   **Verification:** Customer ke WhatsApp par turant invoice jayegi jisme current balance hoga.

### 3.5 Billing, Payments & Discounts
*   **Cash Collection:** Delivery Man app mein cash collect karke amount enter karega.
*   **Online Payment:** Customer ke WhatsApp par "Pay Now" link jayega (UPI/Card).
*   **Early Payment Discount:**
    *   Owner global discount set karega (e.g., 2%) aur time window (default 10 minutes).
    *   Discount **sirf tab milega** jab poora bill pay hoga (Cash ya Online), 10 minute ke andar.
    *   **Partial payment par discount nahi milega.**
    *   Manager kisi VIP customer ke liye discount % aur time window badha sakta hai.

### 3.6 Dashboard & Audit
*   Dashboard par aaj ki sales, pending payments, gaadiyon ki position, aur low stock alerts dikhenge.
*   **Audit Logs:** Har action (Staff add, Trip start, Delivery, Payment, Discount) ka permanent record rahega (kisne kiya, kab kiya).

---

## 4. Out of Scope (Jo MVP mein Nahi Hai)

*   Vehicle GPS Live Tracking.
*   Employee Payroll/Salary management.
*   Tally/Bank Direct Integration.
*   Customer-facing app (Customer ka apna login).
*   Complex multi-godown routing (abhi 1 godown maan ke chal rahe hain).
*   Returnable packaging tracking (cylinder ke alawa).

---

## 5. Assumptions & Dependencies

*   **One Godown per Tenant:** MVP mein maan ke chal rahe hain ki har agency ka ek hi main godown hai jahan se gaadiyan nikalti hain.
*   **WhatsApp API:** WhatsApp invoices bhejne ke liye ek third-party provider (jaise Twilio/Meta Cloud API) par depend karenge.
*   **Payment Gateway:** Online payment link ke liye Razorpay ya UPI integration hoga.
*   **Pricing:** Agency apne customers ke liye rates khud set karegi (system default rate suggest karega).

---

## 6. Success Metrics (How we measure if MVP is successful)

1.  **Adoption:** Kya delivery man daily app use kar raha hai?
2.  **Reconciliation:** Kya gaadi ke stock ka hisaab 100% match ho raha hai?
3.  **Cash Flow:** Kya 10 minute ke discount se payments fast ho rahi hain?
4.  **Zero Dispute:** Kya customers aur agency ke beech cylinder custody par dispute kam ho raha hai?

---

**Status Report:**
*   **Documents Finalized:** PRD, FRS, NFRs, User Stories.
*   **Next Task:** Ab tumhare paas complete blueprint hai. Tum ise agencies ko dikha sakte ho. Agar wo approve karte hain, toh hum **Code Implementation (Modular Architecture - Auth & Staff Management)** shuru karenge! 🚀