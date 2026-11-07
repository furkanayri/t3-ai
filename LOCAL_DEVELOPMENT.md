# T3 Vakfı Mülakat Sistemi Local Development

This setup runs MongoDB and Redis in Docker while the Node.js applications run
on the host with hot reload. It never uses the existing remote MongoDB URL from
`backend/.env`.

## Requirements

- Node.js 22+
- npm 10+
- Docker Desktop with Docker Compose

Python is not required for the frontend/backend local core flow.

## First-time setup

Install dependencies:

```powershell
cd backend
npm ci

cd ..\frontend
npm ci
```

Start MongoDB and Redis, then seed the local database:

```powershell
cd ..\backend
npm run setup:local
```

The seed is idempotent and may be run again safely.

## Run the applications

Backend terminal:

```powershell
cd backend
npm run dev:local
```

Frontend terminal:

```powershell
cd frontend
npm run dev
```

Local URLs, all on port 5173:

- Company: http://localhost:5173
- Accounts: http://localhost:5173/hesap
- Admin: http://localhost:5173/admin
- Backend health: http://localhost:3000/healthyCheck

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Company/Admin | `admin@heplin.local` | `Local123!` |
| Candidate | `candidate@heplin.local` | `Local123!` |

The password is controlled by `LOCAL_SEED_PASSWORD` in
`backend/.env.local`. Re-run `npm run seed:local` after changing it.

The company user is redirected to the `demo` tenant after login.

The local personality inventory is limited to 3 questions through
`PERSONALITY_TEST_QUESTION_LIMIT` and `VITE_PERSONALITY_TEST_QUESTION_LIMIT`.
Production keeps the full 64-question inventory when these variables are not
set.

## Test a video interview

In local mode, the backend returns a local upload URL instead of an AWS/R2
presigned URL. Recorded WebM files stay in the ignored
`backend/.local-uploads` directory and can be read back through the backend.

Assign the reusable test interview to the demo candidate:

```powershell
cd backend
npm run assign-interview:local
```

Then sign in to the Accounts panel with `candidate@heplin.local`, open
`http://localhost:5173/hesap/interviews`, and select **Yerel Video Mülakat Testi**.
The assignment command is idempotent and extends the expiration date without
duplicating the interview.

## Stop local infrastructure

```powershell
cd backend
npm run infra:local:down
```

MongoDB and Redis data remain in Docker volumes. Use `docker compose -f
docker-compose.local.yml down -v` only when the local demo data should be
deleted.

## Restore the T3 MongoDB backup

The restore commands only accept the local MongoDB connection on
`127.0.0.1:27018`. Stop the backend first so no request can write data during
the restore.

Inspect a dump without changing the database:

```powershell
cd backend
npm run inspect:t3-backup:local -- --source "C:\path\to\HEPLIN-IK-PRODUCT"
```

Replace `heplin-local` with the dump, migrate historical AI results, and add
the local T3 admin overlay:

```powershell
npm run restore:t3-backup:local -- --source "C:\path\to\HEPLIN-IK-PRODUCT"
```

Before replacing data, the command writes a compressed recovery archive to
the ignored `backend/.local-backups` directory. It automatically restores that
archive if import, migration, seeding, or verification fails. A successful run
prints the exact rollback command; it can also be run later:

```powershell
npm run rollback:t3-backup:local -- --archive ".local-backups\pre-t3-restore-<timestamp>.archive.gz"
```

After a successful restore, sign in at `http://localhost:5173/t3-vakfi` with
`admin@heplin.local` and the `LOCAL_SEED_PASSWORD` value (`Local123!` by
default). The restored AI scores, explanations, and transcripts remain
available. Video references without a matching file in `.local-uploads` show a
local-file warning instead of contacting R2.

## External integrations

Cron jobs and Telegram are disabled by the local environment. AWS/R2 is
replaced by the local upload directory for video interview tests. Email, SMS,
AI, Zoom, WhatsApp, and the remaining external integrations use placeholder
credentials and stay outside the local core setup.
