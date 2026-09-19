# Implementation Plan: Document Generation

**Branch**: `007-document-generation` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

---

## Summary

Implement the automated Document Generation capability for `go-agree`, synthesizing user responses from standard baseline and dynamic questions into execution-ready legal agreements in both Word (`.docx`) and PDF (`.pdf`) formats.

Key capabilities:
1. **Automated Dual-Format Generation**: Assembles contract content in traditional Spanish commercial anatomy (*Título, Comparecientes, Declaraciones, Cláusulas Operativas, Cláusulas Particulares, Firmas*) upon questionnaire completion into downloadable `.docx` and `.pdf` files.
2. **Immediate Summary Screen Download**: Direct download actions for Word and PDF on the contract summary review screen following completion.
3. **Dashboard Retrieval Across Formats**: Format dropdown menu on the dashboard row for completed contracts.
4. **Answer Editing & Document Regeneration**: Modifying answers on a completed contract pauses downloads, displays an *"Actualización pendiente"* banner on the summary screen and a badge on the dashboard, and allows re-compiling the document to cleanly overwrite prior artifacts with zero quota penalty.
5. **Mandatory 100% Question Completeness Gate**: Contract completion and generation is blocked if any clause or question is unanswered.
6. **External Legal Advice Disclaimer**: Prominently displayed in the application UI prior to generation, keeping the contract document body clean and professional for external signing.
7. **Free Plan Quota Enforcement**: Bounded by `NEXT_PUBLIC_FREE_CONTRACTS_LIMIT` or `FREE_CONTRACTS_LIMIT` (default 3), prompting user to upgrade via `/checkout` when exceeded, while exempting regenerations of existing contracts.

The technical approach strictly enforces Clean Architecture and DDD across the monorepo:
- `packages/domain`: Domain entities (`ContractGeneration`, `ContractDocument`), value objects, and transcript formatting helper (`formatQuestionnaireTranscript`) preparing question-and-answer context for drafting.
- `packages/application`: Use cases (`GenerateContractDocumentUseCase`, `RegenerateContractDocumentUseCase`, `GetContractDocumentDownloadUseCase`) and port interfaces (`LlmContractDraftingPort`, `DocumentGeneratorPort`, `DocumentStoragePort`, `ContractRepositoryPort`, `DynamicQuestionRepositoryPort`).
- `packages/infrastructure`: Concrete LLM drafting adapter (`AiContractDraftingAdapter` via `@ai-sdk/google` + Gemini with structured Zod output), generator adapters (`DocxDocumentGeneratorAdapter` via `docx`, `PdfDocumentGeneratorAdapter` via `pdfkit`), and storage adapter (`SupabaseDocumentStorageAdapter`).
- `apps/web`: UI components (`SummaryReview.tsx`, `DownloadDropdown.tsx`, `ContractTableRow.tsx`), and API routes (`POST /api/contracts/[id]/complete`, `POST /api/contracts/[id]/regenerate`, `GET /api/contracts/[id]/download`), with centralized Spanish copy in `locales/es.ts`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all packages and web application  
**Primary Dependencies**: Next.js 16 (App Router), React 19, `@supabase/ssr`, `@supabase/supabase-js`, `docx`, `pdfkit`, `@types/pdfkit`, Tailwind CSS  
**Storage**: Supabase (PostgreSQL) `contract_generations`, `contract_documents` with RLS, and Supabase Storage bucket `contracts`  
**Testing**: Vitest for unit, use case, domain, and contract tests; React Testing Library for frontend component tests  
**Target Platform**: Responsive web (desktop, tablet, mobile viewports) deployed on Netlify / Node.js  
**Project Type**: Full-stack web application with Clean Architecture and Domain-Driven Design  
**Performance Goals**: <500ms in-memory document compilation; <5s end-to-end completion and download availability (SC-002)  
**Constraints**:
- Constitution Principle VII: Spanish (`es`) strictly required for all user-facing UI copy, alerts, notifications, and generated legal contract clauses; English for engineering code, schemas, and tests.
- Constitution Principle V: Full WCAG 2.1 Level AA compliance (keyboard navigable, visible focus rings, ARIA roles, >= 4.5:1 text contrast).
- Constitution Principle VI: Managed exclusively via `pnpm` with justified minimal dependencies (`docx` and `pdfkit` for pure Node.js compilation without headless browsers).
- Out of scope: In-app electronic signatures, human legal validation, historical versioning.
**Scale/Scope**: All completed contracts for Free and Pro users, retaining single latest version per contract.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | Single-responsibility use cases (`GenerateContractDocumentUseCase`, `RegenerateContractDocumentUseCase`, `GetContractDocumentDownloadUseCase`); small focused ports (`DocumentGeneratorPort`, `DocumentStoragePort`); explicit typed domain errors (`IncompleteQuestionnaireError`, `FreeQuotaExceededError`, `DocumentGenerationError`). |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` defines `AssembledContract` and `ContractAssemblyService` with zero framework dependencies; `application` orchestrates use cases; `infrastructure` implements `docx` and `pdfkit` adapters; `apps/web` renders UI. |
| **III. Test-Driven Development** | **PASS** | TDD non-negotiable: Unit tests for `ContractAssemblyService`, use-case unit tests with mock ports, generator adapter tests, and component interaction tests written first. |
| **IV. Spec & Code Synchronization** | **PASS** | Implementation plan, data model, contracts, and quickstart directly reflect `spec.md` requirements (FR-001 through FR-015, SC-001 through SC-006) and all 5 recorded clarifications. |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Prominent legal disclaimer callout (`role="note"`), accessible download controls with loading states (`aria-busy="true"`), visible focus outlines, and accessible "Actualización pendiente" status badges. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Managed exclusively via `pnpm`. Evaluated and justified `docx` and `pdfkit` as pure JavaScript/TypeScript libraries with zero browser or native binary overhead. |
| **VII. Language & Localization Separation** | **PASS** | English used for code identifiers, schemas, and tests; Spanish (`es`) strictly used for all UI strings, disclaimers, status badges, and generated legal contract clauses in `locales/es.ts`. |

---

## Project Structure

### Documentation (this feature)

```text
specs/007-document-generation/
├── spec.md              # Feature specification (clarified & validated)
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # This implementation plan
├── research.md          # Phase 0: Architectural decisions & rationale
├── data-model.md        # Phase 1: Entities, schema, and lifecycle
├── quickstart.md        # Phase 1: Runnable verification scenarios
└── contracts/           # Phase 1: Port and API specifications
    ├── document-generation-port.contract.ts
    └── document-generation-api.yaml
