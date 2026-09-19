# Feature Specification: Document Generation

**Feature Branch**: `007-document-generation`

**Created**: 2026-09-16

**Status**: Ready for Review

**Input**: User description: "This specifies the context for the go-agree Document Generation feature. Objective: to produce the final contract in Word and PDF formats based on all responses (standard and dynamic) captured for a specific generation instance. Scope:

The document is generated when the user marks the questionnaire as complete.
The contract generation feature is available for both free and Pro accounts; however, free accounts are limited to creating a specific number of contracts as defined by the environment variable.
The output includes both .docx and .pdf formats, which can be downloaded from the dashboard and the contract summary screen (immediately after answering all questions).
If the user edits responses after generating the document, they must be able to regenerate it to reflect those changes.
The document does not include an electronic signature mechanism; it is ready for the parties to sign outside the application.
The document content is assembled based on the provided responses; this stage does not assume the use of a library of legal clauses pre-validated by a lawyer—it must be explicitly stated that the generated content does not constitute legal advice. Out of scope: electronic signatures, human legal validation of content, and historical versioning of generated documents (only the most recent version per generation is retained). Acceptance criteria:
Upon completing a questionnaire, the user can download the contract in Word and PDF formats, with content reflecting their responses.
Editing a response and regenerating the document produces an updated version consistent with the new state of the responses."
## Clarifications

### Session 2026-09-16

- Q: What should happen to the availability of downloadable contract files when a user edits responses on an already completed contract before regenerating it? (FR-009) → A: Temporarily disable download buttons and display a prominent "Actualización pendiente" banner with a "Regenerar documento" button until the new version is compiled.
- Q: Where and how should the mandatory legal advice disclaimer be positioned? (FR-003) → A: Displayed outside the document within the user interface prior to document generation (on the summary review screen/modal before generating), keeping the generated contract document itself clean for signing.
- Q: What contractual structure should the generated document follow to organize the clauses derived from the standard and dynamic responses? (FR-004) → A: Traditional Spanish contract structure: Título, Comparecientes (Partes), Declaraciones/Antecedentes, Cláusulas Operativas (Objeto, Plazo, Entrega, Obligaciones, Terminación, Controversias), Cláusulas Particulares (respuestas dinámicas), y Firmas.
- Q: How should the document generation engine handle optional or conditional questionnaire items? (FR-002) → A: All questions are strictly required by the application. Contract generation MUST NOT proceed if any clause or question is unanswered.
- Q: When a completed contract has modified answers awaiting regeneration, how should this state be reflected in the dashboard contracts list? (FR-007) → A: Display an "Actualización pendiente" badge in the download column linking to the summary screen to review changes and regenerate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated Contract Generation & Immediate Download on Summary Screen (Priority: P1)

As an authenticated user finishing a contract questionnaire, I want the system to automatically generate my final legal contract in both Word (.docx) and PDF (.pdf) formats as soon as I mark the questionnaire as complete, and immediately provide clear download actions on the summary screen, so that I can promptly inspect and save my completed agreement in my preferred file format.

**Why this priority**: Generating downloadable contracts is the central value proposition of the application. Without the automated generation of accessible, downloadable Word and PDF documents from completed questionnaire inputs, the user cannot obtain the contract they created.

**Independent Test**: Can be tested independently by completing all required questions for a contract generation, activating the confirmation action on the summary review screen, and verifying that the document compiles and displays active download buttons for both Word (.docx) and PDF (.pdf) formats with files containing the user's answers.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the summary screen with 100% of required questions (standard baseline and dynamic) answered, **When** the user marks the questionnaire as complete, **Then** the system transitions the contract status to completed and automatically generates the final contract document in both Word (.docx) and PDF (.pdf) formats.
2. **Given** the successful generation of the contract documents, **When** the summary screen updates, **Then** it presents accessible download controls in Spanish: "Descargar Word (.docx)" and "Descargar PDF (.pdf)".
3. **Given** a user activating the "Descargar Word (.docx)" control on the summary screen, **When** the action triggers, **Then** the browser downloads the formatted `.docx` document file containing all captured contract terms and answers.
4. **Given** a user activating the "Descargar PDF (.pdf)" control on the summary screen, **When** the action triggers, **Then** the browser downloads the formatted `.pdf` document file containing all captured contract terms and answers.
5. **Given** a generation process in flight, **When** the document is being compiled, **Then** the UI displays an accessible loading indicator (`aria-busy="true"`, "Generando contrato...") and prevents duplicate submission triggers.

---

### User Story 2 - Contract Retrieval from the Dashboard Across Formats (Priority: P1)

