# Exam Backend API

RESTful API untuk sistem asesmen/ujian sekolah dan madrasah dengan arsitektur offline-first dan multi-tenant.

## 🚀 Features

- ✅ Multi-tenant system with row-level security
- ✅ Offline-first architecture (download → offline exam → sync)
- ✅ 6 question types support
- ✅ Multimedia support (image, audio, video)
- ✅ Media recording (audio/video answers)
- ✅ Auto-grading engine
- ✅ Manual grading for essays
- ✅ Real-time monitoring
- ✅ Item analysis & analytics
- ✅ Sync queue with retry mechanism
- ✅ Device fingerprinting & locking
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ API documentation (Swagger)
- ✅ Comprehensive logging

## 📋 Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- Redis >= 6.x
- FFmpeg (for media processing)

## 🔧 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed
```

## 🏃 Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod

# With PM2
pm2 start ecosystem.config.js
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Load testing
npm run test:load
```

## 📚 API Documentation

After starting the server, visit:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs-json

## 🏗️ Project Structure

```
exam-backend/
├── src/
│   ├── common/           # Shared utilities
│   ├── config/           # Configuration files
│   ├── database/         # Migrations & seeds
│   └── modules/          # Feature modules
│       ├── auth/         # Authentication
│       ├── questions/    # Question bank
│       ├── exams/        # Exam management
│       ├── exam-attempts/ # Student exam flow
│       ├── grading/      # Grading system
│       ├── sync-queue/   # Offline sync
│       └── ...
├── test/                 # Test files
├── logs/                 # Application logs
├── uploads/              # File uploads
└── docs/                 # Documentation
```

## 🔐 Security

- JWT-based authentication
- Device fingerprinting
- AES-256 encryption for sensitive data
- SQL injection prevention (TypeORM)
- XSS protection (Helmet)
- CORS configuration
- Rate limiting
- Input validation

## 🎯 User Roles

1. **Siswa** - Take exams, view results
2. **Guru** - Create questions, manage exams, grading
3. **Pengawas** - Monitor exam sessions
4. **Operator** - Manage sessions, rooms, participants
5. **Superadmin** - System administration

## 📊 Performance

- Supports up to 5000 concurrent users
- Redis caching for frequently accessed data
- Database query optimization
- Compression middleware
- Efficient file handling

## 🔄 Offline Sync Flow

1. Student downloads exam package (encrypted)
2. Takes exam offline
3. Submits answers (queued if offline)
4. Background sync with retry mechanism
5. Chunked upload for large media files

## 📝 Database Schema

See `docs/architecture/database-schema.sql` for complete schema.

Key tables:
- schools (multi-tenant)
- users (with roles)
- questions (question bank)
- exams
- exam_attempts
- exam_answers
- sync_queue

## 🛠️ Maintenance

```bash
# Database backup
./scripts/backup.sh

# Database restore
./scripts/restore.sh

# Cleanup old media files
./scripts/cleanup-media.sh

# Check health
curl http://localhost:3000/api/health
```

## 📦 Deployment

See `docs/deployment/production-checklist.md` for deployment guide.

## 🐛 Troubleshooting

### Common Issues

**Connection refused to MySQL:**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`

**Redis connection error:**
- Check Redis is running: `redis-cli ping`
- Should return `PONG`

**Large file upload fails:**
- Increase nginx `client_max_body_size`
- Check `MAX_FILE_SIZE` in `.env`

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: support@exam.app

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ using NestJS
