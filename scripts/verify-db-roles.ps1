@'
-- ─────────────────────────────────────────────────────────────
-- GASFlow — Postgres bootstrap: roles + database hardening
-- Invoked by 00-run-roles.sh (not by entrypoint's *.sql glob).
-- Runs ONCE on first container init with an empty data volume.
-- ─────────────────────────────────────────────────────────────

\set ON_ERROR_STOP on

-- ── 1. Roles ────────────────────────────────────────────────
SELECT format('CREATE ROLE gasflow_owner LOGIN PASSWORD %L', :'owner_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gasflow_owner')
\gexec

SELECT format('ALTER ROLE gasflow_owner WITH LOGIN PASSWORD %L
               NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION',
              :'owner_pw')
\gexec

SELECT format('CREATE ROLE gasflow_app LOGIN PASSWORD %L', :'app_pw')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gasflow_app')
\gexec

SELECT format('ALTER ROLE gasflow_app WITH LOGIN PASSWORD %L
               NOSUPERUSER NOCREATEROLE NOCREATEDB NOBYPASSRLS NOREPLICATION',
              :'app_pw')
\gexec

-- ── 2. Database ownership ───────────────────────────────────
ALTER DATABASE :"dbname" OWNER TO gasflow_owner;

-- ── 3. PUBLIC lockdown + minimum grants ─────────────────────
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE :"dbname" FROM PUBLIC;

GRANT CONNECT ON DATABASE :"dbname" TO gasflow_app;
GRANT USAGE  ON SCHEMA public TO gasflow_app;

ALTER SCHEMA public OWNER TO gasflow_owner;
GRANT CREATE ON SCHEMA public TO gasflow_owner;

-- ── 4. Default privileges for future migration tables ──────
ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gasflow_app;

ALTER DEFAULT PRIVILEGES FOR ROLE gasflow_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO gasflow_app;

DO $$
BEGIN
  RAISE NOTICE 'GASFlow bootstrap complete: roles gasflow_owner, gasflow_app; db owned by gasflow_owner; app restricted.';
END
$$;
'@ | Set-Content -NoNewline -Encoding utf8 "docker\postgres\init\00-roles.sql.template"