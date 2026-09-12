# Tasks: Landing Page

**Feature**: `003-landing-page`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-09-12  
**Status**: Ready for Implementation  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding for landing page component directories, types, and centralized Spanish localization catalog

- [X] T001 [P] Create landing UI components directory structure in `apps/web/src/components/landing/`
- [X] T002 Extend Spanish localization dictionary with complete landing page copy (`landing.hero`, `landing.howItWorks`, `landing.pricing`, `landing.footer`, `landing.nav`) in `apps/web/src/locales/es.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain pricing models, country pricing registry, calculation services, and domain unit tests

**⚠️ CRITICAL**: Must complete before any user story implementation begins

- [X] T003 [P] Implement `PricingPlanConfig`, `CountryPricingRegistry`, and `BillingCycle` domain definitions supporting multi-currency and country-specific pricing in `packages/domain/src/entities/PricingConfig.ts`
- [X] T004 [P] Implement `PricingCalculatorService` with annual savings calculation, formatted currency outputs, and billing cycle resolution in `packages/domain/src/services/PricingCalculatorService.ts`
- [X] T005 Export `PricingConfig` entities, registry, and `PricingCalculatorService` in `packages/domain/src/index.ts`
- [X] T006 Write and pass TDD unit tests for pricing invariants, Colombia default resolution, multi-currency registry extensibility, and savings calculations in `packages/domain/tests/PricingConfig.test.ts`

**Checkpoint**: Pricing domain models and calculations verified with 100% test pass rate — user story implementation can now begin.

---

## Phase 3: User Story 1 - Value Proposition Discovery & Free Trial Hero Section (Priority: P1) 🎯 MVP

**Goal**: Deliver the primary hero section communicating go-agree's value proposition (tailored contract generation via guided questionnaire), prominently featuring the 3 free contracts incentive, and directing visitors to registration or login.

**Independent Test**: Load `http://localhost:3000`, verify the headline and 3-free-contracts callout render above the fold, click "Comenzar gratis" to confirm redirection to `/register`, and verify "Iniciar sesión" directs to `/login`.

### Tests for User Story 1 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T007 [P] [US1] Write failing component test for `HeroSection` rendering headline, 3-free-contracts banner, and CTA links in `apps/web/tests/components/HeroSection.test.tsx`

### Implementation for User Story 1

- [X] T008 [US1] Implement `HeroSection` component with responsive headline, value proposition subtitle, 3-free-contracts badge, and session-aware CTA buttons in `apps/web/src/components/landing/HeroSection.tsx` (satisfies T007)
- [X] T009 [US1] Update `apps/web/src/app/page.tsx` to mount `HeroSection` with server-side authentication check via `getServerAuthAdapter`

**Checkpoint**: User Story 1 is functional and delivers an independently testable MVP.

---

## Phase 4: User Story 2 - "How It Works" 3-Step Guided Process (Priority: P1)

**Goal**: Present an intuitive 3-step breakdown of the contract generation workflow (answer questionnaire → automatic analysis for additional questions → download in Word/PDF) strictly limited to actual capabilities.

**Independent Test**: Scroll to the "Cómo funciona" section, verify that steps 1, 2, and 3 render in sequential order with descriptive badges, and verify that mobile viewports stack the cards without horizontal overflow.

### Tests for User Story 2 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T010 [P] [US2] Write failing component test for `HowItWorksSection` asserting correct 3-step sequence and copy bounds in `apps/web/tests/components/HowItWorksSection.test.tsx`

### Implementation for User Story 2

- [X] T011 [US2] Implement `HowItWorksSection` with 3 sequential step cards (Paso 1: Cuestionario guiado, Paso 2: Análisis inteligente, Paso 3: Descarga en Word o PDF) and responsive grid in `apps/web/src/components/landing/HowItWorksSection.tsx` (satisfies T010)
- [X] T012 [US2] Mount `HowItWorksSection` into `apps/web/src/app/page.tsx` with section anchor id `como-funciona`

**Checkpoint**: User Stories 1 and 2 work together seamlessly, providing full workflow transparency.

---

## Phase 5: User Story 3 - Transparent Single-Plan Pricing with Billing Frequency Toggle (Priority: P2)

**Goal**: Provide a transparent pricing section featuring a single Pro plan card with an interactive monthly/annual billing toggle, annual savings highlight, 3 free contracts banner, and real feature capabilities.

**Independent Test**: Navigate to `#precios`, verify the 3-free-contracts callout, toggle between monthly ($49.000 COP) and annual ($39.000 COP/mes, $468.000 COP/año, "Ahorra 20%"), verify keyboard arrow key navigation, and confirm CTA routes to `/register`.

### Tests for User Story 3 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T013 [P] [US3] Write failing component tests for `BillingToggle` asserting `role="radiogroup"`, `role="radio"`, `aria-checked`, and keyboard arrow navigation in `apps/web/tests/components/BillingToggle.test.tsx`
- [X] T014 [P] [US3] Write failing component tests for `PricingSection` asserting dynamic price update, savings badge, and `/register` CTA in `apps/web/tests/components/PricingSection.test.tsx`

### Implementation for User Story 3

- [X] T015 [P] [US3] Implement accessible `BillingToggle` component using WAI-ARIA `radiogroup` pattern with keyboard arrow navigation in `apps/web/src/components/landing/BillingToggle.tsx` (satisfies T013)
- [X] T016 [P] [US3] Implement `PricingCard` component displaying dynamic price, billing period note, savings badge, and realistic feature list in `apps/web/src/components/landing/PricingCard.tsx`
- [X] T017 [US3] Implement `PricingSection` containing the 3-free-contracts highlight callout, `BillingToggle`, and `PricingCard` wired to `CountryPricingRegistry` in `apps/web/src/components/landing/PricingSection.tsx` (satisfies T014)
- [X] T018 [US3] Mount `PricingSection` into `apps/web/src/app/page.tsx` with section anchor id `precios`

