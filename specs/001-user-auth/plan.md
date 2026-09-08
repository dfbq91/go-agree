# Implementation Plan: Identity and User Accounts

**Branch**: `001-user-auth` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-user-auth/spec.md`

---

## Summary

Implement the Identity and User Accounts capability for `go-agree` to allow users to register and log in via email/password and Google OAuth ("Continuar con Google"), maintain persistent sessions (30-day sliding window), protect routes (`/dashboard`, `/questionnaire`), isolate contract generation records per user via Postgres Row Level Security (RLS), and enable resuming contract drafting on the user dashboard.

The architecture adopts Domain-Driven Design (DDD) and Hexagonal Architecture across a `pnpm` monorepo: pure domain models in `packages/domain`, application use cases and `AuthPort` interfaces in `packages/application`, concrete Supabase adapters in `packages/infrastructure`, and a Next.js frontend with Tailwind CSS and Spanish localization in `apps/web`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all packages and apps  
**Primary Dependencies**: Next.js 14+ (App Router), `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS  
**Storage**: Supabase (PostgreSQL) for user profiles and contract generations, with Row Level Security (RLS) enforcement  
**Testing**: Vitest + React Testing Library for frontend UI; Vitest for domain entities and application use cases; Vitest contract tests for `AuthPort`  
**Target Platform**: Responsive web (desktop and mobile viewports); frontend and backend orchestration deployed on Netlify  
**Project Type**: Full-stack web application with Hexagonal Architecture  
**Performance Goals**: MVP phase; sub-second client redirection, <10s authentication, 0-click session resumption for returning users  
**Constraints**: 
- Constitution Principle VII: Spanish (`es`) strictly mandated for all user-facing UI copy and notifications; English for all engineering code and identifiers.
- Constitution Principle V: Full WCAG 2.1 AA accessibility compliance (visible focus rings, keyboard navigability, `role="alert"` live regions).
- Constitution Principle VI: `pnpm` is the sole authorized package manager.
**Scale/Scope**: Initial low-volume MVP beta; single-user role (no complex RBAC); 1 user working on 1 contract generation at a time.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | `AuthPort` provides a small, focused interface (ISP); use cases have single responsibilities (SRP); errors are modeled as typed domain exceptions (`UserAlreadyExistsError`, `InvalidCredentialsError`, `WeakPasswordError`). |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` has 0 dependencies; `application` defines `AuthPort` and use cases; `infrastructure` implements `SupabaseAuthAdapter`; `apps/web` consumes application orchestrators. |
| **III. Test-Driven Development** | **PASS** | TDD non-negotiable lifecycle planned: unit tests for domain entities and use cases precede code; contract test suite `AuthPort.contract.test.ts` validates all adapter implementations. |
| **IV. Spec & Code Synchronization** | **PASS** | Plan, data model, and contracts directly synchronize with `spec.md` requirements (FR-001 through FR-017, SC-001 through SC-008). |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Mobile-first UI layouts; accessible semantic forms (`<form>`, `<label>`, `<input>`, `<button>`); visible focus rings; ARIA live alerts for validation feedback; >= 4.5:1 text contrast. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Managed exclusively via `pnpm` workspaces; zero redundant helper libraries; native Spanish dictionary eliminates heavy third-party i18n runtimes. |
| **VII. Language & Localization Separation** | **PASS** | Engineering codebase in English; all user-facing labels, buttons, guidance, and validation errors managed via Spanish (`es`) dictionary. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: Technical decisions & rationale
├── data-model.md        # Phase 1 output: Entities, schema, and state transitions
├── quickstart.md        # Phase 1 output: Runnable verification scenarios
└── contracts/           # Phase 1 output: Port and API specifications
    ├── auth-port.contract.ts
    └── auth-api.yaml
```

### Source Code (repository layout)

```text
go-agree/
├── apps/
│   └── web/                                 # Next.js frontend application (Netlify deployment)
│       ├── src/
│       │   ├── app/                         # App Router routes
│       │   │   ├── (auth)/                  # Public authentication route group
│       │   │   │   ├── login/page.tsx
│       │   │   │   ├── register/page.tsx
│       │   │   │   └── reset-password/page.tsx
│       │   │   ├── (protected)/             # Authenticated route group
│       │   │   │   ├── dashboard/page.tsx
│       │   │   │   └── questionnaire/page.tsx
│       │   │   ├── api/auth/                # Orchestration endpoints
│       │   │   │   ├── callback/route.ts
│       │   │   │   └── logout/route.ts
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx                 # Public landing page
│       │   ├── components/
│       │   │   ├── auth/                    # LoginForm, RegisterForm, GoogleButton
│       │   │   └── ui/                      # Accessible inputs, buttons, alerts
│       │   ├── locales/
│       │   │   └── es.ts                    # Spanish UI copy dictionary
│       │   └── middleware.ts                # Route protection guard (@supabase/ssr)
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── domain/                              # Pure domain entities and rules
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   ├── UserAccount.ts
│   │   │   │   ├── UserSession.ts
│   │   │   │   └── ContractGeneration.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── Email.ts
│   │   │   │   ├── UserId.ts
│   │   │   │   └── ContractId.ts
│   │   │   ├── errors/
│   │   │   │   └── DomainErrors.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── application/                         # Use cases and port interfaces
│   │   ├── src/
│   │   │   ├── ports/
│   │   │   │   ├── AuthPort.ts
│   │   │   │   └── ContractRepositoryPort.ts
│   │   │   ├── use-cases/auth/
│   │   │   │   ├── RegisterUserUseCase.ts
│   │   │   │   ├── LoginWithEmailUseCase.ts
│   │   │   │   ├── LoginWithGoogleUseCase.ts
│   │   │   │   ├── LogoutUseCase.ts
│   │   │   │   ├── GetSessionUseCase.ts
│   │   │   │   └── RequestPasswordResetUseCase.ts
│   │   │   ├── dtos/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── infrastructure/                      # Concrete Supabase adapters
│       ├── src/
│       │   ├── adapters/auth/
│       │   │   ├── SupabaseAuthAdapter.ts
│       │   │   └── MockAuthAdapter.ts
│       │   ├── adapters/storage/
│       │   │   └── SupabaseContractRepository.ts
│       │   ├── supabase/
│       │   │   ├── client.ts
│       │   │   └── migrations/
│       │   │       └── 0001_initial_auth_and_contracts.sql
│       │   └── index.ts
│       ├── tests/
│       │   └── contracts/
│       │       └── AuthPort.contract.test.ts
│       ├── package.json
│       └── tsconfig.json
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

**Structure Decision**: Multi-package monorepo managed with `pnpm` workspaces. This structure cleanly isolates domain business logic from infrastructure frameworks, allows reusability across future microservices, and perfectly matches the go-agree technological foundation.

---

## Complexity Tracking

> *No constitutional violations detected. Hexagonal architecture and DDD patterns were selected in full accordance with Constitution Principle II.*

| Pattern / Component | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| **Hexagonal Ports (`AuthPort`)** | Decouples use cases from Supabase SDK, enabling in-memory testing and seamless adapter replacement. | Calling Supabase directly in UI components tightly couples presentation to a third-party vendor and breaks automated unit testing. |
| **Postgres Row Level Security (RLS)** | Guarantees multi-tenant data isolation directly at the database engine level (FR-014, SC-005). | Application-only filters risk data leakage if a developer omits a `WHERE user_id = ...` clause. |
| **`@supabase/ssr` Cookie Sessions** | Eliminates UI flickering on protected routes and protects tokens against XSS. | Client `localStorage` causes unauthenticated flashes on protected routes and exposes tokens to malicious scripts. |
