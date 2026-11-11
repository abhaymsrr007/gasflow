CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(50) NOT NULL,
  driver_id UUID NOT NULL,
  delivery_man_id UUID NOT NULL,
  total_loaded INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON trips
  FOR ALL USING (tenant_id = current_setting('app.tenant_id', true)::uuid);