**Checkpoint**: User Stories 1, 2, and 3 are functional with interactive, accessible pricing.

---

## Phase 6: User Story 4 - Seamless Responsive Navigation, Brand Trust, & Legal Disclaimer (Priority: P2)

**Goal**: Deliver a polished responsive navigation header with in-page anchor links and an accessible mobile drawer, paired with a transparent footer displaying the statutory legal disclaimer.

**Independent Test**: On desktop, click header links to scroll to `#como-funciona` and `#precios`. On mobile (<768px), open the hamburger menu, verify focus trapping, press `Escape` to close, and verify the footer legal disclaimer is legible.

### Tests for User Story 4 (TDD - Write FIRST, ensure they FAIL) ⚠️

- [X] T019 [P] [US4] Write failing component tests for `LandingHeader` and `MobileNavDrawer` testing drawer open/close, focus trapping, and session adaptation in `apps/web/tests/components/LandingHeader.test.tsx`
- [X] T020 [P] [US4] Write failing component test for `LandingFooter` asserting brand info and legal disclaimer copy in `apps/web/tests/components/LandingFooter.test.tsx`

### Implementation for User Story 4

- [X] T021 [P] [US4] Implement `MobileNavDrawer` accessible dialog component with focus trapping, `Escape` key dismissal, and $\ge 44 \times 44\text{px}$ touch targets in `apps/web/src/components/landing/MobileNavDrawer.tsx`
- [X] T022 [US4] Implement responsive `LandingHeader` with brand logo, desktop anchor links, auth buttons, session adaptation ("Ir al panel" when authenticated), and hamburger toggle in `apps/web/src/components/landing/LandingHeader.tsx` (satisfies T019)
- [X] T023 [P] [US4] Implement `LandingFooter` with brand summary, navigation links, copyright, and statutory legal disclaimer in `apps/web/src/components/landing/LandingFooter.tsx` (satisfies T020)
- [X] T024 [US4] Mount `LandingHeader` and `LandingFooter` into `apps/web/src/app/page.tsx` completing full landing page composition

**Checkpoint**: Full landing page assembled across header, hero, how-it-works, pricing, and footer.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Automated accessibility validation, truthfulness compliance check, full integration testing, and build verification

- [X] T025 [P] Implement automated WCAG 2.1 AA accessibility audit suite using `axe-core` in `apps/web/tests/a11y/landingA11y.test.tsx`
- [X] T026 [P] Implement truthfulness and copy compliance test asserting 0 mentions of electronic signatures, lawyer reviews, or unbuilt integrations in `apps/web/tests/landing/CopyCompliance.test.ts`
- [X] T027 Implement end-to-end landing page integration test suite in `apps/web/tests/components/LandingPage.test.tsx`
- [X] T028 Execute full workspace test suite (`pnpm -r run test`) and compile monorepo (`pnpm run build`) ensuring zero warnings or errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — No dependencies on other stories (MVP)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — Can develop in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — Uses `CountryPricingRegistry`
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) — Links to anchor sections from US2 and US3
- **Polish (Phase 7)**: Depends on completion of all user stories (Phases 3–6)

### Parallel Opportunities

- **Phase 1 (Setup)**: T001 and T002 can run in parallel.
- **Phase 2 (Foundational)**: T003, T004, and T005 can run in parallel before running T006 tests.
- **User Stories (Phases 3–6)**: Once Phase 2 completes, US1, US2, US3, and US4 components can be developed in parallel across separate files:
  - T007 (US1 test) and T008 (Hero)
  - T010 (US2 test) and T011 (HowItWorks)
  - T013, T014 (US3 tests), T015 (BillingToggle), and T016 (PricingCard)
  - T019, T020 (US4 tests), T021 (MobileNavDrawer), and T023 (LandingFooter)
- **Phase 7 (Polish)**: T025, T026, and T027 test suites can run in parallel.
- **Page Assembly Coordination**: Tasks T009, T012, T018, and T024 update `apps/web/src/app/page.tsx` incrementally to mount each section, ensuring a functional vertical slice at each story checkpoint.

---

## Parallel Example: User Story 3

```bash
# Launch test creation tasks in parallel:
Task: "Write failing component tests for BillingToggle in apps/web/tests/components/BillingToggle.test.tsx"
Task: "Write failing component tests for PricingSection in apps/web/tests/components/PricingSection.test.tsx"

# Launch decoupled UI component implementations in parallel:
Task: "Implement accessible BillingToggle in apps/web/src/components/landing/BillingToggle.tsx"
Task: "Implement PricingCard in apps/web/src/components/landing/PricingCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete **Phase 1: Setup** (folders, localization).
2. Complete **Phase 2: Foundational** (pricing domain entities, calculations, tests).
3. Complete **Phase 3: User Story 1** (Hero section with value proposition, 3-free-contracts callout, auth CTAs).
4. **STOP and VALIDATE**: Verify hero and auth redirection independently at `http://localhost:3000`.

### Incremental Delivery
1. Add **User Story 2**: "Cómo funciona" 3-step section (`#como-funciona`).
2. Add **User Story 3**: "Precios" single-plan card with monthly/annual toggle (`#precios`).
3. Add **User Story 4**: Responsive header with mobile drawer and footer with legal disclaimer.
4. Run **Phase 7**: Full accessibility audit (`axe-core`), truthfulness compliance check, and workspace build.
