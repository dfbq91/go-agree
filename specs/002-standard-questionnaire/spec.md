# Feature Specification: Standard Questionnaire

**Feature Branch**: `002-standard-questionnaire`

**Created**: 2026-09-08

**Status**: Ready for Review

**Input**: User description: "Specify the context for the go-agree Standard Questionnaire. Objective: capture, through a one-question-at-a-time flow, the baseline information required for any contract before moving on to the LLM's dynamic analysis. Scope: The first question is always: 'Describe the good or service you need' (open-ended response). A fixed set of standard questions asked to every user, in the following logical order: Are you an individual or a legal entity? (Show a tooltip briefly explaining what an individual and a legal entity are.) Under what conditions do you require the requested good/service to be delivered? (For example, for a food product, a minimum remaining shelf life before expiration.) What is the location of the contract (exact address)? Is the good or service being contracted for a one-time delivery or is it recurring over time? If one-time: delivery timeframe. If recurring: required duration. If a service provider is being contracted: Specify whether the provider will employ people or use vehicles (tooltip: this is important for defining additional obligations required by law). How would a breach by the provider affect you? If the contract lasts more than 12 months: define the price increase mechanism (renegotiation, CPI, minimum wage, or another mechanism that can be specified). Define the termination notice period that the provider must give. Specify whether there will be automatic renewal or a fixed termination date. If there is automatic renewal: define the notice period required to prevent renewal. Define any additional grounds for early termination of the contract/business, beyond those established by law. Dispute resolution mechanism (tribunal/court, etc.). Supported question types: checkbox, single selection, multiple selection, open text — the design must allow new question types to be added without rewriting the questionnaire engine. Some answer options may include a tooltip explaining their meaning. Each question may have an optional hidden 'Why are we asking you this?' field that the user can voluntarily expand. Navigation: the user can move forward, go back, and modify previously provided answers before finishing. Incremental persistence: each answer is saved as soon as it is provided; the user can close the questionnaire and resume exactly where they left off. When starting a new generation, it is assigned a default title ('My Contract 1,' 'My Contract 2,' ...) that the user can edit. Out of scope: progress bar, LLM-generated dynamic questions (these are covered in another context), and legal validation of the answer content. Acceptance criteria: A user sees only one question at a time and can move forward/backward without losing previous answers. Closing the session midway through the questionnaire and returning later restores exactly the answers provided up to that point. Changing a previously provided answer updates the saved state of that contract generation."

## Clarifications

### Session 2026-09-08

- Q: How should the questionnaire determine whether a service provider is being contracted for Question 5? → A: Include an explicit option within Question 5 (e.g., "Empleará personal", "Utilizará vehículos", and mutually exclusive "No aplica / Adquisición de bienes o sin personal ni vehículos").

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sequential One-Question-at-a-Time Intake Flow (Priority: P1)

As an authenticated user creating a contract, I want to answer baseline contract questions one at a time in a focused, uncluttered view so that I can provide all necessary contractual details without feeling overwhelmed by long legal questionnaires.

**Why this priority**: This is the core intake mechanism for contract generation. Without a functional, focused questionnaire interface, users cannot input the baseline requirements necessary for downstream legal contract compilation.

**Independent Test**: Can be tested end-to-end by initiating a new contract generation, stepping through the standard questions one by one from Question 0 to Question 11, providing valid answers at each step, and verifying that exactly one question is visible at any given moment.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the questionnaire interface for a new contract generation, **When** the page loads, **Then** the user is presented with exactly one question: Question 0 ("Describe el bien o servicio que necesitas"), with an open-ended text input and no other questions visible.
2. **Given** a user viewing the active question, **When** they input a valid answer and activate the "Siguiente" (Next) control, **Then** the view transitions smoothly to the next logical question in sequence.
3. **Given** a user on any question, **When** they have not yet entered a required answer, **Then** activating "Siguiente" prevents progression and presents a clear, accessible inline validation message in Spanish (`role="alert"`) stating that an answer is required.
4. **Given** a user progressing through the questionnaire, **When** they encounter each of the standard questions in sequence, **Then** the questions are presented in the following strict order:
   - **Q0**: Description of good or service (open-ended text).
   - **Q1**: Legal personality of contracting party (individual vs legal entity; single selection with explanatory tooltip).
   - **Q2**: Delivery conditions / acceptance requirements (open-ended text).
   - **Q3**: Contract execution location / exact address (open-ended text).
   - **Q4**: Contracting modality: one-time delivery vs recurring over time (single selection).
   - **Q5**: Service provider operational profile (employment of personnel or use of vehicles; multiple selection with options for personnel, vehicles, and a mutually exclusive opt-out for goods/non-service contracts, with legal implication tooltip).
   - **Q6**: Impact of provider breach on the user (open-ended text).
   - **Q7**: Price adjustment / increase mechanism for contracts lasting more than 12 months (conditional single selection).
   - **Q8**: Termination notice period required from the provider (single selection / structured text).
   - **Q9**: Renewal terms: automatic renewal vs fixed expiration date (single selection).
   - **Q10**: Additional grounds for early contract termination beyond statutory causes (open-ended text / structured options).
   - **Q11**: Dispute resolution mechanism (single selection: ordinary courts, arbitration, conciliation).
