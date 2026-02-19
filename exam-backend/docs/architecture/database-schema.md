
<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/database-schema.md                      -->
<!-- ══════════════════════════════════════════════════════════ -->

# Database Schema

## Prinsip

1. Setiap tabel memiliki `tenantId` (kecuali junction tables)
2. `AuditLog` adalah append-only — tidak ada UPDATE/DELETE
3. `SyncQueue` mendukung retry dengan DLQ (`DEAD_LETTER` status)
4. Idempotency key sebagai unique constraint di `ExamAttempt` dan `ExamAnswer`

## Relasi Kritis

```
ExamSession → ExamAttempt (1:N, unique per userId)
ExamAttempt → ExamAnswer  (1:N, unique per questionId + idempotencyKey)
ExamAttempt → SyncQueue   (1:N, untuk retry management)
ExamAttempt → ExamActivityLog (1:N, audit trail)
```

## Indexing Strategy

```sql
-- Query paling sering untuk siswa
CREATE INDEX idx_exam_attempt_session_user ON exam_attempts(session_id, user_id);
CREATE INDEX idx_exam_answer_attempt ON exam_answers(attempt_id);
CREATE INDEX idx_sync_queue_status ON sync_queue(status, retry_count);

-- Query monitoring real-time
CREATE INDEX idx_activity_log_attempt ON exam_activity_logs(attempt_id);
CREATE INDEX idx_audit_log_tenant_action ON audit_logs(tenant_id, action);
```
