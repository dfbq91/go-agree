# Quickstart & Verification Guide: Standard Questionnaire

**Feature**: `002-standard-questionnaire`  
**Date**: 2026-09-08  
**Status**: Ready  

---

## Prerequisites

- Node.js LTS (>= 20.x)
- `pnpm` (>= 9.x) — Mandatory package manager (Constitution Principle VI)
- Supabase local instance or Supabase project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Completed Feature 001 (`001-user-auth`) identity and session infrastructure

---

## Environment Setup

Verify `.env.local` inside `apps/web/` (or root `.env` for workspace):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Install dependencies:

```bash
pnpm install
```

---

## Automated Verification Scenarios

### 1. Execute Domain Model Tests (TDD Verification)

Tests pure business models, question types, conditional visibility logic, and pruning rules:

```bash
pnpm --filter @go-agree/domain test
```

**Expected Outcome**: 100% test pass rate with zero errors, validating:
- Invariants for `QuestionnaireDefinition`, `Question`, and `ConditionRule`.
- Deterministic visibility evaluation for Q4a/b, Q5, Q7, and Q9a.
- Pruning of inactive child answers when parent answers change.

### 2. Execute Application Use Case Tests

Tests application use cases (`UpdateQuestionnaireProgressUseCase`, `UpdateTitleUseCase`, `CompleteQuestionnaireUseCase`) against mock ports:

```bash
pnpm --filter @go-agree/application test
```

**Expected Outcome**: All use cases pass, verifying:
- Incremental persistence calls and validation of required questions.
- Rejection of blank or whitespace titles with `EmptyTitleError`.
- Ownership verification preventing cross-user contract access.

### 3. Execute Contract Tests for Storage Adapter

Runs contract tests against `ContractProgressPort` implementations to ensure behavior adheres to [questionnaire-port.contract.ts](./contracts/questionnaire-port.contract.ts):

```bash
pnpm --filter @go-agree/infrastructure test:contract
```

**Expected Outcome**: All contract test assertions pass for both `MockContractRepository` and `SupabaseContractRepository`.

### 4. Execute Frontend Component & Accessibility Tests

Tests the questionnaire page, question renderers, accessible tooltips, disclosures, and inline title editor:

```bash
pnpm --filter @go-agree/web test
```

**Expected Outcome**: Tests pass confirming:
- Exactly one question renders at a time (FR-001, SC-001).
- Tooltips and "¿Por qué te preguntamos esto?" expand with valid ARIA attributes (`aria-expanded`, `aria-describedby`).
- Navigation buttons are disabled during autosave debouncing to prevent double submissions.
- 100% compliance with automated WCAG 2.1 AA accessibility checks.

---

## Manual End-to-End Verification Flow

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser, log in, and execute these 5 verification journeys:

### Journey 1: New Contract Creation & Sequential Q0 Intake
1. On `/dashboard`, click **"Nuevo Contrato"**.
2. Confirm arrival at `/questionnaire` with auto-assigned title formatted as **"Mi Contrato N"** in the header.
3. Confirm exactly **one question** is visible: **Q0** ("Describe el bien o servicio que necesitas") with a multi-line text input.
4. Confirm the **"Anterior"** button is hidden or disabled.
5. Attempt to click **"Siguiente"** without entering text: Confirm an accessible Spanish alert (`role="alert"`) indicates that an answer is required.
6. Enter a description (e.g., *"Servicio de desarrollo y mantenimiento web mensual"*) and click **"Siguiente"**.
7. Confirm smooth transition to **Q1** ("¿Eres persona natural o persona jurídica?").

### Journey 2: Tooltips & Expandable Guidance
1. On **Q1**, hover over or focus (via `Tab`) the tooltip icon next to "Persona natural": Confirm tooltip popover appears with plain-language explanation.
2. Select "Persona jurídica".
3. Activate the toggle labeled **"¿Por qué te preguntamos esto?"**: Confirm explanatory text expands smoothly and `aria-expanded="true"` is set.
4. Press `Enter` or click to collapse it: Confirm text collapses.
5. Click **"Siguiente"** to advance through Q2 and Q3.

### Journey 3: Incremental Autosave & Mid-Session Resumption
1. Complete Q0 through Q3.
2. On **Q4** ("¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?"), select **"Periódico o recurrente"**.
3. Close the browser tab completely or navigate back to `/dashboard`.
4. On `/dashboard`, locate the in-progress contract and click **"Continuar cuestionario"**.
5. Confirm the questionnaire loads directly at **Q4** with "Periódico o recurrente" pre-selected and answers Q0–Q3 intact.

### Journey 4: Conditional Sub-questions & Obsolete Answer Pruning
1. In Q4, select **"Periódico o recurrente"**: Confirm sub-question **Q4b** appears asking for contract duration.
2. Select **"Mayor a 12 meses"**: Confirm that when progressing to **Q7**, the price adjustment question is presented.
3. Select **"Índice de Precios al Consumidor (IPC)"** for Q7.
4. Click **"Anterior"** repeatedly until returning to **Q4**.
5. Change Q4 from "Periódico o recurrente" to **"Entrega única"**: Confirm **Q4a** (timeframe) appears instead of Q4b.
6. Advance forward through the questionnaire: Confirm **Q7** is skipped, and the obsolete IPC answer has been cleanly pruned from persisted contract answers.

### Journey 5: Inline Title Editing & Completion
1. In the questionnaire header, click the title **"Mi Contrato 1"**.
2. Type *"Contrato Desarrollo Web 2026"* and press `Enter` or click outside: Confirm title updates immediately.
3. Clear the title completely and press `Enter`: Confirm system reverts to the previous title with an inline notification.
4. Complete through **Q11** and submit: Confirm arrival at the **"Resumen de Respuestas"** screen displaying all answered questions.
5. Click **"Confirmar cuestionario"**: Confirm contract status updates to `completed` and user is returned to the dashboard showing completed questionnaire status.
