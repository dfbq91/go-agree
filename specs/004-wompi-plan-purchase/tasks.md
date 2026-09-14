# Implementation Tasks: Wompi Payment Gateway Integration & Multi-Provider Monetization

**Feature**: `004-wompi-plan-purchase`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Date**: 2026-09-12  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, environment configuration, database schema, and localization.

- [x] T001 Configure Wompi and payment environment variables in `.env.example` and update environment validation in `apps/web/src/lib/config.ts`
- [x] T002 [P] Create database migration in `packages/infrastructure/src/supabase/migrations/0003_payment_subscriptions.sql` for `user_subscriptions`, `payment_transactions`, and `payment_webhook_events` with RLS policies and indexes
- [x] T003 [P] Add Spanish payment, plan, quota, and rejection localization dictionary in `apps/web/src/locales/es.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain entities, multi-provider registry, application ports, and infrastructure adapters required before user stories.

**⚠️ CRITICAL**: No user story work can begin until this foundational phase is complete.

- [x] T004 [P] Implement `PaymentProviderInfo` and `PaymentProviderRegistry` in `packages/domain/src/entities/PaymentProviderInfo.ts` supporting country-based provider lookups (`CO` -> Wompi)
- [x] T005 [P] Implement `PaymentReferenceService` in `packages/domain/src/services/PaymentReferenceService.ts` for generating unique cryptographically secure merchant references
- [x] T006 [P] Implement `UserSubscription` domain entity in `packages/domain/src/entities/UserSubscription.ts` with quota verification, plan checks, and expiration lifecycle methods
- [x] T007 [P] Implement `PaymentTransaction` domain entity in `packages/domain/src/entities/PaymentTransaction.ts` with payment statuses and rejection reasons
- [x] T008 [P] Define application port interfaces in `packages/application/src/ports/PaymentGatewayPort.ts`, `packages/application/src/ports/PaymentRepositoryPort.ts`, and `packages/application/src/ports/SubscriptionRepositoryPort.ts`
- [x] T009 Implement `SupabaseSubscriptionRepository` in `packages/infrastructure/src/adapters/storage/SupabaseSubscriptionRepository.ts` implementing `SubscriptionRepositoryPort`
- [x] T010 Implement `SupabasePaymentRepository` in `packages/infrastructure/src/adapters/storage/SupabasePaymentRepository.ts` implementing `PaymentRepositoryPort`
- [x] T011 Implement `WompiPaymentGatewayAdapter` in `packages/infrastructure/src/adapters/payment/WompiPaymentGatewayAdapter.ts` with SHA-256 integrity signature calculation, checkout redirect URL generation, and webhook checksum verification
- [x] T012 Implement `PaymentGatewayResolver` in `packages/infrastructure/src/adapters/payment/PaymentGatewayResolver.ts` to dynamically resolve the gateway adapter for a provider ID

**Checkpoint**: Foundation complete. Core models, ports, and storage adapters ready for user stories.

---

## Phase 3: User Story 1 - Plan Status & Free Quota Metering on User Dashboard (Priority: P1) 🎯 MVP

**Goal**: Display Plan Free vs Pro badge, show contracts generated (X/3) and remaining, gate 4th contract creation with upgrade prompt while preserving access to view/download prior contracts, and revert expired Pro to Free preserving lifetime quota.

**Independent Test**: Register a new account, verify dashboard displays "Plan Gratuito: 0 de 3 contratos generados (3 disponibles)". Complete 3 contracts; verify counter updates (1/3, 2/3, 3/3). Attempt 4th contract and verify creation is gated by `QuotaUpgradeModal` while existing contracts remain readable.

### Tests for User Story 1 (TDD First) ⚠️

- [x] T013 [P] [US1] Unit tests for `UserSubscription` quota evaluation and expiration transitions in `packages/domain/tests/UserSubscription.test.ts`
- [x] T014 [P] [US1] Component tests for `PlanQuotaBadge` and `QuotaUpgradeModal` in `apps/web/tests/components/PlanQuotaBadge.test.tsx`

### Implementation for User Story 1

- [x] T015 [US1] Implement `GetSubscriptionStatusUseCase` in `packages/application/src/use-cases/GetSubscriptionStatusUseCase.ts`
- [x] T016 [US1] Implement `ConsumeContractQuotaUseCase` in `packages/application/src/use-cases/ConsumeContractQuotaUseCase.ts` and integrate into contract compilation handler
- [x] T017 [P] [US1] Implement `PlanQuotaBadge` UI component in `apps/web/src/components/dashboard/PlanQuotaBadge.tsx`
- [x] T018 [P] [US1] Implement `QuotaUpgradeModal` UI component in `apps/web/src/components/dashboard/QuotaUpgradeModal.tsx`
- [x] T019 [US1] Update dashboard page in `apps/web/src/app/(protected)/dashboard/page.tsx` to load subscription status, render `PlanQuotaBadge`, and gate "Nuevo Contrato" with `QuotaUpgradeModal` when 3/3 contracts used

**Checkpoint**: User Story 1 independently functional (MVP for quota metering and paywall gating).

---

## Phase 4: User Story 2 - Initiating Plan Checkout with Multi-Provider Support (Priority: P1)

**Goal**: User selects billing cycle and payment provider filtered by country (Wompi for Colombia), clicks pay, disables button with spinner against double-clicks, creates pending transaction with unique reference and integrity signature, and redirects to Wompi Hosted Web Checkout.

**Independent Test**: Navigate to `/checkout`, verify country shows Colombia with Wompi listed as provider, toggle billing cycle, click "Pagar con Wompi", verify button disables to prevent double-click, and confirm redirection to Wompi checkout URL with valid signature and amount in cents.

### Tests for User Story 2 (TDD First) ⚠️

- [x] T020 [P] [US2] Unit tests for `PaymentProviderRegistry` country filtering in `packages/domain/tests/PaymentProviderRegistry.test.ts`
- [x] T021 [P] [US2] Unit tests for `InitiatePlanCheckoutUseCase` (preventing double checkout, reference creation, signature calculation) in `packages/application/tests/InitiatePlanCheckoutUseCase.test.ts`
- [x] T022 [P] [US2] Component tests for `PaymentProviderSelector` and `PlanCheckoutCard` in `apps/web/tests/components/PaymentProviderSelector.test.tsx`

### Implementation for User Story 2

- [x] T023 [US2] Implement `ListPaymentProvidersUseCase` in `packages/application/src/use-cases/ListPaymentProvidersUseCase.ts`
- [x] T024 [US2] Implement `InitiatePlanCheckoutUseCase` in `packages/application/src/use-cases/InitiatePlanCheckoutUseCase.ts`
- [x] T025 [P] [US2] Implement `PaymentProviderSelector` UI component in `apps/web/src/components/checkout/PaymentProviderSelector.tsx`
- [x] T026 [P] [US2] Implement `PlanCheckoutCard` UI component in `apps/web/src/components/checkout/PlanCheckoutCard.tsx` with double-click guard and billing cycle toggle
- [x] T027 [US2] Create checkout API endpoint in `apps/web/src/app/api/checkout/initiate/route.ts` handling checkout initiation requests
- [x] T028 [US2] Create protected checkout page in `apps/web/src/app/(protected)/checkout/page.tsx` rendering provider selector and plan checkout card

**Checkpoint**: User Stories 1 AND 2 functional (user can inspect quota and launch checkout through selectable providers).

---

## Phase 5: User Story 3 - Asynchronous Payment Confirmation via Secure Webhook (Priority: P1)

**Goal**: Webhook route receiver validates SHA-256 event checksum, verifies amount and currency match, enforces idempotency via `payment_webhook_events`, activates Plan Pro (30 days for monthly, 365 days for annual), and rejects invalid or mismatched events.

**Independent Test**: Simulate an approved Wompi webhook POST to `/api/webhooks/wompi` with valid signature; verify response is 200 within 1.5s and user upgrades to Plan Pro. Re-send identical payload and verify idempotent 200 no-op. Send payload with invalid signature or mismatched amount and verify rejection without plan upgrade.

### Tests for User Story 3 (TDD First) ⚠️

- [x] T029 [P] [US3] Unit tests for `WompiPaymentGatewayAdapter` webhook checksum verification in `packages/infrastructure/tests/WompiPaymentGatewayAdapter.test.ts`
- [x] T030 [P] [US3] Unit tests for `ProcessPaymentWebhookUseCase` (tamper rejection, amount mismatch, Pro activation, idempotency) in `packages/application/tests/ProcessPaymentWebhookUseCase.test.ts`
- [x] T031 [P] [US3] Integration test for webhook route in `apps/web/tests/api/webhook-wompi.test.ts`

### Implementation for User Story 3

- [x] T032 [US3] Implement `ProcessPaymentWebhookUseCase` in `packages/application/src/use-cases/ProcessPaymentWebhookUseCase.ts`
- [x] T033 [US3] Create public webhook route handler in `apps/web/src/app/api/webhooks/wompi/route.ts` receiving POST events, validating checksums, executing use case, and returning HTTP 200 within 1.5s

**Checkpoint**: Real money payment loop closed. Webhooks authoritatively confirm transactions and activate Pro plans idempotently.

---

## Phase 6: User Story 4 - Post-Payment Return Flow & In-Progress / Pending Payments (Priority: P2)

**Goal**: Customer returning to Go-Agree sees immediate status; if pending (PSE bank delay), displays reassuring Spanish message, polls status every 3-5s up to 30s with exponential backoff, offers manual "Verificar estado" button, transitions dynamically to approved, and provides direct link to `/dashboard`.

**Independent Test**: Navigate to `/checkout/result?id=<PENDING_REFERENCE>`, verify "Pago en proceso" message, automatic polling with backoff, and manual refresh button. Fire approved webhook and verify UI transitions dynamically to approved.

### Tests for User Story 4 (TDD First) ⚠️

- [x] T034 [P] [US4] Unit tests for `GetTransactionStatusUseCase` in `packages/application/tests/GetTransactionStatusUseCase.test.ts`
- [x] T035 [P] [US4] Component tests for `PaymentResultView` (pending polling, manual verify, approved dynamic transition) in `apps/web/tests/components/PaymentResultView.test.tsx`

### Implementation for User Story 4

- [x] T036 [US4] Implement `GetTransactionStatusUseCase` in `packages/application/src/use-cases/GetTransactionStatusUseCase.ts`
- [x] T037 [US4] Create transaction status polling API endpoint in `apps/web/src/app/api/checkout/status/route.ts`
- [x] T038 [US4] Implement `PaymentResultView` presentation component in `apps/web/src/components/checkout/PaymentResultView.tsx` with exponential backoff polling, manual verify button, and Spanish status copy
- [x] T039 [US4] Implement payment return page in `apps/web/src/app/(protected)/checkout/result/page.tsx` displaying transaction status

**Checkpoint**: Seamless post-checkout return flow handling pending banking authorizations.

---

## Phase 7: User Story 5 - Payment Rejection Handling & Clean Retry with New Reference (Priority: P2)

**Goal**: Capture rejection diagnostic reasons from gateway, display user-friendly explanation in Spanish, provide "Reintentar pago" action that generates a brand new reference, and guarantee failed references are never reused.

**Independent Test**: Navigate to `/checkout/result?id=<REJECTED_REFERENCE>`, verify rejection explanation in Spanish, click "Reintentar pago", and confirm a fresh reference is generated while the failed reference remains archived.

### Tests for User Story 5 (TDD First) ⚠️

- [x] T040 [P] [US5] Unit tests for rejection status capture, error mapping, and non-reusable reference validation in `packages/application/tests/PaymentRejectionHandling.test.ts`

### Implementation for User Story 5

- [x] T041 [US5] Enhance `PaymentResultView` in `apps/web/src/components/checkout/PaymentResultView.tsx` with rejection error diagnostics and "Reintentar pago" action routing to `/checkout`
- [x] T042 [US5] Add server-side validation in `InitiatePlanCheckoutUseCase` in `packages/application/src/use-cases/InitiatePlanCheckoutUseCase.ts` ensuring failed references cannot be re-opened and generating fresh references

**Checkpoint**: Failed payments gracefully explained and cleanly recoverable.

---

## Phase 8: User Story 6 - Abandoned Checkout Recovery & Window Closure Resilience (Priority: P3)

**Goal**: Users closing payment window or navigating away can return to Go-Agree and initiate fresh checkout without being trapped in stale lockouts; stale pending checkouts expire after timeout without blocking users.

**Independent Test**: Initiate checkout, close tab without paying, return 15 minutes later to `/checkout` and verify user can initiate a new checkout session without obstruction.

### Tests for User Story 6 (TDD First) ⚠️

- [x] T043 [P] [US6] Unit tests for abandoned checkout recovery and stale session superseding in `packages/application/tests/AbandonedCheckoutRecovery.test.ts`

### Implementation for User Story 6

- [x] T044 [US6] Add checkout session superseding logic in `InitiatePlanCheckoutUseCase` in `packages/application/src/use-cases/InitiatePlanCheckoutUseCase.ts` to allow initiating new checkouts if previous attempt was abandoned

**Checkpoint**: Abandoned checkouts do not lock users out.

---

## Phase 9: User Story 7 - Multi-Tab & Concurrent Transaction Integrity (Priority: P3)

**Goal**: Prevent double payments; block checkout initiation if Plan Pro is already active; if concurrent webhooks arrive for an already upgraded user, reject accepting as subscription (`Rejected_Duplicate`) via idempotency, and alert for reconciliation/refund.

**Independent Test**: In Tab A and Tab B, attempt checkouts. Approve Tab A. Verify Tab B blocks checkout. If duplicate webhook arrives, verify second payment is marked `Rejected_Duplicate` and user is not double-subscribed.

### Tests for User Story 7 (TDD First) ⚠️

- [x] T045 [P] [US7] Unit tests for concurrent duplicate payment rejection and idempotency in `packages/application/tests/ConcurrentDuplicatePayment.test.ts`

### Implementation for User Story 7

- [x] T046 [US7] Add active subscriber check in `InitiatePlanCheckoutUseCase` in `packages/application/src/use-cases/InitiatePlanCheckoutUseCase.ts` blocking checkout if user already has Plan Pro
- [x] T047 [US7] Update `ProcessPaymentWebhookUseCase` in `packages/application/src/use-cases/ProcessPaymentWebhookUseCase.ts` to check if subscriber is already Pro, marking duplicate transactions as `Rejected_Duplicate` and logging audit alert

**Checkpoint**: Concurrent checkout conflict prevention and duplicate payment rejection verified.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive design, end-to-end verification, and documentation.

- [x] T048 [P] Accessibility audit with `axe-core` across checkout and result pages in `apps/web/tests/accessibility/checkout-a11y.test.ts`
- [x] T049 [P] Mobile viewport responsiveness check (320px+) for `PlanQuotaBadge`, `PaymentProviderSelector`, and `PaymentResultView`
- [x] T050 Execute end-to-end scenarios from `specs/004-wompi-plan-purchase/quickstart.md` across all packages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3 - P1)**: Depends on Foundational (Phase 2) — Core MVP
- **User Story 2 (Phase 4 - P1)**: Depends on Foundational (Phase 2) — Integrates with US1
- **User Story 3 (Phase 5 - P1)**: Depends on Foundational (Phase 2) and US2 transactions
- **User Story 4 (Phase 6 - P2)**: Depends on US2 and US3
- **User Story 5 (Phase 7 - P2)**: Depends on US2 and US4
- **User Story 6 (Phase 8 - P3)**: Depends on US2
- **User Story 7 (Phase 9 - P3)**: Depends on US2 and US3
- **Polish (Phase 10)**: Depends on all desired user stories complete

### Parallel Opportunities

- Within Phase 1: `T002` and `T003` can execute in parallel.
- Within Phase 2: `T004`, `T005`, `T006`, `T007`, `T008` can execute in parallel.
- Within each User Story phase: Test tasks marked `[P]` can be implemented in parallel before implementation.
- Presentation component tasks (`T017`, `T018`, `T025`, `T026`, `T038`) can be developed in parallel with backend use-case wiring.

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3 - User Story 1)

1. Complete Setup (Phase 1) and Foundational (Phase 2).
2. Implement User Story 1 (Phase 3): Dashboard Plan badge, 3-contract quota meter, and 4th contract gating.
3. Validate independently: users see quota and get gated upon 3 contracts.

### Incremental Feature Delivery

1. **Increment 1**: Add User Story 2 (Phase 4): Multi-provider selection and Wompi checkout initiation.
2. **Increment 2**: Add User Story 3 (Phase 5): Webhook receiver and automatic Plan Pro activation.
3. **Increment 3**: Add User Story 4 (Phase 6): Pending payment polling and return UX.
4. **Increment 4**: Add User Stories 5, 6, 7 (Phases 7–9): Rejections, abandonment recovery, and duplicate payment protection.
5. **Increment 5**: Polish (Phase 10): WCAG 2.1 AA audits and quickstart validation.
