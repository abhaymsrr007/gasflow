-- 1. Stock Balances
CREATE TABLE IF NOT EXISTS stock_balances (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cylinder_products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL, -- Default warehouse ID
  filled_quantity INT NOT NULL DEFAULT 0,
  empty_quantity INT NOT NULL DEFAULT 0,
  damaged_quantity INT NOT NULL DEFAULT 0,
  missing_quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tenant_id, product_id, warehouse_id)
);

-- 2. Stock Movements (Immutable Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cylinder_products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL,
  movement_type VARCHAR(30) NOT NULL,
  quantity INT NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(30),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id, product_id);

-- 3. RLS Apply karo
ALTER TABLE stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Pehle check karo ki policy exist karti hai ya nahi, agar karti hai toh drop karo
DROP POLICY IF EXISTS tenant_isolation_policy ON stock_balances;
DROP POLICY IF EXISTS tenant_isolation_policy ON stock_movements;

CREATE POLICY tenant_isolation_policy ON stock_balances
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Movements ko sirf read-only rakhein? (Immutable). 
-- Abhi ke liye ALL de rahe hain, par baad mein sirf INSERT aur SELECT denge.
CREATE POLICY tenant_isolation_policy ON stock_movements
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- 4. Permissions grant karo
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE stock_balances TO gasflow_app;
GRANT SELECT, INSERT ON TABLE stock_movements TO gasflow_app; 
-- Movements ko UPDATE/DELETE nahi karne denge (immutable)