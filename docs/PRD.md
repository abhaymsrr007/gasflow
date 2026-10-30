1. Product Requirements Document (PRD)
Product: GASFlow SaaS
Target Audience: Commercial LPG Cylinder Distribution Agencies in India
Objective: Ek multi-tenant SaaS platform jo agencies ko unke customers, stock (filled/empty cylinders), deliveries, aur billing manage karne mein madad kare.

1.1 Problem Statement
Aaj kal India mein zyadatar commercial LPG agencies apna hisaab-kitaab manual (kagaz/khata) ya basic Excel par karti hain. Isme bade problems aate hain:

Cylinder Custody: Customer ke paas kitne filled aur kitne empty cylinder hain, iska record maintain karna mushkil hota hai.

Billing & Tax: GST ke hisaab se sahi invoice banana aur outstanding (udhaar) track karna.

Multi-tenant: Agar ek owner ke paas 2 alag-alag gas agencies hain, toh dono ka data alag rakhna aur bina mix kiye dekhna.

1.2 Target Users (Roles)
Owner: Business ka maalik. Sab kuch dekh sakta hai, settings change kar sakta hai.

Manager: Daily operations, orders aur inventory manage karta hai.

Accountant: Invoices, payments aur customer ledger dekhta hai.

(Out of scope for MVP) Delivery Staff: Sirf delivery confirm karne ke liye (abhi ke liye inhe system mein 'employee record' rakhenge, login access nahi hoga).

1.3 Key Features (MVP Scope)
Tenant Management: Ek hi database mein multiple agencies (tenants) alag-alag data ke saath.

Customer Management: Restaurants, hotels, dhaba walo ki details, unka credit limit aur opening balance.

Inventory & Custody Ledger: Filled, empty, damaged cylinders ka track. Warehouse mein kitne hain, aur customer ke paas kitne hain.

Orders & Delivery: Naya order, delivery assign karna, aur atomic (ek saath) tarike se empty collect karna aur filled dena.

Invoicing & Payments: GST tax rates (CGST/SGST/IGST), invoice number generate karna, partial payments aur credit notes.

Dashboard: Aaj ka sales, pending payments, low stock alerts.

1.4 Out of Scope (Jo abhi nahi ban raha)
Vehicle GPS tracking.

Employee payroll/salary.

Direct integration with banks for payment reconciliation.

Customer-facing mobile app (customer login).

