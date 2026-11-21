CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  filled_out INT NOT NULL,
  empty_in INT NOT NULL,
  
  payment_status VARCHAR(20) DEFAULT 'pending',
  total_amount_paise BIGINT NOT NULL,
  discount_paise BIGINT DEFAULT 0,
  final_amount_paise BIGINT NOT NULL,
  
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON deliveries
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Permissions grant karo
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE deliveries TO gasflow_app;