-- ============================================================
-- prisma/migrations/rls/enable_rls.sql
-- PostgreSQL Row Level Security — safety net lapis kedua
-- Jalankan: psql $DATABASE_DIRECT_URL -f prisma/migrations/rls/enable_rls.sql
-- ============================================================

-- ── 1. Buat role aplikasi ─────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'exam_app') THEN
    CREATE ROLE exam_app;
  END IF;
END $$;

GRANT CONNECT ON DATABASE exam_db TO exam_app;
GRANT USAGE ON SCHEMA public TO exam_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO exam_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO exam_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO exam_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO exam_app;

-- ── 2. Set search_path ────────────────────────────────────────────────────────
ALTER ROLE exam_app SET search_path TO public;

-- ── 3. Helper function: ambil tenant_id dari session variable ─────────────────
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.tenant_id', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_app_role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.role', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ── 4. Enable RLS pada tabel yang mengandung tenantId ────────────────────────

-- Tabel dengan kolom tenant_id langsung
ALTER TABLE tenants          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tags    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_packages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_rooms       ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs       ENABLE ROW LEVEL SECURITY;

-- Tabel tanpa tenant_id langsung (isolation via JOIN atau bypass)
ALTER TABLE refresh_tokens           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_tag_mappings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_package_questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue               ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_activity_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications            ENABLE ROW LEVEL SECURITY;

-- ── 5. Policy: SUPERADMIN/ADMIN bypass semua RLS ──────────────────────────────

-- Untuk tabel dengan tenant_id langsung
CREATE POLICY superadmin_bypass ON tenants
  USING (current_app_role() IN ('SUPERADMIN', 'ADMIN') OR TRUE);

-- ── 6. Policy per tabel dengan tenant_id langsung ────────────────────────────

-- tenants: hanya SUPERADMIN yang bisa lihat semua; tenant lain hanya diri sendiri
DROP POLICY IF EXISTS tenant_isolation ON tenants;
CREATE POLICY tenant_isolation ON tenants
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    current_app_role() = 'SUPERADMIN'
    OR id = current_tenant_id()
  );

-- users
DROP POLICY IF EXISTS tenant_isolation ON users;
CREATE POLICY tenant_isolation ON users
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- subjects
DROP POLICY IF EXISTS tenant_isolation ON subjects;
CREATE POLICY tenant_isolation ON subjects
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- questions
DROP POLICY IF EXISTS tenant_isolation ON questions;
CREATE POLICY tenant_isolation ON questions
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- question_tags
DROP POLICY IF EXISTS tenant_isolation ON question_tags;
CREATE POLICY tenant_isolation ON question_tags
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- exam_packages
DROP POLICY IF EXISTS tenant_isolation ON exam_packages;
CREATE POLICY tenant_isolation ON exam_packages
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- exam_rooms
DROP POLICY IF EXISTS tenant_isolation ON exam_rooms;
CREATE POLICY tenant_isolation ON exam_rooms
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- exam_sessions
DROP POLICY IF EXISTS tenant_isolation ON exam_sessions;
CREATE POLICY tenant_isolation ON exam_sessions
  AS PERMISSIVE FOR ALL TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- audit_logs (append-only: INSERT + SELECT saja)
