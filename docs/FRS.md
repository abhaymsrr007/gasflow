2. Functional Requirements Specification (FRS)
FRS batata hai ki system exactly kya karega (Functionality). Ye Master Plan ke phases (Phase 1 to 6) se link hote hain.

2.1 Module A: SaaS Administration
FR-A1: System ek naya Tenant (Agency) onboard kar sakna chahiye.

FR-A2: Platform Admin kisi bhi Agency ko suspend ya activate kar sakta hai.

FR-A3: Subscription plans aur unki expiry dates track honi chahiye.

2.2 Module B: Authentication & Authorization
FR-B1: User signup aur login kar sake.

FR-B2: Passwords Argon2id hashing ke saath securely save hon (plain text mein nahi).

FR-B3: Session management secure cookies aur database backed hona chahiye (logout karne par session revoke ho).

FR-B4: Ek user multiple tenants ka part ho sakta hai, par ek time par ek tenant ka data dekh sakta hai.

FR-B5: Role-based access control (Owner, Manager, Accountant).

2.3 Module C: Customer & Inventory
FR-C1: Customer ka CRUD (Create, Read, Update, Delete) manage karna.

FR-C2: Filled/Empty cylinders ka stock in/out record karna (Stock movements ledger).

FR-C3: Agar stock negative mein jaye (bina approval ke), toh system block kare.

FR-C4: Har customer ke paas jitne cylinder hain (Custody), unka record rakhna.

2.4 Module D: Delivery & Operations
FR-D1: Ek order create karna (Customer select, Cylinder size select, Quantity).

FR-D2: Delivery complete karte time: Filled issue karna aur Empty collect karna ek atomic transaction mein ho.

FR-D3: Idempotency (Agar internet issue se same request 2 baar chali jaye, toh double entry na ho).

2.5 Module E: Billing & Finance
FR-E1: Invoice generate karna (Tax snapshots ke saath).

FR-E2: Payment record karna (Cash, UPI, Bank transfer).

FR-E3: Posted invoice ko silently edit ya delete nahi kiya ja sakta (Credit note generate karna padega).

FR-E4: Financial year wise auto-incrementing invoice numbers.


