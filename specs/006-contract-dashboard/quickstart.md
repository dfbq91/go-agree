# Quickstart & Verification Guide: Contract Dashboard

**Branch**: `006-contract-dashboard` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

---

## 1. Prerequisites

- Node.js 20+ installed
- `pnpm` 10.x package manager installed
- Repository cloned and dependencies installed (`pnpm install`)
- Local Supabase or mock environment active for contract storage

---

## 2. Verification Scenarios

### Scenario 1: Empty State Display for First-Time Users
**Goal**: Verify that a user with 0 contracts sees the welcoming empty state.

1. **Setup**: Authenticate as a user who has never created a contract.
2. **Action**: Navigate to `/dashboard`.
3. **Expected Outcome**:
   - The contract table is not rendered.
   - The empty state view appears with the document icon, Spanish headline `"Aún no tienes contratos"` and description.
   - Activating the primary `"Crear mi primer contrato"` button navigates to `/questionnaire` starting at Question 0 with a default title (e.g. `"Mi Contrato 1"`).

---

### Scenario 2: Contract Table Display & Chronological Sorting
**Goal**: Verify that existing contract generations display all 6 columns, sorted by last modified date descending.

1. **Setup**: Ensure the user has at least 3 contract generations created at different times with different update timestamps.
2. **Action**: Visit `/dashboard`.
3. **Expected Outcome**:
   - The table renders with 6 columns: **Título**, **Preguntas respondidas**, **Descargar**, **Fecha de creación**, **Última modificación**, **Acciones**.
   - Rows are ordered by **Última modificación** descending (most recently modified at the top).
   - Dates are formatted in localized Spanish (e.g., "15 sep 2026, 14:30").
   - "Preguntas respondidas" displays the simple count of answered questions (e.g. `"5 respondidas"`, `"14 respondidas"`).

---

### Scenario 3: Resuming In-Progress vs Completed Contracts
**Goal**: Verify proper resumption routing based on contract status.

1. **Incomplete Contract**:
   - Click on a contract with status `"in_progress"` (or its `"Continuar borrador"` action).
   - Expected: Navigates to `/questionnaire?id={id}`, landing on the exact question index where left off, with prior answers restored.
2. **Completed Contract**:
   - Click on a contract with status `"completed"` (or its `"Ver resumen"` action).
   - Expected: Navigates to `/questionnaire?id={id}&mode=summary` displaying the response summary review.

---

### Scenario 4: Click-to-Edit Title Renaming with Auto-Save on Blur
**Goal**: Verify frictionless title customization directly from the dashboard row.

1. **Action**: Click directly on the title text of any contract in the dashboard table.
2. **Expected**: The title switches into an accessible text `<input>` pre-populated with the current title and focused.
3. **Save Validation**:
   - Type `"Contrato de Arriendo Oficina 202"` and click outside the input (or press `Enter`).
   - Expected: The new title is persisted via `PATCH /api/contracts/[id]/title` and displayed immediately in the row.
4. **Cancel Validation**:
   - Click another title, modify text, and press `Escape`.
   - Expected: The edit is canceled, leaving the original title unmodified.
5. **Empty Validation**:
   - Click a title, clear all text, and blur or press `Enter`.
   - Expected: An accessible error message appears ("El título no puede estar vacío"), and the title is not saved as empty.

---

### Scenario 5: Gated Document Download & Format Menu
**Goal**: Verify format dropdown menu when document exists, and disabled state when not.

1. **Draft / Uncompiled Contract**:
   - Inspect the "Descargar" column for an in-progress draft.
   - Expected: The download button is visually disabled (`aria-disabled="true"`) with a tooltip indicating "El documento aún no ha sido generado". Clicking produces no network requests.
2. **Completed Contract with Generated Document**:
   - Inspect the "Descargar" column for a finalized contract.
   - Expected: The download button is enabled.
   - Click "Descargar": A dropdown popover menu opens with "Descargar PDF (.pdf)" and "Descargar Word (.docx)".
   - Click "Descargar PDF": Downloads the `.pdf` file via `/api/contracts/[id]/download?format=pdf`.
   - Click "Descargar Word": Downloads the `.docx` file via `/api/contracts/[id]/download?format=docx`.

---

### Scenario 6: Safe Deletion with Confirmation Modal
**Goal**: Verify permanent contract and document deletion requiring confirmation.

1. **Trigger Deletion**: Click the "Eliminar" button on a contract row.
2. **Confirmation Modal**:
   - An accessible confirmation modal appears: "¿Eliminar contrato?" / "Esta acción es permanente y eliminará tanto el borrador como los documentos generados."
3. **Cancel Flow**:
   - Click "Cancelar" (or press `Escape`).
   - Expected: Modal closes, the contract remains in the table.
4. **Confirm Flow**:
   - Open modal again and click "Eliminar".
   - Expected: Button enters loading state, `DELETE /api/contracts/[id]` is sent, and upon 200 OK the row immediately vanishes from the table without full page reload.

---

## 3. Automated Test Commands

```bash
# Run unit tests across packages (domain and application)
pnpm --filter @go-agree/domain test
pnpm --filter @go-agree/application test

# Run web application component and API route tests
pnpm --filter @go-agree/web test

# Run accessibility audits & linter
pnpm lint
pnpm check
```
