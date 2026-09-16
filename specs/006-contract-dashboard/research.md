# Technical Research & Architectural Decisions: Contract Dashboard

**Branch**: `006-contract-dashboard` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

---

## 1. Dashboard Layout & Responsive Table Presentation

### Decision
Implement the contracts list as a responsive table/card hybrid component using Tailwind CSS and Next.js (App Router):
- **Desktop & Tablet (>= 640px)**: Semantic HTML `<table>` (`<thead role="rowgroup">`, `<tbody role="rowgroup">`, `<th scope="col">`, `<td role="cell">`) displaying the 6 required columns (**Título**, **Preguntas respondidas**, **Descargar**, **Fecha de creación**, **Última modificación**, **Acciones**).
- **Mobile (< 640px)**: Adaptive cards view (`role="list"` with `role="listitem"`) stacking the contract title, status/progress, dates, and actions cleanly without horizontal scroll blowout.
- Fulfills **WCAG 2.1 Level AA** standards with visible focus outlines (`focus:ring-2 focus:ring-primary-500`), accessible column headers, and localized Spanish copy.

### Rationale
A 6-column table contains dense metadata. On small screens, forcing horizontal table scrolling creates poor usability and hides actions like Delete and Download. An adaptive layout provides optimal readability and finger-tap target sizing (minimum 44x44px per WCAG) while desktop users enjoy structured columnar comparison.

### Alternatives Considered
- *Pure horizontal scrolling table on all screen sizes*: Rejected because users on mobile devices miss rightmost action columns and encounter awkward horizontal swipe conflicts.
- *CSS-only table without semantic HTML elements*: Rejected because assistive technologies (screen readers) rely on native table semantics (`<th scope="col">`, `<table role="table">`) for heading announcements.

---

## 2. Dashboard Data Projection & Answer Count Aggregation

### Decision
Augment the contract listing projection to return `ContractDashboardItemDTO` (or extended `ContractGenerationSummaryDTO`):
```typescript
export interface ContractDashboardItemDTO {
  id: string;
  userId: string;
  title: string;
  status: 'in_progress' | 'completed';
  currentQuestionIndex: number;
  questionsAnsweredCount: number;
  hasGeneratedDocument: boolean;
  availableFormats: ('pdf' | 'docx')[];
  createdAt: Date;
  updatedAt: Date;
}
```
Calculate `questionsAnsweredCount` on the server by inspecting the stored `answers` JSONB object in `contract_generations` (counting valid answered question keys) without sending raw answer payloads to the frontend.

### Rationale
Sending raw answers JSON for every contract in the dashboard list would cause payload bloat and leak unnecessary draft answer details into the list view. Pre-aggregating the count on the server (via domain utility or repository query) yields a lean, fast payload (<10KB) allowing the dashboard to render in <1.5s per SC-001.

### Alternatives Considered
- *Sending full `ContractGenerationDTO` array to client and counting answers in React*: Rejected because answer payloads for multiple contracts degrade network performance.
- *Maintaining a denormalized counter column in Postgres*: Rejected as premature optimization that introduces synchronization bugs; calculating `Object.keys(answers)` during projection is trivial and always consistent.

---

## 3. Title Renaming Interaction (Click-to-Edit with Auto-Save on Blur)

### Decision
Implement click-to-edit inline titling on the dashboard:
- The contract title renders as a button/text element with an edit indicator.
- Clicking or pressing `Enter`/`Space` when focused activates editing mode, replacing the text with an accessible text `<input>` pre-populated with the current title and focused/selected.
- On `blur` (clicking outside) or pressing `Enter`: If the title is non-empty, triggers optimistic UI update and issues `PATCH /api/contracts/[id]/title` with `{ title: newTitle }`.
- On `Escape`: Cancels editing and reverts immediately to the original title.
- If title is empty or whitespace: Shows inline alert in Spanish ("El título no puede estar vacío") and keeps focus or reverts without saving.

### Rationale
Directly encodes Clarification Q3 (Option C). It provides a fast, frictionless spreadsheet-like experience that avoids heavyweight modals while reusing the existing `PATCH /api/contracts/[id]/title` endpoint and `UpdateTitleUseCase`.