5. **Given** a user completing the final question (Q11), **When** they submit their answer, **Then** the questionnaire signals completion of the baseline questionnaire phase and presents a summary confirmation indicating readiness for analysis.

---

### User Story 2 - Incremental Persistence and Resumption (Priority: P1)

As an authenticated user, I want my answers to be automatically saved as soon as I provide them so that I can close my browser, switch devices, or step away at any point and return later to find my exact progress preserved.

**Why this priority**: Draft contracts require thoughtful consideration; users frequently need to gather information (e.g., exact addresses, corporate details, operational requirements) mid-way. Zero data loss during interruptions is essential for trust and retention.

**Independent Test**: Can be tested by starting a questionnaire, answering the first 4 questions, closing the browser tab, reopening the dashboard, resuming the contract, and verifying that Question 4 displays with the previously entered response and the user can advance directly to Question 5.

**Acceptance Scenarios**:

1. **Given** a user providing an answer to a question, **When** they advance to the next question or trigger an answer change, **Then** the system immediately persists the updated answer and current question index to the contract generation record.
2. **Given** a user who has answered questions Q0 through Q3 and is currently on Q4, **When** the user closes the browser session, navigates away, or logs out, **Then** all answers for Q0 through Q3 and the active position at Q4 are permanently saved.
3. **Given** a user returning to their dashboard, **When** they select their in-progress contract generation to resume, **Then** the questionnaire opens directly on Q4 with all previous answers (Q0–Q3) loaded and ready for continuation.
4. **Given** an ongoing questionnaire session, **When** a background autosave completes successfully, **Then** an unobtrusive, accessible saved status indicator in Spanish ("Guardado") briefly confirms data persistence without interrupting the user's typing or selection flow.

---

### User Story 3 - Bidirectional Navigation and Answer Modification (Priority: P2)

As a user filling out the questionnaire, I want to navigate backward to review and revise previously answered questions without losing my subsequent answers, so that I can correct errors or change my mind as I clarify my contract needs.

**Why this priority**: Users frequently refine their contract terms as they see later questions. Seamless backward and forward navigation ensures flexibility and accuracy in the captured baseline data.

**Independent Test**: Can be tested by progressing to Question 6, clicking "Anterior" three times to return to Question 3, editing the location address, clicking "Siguiente" repeatedly, and verifying the updated address is saved while subsequent answers for Questions 4, 5, and 6 remain intact.

**Acceptance Scenarios**:

1. **Given** a user on any question beyond the first (Q0), **When** they view the questionnaire controls, **Then** an "Anterior" (Previous) action is visible, keyboard-accessible, and clearly positioned.
2. **Given** a user on Question 0, **When** the page renders, **Then** the "Anterior" action is disabled or hidden because there is no prior question.
3. **Given** a user navigating back to a previously completed question, **When** the question appears, **Then** it displays the exact value previously selected or entered by the user.
4. **Given** a user who edits their answer on a previous question, **When** they advance forward, **Then** the new answer immediately overwrites the previous answer in persisted storage, updating the contract generation state.
5. **Given** a user who navigates back and forward without modifying any answers, **Then** all recorded answers are preserved unchanged.

---

### User Story 4 - Contextual Guidance, Tooltips, and Expandable Explanations (Priority: P2)

As a user without formal legal training, I want access to plain-language tooltips for technical legal terms and an optional expandable "¿Por qué te preguntamos esto?" explanation on questions so that I understand why the information matters and can make informed legal decisions.

