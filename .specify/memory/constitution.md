<!--
# Sync Impact Report
- Version change: 0.0.0 (unratified template) → 1.0.0
- List of modified principles:
  - PRINCIPLE_1_NAME → I. Clean Code & SOLID Foundations
  - PRINCIPLE_2_NAME → II. Clean Architecture & Domain-Driven Design (DDD)
  - PRINCIPLE_3_NAME → III. Test-Driven Development First (NON-NEGOTIABLE)
  - PRINCIPLE_4_NAME → IV. Specification & Code Synchronization Mandate
  - PRINCIPLE_5_NAME → V. Responsive Design & Accessibility (WCAG 2.1 AA)
  - [NEW] → VI. Minimal Dependencies & Tooling Rigor (pnpm)
  - [NEW] → VII. Language & Localization Separation
- Added sections:
  - Technology & Tooling Standards (replacing SECTION_2_NAME)
  - Development Workflow & Quality Gates (replacing SECTION_3_NAME)
  - Governance
- Removed sections:
  - None
- Follow-up TODOs:
  - None
-->

# go-agree Constitution

## Core Principles

### I. Clean Code & SOLID Foundations
All code MUST prioritize readability, maintainability, and clarity over cleverness or premature optimization.
- **Readability & Intent**: Variable, function, and class names MUST clearly convey intent without needing explanatory comments. Functions MUST be concise, focused on a single task, and maintain a single level of abstraction.
- **SOLID Mandate**:
  - *Single Responsibility Principle (SRP)*: A module, class, or function MUST have one, and only one, reason to change.
  - *Open/Closed Principle (OCP)*: Software entities MUST be open for extension, but closed for modification.
  - *Liskov Substitution Principle (LSP)*: Subtypes MUST be substitutable for their base types without altering system correctness.
  - *Interface Segregation Principle (ISP)*: Clients MUST not be forced to depend upon interfaces they do not use; design small, focused interfaces.
  - *Dependency Inversion Principle (DIP)*: High-level modules MUST not depend on low-level modules; both MUST depend on abstractions.
- **Error Handling**: Errors MUST be handled explicitly with typed, predictable domain errors. Silent error swallowing and unstructured throws are strictly prohibited.
- **Rationale**: go-agree generates legally sensitive contracts based on user inputs. Clean, predictable, SOLID-compliant code guarantees that contract generation logic remains robust, auditable, and resilient to change.

### II. Clean Architecture & Domain-Driven Design (DDD)
The codebase MUST enforce a strict separation of concerns using Clean Architecture and Domain-Driven Design principles where domain complexity warrants.
- **Inward Dependency Rule**: Dependencies MUST point inward. The domain core sits at the center, followed by the application use cases, adapters/interfaces, and infrastructure/frameworks at the outer boundary. Inner layers MUST NOT import from outer layers.
- **Framework & Infrastructure Independence**: Core business rules (contract modeling, answer evaluation, clause selection) MUST remain decoupled from web frameworks, UI components, databases, and third-party APIs.
- **Domain-Driven Design (where applicable)**: When modeling the contract generation domain, teams MUST employ DDD tactical patterns:
  - *Entities & Value Objects*: Distinguish concepts with distinct identity (e.g., `Contract`, `AgreementSession`) from immutable value descriptors (e.g., `ClauseId`, `LegalJurisdiction`, `AnswerValue`).
  - *Aggregates & Boundaries*: Enforce transactional consistency through aggregate roots.
  - *Ubiquitous Language*: Shared domain terminology MUST be uniformly reflected across specifications, domain code, and tests.
- **Rationale**: Legal agreement generation entails complex conditional logic and variable state. Isolating core business logic prevents infrastructure changes or framework migrations from compromising contractual validity.

### III. Test-Driven Development First (NON-NEGOTIABLE)
Test-Driven Development (TDD) is non-negotiable and MUST precede implementation for all functional capabilities.
- **Red-Green-Refactor Lifecycle**: Developers MUST write failing automated tests before writing any production code. Implementation is complete only when all tests pass, followed by disciplined refactoring while retaining green status.
- **Coverage & Test Hierarchy**: Unit tests MUST thoroughly cover domain models, business validation rules, and contract compilation branches. Integration tests MUST validate workflows across adapters, storage, and external boundaries.
- **Spec-Grounded Testing**: Every test suite MUST derive directly from scenarios, user stories, and acceptance criteria outlined in the corresponding feature specification.
- **Rationale**: In legal contract generation, untested edge cases produce invalid legal documents. Writing tests first guarantees that logic matches requirements from the outset and protects against regressions.

### IV. Specification & Code Synchronization Mandate
Every feature MUST originate from a comprehensive specification, and specifications MUST remain synchronized with the codebase at all times.
- **Spec-Before-Code**: Writing implementation code before producing an approved specification (`spec.md`) is prohibited.
- **No Isolated Changes**: Specifications MUST NOT be modified without simultaneously creating or updating corresponding tests and implementation code. Conversely, code behavior MUST NOT diverge from its specification.
- **Continuous Synchronization**: Any change in requirements, data contracts, or business flow MUST be applied to the specification, test cases, and code within the same review unit or pull request.
- **Rationale**: Desynchronization between documentation, specifications, and executable code breeds architectural decay and causes production bugs. A single synchronized source of truth guarantees team alignment and verifiable correctness.

