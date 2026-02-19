
<!-- ══════════════════════════════════════════════════════════ -->
<!-- docs/architecture/security-model.md                       -->
<!-- ══════════════════════════════════════════════════════════ -->

# Security Model

## Defense in Depth

```
Layer 1: HTTPS + Helmet (transport security)
Layer 2: JWT Auth (15m access token, 7d refresh token dengan rotation)
Layer 3: TenantGuard (setiap request harus punya tenantId valid)
Layer 4: RolesGuard (RBAC: SUPERADMIN > ADMIN > TEACHER > OPERATOR > SUPERVISOR > STUDENT)
Layer 5: Prisma query selalu include tenantId
Layer 6: PostgreSQL RLS (safety net)
Layer 7: DeviceGuard (fingerprint perangkat, bisa di-lock)
```

## Enkripsi Paket Soal

```
Backend:
  correctAnswer disimpan terenkripsi AES-256-GCM di database
  Key: ENCRYPTION_KEY dari env (tidak pernah ke klien)

Transport:
  Package dikirim via HTTPS
  correctAnswer tetap terenkripsi dalam payload

Client:
  Paket soal didekripsi di memori (Web Crypto API)
  Key sesi hanya hidup selama tab aktif
  TIDAK pernah masuk Zustand persist, localStorage, IndexedDB
```

## Token Security

- Access token: 15 menit, stateless JWT
- Refresh token: 7 hari, disimpan di DB, dirotasi setiap refresh
- Revocation: `revokedAt` timestamp, cek setiap refresh
- Device lock: UserDevice.isLocked — blokir di DeviceGuard