**Why this priority**: Legal jargon (e.g., persona jurídica vs persona natural, liability for provider personnel/vehicles, arbitration vs ordinary courts) causes hesitation and drop-off. Contextual explanations empower non-lawyers to configure valid contracts with confidence.

**Independent Test**: Can be tested by focusing or hovering on the tooltip for "Persona natural / Persona jurídica" on Q1 to verify the definition appears, and activating the "¿Por qué te preguntamos esto?" toggle on Q5 to verify the explanatory text expands and collapses with proper ARIA attributes.

**Acceptance Scenarios**:

1. **Given** a user viewing Question 1 (legal personality), **When** they hover over or focus with the keyboard on the tooltip trigger next to "Persona natural" or "Persona jurídica", **Then** an accessible tooltip popover appears with a brief, plain-language Spanish explanation of the legal concept.
2. **Given** a user on any question with a hidden explanation, **When** they view the question card, **Then** an expandable disclosure toggle labeled "¿Por qué te preguntamos esto?" is available.
3. **Given** a user activating the "¿Por qué te preguntamos esto?" toggle, **When** activated via mouse click or keyboard (`Enter` / `Space`), **Then** the explanation expands smoothly, revealing the practical legal rationale, and the toggle updates its accessibility state (`aria-expanded="true"`).
4. **Given** an expanded explanation, **When** the user activates the toggle again, **Then** the explanation collapses and `aria-expanded` reverts to `false`.
5. **Given** Question 5 regarding service providers employing personnel or using vehicles, **When** the question is displayed, **Then** a prominent contextual tooltip or advisory note explains: "Esto es importante para definir obligaciones adicionales exigidas por la ley, como afiliaciones a seguridad social y pólizas de responsabilidad civil."

---

### User Story 5 - Editable Default Contract Title (Priority: P3)

As an authenticated user initiating a new contract generation, I want the system to assign an intuitive default title (e.g., "Mi Contrato 1", "Mi Contrato 2") that I can edit inline at any time, so that I can easily distinguish and organize my contracts on my dashboard.

**Why this priority**: Organizing multiple contracts requires clear identification. Automatic numbering provides immediate clarity without forcing users to invent a title before starting, while inline editing enables personalization.

**Independent Test**: Can be tested by creating two consecutive contracts to verify they receive titles "Mi Contrato 1" and "Mi Contrato 2", then clicking the title on the questionnaire header, typing "Contrato de Mantenimiento Web", saving, and verifying the new title appears in the database and dashboard.

**Acceptance Scenarios**:

1. **Given** an authenticated user who starts a new contract generation, **When** the contract is created, **Then** the system assigns a sequential default title in Spanish formatted as "Mi Contrato N" (where N is derived from the count of existing user contracts + 1).
2. **Given** a user on the questionnaire view, **When** they view the header, **Then** the contract title is prominently displayed alongside an edit control (e.g., pencil icon or clickable text).
3. **Given** a user activating the edit title control, **When** they enter a custom title (e.g., "Contrato Limpieza Oficinas 2026") and confirm (via blur or pressing `Enter`), **Then** the contract title is immediately updated and persisted to the contract generation record.
4. **Given** a user attempting to clear the title or enter whitespace only, **When** they submit the edit, **Then** the title reverts to its previous valid title without error or corrupted state.

---

### User Story 6 - Extensible Question Types and Dynamic Condition Evaluation (Priority: P3)

As an application maintainer and user, I want the questionnaire engine to support open text, single choice, multiple choice, and checkbox question types, as well as deterministic conditional sub-questions, so that new question structures can be added to the questionnaire schema without modifying the underlying UI rendering engine.

**Why this priority**: Clean architecture and Open/Closed Principle (Constitution Principle I & II) require that new question types and conditional paths can be registered modularly without rewriting core traversal, persistence, or rendering logic.

**Independent Test**: Can be tested by evaluating each question type (open text on Q0/Q2, single selection on Q1/Q4, multiple selection on Q5, checkbox on Q5 options) and verifying conditional questions activate only when their trigger conditions are met.

**Acceptance Scenarios**:

1. **Given** Question 4 ("¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?"), **When** the user selects "Entrega única", **Then** the subsequent sub-question requests the specific delivery timeframe ("Plazo de entrega").
2. **Given** Question 4, **When** the user selects "Periódico o recurrente en el tiempo", **Then** the subsequent sub-question requests the contract duration ("Duración requerida del contrato").
3. **Given** Question 7 (price adjustment mechanism), **When** the contract duration from Q4 is 12 months or less (or one-time delivery), **Then** Question 7 is automatically skipped; **When** the duration exceeds 12 months, **Then** Question 7 is presented with options (Renegociación, IPC, SMLMV, Otro mecanismo).
4. **Given** Question 9 (renewal terms), **When** the user selects "Renovación automática", **Then** a conditional sub-question is presented requiring the notice period to prevent renewal; **When** the user selects "Fecha fija de terminación", **Then** the renewal notice sub-question is omitted.
5. **Given** a user who previously answered a conditional branch (e.g., selected recurring > 12 months and answered Q7), **When** they navigate back and change Q4 to "Entrega única", **Then** the obsolete downstream conditional answer for Q7 is pruned or deactivated so that invalid data is not carried forward.

---

### Edge Cases

- **Pruning Obsolete Conditional Answers**: If a user selects "Periódico o recurrente" with duration 24 months, answers Q7 (price adjustment), and subsequently navigates back to change Q4 to "Entrega única", the system prunes or flags the inactive Q7 answer so that the generated contract does not contain contradictory clauses.
- **Network Interruption During Navigation**: If the network connection drops while submitting an answer via "Siguiente", the answer is preserved in local client memory, an accessible Spanish warning banner appears ("Error de conexión. Tus datos están a salvo localmente. Reintentando guardar..."), and navigation resumes automatically once connectivity is restored.
- **Rapid Navigation Clicks (Double Submissions)**: "Siguiente" and "Anterior" navigation buttons are debounced and disabled immediately upon click, presenting an accessible loading state to prevent race conditions or skipping questions.
- **Browser Refresh Mid-Question**: If a user refreshes the page while typing in an open text area before pressing "Siguiente", any unsubmitted keystrokes in the active input are recovered from local component draft state or restored to the last confirmed save.
- **Multi-Device Resumption**: When a user logs in from a second browser or mobile device, the contract generation loads the authoritative server-persisted state, displaying the exact `currentQuestionIndex` and previously saved answers.
- **Excessive Input Length in Open-Ended Fields**: Open text questions (Q0, Q2, Q3, Q6, Q10) enforce a reasonable upper boundary (e.g., 2,000 characters) with a visible, accessible character counter, preventing memory bloat or denial-of-service payload submissions.
- **Sanitization of Open Text**: All open text inputs are sanitized against HTML/script injection before persistence and rendering, ensuring no XSS vulnerabilities exist in user-provided answers.
- **Empty Title Reversion**: If a user deletes the contract title and attempts to save an empty string, the system rejects the blank value and reverts to the last valid title with an inline helper notification ("El título del contrato no puede estar vacío.").

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present the standard questionnaire in a strict, sequential one-question-at-a-time interface, ensuring no other questions are visible simultaneously.
- **FR-002**: System MUST present Question 0 as the initial question for every contract generation: "Describe el bien o servicio que necesitas", accepting an open-ended text response.
- **FR-003**: System MUST execute the standard questions in the exact specified logical sequence:
  1. *Q1 (Legal Personality)*: "¿Eres persona natural o persona jurídica?" (Single selection).
  2. *Q2 (Delivery Conditions)*: "¿Bajo qué condiciones requieres que se entregue el bien o servicio solicitado?" (Open text).
  3. *Q3 (Location)*: "¿Cuál es la ubicación del contrato (dirección exacta)?" (Open text).
  4. *Q4 (Delivery Modality)*: "¿El bien o servicio se contrata para una entrega única o es periódico/recurrente en el tiempo?" (Single selection).
     - *Q4a (One-time timeframe)*: Delivery timeframe/deadline.
     - *Q4b (Recurring duration)*: Required duration of the contract.
  5. *Q5 (Service Provider Operational Profile)*: "Si se contrata a un proveedor de servicios: Especifica si el proveedor empleará personal o utilizará vehículos" (Multiple selection with options: "Empleará personal", "Utilizará vehículos", and a mutually exclusive option "No aplica / Adquisición de bienes o sin personal ni vehículos").
  6. *Q6 (Breach Impact)*: "¿De qué manera te afectaría un incumplimiento por parte del proveedor?" (Open text).
  7. *Q7 (Price Adjustment)*: Price increase mechanism (Renegociación, IPC, SMLMV, Otro), presented only if contract duration exceeds 12 months.
  8. *Q8 (Termination Notice)*: Plazo de preaviso de terminación que debe otorgar el proveedor (Single selection / structured input).
  9. *Q9 (Renewal Terms)*: Renovación automática vs fecha fija de terminación (Single selection).
     - *Q9a (Renewal Notice)*: Plazo de preaviso requerido para evitar la renovación automática (presented only if automatic renewal is selected).
  10. *Q10 (Additional Termination Grounds)*: Causales adicionales de terminación anticipada más allá de las legales (Open text / structured input).
  11. *Q11 (Dispute Resolution)*: Mecanismo de resolución de controversias (Single selection: Tribunales ordinarios, Tribunal de arbitramento, Centro de conciliación, Amigable composición).