### Alternatives Considered
- *Modal dialog ("Renombrar contrato")*: Rejected based on user preference (Option C) and because it introduces unnecessary modal state and backdrop clicks for simple title changes.
- *Explicit Save and Cancel buttons in the cell*: Rejected for visual cleanliness in a dense table layout.

---

## 4. Download Gating & Format Dropdown Interaction

### Decision
Provide format selection and gating in the "Descargar" column:
- **When `hasGeneratedDocument` is true**: Render an accessible dropdown/popover menu (`aria-haspopup="true"`, `aria-expanded`) labeled "Descargar". Activating it reveals options:
  - "Descargar PDF (.pdf)" -> triggers `GET /api/contracts/[id]/download?format=pdf`
  - "Descargar Word (.docx)" -> triggers `GET /api/contracts/[id]/download?format=docx`
- **When `hasGeneratedDocument` is false**: Render a disabled button with clear visual styling (`opacity-50 cursor-not-allowed`) and a native tooltip/helper text explaining "El documento aún no ha sido generado" (`aria-disabled="true"`).

### Rationale
Directly encodes Clarification Q2 (Option A). Empowers users to download the finalized document in their format of choice (editable Word vs printable PDF) directly from the dashboard row without an extra page step, while strictly gating against dead-end clicks when no document exists.

### Alternatives Considered
- *Single-format download without menu*: Rejected per user decision in Clarification Q2; users need both Word and PDF options.
- *Redirecting to a separate download page*: Rejected because downloading directly from the dashboard is significantly faster and more convenient.

---

## 5. Safe Deletion Flow with Confirmation Modal & Cascade Purge

### Decision
Implement contract deletion with strict safety controls:
1. Clicking the "Eliminar" button opens an accessible modal dialog (`role="alertdialog"`, `aria-labelledby`, `aria-describedby`) in Spanish:
   - Heading: "¿Eliminar contrato?"
   - Message: "¿Estás seguro de que deseas eliminar este contrato? Esta acción es permanente y eliminará tanto el borrador como los documentos generados."
   - Action buttons: "Cancelar" (default focus) and "Eliminar" (destructive button style).
2. Pressing `Escape` or clicking "Cancelar" closes the modal with zero mutations.
3. Confirming "Eliminar" disables the button, shows a spinner, and sends `DELETE /api/contracts/[id]`.
4. The server executes `DeleteContractUseCase`, verifying user ownership and deleting the row from `contract_generations`. Foreign key constraints (`ON DELETE CASCADE`) in Supabase automatically purge linked `contract_dynamic_questions` and `contract_documents`.
5. Upon successful response, the row is removed from React state immediately with an accessible live announcement (`aria-live="polite"`: "Contrato eliminado").

### Rationale
Satisfies User Story 4 and Constitution Principle I & V. Permanent deletion requires explicit confirmation to prevent catastrophic accidental data loss. Utilizing PostgreSQL `ON DELETE CASCADE` guarantees atomic, complete removal without leaving orphaned records.

### Alternatives Considered
- *Native `window.confirm`*: Rejected because it is not customizable, cannot be styled or localized cleanly, and breaks keyboard focus management standards required by WCAG 2.1 AA.
- *Soft-delete with recycle bin*: Rejected as out of scope for v1; adds schema overhead and state management complexity without requirement mandate.

---

## 6. Empty State Component with Onboarding Invitation

### Decision
When the contracts list array is empty (`contracts.length === 0`):
- Render a centered container with:
  - Document/draft icon.
  - Heading: "Aún no tienes contratos" (`es.dashboard.emptyTitle`).
  - Subtitle: "Comienza respondiendo unas sencillas preguntas para generar tu primer contrato legal personalizado." (`es.dashboard.emptySubtitle`).
  - Primary call-to-action button: "Crear mi primer contrato" routing directly to `/questionnaire` (`es.dashboard.createFirstContract`).

### Rationale
Fulfills User Story 6 and FR-014. First impressions dictate retention; an engaging empty state immediately prompts the user into the contract creation flow.

### Alternatives Considered
- *Showing an empty table with 0 rows*: Cold and confusing, leaves new users uncertain of what to do next.
