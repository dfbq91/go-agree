# Implementation Plan: Contract Dashboard

**Branch**: `006-contract-dashboard` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

---

## Summary

Implement the authenticated Contract Dashboard for `go-agree`, providing users with complete visibility into all their contract generations, progress tracking, and lifecycle management.

Key capabilities:
1. **6-Column Responsive Contract Table**: Desktop semantic `<table>` and mobile-adaptive cards displaying **Título**, **Preguntas respondidas** (simple count of answered questions), **Descargar**, **Fecha de creación**, **Última modificación**, and **Acciones (Eliminar)**, sorted chronologically by last modified date descending.
2. **Context-Aware Resumption**: In-progress drafts resume at the exact unanswered question index (`/questionnaire?id={id}`); completed contracts route directly to the response summary (`/questionnaire?id={id}&mode=summary`).
3. **Format-Gated Document Download**: Active only when a compiled document artifact exists, displaying an accessible dropdown menu offering choices for Word (`.docx`) and PDF (`.pdf`), and cleanly disabled with an explanatory tooltip when in progress or uncompiled.
4. **Click-to-Edit Title Renaming with Auto-Save**: In-place inline title editing directly on the table row, automatically persisting on `blur` or `Enter`, canceling on `Escape`, and validating non-empty input.
5. **Safe Deletion with Confirmation Modal**: Accessible modal dialog in Spanish requiring explicit confirmation before executing permanent deletion of the contract generation and any linked documents via database cascade (`ON DELETE CASCADE`).
6. **Inviting Empty State**: Engaging onboarding view with document illustration, Spanish copy, and a primary CTA to create the user's first contract when 0 contracts exist.

The technical approach strictly enforces Clean Architecture and Domain-Driven Design (DDD) across the monorepo:
- `packages/domain`: Entities (`ContractGeneration`), value objects (`ContractId`, `UserId`), and projection calculation utilities (`calculateAnsweredQuestionsCount`).
- `packages/application`: Use cases (`ListUserContractsUseCase`, `DeleteContractUseCase`, `UpdateTitleUseCase`) and port interfaces (`ContractRepositoryPort`, `ContractDashboardRepositoryPort`).
- `packages/infrastructure`: Concrete repository adapters (`SupabaseContractRepository`) handling multi-tenant querying, RLS enforcement, and cascade deletion.
- `apps/web`: Responsive Next.js App Router UI (`ContractList`, `ContractTableRow`, `ClickToEditTitle`, `DownloadDropdown`, `DeleteContractModal`, `DashboardEmptyState`) and API routes (`DELETE /api/contracts/[id]`, `GET /api/contracts/[id]/download`), with centralized Spanish copy in `locales/es.ts`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all packages and web app  
**Primary Dependencies**: Next.js 14+ (App Router), React 18, `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS  
**Storage**: Supabase (PostgreSQL) `contract_generations` with JSONB `answers`, `analysis_snapshots`, and `contract_documents` with Row Level Security (RLS)  
**Testing**: Vitest + React Testing Library for frontend components; Vitest for domain use cases and contract tests  
**Target Platform**: Responsive web (desktop, tablet, mobile viewports) deployed on Netlify  
**Project Type**: Full-stack web application with Hexagonal Architecture and DDD  
**Performance Goals**: Sub-second dashboard loading (<1.5s on 4G/broadband); <500ms title rename persistence; zero layout shift  
**Constraints**:
- Constitution Principle VII: Spanish (`es`) strictly required for all user-facing headers, labels, buttons, tooltips, and dialogs; English for engineering code and comments.
- Constitution Principle V: Full WCAG 2.1 Level AA compliance (keyboard navigable, visible focus rings, ARIA roles for modal dialogs and menus, >= 4.5:1 text contrast).
- Constitution Principle VI: Managed exclusively via `pnpm`.
- Out of scope: Filters, search, bulk export, multi-user contract sharing.
**Scale/Scope**: Single authenticated user viewing up to hundreds of contracts; default sorting by `updatedAt` descending.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | Single-responsibility use cases (`ListUserContractsUseCase`, `DeleteContractUseCase`, `UpdateTitleUseCase`); small, focused interfaces (`ContractDashboardRepositoryPort`); typed domain errors (`ContractNotFoundError`, `EmptyTitleError`). |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` defines core entities and answered count calculation with 0 dependencies; `application` orchestrates use cases; `infrastructure` implements storage; `apps/web` renders the presentation. |
| **III. Test-Driven Development** | **PASS** | Failing unit and integration tests written first: use-case tests with mock ports, repository contract tests, and component interaction tests for renaming, downloading, deleting, and empty states. |
| **IV. Spec & Code Synchronization** | **PASS** | Implementation plan, data model, contracts, and quickstart directly reflect `spec.md` requirements (FR-001 through FR-016, SC-001 through SC-007). |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Semantic HTML `<table>` for desktop and adaptive cards for mobile; accessible modal dialog for deletion (`role="alertdialog"`, focus trapping); keyboard shortcuts (`Enter`/`Escape`) for inline editing; minimum 44px tap targets. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Monorepo managed exclusively via `pnpm`; zero unnecessary table or modal libraries; built with standard React and Tailwind CSS primitives. |
| **VII. Language & Localization Separation** | **PASS** | English used for code identifiers, schemas, and tests; Spanish (`es`) strictly used for all table headers, empty state text, confirmation copy, and alert messages in `locales/es.ts`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/006-contract-dashboard/
├── spec.md              # Feature specification (clarified & validated)
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Architectural decisions & rationale
├── data-model.md        # Phase 1: Entities, schema, and lifecycle
├── quickstart.md        # Phase 1: Runnable verification scenarios
└── contracts/           # Phase 1: Port and API specifications
    ├── contract-dashboard-port.contract.ts
    └── contract-dashboard-api.yaml
