# Feature Specification: Landing Page

**Feature Branch**: `003-landing-page`

**Created**: 2026-09-12

**Status**: Ready for Review

**Input**: User description: "Specify the context for the go-agree Landing Page. Objective: A public page that explains what go-agree is, how it works, and invites users to sign up, based on patterns observed in similar products (agreement/contract generators), but strictly limited to the actual features that go-agree offers today. Scope: Main section (hero) explaining the value proposition: generate a customized contract by answering a guided questionnaire. 'How it works' section with simple steps (answer questions → automatic analysis for additional questions → download the contract in Word/PDF). Explicitly mention that users can generate 3 contracts for free. Pricing section, with a single plan: one monthly option and one annual option, with prices determined based on other English- and Spanish-language websites that offer similar services. The price must be easy to modify and maintain from the code. Call to action leading to registration/sign-in. All content must be in Spanish and strictly limited to actual capabilities: do not mention electronic signatures, legal validation by a lawyer, or integrations that the application does not have. Out of scope: Blog, case studies, explicit comparisons with competing products. Acceptance Criteria: An unauthenticated visitor can understand, without having to register, what go-agree does and how to get started. No text on the landing page promises functionality that does not exist in the current product."

## Clarifications

### Session 2026-09-12

- Q: Should the Pricing section display a single featured card for the paid plan with a highlight banner for the 3 free contracts, or present two side-by-side cards comparing the Free Tier against the Pro Plan? → A: Single featured Pro plan card with the monthly/annual toggle, preceded by a prominent highlight badge/banner detailing the 3 free contracts offer.
- Q: What currency and default price points should be configured for the single paid plan on the landing page? → A: Colombian Pesos (COP) at $49.000 COP/mes (monthly) and $39.000 COP/mes billed annually ($468.000 COP/año, ~20% discount), with the codebase pricing configuration structured to support multi-currency and country-specific pricing definitions for future international expansion.
- Q: On mobile viewports, should the landing page header include a collapsible menu drawer for section links, or maintain a minimalist header with direct authentication action buttons? → A: Collapsible accessible mobile menu (hamburger toggle) showing in-page anchors ("Cómo funciona", "Precios") and auth buttons.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Value Proposition Discovery & Free Trial Hero Section (Priority: P1)

As an unauthenticated visitor landing on go-agree, I want to immediately understand what the service does and discover that I can create 3 contracts completely free, so that I can evaluate if it solves my contractual needs and decide to sign up.

**Why this priority**: The hero section is the first impression and primary entry point for all new users. Without a clear value proposition and a low-barrier invitation (3 free contracts), visitors will bounce before understanding the product's benefits.

**Independent Test**: Can be tested independently by loading the root public page (`/`), verifying that the value proposition ("Crea contratos a tu medida respondiendo un cuestionario guiado") and the free tier incentive ("3 contratos gratis sin tarjeta de crédito") are immediately visible above the fold, with prominent calls to action linking directly to registration (`/register`) and login (`/login`).

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor arriving at the root page (`/`), **When** the page renders, **Then** the hero section displays a prominent headline and subtitle in Spanish communicating the core value proposition: generating tailored legal contracts through an interactive, guided questionnaire.
2. **Given** an unauthenticated visitor viewing the hero section, **When** they inspect the call-to-action area, **Then** they see an explicit mention that registration grants 3 contracts completely free without requiring credit card registration.
3. **Given** an unauthenticated visitor in the hero section, **When** they click or activate the primary CTA ("Comenzar gratis" / "Crear mis contratos"), **Then** the browser navigates directly to the registration page (`/register`).
4. **Given** an unauthenticated visitor, **When** they activate the secondary CTA ("Ya tengo cuenta" / "Iniciar sesión"), **Then** the browser navigates to the login page (`/login`).
5. **Given** an authenticated user who visits the root page (`/`), **When** the page loads, **Then** the navigation header and hero CTA adapt to recognize their active session, offering a direct link to their dashboard ("Ir a mis contratos" / "Ir al panel") instead of unauthenticated registration links.

---

### User Story 2 - "How It Works" 3-Step Guided Process (Priority: P1)

As a prospective user, I want to see a clear, step-by-step walkthrough of how go-agree generates a contract, so that I understand the actual generation workflow before committing to creating an account.

**Why this priority**: Users need confidence in the software before providing their information. A simple 3-step breakdown demystifies the contract creation process and aligns expectations with real capabilities.