- **FR-004**: System MUST support the following modular question types:
  - `open_text`: Multi-line or single-line free text input with length constraints.
  - `single_choice`: Radio-style exclusive single selection from a predefined option list.
  - `multiple_choice`: Checkbox group allowing selection of multiple options simultaneously.
  - `checkbox`: Boolean toggle or acknowledgment confirmation.
- **FR-005**: System MUST decouple the questionnaire rendering engine from specific question types through a polymorphic question contract, permitting new question types to be registered without refactoring the navigation or persistence engines.
- **FR-006**: System MUST allow individual answer options to define contextual tooltips providing plain-language explanations of legal terms (e.g., explaining "persona natural" vs "persona jurídica").
- **FR-007**: System MUST support an optional expandable disclosure on any question labeled "¿Por qué te preguntamos esto?", allowing users to voluntarily view the legal rationale behind the question.
- **FR-008**: System MUST provide bidirectional navigation controls:
  - "Siguiente" (Next) to validate the current answer and advance to the next logical question.
  - "Anterior" (Previous) to return to the preceding question to review or modify previous answers.
- **FR-009**: System MUST disable or omit the "Anterior" control when the user is on the first question (Q0).
- **FR-010**: System MUST enforce incremental persistence, saving the user's answer immediately upon advancement or modification, ensuring that closing the session midway preserves all answers up to that point.
- **FR-011**: System MUST restore the exact questionnaire state—including all previously answered questions and the active question index—when a user resumes an in-progress contract generation from their dashboard.
- **FR-012**: System MUST automatically assign a sequential default title in Spanish (e.g., "Mi Contrato 1", "Mi Contrato 2") upon creation of a new contract generation, calculated from the user's contract count.
- **FR-013**: System MUST provide an inline title editing capability within the questionnaire header, allowing users to customize their contract name at any time during drafting.
- **FR-014**: System MUST dynamically evaluate conditional visibility rules (e.g., Q4a vs Q4b, Q7 when duration > 12 months, Q9a when automatic renewal is selected) and deactivate or prune obsolete downstream answers when parent selections are modified.
- **FR-015**: System MUST validate that required questions are answered before permitting forward navigation, displaying clear, accessible inline validation feedback in Spanish.
- **FR-016**: System MUST explicitly omit progress percentage bars, dynamic LLM-generated questions, and automated legal validation of answer content, reserving these for subsequent downstream contexts.
- **FR-017**: System MUST ensure all questionnaire components satisfy WCAG 2.1 Level AA accessibility standards, including full keyboard navigability (`Tab`, `Space`, `Enter`, arrow keys), visible focus rings, explicit form control labeling, and proper ARIA disclosures (`aria-expanded`, `aria-controls`, `aria-describedby`, `role="alert"`).
- **FR-018**: System MUST render all user-facing strings, prompts, options, tooltips, validation alerts, and navigation labels exclusively in Spanish (`es`) in strict adherence to Constitution Principle VII.

---

### Key Entities *(include if feature involves data)*

- **ContractGeneration**: The root aggregate representing an individual contract drafting lifecycle owned by an authenticated user.
  - *Attributes*: `id` (ContractId), `userId` (UserId), `title` (string, e.g., "Mi Contrato 1"), `status` (ContractStatus: 'in_progress' | 'completed'), `currentQuestionId` / `currentQuestionIndex` (identifier of the active question), `answers` (map of QuestionId to AnswerValue), `createdAt` (timestamp), `updatedAt` (timestamp).
