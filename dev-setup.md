# Dev Setup — Debian 13 (Trixie)

## 1. Prasyarat Sistem

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ca-certificates gnupg lsb-release
```

---

## 2. Node.js 20 (via NodeSource)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi
node -v   # v20.x.x
npm -v    # 10.x.x
```

---

## 3. PostgreSQL 16

```bash
# Tambah repo resmi PostgreSQL (cara modern — tanpa apt-key)
sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail \
  https://www.postgresql.org/media/keys/ACCC4CF8.asc

sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] \
  https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list'

sudo apt update
sudo apt install -y postgresql-16 postgresql-client-16

# Start & enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Buat user & database
sudo -u postgres psql <<EOF
CREATE USER exam_user WITH PASSWORD 'exam_password';
CREATE DATABASE exam_db OWNER exam_user;
GRANT ALL PRIVILEGES ON DATABASE exam_db TO exam_user;
\q
EOF

# Verifikasi koneksi
psql -U exam_user -d exam_db -h localhost -c "SELECT version();"
```

---

## 4. PgBouncer (connection pooler)

```bash
sudo apt install -y pgbouncer

# Konfigurasi
sudo tee /etc/pgbouncer/pgbouncer.ini > /dev/null <<EOF
[databases]
exam_db = host=127.0.0.1 port=5432 dbname=exam_db

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/postgresql/pgbouncer.pid
EOF

# Buat userlist (password harus md5 hash)
# Format: "username" "md5<md5(password+username)>"
PG_PASS_HASH=$(echo -n "exam_passwordexam_user" | md5sum | awk '{print "md5"$1}')
sudo bash -c "echo '\"exam_user\" \"${PG_PASS_HASH}\"' > /etc/pgbouncer/userlist.txt"

sudo systemctl start pgbouncer
sudo systemctl enable pgbouncer

# Verifikasi
psql -U exam_user -d exam_db -h 127.0.0.1 -p 6432 -c "SELECT 1;"
```

---

## 5. Redis 7

```bash
# Tambah repo resmi Redis
curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
sudo apt update
sudo apt install -y redis

# Aktifkan persistence (AOF)
sudo sed -i 's/^appendonly no/appendonly yes/' /etc/redis/redis.conf

sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verifikasi
redis-cli ping   # PONG
```

> **BullMQ** tidak perlu diinstall terpisah — ini library Node.js, sudah masuk `package.json`. Redis adalah backend-nya.

---

## 6. MinIO (object storage)

```bash
# Download binary
wget https://dl.min.io/server/minio/release/linux-amd64/minio -O /tmp/minio
sudo install /tmp/minio /usr/local/bin/minio

# Buat user & direktori
sudo useradd -r minio-user -s /sbin/nologin
sudo mkdir -p /data/minio
sudo chown -R minio-user:minio-user /data/minio

# Buat env file
sudo tee /etc/default/minio > /dev/null <<EOF
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_VOLUMES=/data/minio
MINIO_OPTS="--console-address :9001"
EOF

# Buat systemd service
sudo tee /etc/systemd/system/minio.service > /dev/null <<EOF
[Unit]
Description=MinIO
Documentation=https://min.io/docs/minio/linux/index.html
After=network-online.target

[Service]
User=minio-user
Group=minio-user
EnvironmentFile=/etc/default/minio
ExecStart=/usr/local/bin/minio server \$MINIO_OPTS \$MINIO_VOLUMES
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start minio
sudo systemctl enable minio

# Buat bucket lewat CLI
wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /tmp/mc
sudo install /tmp/mc /usr/local/bin/mc

mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/exam-assets
mc anonymous set download local/exam-assets  # opsional untuk dev

# Verifikasi
mc ls local/
```

MinIO Console tersedia di: **http://localhost:9001**

---

## 7. Setup Project Backend

```bash
cd exam-backend

# Install dependencies
npm install

# Salin dan edit env
cp .env.example .env
```

Edit `.env` untuk dev:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://exam_user:exam_password@localhost:6432/exam_db
DATABASE_DIRECT_URL=postgresql://exam_user:exam_password@localhost:5432/exam_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=dev-access-secret-min-32-chars-xxxxx
JWT_REFRESH_SECRET=dev-refresh-secret-min-32-chars-xxxxx

# 64 hex chars = 32 bytes (generate: openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=exam-assets
```

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev --name init

# Seed data awal
npm run db:seed

# Jalankan dev server
npm run start:dev
```

API tersedia di: **http://localhost:3000**  
Swagger docs: **http://localhost:3000/docs**

---

## 8. Verifikasi Semua Service

```bash
# Cek semua service aktif
sudo systemctl status postgresql pgbouncer redis-server minio

# Test koneksi database via PgBouncer
psql -U exam_user -d exam_db -h localhost -p 6432 -c "\conninfo"

# Test Redis
redis-cli ping

# Test MinIO
mc ls local/exam-assets

# Test API
curl http://localhost:3000/api/health
curl http://localhost:3000/         # info endpoint
```

---

## 9. BullMQ Dashboard (opsional, untuk monitor queue)

```bash
# Install bull-board sebagai dev tool
npm install -D @bull-board/express @bull-board/api

# Atau gunakan standalone bull-board
npx bull-board --redis-url redis://localhost:6379
# Buka http://localhost:3000/queues
```

Alternatif lebih mudah — gunakan **RedisInsight** (GUI):
```bash
# Download dari https://redis.com/redis-enterprise/redis-insight/
wget https://downloads.redislabs.com/redisinsight/redisinsight-linux64 -O /tmp/redisinsight
chmod +x /tmp/redisinsight
/tmp/redisinsight &
# Buka http://localhost:8001
```

---

## 10. Troubleshooting Umum

| Problem | Solusi |
|---|---|
| `ECONNREFUSED 5432` | `sudo systemctl start postgresql` |
| `ECONNREFUSED 6432` | `sudo systemctl start pgbouncer` |
| `ECONNREFUSED 6379` | `sudo systemctl start redis-server` |
| MinIO `connection refused` | `sudo systemctl start minio` |
| Prisma `P1001` | Cek `DATABASE_URL` di `.env`, pastikan password benar |
| PgBouncer auth error | Re-generate `userlist.txt` dengan hash yang benar |
| `Cannot find module` | `npm install` ulang, cek `tsconfig.json` paths |
| Port 3000 sudah dipakai | `lsof -i :3000` lalu kill PID-nya |

---

## Ringkasan Port

| Service | Port |
|---|---|
| PostgreSQL | 5432 |
| PgBouncer | 6432 |
| Redis | 6379 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| NestJS API | 3000 |
| Swagger | 3000/docs |
