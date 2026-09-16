# Feature Specification: Contract Dashboard

**Feature Branch**: `006-contract-dashboard`

**Created**: 2026-09-15

**Status**: Ready for Review

**Input**: User description: "Specify the context for the go-agree Contract Dashboard. Objective: Provide an authenticated user with a view of all their contract generations, with access to resume, download, or delete them. Scope: - List with the following columns: Title, Questions Answered, Download, Creation Date, Last Modified Date, and a Delete action. - Default auto-incrementing title: "My Contract 1", "My Contract 2", etc., if the user does not define their own; the user can rename it. - "Questions Answered" reflects the actual progress (standard + dynamic questions answered so far) for that generation. - Download is only available/enabled when a document has been generated for that contract generation. - Delete removes the generation and its associated document, subject to user confirmation. - From the list, the user can re-enter an incomplete generation and continue exactly where they left off. If the questionnaire is already finished, clicking on it takes the user to the response summary. - Empty state: a user with no generations sees a clear invitation to start their first contract. Out of scope: filters and advanced search, bulk export, sharing a generation with another user. Acceptance criteria: - A user sees all their generations with the defined column information, sorted in a recognizable way (e.g., by last modification). - Deleting a generation removes it from the list, making it no longer accessible. - Re-entering an incomplete generation resumes the questionnaire at the exact point where it was left off. - Re-entering a completed generation redirects the user to the response summary."

## Clarifications

### Session 2026-09-15

- Q: How should the contract generation progress be formatted in the "Preguntas respondidas" column? (FR-007) → A: Simple count of answered questions (e.g., "5 respondidas", "14 respondidas") without displaying a total denominator.
- Q: When an authenticated user clicks "Descargar" for a contract with a generated document, how should the download options be presented? (FR-008) → A: Dropdown menu with format choices offering both "PDF" and "Word (.docx)" formats directly from the dashboard row.
- Q: How should the title renaming interaction be initiated and confirmed on the dashboard? (FR-005) → A: Click-to-edit with auto-save on blur (clicking the title directly activates inline editing, saving automatically when focus leaves the input or upon pressing Enter, with Escape canceling).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contract Generations Overview & Chronological Listing (Priority: P1)

As an authenticated user managing my legal agreements, I want to see an organized, accessible dashboard listing all my contract generations with clear details (Title, Questions Answered, Download status, Creation Date, Last Modified Date, and Delete action) sorted by most recently modified, so that I have immediate visibility into all my active drafts and finalized contracts.

**Why this priority**: The contract dashboard is the primary home screen for authenticated users. Without a consolidated, clear overview of their contract generations, users cannot locate, track, or manage their agreements.

**Independent Test**: Can be tested independently by logging in with a user who has multiple contract generations in various states, navigating to the dashboard, and verifying that all records appear in a responsive table/list displaying the six required columns sorted by last modified date descending.

**Acceptance Scenarios**:

1. **Given** an authenticated user who has created contract generations, **When** they navigate to the dashboard, **Then** they see a table displaying all their contract generations, ordered by Last Modified Date in descending order (most recently updated first).
2. **Given** the contracts table, **When** rendered on screen, **Then** it presents the following six columns with clear, localized headers in Spanish:
   - **Título** (Title)
   - **Preguntas respondidas** (Questions Answered)
   - **Descargar** (Download)
   - **Fecha de creación** (Creation Date)
   - **Última modificación** (Last Modified Date)
   - **Acciones** (Delete action / Acciones de fila)
3. **Given** dates displayed in the "Fecha de creación" and "Última modificación" columns, **When** viewed by the user, **Then** they are formatted in user-friendly localized Spanish date and time format (e.g., "15 sep 2026, 14:30").
4. **Given** a user accessing the dashboard on a mobile or narrow viewport, **When** the list renders, **Then** the layout adapts responsively (e.g., stacked card list or accessible responsive table) preserving all critical column information and actions without horizontal layout breaking or truncated controls.

---

### User Story 2 - Resuming In-Progress Contracts and Inspecting Completed Summaries (Priority: P1)

As an authenticated user, I want to click on an incomplete contract generation to resume answering questions exactly where I left off, or click on a completed contract generation to view its response summary, so that I can seamlessly continue my work or review my finalized contract inputs.

