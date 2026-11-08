-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL
);

-- 3. Role Permissions Mapping Table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 4. Update tenant_members table
-- Pehle role column (string) ko hatao aur role_id (uuid) add karo
ALTER TABLE tenant_members DROP COLUMN IF EXISTS role;
ALTER TABLE tenant_members ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tenant_members_role ON tenant_members(role_id);

-- Enable RLS on new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;

-- Policy for Roles (tenant can only see its own roles + system roles)
CREATE POLICY tenant_isolation_policy ON roles
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid OR tenant_id IS NULL);

-- Note: Permissions table is global (all tenants can read it)
GRANT SELECT ON permissions TO gasflow_app;
GRANT SELECT ON role_permissions TO gasflow_app;