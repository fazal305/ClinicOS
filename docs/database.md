# Database

MySQL 8. Schema lives in [`database/migrations/001_init_schema.sql`](../database/migrations/001_init_schema.sql);
demo data in [`database/seed/seed.js`](../database/seed/seed.js). Every table has an
auto-increment `id` primary key, `created_at`/`updated_at` timestamps (where mutable), and indexed
foreign keys.

## Entity-relationship diagram

```
users ──1:1── doctors ──*:1── departments
  │              │
  │              └──1:*── doctor_availability
  │
  ├──1:1── receptionists
  │
  └──0:1── patients (nullable: portal login is opt-in, granted after registration)
                │
                ├──1:*── appointments ──*:1── doctors
                │             │                   │
                │             │                   └──*:1── departments
                │             │
                │             └──1:1(opt)── medical_records ──*:1── doctors
                │                                  │
                │                                  └──1:*(opt)── prescriptions
                │
                ├──1:*── medical_records
                │
                ├──1:*── prescriptions ──1:*── prescription_items
                │
                └──1:*── payments ──*:1(opt)── appointments

users ──1:*── audit_logs
users ──1:*── refresh_tokens
```

## Tables

| Table | Purpose |
|---|---|
| `users` | One row per login-capable account (staff **and** patients with portal access), holding email, bcrypt password hash, and `role`. |
| `refresh_tokens` | Server-side, revocable refresh tokens (hashed) — enables real logout and session rotation, not just client-side cookie deletion. |
| `departments` | Clinic departments (General Medicine, Cardiology, …) — seed data, not hard-coded logic. |
| `doctors` | Doctor profile, linked 1:1 to a `users` row and optionally to a department. |
| `receptionists` | Receptionist profile, linked 1:1 to a `users` row. |
| `doctor_availability` | Recurring weekly working hours per doctor, used by the scheduling UI and conflict checks. |
| `patients` | The clinical patient record. `user_id` is **nullable** — a patient exists as soon as reception registers them; portal login is granted separately by creating/linking a `users` row. |
| `appointments` | Links a patient, doctor, and (optionally) department at a specific date/time; `status` tracks the full lifecycle from `SCHEDULED` to `COMPLETED`/`CANCELLED`/`NO_SHOW`. |
| `medical_records` | One visit's clinical documentation: complaint, symptoms, diagnosis, notes, treatment plan, follow-up date. |
| `prescriptions` | A prescription issued to a patient, optionally tied to the medical record it came from. |
| `prescription_items` | Individual medicine lines on a prescription (medicine, dosage, frequency, duration, instructions) — a proper 1:* relation, not a JSON blob. |
| `payments` | Amount, method, and status for a patient's (optionally appointment-linked) charge. |
| `audit_logs` | Who did what, to which entity, when — deliberately excludes clinical content. |

## Design decisions

- **`patients.user_id` is nullable and unique.** A clinic record and a portal login are separate
  concerns: reception registers the patient first (no login needed), and portal access is granted
  later as an explicit action, matching how real clinics onboard patients.
- **No JSON columns for relational data.** Prescription items, in particular, are a normalized
  child table rather than a JSON array on `prescriptions`, so they can be queried, indexed, and
  constrained individually.
- **`ON DELETE RESTRICT` on `appointments.doctor_id` / `medical_records.doctor_id` /
  `prescriptions.doctor_id`.** A doctor with clinical history attached can be deactivated
  (`doctors.status`) but not hard-deleted, preserving the audit trail.
- **`ON DELETE CASCADE` on `patient_id` foreign keys.** Deleting a patient record removes their
  dependent appointments/records/prescriptions/payments — appropriate for a system with no
  standing production data yet; this is revisited before any real deployment.
- **Migration runner** (`server/src/db/migrate.js`) tracks applied files in a `schema_migrations`
  table and is safe to re-run — it only applies files it hasn't seen before.

## Running migrations & seed

```bash
npm run db:migrate
npm run db:seed
```

See the [README](../README.md#database-setup) for prerequisites and environment configuration.