**Independent Test**: Can be tested independently by scrolling to or navigating to the "Cómo funciona" section, confirming that all 3 sequential steps are clearly explained with descriptive icons/visual badges, and ensuring zero references to out-of-scope features (such as electronic signatures, legal review by attorneys, or third-party CRM connections).

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor scrolling through the landing page, **When** they reach the "Cómo funciona" section, **Then** they see exactly 3 sequential, ordered steps:
   - **Paso 1 (Cuestionario guiado)**: Explains answering foundational questions one by one (parties, terms, location, obligations).
   - **Paso 2 (Análisis inteligente)**: Explains the automated analysis that formulates targeted follow-up questions to refine specific contract requirements.
   - **Paso 3 (Descarga inmediata)**: Explains generating and downloading the finalized contract in editable Word (.docx) or ready-to-print PDF format.
2. **Given** an unauthenticated visitor reading the step descriptions, **When** they review the text of all steps, **Then** the copy contains no promises of attorney legal validation, digital/electronic signature flows, or external integrations not supported by the platform.
3. **Given** a visitor viewing the "Cómo funciona" section on a mobile viewport (e.g. 375px width), **When** they navigate through the section, **Then** the 3 steps stack vertically in logical reading order with clear step indicators, legible typography, and no horizontal overflow.

---

### User Story 3 - Transparent Single-Plan Pricing with Billing Frequency Toggle (Priority: P2)

As a visitor evaluating go-agree for ongoing contract generation, I want to explore a clear pricing section featuring a single plan with monthly and annual options, so that I know what the service costs after exhausting my 3 free contracts.

**Why this priority**: Pricing transparency builds user trust and qualifies potential paying customers. Providing monthly and annual billing toggles with visible annual discounts is an industry standard across international and Spanish-language contract generator platforms.

**Independent Test**: Can be tested independently by navigating to the "Precios" section, toggling between "Facturación mensual" and "Facturación anual", verifying that prices update instantly with clear discount highlights, confirming that plan features strictly mirror actual system capabilities, and verifying that the CTA routes to registration.

**Acceptance Scenarios**:

1. **Given** a visitor viewing the pricing section, **When** the section loads, **Then** they see a prominent highlight banner/badge announcing that every new user receives 3 contracts completely free without requiring a credit card, positioned above a single featured subscription card (e.g., "Plan Pro") equipped with the monthly/annual billing toggle.
2. **Given** a visitor inspecting the premium plan card, **When** they interact with the billing frequency toggle, **Then** they can switch between:
   - **Opción mensual**: Displays the regular monthly fee (e.g., $49.000 COP / mes).
   - **Opción anual**: Displays the discounted monthly equivalent (e.g., $39.000 COP / mes), the total annual billing amount ($468.000 COP / año), and a prominent savings badge (e.g., "Ahorra 20%").
3. **Given** an interactive billing toggle control, **When** operated via keyboard (Arrow keys, Space, or Enter) or assistive technologies, **Then** the active state changes immediately, updates the displayed price smoothly, and announces the selected billing period via accessible ARIA attributes (`role="radiogroup"`, `aria-checked`, or `aria-pressed`).
4. **Given** the feature checklist inside the premium plan card, **When** a visitor reads the included features, **Then** each item strictly describes real capabilities: unlimited contract generations, guided dynamic questionnaire, Word and PDF export downloads, draft autosaving, and continuous access to contract history.
5. **Given** the pricing section, **When** a visitor clicks the plan's CTA ("Comenzar ahora" / "Registrarse"), **Then** they are directed to the account creation page (`/register`).

---

### User Story 4 - Seamless Responsive Navigation, Brand Trust, & Legal Disclaimer (Priority: P2)

As a visitor navigating the go-agree landing page, I want an accessible header, smooth in-page navigation, and a transparent footer with legal disclaimers, so that I have a reliable and trustworthy browsing experience across any device.

**Why this priority**: Legal and contract software requires high trust. Transparent disclaimers clarify that go-agree is an automated software tool rather than a legal representation service, protecting both users and the business while delivering professional usability.

**Independent Test**: Can be tested independently by navigating the header links ("Cómo funciona", "Precios"), verifying smooth scrolling to corresponding page sections, checking the footer for essential links and the statutory legal disclaimer, and running keyboard navigation from header to footer without focus traps.

**Acceptance Scenarios**:

1. **Given** a visitor browsing the landing page on desktop or mobile, **When** they interact with the header navigation links ("Cómo funciona", "Precios"), **Then** the page scrolls smoothly to the target section with the appropriate heading receiving focus or visibility.
2. **Given** a visitor reaching the footer of the page, **When** they read the footer content, **Then** they find a prominent legal disclaimer in Spanish clarifying that go-agree provides automated contract drafting technology and does not provide legal advice, attorney-client relationships, or certified legal representation.
3. **Given** a visitor using assistive technology or keyboard-only navigation, **When** they tab through the page, **Then** all interactive elements (navigation links, buttons, toggles, footer links) have visible focus indicators and follow a logical DOM order.
4. **Given** a visitor on a mobile device, **When** they interact with the header, **Then** an accessible hamburger menu toggle with disclosure attributes (`aria-expanded`, `aria-label="Abrir menú"`) expands a collapsible mobile navigation drawer displaying in-page section links ("Cómo funciona", "Precios") and authentication action buttons with touch targets of at least 44x44 pixels.

---

### Edge Cases

- **Direct anchor link access (`/#como-funciona`, `/#precios`)**: When a visitor opens the page with a hash fragment or clicks an in-page anchor, the browser scrolls to the section without header overlap obscuring section titles.
- **Dynamic authentication state changes**: If an unauthenticated visitor logs in in another tab and refreshes or returns to `/`, header and hero controls immediately update to display dashboard navigation ("Ir al panel") instead of login/register.
- **Price configuration modification in code**: When an engineer updates the centralized price configuration (e.g., changes the price, currency, or discount rate), the pricing card, toggle calculations, and annual summary update automatically across all components without hardcoded text mismatches.
- **Small viewport constraints (320px width)**: At the narrowest mobile viewports, the billing toggle and pricing card maintain adequate padding and legible font sizes without text truncation, button overlap, or horizontal scrollbars.
- **High-contrast / 200% text zoom**: When users zoom text to 200% under WCAG 2.1 AA criteria, pricing tables, hero text, and step cards reflow gracefully without clipping or overlapping content.
- **No JavaScript / SSR fallback**: If JavaScript is disabled or delayed, the landing page content, step descriptions, and pricing baseline render statically and legibly via semantic HTML.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a public landing page at the root route (`/`) accessible without prior authentication.
- **FR-002**: Hero section MUST communicate the core value proposition: generating customized contracts through an intuitive, guided questionnaire.
- **FR-003**: Hero section and pricing section MUST explicitly state that new users can generate 3 contracts completely free without requiring a credit card.
- **FR-004**: Landing page MUST include a "Cómo funciona" (How it works) section presenting the 3 actual application steps:
  1. *Responde el cuestionario*: Intake of baseline contractual terms one question at a time.
  2. *Análisis automático*: Automatic intelligent evaluation generating tailored questions to specify scope.
  3. *Descarga en Word o PDF*: Export and download of the finished contract in editable Word (.docx) or PDF format.
- **FR-005**: Landing page MUST include a "Precios" (Pricing) section structured around a single featured subscription plan card with selectable monthly and annual billing options, preceded by a prominent introductory callout badge/banner detailing the 3 free contracts offer.
- **FR-006**: System MUST maintain plan pricing data (amounts, period, currency, discount percentages, and feature list) in a single, centralized configuration file in code structured to support multi-currency and country-specific pricing definitions (defaulting to Colombia / COP), decoupled from presentation JSX/templates for easy modification, maintenance, and future international expansion.
- **FR-007**: Pricing billing toggle MUST allow switching between monthly and annual rates dynamically, updating the displayed monthly equivalent, total billing period amount, and savings badge without full page reload.
- **FR-008**: Landing page MUST provide prominent Call to Action (CTA) buttons in header, hero, pricing, and footer leading to user registration (`/register`) and login (`/login`).
- **FR-009**: System MUST adapt header and hero CTAs dynamically for authenticated visitors, displaying a direct link to the dashboard (`/dashboard`) instead of unauthenticated auth links.
- **FR-010**: Landing page MUST display a prominent legal disclaimer in Spanish clarifying that go-agree is an automated contract generation software and does not constitute a legal advice service or law firm.
- **FR-011**: Landing page copy MUST NOT reference unreleased features such as electronic signatures, legal validation by a licensed attorney, or third-party CRM/ERP integrations.
- **FR-012**: All user-facing copy MUST be written in Spanish and managed through the localization dictionary (`es.ts`), adhering to Principle VII (Language & Localization Separation).
- **FR-013**: All interactive elements, semantic structures, and color contrasts MUST strictly satisfy WCAG 2.1 Level AA standards, adhering to Principle V.
- **FR-014**: Landing page MUST be fully responsive across mobile (320px+), tablet, and desktop viewports without horizontal scrolling, featuring a collapsible mobile menu drawer on small viewports with accessible disclosure controls and minimum 44x44 pixel touch targets.