As an authenticated user managing contracts from my dashboard, I want to download generated contracts in Word (.docx) or PDF (.pdf) format at any time directly from the contract list, so that I can access my finalized agreements whenever needed without having to re-enter the questionnaire flow.

**Why this priority**: Users need ongoing access to their generated contracts. Providing format-flexible download access from the primary dashboard ensures high usability and seamless asset retrieval.

**Independent Test**: Can be tested independently by navigating to the dashboard with an account that owns completed contracts with generated documents, opening the "Descargar" menu for a contract row, and verifying that selecting either PDF or Word initiates a download of the corresponding file.

**Acceptance Scenarios**:

1. **Given** a contract generation listed on the dashboard that has a generated document, **When** the user views the contract row, **Then** the "Descargar" action is enabled and indicates that documents are available.
2. **Given** an active "Descargar" action, **When** the user activates it, **Then** a dropdown menu displays with options "Descargar PDF (.pdf)" and "Descargar Word (.docx)".
3. **Given** the download dropdown menu, **When** the user selects either format, **Then** the browser downloads the latest compiled document for that format, and the menu closes.
4. **Given** a contract in the dashboard for which no document has been generated yet (e.g., in-progress draft), **When** the user views the row, **Then** the download button is disabled with an explanatory tooltip or guidance message in Spanish indicating that the document has not yet been generated.
5. **Given** a contract listed on the dashboard that has modified answers awaiting regeneration, **When** the user views the contract row, **Then** the "Descargar" column displays an "Actualización pendiente" badge that links directly to the contract summary screen, allowing the user to review the changes and trigger document regeneration.

---

### User Story 3 - Answer Modification and Document Regeneration (Priority: P1)

As an authenticated user who has already generated a contract document, I want to edit one or more of my previously submitted answers and regenerate the contract, so that my downloaded documents always match my updated requirements without creating orphaned drafts or cluttering my workspace with obsolete versions.

**Why this priority**: Contract negotiations and requirement clarifications frequently occur after initial drafting. Allowing users to revise answers and produce an up-to-date replacement document guarantees contractual accuracy while keeping data organized.

**Independent Test**: Can be tested independently by opening a completed contract with existing generated documents, modifying an answer (e.g., changing the delivery timeframe or jurisdiction), triggering document regeneration, and downloading the new Word and PDF files to verify that the modified answer is reflected and previous files are overwritten.

**Acceptance Scenarios**:

1. **Given** a completed contract with an existing generated document, **When** the user navigates to edit an answer from the summary view and saves the change, **Then** the contract generation state updates with the new response, the system temporarily disables download buttons on the summary screen and dashboard, and displays a prominent "Actualización pendiente" banner with a "Regenerar documento" action.
2. **Given** a contract with modified answers, **When** the user activates the "Regenerar documento" (Regenerate document) action, **Then** the system reassembles the contract content based on the new answer state and compiles fresh `.docx` and `.pdf` files.
3. **Given** successful regeneration, **When** new document files are produced, **Then** the system overwrites/replaces the previous document artifacts for that contract generation so that only the single latest version is retained.
4. **Given** the completion of regeneration, **When** the user downloads the Word (.docx) or PDF (.pdf) file, **Then** the downloaded document accurately reflects the revised answers across all relevant clauses.

---

### User Story 4 - Free Account Quota Enforcement and Pro Plan Upgrade (Priority: P2)

As a product owner, I want the system to enforce contract creation limits on Free accounts based on a configurable environment variable while giving Pro accounts unlimited access, so that free usage is bounded according to business policy and users are guided to upgrade when exceeding their free allocation.

**Why this priority**: Enforcing monetization boundaries and tier limits ensures sustainable business operations and drives subscription upgrades while offering free users transparent access up to their quota.

**Independent Test**: Can be tested independently by configuring a free limit (e.g., limit = 2), creating and completing contracts up to that limit, and verifying that an attempt to complete a subsequent new contract halts generation, displays a clear quota limit notification, and presents a direct link to the Pro upgrade/checkout flow.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a Free account who has not reached the contract creation limit defined by the environment variable, **When** they complete a questionnaire, **Then** the document generation proceeds successfully, and their consumed contract count is updated.
2. **Given** an authenticated user on a Free account who has reached the maximum permitted number of contracts, **When** they attempt to complete and generate a new contract, **Then** the system halts generation and presents an accessible modal or banner in Spanish indicating that the free contract limit has been reached.
3. **Given** the quota limit notification, **When** displayed to the user, **Then** it includes a prominent call-to-action button linking directly to the Pro upgrade / checkout page (`/checkout`).
4. **Given** an authenticated user on a Free account who has reached their creation limit, **When** they edit answers on an already-generated contract and trigger regeneration, **Then** the system allows regeneration without blocking or deducting additional quota.
5. **Given** an authenticated user on an active Pro subscription, **When** they complete or regenerate any number of contracts, **Then** generation executes without quota restrictions or upgrade prompts.