- **QuestionnaireDefinition**: The immutable domain definition representing the ordered catalog of standard questions and their branching rules.
  - *Attributes*: `id` (QuestionnaireId), `version` (string, e.g., "1.0.0"), `questions` (ordered collection of Question entities).
- **Question**: Represents an individual intake prompt in the questionnaire.
  - *Attributes*: `id` (QuestionId), `order` (integer), `prompt` (localized string), `type` (QuestionType: 'open_text' | 'single_choice' | 'multiple_choice' | 'checkbox'), `isRequired` (boolean), `helpText` (optional localized rationale for "¿Por qué te preguntamos esto?"), `tooltip` (optional localized hint), `options` (optional list of AnswerOption), `condition` (optional QuestionCondition expression for conditional visibility).
- **AnswerOption**: Represents an individual selectable choice within single_choice or multiple_choice questions.
  - *Attributes*: `id` (OptionId), `label` (localized string), `value` (string), `tooltip` (optional localized explanatory text).
- **QuestionCondition**: Represents the logical rule determining whether a question should be shown based on previous answers.
  - *Attributes*: `dependsOnQuestionId` (QuestionId), `operator` (equals, not_equals, greater_than, contains), `expectedValue` (unknown).
- **AnswerValue**: Value object representing the validated response supplied by the user.
  - *Attributes*: `questionId` (QuestionId), `value` (string | string[] | boolean | number), `answeredAt` (timestamp).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of users see exactly one question at a time during standard questionnaire intake, with zero display of concurrent or overlapping questions.
- **SC-002**: 100% of answers are persisted incrementally: closing the browser at any step and reopening from the dashboard restores 100% of previously entered answers and the exact active question.
- **SC-003**: Users can navigate backward and forward across all answered questions without losing any previously entered data (0% unintended data loss).
- **SC-004**: Updating a previously submitted answer updates the persisted contract generation aggregate in under 1 second.
- **SC-005**: 100% of conditional sub-questions (Q4a/b delivery timeframe/duration, Q7 price increase mechanism, Q9a renewal notice) dynamically display and hide accurately according to their triggering conditions.
- **SC-006**: When a parent answer is changed to invalidate a conditional branch, 100% of obsolete child answers are cleanly pruned from the active contract generation state.
- **SC-007**: 100% of new contract generations receive an automatically assigned default title ("Mi Contrato N") matching the user's sequential contract count, editable inline by the user.
- **SC-008**: 100% of questionnaire components pass automated WCAG 2.1 AA accessibility audits with zero violations, including full keyboard navigability and screen-reader compatibility.
- **SC-009**: 100% of user-facing text, tooltips, guidance notes, and validation errors are delivered in correct Spanish (`es`).

---

## Assumptions

- **Pre-existing Authentication**: The user is already authenticated via the identity system implemented in Feature 001 (`001-user-auth`), and the user's unique `UserId` is accessible in the session context.
- **Contract Generation Initialization**: When a user clicks "Nuevo Contrato" (New Contract) from the dashboard, a `ContractGeneration` record is initialized with default title "Mi Contrato N" and status `in_progress`, starting at Question 0.
- **Questionnaire Ordering**: The sequence of questions Q0 through Q11 is standardized for all contract types in this baseline phase; industry-specific or contract-type-specific dynamic variations belong to downstream LLM dynamic analysis.
- **Service Provider Identification**: For Question 5 ("Si se contrata a un proveedor de servicios..."), because dynamic LLM classification is out of scope, Question 5 provides options that allow the user to select operational factors ("Empleará personal", "Utilizará vehículos") or explicitly select "No aplica / No emplea personal ni vehículos / Adquisición exclusiva de bienes".
- **Duration Calculation for Q7**: The >12 months condition for Question 7 is derived directly from the duration specified in Question 4b (recurring duration). If the user contracts a recurring service with duration exceeding 12 months (e.g., specified in months or years), Q7 is activated.
- **Client Storage as Backup**: While primary persistence is stored incrementally in the backend database/repository, local client transient caching (session storage) is utilized as a resilience buffer to prevent input loss during momentary network disconnects.
- **No Progress Bar**: Per the explicit out-of-scope directive, no numeric or visual percentage progress bar is rendered; simple step indicators or standard sequential navigation controls suffice.

