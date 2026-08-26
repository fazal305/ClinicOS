# Architecture

## Overview

ClinicOS is a classic three-tier application: a React SPA, a stateless Express REST API, and a
MySQL database. The frontend and backend are independently deployable and communicate only over
JSON HTTP.

```
┌─────────────────────┐        JSON / HTTPS        ┌──────────────────────┐        SQL        ┌───────────┐
│  React SPA (client)  │ ─────────────────────────▶ │  Express API (server) │ ─────────────────▶ │  MySQL 8  │
│  Vite, JS + JSX       │ ◀───────────────────────── │  routes→controllers   │ ◀───────────────── │           │
│                      │   JWT access token in       │  →services→repos      │                    │           │
│                      │   memory + httpOnly          │                      │                    │           │
│                      │   refresh cookie             │                      │                    │           │
└─────────────────────┘                              └──────────────────────┘                    └───────────┘
```

## Backend layering

```
routes/        → HTTP method + path → controller, no logic
controllers/    → parse/validate request, call a service, shape the response
services/       → business rules (e.g. appointment conflict checks, auth flows)
repositories/   → the only layer that talks to MySQL directly
middleware/     → authenticate, requireRole, centralized error handling
validators/     → Zod schemas for request bodies
utils/          → password hashing, JWT helpers, response envelope
```

Nothing above the repository layer writes raw SQL. Nothing below the controller layer knows about
`req`/`res`. This keeps business rules (e.g. "a doctor can't be double-booked") testable
independently of HTTP.

## Authentication flow

1. `POST /api/auth/login` verifies the password with bcrypt, issues a short-lived JWT access token
   in the JSON response body, and sets a long-lived, httpOnly, rotating refresh token as a cookie
   scoped to `/api/auth`.
2. The frontend keeps the access token in memory (a Zustand store) — never in `localStorage` —
   and attaches it as `Authorization: Bearer <token>` on every API request.
3. On a `401`, an axios response interceptor calls `POST /api/auth/refresh` once, which validates
   the refresh cookie against the server-side `refresh_tokens` table, revokes it, and issues a new
   pair (rotation). The original request is retried with the new access token.
4. `POST /api/auth/logout` revokes the current refresh token server-side and clears the cookie —
   an actual session revocation, not just deleting client-side state.

## Authorization

Every role-restricted API route uses `requireRole(...)` middleware that checks `req.user.role`,
populated only from a verified JWT — never from client-supplied data. The frontend's
`ProtectedRoute` component performs the same check for UX (avoiding a flash of a page the user
can't use), but it is explicitly *not* the security boundary; removing it would not expose any
data the API doesn't already protect independently.

## Frontend structure

```
src/
  app/          route table
  components/   shared, presentational UI primitives (Button, TextField, Alert, Spinner)
  features/     one folder per domain (auth, dashboard, and — as later phases land —
                patients, appointments, doctors, prescriptions, payments, reports)
  layouts/      the authenticated app shell (top bar, role-aware nav, theme toggle)
  pages/        standalone routes that aren't tied to one feature (404, unauthorized)
  services/     the axios client and its refresh-on-401 interceptor
  store/        Zustand stores — session state and theme, not server data
  styles/       Tailwind entry point + the CSS-variable design tokens
```

Server state (anything fetched from the API) lives in TanStack Query, not Zustand — Zustand is
reserved for genuinely client-only state like the current session and the active theme.

## Design system

All color, radius, shadow, and typography values are CSS variables defined once in
`client/src/styles/tokens.css`, mapped into Tailwind's theme in `tailwind.config.js`. Components
reference Tailwind utility classes (`bg-surface`, `text-muted`, `border-border`, …), never raw hex
values, so the whole product can be re-themed by editing one file. Dark mode is a second token set
selected via `[data-theme="dark"]`, applied before first paint by an inline script in `index.html`
to avoid a flash of the wrong theme.
