# ClinicOS

A clinic management system for small-to-medium medical clinics — patient registration, appointment
scheduling, clinical records, prescriptions, and payments, with role-based access for admins,
doctors, receptionists, and patients.

> **This is a portfolio / educational project.** All clinic names, staff, patients, and demo data
> in this repository are entirely **fictional**, generated for local development and
> demonstration only. No real patient or medical data is used anywhere in this codebase.
>
> ClinicOS does not make autonomous medical decisions. It is administrative/records software —
> diagnoses, treatment plans, and prescriptions are always entered and owned by a human doctor.

## Status

**Phases 1–6 are implemented end-to-end**: foundation/auth, patients, appointments, the doctor
clinical workflow, admin/analytics, and a responsive/accessibility polish pass. Phase 7
(deployment) is what's left — see [Roadmap](#roadmap).

## Features

- Email/password login with JWT access tokens + rotating, revocable httpOnly refresh cookies
- Role-based access control (ADMIN, DOCTOR, RECEPTIONIST, PATIENT), enforced on both the API and
  the frontend router
- Normalized MySQL schema covering the full clinic workflow (patients, appointments, medical
  records, prescriptions, payments, audit log)
- Patient registration, search/filter/sort/pagination, and profile with inline edit
- Appointment scheduling with **server-side conflict detection**, a live Today's Queue, and
  role-appropriate status transitions (reception drives Scheduled→Confirmed→Waiting, doctors drive
  Waiting→In Progress→Completed)
- Doctor visit documentation — chief complaint, diagnosis, clinical notes, treatment plan,
  follow-up date, and an optional relational prescription (multiple medicine lines) — submitted as
  one action that also completes the appointment
- Admin management for doctors, departments, and receptionists (account provisioning included),
  payments (create/list/mark paid/refund), an analytics dashboard (Recharts, themed off the design
  tokens), and an audit log viewer
- Light/dark theme with no flash-of-wrong-theme on load, persisted per browser
- Accessible, validated forms (React Hook Form + Zod) with loading/error/empty states throughout
- Seed script with clearly-fictional demo accounts for every role

## Architecture

```
Browser (React SPA, client/)
      │  JSON over HTTPS, JWT in memory + httpOnly refresh cookie
      ▼
Express API (server/)
  routes → controllers → services → repositories → MySQL
      ▼
   MySQL 8 (database/)
```

- **Frontend and backend are fully separated.** The React app is a pure SPA that talks to the
  Express API over JSON — no server-rendered pages.
- **Authorization is enforced twice.** The frontend hides/guards routes for UX, but every
  protected API route independently re-checks the caller's role — the frontend guard is never the
  security boundary.
- **Validation is enforced twice.** Forms validate with Zod client-side for instant feedback; the
  API validates every request body again server-side and is the final authority (this matters most
  for appointment conflict checks in later phases, which must never trust the client).

See [docs/architecture.md](docs/architecture.md), [docs/database.md](docs/database.md), and
[docs/api.md](docs/api.md) for details.

## Technology Stack

**Frontend** — React 18 (JavaScript + JSX, no TypeScript by design) · Vite · React Router ·
TanStack Query · Zustand · Tailwind CSS (CSS-variable design tokens) · React Hook Form + Zod ·
Recharts (added in the admin analytics phase)

**Backend** — Node.js · Express · JavaScript (ESM) · MySQL via `mysql2` · Zod · `jsonwebtoken` ·
`bcryptjs`

**Database** — MySQL 8, plain-SQL migrations with a small tracked migration runner

## Role Permissions

| Resource | ADMIN | DOCTOR | RECEPTIONIST | PATIENT |
|---|---|---|---|---|
| Patients (create/edit) | ✅ | ❌ view only | ✅ | ❌ |
| Patients (view) | ✅ all | ✅ all | ✅ all | ✅ own record only |
| Appointments (create/reschedule/cancel) | ✅ | ❌ | ✅ | ❌ |
| Appointment status updates | ✅ | ✅ own appointments | ✅ | ❌ |
| Medical records | ✅ view | ✅ create/edit | ❌ | ✅ view own |
| Prescriptions | ✅ view | ✅ create | ❌ | ✅ view own |
| Payments | ✅ create/update/view | ❌ | ✅ create/update/view | ✅ view own |
| Doctors / Departments / Receptionists management | ✅ | ❌ | ❌ | ❌ |
| Analytics / Reports | ✅ | ❌ | ❌ | ❌ |
| Audit logs | ✅ | ❌ | ❌ | ❌ |

## Local Setup

### Prerequisites