---

### User Story 5 - Legal Advice Disclaimer in UI & Clean Signature-Ready Document (Priority: P2)

As an end user and contracting party, I want the application to clearly inform me prior to document generation that the generated content does not constitute legal advice, and produce a clean document with properly formatted signature blocks, so that I am transparently informed before generating and all parties can execute the agreement outside the platform without platform disclaimer notices inside the contract.

**Why this priority**: Displaying legal disclaimers upfront protects both the platform and its users from regulatory and liability risks, while keeping the generated contract document itself clean and professional for physical or third-party digital signing.

**Independent Test**: Can be tested independently by opening the contract summary review screen, verifying that the mandatory Spanish legal disclaimer is prominently displayed before generation is confirmed, and then inspecting the generated Word and PDF documents to confirm that the contract text is clean and concludes with formatted signature blocks for each party.

**Acceptance Scenarios**:

1. **Given** the contract summary review screen and generation confirmation view, **When** presented to the user prior to confirming generation, **Then** an explicit, prominent disclaimer in Spanish clearly states that the document is assembled from user responses and does not constitute formal legal advice.
2. **Given** the generated contract document in Word or PDF format, **When** opened and inspected, **Then** it presents clean contractual terms ready for external signing without platform disclaimer text embedded inside the document body.
3. **Given** any generated contract document, **When** reaching the conclusion of the contract terms, **Then** it presents structured signature blocks ready for the involved parties (e.g., signature line, printed name, legal identity/ID number, and date) ready for physical ink signing or external digital signing outside the application.
4. **Given** the application workflow, **When** document generation completes, **Then** no in-app electronic signature ceremony, biometric signature capture, or cryptographic signature certification is executed or required by the platform.

---

### Edge Cases

- **Incomplete Questionnaire Submission Attempt**: If a user attempts to complete the contract or generate the document while any question remains unanswered, the system MUST prevent completion, block document generation and quota consumption, and present accessible Spanish validation guidance (`role="alert"`) directing the user to the unanswered question(s).
- **Compilation Failure during File Generation**: If file conversion or document synthesis fails due to formatting issues or transient errors, the system MUST display an accessible Spanish error message (`role="alert"`) informing the user of the failure and providing a retry action without corrupting the questionnaire data.
- **Direct Download Attempt on Uncompleted Generation**: If a user directly accesses `/api/contracts/{id}/download` for a contract that has no compiled document or is still in `in_progress` status, the system MUST return a structured 400 Bad Request explaining that the document has not yet been generated.
- **Answer Edits without Regeneration**: If a user modifies answers on a completed contract but does not activate the regenerate action, the summary screen and dashboard MUST temporarily disable download buttons and display a prominent "Actualización pendiente" banner with a "Regenerar documento" action until the user re-compiles the document.
- **Zero or Negative Quota Configuration**: If the free contract quota environment variable is missing, malformed, or set to a non-positive value, the system MUST apply the robust default fallback of 3 contracts for Free accounts.
- **Regeneration During Quota Exhaustion**: A Free user who has reached their contract quota limit MUST be permitted to regenerate their existing completed contracts; quota validation MUST evaluate new contract generations only and exclude regenerations.
- **Large Content and Special Characters**: The generation engine MUST handle long open-text answers, punctuation, line breaks, and Spanish accented characters (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `ü`, `¿`, `¡`) cleanly in both Word (.docx) and PDF (.pdf) without text truncation or encoding corruption.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically trigger document generation in both Word (.docx) and PDF (.pdf) formats when an authenticated user confirms questionnaire completion.
- **FR-002**: System MUST enforce that all questionnaire questions presented by the application (both standard baseline and dynamic) are answered as a strict prerequisite; system MUST NOT generate a contract document if any question or clause is unanswered.
- **FR-003**: System MUST display an explicit, conspicuous legal disclaimer in Spanish within the user interface prior to document generation (on the summary review screen before confirming completion), stating that the generated document is assembled from user responses and does not constitute formal legal advice; the generated contract document itself MUST NOT include platform disclaimer text so it remains clean for signing.
- **FR-004**: System MUST format the generated contract following a traditional Spanish legal contract anatomy: Título (Title), Comparecientes/Partes (Contracting Parties Identification), Declaraciones/Antecedentes (Recitals and Background), Cláusulas Operativas (Object, Delivery Conditions, Term/Renewal, Price Adjustment, Obligations, Termination, Dispute Resolution), Cláusulas Particulares (covenants synthesized from dynamic questions), and Firmas (Execution and Signature Blocks).
- **FR-005**: System MUST provide dedicated, accessible signature blocks for each contracting party at the end of the generated document formatted for execution outside the application (ink or third-party digital signature).
- **FR-006**: System MUST provide direct download controls for both Word (.docx) and PDF (.pdf) formats on the contract summary screen immediately after questionnaire completion.
- **FR-007**: System MUST enable document downloads from the contract dashboard for any completed contract generation that possesses up-to-date generated document files, offering both Word and PDF options via a dropdown menu; if answers have been modified and regeneration is pending, the system MUST display an "Actualización pendiente" badge in the download column that links directly to the summary review screen to regenerate.
- **FR-008**: System MUST disable the download action on the dashboard and display an explanatory message when a contract has not yet generated documents.
- **FR-009**: System MUST allow users to edit previously submitted answers for an existing contract generation, upon which the system MUST temporarily disable download buttons and display a prominent "Actualización pendiente" banner with a "Regenerar documento" action until regeneration is executed.
- **FR-010**: System MUST overwrite existing document artifacts upon regeneration so that only the single latest version of the generated document files is retained per contract generation instance.
- **FR-011**: System MUST support contract generation for both Free and Pro user accounts.
- **FR-012**: System MUST enforce a maximum number of allowed contract creations for Free user accounts, configured via an environment variable with a standard fallback default of 3 contracts.
- **FR-013**: System MUST NOT deduct quota or block document regeneration when an existing contract's answers are modified and regenerated by a Free user.
- **FR-014**: System MUST display an accessible notification modal or banner with a direct link to the Pro checkout/upgrade flow when a Free user attempts to complete a new contract beyond their permitted quota.
- **FR-015**: System MUST provide accessible Spanish feedback (`role="alert"`, loading states, aria labels) for all generation, regeneration, error, and download states.

