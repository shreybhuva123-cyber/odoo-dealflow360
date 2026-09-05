# DealFlow360 - B2B Sales Operations Platform

DealFlow360 is an enterprise-grade B2B Sales Operations platform designed to streamline and automate the entire lead-to-cash lifecycle for medium-to-large enterprises.

---

## Monorepo & Project Structure

```text
odoo-dealflow360/
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions automated CI/CD pipeline
├── backend/                      # Production Express.js + Prisma REST API
│   ├── src/                      # Source code (Controllers, Services, Routes, Validators)
│   ├── prisma/                   # Schema, Migrations, and Seed script
│   ├── tests/                    # 14 Test Suites (427 automated tests)
│   ├── scripts/                  # Production utility & smoke test scripts
│   │   ├── lint.js               # Zero-dependency syntax & lint check
│   │   └── smokeTest.js          # 17-step end-to-end production smoke test
│   ├── docs/                     # Architecture, Integration, Operations & Demo docs
│   │   ├── ARCHITECTURE.md       # Layered architecture & domain engine blueprint
│   │   ├── FRONTEND_INTEGRATION.md# React developer guide & API envelopes
│   │   ├── DEPLOYMENT.md         # Production runbook & migration deployment guide
│   │   ├── BACKUP_RESTORE.md     # PostgreSQL backup & restore procedures
│   │   ├── API_ERRORS.md         # Complete HTTP status & error reference
│   │   └── DEMO_CHECKLIST.md     # 23-point live demo verification checklist
│   ├── postman/                  # Postman collection & environment
│   │   ├── DealFlow360.postman_collection.json
│   │   └── DealFlow360.postman_environment.json
│   ├── Dockerfile                # Production multi-stage Alpine Dockerfile
│   ├── .dockerignore             # Docker build context exclusions
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Dependencies & npm scripts
│   └── README.md                 # Backend documentation & cURL guides
├── docker-compose.yml            # Local production Docker Compose stack
├── .env.example                  # Root environment template
└── README.md                     # Root project documentation
```

---

## Quick Start Options

### Option A: Local Node.js Development

1. **Navigate to Backend**:
   ```bash
   cd backend
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Initialize Database**:
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

4. **Start Server**:
   ```bash
   npm run dev
   ```

5. **Verify Health & Swagger**:
   - Swagger UI: `http://localhost:5000/api-docs`
   - Liveness Probe: `http://localhost:5000/health`
   - Readiness Probe: `http://localhost:5000/health/ready`

### Option B: Docker Compose (Production Environment)

```bash
# Start PostgreSQL & Backend services
docker compose up --build -d

# View logs
docker compose logs -f backend

# Run production smoke test inside container or host
docker compose exec backend npm run smoke
```

---

## Automated Verification Suite

```bash
cd backend

# 1. Syntax & lint check
npm run lint

# 2. Build verification
npm run build

# 3. Pure calculation engine unit tests (28 tests)
npm run test:unit

# 4. Native code coverage report
npm run test:coverage

# 5. Full test suite across all 14 suites (427 tests)
npm test

# 6. Realistic 17-step end-to-end smoke test
npm run smoke
```