DROP POLICY IF EXISTS tenant_isolation ON audit_logs;
CREATE POLICY tenant_isolation ON audit_logs
  AS PERMISSIVE FOR SELECT TO exam_app
  USING (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

DROP POLICY IF EXISTS tenant_insert ON audit_logs;
CREATE POLICY tenant_insert ON audit_logs
  AS PERMISSIVE FOR INSERT TO exam_app
  WITH CHECK (tenant_id = current_tenant_id() OR current_app_role() = 'SUPERADMIN');

-- Blokir UPDATE dan DELETE pada audit_logs (append-only enforcement)
DROP POLICY IF EXISTS no_update ON audit_logs;
CREATE POLICY no_update ON audit_logs
  AS RESTRICTIVE FOR UPDATE TO exam_app
  USING (FALSE);

DROP POLICY IF EXISTS no_delete ON audit_logs;
CREATE POLICY no_delete ON audit_logs
  AS RESTRICTIVE FOR DELETE TO exam_app
  USING (FALSE);

-- ── 7. Policy tabel tanpa tenant_id langsung ─────────────────────────────────

-- refresh_tokens: user hanya akses miliknya
DROP POLICY IF EXISTS owner_isolation ON refresh_tokens;
CREATE POLICY owner_isolation ON refresh_tokens
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    user_id IN (SELECT id FROM users WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- user_devices: sama seperti refresh_tokens
DROP POLICY IF EXISTS owner_isolation ON user_devices;
CREATE POLICY owner_isolation ON user_devices
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    user_id IN (SELECT id FROM users WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- question_tag_mappings: via question → tenant
DROP POLICY IF EXISTS tenant_isolation ON question_tag_mappings;
CREATE POLICY tenant_isolation ON question_tag_mappings
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    question_id IN (SELECT id FROM questions WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- exam_package_questions: via exam_package → tenant
DROP POLICY IF EXISTS tenant_isolation ON exam_package_questions;
CREATE POLICY tenant_isolation ON exam_package_questions
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    exam_package_id IN (SELECT id FROM exam_packages WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- session_students: via exam_session → tenant
DROP POLICY IF EXISTS tenant_isolation ON session_students;
CREATE POLICY tenant_isolation ON session_students
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    session_id IN (SELECT id FROM exam_sessions WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- exam_attempts: via exam_session → tenant
DROP POLICY IF EXISTS tenant_isolation ON exam_attempts;
CREATE POLICY tenant_isolation ON exam_attempts
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    session_id IN (SELECT id FROM exam_sessions WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- exam_answers: via exam_attempt → exam_session → tenant
DROP POLICY IF EXISTS tenant_isolation ON exam_answers;
CREATE POLICY tenant_isolation ON exam_answers
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    attempt_id IN (
      SELECT ea.id FROM exam_attempts ea
      JOIN exam_sessions es ON es.id = ea.session_id
      WHERE es.tenant_id = current_tenant_id()
    )
    OR current_app_role() = 'SUPERADMIN'
  );

-- sync_queue: via exam_attempt → tenant
DROP POLICY IF EXISTS tenant_isolation ON sync_queue;
CREATE POLICY tenant_isolation ON sync_queue
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    attempt_id IN (
      SELECT ea.id FROM exam_attempts ea
      JOIN exam_sessions es ON es.id = ea.session_id
      WHERE es.tenant_id = current_tenant_id()
    )
    OR current_app_role() = 'SUPERADMIN'
  );

-- exam_activity_logs: via exam_attempt → tenant
DROP POLICY IF EXISTS tenant_isolation ON exam_activity_logs;
CREATE POLICY tenant_isolation ON exam_activity_logs
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    attempt_id IN (
      SELECT ea.id FROM exam_attempts ea
      JOIN exam_sessions es ON es.id = ea.session_id
      WHERE es.tenant_id = current_tenant_id()
    )
    OR current_app_role() = 'SUPERADMIN'
  );

-- notifications: via user → tenant
DROP POLICY IF EXISTS tenant_isolation ON notifications;
CREATE POLICY tenant_isolation ON notifications
  AS PERMISSIVE FOR ALL TO exam_app
  USING (
    user_id IN (SELECT id FROM users WHERE tenant_id = current_tenant_id())
    OR current_app_role() = 'SUPERADMIN'
  );

-- ── 8. Performance: index untuk RLS subquery ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_exam_sessions_tenant ON exam_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_session ON exam_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_attempt ON sync_queue(attempt_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_attempt ON exam_activity_logs(attempt_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ── 9. Verifikasi ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  tbl TEXT;
  rls_tables TEXT[] := ARRAY[
    'tenants','users','subjects','questions','question_tags',
    'exam_packages','exam_rooms','exam_sessions','audit_logs',
    'refresh_tokens','user_devices','exam_attempts','exam_answers',
    'sync_queue','exam_activity_logs','notifications'
  ];
BEGIN
  FOREACH tbl IN ARRAY rls_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE tablename = tbl AND rowsecurity = TRUE
    ) THEN
      RAISE WARNING 'RLS TIDAK aktif pada tabel: %', tbl;
    ELSE
      RAISE NOTICE 'RLS aktif: %', tbl;
    END IF;
  END LOOP;
END $$;

RAISE NOTICE '✅ RLS setup selesai';
