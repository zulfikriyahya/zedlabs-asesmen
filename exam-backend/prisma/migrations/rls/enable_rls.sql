-- =============================================================
-- Row Level Security (RLS) — Safety net di level DB
-- Jalankan SETELAH prisma migrate deploy
-- =============================================================

-- Buat role aplikasi (dibedakan dari superuser)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'exam_app') THEN
    CREATE ROLE exam_app LOGIN PASSWORD 'ganti_dengan_password_kuat';
  END IF;
END
$$;

-- Grant akses tabel ke role aplikasi
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO exam_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO exam_app;

-- =============================================================
-- Enable RLS pada tabel yang memiliki tenantId
-- =============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- Policy: aplikasi HARUS set current_setting('app.tenant_id')
-- sebelum query (di-set via Prisma middleware / connection)
-- =============================================================

-- users
CREATE POLICY tenant_isolation_users ON users
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- subjects
CREATE POLICY tenant_isolation_subjects ON subjects
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- questions
CREATE POLICY tenant_isolation_questions ON questions
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- exam_packages
CREATE POLICY tenant_isolation_packages ON exam_packages
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- exam_sessions
CREATE POLICY tenant_isolation_sessions ON exam_sessions
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- exam_rooms
CREATE POLICY tenant_isolation_rooms ON exam_rooms
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

-- audit_logs — append-only: INSERT diizinkan, UPDATE & DELETE tidak
CREATE POLICY tenant_isolation_audit_logs ON audit_logs
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::text
         OR current_setting('app.role', TRUE) = 'SUPERADMIN');

CREATE POLICY audit_logs_no_update ON audit_logs
  AS RESTRICTIVE FOR UPDATE USING (FALSE);

CREATE POLICY audit_logs_no_delete ON audit_logs
  AS RESTRICTIVE FOR DELETE USING (FALSE);

-- =============================================================
-- Bypass RLS untuk superuser Prisma (migration user)
-- =============================================================
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE questions FORCE ROW LEVEL SECURITY;
ALTER TABLE exam_packages FORCE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE exam_rooms FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

-- Prisma migration user bypass (hanya untuk migration)
-- ALTER ROLE exam_migration BYPASSRLS;