### Key Entities *(include if feature involves data)*

- **ContractGeneration**: The core aggregate representing a user's contract draft or completed instance. Tracks title, completion status (`in_progress` vs `completed`), current question pointer, answered questionnaire responses (standard and dynamic), and timestamps.
- **GeneratedDocument**: Represents the compiled document artifact metadata associated with a `ContractGeneration`. Identifies availability of Word (.docx) and PDF (.pdf) exports, generation timestamp, and current synchronization state with questionnaire answers.
- **PlanQuota / Entitlement**: The domain representation of user plan limits. Evaluates whether an authenticated user (Free vs Pro) is entitled to generate a new contract based on their current generation count versus the configured limit.
- **LegalDisclaimer**: Standardized legal notice text presented in the UI prior to generation declaring that contract outputs are automatically assembled from user inputs and do not constitute certified legal counsel or lawyer-validated advice.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of contracts with all required questions answered compile into downloadable Word (.docx) and PDF (.pdf) document files containing all relevant user responses, with 0% generated for incomplete questionnaires.
- **SC-002**: Document generation completes and download controls become actionable within 5 seconds of the user confirming questionnaire completion under standard network conditions.
- **SC-003**: 100% of questionnaire completion flows display the mandatory Spanish legal advice disclaimer prior to document generation, and 100% of generated documents provide clean contract clauses concluding with formatted signature execution blocks.
- **SC-004**: 100% of document regenerations following answer modifications accurately incorporate updated answers in both Word and PDF files, cleanly replacing the prior version.
- **SC-005**: 100% of Free accounts reaching their configured contract creation limit are prevented from creating new contracts beyond their limit, while 100% of legitimate regenerations on existing contracts proceed without blocking.
- **SC-006**: 100% of download and regeneration controls meet WCAG 2.1 AA accessibility standards, including full keyboard navigability and localized Spanish labels.

## Assumptions

- **Configurable Free Limit**: The free contract creation limit is read from the `NEXT_PUBLIC_FREE_CONTRACTS_LIMIT` or `FREE_CONTRACTS_LIMIT` environment variable with a resilient fallback default of 3 contracts.
- **Regeneration Quota Rule**: Quota consumption occurs only upon the initial completion/creation of a new contract generation; editing and regenerating an existing contract does not consume additional quota.
- **No In-App Electronic Signatures**: Out of scope for this feature. No cryptographic signing, biometric capture, or electronic signature workflows exist in-app; the document includes print/sign blocks for external execution.
- **No Lawyer-Validated Clause Library**: Out of scope. Content is assembled dynamically from responses without human legal vetting; the document explicitly warns users that it is not legal advice.
- **No Historical Versioning**: Out of scope. Each contract generation maintains only its most recently generated document files. Previous iterations are replaced upon regeneration.
- **Localization Standards**: In accordance with Constitution Principle VII, all user interface text, prompts, notifications, and generated legal contract contents are provided in Spanish (`es`), while code identifiers and documentation remain in English.

