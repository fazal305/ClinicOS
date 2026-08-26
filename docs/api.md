# API Reference

Base URL: `http://localhost:4000/api` (local dev — adjust to your configured `PORT`). All
requests/responses are JSON.

## Response envelope

Every response follows the same shape:

```json
{ "success": true, "data": { }, "error": null, "meta": null }
```

On failure:

```json
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "Invalid request data", "details": [] } }
```

`meta` carries pagination info (`page`, `pageSize`, `total`, `totalPages`) on list endpoints.

## Authentication

Protected routes require `Authorization: Bearer <accessToken>`. The access token is returned by
`/auth/login` and `/auth/refresh`; it is short-lived (default 15 minutes). A long-lived refresh
token is set automatically as an httpOnly cookie — the frontend never reads or stores it directly.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | none | Body `{ email, password }`. Returns `{ accessToken, user }` and sets the refresh cookie. |
| `POST` | `/auth/refresh` | refresh cookie | Rotates the refresh token, returns a new `{ accessToken, user }`. |
| `POST` | `/auth/logout` | refresh cookie | Revokes the current refresh token and clears the cookie. |
| `GET` | `/auth/me` | Bearer token | Returns the current user plus their role-specific profile (doctor/receptionist/patient record). |
| `GET` | `/health` | none | Liveness check: `{ status: "ok" }`. |

### Error codes

| Code | HTTP status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation; `error.details` lists each field. |
| `UNAUTHENTICATED` | 401 | Missing/invalid/expired token, or invalid login credentials. |
| `FORBIDDEN` | 403 | Authenticated, but the caller's role isn't allowed to perform this action. |
| `NOT_FOUND` | 404 | Resource or route doesn't exist. |
| `APPOINTMENT_CONFLICT` | 409 | The requested doctor already has an overlapping appointment. |
| `DUPLICATE_EMAIL` / `DUPLICATE_DEPARTMENT` | 409 | Unique constraint violation on account email / department name. |
| `INTERNAL_ERROR` | 500 | Unexpected server error — message is intentionally generic; details are logged server-side only. |

## Patients

| Method | Path | Roles | Notes |
|---|---|---|---|
| `GET` | `/patients` | ADMIN, DOCTOR, RECEPTIONIST | `?search=&page=&pageSize=&sortBy=&sortDir=` |
| `POST` | `/patients` | ADMIN, RECEPTIONIST | Auto-generates `patient_code` (`PT-0001`, …) |
| `GET` | `/patients/me` | PATIENT | Own record, resolved from the caller's linked `user_id` |
| `GET` | `/patients/:id` | ADMIN, DOCTOR, RECEPTIONIST, PATIENT(own) | |
| `PATCH` | `/patients/:id` | ADMIN, RECEPTIONIST | Partial update |

## Doctors / Departments / Receptionists

| Method | Path | Roles | Notes |
|---|---|---|---|
| `GET` | `/doctors` | all authenticated | Active doctors only; `?departmentId=` to filter |
| `GET` | `/doctors?all=true` | ADMIN | Full roster including inactive, with account email |
| `POST` | `/doctors` | ADMIN | Provisions a `users` row + `doctors` row in one call |
| `PATCH` | `/doctors/:id` | ADMIN | Edit fields, reassign department, or set `status` |
| `GET` | `/departments` | all authenticated | Active only; `?all=true` (ADMIN) includes inactive |
| `POST` / `PATCH` | `/departments`, `/departments/:id` | ADMIN | |
| `GET` / `POST` / `PATCH` | `/receptionists`, `/receptionists/:id` | ADMIN | Same provisioning pattern as doctors |

## Appointments

| Method | Path | Roles | Notes |
|---|---|---|---|
| `GET` | `/appointments` | ADMIN, DOCTOR(own), RECEPTIONIST, PATIENT(own) | `?date=&from=&to=&doctorId=&departmentId=&status=&patientId=` |
| `POST` | `/appointments` | ADMIN, RECEPTIONIST | Server-side overlap check per doctor — `409 APPOINTMENT_CONFLICT` on collision |
| `GET` | `/appointments/:id` | ADMIN, DOCTOR(own), RECEPTIONIST, PATIENT(own) | |
| `PATCH` | `/appointments/:id` | ADMIN, RECEPTIONIST | Reschedule (doctor/time/duration/type/reason) — re-checks conflicts if time or doctor changes |
| `PATCH` | `/appointments/:id/status` | ADMIN, RECEPTIONIST, DOCTOR(own, limited) | Doctors may only set `IN_PROGRESS`, `COMPLETED`, `NO_SHOW` |

## Medical records & prescriptions

| Method | Path | Roles | Notes |
|---|---|---|---|
| `POST` | `/medical-records` | DOCTOR | Optionally linked to an `appointmentId` |
| `GET` | `/medical-records?patientId=` | ADMIN, DOCTOR, PATIENT(own) | |
| `GET` | `/medical-records/:id` | ADMIN, DOCTOR, PATIENT(own) | |
| `POST` | `/prescriptions` | DOCTOR | Body includes an `items[]` array (medicine/dosage/frequency/duration/instructions), inserted transactionally |
| `GET` | `/prescriptions?patientId=` | ADMIN, DOCTOR, PATIENT(own) | Each row includes its `items[]` |
| `GET` | `/prescriptions/:id` | ADMIN, DOCTOR, PATIENT(own) | |

## Payments

| Method | Path | Roles | Notes |
|---|---|---|---|
| `GET` | `/payments` | ADMIN, RECEPTIONIST, PATIENT(own) | `?patientId=&status=&from=&to=&page=&pageSize=` |
| `POST` | `/payments` | ADMIN, RECEPTIONIST | |
| `GET` | `/payments/:id` | ADMIN, RECEPTIONIST, PATIENT(own) | |
| `PATCH` | `/payments/:id/status` | ADMIN, RECEPTIONIST | |

## Reports & audit log

| Method | Path | Roles | Notes |
|---|---|---|---|
| `GET` | `/reports/overview` | ADMIN | Dashboard cards + the last-14-days chart series in one response |
| `GET` | `/audit-logs` | ADMIN | `?page=&pageSize=` — who did what, to which entity, when |
