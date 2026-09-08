# Quickstart & Verification Guide: Identity and User Accounts

**Feature**: `001-user-auth`  
**Date**: 2026-09-07  
**Status**: Ready  

---

## Prerequisites

- Node.js LTS (>= 20.x)
- `pnpm` (>= 9.x) — Non-negotiable package manager (Constitution Principle VI)
- Supabase local instance or Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

---

## Environment Setup

Create `.env.local` inside `apps/web/` (or root `.env` for workspace):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Install workspace dependencies:

```bash
pnpm install
```

Apply database migrations:

```bash
pnpm --filter infrastructure run db:push
# or via supabase CLI: supabase db push
```

---

## Automated Verification Scenarios

### 1. Execute Domain & Application Unit Tests (TDD Verification)

Runs unit tests for `UserAccount`, `Email`, `PasswordHash`, and all auth use cases (`RegisterUserUseCase`, `LoginWithEmailUseCase`, `GetSessionUseCase`, etc.):

```bash
pnpm --filter @go-agree/domain test
pnpm --filter @go-agree/application test
```

**Expected Outcome**: 100% test pass rate with zero errors, validating all invariant rules and error mappings.

### 2. Execute AuthPort Contract Tests

Runs contract tests against `AuthPort` implementations to ensure behavior adheres strictly to [auth-port.contract.ts](./contracts/auth-port.contract.ts):

```bash
pnpm --filter @go-agree/infrastructure test:contract
```

**Expected Outcome**: All contract test assertions pass for both `MockAuthAdapter` and `SupabaseAuthAdapter`.

### 3. Execute Frontend Route Protection & Component Tests

Tests the Next.js middleware route protection, login/register form rendering, accessibility attributes, and error displays:

```bash
pnpm --filter @go-agree/web test
```

**Expected Outcome**: Tests pass confirming:
- Unauthenticated requests to `/dashboard` and `/questionnaire` are intercepted and redirected to `/login?redirect=...`.
- Authenticated requests are allowed through.
- Forms render in Spanish with proper `aria-live` and `role="alert"` attributes.

---

## Manual End-to-End Verification Flow

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser and execute these 4 verification journeys:

### Journey 1: Email Registration & Dashboard Access
1. From the public landing page (`/`), click **"Registrarse"** (`/register`).
2. Enter a new email `test-user@example.com` and a password with >= 8 characters.
3. Submit the form: Confirm instant redirection to the authenticated `/dashboard`.
4. Confirm dashboard shows an empty state for contracts in Spanish ("Aún no tienes contratos generados") and an accessible **"Cerrar sesión"** button.

### Journey 2: Route Protection & Redirection
1. Click **"Cerrar sesión"** to log out: Confirm redirection to the public landing page.
2. In the browser address bar, directly type `http://localhost:3000/dashboard` or `http://localhost:3000/questionnaire`.
3. Confirm the system intercepts the navigation and redirects to `/login?redirect=%2Fdashboard`.
4. Log in using `test-user@example.com` and your password.
5. Confirm that after successful login, you are automatically redirected to `/dashboard` (preserving target destination).

### Journey 3: "Continuar con Google" & Account Linking
1. From `/login`, click **"Continuar con Google"**.
2. Complete Google consent in the OAuth window.
3. Confirm return to `/dashboard` in an authenticated state.
4. If the Google account shares the same email as the password account, verify that both providers are linked without duplicating user data.

### Journey 4: Session Persistence (30-Day Window)
1. While logged in on `/dashboard`, close the browser window completely.
2. Reopen the browser and navigate directly to `http://localhost:3000/dashboard`.
3. Confirm the session persists immediately without prompting for login credentials (0-click resumption).
