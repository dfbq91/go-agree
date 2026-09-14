# Implementation Plan: Wompi Payment Gateway Integration & Multi-Provider Monetization

**Branch**: `004-wompi-plan-purchase` | **Date**: 2026-09-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-wompi-plan-purchase/spec.md` with multi-provider country-based listing requirement.

---

## Summary

Implement real-money payment monetization for `go-agree` allowing users to purchase Plan Pro (monthly at $49.000 COP or annual at $468.000 COP) once their 3 free contracts quota is exhausted.

The technical architecture implements:
1. **Multi-Provider Architecture**: A domain `PaymentProviderRegistry` mapping country codes (defaulting to Colombia `CO`) to available payment gateways, listable in the user interface so users can select their preferred provider (with Wompi as the initial primary provider supporting PSE, Cards, and Nequi).
2. **Clean Architecture & DDD (Constitution Principle II)**: Core subscription, quota, and billing entities remain 100% decoupled from payment gateway implementations through `PaymentGatewayPort`, `PaymentRepositoryPort`, and `SubscriptionRepositoryPort`.
3. **Wompi Hosted Web Checkout (`checkout.wompi.co/p/`)**: Full browser redirect with server-calculated SHA-256 integrity signatures, avoiding external vendor client script dependencies (Constitution Principle VI).
4. **Idempotent Webhook Confirmation**: Cryptographic checksum validation, amount/currency matching, idempotency logging, and duplicate payment prevention (`Rejected_Duplicate`).
5. **Return Flow & Pending Payment Handling**: Client-side short polling with exponential backoff (every 3–5s up to 30s) and manual verification for asynchronous bank authorizations (PSE).
6. **Dashboard Integration & Quota Gating**: Live Plan badge ("Plan Gratuito" vs "Plan Pro"), 3-contract quota meter, paywall modal gating 4th contract creation, and rejection retry flows with fresh references.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ across all workspace packages  
**Primary Dependencies**: Next.js 14+ (App Router), React 18, Tailwind CSS, `@supabase/ssr`, standard `node:crypto` (for SHA-256 integrity checksums and signatures; zero external payment SDKs needed)  
**Storage**: Supabase / PostgreSQL (`public.user_subscriptions`, `public.payment_transactions`, `public.payment_webhook_events` with Row-Level Security)  
**Testing**: Vitest for domain, application, and infrastructure unit/integration tests; Vitest + `@testing-library/react` and `axe-core` for UI components  
**Target Platform**: Modern web browsers across mobile (320px+), tablet, and desktop viewports  
**Project Type**: Monorepo full-stack web application with Clean Architecture and Domain-Driven Design  
**Performance Goals**: Webhook acknowledgement <1.5s; checkout redirect launch <2s; zero UI layout shifts; 100% WCAG 2.1 AA accessibility audit pass  
**Constraints**:
- Constitution Principle VII: All user-facing text, plan badges, error notices, and rejection reasons strictly in Spanish (`es`) centralized in `apps/web/src/locales/es.ts`; English used exclusively for code identifiers and documentation.
- Constitution Principle VI: Minimal dependencies managed exclusively via `pnpm`; no third-party payment client scripts or SDKs.
- Non-reusable failed references: Every payment attempt generates a brand new reference.
- Duplicate payment prevention: Active Plan Pro subscribers cannot initiate checkouts, and concurrent payments are rejected via idempotency.
**Scale/Scope**: All registered users generating contracts; single Pro plan with monthly and annual options across multiple selectable payment providers by country.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | `PaymentProviderRegistry` is open for extension and closed for modification (OCP); gateway interactions segregated via `PaymentGatewayPort` (ISP); payment domain errors are typed and predictable. |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` defines `UserSubscription`, `PaymentTransaction`, `PaymentProviderRegistry`; `application` orchestrates use cases through ports; `infrastructure` implements `WompiPaymentGatewayAdapter` and Supabase repositories; web framework never leaks into domain. |
| **III. Test-Driven Development** | **PASS** | Non-negotiable TDD: unit tests for subscription invariants, provider registry, checkout signature calculation, webhook checksum verification, and use cases precede production code. |
| **IV. Spec & Code Synchronization** | **PASS** | Design artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) directly reflect all 26 functional requirements and 10 success criteria in `spec.md`. |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | Mobile-first layout down to 320px; accessible radio/card selector for payment providers; accessible modal dialog with focus traps; color contrast $\ge 4.5:1$. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Uses standard `node:crypto` for cryptographic hashing; zero external payment SDKs; managed strictly with `pnpm`. |
| **VII. Language & Localization Separation** | **PASS** | All user-facing Spanish strings centralized in `apps/web/src/locales/es.ts`; English strictly used for identifiers, schemas, and documentation. |

---

## Project Structure

### Documentation (this feature)

```text
specs/004-wompi-plan-purchase/
├── spec.md                              # Feature specification with clarifications
├── checklists/
│   └── requirements.md                  # Spec quality checklist (16/16 passing)
├── plan.md                              # This file (/speckit-plan command output)
├── research.md                          # Phase 0 output: Technical decisions & Wompi analysis
├── data-model.md                        # Phase 1 output: Entities, transitions & SQL migration
├── quickstart.md                        # Phase 1 output: Runnable verification scenarios
└── contracts/                           # Phase 1 output: Ports & UI contracts
    ├── payment-gateway.contract.ts
    ├── subscription-repository.contract.ts
    ├── payment-repository.contract.ts
    └── checkout-ui.contract.ts
```

