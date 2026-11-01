CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  ...
);
// ↑ Ye "Agency" hai - jaise "Sharma Gas Agency", "Patel LPG Distributors".

CREATE TABLE tenant_members (
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) CHECK (role IN ('owner', 'manager', 'accountant')),
  PRIMARY KEY (tenant_id, user_id) 
);
// ↑ User aur Tenant ka rishta, role ke saath.
// Ek user ek tenant mein owner ho sakta hai, doosre mein manager.

CREATE TABLE customers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  business_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL,
  ...
);
// ↑ Har customer kisi ek tenant ka hai.

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
// ↑ RLS enable karo - sirf apne tenant ka data dikhe.

CREATE POLICY tenant_isolation_policy ON customers
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
// ↑ Policy: "Sirf wahi customer dikhao jiska tenant_id = app.tenant_id".
// app.tenant_id = wahi jo humne withTenantContext() mein SET LOCAL kiya.

CREATE TABLE stock_balances (
  tenant_id UUID NOT NULL,
  product_id UUID NOT NULL,
  filled_quantity INT DEFAULT 0,
  empty_quantity INT DEFAULT 0,
  ...
  PRIMARY KEY (tenant_id, product_id)
);
// ↑ Fast caching table: "kitne filled cylinders hain".
// Har baar ledger se calculate nahi karna padega.