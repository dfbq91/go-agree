# Implementation Plan: Standard Questionnaire

**Branch**: `002-standard-questionnaire` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-standard-questionnaire/spec.md`

---

## Summary

Implement the Standard Questionnaire engine for `go-agree` to capture foundational legal agreement requirements through a focused, one-question-at-a-time intake flow. The system guides users sequentially through 12 standardized questions (Q0 to Q11), supports modular question types (`open_text`, `single_choice`, `multiple_choice`, `checkbox`), provides contextual tooltips and expandable rationale ("¿Por qué te preguntamos esto?"), ensures incremental autosave and seamless mid-session resumption across devices, allows inline editing of the auto-assigned contract title ("Mi Contrato N"), dynamically evaluates conditional sub-questions while pruning obsolete child answers, and presents a final summary review screen ("Resumen de Respuestas").

The technical approach adheres to Clean Architecture and Domain-Driven Design (DDD) across the `pnpm` monorepo:
- `packages/domain`: Pure entities (`QuestionnaireDefinition`, `Question`, `QuestionOption`, `ConditionRule`), value objects, and deterministic condition evaluation / pruning functions with zero external dependencies.
- `packages/application`: Use cases (`UpdateQuestionnaireProgressUseCase`, `UpdateTitleUseCase`, `CompleteQuestionnaireUseCase`, `GetQuestionnaireUseCase`) and port interfaces (`QuestionnaireEnginePort`, `ContractProgressPort`).
- `packages/infrastructure`: Concrete storage adapters in `SupabaseContractRepository` updating Postgres JSONB columns with Row Level Security (RLS).
- `apps/web`: Responsive Next.js UI with Tailwind CSS, polymorphic question components, accessible focus management, debounced autosave, and typed Spanish copy in `apps/web/src/locales/es.ts`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all packages and applications  
**Primary Dependencies**: Next.js 14+ (App Router), React 18, `@supabase/ssr`, `@supabase/supabase-js`, Tailwind CSS  
**Storage**: Supabase (PostgreSQL) `contract_generations` table with JSONB `answers` payload and Row Level Security (RLS)  
**Testing**: Vitest + React Testing Library for frontend components; Vitest for domain models and use cases; Vitest contract tests for `ContractProgressPort`  
**Target Platform**: Responsive web (desktop, tablet, mobile viewports) deployed on Netlify  
**Project Type**: Full-stack web application with Hexagonal Architecture and DDD  
**Performance Goals**: Sub-second question transitions; <1s autosave persistence; <400ms debounce on text inputs; zero layout shift  
**Constraints**:
- Constitution Principle VII: Spanish (`es`) strictly required for all user-facing prompts, tooltips, options, and error messages; English for all engineering code and identifiers.
- Constitution Principle V: Full WCAG 2.1 Level AA compliance (visible focus rings, screen-reader live regions, keyboard navigation `Tab`/`Space`/`Enter`, >= 4.5:1 text contrast).
- Constitution Principle VI: `pnpm` is the sole authorized package manager.
- Out of scope: Progress percentage bars, LLM-generated dynamic questions, and legal validation of answer content.
**Scale/Scope**: 12 standard questions with conditional branches; single authenticated user drafting a contract at a time.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | Polymorphic question renderers adhere to OCP; use cases maintain single responsibilities (SRP); interfaces are small and focused (`ContractProgressPort`, `QuestionnaireEnginePort`); errors are typed domain exceptions (`ContractNotFoundError`, `EmptyTitleError`, `InvalidAnswerError`). |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` defines pure question logic and pruning with 0 dependencies; `application` orchestrates use cases; `infrastructure` implements storage; `apps/web` renders the UI. |
| **III. Test-Driven Development** | **PASS** | TDD non-negotiable lifecycle planned: unit tests for question condition evaluation, use cases with mock ports, and storage contract tests (`ContractProgressPort.contract.test.ts`) precede implementation. |
| **IV. Spec & Code Synchronization** | **PASS** | Plan, data model, contracts, and quickstart directly reflect `spec.md` requirements (FR-001 through FR-018, SC-001 through SC-009). |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Single-question view optimized for mobile and desktop; accessible disclosures (`aria-expanded`, `aria-controls`); tooltips accessible via hover and focus (`aria-describedby`); focus moved to question heading on step transition. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Monorepo managed exclusively via `pnpm`; zero third-party form wizard libraries; standard native React state and domain logic. |
| **VII. Language & Localization Separation** | **PASS** | Engineering code in English; all question prompts, options, tooltips, guidance notes, and validation alerts centralized in `apps/web/src/locales/es.ts`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-standard-questionnaire/
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: Technical decisions & rationale
├── data-model.md        # Phase 1 output: Entities, question catalog, and state transitions
├── quickstart.md        # Phase 1 output: Runnable verification scenarios
└── contracts/           # Phase 1 output: Port and API specifications
    ├── questionnaire-port.contract.ts
    └── questionnaire-api.yaml
