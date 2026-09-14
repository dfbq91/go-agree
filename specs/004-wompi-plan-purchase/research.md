# Phase 0 Research: Wompi Payment Gateway Integration & Multi-Provider Architecture

**Feature**: `004-wompi-plan-purchase`  
**Date**: 2026-09-12  
**Status**: Completed  

---

## 1. Wompi Hosted Web Checkout Integration

### Decision
Use Wompi's Hosted Web Checkout (`https://checkout.wompi.co/p/`) via full browser redirection, rather than embedding an external JavaScript client widget into the Next.js bundle.

### Rationale
1. **Zero External Client SDKs**: Embedding third-party vendor scripts introduces supply-chain security risks, bundle bloat, and potential DOM interference, violating Constitution Principle VI (Minimal Dependencies).
2. **Seamless Mobile Banking Rails**: Colombian payment methods (PSE and Nequi) require deep-linking or redirecting to external banking apps. A full browser redirect handles banking navigation reliably without popup blocking or iframe sandboxing issues.
3. **Cryptographic Tamper-Proofing**: Wompi requires an integrity signature for each transaction initiated through Web Checkout. The signature is computed strictly server-side using the merchant's private integrity secret and passed in the checkout URL parameters.

### Integrity Signature Calculation
Wompi Web Checkout verifies parameter integrity using a SHA-256 hash:
$$\text{hash} = \text{SHA256}(\text{reference} + \text{amount\_in\_cents} + \text{currency} + \text{integrity\_secret})$$

- **Parameters**:
  - `public-key`: Merchant public key (e.g. `pub_test_...` or `pub_prod_...`)
  - `currency`: `COP`
  - `amount-in-cents`: e.g. `4900000` ($49.000 COP) or `46800000` ($468.000 COP)
  - `reference`: Cryptographically unique alphanumeric string (e.g. `ga_pro_m_1726156800_a1b2c3`)
  - `signature:integrity`: Calculated SHA-256 hex string
  - `redirect-url`: Return route on Go-Agree (e.g. `https://go-agree.com/checkout/result`)

### Alternatives Considered
- **Wompi Client Widget Script (`checkout.wompi.co/widget.js`)**: Rejected due to external script injection, cross-origin iframe styling constraints, and fragility during mobile bank redirects.
- **Direct Server-to-Server Tokenized Card API**: Deferred to future recurring billing phase; one-time payment with PSE/Nequi/Cards is best fulfilled via hosted checkout.

---

## 2. Asynchronous Webhook Verification & Idempotency

### Decision
Implement a dedicated Next.js Route Handler at `/api/webhooks/wompi` that cryptographically validates the event checksum, verifies the paid amount against the registered transaction, enforces idempotency via unique gateway event IDs, and triggers domain state updates.

### Rationale
1. **Authoritative Confirmation**: Bank confirmations (particularly PSE) resolve asynchronously. Webhooks provide the only reliable, authoritative confirmation from Wompi.
2. **Tamper Detection via Event Checksum**: Wompi includes a SHA-256 event checksum in the webhook payload:
   $$\text{computed\_checksum} = \text{SHA256}(\text{transaction.id} + \text{transaction.status} + \text{transaction.amount\_in\_cents} + \text{timestamp} + \text{event\_secret})$$
   Incoming payloads that fail checksum verification are immediately rejected with HTTP 400/401 and logged as security alerts.
3. **Idempotency Architecture**:
   - Every incoming event contains an `id` or `event_id` and timestamp.
   - The handler first executes an atomic lookup/insert in `payment_webhook_events`. If the event ID already exists with status `processed`, the endpoint immediately returns HTTP 200 without executing side effects.
4. **Duplicate Payment Prevention**:
   - If an approved webhook arrives for an account that already has an active Plan Pro (due to multi-tab checkout or accidental repeat payments), the system detects the duplicate payment, marks the transaction as `Rejected_Duplicate`, does not extend or overwrite the subscription, and logs an alert for financial reconciliation/refund.

