# Tasks: Identity and User Accounts

**Feature**: `001-user-auth`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-09-08  
**Status**: Ready for Implementation  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo workspace initialization, tooling, and base configuration across all packages

- [X] T001 Initialize `pnpm` monorepo configuration with `pnpm-workspace.yaml` and root `package.json`
- [X] T002 [P] Configure shared TypeScript base configuration in `tsconfig.base.json`
- [X] T003 [P] Configure root linting and formatting scripts in `package.json`
- [X] T004 [P] Setup `packages/domain` package scaffolding and `package.json` with Vitest in `packages/domain/package.json`
- [X] T005 [P] Setup `packages/application` package scaffolding and `package.json` with Vitest in `packages/application/package.json`
- [X] T006 [P] Setup `packages/infrastructure` package scaffolding and `package.json` with Vitest and Supabase SDK in `packages/infrastructure/package.json`
- [X] T007 [P] Setup `apps/web` Next.js App Router workspace with Tailwind CSS and `@supabase/ssr` in `apps/web/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain primitives, typed errors, localization dictionary, port definitions, and database migrations framework

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 [P] Implement core domain errors (`DomainAuthError`, `UserAlreadyExistsError`, `InvalidCredentialsError`, `WeakPasswordError`, `InvalidEmailError`, `SessionExpiredError`) in `packages/domain/src/errors/DomainErrors.ts`
- [X] T009 [P] Implement `UserId` and `Email` value objects with RFC 5322 validation in `packages/domain/src/value-objects/Email.ts` and `packages/domain/src/value-objects/UserId.ts`
- [X] T010 [P] Implement `ContractId` value object in `packages/domain/src/value-objects/ContractId.ts`
- [X] T011 [P] Define `AuthPort` interface and DTOs per contract specification in `packages/application/src/ports/AuthPort.ts`
- [X] T012 [P] Define `ContractRepositoryPort` interface and DTOs in `packages/application/src/ports/ContractRepositoryPort.ts`
- [X] T013 [P] Create Supabase client factories for browser, server, and middleware using `@supabase/ssr` in `packages/infrastructure/src/supabase/client.ts`
- [X] T014 Create initial SQL migration for `public.user_profiles` and `public.contract_generations` with RLS policies in `packages/infrastructure/src/supabase/migrations/0001_initial_auth_and_contracts.sql`
- [X] T015 [P] Create type-safe Spanish localization dictionary for auth copy, buttons, labels, and error messages in `apps/web/src/locales/es.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel or sequentially.

---

## Phase 3: User Story 1 - Email and Password Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Allow users to register with email/password, log in, request password reset, and access their dashboard with authenticated status.

**Independent Test**: Register a new email/password user, verify redirect to `/dashboard`, log out, log in again with correct and incorrect credentials, and verify "¿Olvidaste tu contraseña?" triggers reset email.

### Tests for User Story 1 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T016 [P] [US1] Write failing unit tests for `UserAccount` entity invariants in `packages/domain/tests/UserAccount.test.ts`
- [X] T017 [P] [US1] Write failing unit tests for `RegisterUserUseCase` and `LoginWithEmailUseCase` in `packages/application/tests/RegisterAndLoginUseCases.test.ts`
- [X] T018 [P] [US1] Write failing unit tests for `RequestPasswordResetUseCase` in `packages/application/tests/RequestPasswordResetUseCase.test.ts`
- [X] T019 [P] [US1] Write failing contract tests for `AuthPort.registerWithEmail`, `AuthPort.loginWithEmail`, and `AuthPort.requestPasswordReset` in `packages/infrastructure/tests/contracts/AuthPortEmail.contract.test.ts`
- [X] T020 [P] [US1] Write failing component tests for `LoginForm`, `RegisterForm`, and `ResetPasswordForm` in `apps/web/tests/components/AuthForms.test.tsx`

### Implementation for User Story 1

