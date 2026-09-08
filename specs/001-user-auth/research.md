# Phase 0 Research: Identity and User Accounts

**Feature**: `001-user-auth`  
**Date**: 2026-09-07  
**Status**: Completed  

---

## 1. Monorepo Structure & Clean Architecture Boundaries

- **Decision**: Implement a `pnpm` multi-package workspace layout with strict layer isolation:
  - `packages/domain`: Pure TypeScript entities (`UserAccount`, `UserSession`, `ContractGeneration`) and value objects (`Email`, `PasswordHash`, `UserId`), with zero third-party dependencies.
  - `packages/application`: Use cases (`RegisterUserUseCase`, `LoginWithEmailUseCase`, `LoginWithGoogleUseCase`, `LogoutUseCase`, `GetSessionUseCase`, `RequestPasswordResetUseCase`) and port definitions (`AuthPort`, `ContractRepositoryPort`).
  - `packages/infrastructure`: Concrete adapters (`SupabaseAuthAdapter`, `SupabaseContractRepository`) implementing application ports.
  - `apps/web`: Next.js frontend application with Tailwind CSS, UI components, Spanish localization, route handlers, and middleware.
- **Rationale**: Strictly enforces Principle I (SOLID), Principle II (Inward Dependency Rule), and Principle VI (`pnpm` package manager mandate) of the go-agree Constitution. Core business logic remains completely decoupled from web frameworks and Supabase.
- **Alternatives Considered**:
  - *Single flat project*: Rejected because it allows framework and database imports to leak into domain business logic.
  - *Heavy monorepo managers (Nx/Turborepo)*: Rejected for MVP to preserve minimal dependency footprint; native `pnpm` workspaces handle build orchestration without additional tools.

---

## 2. Authentication & Session Persistence with Supabase Auth & Next.js

- **Decision**: Use `@supabase/ssr` with Next.js App Router for cookie-based session management and route protection:
  - Session tokens are stored in secure, `HttpOnly`, `SameSite=Lax` cookies.
  - Next.js Middleware intercepts incoming requests to `/dashboard` and `/questionnaire`, checking session validity and redirecting unauthenticated visitors to `/login?redirect=<target_url>`.
  - Supabase Auth handles password hashing (Argon2/bcrypt), token issuance, 30-day sliding refresh, Google OAuth handshake, and standard password recovery emails.
- **Rationale**: Satisfies FR-006, FR-007, FR-009, FR-010, and SC-006. Cookie-based sessions prevent XSS token theft, guarantee zero-flicker server-side route protection, and maintain persistent authenticated sessions across browser restarts for up to 30 days.
- **Alternatives Considered**:
  - *Client-side localStorage auth*: Rejected because it is vulnerable to XSS and causes noticeable layout flickering or redirects after the client bundle mounts on protected pages.
  - *Custom backend session store (e.g. Redis + Express)*: Rejected as out of scope; Supabase Auth natively provides production-grade auth, OAuth, and token rotation.

---

## 3. Google OAuth & Duplicate Account Linking

- **Decision**: Configure Supabase Auth Google provider with automatic identity linking for verified email addresses (`auth.identities` table).
- **Rationale**: Satisfies FR-005 and Clarification Q1. When a user registers via email/password and later selects "Continuar con Google" using the same email address, Supabase securely links the Google identity to the existing `UserAccount` record, granting immediate dashboard access without duplicate account collisions.
- **Alternatives Considered**:
  - *Prompt for password verification prior to linking*: Rejected per user decision in Clarification Q1; Google OAuth guarantees verified email status, so automatic linking provides superior UX.
  - *Block Google sign-in and force password login*: Rejected as it introduces user friction and increases login abandonment.

---

## 4. Contract Generation Association & Row Level Security (RLS)

- **Decision**: Enforce user data ownership and multi-tenant isolation via Postgres Row Level Security (RLS) policies on the Supabase `contract_generations` table:
  ```sql
  -- Restrict all operations to the authenticated owner
  ALTER TABLE public.contract_generations ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can only access their own contract generations"
  ON public.contract_generations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  ```
- **Rationale**: Guarantees 100% data isolation (FR-014, SC-005) directly at the database engine level. Even if an application use case omits a filter, Postgres prevents cross-tenant data leakage or unauthorized contract resumption.
- **Alternatives Considered**:
  - *Application-level filtering only (`WHERE user_id = :current_user`)*: Rejected because accidental omissions in future queries could expose sensitive legal contracts to unauthorized users.

---

## 5. UI Architecture, Localization, and Accessibility (WCAG 2.1 AA)

- **Decision**: 
  - Build UI components in Next.js using Tailwind CSS and semantic HTML elements (`<main>`, `<form>`, `<label>`, `<input>`, `<button>`).
  - Manage all user-facing strings through a dedicated, type-safe Spanish dictionary (`apps/web/src/locales/es.ts`).
  - Implement full WCAG 2.1 AA compliance: visible focus rings (`focus-visible:ring-2 focus-visible:ring-primary`), accessible form labels (`htmlFor`), ARIA alert containers (`role="alert"` with `aria-live="polite"`), and minimum 4.5:1 color contrast.
- **Rationale**: Enforces Constitution Principle V (Accessibility) and Principle VII (Spanish UI copy with English engineering identifiers) without incurring external i18n package overhead.
- **Alternatives Considered**:
  - *Third-party i18n libraries (next-intl / react-i18next)*: Rejected to adhere to Principle VI (Minimal Dependencies); since the MVP interface is exclusively Spanish, a typed dictionary file is simpler, zero-runtime-cost, and robust.
  - *Prebuilt UI kit (MUI, Shadcn/Radix)*: Tailwind with clean native semantic HTML satisfies accessibility requirements with minimum code overhead and zero styling vendor lock-in.

---

## 6. Testing Strategy & Contract Tests

- **Decision**: Use Vitest for all test suites:
  - *Domain Unit Tests*: Test `UserAccount`, `UserSession`, `ContractGeneration` invariants, email validation, and password strength rules with 100% code coverage.
  - *Application Use Case Tests*: Test use cases using in-memory port mocks (`MockAuthPort`, `MockContractRepositoryPort`).
  - *Contract Tests for `AuthPort`*: Define executable contract test suites (`AuthPort.contract.test.ts`) that verify any adapter implementation (mock or Supabase) conforms to the required contract behavior.
  - *Frontend Component & Route Tests*: Test login, registration, password reset, and route guard redirects using Vitest and React Testing Library.
- **Rationale**: Enforces Constitution Principle III (Test-Driven Development Non-Negotiable) and satisfies user instructions to establish contract tests for port abstractions.
- **Alternatives Considered**:
  - *Jest*: Rejected in favor of Vitest, which shares Vite's fast transformation pipeline and native TypeScript ESM resolution.
