-- -- GASFlow Local DB Setup
-- \set ON_ERROR_STOP on

-- 1. Roles (passwords pass kiye jayenge psql -v se)
SELECT format('CREATE ROLE gasflow_owner LOGIN PASSWORD %L', :'root') WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='gasflow_owner');
SELECT format('ALTER ROLE gasflow_owner WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION', :'root') \gexec

SELECT format('CREATE ROLE gasflow_app LOGIN PASSWORD %L', :'root') WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='gasflow_app');
SELECT format('ALTER ROLE gasflow_app WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION', :'root') \gexec

-- 2. PUBLIC permissions revoke karo
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO gasflow_app;

-- 3. gasflow_app ko public schema mein create permission mat do (owner karega tables create)
ALTER SCHEMA public OWNER TO gasflow_owner;
GRANT CREATE ON SCHEMA public TO gasflow_owner;

-- 4. Future tables ke liye default privileges set karo
ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gasflow_app;
ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO gasflow_app;



-- 1. Database aur Schema ki permissions wapas do
GRANT CONNECT ON DATABASE gasflow TO gasflow_app;
GRANT USAGE ON SCHEMA public TO gasflow_app;

-- 2. Saari tables par read/write permission do
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gasflow_app;

-- 3. Saari sequences (jo IDs generate karti hain) par permission do
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gasflow_app;

-- 4. Future tables ke liye default permission set karo
ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gasflow_app;

ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO gasflow_app;