- [X] T021 [US1] Implement `UserAccount` entity in `packages/domain/src/entities/UserAccount.ts` (satisfies T016)
- [X] T022 [US1] Implement `RegisterUserUseCase` in `packages/application/src/use-cases/auth/RegisterUserUseCase.ts` (satisfies T017)
- [X] T023 [US1] Implement `LoginWithEmailUseCase` in `packages/application/src/use-cases/auth/LoginWithEmailUseCase.ts` (satisfies T017)
- [X] T024 [US1] Implement `RequestPasswordResetUseCase` in `packages/application/src/use-cases/auth/RequestPasswordResetUseCase.ts` (satisfies T018)
- [X] T025 [US1] Implement email/password and password reset methods in `SupabaseAuthAdapter` in `packages/infrastructure/src/adapters/auth/SupabaseAuthAdapter.ts` (satisfies T019)
- [X] T026 [P] [US1] Implement accessible `RegisterForm` component with Spanish validation and `role="alert"` in `apps/web/src/components/auth/RegisterForm.tsx` (satisfies T020)
- [X] T027 [P] [US1] Implement accessible `LoginForm` with "¿Olvidaste tu contraseña?" link in `apps/web/src/components/auth/LoginForm.tsx` (satisfies T020)
- [X] T028 [P] [US1] Implement accessible `ResetPasswordForm` component in `apps/web/src/components/auth/ResetPasswordForm.tsx` (satisfies T020)
- [X] T029 [P] [US1] Implement register page in `apps/web/src/app/(auth)/register/page.tsx`
- [X] T030 [P] [US1] Implement login page in `apps/web/src/app/(auth)/login/page.tsx`
- [X] T031 [P] [US1] Implement password reset page in `apps/web/src/app/(auth)/reset-password/page.tsx`
- [X] T032 [US1] Implement Next.js App Router route handlers in `apps/web/src/app/api/auth/register/route.ts`, `apps/web/src/app/api/auth/login/route.ts`, and `apps/web/src/app/api/auth/reset-password/route.ts`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Protected Route Access & Redirection (Priority: P1)

**Goal**: Guard `/dashboard` and `/questionnaire` against unauthenticated access, redirecting to `/login?redirect=...` and returning the user to their intended destination upon successful login.

**Independent Test**: Navigate directly to `/dashboard` while logged out, confirm redirect to `/login?redirect=%2Fdashboard`, authenticate, and confirm automatic redirection back to `/dashboard`.

### Tests for User Story 2 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T033 [P] [US2] Write failing integration tests for Next.js route protection middleware in `apps/web/tests/middleware/routeGuard.test.ts`

### Implementation for User Story 2

- [X] T034 [US2] Implement route protection middleware using `@supabase/ssr` to guard `/dashboard` and `/questionnaire` with return URL preservation in `apps/web/src/middleware.ts` (satisfies T033)
- [X] T035 [P] [US2] Implement minimal protected dashboard page in `apps/web/src/app/(protected)/dashboard/page.tsx`
- [X] T036 [P] [US2] Implement minimal protected questionnaire page stub in `apps/web/src/app/(protected)/questionnaire/page.tsx`
- [X] T037 [US2] Update `LoginForm` and `RegisterForm` to read `redirect` search param and navigate to preserved target URL upon successful login in `apps/web/src/components/auth/LoginForm.tsx`
- [X] T038 [US2] Implement public landing page navigation in `apps/web/src/app/page.tsx` showing dashboard shortcut for authenticated users or login/register links for guests

**Checkpoint**: User Stories 1 AND 2 work seamlessly together.

---

## Phase 5: User Story 3 - Third-Party Authentication with Google (Priority: P2)

**Goal**: Enable single-click registration and login via "Continuar con Google", with automatic account linking when an account with the same verified email already exists.

**Independent Test**: Click "Continuar con Google", complete OAuth authorization, and verify landing on `/dashboard` with account linked and authenticated session active.

### Tests for User Story 3 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T039 [P] [US3] Write failing unit tests for `LoginWithGoogleUseCase` and OAuth callback handling in `packages/application/tests/LoginWithGoogleUseCase.test.ts`
- [X] T040 [P] [US3] Write failing contract tests for `AuthPort.getGoogleAuthUrl` and `AuthPort.handleOAuthCallback` in `packages/infrastructure/tests/contracts/AuthPortGoogle.contract.test.ts`

### Implementation for User Story 3

