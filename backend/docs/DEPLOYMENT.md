# DealFlow360 Production Deployment Runbook

This guide covers production deployment procedures, process management, environment configuration, database migrations, and zero-downtime rollback protocols.

---

## 1. Production Architecture Summary
- **Runtime**: Node.js v20 LTS (Native ES Modules)
- **Process Manager**: Docker Compose or PM2 / Systemd
- **Web API**: Express.js 4.x running on port `5000`
- **Database**: PostgreSQL 14+ with Prisma Client ORM
- **Security**: Strict CORS, OWASP security headers, sliding-window rate limiting, and parameter sanitization

---

## 2. Production Environment Configuration

Create `/app/.env` using the template from `.env.example`:

```ini
# Production Server Coordinates
PORT=5000
NODE_ENV=production

# Database Connection Pool
DATABASE_URL="postgresql://dealflow_user:StrongSecretPassword@db.internal:5432/dealflow360?schema=public&connection_limit=20"

# JWT Authentication
# Must be a cryptographically random secret of at least 32 characters
JWT_SECRET="cf689b27b38d3840e69a912bb09f2913e64849646b9a2444cb3fdb5bcba209ef"
JWT_EXPIRES_IN="1d"

# CORS Allowed Origins (Comma-separated exact domains)
CORS_ORIGIN="https://dealflow360.company.com,https://admin.dealflow360.company.com"

# Rate Limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
GENERAL_RATE_LIMIT_WINDOW_MS=900000
GENERAL_RATE_LIMIT_MAX=500
```

---

## 3. Step-by-Step Production Deployment

### Step 1: Clone Repository & Navigate
```bash
git clone <repo-url> /opt/dealflow360
cd /opt/dealflow360/backend
```

### Step 2: Install Production Dependencies
```bash
npm ci --only=production
```

### Step 3: Generate Prisma Client
```bash
npm run prisma:generate
```

### Step 4: Apply Database Migrations (Non-Destructive)
> [!IMPORTANT]
> Never use `prisma migrate dev` or `prisma migrate reset` in production.
> Always use `prisma migrate deploy` (`npm run prisma:deploy`).
```bash
npm run prisma:deploy
```

### Step 5: Verify Build & Syntax
```bash
npm run lint
npm run build
```

### Step 6: Start Server with Process Manager (PM2 Example)
```bash
pm2 start src/server.js --name "dealflow360-api" -i max
pm2 save
```

---

## 4. Verification & Health Probes

Immediately after deployment, query the health endpoints:

### Liveness Probe
```bash
curl -i http://localhost:5000/health
# Expected: HTTP 200 OK {"success":true,"status":"ok",...}
```

### Readiness Probe
```bash
curl -i http://localhost:5000/health/ready
# Expected: HTTP 200 OK {"success":true,"status":"ready","database":"connected",...}
```

### Smoke Test Suite
```bash
npm run smoke
# Executes full 17-step lead-to-cash workflow test
```

---

## 5. Rollback Procedures

If a deployment fails health checks or smoke test validation:

### Step 1: Revert Code & Restart Previous Release
```bash
# If using PM2:
pm2 stop dealflow360-api
git checkout <previous_stable_tag>
npm ci --only=production
npm run prisma:generate
pm2 restart dealflow360-api
```

### Step 2: Database Rollback (If Migration Introduced Breaking Changes)
1. Restore database from the pre-deployment backup (see [`BACKUP_RESTORE.md`](./BACKUP_RESTORE.md)):
   ```bash
   pg_restore -h 127.0.0.1 -p 5433 -U postgres -d dealflow360 --clean "pre_deploy_backup.dump"
   ```
2. Re-verify health probes:
   ```bash
   curl http://localhost:5000/health/ready
   ```