```

### Source Code (repository layout)

```text
packages/
├── domain/
│   └── src/
│       ├── entities/
│       │   ├── ContractGeneration.ts          # Aggregate root
│       │   ├── ContractDocument.ts            # Document artifact entity
│       │   └── FreeQuotaConfig.ts             # Quota resolver
│       ├── formatters/
│       │   └── formatQuestionnaireTranscript.ts # Formats Q&A into legal transcript for LLM
│       └── errors/
│           └── DomainErrors.ts                # IncompleteQuestionnaireError, FreeQuotaExceededError
├── application/
│   └── src/
│       ├── ports/
│       │   ├── LlmContractDraftingPort.ts     # Port for LLM-powered contract drafting
│       │   ├── DocumentGeneratorPort.ts       # docx & pdf compilation port
│       │   ├── DocumentStoragePort.ts         # storage & retrieval port
│       │   └── ContractRepositoryPort.ts      # updated with isRegenerationPending
│       └── use-cases/
│           └── documents/
│               ├── GenerateContractDocumentUseCase.ts
│               ├── RegenerateContractDocumentUseCase.ts
│               └── GetContractDocumentDownloadUseCase.ts
├── infrastructure/
│   └── src/
│       ├── adapters/
│       │   ├── llm/
│       │   │   ├── AiContractDraftingAdapter.ts   # Vercel AI SDK + Gemini structured output
│       │   │   └── MockContractDraftingAdapter.ts # Fast deterministic test mock
│       │   ├── document/
│       │   │   ├── DocxDocumentGeneratorAdapter.ts # docx OpenXML compiler
│       │   │   ├── PdfDocumentGeneratorAdapter.ts  # pdfkit PDF compiler
│       │   │   ├── MockDocumentGeneratorAdapter.ts # Test mock
│       │   │   └── SupabaseDocumentStorageAdapter.ts # Supabase Storage / DB adapter
│       │   └── storage/
│       │       └── SupabaseContractRepository.ts   # updated projection with isRegenerationPending
│       └── supabase/
│           └── migrations/
│               └── 0004_contract_documents.sql    # schema & RLS
apps/
└── web/
    └── src/
        ├── app/
        │   └── api/
        │       └── contracts/
        │           └── [id]/
        │               ├── complete/route.ts       # validates 100% answers, quota, generates docs
        │               ├── regenerate/route.ts     # recompiles & overwrites docs (0 quota)
        │               └── download/route.ts       # streams real .docx / .pdf file
        ├── components/
        │   ├── questionnaire/
        │   │   └── SummaryReview.tsx              # legal disclaimer, completeness check, downloads, regeneration banner
        │   └── dashboard/
        │       ├── DownloadDropdown.tsx           # downloads menu or disabled state
        │       └── ContractTableRow.tsx           # renders "Actualización pendiente" badge
        └── locales/
            └── es.ts                              # centralized Spanish copy for disclaimer, banners, buttons
```

**Structure Decision**: Monorepo with Clean Architecture (`packages/domain`, `packages/application`, `packages/infrastructure`, and `apps/web`), adhering to the Inward Dependency Rule.

---

## Complexity Tracking

> No constitutional violations. All principles satisfied.