- [X] T041 [US3] Implement `LoginWithGoogleUseCase` in `packages/application/src/use-cases/auth/LoginWithGoogleUseCase.ts` (satisfies T039)
- [X] T042 [US3] Implement Google OAuth URL generator and callback exchange in `SupabaseAuthAdapter` in `packages/infrastructure/src/adapters/auth/SupabaseAuthAdapter.ts` (satisfies T040)
- [X] T043 [US3] Implement OAuth callback route handler in `apps/web/src/app/api/auth/callback/route.ts` with error handling for user cancellation
- [X] T044 [P] [US3] Implement accessible "Continuar con Google" button component with loading state and Google branding in `apps/web/src/components/auth/GoogleAuthButton.tsx`
- [X] T045 [US3] Integrate `GoogleAuthButton` into `apps/web/src/app/(auth)/login/page.tsx` and `apps/web/src/app/(auth)/register/page.tsx`

**Checkpoint**: Both Email/Password and Google OAuth authentication methods work independently and link seamlessly.

---

## Phase 6: User Story 4 - Session Persistence & Explicit Logout (Priority: P2)

**Goal**: Ensure authenticated sessions persist across page refreshes and browser restarts (30-day sliding window), and allow users to explicitly log out to terminate the session.

**Independent Test**: Log in, close browser, reopen to `/dashboard` to verify session persists; click "Cerrar sesión" and verify redirection to public landing page and rejection of protected routes.

### Tests for User Story 4 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T046 [P] [US4] Write failing unit tests for `UserSession` entity (sliding 30-day expiry check and invalidation) in `packages/domain/tests/UserSession.test.ts`
- [X] T047 [P] [US4] Write failing unit tests for `LogoutUseCase` and `GetSessionUseCase` in `packages/application/tests/SessionUseCases.test.ts`
- [X] T048 [P] [US4] Write failing contract tests for `AuthPort.logout` and `AuthPort.getCurrentSession` in `packages/infrastructure/tests/contracts/AuthPortSession.contract.test.ts`

### Implementation for User Story 4

- [X] T049 [US4] Implement `UserSession` entity in `packages/domain/src/entities/UserSession.ts` (satisfies T046)
- [X] T050 [US4] Implement `LogoutUseCase` and `GetSessionUseCase` in `packages/application/src/use-cases/auth/SessionUseCases.ts` (satisfies T047)
- [X] T051 [US4] Implement session retrieval and logout methods in `SupabaseAuthAdapter` in `packages/infrastructure/src/adapters/auth/SupabaseAuthAdapter.ts` (satisfies T048)
- [X] T052 [US4] Implement logout route handler `POST /api/auth/logout` in `apps/web/src/app/api/auth/logout/route.ts`
- [X] T053 [P] [US4] Implement accessible user menu and "Cerrar sesión" button in `apps/web/src/components/ui/UserNav.tsx`
- [X] T054 [US4] Integrate `UserNav` into protected dashboard layout in `apps/web/src/app/(protected)/layout.tsx`

**Checkpoint**: Persistent session restoration and secure multi-tab logout are verified.

---

## Phase 7: User Story 5 - Association of Contract Generations with User Account (Priority: P3)

**Goal**: Associate each contract generation with the user account who created it, enforce multi-tenant isolation via Postgres RLS, and list contracts on the user dashboard.

**Independent Test**: User A creates a contract; User B logs in and sees an empty dashboard; User A logs back in and resumes their contract generation.

### Tests for User Story 5 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T055 [P] [US5] Write failing unit tests for `ContractGeneration` entity ownership invariants in `packages/domain/tests/ContractGeneration.test.ts`
- [X] T056 [P] [US5] Write failing unit tests for `ListUserContractsUseCase` and `GetContractByIdUseCase` in `packages/application/tests/ContractUseCases.test.ts`
- [X] T057 [P] [US5] Write failing integration tests for `SupabaseContractRepository` verifying RLS isolation in `packages/infrastructure/tests/adapters/SupabaseContractRepository.test.ts`

### Implementation for User Story 5

- [X] T058 [US5] Implement `ContractGeneration` entity in `packages/domain/src/entities/ContractGeneration.ts` (satisfies T055)
- [X] T059 [US5] Implement `ListUserContractsUseCase` and `GetContractByIdUseCase` in `packages/application/src/use-cases/contracts/ContractUseCases.ts` (satisfies T056)
- [X] T060 [US5] Implement `SupabaseContractRepository` adhering to `ContractRepositoryPort` in `packages/infrastructure/src/adapters/storage/SupabaseContractRepository.ts` (satisfies T057)
- [X] T061 [P] [US5] Implement `ContractList` and `ContractCard` dashboard components in Spanish with empty states in `apps/web/src/components/dashboard/ContractList.tsx`
- [X] T062 [US5] Connect dashboard page in `apps/web/src/app/(protected)/dashboard/page.tsx` to `ListUserContractsUseCase` to display the user's contracts and provide a "Nuevo Contrato" action

