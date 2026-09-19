# Quickstart & Verification Guide: Document Generation

**Branch**: `007-document-generation` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

---

## 1. Prerequisites

- Node.js 20+ installed
- `pnpm` 10.x package manager installed
- Repository cloned and dependencies installed (`pnpm install`)
- Environment variable set for testing quota: `NEXT_PUBLIC_FREE_CONTRACTS_LIMIT=2`

---

## 2. Automated Test Commands

```bash
# Run all unit and use case tests across packages
pnpm test

# Run application layer tests specifically
pnpm --filter @go-agree/application test

# Run infrastructure layer tests (document generation & storage)
pnpm --filter @go-agree/infrastructure test

# Run web app tests (summary review & download components)
pnpm --filter @go-agree/web test
```

---

## 3. End-to-End Verification Scenarios

### Scenario 1: Dual-Format Generation and Immediate Download on Summary Screen
**Goal**: Verify that completing 100% of questions generates both Word (.docx) and PDF (.pdf) files ready for download.

1. **Setup**: Authenticate as a user and complete all standard questions (Q0 to Q11) plus any active dynamic questions for a contract.
2. **Action**: Navigate to the summary screen (`/questionnaire?id={id}&mode=summary`).
3. **Verification**:
   - The UI displays the mandatory Spanish legal advice disclaimer above the confirmation control.
   - Click the confirmation button (`"Confirmar y generar contrato"`).
   - The UI enters a loading state (`"Generando contrato..."`, `aria-busy="true"`).
   - Upon completion, download buttons appear: `"Descargar Word (.docx)"` and `"Descargar PDF (.pdf)"`.
   - Clicking `"Descargar Word (.docx)"` downloads the formatted `.docx` file.
   - Clicking `"Descargar PDF (.pdf)"` downloads the formatted `.pdf` file.
   - Both files contain the complete synthesized contract terms following traditional Spanish contract anatomy, ending with signature execution blocks.

---

### Scenario 2: Incomplete Questionnaire Validation Gate
**Goal**: Verify that contract generation is blocked if any question or clause is unanswered (FR-002 / Clarification 4).

1. **Setup**: Create a new contract and answer only questions 0 through 4, leaving subsequent questions unanswered.
2. **Action**: Attempt to navigate to the summary screen or issue `POST /api/contracts/{id}/complete`.
3. **Verification**:
   - The system halts completion and refuses to compile documents.
   - An accessible error alert in Spanish appears indicating that all questions are mandatory.
   - 0 documents are generated, and zero user quota is deducted.

---

### Scenario 3: Legal Advice Disclaimer Outside Document
**Goal**: Verify that the legal disclaimer is presented strictly in the UI and does not clutter the contract document body (FR-003 / Clarification 2).

1. **Action**: Inspect the summary screen prior to generating the contract.
2. **Verification**:
   - The prominent disclaimer is visible in the UI: `"Aviso importante: El presente contrato se genera automáticamente a partir de las respuestas suministradas... No constituye asesoría legal profesional..."`.
3. **Action**: Open the generated `.docx` and `.pdf` files.
4. **Verification**:
   - The exported documents start directly with the contract title, parties, recitals, and operative clauses.
   - No platform disclaimer banner is embedded inside the contract body or footer.
   - Formal signature blocks for both parties are present at the end.

---

### Scenario 4: Answer Editing and Document Regeneration Flow
**Goal**: Verify that editing an answer pauses downloads, displays an "Actualización pendiente" banner, and overwrites the document upon regeneration (FR-009, FR-010 / Clarification 1).

1. **Setup**: Open a completed contract that has generated documents.
2. **Action**: Click `"Modificar"` on an answer (e.g. change the delivery address or duration) and save the change.
3. **Verification**:
   - The summary screen immediately disables the download buttons.
   - A prominent banner appears: `"Actualización pendiente"` with a `"Regenerar documento"` action.
4. **Action**: Click `"Regenerar documento"`.
5. **Verification**:
   - The system re-assembles the contract with the updated answer and overwrites the previous Word and PDF files in storage.
   - Download buttons are re-enabled.
   - Downloading the updated files confirms the new answer is reflected in the operative clauses.
   - Only the single latest version is stored.

---

### Scenario 5: Dashboard Document Retrieval & Pending Regeneration Badge
**Goal**: Verify download dropdown functionality and the "Actualización pendiente" badge on the dashboard (FR-007 / Clarification 5).

1. **Setup**: Visit `/dashboard`.
2. **Clean Completed Contract**:
   - Row displays active `"Descargar"` dropdown menu with `"Descargar PDF (.pdf)"` and `"Descargar Word (.docx)"`.
3. **Edited Contract Pending Regeneration**:
   - Row displays an `"Actualización pendiente"` badge in the download column.
   - Clicking the badge links directly to `/questionnaire?id={id}&mode=summary` to review changes and trigger regeneration.

---

### Scenario 6: Free Quota Enforcement & Regeneration Exemption
**Goal**: Verify that Free accounts cannot exceed their limit, but can regenerate existing contracts freely (FR-011, FR-012, FR-013).

1. **Setup**: Set `NEXT_PUBLIC_FREE_CONTRACTS_LIMIT=2`. Authenticate as a Free user with 2 completed contracts.
2. **New Contract Attempt**:
   - Complete questions for a 3rd contract and attempt to complete.
   - Expected: Blocked with HTTP 403 `FREE_QUOTA_EXCEEDED`. The `QuotaUpgradeModal` appears with explanation and CTA to `/checkout`.
3. **Regeneration of Existing Contract**:
   - Open contract #1 or #2, modify an answer, and click `"Regenerar documento"`.
   - Expected: Regeneration completes successfully without blocking or deducting quota.