**Why this priority**: Contract creation is often an interrupted workflow where users need to verify details before finishing. Allowing users to resume in-progress questionnaires from the exact question index or inspect completed summaries ensures seamless workflow continuity.

**Independent Test**: Can be tested independently by:
1. Opening an incomplete contract (e.g., answered up to Question 4), verifying that clicking it resumes directly on Question 4 with questions 0–3 answers preserved.
2. Opening a completed contract, verifying that clicking it navigates directly to the response summary view.

**Acceptance Scenarios**:

1. **Given** a contract generation with status "in_progress" (incomplete questionnaire), **When** the user clicks on a dedicated resume action ("Continuar borrador") or navigates to continue, **Then** the user is redirected to the questionnaire at the exact question where they left off, with all previously submitted answers loaded and intact.
2. **Given** a contract generation with status "completed" (finished questionnaire), **When** the user clicks on a dedicated summary action ("Ver resumen"), **Then** the user is redirected directly to the response summary view for that contract.
3. **Given** the "Preguntas respondidas" column, **When** displayed for any contract generation, **Then** it shows the accurate simple count of answered questions in Spanish (e.g., "5 respondidas", "14 respondidas"), reflecting the sum of standard baseline questions plus dynamic questions answered so far without displaying a total denominator.

---

### User Story 3 - Gated Document Download by Generation Availability & Format Selection (Priority: P1)

As an authenticated user, I want the Download action to be clearly active only when a final contract document has actually been generated, offering a format selection menu for both PDF and Word (.docx), and safely disabled with an explanatory hint when no document exists yet, so that I can easily download completed documents in my format of choice without encountering broken links or dead-end errors.

**Why this priority**: Users must be able to retrieve their generated legal documents directly from the dashboard in either editable (Word) or presentation (PDF) format. Strict visual and functional gating guarantees a reliable experience without 404 errors.

**Independent Test**: Can be tested independently by viewing a dashboard containing both a finalized contract with an exported document and an in-progress draft without a document. Verify that the finalized contract displays an active download control that opens a format dropdown ("PDF" and "Word (.docx)") and triggers file download, while the draft displays a disabled download state with explanatory guidance.

**Acceptance Scenarios**:

1. **Given** a contract generation that has an associated generated document, **When** the user activates the "Descargar" action, **Then** an accessible dropdown menu opens with format choices: "Descargar PDF (.pdf)" and "Descargar Word (.docx)".
2. **Given** the open download dropdown menu, **When** the user selects "PDF" or "Word (.docx)", **Then** the browser begins the download of the chosen document format immediately, and the menu closes.
3. **Given** the open download dropdown menu, **When** the user clicks outside or presses `Escape`, **Then** the menu closes without triggering any download.
4. **Given** a contract generation for which no document has been generated (e.g., draft in progress, or completed questionnaire awaiting document compilation), **When** the user views the "Descargar" column, **Then** the download action is visibly disabled or replaced with a descriptive indicator (e.g., "No disponible" or a tooltip stating "El documento aún no ha sido generado"), and keyboard interaction is non-actionable.

---

### User Story 4 - Safe Contract Deletion with User Confirmation (Priority: P1)

As an authenticated user, I want to delete unwanted or obsolete contract generations with an explicit confirmation step, so that the contract generation and its associated document are permanently removed from my dashboard and cannot be deleted by accident.

**Why this priority**: Accidental deletion of legal documents causes irreversible data loss and extreme user distress. Requiring explicit user confirmation before permanent removal of the record and its document safeguards user data while allowing list hygiene.

**Independent Test**: Can be tested independently by clicking the delete action on a contract, verifying that an accessible confirmation dialog opens, verifying that canceling leaves the item untouched, and verifying that confirming permanently deletes the record and document, immediately removing the row from the list.

**Acceptance Scenarios**:

1. **Given** a contract generation in the list, **When** the user activates the "Eliminar" (Delete) action, **Then** an accessible confirmation modal dialog appears in Spanish asking for confirmation (e.g., "¿Estás seguro de que deseas eliminar este contrato? Esta acción es permanente y eliminará tanto el borrador como los documentos generados.").
2. **Given** the confirmation dialog, **When** the user chooses the cancel action ("Cancelar") or presses the `Escape` key, **Then** the modal closes immediately, no data is deleted, and the contract remains unchanged in the list.
3. **Given** the confirmation dialog, **When** the user confirms the deletion ("Eliminar"), **Then** the system removes the contract generation and any associated document artifact from persistent storage, and the item immediately disappears from the dashboard list without requiring a manual page refresh.
4. **Given** a deletion in progress, **When** the user clicks "Eliminar", **Then** the confirmation button enters a busy/loading state, preventing double-clicks or repeated deletion requests.
5. **Given** a temporary network or server failure during deletion, **When** the deletion request fails, **Then** an accessible error message in Spanish is presented to the user (`role="alert"`), the modal closes or remains actionable, and the contract remains in the dashboard list.

---

### User Story 5 - Auto-Incrementing Default Titles & Click-to-Edit Renaming with Auto-Save (Priority: P2)

As an authenticated user, I want each new contract to automatically receive a sequential title ("Mi Contrato 1", "Mi Contrato 2", ...) if I do not specify one, and I want to easily rename any contract by clicking directly on its title with auto-save on blur, so that I can organize and personalize my agreements with minimal friction.

**Why this priority**: Users frequently generate multiple contracts over time. Automatic auto-incrementing naming avoids confusing identical titles, while click-to-edit with blur saving provides an effortless, responsive workflow for titling contracts.

**Independent Test**: Can be tested independently by creating multiple contracts without explicit titles and verifying they receive auto-incrementing default titles ("Mi Contrato 1", "Mi Contrato 2"), and then clicking directly on a contract title in the table, typing a new name, clicking away (blur), and verifying the updated title persists upon page reload.

**Acceptance Scenarios**:

1. **Given** a user initiating a contract generation without providing a custom title, **When** the contract is created, **Then** the system automatically assigns a default title following the sequential auto-incrementing pattern ("Mi Contrato 1", "Mi Contrato 2", etc.) based on the user's total contract count.
2. **Given** a contract listed on the dashboard, **When** the user clicks or focuses and activates the title text, **Then** the title transitions in-place into an accessible editable text input pre-populated with the current title, with text selected for immediate editing.
3. **Given** the active inline title input, **When** the user inputs a valid non-empty title and presses `Enter` or blurs the input (clicks outside), **Then** the system saves the new title to persistent storage and immediately displays the updated text in the row.
4. **Given** the active inline title input, **When** the user presses `Escape`, **Then** the editing mode is exited, no changes are saved, and the original title is preserved.
5. **Given** a user attempting to save an empty string or whitespace-only title on blur or `Enter`, **When** the change is evaluated, **Then** the system blocks submission, displays an accessible inline validation warning in Spanish ("El título no puede estar vacío"), and reverts to the previous valid title or keeps focus in the input.

---

### User Story 6 - Empty State Invitation for New Users (Priority: P2)

As an authenticated user who has not yet created any contracts, I want to see an inviting, friendly empty state with a clear call to action on my dashboard, so that I immediately understand how to start creating my first legal contract.

**Why this priority**: First impressions dictate adoption. A blank table or confusing empty screen leaves first-time users stranded. A welcoming empty state guides the user directly into the core product value proposition.

**Independent Test**: Can be tested independently by logging in with an account that has 0 contract generations and verifying that the table is replaced by a clean, centered illustration/icon, clear guidance text, and a primary button that navigates directly to start a new contract.

**Acceptance Scenarios**:

1. **Given** an authenticated user who has 0 contract generations in their account, **When** they visit the dashboard, **Then** the contracts table is replaced by an inviting empty state container.
2. **Given** the empty state container, **When** rendered, **Then** it presents:
   - A friendly document illustration or icon.
   - A clear headline in Spanish (e.g., "Aún no tienes contratos").
   - An informative subtitle explaining that contracts will appear here once started.
   - A prominent primary call-to-action button (e.g., "Crear mi primer contrato").
3. **Given** the empty state call-to-action button, **When** clicked by the user, **Then** the user is navigated to initiate a new contract generation, landing directly on Question 0 of the questionnaire.