### Key Entities *(include if feature involves data)*

- **PricingPlanConfig**: Represents the pricing tier definition managed in code:
  - `id`: Unique identifier (e.g. `'pro'`).
  - `name`: Display name of the plan (e.g. `'Plan Pro'`).
  - `tagline`: Short descriptive summary.
  - `countryCode`: ISO country code associated with the localized pricing definition (e.g. `'CO'`).
  - `currency`: Currency symbol and ISO code (e.g. `'$'`, `'COP'`).
  - `monthlyPrice`: Numeric monthly subscription price (e.g. `49000`).
  - `annualMonthlyPrice`: Numeric effective monthly price when billed annually (e.g. `39000`).
  - `annualTotal`: Numeric total billed annually (e.g. `468000`).
  - `annualDiscountPercent`: Percentage savings for annual commitment (e.g. `20`).
  - `freeContractsIncluded`: Number of free contracts offered prior to subscription (e.g. `3`).
  - `features`: Ordered array of feature capability strings strictly matching real product functionality.
  - `cta`: Primary button text and destination URL.

- **CountryPricingRegistry**: Centralized registry mapping country codes (e.g. `'CO'`, with schema ready for future entries such as `'MX'`, `'ES'`, `'US'`) to their corresponding localized `PricingPlanConfig`, ensuring future multi-country rollout without architecture rework.

- **WorkflowStep**: Represents each step in the "Cómo funciona" section:
  - `stepNumber`: 1-based sequential index (1, 2, 3).
  - `title`: Concise step title in Spanish.
  - `description`: Plain-language explanation of what occurs in this step.
  - `iconIdentifier`: Visual identifier representing the step action.

- **LandingNavigationItem**: Represents navigation and anchor points:
  - `label`: Display text in Spanish.
  - `href`: Anchor `#id` or internal route path.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Unauthenticated visitors can identify the product's core purpose and the 3-free-contracts offer within 5 seconds of viewing the hero section.
- **SC-002**: 100% of user-facing text on the landing page strictly describes existing product capabilities, with zero mentions of electronic signatures, attorney reviews, or unsupported integrations.
- **SC-003**: Visitors can switch between monthly and annual billing rates instantaneously (< 100ms) with immediate visual feedback and screen-reader announcements.
- **SC-004**: Landing page achieves 100% pass on automated accessibility checks (WCAG 2.1 AA) with zero contrast violations, complete keyboard navigability, and correct semantic landmark structure.
- **SC-005**: Pricing amounts, currency, and discount rates can be altered by modifying a single structured configuration object in code, with zero changes required in UI markup.
- **SC-006**: Page renders seamlessly across all viewport sizes from 320px to 1920px+ with zero horizontal overflow or visual overlap.
- **SC-007**: Direct call-to-action click routes unauthenticated users directly to `/register` in a single interaction without intermediate redirects.

## Assumptions

- **Market-Benchmarked Pricing**: Initial pricing values are modeled after comparable document generator services in the Spanish-speaking and Latin American market (e.g. Wonder.Legal, Cuadra, Juridoc):
  - Currency: Colombian Pesos (COP), aligned with the current platform brand tagline ("Generación inteligente y segura de contratos legales para Colombia").
  - Monthly subscription: COP $49.000 / mes.
  - Annual subscription: COP $39.000 / mes (facturado anualmente a COP $468.000 / año, ~20% de ahorro).
  - Defined in a decoupled configuration registry structured to support multi-currency and country-specific pricing definitions (with Colombia / COP active by default), allowing new countries and currencies to be configured effortlessly in code.
- **Free Tier Policy**: The 3 free contracts offer requires no credit card entry during registration and allows users to experience the full questionnaire and contract generation flow.
- **Format Delivery**: Final contract downloads will support Word (.docx) and PDF formats as stated in the product scope.
- **Session Adaptation**: Authenticated visitors navigating to `/` will see header and hero buttons adapted to "Ir al panel" / "Mis Contratos" linking to `/dashboard`.
- **Out of Scope Explicitly Maintained**: In alignment with user instructions, no blog, customer case studies, or explicit competitor comparison tables are included in this feature scope.