**Checkpoint**: All 5 user stories are fully implemented, independently tested, and integrated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility audit, edge case resilience, and end-to-end verification

- [X] T063 [P] Perform automated WCAG 2.1 AA accessibility audit across `/login`, `/register`, `/reset-password`, and `/dashboard` using axe-core in `apps/web/tests/a11y/authA11y.test.tsx`
- [X] T064 [P] Implement network error and rapid re-submission loading states across all auth forms in `apps/web/src/components/auth/AuthSubmitButton.tsx`
- [X] T065 Execute all automated verification scenarios documented in `specs/001-user-auth/quickstart.md`
- [X] T066 Verify multi-tab session termination behavior and questionnaire in-progress session recovery in `apps/web/src/hooks/useSessionSync.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

```mermaid
graph TD
    P1[Phase 1: Setup] --> P2[Phase 2: Foundational]
    P2 --> P3[Phase 3: US1 - Email Auth (MVP)]
    P2 --> P4[Phase 4: US2 - Protected Routes]
    P3 --> P4
    P4 --> P5[Phase 5: US3 - Google OAuth]
    P4 --> P6[Phase 6: US4 - Session Persistence]
    P4 --> P7[Phase 7: US5 - Contract Ownership]
    P5 --> P8[Phase 8: Polish & Audit]
    P6 --> P8
    P7 --> P8
```

- **Setup (Phase 1)**: No dependencies — executes first.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (P1)**: Depends on Phase 2 — core MVP authentication.
- **User Story 2 (P1)**: Depends on US1 (requires login page to redirect to).
- **User Story 3 (P2)**: Can proceed in parallel with US4/US5 once US2 completes.
- **User Story 4 (P2)**: Can proceed in parallel with US3/US5 once US2 completes.
- **User Story 5 (P3)**: Depends on US2 (requires dashboard page to attach contract list).
- **Polish (Phase 8)**: Depends on all user stories completing.

### Within Each User Story

1. **TDD Tests First**: Unit and contract tests must be written and confirmed failing before implementation.
2. **Domain Models**: Entities and value objects implemented first.
3. **Application Use Cases**: Business logic implemented with port mocks.
4. **Infrastructure Adapters**: Concrete Supabase adapters implemented to satisfy contract tests.
5. **Presentation & UI Components**: Accessible Next.js components and pages implemented.
6. **Route Handlers & Integration**: Connect endpoints and middleware.

---

## Parallel Opportunities

- **Phase 1 Setup**: Tasks `T002`, `T003`, `T004`, `T005`, `T006`, `T007` can execute in parallel.
- **Phase 2 Primitives**: Tasks `T008`, `T009`, `T010`, `T011`, `T012`, `T013`, `T015` can execute in parallel.
- **Phase 3 Tests**: Tasks `T016`, `T017`, `T018`, `T019`, `T025` can be written in parallel.
- **Phase 3 UI**: Components `T026`, `T027`, `T028`, `T029`, `T030`, `T031` can be created in parallel.
- **Cross-Story Parallelism**: Once Phase 2 and US1/US2 complete, User Story 3 (Google Auth), User Story 4 (Session Persistence), and User Story 5 (Contract Ownership) can be assigned to different developers concurrently.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete **Phase 1: Setup** (Monorepo scaffolding).
2. Complete **Phase 2: Foundational** (Domain primitives, `AuthPort`, database migration, Spanish dictionary).
3. Complete **Phase 3: User Story 1** (Email/Password registration, login, password recovery).
4. **STOP and VALIDATE**: Verify registration, login, and dashboard redirect using `quickstart.md`.
5. Deploy MVP increment to Netlify staging.

### Incremental Feature Expansion
1. Deliver **User Story 2**: Add Next.js middleware route protection for `/dashboard` and `/questionnaire`.
2. Deliver **User Story 3**: Add "Continuar con Google" and automatic account linking.
3. Deliver **User Story 4**: Add 30-day sliding session persistence and explicit logout.
4. Deliver **User Story 5**: Wire Postgres RLS contract isolation and dashboard contract listing.
5. Deliver **Phase 8**: Run axe-core WCAG 2.1 AA accessibility audit and end-to-end verification.