---

### Edge Cases

- **Contract Deleted in Concurrent Session/Tab**: If a user has the dashboard open in two browser tabs and deletes a contract in Tab A, then attempts to resume or download it in Tab B, the system displays a clear, accessible Spanish notification ("Este contrato ya no está disponible") and refreshes the list rather than crashing.
- **Dynamic Questions Progress Calculation**: When dynamic questions are generated for a contract, the "Preguntas respondidas" count reflects the simple sum of standard questions answered plus dynamic questions answered (e.g., "15 respondidas"). If dynamic questions have not yet been generated (the contract is still in the standard stage), it displays the count of standard questions answered so far.
- **Very Long Custom Titles**: If a user gives a contract an unusually long title (e.g., 100+ characters), the table layout truncates the text gracefully with an ellipsis (`...`) while providing the full title via accessible title tooltip and screen reader text, preventing horizontal column blowout.
- **Rapid Double-Clicking on Delete**: The delete confirmation action is immediately disabled upon the first click, preventing duplicate deletion requests or race conditions.
- **Session Expiration During Dashboard Activity**: If the user's authentication session expires while they are on the dashboard, any subsequent action (delete, rename, resume) safely redirects to the login screen with a return URL pointing back to the dashboard.
- **Network Disconnection During Actions**: If a rename or delete operation is attempted while offline or on an interrupted connection, an accessible alert informs the user that the action could not be completed and invites them to retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a contracts list displaying all contract generations belonging to the authenticated user.
- **FR-002**: The contracts list MUST display the following six distinct columns:
  1. **Título** (Contract title, click-to-edit customizable)
  2. **Preguntas respondidas** (Simple count of standard and dynamic questions answered, e.g., "5 respondidas")
  3. **Descargar** (Document download action with format options or disabled indicator)
  4. **Fecha de creación** (Timestamp of contract creation)
  5. **Última modificación** (Timestamp of most recent contract update)
  6. **Acciones / Eliminar** (Action to delete the contract generation)
