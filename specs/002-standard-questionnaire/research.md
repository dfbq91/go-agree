# Phase 0 Research: Standard Questionnaire

**Feature**: `002-standard-questionnaire`  
**Date**: 2026-09-08  
**Status**: Completed  

---

## 1. Questionnaire Engine Architecture & Polymorphic Extensibility

- **Decision**: Implement a schema-driven, polymorphic questionnaire engine governed by Domain-Driven Design (DDD):
  - In `packages/domain`: Define pure entities and value objects:
    - `QuestionnaireDefinition`: Immutable catalog containing ordered `Question` definitions and dependency rules.
    - `Question`: Defines `id`, `order`, `prompt`, `type`, `isRequired`, `helpText`, `tooltip`, `options`, and optional `condition`.
    - `QuestionType`: String literal union `'open_text' | 'single_choice' | 'multiple_choice' | 'checkbox'`.
    - `QuestionOption`: Represents selectable choices with optional explanatory tooltips.
    - `ConditionRule`: Deterministic condition evaluating dependencies on previous answers (e.g., Q4 modality, duration > 12 months, automatic renewal).
    - `AnswerValue`: Value object encapsulating validated user response data.
  - In `apps/web`: Implement a polymorphic UI registry mapping `QuestionType` to dedicated presentation components (`OpenTextQuestion`, `SingleChoiceQuestion`, `MultipleChoiceQuestion`, `CheckboxQuestion`), all implementing a uniform `QuestionComponentProps` contract.
- **Rationale**: Enforces Principle I (Single Responsibility, Open/Closed) and Principle II (Clean Architecture). Adding future question types (e.g., date pickers, numeric currency inputs, file uploads) requires registering a new type discriminator and component without altering the traversal, validation, or persistence engine.
- **Alternatives Considered**:
  - *Hardcoded multi-step wizard components*: Rejected because embedding question definitions directly into React components couples legal content to presentation, prevents reuse, and violates OCP.
  - *Third-party form engines (Formik, React Hook Form, Typeform embeds)*: Rejected per Principle VI (Minimal Dependencies); native React state with pure domain validation provides complete control over accessibility, persistence, and Spanish copy.

---

## 2. Incremental Persistence & Resilient Autosave Strategy

- **Decision**: Multi-tier persistence combining immediate discrete saves, debounced free-text saves, and local transient fallback:
  - *Selection / Checkbox questions*: Trigger immediate persistence on selection change.
  - *Open text questions*: Debounced autosave (400ms after user pauses typing), immediate save on input blur (`onBlur`), and mandatory save upon clicking "Siguiente".
  - *Application Use Case*: `UpdateQuestionnaireProgressUseCase` updates the `ContractGeneration` aggregate, persisting `currentQuestionIndex` and `answers` JSONB via `ContractRepositoryPort`.
  - *Client resilience*: Active unsubmitted input is tracked in local component state to survive momentary connection drops. When offline, an accessible warning banner ("Error de conexión. Tus datos están a salvo localmente. Reintentando...") appears and autosave resumes upon network reconnection.
- **Rationale**: Satisfies User Story 2, FR-010, FR-011, SC-002, and acceptance criteria. Eliminates data loss when users close the tab, switch devices, or experience transient network drops.
- **Alternatives Considered**:
  - *Save only on "Siguiente"*: Rejected because users who close the browser midway while typing an answer would lose their current response.
  - *Local-only persistence (IndexedDB/localStorage)*: Rejected because the contract generation must be accessible and resumable across multiple devices from the authenticated dashboard (FR-011, SC-002).

---

## 3. Deterministic Conditional Branching & Obsolete Answer Pruning

- **Decision**: Evaluate conditional visibility through a pure domain function `isQuestionVisible(question, answers)`:
  - *Question 4a (one-time deadline)*: Evaluated when `answers['q4_modality'] === 'one_time'`.
  - *Question 4b (recurring duration)*: Evaluated when `answers['q4_modality'] === 'recurring'`.
  - *Question 5 (service provider profile)*: Evaluates options including personnel, vehicles, and the mutually exclusive opt-out ("No aplica / Adquisición de bienes sin personal ni vehículos") per Clarification Q1.
  - *Question 7 (price increase mechanism)*: Evaluated when `answers['q4_modality'] === 'recurring'` and `answers['q4b_duration_months'] > 12`.
  - *Question 9a (renewal notice period)*: Evaluated when `answers['q9_renewal'] === 'automatic_renewal'`.
  - *Obsolete Answer Pruning*: Whenever an answer modification changes a parent question, a domain service (`pruneInactiveAnswers`) scans all subsequent questions and strips any stored answers whose conditions are no longer met.
- **Rationale**: Prevents data corruption and contradictory clauses in downstream contract compilation (e.g., an agreement marked "one-time" having a lingering 12-month CPI price escalation clause).
- **Alternatives Considered**:
  - *Keep obsolete answers hidden in storage*: Rejected because downstream legal contract generation would read corrupted or orphaned answer keys from the JSONB payload.

---

## 4. Contextual Guidance, Tooltips & WCAG 2.1 AA Accessibility

- **Decision**:
  - *Tooltips*: Accessible hover/focus popovers using semantic HTML with `aria-describedby` linking option labels to tooltip description IDs. Dismissible via `Escape` key and fully readable by screen readers.
  - *Expandable Rationale*: "¿Por qué te preguntamos esto?" implemented using accessible disclosure patterns (`<button aria-expanded="..." aria-controls="...">` with associated content container), providing plain-language legal explanation.
  - *Focus Management*: When navigating between questions via "Siguiente" or "Anterior", programmatic keyboard focus moves to the question heading (`h2`) with `tabIndex={-1}`, announcing the new question to assistive technologies immediately.
  - *Form Validation*: Validation errors are rendered in Spanish inside live regions (`role="alert"` and `aria-live="polite"`).
- **Rationale**: Satisfies Constitution Principle V (Accessibility) and User Story 4. Ensures legal guidance is accessible to users of screen readers, keyboard-only users, and those on mobile devices.
- **Alternatives Considered**:
  - *Native browser `title` attribute for tooltips*: Rejected because native `title` is inaccessible to keyboard users, cannot be styled, and fails WCAG 2.1 AA touch target guidelines.

---

## 5. Sequential Default Contract Title Generation & Inline Editing

- **Decision**:
  - *Default Title*: When a new contract generation is initiated, the application computes the next sequence number: `N = (count of user's existing contracts) + 1`, generating default title `"Mi Contrato N"`.
  - *Inline Editing*: The questionnaire header displays the title with an "Editar título" button. Clicking the title activates an inline text input with autofocus.
  - *Validation & Save*: The title is saved on `blur` or pressing `Enter`. If the user submits an empty or whitespace-only title, the editor reverts to the previous valid title without corrupting state.
- **Rationale**: Satisfies User Story 5, FR-012, FR-013, and SC-007. Gives users immediate contract identification while allowing personalization.
- **Alternatives Considered**:
  - *Require user to enter a title before starting the questionnaire*: Rejected because it introduces upfront cognitive friction before the user has even described their contract need.

---

## 6. End-of-Questionnaire Summary & Transition

- **Decision**:
  - Upon completing Question 11, the user advances to a "Resumen de Respuestas" (Summary Review) screen presenting all answered questions and selected values in structured cards with "Modificar" (Edit) jump links.
  - A primary action button "Confirmar cuestionario" transitions the contract generation `status` to `completed` for the standard questionnaire phase, making it ready for downstream LLM dynamic analysis.
- **Rationale**: Gives users a comprehensive overview to review their baseline requirements and ensures confidence before finalizing the baseline contract specification.
