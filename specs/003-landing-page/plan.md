# Implementation Plan: Landing Page

**Branch**: `003-landing-page` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-landing-page/spec.md`

---

## Summary

Implement the public Landing Page for `go-agree` at the root route (`/`) to introduce the product, communicate the core value proposition, demonstrate the contract creation process in 3 simple steps, offer 3 free contracts, present a transparent single-plan pricing model with a monthly/annual billing frequency toggle, and direct visitors to registration or login.

The implementation strictly reflects the actual capabilities of the current product, with zero references to unbuilt features (such as electronic signatures, legal review by attorneys, or third-party integrations).

The technical architecture strictly follows Clean Architecture and the go-agree Constitution:
- **`packages/domain`**: Type-safe domain models (`PricingPlanConfig`, `CountryPricingRegistry`, `CountryCode`, `BillingCycle`) and pure calculation service (`PricingCalculatorService`) supporting multi-currency and country-specific pricing (defaulting to Colombia / COP).
- **`apps/web`**: Server-rendered root view (`apps/web/src/app/page.tsx`) with dynamic session adaptation (`getServerAuthAdapter`), responsive and accessible presentation components (`LandingHeader`, `MobileNavDrawer`, `HeroSection`, `HowItWorksSection`, `PricingSection`, `PricingCard`, `BillingToggle`, `LandingFooter`), and centralized Spanish localization in `apps/web/src/locales/es.ts`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all workspace packages  
**Primary Dependencies**: Next.js 14+ (App Router), React 18, Tailwind CSS, `@supabase/ssr` (for server-side session check)  
**Storage**: Decoupled, in-memory domain configuration registry in code (`CountryPricingRegistry`). No external database read is required to serve the public landing page, guaranteeing sub-second SSR performance and zero cold starts.  
**Testing**: Vitest for domain pricing logic; Vitest + `@testing-library/react` for landing component tests; `axe-core` for automated WCAG 2.1 AA accessibility audits; Vitest copy compliance tests.  
**Target Platform**: Modern web browsers across mobile (320px+), tablet, and desktop viewports deployed on Netlify  
**Project Type**: Full-stack web application with Clean Architecture and DDD  
**Performance Goals**: <500ms server response time (SSR); <50ms interactive billing toggle switch; zero Cumulative Layout Shift (CLS); 100% pass on automated accessibility checks (`axe-core`).  
**Constraints**:
- Constitution Principle VII: All user-facing text strictly in Spanish (`es`) centralized in `apps/web/src/locales/es.ts`; English used exclusively for code identifiers and documentation.
- Constitution Principle V: Full WCAG 2.1 Level AA compliance (visible focus rings, accessible drawer with focus trap, `role="radiogroup"` with keyboard arrow navigation for billing toggle, color contrast $\ge 4.5:1$).
- Constitution Principle VI: `pnpm` is the sole authorized package manager.
- Strictly bounded capabilities: Zero mentions of electronic signatures, lawyer reviews, or unbuilt integrations. Out of scope: blog, case studies, competitor comparison tables.
**Scale/Scope**: Public landing page for unauthenticated and authenticated visitors; single paid plan with monthly and annual options.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | Domain pricing model is closed for modification and open for extension (OCP) via `CountryPricingRegistry`; pricing calculations separated into single-responsibility domain service (`PricingCalculatorService`); UI components are modular and decoupled. |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `packages/domain` contains pure pricing types, registry, and calculation algorithms with zero dependencies on React/Next.js; `apps/web` imports from domain and orchestrates presentation. |
| **III. Test-Driven Development** | **PASS** | Non-negotiable TDD lifecycle: unit tests for pricing registry and calculations, component unit tests, accessibility audits (`axe-core`), and truth-in-advertising copy compliance tests precede or accompany implementation. |
| **IV. Spec & Code Synchronization** | **PASS** | Design artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) directly synchronize with `spec.md` requirements (FR-001 through FR-014, SC-001 through SC-007). |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Mobile-first layout supporting 320px+ viewports; accessible mobile navigation drawer with focus trapping and `Escape` key listener; billing toggle implements `role="radiogroup"` with arrow key navigation; color contrast $\ge 4.5:1$. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Uses existing monorepo dependencies (`next`, `react`, `tailwindcss`); zero third-party component libraries or carousel plugins added; managed exclusively via `pnpm`. |
| **VII. Language & Localization Separation** | **PASS** | All user-facing strings centralized in `apps/web/src/locales/es.ts` under `landing`; engineering identifiers, variables, comments, and contracts written strictly in English. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-landing-page/
├── spec.md              # Feature specification (clarified with user decisions)
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output: Technical decisions & rationale
├── data-model.md        # Phase 1 output: Entities, pricing registry, and calculations
├── quickstart.md        # Phase 1 output: Runnable verification scenarios
└── contracts/           # Phase 1 output: Port and UI specifications
    ├── pricing-port.contract.ts
    └── landing-ui.contract.ts
```

### Source Code (repository layout)

```text
go-agree/
├── packages/
│   └── domain/
│       ├── src/
│       │   ├── entities/
│       │   │   └── PricingConfig.ts                 # PricingPlanConfig & CountryPricingRegistry definition
│       │   ├── services/
│       │   │   └── PricingCalculatorService.ts       # Pure calculation & formatting helpers
│       │   └── index.ts                             # Export pricing entities & services
│       └── tests/
│           └── PricingConfig.test.ts                # Unit tests for pricing invariants & calculations
├── apps/
│   └── web/
│       ├── src/
│       │   ├── locales/
│       │   │   └── es.ts                            # Localization dictionary with new landing section
│       │   ├── components/
│       │   │   └── landing/
│       │   │       ├── LandingHeader.tsx            # Responsive header with anchors & session actions
│       │   │       ├── MobileNavDrawer.tsx          # Accessible mobile navigation dialog
│       │   │       ├── HeroSection.tsx              # Value proposition & 3 free contracts banner
│       │   │       ├── HowItWorksSection.tsx        # 3 sequential step cards
│       │   │       ├── PricingSection.tsx           # Pricing container with free callout & toggle
│       │   │       ├── PricingCard.tsx              # Single Pro plan presentation card
│       │   │       ├── BillingToggle.tsx            # Accessible monthly/annual radio toggle
│       │   │       └── LandingFooter.tsx            # Brand footer & statutory legal disclaimer
│       │   └── app/
│       │       └── page.tsx                         # Next.js Server Component assembling the landing page
│       └── tests/
│           ├── components/
│           │   └── LandingPage.test.tsx             # Component integration & interaction tests
│           ├── a11y/
│           │   └── landingA11y.test.tsx             # axe-core automated WCAG 2.1 AA audit
│           └── landing/
│               └── CopyCompliance.test.ts           # Truthfulness check (0 false feature promises)
```

**Structure Decision**: Monorepo layout with Clean Architecture separation: business pricing logic in `packages/domain`, UI components and SSR orchestration in `apps/web`.

---

## Complexity Tracking

> No constitutional violations or unwarranted complexity detected. No exceptions required.
