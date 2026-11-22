-- 1. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  delivery_id UUID UNIQUE REFERENCES deliveries(id) ON DELETE SET NULL,
  
  sub_total_paise BIGINT NOT NULL,
  tax_paise BIGINT DEFAULT 0,
  discount_paise BIGINT DEFAULT 0,
  total_paise BIGINT NOT NULL,
  
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  posted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_invoices_tenant_customer ON invoices(tenant_id, customer_id);

-- 2. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES cylinder_products(id),
  quantity INT NOT NULL,
  unit_price_paise BIGINT NOT NULL,
  total_paise BIGINT NOT NULL
);

-- 3. RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_policy ON invoices
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- invoice_items par RLS tenant_id ke bina kaise lagegi? 
-- Hamein invoice_items ko invoices ke through filter karna hoga.
CREATE POLICY invoice_item_isolation_policy ON invoice_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.tenant_id = current_setting('app.tenant_id', true)::uuid
    )
  );

-- 4. Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE invoices TO gasflow_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE invoice_items TO gasflow_app;