- **FR-003**: The contracts list MUST be sorted by **Última modificación** (Last Modified Date) in descending order by default, ensuring recently active contracts appear first.
- **FR-004**: The system MUST automatically assign a default auto-incrementing title following the localized pattern `"Mi Contrato N"` (where `N` represents the user's sequential contract count, e.g., "Mi Contrato 1", "Mi Contrato 2") whenever a user initiates a contract without an explicit title.
- **FR-005**: The system MUST allow users to rename any contract title directly from the dashboard via a click-to-edit interaction on the title text, automatically persisting the updated title upon input blur or pressing `Enter`, while canceling on `Escape`.
- **FR-006**: Renaming MUST validate that the new title is non-empty and contains non-whitespace characters, rejecting blank titles with an accessible validation error.
- **FR-007**: The "Preguntas respondidas" column MUST display progress as a simple count of answered questions with localized Spanish label (e.g., "5 respondidas", "14 respondidas"), reflecting the cumulative total of standard baseline questions and dynamic questions answered up to that point, without displaying a total denominator.
- **FR-008**: The Download action MUST be enabled only when a compiled document artifact exists for that contract generation. When activated, it MUST display an accessible dropdown menu offering options to download in either "PDF" (`.pdf`) or "Word" (`.docx`) format.
- **FR-009**: When no compiled document artifact exists for a contract generation (in-progress drafts or contracts awaiting compilation), the Download action MUST be disabled or display a non-actionable indicator explaining that the document is not yet generated.
- **FR-010**: Clicking on an incomplete contract generation (`status: 'in_progress'`) via a dedicated resume action ("Continuar borrador") MUST resume the questionnaire flow at the exact question where the user left off, restoring all previously submitted answers.
- **FR-011**: Clicking on a completed contract generation (`status: 'completed'`) via a dedicated summary action ("Ver resumen") MUST navigate the user directly to the response summary view.
- **FR-012**: The system MUST require explicit user confirmation before executing any contract deletion.
- **FR-013**: Confirming deletion MUST permanently delete the contract generation record and any associated generated document artifact, immediately removing it from the user's dashboard view.
- **FR-014**: When an authenticated user has zero contract generations, the system MUST display a dedicated empty state with an informative message and a prominent call-to-action button to create their first contract.
- **FR-015**: All user-facing copy, table headers, actions, tooltips, validation messages, confirmation modals, and empty state text MUST be rendered in Spanish (`es`), in strict compliance with Constitution Principle VII.
- **FR-016**: The dashboard layout MUST be responsive and accessible, fulfilling WCAG 2.1 Level AA standards with full keyboard navigability, clear focus outlines, and appropriate ARIA attributes for modals and tables (Constitution Principle V).

### Out of Scope

- Search bars and multi-criteria filtering (date filters, status filters, keyword search).
- Bulk export or multi-contract batch download (ZIP packages).
- Sharing or collaborating on contract generations with other users or external third parties.
- Document editing or in-browser PDF annotation.

### Key Entities *(include if feature involves data)*

- **ContractGeneration**: Aggregate representing an individual contract generation lifecycle.
  - `id`: Unique identifier of the contract generation.
  - `userId`: Identifier of the owning authenticated user.
  - `title`: User-visible title (defaults to "Mi Contrato N", editable by user).
  - `status`: Current status (`'in_progress'` or `'completed'`).
  - `currentQuestionIndex`: Last reached question index in the questionnaire flow.
  - `answers`: Record of answers submitted across standard and dynamic stages.
  - `createdAt`: Timestamp when the generation was initiated.
  - `updatedAt`: Timestamp of the most recent answer, title, or status update.

- **ContractDocument**: Generated legal document artifact associated with a generation.
  - `id`: Unique identifier of the document artifact.
  - `contractId`: Reference to the parent `ContractGeneration`.
  - `fileFormat`: Document format (`'docx'` or `'pdf'`).
  - `fileUrl`: Storage access URL or download path for the compiled file.
  - `generatedAt`: Timestamp when the document was compiled.

- **ContractDashboardItem** (Presentation DTO / View Model): Flattened view model projected for dashboard rendering.
  - `id`: Contract generation identifier.
  - `title`: Current title.
  - `status`: `'in_progress'` | `'completed'`.
  - `questionsAnsweredCount`: Total number of answered questions (standard + dynamic).
  - `hasGeneratedDocument`: Boolean indicating whether a downloadable document artifact exists.
  - `availableFormats`: Array of available download formats (`('pdf' | 'docx')[]`).
  - `createdAt`: Creation date.
  - `updatedAt`: Last modification date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can load and view their full list of contract generations in under 1.5 seconds on a standard broadband/4G connection.
- **SC-002**: 100% of resume actions on incomplete contract generations restore the user to the exact question where they left off, with zero answer data loss.
- **SC-003**: 100% of clicks on completed contract generations route directly to the response summary view.
- **SC-004**: 100% of contract deletions require explicit user confirmation before removal, and confirmed deletions permanently remove both the generation and document from the list without requiring a manual browser refresh.
- **SC-005**: 100% of contract generations without an existing document artifact have their download action safely disabled, eliminating broken link attempts and 404 download errors.
- **SC-006**: Users can rename any contract title and have the change reflected in persistent storage and UI in under 500 milliseconds.
- **SC-007**: 100% of dashboard interactive controls (table navigation, title renaming, download triggering, deletion confirmation modal) are accessible via keyboard navigation with visible focus states, adhering to WCAG 2.1 AA standards.

## Assumptions

- **Sorting Default**: The default sort order is Last Modified Date descending, because users are most likely to want to continue or check their most recently edited agreements.
- **Permanent Deletion**: Deletion is immediate and permanent (hard delete of generation record and associated storage files); no "recycle bin" or restoration period is implemented in this scope.
- **Document Existence Check**: A contract generation is considered to have a downloadable document if an associated document record or file asset has been generated for that contract ID.
- **Localization**: In compliance with the project constitution (Principle VII), all user-facing labels use Spanish ("Mi Contrato N", "Título", "Preguntas respondidas", "Descargar", "Fecha de creación", "Última modificación", "Eliminar").
- **Dynamic Questions Accounting**: The questions answered metric counts all answered keys present in the contract answers store that correspond to valid questions.