```

### Source Code (repository layout)

```text
packages/
├── domain/
│   └── src/
│       ├── entities/
│       │   └── ContractGeneration.ts          # Aggregate root
│       ├── utils/
│       │   └── progressCalculator.ts          # Calculate answered questions count
│       └── errors/
│           └── DomainErrors.ts                # EmptyTitleError, ContractNotFoundError
├── application/
│   └── src/
│       ├── ports/
│       │   ├── ContractRepositoryPort.ts      # Augmented with delete and dashboard DTOs
│       │   └── ContractDashboardPort.ts       # Specialized dashboard query port
│       └── use-cases/
│           ├── contracts/
│           │   ├── ContractUseCases.ts        # ListUserContractsUseCase, CreateContractUseCase
│           │   └── DeleteContractUseCase.ts   # DeleteContractUseCase
│           └── questionnaire/
│               └── UpdateTitleUseCase.ts      # Reused for in-place title rename
└── infrastructure/
    └── src/
        ├── adapters/
        │   └── storage/
        │       ├── SupabaseContractRepository.ts # delete, augmented list query
        │       └── MockContractRepository.ts     # In-memory mock for tests
        └── supabase/
            └── migrations/
                └── 0004_contract_documents.sql   # Optional contract documents schema
apps/
└── web/
    └── src/
        ├── app/
        │   ├── (protected)/
        │   │   └── dashboard/
        │   │       └── page.tsx               # Server component rendering DashboardHeader & ContractList
        │   └── api/
        │       └── contracts/
        │           └── [id]/
        │               ├── route.ts           # GET (single contract) & DELETE (delete contract)
        │               ├── title/route.ts     # PATCH (in-place rename)
        │               └── download/route.ts  # GET (stream PDF or DOCX file)
        ├── components/
        │   └── dashboard/
        │       ├── ContractList.tsx           # Table container with empty state fallback
        │       ├── ContractTableRow.tsx       # Individual row / mobile card
        │       ├── ClickToEditTitle.tsx       # Inline title editing with auto-save on blur
        │       ├── DownloadDropdown.tsx       # Format menu (PDF / Word) with gating
        │       ├── DeleteContractModal.tsx    # Accessible confirmation dialog
        │       └── DashboardEmptyState.tsx    # Empty state invitation view
        └── locales/
            └── es.ts                          # Centralized Spanish dictionary
```

---

## Complexity Tracking

> **No constitutional violations detected. All principles satisfied without exemptions.**

| Principle | Decision | Rationale |
|---|---|---|
| *None* | *Standard Clean Architecture* | *No external libraries added; adheres to established patterns.* |