### Source Code (repository layout)

```text
go-agree/
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   ├── UserSubscription.ts              # Plan entitlement, status & free quota methods
│   │   │   │   ├── PaymentTransaction.ts            # Transaction entity & status states
│   │   │   │   └── PaymentProviderInfo.ts           # Provider info & PaymentProviderRegistry
│   │   │   ├── services/
│   │   │   │   └── PaymentReferenceService.ts       # Cryptographic unique reference generator
│   │   │   └── index.ts                             # Export payment domain entities & registry
│   │   └── tests/
│   │       ├── UserSubscription.test.ts             # Invariant tests (free quota gating, expiration)
│   │       └── PaymentProviderRegistry.test.ts      # Country-based provider lookup tests
│   ├── application/
│   │   ├── src/
│   │   │   ├── ports/
│   │   │   │   ├── PaymentGatewayPort.ts            # Payment gateway interface
│   │   │   │   ├── SubscriptionRepositoryPort.ts    # Subscription persistence port
│   │   │   │   └── PaymentRepositoryPort.ts         # Payment transaction & webhook log port
│   │   │   ├── use-cases/
│   │   │   │   ├── GetSubscriptionStatusUseCase.ts  # Fetches user tier & remaining quota
│   │   │   │   ├── ListPaymentProvidersUseCase.ts   # Returns eligible providers for a country
│   │   │   │   ├── InitiatePlanCheckoutUseCase.ts   # Validates, creates reference, signs & redirects
│   │   │   │   ├── ProcessPaymentWebhookUseCase.ts  # Validates checksum, idempotency & activates Pro
│   │   │   │   ├── GetTransactionStatusUseCase.ts   # For result page polling & verification
│   │   │   │   └── ConsumeContractQuotaUseCase.ts   # Increments quota on contract completion
│   │   │   └── index.ts                             # Export use cases & ports
│   │   └── tests/
│   │       ├── InitiatePlanCheckoutUseCase.test.ts  # Checkout creation & double-click protection
│   │       └── ProcessPaymentWebhookUseCase.test.ts # Webhook signature, idempotency & duplicate checks
│   └── infrastructure/
│       ├── src/
│       │   ├── adapters/
│       │   │   ├── payment/
│       │   │   │   ├── WompiPaymentGatewayAdapter.ts # Wompi signature & hosted checkout implementation
│       │   │   │   └── PaymentGatewayResolver.ts     # Resolves adapter for selected provider
│       │   │   └── storage/
│       │   │       ├── SupabaseSubscriptionRepository.ts # Subscription persistence & RLS
│       │   │       └── SupabasePaymentRepository.ts      # Transactions & webhook events persistence
│       │   ├── supabase/
│       │   │   └── migrations/
│       │   │       └── 0003_payment_subscriptions.sql   # Tables, indexes & RLS policies
│       │   └── index.ts
│       └── tests/
│           └── WompiPaymentGatewayAdapter.test.ts    # Signature & checksum calculation tests
└── apps/
    └── web/
        ├── src/
        │   ├── locales/
        │   │   └── es.ts                            # Centralized Spanish translations (checkout, plans, errors)
        │   ├── app/
        │   │   ├── (protected)/
        │   │   │   ├── dashboard/
        │   │   │   │   └── page.tsx                 # Enhanced dashboard showing Plan badge & quota meter
        │   │   │   ├── checkout/
        │   │   │   │   ├── page.tsx                 # Checkout page with provider & cycle selection
        │   │   │   │   └── result/
        │   │   │   │       └── page.tsx             # Payment result page (Pending polling, Approved, Rejected)
        │   │   ├── api/
        │   │   │   ├── checkout/
        │   │   │   │   ├── initiate/route.ts        # POST endpoint to start checkout
        │   │   │   │   └── status/route.ts          # GET endpoint for polling transaction status
        │   │   │   └── webhooks/
        │   │   │       └── wompi/route.ts           # Authoritative webhook receiver endpoint
        │   └── components/
        │       ├── dashboard/
        │       │   ├── PlanQuotaBadge.tsx           # Free/Pro status badge & quota progress bar
        │       │   └── QuotaUpgradeModal.tsx        # Modal gating 4th contract creation
        │       └── checkout/
        │           ├── PaymentProviderSelector.tsx  # Accessible listable provider selector by country
        │           ├── PlanCheckoutCard.tsx         # Plan summary & "Pagar" CTA with double-click guard
        │           └── PaymentResultView.tsx        # Status feedback with polling & retry controls
        └── tests/
            ├── components/
            │   ├── PlanQuotaBadge.test.tsx
            │   ├── PaymentProviderSelector.test.tsx
            │   └── PaymentResultView.test.tsx
            └── api/
                └── webhook-wompi.test.ts
```

**Structure Decision**: Monorepo package layout adhering strictly to Clean Architecture. Pure domain models in `packages/domain`, use cases in `packages/application`, Wompi and Supabase implementations in `packages/infrastructure`, and Next.js routes/presentation in `apps/web`.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No constitutional violations. All implementations adhere strictly to Principles I–VII.*

| Principle / Gate | Status | Details |
|---|---|---|
| None | N/A | Full compliance achieved across all architectural boundaries. |
