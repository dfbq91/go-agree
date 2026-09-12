# Quickstart & Verification Guide: Landing Page

**Feature**: `003-landing-page`  
**Date**: 2026-09-12  
**Status**: Ready  

---

## Prerequisites

- Node.js LTS (>= 20.x)
- `pnpm` (>= 9.x) — Mandatory package manager (Constitution Principle VI)
- Completed Feature 001 (`001-user-auth`) identity and session infrastructure

---

## Environment Setup

Install monorepo dependencies:

```bash
pnpm install
```

Start the local Next.js development server:

```bash
pnpm dev
```

The landing page will be accessible at: `http://localhost:3000`

---

## Automated Verification Scenarios

### 1. Execute Domain Pricing Model Tests (TDD Verification)

Verifies the type-safe `CountryPricingRegistry`, country resolution, currency formatting, and annual savings calculations:

```bash
pnpm --filter @go-agree/domain test
```

**Expected Outcome**: 100% test pass rate with zero errors, validating:
- Invariants for `PricingPlanConfig` (price > 0, annual < monthly, discount calculation).
- Default country resolution to `'CO'` (Colombia) and COP currency.
- Extensibility of `CountryPricingRegistry` for multi-country additions (e.g. `'MX'`, `'ES'`).
- Accurate calculation of annual savings and formatted currency strings (`"$ 49.000 COP"`).

### 2. Execute Landing Page Component Integration Tests

Verifies component rendering, in-page navigation anchors, and interactive billing toggle behavior:

```bash
pnpm --filter @go-agree/web test tests/components/LandingPage.test.tsx
```

**Expected Outcome**: All component assertions pass, verifying:
- Hero section displays the value proposition and the explicit "3 contratos gratis" offer.
- "Cómo funciona" section renders all 3 sequential steps in correct order.
- Pricing card renders with default monthly fee ($49.000 COP/mes).
- Clicking or toggling "Facturación anual" updates the displayed price to $39.000 COP/mes, shows $468.000 COP/año, and highlights "Ahorra 20%".
- CTA buttons route unauthenticated visitors to `/register` and `/login`.

### 3. Execute Automated Accessibility Audit (WCAG 2.1 AA)

Runs `axe-core` accessibility engine over the rendered landing page:

```bash
pnpm --filter @go-agree/web test tests/a11y/landingA11y.test.tsx
```

**Expected Outcome**: 0 accessibility violations (`violations.length === 0`), verifying:
- Proper semantic landmark hierarchy (`header`, `main`, `section`, `footer`).
- Sufficient color contrast ratios ($\ge 4.5:1$ for normal text, $\ge 3:1$ for UI controls).
- Billing toggle accessibility (`role="radiogroup"`, `role="radio"`, `aria-checked`).
- Visible focus rings across all interactive controls.

### 4. Execute Truthfulness & Copy Compliance Test

Asserts that landing page copy strictly reflects current capabilities without false promises:

```bash
pnpm --filter @go-agree/web test tests/landing/CopyCompliance.test.ts
```

**Expected Outcome**: Pass with zero violations:
- Negative assertion: Copy contains zero references to "firma electrónica", "firma digital", "abogado", "revisión legal", "asesoría jurídica", or external integrations.
- Positive assertion: Prominent legal disclaimer exists in the footer clarifying software nature.

---

## Manual Verification Scenarios

### Scenario 1: Unauthenticated Visitor Flow (Hero & 3 Free Contracts)
1. Open an incognito browser window and navigate to `http://localhost:3000`.
2. Observe the hero section above the fold:
   - Headline: "Crea contratos a tu medida respondiendo un cuestionario guiado".
   - Free tier badge/callout: "3 contratos gratis sin tarjeta de crédito".
3. Click "Comenzar gratis" → verify immediate navigation to `http://localhost:3000/register`.
4. Return to `/` and click "Iniciar sesión" → verify navigation to `http://localhost:3000/login`.

### Scenario 2: "Cómo funciona" 3-Step Walkthrough
1. Scroll down to the "Cómo funciona" section (or click the header anchor link).
2. Verify exactly 3 sequential cards appear:
   - **Paso 1**: Responde el cuestionario guiado.
   - **Paso 2**: Análisis automático de requerimientos.
   - **Paso 3**: Descarga inmediata en formato Word (.docx) o PDF.
3. Confirm zero mentions of electronic signature or lawyer review.

### Scenario 3: Interactive Pricing & Annual Savings Toggle
1. Scroll to the "Precios" section.
2. Observe the introductory callout: "Comienza con 3 contratos gratis sin tarjeta".
3. Default view displays "Facturación mensual" with "$ 49.000 COP / mes".
4. Click or press `ArrowRight` to select "Facturación anual":
   - Price updates to "$ 39.000 COP / mes".
   - Total billed annual amount appears: "Facturado anualmente ($ 468.000 COP / año)".
   - Savings badge "Ahorra 20%" is highlighted.
5. Click "Comenzar ahora" → redirects to `/register`.

### Scenario 4: Mobile Responsiveness & Accessible Navigation Drawer
1. Open Chrome DevTools and toggle device toolbar to a mobile viewport (e.g., iPhone SE, 375px width).
2. Verify the layout adapts fluidly without horizontal scrollbars.
3. Click the hamburger menu button:
   - Accessible drawer slides open.
   - Focus is placed inside the drawer.
   - Links for "Cómo funciona", "Precios", "Iniciar sesión", and "Registrarse" are clearly visible with touch targets $\ge 44 \times 44\text{px}$.
4. Press `Escape` key → verify drawer closes and focus returns to the hamburger button.
5. Open menu again and click "Precios" → drawer closes and page scrolls smoothly to the pricing section.

### Scenario 5: Authenticated User Session Adaptation
1. Sign in with an active test user account.
2. Navigate back to the root route `http://localhost:3000`.
3. Verify that the navigation header and hero CTA display "Ir al panel" / "Mis Contratos" linking to `/dashboard` instead of "Registrarse" / "Iniciar sesión".