### Alternatives Considered
- **Synchronous client-side confirmation without webhooks**: Rejected. PSE bank approval is asynchronous and client browser tabs can be closed before payment confirmation.
- **Automatic subscription period stacking on duplicate payment**: Evaluated during clarify phase and explicitly rejected by business requirement; duplicate payments must be blocked and rejected.

---

## 3. Multi-Provider Architecture & Country Filtering

### Decision
Introduce a `PaymentProviderRegistry` domain entity and a provider abstraction interface (`PaymentGatewayPort`), allowing multiple payment gateways to be registered, filtered by country, and listed in the UI for user selection.

### Rationale
1. **User Requirement Fulfillment**: The user explicitly requested: *"multiple provider should be available, listable in the user interface so the users can select it, and depending of the country, show providers list."*
2. **Clean Architecture & DDD (Constitution Principle II)**: Core subscription and billing entities remain 100% agnostic of payment gateways. Wompi is an infrastructure adapter implementing `PaymentGatewayPort`. Future providers (e.g. Stripe for Mexico or US, MercadoPago) can be plugged in without modifying domain entities or application use cases.
3. **Country-Specific Configuration**:
   - In Colombia (`CO`), Wompi is the primary and default provider offering PSE, Nequi, and Cards.
   - The provider registry maps `CountryCode` $\rightarrow$ `PaymentProviderInfo[]`.
   - On the upgrade/checkout screen, the UI renders the list of available providers for the user's detected/selected country. If only one provider is available, it is preselected; if multiple are available, the user can select their preferred gateway.

### Multi-Provider Model
```text
CountryPricingRegistry (CO, MX, ES, US)
         │
         ▼
PaymentProviderRegistry
   ├── 'CO' -> [ Wompi (default) ]
   └── 'MX' -> [ Stripe / MercadoPago (future) ]
```

---

## 4. Pending Payment Tracking & Return Flow

### Decision
On the payment return screen (`/checkout/result`), implement client-side periodic polling with exponential backoff (every 3–5 seconds for up to 30 seconds) coupled with a manual "Verificar estado" action and a direct shortcut to `/dashboard`.

### Rationale
1. **Fast Feedback for Users**: Bank authorizations that take 5–15 seconds will resolve and update the screen without requiring manual reloads.
2. **No WebSocket/SSE Server Overhead**: In accordance with Constitution Principle VI (Minimal Dependencies), client short-polling avoids managing persistent WebSocket server connections or serverless SSE streaming infrastructure on Netlify/Next.js.
3. **Reassuring UX in Spanish**: Clear Spanish messaging informs users that their payment is being confirmed with their financial institution, showing the reference number and confirming that their access will unlock automatically as soon as bank verification finishes.

---

## 5. Free Quota Metering & Plan Pro Expiration Lifecycle

### Decision
1. **Quota Trigger**: Free quota is consumed **only** upon final contract compilation/generation (`completed` status). Starting or abandoning draft questionnaires consumes 0 quota credits.
2. **Lifetime Quota**: The 3 free contracts are a one-time lifetime quota per account. Deleting an existing contract does not replenish quota.
3. **Expiration Transition**: When a paid Plan Pro expires (after 30 days for monthly or 365 days for annual), the account transitions back to the Free plan with its lifetime quota preserved (if 3 contracts were already created, quota remaining is 0). Users retain permanent view and download access to all previously created contracts, but cannot generate new contracts without renewing.

---

## 6. Environment & Configuration Security

### Configuration Variables
| Variable | Environment | Purpose |
|---|---|---|
| `WOMPI_PUBLIC_KEY` | Public / Server | Identifies merchant account in checkout URL |
| `WOMPI_PRIVATE_KEY` | Server only | Authenticates REST API queries for transaction status |
| `WOMPI_INTEGRITY_SECRET` | Server only | Secret used to generate SHA-256 checkout integrity signature |
| `WOMPI_EVENT_SECRET` | Server only | Secret used to verify incoming webhook SHA-256 checksums |
| `WOMPI_CHECKOUT_URL` | Config / Env | Base URL for hosted checkout (sandbox vs production) |
| `NEXT_PUBLIC_APP_URL` | Public / Server | Base application URL for return redirects |