### V. Responsive Design & Accessibility (WCAG 2.1 AA)
The user interface MUST deliver an accessible, seamless experience across all viewports and assistive devices.
- **Responsive by Default**: Interfaces MUST be designed mobile-first and adapt fluidly across mobile, tablet, and desktop viewports without horizontal scrolling, broken layouts, or truncated interactive elements.
- **Accessibility Standards (WCAG 2.1 AA)**: All interfaces MUST strictly satisfy WCAG 2.1 Level AA criteria:
  - Meaningful semantic HTML structure (`main`, `nav`, `section`, `article`, `header`, `footer`).
  - Full keyboard navigability with visible focus indicators for all interactive controls (questionnaires, dropdowns, inputs, buttons).
  - Explicit ARIA attributes only where native HTML elements cannot provide required accessibility semantics.
  - Sufficient color contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
  - Full compatibility with screen readers, including descriptive labels and live announcements for dynamic status changes.
- **Rationale**: Legal agreements and questionnaire intake forms must be usable by all individuals regardless of physical ability, device constraints, or assistive technology.

### VI. Minimal Dependencies & Tooling Rigor (pnpm)
The project MUST maintain a minimal dependency footprint managed exclusively through `pnpm`.
- **Package Manager Mandate**: `pnpm` is the sole authorized package manager. Running `npm` or `yarn` is prohibited, and `pnpm-lock.yaml` is the authoritative lockfile.
- **Dependency Justification Requirement**: Adding any new runtime or development dependency MUST be explicitly justified during pull request review. The justification MUST document:
  1. Business or technical necessity.
  2. Why modern web platform APIs, standard libraries, or existing utilities cannot fulfill the requirement.
  3. Impact on bundle size, performance, and maintenance overhead.
  4. Security posture and audit results.
- **Prohibited Dependencies**: Duplicative helper libraries (e.g., installing utility toolkits when single-purpose standard functions suffice) are prohibited.
- **Rationale**: Bloated dependency trees introduce supply chain vulnerabilities, inflate bundle sizes, degrade page performance, and amplify long-term maintenance costs.

### VII. Language & Localization Separation
A strict separation MUST be maintained between the internal engineering language and the user-facing localized experience.
- **English for Engineering**: English MUST be used exclusively for:
  - Code identifiers (variable names, function names, class names, constants, type and interface declarations).
  - Code comments, documentation, architectural diagrams, and schema definitions.
  - Git branch names, commit messages, pull request titles, and descriptions.
- **Spanish for User Interface**: The primary user-facing language is Spanish (`es`):
  - All user interface copy, questionnaire questions, options, guidance hints, validation alerts, and error messages MUST be rendered in Spanish.
  - Generated legal contracts, clauses, and exported documents MUST be produced in legally sound Spanish.
  - Hardcoded user-facing strings inside components or domain logic are prohibited; all copy MUST be managed via structured localization resources or domain dictionaries.
- **Rationale**: Standardizing engineering artifacts in English enables global collaboration and aligns with programming ecosystems, while providing a native Spanish interface guarantees accuracy and clarity for users executing legal contracts.

## Technology & Tooling Standards

- **Package Management**: Managed strictly with `pnpm`. All scripts, continuous integration pipelines, and developer environments MUST execute via `pnpm <command>`.
- **Architecture Boundaries**:
  - `domain`: Pure business models, entities, value objects, domain events, domain error definitions, zero external framework dependencies.
  - `application`: Use cases, orchestrators, command/query handlers, contract generation services.
  - `infrastructure`: Storage adapters, external API clients, file exporters, framework-specific drivers.
  - `ui` / `presentation`: Presentation components, form controllers, Spanish-language view templates, responsive layouts.
- **Code Quality Tools**: Codebases MUST integrate automated formatters, strict linters, and type-checkers (e.g., TypeScript in strict mode) enforcing zero warnings or errors prior to merge.

## Development Workflow & Quality Gates

- **Feature Lifecycle**:
  1. **Specification**: Formulate feature requirements and acceptance criteria in `.specify` before coding.
  2. **Review**: Ensure the spec satisfies all constitutional principles (Clean Code, DDD suitability, responsiveness, a11y, minimal dependencies).
  3. **TDD Cycle**: Write failing unit and integration tests confirming the specification.
  4. **Implementation**: Write minimal clean code satisfying the tests and respecting architecture boundaries.
  5. **Refactor**: Clean up and optimize while preserving passing test status and clean code standards.
  6. **Synchronization Verification**: Validate that specification, implementation, and tests remain in lockstep.
- **Quality Gates**:
  - Unit test pass rate: 100%.
  - Zero linting, formatting, or type-checking errors.
  - Automated accessibility audit pass for UI components.
  - Dependency justification approval for any new package addition.

## Governance

- **Supremacy**: This Constitution represents the supreme engineering policy for `go-agree`. In any conflict between ad-hoc conventions and constitutional rules, this document prevails.
- **Amendment Process**: Amendments MUST be proposed via a pull request modifying this constitution file. Every amendment requires:
  1. A clear statement of rationale and impact analysis across existing specifications and code.
  2. A semver-compliant version bump (`MAJOR` for breaking governance changes or principle removals, `MINOR` for adding/expanding principles or sections, `PATCH` for clarifications and wording corrections).
  3. A corresponding Sync Impact Report.
- **Compliance & Enforcement**: Every code review and pull request MUST verify compliance with all core principles. Violations MUST block merge until corrected.

**Version**: 1.0.0 | **Ratified**: 2026-09-07 | **Last Amended**: 2026-09-07