- Node.js 20+
- MySQL 8, reachable locally — either your own install, **or** Docker with the included
  `docker-compose.yml` (`docker compose up -d` starts MySQL on `3306` and Adminer on `8080`)

No Docker on Windows? Install MySQL Server directly instead:

```powershell
winget install --id Oracle.MySQL --exact
```

The winget package installs the MySQL binaries only — it doesn't initialize a data directory,
register a Windows service, or create a database/user. After installing:

```powershell
$bin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$dataDir = "C:\ProgramData\MySQL\MySQL Server 8.4\Data"
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
"[mysqld]`nbasedir=C:/Program Files/MySQL/MySQL Server 8.4`ndatadir=$($dataDir -replace '\\','/')`nport=3306" |
  Set-Content -Encoding ascii "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"

& "$bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" --initialize-insecure --console

# Run this once per login session (or install as a service with admin rights via `mysqld --install`):
Start-Process "$bin\mysqld.exe" -ArgumentList '--defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"' -WindowStyle Hidden

& "$bin\mysql.exe" -u root -e "CREATE DATABASE clinicos CHARACTER SET utf8mb4; CREATE USER 'clinicos_app'@'localhost' IDENTIFIED BY 'dev_password_change_me'; GRANT ALL PRIVILEGES ON clinicos.* TO 'clinicos_app'@'localhost'; FLUSH PRIVILEGES;"
```

This matches the credentials already in `.env.example`, so no further config changes are needed.

### Install & configure

```bash
npm install
cp .env.example .env
cp client/.env.example client/.env.local
```

Edit `.env` if your local MySQL credentials differ from the Docker Compose defaults. Never commit
`.env` or `client/.env.local` — they're already git-ignored.

### Database setup

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate` applies every file in `database/migrations/` (tracked in a `schema_migrations` table,
safe to re-run). `db:seed` inserts the fictional demo data described below.

### Run the app

```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

## Demo Credentials

Seeded by `npm run db:seed`. **All accounts share the same password.** Change
`SEED_DEMO_PASSWORD` in `.env` before seeding if you want a different one.

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@clinicos.demo` | `Demo@12345` | Full clinic administration |
| Doctor | `dr.hassan@clinicos.demo` | `Demo@12345` | General Medicine |
| Doctor | `dr.raza@clinicos.demo` | `Demo@12345` | Cardiology |
| Doctor | `dr.khan@clinicos.demo` | `Demo@12345` | Pediatrics |
| Receptionist | `reception@clinicos.demo` | `Demo@12345` | Front desk |
| Patient | `patient@clinicos.demo` | `Demo@12345` | Patient portal login, record `PT-0001` |

These are fictional accounts that only exist in a local/dev database seeded from this repo — they
are not real people and hold no real data.

## Development Commands

| Command | Description |
|---|---|
| `npm run dev:client` | Start the Vite dev server |
| `npm run dev:server` | Start the Express API with hot reload |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run db:seed` | Insert fictional demo data |
| `npm run lint` | Lint both client and server |

## Environment Variables

See [.env.example](.env.example) (server/database) and [client/.env.example](client/.env.example)
(frontend). Every value in those files is a placeholder — generate real secrets before any
non-local deployment, e.g.:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Security Considerations

- Passwords are hashed with bcrypt (cost factor 12); plaintext passwords are never stored or logged.
- Access tokens are short-lived JWTs kept in memory (not `localStorage`), reducing exposure to XSS.
- Refresh tokens are stored server-side (hashed) and rotated on every use, so a logout — or a
  detected compromise — actually revokes the session instead of just deleting a client-side cookie.
- Every role check happens server-side; the frontend router guard is a UX convenience only.
- `audit_logs` intentionally excludes clinical content (diagnoses, notes) — only who did what, to
  which record, and when.
- No AI-generated content is presented as medical advice anywhere in this system.

## Roadmap

- [x] Phase 1 — Foundation: auth, roles, schema, project scaffold
- [x] Phase 2 — Patients: registration, search, profile, history
- [x] Phase 3 — Appointments: scheduling, queue, conflict detection
- [x] Phase 4 — Doctor workflow: medical records, prescriptions, follow-ups
- [x] Phase 5 — Administration: staff/department management, payments, analytics
- [x] Phase 6 — Polish: responsive/accessibility pass, skeleton loading states, audit log UI
- [ ] Phase 7 — Deployment (pending explicit approval — see below)

## Deployment

Not yet deployed. Planned target: Vercel/Netlify (frontend), Render/Railway (API), a managed MySQL
provider (database). Deployment — and the GitHub push, which is a separate, explicitly-confirmed
step from deployment itself — will only happen with direct approval and provided credentials.
