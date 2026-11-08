-- Add id column as a unique identifier (not primary key, since composite PK already exists)
ALTER TABLE tenant_members 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Make it unique so Prisma can use it
ALTER TABLE tenant_members
ADD CONSTRAINT tenant_members_id_key UNIQUE (id);