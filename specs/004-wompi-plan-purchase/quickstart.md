# Quickstart Validation Guide: Wompi Payment Gateway Integration & Multi-Provider Architecture

**Feature**: `004-wompi-plan-purchase`  
**Date**: 2026-09-12  
**Status**: Ready for Verification  

This guide documents runnable validation scenarios proving the feature works end-to-end across domain, application, infrastructure, and presentation layers.

---

## Prerequisites

1. Monorepo dependencies installed:
   ```bash
   pnpm install
   ```
2. Database migration applied:
   ```bash
   pnpm --filter @go-agree/infrastructure db:migrate # or execute 0003_payment_subscriptions.sql in Supabase Studio
   ```
3. Environment variables configured in `.env.local`:
   ```bash
   WOMPI_PUBLIC_KEY=pub_test_xxxx
   WOMPI_PRIVATE_KEY=prv_test_xxxx
   WOMPI_INTEGRITY_SECRET=test_integrity_xxxx
   WOMPI_EVENT_SECRET=test_event_xxxx
   WOMPI_CHECKOUT_URL=https://checkout.wompi.co/p/
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

---

## Automated Test Suites

Run automated unit and integration tests:

```bash
# Domain tests: PricingConfig, PaymentProviderRegistry, UserSubscription invariants
pnpm --filter @go-agree/domain test

# Application use-cases tests: InitiateCheckout, WebhookProcessing, Idempotency, Quota
pnpm --filter @go-agree/application test

# Infrastructure adapter tests: WompiAdapter, SupabaseRepositories
pnpm --filter @go-agree/infrastructure test

# Web UI and component tests
pnpm --filter web test
```

---

## Manual End-to-End Validation Scenarios

### Scenario 1: Dashboard Free Quota Display & Progress Meter
1. Register a fresh test account at `/register`.
2. Navigate to `/dashboard`.
3. **Verify**:
   - Dashboard displays "Plan Gratuito" badge.
   - Quota meter reads "0 de 3 contratos generados (3 disponibles)".
   - "Comprar Plan Pro" button is visible.
4. Complete 1 contract generation at `/questionnaire`.
5. Return to `/dashboard`.
6. **Verify**:
   - Meter updates to "1 de 3 contratos generados (2 disponibles)".

---

### Scenario 2: Free Quota Exhaustion & Paywall Gating
1. Complete 2 more contracts (reaching 3/3 completed contracts).
2. On `/dashboard`, click "Nuevo Contrato".
3. **Verify**:
   - Contract creation is blocked.
   - An accessible modal or banner appears in Spanish stating that the 3 free contracts have been used.
   - Existing 3 contracts remain 100% accessible for view and download.
   - An action offers "Comprar Plan Pro".

---

### Scenario 3: Multi-Provider Selection & Checkout Redirection
1. Click "Comprar Plan Pro" or navigate to `/checkout`.
2. **Verify**:
   - Country is detected/set to Colombia (`CO`).
   - Payment provider list displays "Wompi (Bancolombia)" with supported payment methods (PSE, Card, Nequi).
   - Billing toggle allows switching between Mensual ($49.000 COP) and Anual ($468.000 COP).
3. Click "Pagar con Wompi".
4. **Verify**:
   - Button immediately disables with loading spinner (double-click prevention).
   - Browser redirects to `https://checkout.wompi.co/p/?...`.
   - URL includes `public-key`, `currency=COP`, `amount-in-cents=4900000`, `reference=ga_...`, and calculated `signature:integrity`.

---

### Scenario 4: Asynchronous Webhook Simulation & Pro Plan Activation
1. Using an API client (curl or Postman), simulate an approved Wompi webhook POST to `/api/webhooks/wompi`:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/wompi \
     -H "Content-Type: application/json" \
     -d '{
       "event": "transaction.updated",
       "data": {
         "transaction": {
           "id": "wompi_tx_12345",
           "status": "APPROVED",
           "reference": "<GENERATED_REFERENCE>",
           "amount_in_cents": 4900000,
           "currency": "COP",
           "payment_method_type": "CARD"
         }
       },
       "timestamp": 1726156800,
       "signature": {
         "checksum": "<COMPUTED_SHA256_CHECKSUM>"
       },
       "environment": "test"
     }'
   ```
2. **Verify**:
   - Webhook returns HTTP 200 within 1.5 seconds.
   - User dashboard at `/dashboard` updates immediately to "Plan Pro" with unlimited contract generation enabled.

---

### Scenario 5: Webhook Idempotency Verification
1. Resend the exact same curl request from Scenario 4.
2. **Verify**:
   - Webhook returns HTTP 200 immediately.
   - In database `payment_webhook_events`, event status is logged as `ignored_duplicate`.
   - Subscription expiration date and plan status remain unchanged.

---

### Scenario 6: In-Progress / Pending Payment Return Flow
1. Simulate gateway return with a pending transaction: navigate to `/checkout/result?id=<PENDING_REFERENCE>`.
2. **Verify**:
   - Result screen displays "Pago en proceso" in Spanish.
   - Explains that the bank is verifying the transaction (PSE).
   - Periodic status check runs with exponential backoff (every 3-5s for up to 30s).
   - "Verificar estado" manual button is enabled.
   - Button "Ir al panel" is available.
3. Fire approved webhook while on this page.
4. **Verify**:
   - UI dynamically transitions to "¡Pago exitoso! Tu Plan Pro está activo" within 5 seconds.

---

### Scenario 7: Payment Rejection & Non-Reusable Reference Retry
1. Simulate gateway return for a rejected transaction: navigate to `/checkout/result?id=<REJECTED_REFERENCE>`.
2. **Verify**:
   - Result screen displays "Pago rechazado" with rejection reason in Spanish (e.g., "Fondos insuficientes").
   - Click "Reintentar pago".
   - System navigates to checkout and creates a brand new payment reference (old reference is never reused).

---

### Scenario 8: Duplicate Payment Prevention Across Tabs
1. Open checkout in Tab A and Tab B.
2. Approve payment in Tab A (user upgrades to Plan Pro).
3. Switch to Tab B: attempt to initiate or approve checkout.
4. **Verify**:
   - Tab B blocks checkout initiation because Plan Pro is already active.
   - If an overlapping webhook is received, server-side idempotency flags the transaction as `Rejected_Duplicate`, preventing duplicate subscriptions.