```

### Source Code (repository layout)

```text
go-agree/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (protected)/
│       │   │   │   ├── dashboard/page.tsx           # Displays contracts with resume/new actions
│       │   │   │   └── questionnaire/
│       │   │   │       └── page.tsx                 # Dynamic questionnaire host view (supports ?id=<uuid> resumption)
│       │   │   └── api/contracts/
│       │   │       ├── route.ts                     # POST: create new contract generation
│       │   │       └── [id]/
│       │   │           ├── route.ts                 # GET: retrieve contract state
│       │   │           ├── progress/route.ts        # PATCH: autosave answer & position
│       │   │           ├── title/route.ts           # PATCH: update contract title
│       │   │           └── complete/route.ts        # POST: complete standard questionnaire
│       │   ├── components/
│       │   │   ├── questionnaire/
│       │   │   │   ├── QuestionnaireContainer.tsx   # Traversal & autosave coordinator
│       │   │   │   ├── QuestionnaireHeader.tsx      # Title editor & exit control
│       │   │   │   ├── QuestionCard.tsx             # Active question layout & disclosures
│       │   │   │   ├── QuestionRenderer.tsx         # Polymorphic renderer dispatcher
│       │   │   │   ├── NavigationControls.tsx       # "Anterior", "Siguiente", status indicator
│       │   │   │   ├── SummaryReview.tsx            # End-of-questionnaire answers overview
│       │   │   │   ├── Tooltip.tsx                  # Accessible hover/focus tooltip popover
│       │   │   │   ├── ExpandableHelp.tsx           # "¿Por qué te preguntamos esto?" disclosure
│       │   │   │   └── types/
│       │   │   │       ├── OpenTextQuestion.tsx
│       │   │   │       ├── SingleChoiceQuestion.tsx
│       │   │   │       ├── MultipleChoiceQuestion.tsx
│       │   │   │       └── CheckboxQuestion.tsx
│       │   │   └── ui/
│       │   └── locales/
│       │       └── es.ts                            # Spanish prompts, tooltips, options, alerts
│       ├── tests/
│       │   └── questionnaire/
│       │       ├── QuestionnaireContainer.test.tsx
│       │       ├── QuestionRenderer.test.tsx
│       │       └── InlineTitleEditor.test.tsx
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   ├── QuestionnaireDefinition.ts       # Canonical questions & rules
│   │   │   │   ├── Question.ts                      # Question entity
│   │   │   │   └── ContractGeneration.ts            # Aggregate root with progress & pruning
│   │   │   ├── value-objects/
│   │   │   │   ├── QuestionOption.ts
│   │   │   │   ├── ConditionRule.ts
│   │   │   │   └── AnswerValue.ts
│   │   │   ├── services/
│   │   │   │   └── AnswerPruningService.ts          # Strips obsolete conditional child answers
│   │   │   ├── errors/
│   │   │   │   └── DomainErrors.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── QuestionnaireDefinition.test.ts
│   │   │   ├── ConditionRule.test.ts
│   │   │   └── AnswerPruningService.test.ts
│   │   └── package.json
│   │
│   ├── application/
│   │   ├── src/
│   │   │   ├── ports/
│   │   │   │   ├── QuestionnaireEnginePort.ts
│   │   │   │   └── ContractProgressPort.ts
│   │   │   ├── use-cases/questionnaire/
│   │   │   │   ├── GetQuestionnaireUseCase.ts
│   │   │   │   ├── UpdateQuestionnaireProgressUseCase.ts
│   │   │   │   ├── UpdateTitleUseCase.ts
│   │   │   │   └── CompleteQuestionnaireUseCase.ts
│   │   │   ├── dtos/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── infrastructure/
│       ├── src/
│       │   ├── adapters/storage/
│       │   │   ├── SupabaseContractRepository.ts    # Implementation with JSONB updates & RLS
│       │   │   └── MockContractRepository.ts        # Fast in-memory implementation for tests
│       │   └── index.ts
│       ├── tests/
│       │   └── contracts/
│       │       └── ContractProgressPort.contract.test.ts
│       └── package.json
│
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.base.json
```

**Structure Decision**: Hexagonal architecture with `pnpm` workspaces. Domain question logic and pruning rules remain strictly isolated from database drivers and UI components, making the questionnaire engine easily extensible and fully unit-testable.

---

## Complexity Tracking

> *No constitutional violations detected. Hexagonal architecture and polymorphic question rendering were selected in full compliance with Constitution Principles I, II, and VI.*

| Pattern / Component | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| **Polymorphic Question Registry** | Allows new question types (currency, date picker, file upload) to be added without modifying the core traversal engine (OCP). | Hardcoding switch-cases inside one monolithic page component creates high coupling and makes adding question types error-prone. |
| **Domain Answer Pruning Service** | Automatically strips obsolete answers when parent conditional choices change (e.g. switching recurring >12m to one-time). | Storing obsolete answers in database risks compiling contradictory legal clauses into downstream contracts. |
| **Debounced + Blur Autosave** | Guarantees zero data loss without spamming the backend API on every keystroke. | Saving only on "Siguiente" causes data loss if the user closes their browser mid-question. |

