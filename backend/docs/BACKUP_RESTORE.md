# PostgreSQL Database Backup & Restore Runbook

This guide documents the procedures for backing up, restoring, and verifying the PostgreSQL database for the DealFlow360 platform.

---

## 1. Backup Strategy Overview

| Backup Type | Frequency | Retention | Purpose |
| :--- | :--- | :--- | :--- |
| **Pre-Deployment Backup** | Before every production migration (`prisma migrate deploy`) | 30 days | Instant rollback capability |
| **Daily Scheduled Dump** | Nightly (02:00 UTC) | 14 days | Disaster recovery point-in-time |
| **Weekly Archive** | Weekly (Sunday 03:00 UTC) | 90 days | Historical audit and compliance |

---

## 2. Creating a Database Backup

### Using `pg_dump` (Custom Compressed Format - Recommended)
The custom format (`-Fc`) enables parallel restores, selective table restores, and built-in compression:

```bash
# Create timestamped compressed backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -h 127.0.0.1 -p 5433 -U postgres -d dealflow360 -Fc -f "dealflow360_backup_${TIMESTAMP}.dump"
```

### Plain-Text SQL Backup
Useful for inspecting DDL statements or manual SQL verification:
```bash
pg_dump -h 127.0.0.1 -p 5433 -U postgres -d dealflow360 --clean --if-exists -f "dealflow360_backup_${TIMESTAMP}.sql"
```

### Docker Compose Backup
If running DealFlow360 with Docker Compose:
```bash
docker compose exec -T postgres pg_dump -U postgres -d dealflow360 -Fc > "dealflow360_backup_$(date +"%Y%m%d_%H%M%S").dump"
```

---

## 3. Verifying the Backup

Always verify that a newly generated backup file is complete and uncorrupted:

```bash
# List contents of custom dump file without restoring
pg_restore -l "dealflow360_backup_${TIMESTAMP}.dump" | head -n 30
```
If `pg_restore` outputs table names, indexes, and constraints without errors, the backup archive is valid.

---

## 4. Restoring the Database

> [!CAUTION]
> Restoring a backup overwrites existing database state. Ensure all active backend instances are temporarily paused or in maintenance mode before executing a restore.

### Step 1: Terminate Existing Connections
```sql
-- Run as postgres superuser in psql:
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'dealflow360'
  AND pid <> pg_backend_pid();
```

### Step 2: Execute Restore with `pg_restore`
```bash
# Restore into existing database with clean drop
pg_restore -h 127.0.0.1 -p 5433 -U postgres -d dealflow360 --clean --if-exists "dealflow360_backup_20260905_120000.dump"
```

### Step 3: Run Post-Restore Health Checks
```bash
# Verify Prisma can read tables and migrations
cd backend
npm run prisma:generate
npx prisma migrate status

# Run the readiness probe
curl http://localhost:5000/health/ready
```

---

## 5. Automated Backup Script (Linux / Cron Example)

Save as `/usr/local/bin/dealflow360_backup.sh`:
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/dealflow360"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/dealflow360_${TIMESTAMP}.dump"

echo "[$(date)] Starting DealFlow360 database backup..."
pg_dump -h 127.0.0.1 -p 5433 -U postgres -d dealflow360 -Fc -f "$FILENAME"

# Retain only last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.dump" -mtime +14 -exec rm -f {} \;

echo "[$(date)] Backup completed successfully: $FILENAME"
```
