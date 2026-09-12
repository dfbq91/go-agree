# Phase 0 Research: Landing Page

**Feature**: `003-landing-page`  
**Date**: 2026-09-12  
**Status**: Completed  

---

## 1. Multi-Country Pricing Architecture & Centralized Code Configuration

- **Decision**: Implement a decoupled domain configuration and pricing registry in `packages/domain`:
  - **Entities & Value Types**:
    - `PricingPlanConfig`: Type-safe configuration model defining plan metadata, `countryCode` (ISO 3166-1 alpha-2), `currency` (symbol and ISO 4217 code), `monthlyPrice`, `annualMonthlyPrice`, `annualTotal`, `annualDiscountPercent`, `freeContractsIncluded`, and `features` list.
    - `CountryPricingRegistry`: Immutable registry mapping country codes (initially `'CO'`, with schema ready for `'MX'`, `'ES'`, `'US'`, etc.) to their localized `PricingPlanConfig`.
    - `PricingCalculatorService`: Pure domain service calculating savings, formatted currency strings, and annual billing totals.
  - **Initial Benchmark Pricing (Colombia / COP)**:
    - Monthly subscription: COP \$49.000 / mes.
    - Annual subscription: COP \$39.000 / mes (facturado anualmente a COP \$468.000 / año, representando un 20% de ahorro).
    - Free tier: 3 contratos gratis sin tarjeta de crédito.
  - **Consumption**: In `apps/web`, presentation components import or retrieve the active country configuration (`CO` by default) without embedding hardcoded price numbers into JSX.
- **Rationale**: Satisfies FR-005, FR-006, Clarification Q2, and Constitution Principle II (Clean Architecture). Modifying pricing amounts, adjusting discount percentages, or launching new country-specific pricing requires updating only the registry object in code, with zero markup changes.
- **Alternatives Considered**:
  - *Hardcoding pricing numbers directly in React JSX*: Rejected because it tightly couples business pricing to presentation markup, violates maintainability, and prevents future internationalization.
  - *Database-backed pricing table with Supabase REST fetch*: Rejected as unwarranted overhead for a public landing page. Code-based registry is zero-latency, type-safe, works seamlessly during SSR, and has zero cold-start delay.

---

## 2. Interactive Billing Frequency Toggle & WCAG 2.1 AA Accessibility

- **Decision**: Implement `BillingToggle` using WAI-ARIA standards for selectable options:
  - Container element configured with `role="radiogroup"` and `aria-label="Frecuencia de facturación"`.
  - Individual options ("Facturación mensual", "Facturación anual") rendered with `role="radio"`, `aria-checked="true|false"`, and keyboard navigation support (`ArrowLeft`, `ArrowRight`, `Space`, `Enter`).
  - Active annual state visually highlights the savings badge ("Ahorra 20%").
  - Price updates occur client-side instantaneously (< 50ms) using React state.
- **Rationale**: Satisfies FR-007, FR-013, SC-003, SC-004, and Constitution Principle V. Delivers a fluid user experience while maintaining 100% compliance on automated accessibility audits (`axe-core`).
- **Alternatives Considered**:
  - *Standard `<select>` element*: Fully accessible, but visually unappealing and contrary to modern SaaS landing page conventions.
  - *Unstyled `<div>` with `onClick`*: Fails WCAG 2.1 AA keyboard accessibility and screen reader testing.

---

## 3. Responsive Header & Collapsible Mobile Navigation Drawer

- **Decision**: Responsive navigation architecture adapting to viewport width:
  - **Desktop ($\ge 768\text{px}$)**: Clean horizontal header with logo, in-page anchor links (`#como-funciona`, `#precios`), and authentication actions (`/login`, `/register`, or `/dashboard`).
  - **Mobile ($< 768\text{px}$)**: Fixed header displaying brand logo, quick CTA, and an accessible hamburger button (`aria-expanded="false"`, `aria-label="Abrir menú"`) that opens a slide-over mobile drawer.
  - **Mobile Drawer Behavior**:
    - Focus trapped inside the drawer when open.
    - Dismissible via `Escape` key, backdrop click, or close button.
    - All touch targets sized at $\ge 44 \times 44\text{px}$ per WCAG 2.1 Target Size criteria.
    - Smooth scrolling to in-page anchors upon link selection, automatically closing the drawer.
- **Rationale**: Satisfies FR-014, Clarification Q3, SC-006, and Constitution Principle V.
- **Alternatives Considered**:
  - *No mobile menu (showing all links vertically in header)*: Consumes excessive vertical space and pushes the hero below the fold on mobile screens.
  - *Hiding in-page navigation entirely on mobile*: Prevents mobile visitors from jumping directly to "Cómo funciona" or "Precios".

---

## 4. Value Proposition, Strict Capability Boundaries, & Legal Safeguards

- **Decision**: Strict boundary enforcement across all landing page copy and structure:
  - **Hero Section**: Focuses exclusively on creating tailored contracts by answering an intuitive, guided questionnaire, explicitly stating that users receive **3 free contracts** with no credit card required.
  - **"Cómo funciona" Section**: Exactly 3 sequential steps reflecting actual platform functionality:
    1. *Paso 1 (Cuestionario guiado)*: Captura de términos contractuales pregunta a pregunta.
    2. *Análisis automático*: Análisis inteligente que formula preguntas adicionales para precisar el alcance.
    3. *Descarga en Word o PDF*: Exportación y descarga inmediata del contrato en formato Word (.docx) o PDF listo para imprimir.
  - **Pricing Section**: Single featured Plan Pro card with real capabilities: unlimited contract generations, guided questionnaire, Word/PDF downloads, draft autosaving, and contract history.
  - **Prohibited Mentions (Zero Tolerance)**: Absolutely no mention of electronic signatures, attorney validation / lawyer review, or third-party CRM/ERP integrations.
  - **Legal Disclaimer**: Prominent footer statement clarifying that go-agree is an automated contract generation software and does not provide legal advice, legal representation, or an attorney-client relationship.
  - **Centralized Spanish Copy**: All user-facing strings centralized in `apps/web/src/locales/es.ts` under a new `landing` section, with English for code identifiers.
- **Rationale**: Satisfies FR-002, FR-003, FR-004, FR-010, FR-011, FR-012, SC-001, SC-002, and Constitution Principle VII.
- **Alternatives Considered**:
  - *Teasing unbuilt features (e.g., 'Firma electrónica próximamente')*: Explicitly rejected to maintain complete honesty and comply with the user mandate to strictly limit content to actual capabilities.

---

## 5. Dynamic Session Adaptation for Authenticated Visitors

- **Decision**: Next.js Server Component architecture for `apps/web/src/app/page.tsx`:
  - Evaluates authentication status server-side via `getServerAuthAdapter().getCurrentSession()`.
  - Passes `isAuthenticated: boolean` down to `LandingHeader`, `HeroSection`, and `PricingSection`.
  - When unauthenticated: Displays "Iniciar sesión" and "Registrarse" / "Comenzar gratis".
  - When authenticated: Displays "Ir al panel" / "Mis Contratos" linking directly to `/dashboard`.
  - Zero client-side flash (no FOUC) and instant server-rendered HTML.
- **Rationale**: Satisfies FR-008, FR-009, and Edge Cases.
- **Alternatives Considered**:
  - *Client-side only auth check via `useEffect`*: Causes layout shift and flickering button states on initial page load.
