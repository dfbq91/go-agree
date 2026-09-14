# Feature Specification: Wompi Payment Gateway Integration & Plan Monetization

**Feature Branch**: `004-wompi-plan-purchase`

**Created**: 2026-09-12

**Status**: Ready for Review

**Input**: User description: "As a contracting party of Go-Agree, I want to be able to purchase a plan/package so that I can continue generating contracts, using Wompi as the payment gateway, allowing the business to monetize the service once the 3 free contracts have been used. This feature introduces real-money payments through Wompi (a Colombian payment gateway backed by Bancolombia), covering both the one-time payment flow (PSE, credit/debit card, Nequi) and the foundation for future recurring payments, without coupling the rest of the application to the payment provider. Handle all applicable scenarios, including displaying in the dashboard whether the user has a Pro or Free plan. If the user has the Free plan, the dashboard must show how many contracts they have generated and how many they have remaining. When the customer completes a payment and the notification is received through the webhook, the successful payment must be reflected in the user experience, with an option to redirect the user back to the dashboard. The system must also handle payments that are still in progress when the user is redirected back to Go-Agree before the bank has confirmed the transaction. The payment status must change to Approved once the corresponding webhook notification is received. The rejected payment scenario must also be handled, including displaying or determining the rejection reason and providing an option to retry the payment using a new payment reference. A failed reference must never be reused. Duplicate payments must be prevented. Likewise, if Wompi sends the same webhook event more than once, subsequent processing of the same event must be a no-op (idempotent processing). The system must handle the case where the user closes the payment window before completing the transaction. If they return later, they must be able to start a new payment attempt. The system must also handle edge cases such as: Two payments being accidentally initiated or completed; Double-clicks on the payment action; The payment flow being opened in two browser tabs; A webhook amount that does not match the expected payment amount; Changes to Wompi sandbox/API keys; Any other relevant payment, webhook, concurrency, idempotency, or consistency scenarios; other applicable edge cases related with payments"

## Clarifications

### Session 2026-09-12

- Q: Which Wompi checkout mode should be presented to users when they initiate a plan purchase? (FR-009) → A: Full redirect to Wompi Hosted Web Checkout (`checkout.wompi.co/p/`) with return URL redirecting back to the Go-Agree payment result page.
- Q: How should the system handle a user's account status and contract creation allowance when their paid Plan Pro subscription expires without renewal? (FR-015) → A: Revert to Free plan with lifetime free quota count preserved (0 remaining if 3 already generated; requires renewal to generate new contracts; full view/download access preserved).
- Q: How should the payment result page monitor and display updates when a user returns with a transaction that is still in pending status? (FR-016, FR-017) → A: Client-side short polling with exponential backoff (every 3–5s up to 30s) plus a manual "Verificar estado" button and dashboard link.
- Q: At what exact lifecycle event does a contract count against a user's 3 free contracts quota? (FR-003, FR-004) → A: Only finalized/completed contract generations count against the quota; unfinished drafts consume nothing, and deleting a generated contract does not replenish quota.
- Q: How should the system handle and credit a second approved payment if a user accidentally completes two checkouts concurrently across multiple tabs? (FR-015, User Story 7) → A: A second payment must not be accepted; users with an active Plan Pro or pending checkout are blocked from initiating new payments, and any concurrent duplicate payment is rejected via idempotency.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Plan Status & Free Quota Metering on User Dashboard (Priority: P1)

As an authenticated user, I want my dashboard to clearly display my current subscription tier ("Plan Free" or "Plan Pro"), and if I am on the Free plan, explicitly show how many free contracts I have generated and how many remain (out of 3), so that I always know my remaining balance and can upgrade when my limit is reached.

**Why this priority**: Immediate transparency of account tier and remaining contract allowance is essential for setting customer expectations, preventing surprise paywalls, and driving timely monetization conversions.

**Independent Test**: Can be verified independently by logging in with a new user (0 contracts used), confirming the dashboard displays "Plan Gratuito", "0 de 3 contratos generados" and "3 contratos disponibles". Generating contracts successively updates the counter (1/3, 2/3, 3/3). When 3 contracts are reached, new contract initiation is gated by an upgrade prompt, while existing contracts remain accessible for view and download.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Free plan with 0 contracts generated, **When** they view the dashboard, **Then** the header area displays a "Plan Gratuito" badge, an indicator stating that 0 of 3 free contracts have been generated (3 remaining), and an accessible option to upgrade to Plan Pro.
2. **Given** an authenticated user on the Free plan who has generated between 1 and 2 contracts, **When** they visit the dashboard, **Then** the progress meter accurately updates to reflect the exact number of generated contracts and the remaining quota (e.g. "2 de 3 contratos generados — 1 restante").
3. **Given** an authenticated user on the Free plan who has generated all 3 allowed free contracts, **When** they attempt to initiate a new contract generation, **Then** the system prevents generation and presents an upgrade modal or dedicated paywall view explaining in Spanish that their free quota has been exhausted and offering direct checkout for Plan Pro.
4. **Given** an authenticated user with an active "Plan Pro", **When** they visit the dashboard, **Then** the dashboard displays a prominent "Plan Pro" badge, indicates unlimited contract generation access, omits the free contract countdown, and enables the new contract creation action without quota restrictions.
5. **Given** a user who has reached their 3 free contract limit, **When** they review their dashboard list of previously generated contracts, **Then** they can still freely access, view, and download all 3 existing contracts without restriction.
6. **Given** an authenticated user whose Plan Pro subscription validity expires without renewal, **When** they access the dashboard, **Then** their tier reverts to "Plan Gratuito" with their lifetime free contract count preserved; if they had previously used all 3 free contracts, their remaining quota is 0, gating new contract creation behind a renewal prompt while preserving complete access to view and download all existing contracts.

---

### User Story 2 - Initiating Plan Checkout with Payment Methods (Priority: P1)

As an authenticated user ready to upgrade to Plan Pro, I want to initiate a secure checkout transaction through Wompi supporting Colombian payment rails (PSE, Credit/Debit Card, Nequi) so that I can pay using my preferred payment method in Colombian Pesos (COP).

**Why this priority**: This is the core revenue collection gateway. Enabling familiar and trusted local payment methods (Bancolombia/PSE/Nequi/Cards) is mandatory for conversion in the Colombian market.

**Independent Test**: Can be verified independently by selecting Plan Pro (either monthly or annual billing option), clicking the purchase action, and confirming that a unique payment attempt reference is created with integrity signature, the payment interface opens with the correct billing amount in COP, and the checkout action is protected against double-clicking.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the upgrade/checkout screen, **When** they select their desired billing cycle (monthly at $49.000 COP or annual at $468.000 COP) and click "Pagar con Wompi", **Then** the system registers a pending payment attempt with a unique reference and redirects the user via full browser redirect to Wompi Hosted Web Checkout (`checkout.wompi.co/p/`) populated with the calculated amount, currency, integrity signature, and return URL pointing to the Go-Agree result route.
2. **Given** a user clicking the payment button, **When** they rapidly click or double-click the button, **Then** the interface immediately disables the button and displays a progress indicator, ensuring only a single payment reference is created and preventing duplicate checkouts.
3. **Given** a user who opens the upgrade screen in two separate browser tabs, **When** they initiate payment in both tabs, **Then** each tab generates a separate, distinct payment reference with independent tracking, preventing state collision or corrupted transactions.

---

### User Story 3 - Asynchronous Payment Confirmation via Secure Webhook (Priority: P1)

As the Go-Agree platform, when Wompi delivers an asynchronous transaction status notification (webhook), I want the system to cryptographically verify the notification authenticity, confirm the paid amount and currency match the expected plan price, record the transaction outcome, and automatically activate the user's Plan Pro subscription upon approval.

**Why this priority**: Webhooks are the authoritative mechanism for payment confirmation in modern payment gateways. Secure, tamper-proof, and idempotent processing guarantees that users get access immediately upon bank approval while protecting the platform against fraud and replay attacks.

**Independent Test**: Can be verified independently by simulating a signed Wompi transaction webhook with an "APPROVED" status for a known pending payment reference, confirming that the signature is validated, the amount matches, the user's tier immediately updates to "Plan Pro", and subsequent identical webhook payloads are acknowledged with success without duplicate state changes.

**Acceptance Scenarios**:

1. **Given** a pending payment transaction in the system, **When** a valid webhook notification with status "APPROVED" is received with a matching checksum and expected amount, **Then** the transaction status changes to "Approved", the user's account is upgraded to Plan Pro with the appropriate expiration date (30 days for monthly, 365 days for annual), and the webhook responds with HTTP 200.
2. **Given** a webhook notification with an invalid checksum, missing signature, or unknown source, **When** processed by the webhook receiver, **Then** the notification is rejected, no internal transaction or user status is altered, and a security warning is logged.
3. **Given** a valid webhook notification whose reported transaction amount or currency does not match the expected plan price (e.g. amount mismatch), **When** processed, **Then** the transaction is marked as flagged/mismatched, the user's plan is NOT upgraded to Pro, and an audit alert is triggered.
4. **Given** an approved transaction whose webhook event has already been processed, **When** the gateway re-delivers the identical webhook notification (due to network retries), **Then** the system recognizes the event as previously processed, executes no redundant updates, and returns a successful acknowledgement immediately (idempotent no-op).

---

### User Story 4 - Post-Payment Return Flow & In-Progress / Pending Payments (Priority: P2)

As a paying user who has completed bank steps (such as PSE or Nequi authorization) and is redirected back to Go-Agree, I want to see the immediate status of my payment and have a clear option to return to my dashboard, even if the bank confirmation is still pending in the background.

**Why this priority**: Colombian payment rails (especially PSE) often take seconds or minutes to confirm with the issuing bank. The user needs immediate feedback that their payment is being processed rather than assuming a failure or double-charging themselves.

**Independent Test**: Can be verified independently by simulating a redirect from the payment gateway back to Go-Agree with a transaction in "PENDING" state. Verify the user sees a reassuring pending message in Spanish, an automatic status polling/refresh, and a "Volver al panel" button. When the webhook resolves to "APPROVED", verify the UI updates to show success and active Pro privileges.

**Acceptance Scenarios**:

1. **Given** a user who completed payment steps and is redirected back to Go-Agree while the transaction is still "PENDING" at the bank, **When** the confirmation page renders, **Then** it displays an informative status message in Spanish explaining that the transaction is being verified by their financial institution, initiates client-side short polling with exponential backoff (checking every 3–5 seconds up to 30 seconds), displays a manual "Verificar estado" button, and provides a direct shortcut to return to the dashboard.
2. **Given** a user on the pending payment confirmation screen, **When** the transaction updates to "APPROVED" (either via background webhook or status check during the 30-second polling window or upon clicking "Verificar estado"), **Then** the confirmation view updates dynamically to reflect the "Aprobado" status, congratulates the user on activating Plan Pro, and displays an immediate button to access their dashboard.
3. **Given** a user returning to Go-Agree whose payment was already approved while they were on the gateway, **When** the return page loads, **Then** it immediately displays a success confirmation ("¡Pago exitoso! Tu Plan Pro está activo") and a primary action button to navigate directly to their dashboard.
4. **Given** a user viewing any post-payment status screen (Pending, Approved, or Rejected), **When** they click "Ir al panel", **Then** they are smoothly navigated to `/dashboard` with their most up-to-date plan status visible.

---

### User Story 5 - Payment Rejection Handling & Clean Retry with New Reference (Priority: P2)

As a user whose payment attempt was rejected, declined, or timed out by the bank or gateway, I want to see a clear explanation of the rejection reason and have an accessible option to retry the payment using a brand new transaction reference, ensuring failed references are never reused.

**Why this priority**: Failed payments happen frequently (insufficient funds, incorrect OTP, card limits). Providing clear diagnostic reasons and a seamless retry path recovers potentially lost revenue and prevents customer frustration.

**Independent Test**: Can be verified independently by simulating a rejected transaction (e.g., status "DECLINED" with reason "INSUFFICIENT_FUNDS"), verifying the return screen displays an empathetic Spanish message explaining the decline, confirming that clicking "Reintentar pago" generates a completely new payment reference, and confirming the old reference remains marked as failed.

**Acceptance Scenarios**:

1. **Given** a payment transaction that has been rejected by the gateway or bank, **When** the user views the result screen or the webhook is received, **Then** the transaction is marked as "Rejected", the reason for rejection (e.g. fondos insuficientes, declinada por la entidad, error de autenticación) is stored and presented in Spanish, and the user's plan remains in its pre-existing state.
2. **Given** a rejected payment result screen, **When** the user selects "Reintentar pago", **Then** the system initializes a new payment session with a newly generated, unique reference ID, leaving the failed transaction reference archived and unalterable.
3. **Given** any failed, cancelled, or rejected payment reference, **When** any subsequent payment or gateway interaction occurs, **Then** the system guarantees that the failed reference identifier is never reused or re-submitted to the payment gateway.

---

### User Story 6 - Abandoned Checkout Recovery & Window Closure Resilience (Priority: P3)

As a user who closed the payment gateway window or navigated away before finishing the transaction, when I return to Go-Agree later, I want to be able to start a fresh payment attempt without being locked out or blocked by the abandoned session.

**Why this priority**: Users frequently close browser tabs to check account balances, verify credit card numbers, or get distracted. Abandoned checkouts must not leave user accounts in a locked or unrecoverable state.

**Independent Test**: Can be verified independently by initiating a checkout, closing the browser tab before entering payment details, re-logging into Go-Agree 15 minutes later, and successfully clicking "Comprar Plan Pro" to generate a fresh payment session.

**Acceptance Scenarios**:

1. **Given** a user who initiated checkout but closed the payment window without completing the transaction, **When** they return to Go-Agree and view their dashboard or pricing page, **Then** their account displays their current quota with an active option to upgrade.
2. **Given** a user with an uncompleted/abandoned payment attempt, **When** they click to start a new payment, **Then** the system creates a brand new payment reference without requiring manual cancellation or administrative intervention for the abandoned transaction.
3. **Given** a transaction that remains in an unconfirmed state past its expiration threshold (e.g. 48 hours without webhook resolution), **When** inspected by the system, **Then** it is transitioned to "Expired" / "Abandoned" status without impacting the user's ability to initiate new transactions.

---

### User Story 7 - Multi-Tab & Concurrent Transaction Integrity (Priority: P3)

As a user operating across multiple browser tabs or devices, I want the system to guard against accidental double charges and handle concurrent transaction completions gracefully so that my billing and account records remain accurate and consistent.

**Why this priority**: Real users frequently operate with multiple open tabs. Edge-case safety ensures financial correctness, prevents duplicate debits, and provides unambiguous subscription validity.

**Independent Test**: Can be verified independently by simulating an active Plan Pro subscriber attempting a second checkout in a separate tab, confirming checkout initiation is blocked, and simulating a concurrent duplicate approved webhook, confirming that the second payment is rejected via idempotency and flagged for reconciliation without accepting a duplicate subscription.

**Acceptance Scenarios**:

1. **Given** an authenticated user who has two browser tabs open on checkout, **When** they complete payment in Tab A resulting in an Approved webhook, **Then** their account immediately gains Plan Pro privileges.
2. **Given** a user whose account already has an active Plan Pro or a pending checkout in progress, **When** they attempt to initiate a new checkout in another tab or within the same day, **Then** the interface blocks checkout initiation, informing the user in Spanish that they already have an active subscription or a pending transaction.
3. **Given** two checkout attempts initiated concurrently across tabs before either resolved, **When** the second approved payment notification arrives for an account already activated to Plan Pro, **Then** the system detects the duplicate payment via server-side idempotency, rejects accepting it as an active subscription, marks the transaction record as `Rejected_Duplicate`, and triggers an audit alert for financial reconciliation/refund.

---

## Edge Cases

- **PSE Bank Approval Delays**: When a user pays via PSE, Colombian banks can take from 5 minutes up to 24 hours to confirm. The system holds the transaction in `Pending` state, does not prematurely fail it, and handles the `APPROVED` or `DECLINED` webhook whenever it arrives, even days later.
- **Double Clicks on Payment Action**: Rapid consecutive clicks on the "Pagar" CTA are prevented on the client via instantaneous button disabling and loading indicators, and protected on the server via transactional lock/rate limiting per user session.
- **Payment Window Closed Mid-Flow**: If the customer closes the browser while on Wompi's checkout without completing the transaction, returning to Go-Agree allows them to start a new transaction without being blocked by the abandoned one.
- **Webhook Replay / Network Duplication**: Wompi automatically retries webhooks until receiving HTTP 200. Processing is strictly idempotent: the first webhook execution updates the status and provisions access; any identical subsequent webhook immediately returns HTTP 200 without executing side effects or extending dates again.
- **Webhook Amount or Currency Discrepancy**: If an incoming webhook indicates an amount different from the registered transaction price (e.g., modified payload or unexpected gateway fee deduction), the system records the event, refuses to grant Pro status, marks the payment as `Flagged_Mismatch`, and alerts system administrators.
- **Malformed or Forged Webhooks**: Any webhook with an invalid SHA-256 integrity signature or missing secret verification is rejected immediately with HTTP 400/401 and logged as a potential security incident.
- **Sandbox vs Production Environment Switching**: API keys, public keys, and secret integrity tokens must be isolated by environment configuration. Switching from sandbox to production must not break historical payment logs or reference validation.
- **Concurrent Successful Payments Across Tabs**: A second payment from the same client is strictly rejected and not accepted as a second subscription. The first completed payment activates Plan Pro. If a second transaction arrives concurrently, server-side idempotency identifies the duplicate client transaction, rejects accepting it, marks it as `Rejected_Duplicate`, and flags it for immediate administrative reconciliation or refund.
- **User Logout or Session Invalidation While Payment is In-Flight**: The webhook processes independently of the user's active session, matching by the persistent user identifier stored on the payment record. When the user logs in again, their updated Plan Pro status is already in effect.
- **Free Quota Exhaustion Mid-Questionnaire**: If a user is on their 3rd free contract, they can complete and download it. The upgrade gate is evaluated before initiating any 4th contract generation session.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the user's current subscription plan ("Plan Free" or "Plan Pro") prominently in the protected dashboard view.
- **FR-002**: System MUST display the contract generation meter for users on the Free plan, showing both the total contracts generated and the remaining contracts out of the 3 free contracts allowed.
- **FR-003**: System MUST permit users on the Free plan to finalize up to 3 contracts without requiring any payment method or credit card information; draft questionnaire sessions do not consume quota until final contract compilation is completed.
- **FR-004**: System MUST prevent users on the Free plan who have already finalized 3 contracts from initiating a 4th contract, displaying a clear upgrade prompt in Spanish to purchase Plan Pro; deleting an existing contract does not restore free quota credits.
- **FR-005**: System MUST allow users on the Free plan with 3 generated contracts to continue viewing, accessing, and downloading their existing contracts without restriction.
- **FR-006**: System MUST allow authenticated users to initiate a Plan Pro purchase with options for monthly billing ($49.000 COP) and annual billing ($468.000 COP) as configured in the system pricing registry.
- **FR-007**: System MUST generate a cryptographically unique, non-reusable transaction reference for every payment attempt.
- **FR-008**: System MUST calculate an integrity signature for each payment checkout based on the merchant secret, reference, amount in cents, and currency (COP).
- **FR-009**: System MUST interface with Wompi Hosted Web Checkout (`checkout.wompi.co/p/`) via full browser redirection with signed return URL parameters, facilitating Colombian payment methods including PSE, Credit/Debit cards, and Nequi without bundling external client scripts.
- **FR-010**: System MUST disable checkout trigger controls immediately upon initial interaction to prevent double submissions or duplicate checkouts.
- **FR-011**: System MUST provide a secure public webhook endpoint to receive asynchronous transaction events from the payment gateway.
- **FR-012**: System MUST verify the cryptographic integrity signature of every received webhook payload before processing the event.
- **FR-013**: System MUST verify that the amount and currency reported in an "APPROVED" webhook exactly match the expected amount and currency of the corresponding payment attempt.
- **FR-014**: System MUST process webhook events idempotently, ensuring duplicate deliveries of the same event produce identical outcomes without duplicate subscriptions or side effects.
- **FR-015**: System MUST automatically activate "Plan Pro" access for the user upon confirming an "APPROVED" webhook transaction, establishing an active subscription validity period (30 days for monthly, 365 days for annual).
- **FR-016**: System MUST provide a user-facing payment return/result view that displays the current transaction state: Approved, In Progress (Pending), or Rejected.
- **FR-017**: System MUST display a reassuring explanation in Spanish for transactions in "Pending" status (e.g. PSE bank confirmations), execute client-side periodic status polling with exponential backoff (every 3–5 seconds for up to 30 seconds), provide a manual "Verificar estado" action, and offer a direct shortcut to return to the dashboard.
- **FR-018**: System MUST capture and display the rejection reason in Spanish when a payment is declined, and provide a clear option to retry the payment with a fresh reference.
- **FR-019**: System MUST guarantee that a failed, declined, or cancelled transaction reference is never reused for subsequent payment attempts.
- **FR-020**: System MUST allow users who abandoned or closed a payment window to initiate a brand new payment attempt without administrative intervention.
- **FR-021**: System MUST decouple the core domain and billing models from the specific payment gateway provider through abstraction interfaces, isolating gateway-specific logic in an infrastructure adapter.
- **FR-022**: System MUST store an auditable log of all payment attempts, webhook receipts, and status transitions including timestamps, gateway transaction IDs, payment methods, and rejection reasons.
- **FR-023**: System MUST render all user-facing payment statuses, errors, notices, and plan indicators in Spanish, while keeping all internal identifiers, logs, and code constructs in English.
- **FR-024**: System MUST transition an expired Plan Pro subscription back to the Free plan upon reaching its expiration date, preserving the user's lifetime free contract generation count (permitting no new contract creation if the 3 free contracts were previously used) while maintaining permanent view and download access to all existing contracts.
- **FR-025**: System MUST prevent and reject duplicate payments for the same client: users with an active Plan Pro subscription or an in-flight pending checkout session MUST be blocked from initiating new checkouts, and any concurrent duplicate transaction captured by the gateway MUST be rejected via server-side idempotency, recorded with status "Rejected_Duplicate", and flagged for financial reconciliation rather than activating a duplicate subscription.
- **FR-026**: System MUST support a multi-provider architecture where payment gateways are registered and discoverable by country, presenting a list of eligible payment providers in the user interface for user selection (with Wompi as the initial default provider for Colombia `CO`).

---

### Key Entities *(include if feature involves data)*

- **PaymentTransaction**: Represents an individual attempt to execute a financial payment through the gateway.
  - *Attributes*: `id` (internal identifier), `userId` (associated user), `reference` (unique external merchant reference), `gatewayTransactionId` (optional identifier assigned by Wompi), `planId` (`pro`), `billingCycle` (`monthly` | `annual`), `amount` (monetary value in COP), `currency` (`COP`), `status` (`pending` | `approved` | `rejected` | `expired` | `flagged`), `paymentMethodType` (e.g., `card`, `pse`, `nequi`), `rejectionReason` (optional descriptive failure reason), `createdAt`, `updatedAt`.
- **UserSubscription / PlanAccess**: Represents a user's entitlement and active plan state.
  - *Attributes*: `userId`, `planType` (`free` | `pro`), `status` (`active` | `expired`), `freeContractsUsed` (count of contracts created under free tier, 0 to 3), `startedAt`, `expiresAt` (optional date for paid tier validity), `lastPaymentTransactionId`.
- **PaymentWebhookEvent**: Represents an incoming webhook event log for idempotency and auditability.
  - *Attributes*: `eventId` (gateway event identifier), `transactionReference`, `eventType`, `payloadChecksum`, `processedAt`, `status` (`processed` | `ignored_duplicate` | `failed_verification` | `flagged_mismatch`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authenticated users can view their current plan tier and exact free contract count (used and remaining) directly on the dashboard without extra clicks.
- **SC-002**: Users with 3 generated free contracts are 100% prevented from initiating a 4th contract without purchasing Plan Pro, while retaining 100% access to view and download their prior contracts.
- **SC-003**: The payment checkout interface launches in under 2 seconds from the user clicking "Pagar" on the plan selection screen.
- **SC-004**: 100% of incoming webhooks with valid signatures are processed and acknowledged with HTTP 200 within 1.5 seconds.
- **SC-005**: 100% of approved webhook notifications result in the user's Plan Pro status being activated within 2 seconds of receipt.
- **SC-006**: Duplicate webhook deliveries for the same event produce 0 duplicate plan activations, 0 corrupted balances, and 0 duplicate audit entries.
- **SC-007**: 0% of failed, declined, or cancelled payment references are ever reused in subsequent checkout attempts.
- **SC-008**: 100% of rejected payment attempts display a clear diagnostic explanation in Spanish and provide a one-click option to retry with a new reference.
- **SC-009**: 100% of webhook requests with invalid signatures or mismatched payment amounts are rejected and flagged without granting unauthorized plan access.
- **SC-010**: All user-facing payment flows (checkout initiation, pending status, success, and decline screens) comply with WCAG 2.1 AA accessibility standards and support mobile viewports down to 320px width.

---

## Assumptions

- **Single Paid Plan (Plan Pro)**: Monetization utilizes the existing `COLOMBIA_PRICING_PLAN` defined in `PricingConfig.ts`, offering "Plan Pro" with monthly ($49.000 COP) and annual ($468.000 COP) billing cycles and 3 free contracts included for the Free tier.
- **Contract Quota Definition**: A contract is counted against the free quota when a contract generation session is completed and the legal document is compiled/generated. Initiating a new questionnaire is gated if the user already has 3 completed contracts.
- **One-Time Checkout First**: Initial implementation utilizes Wompi's hosted checkout widget or web checkout URL (`https://checkout.wompi.co/p/`) for one-time payment processing (PSE, Card, Nequi). Future recurring subscription charging will build on this transaction foundation using card tokenization.
- **Currency**: Primary transaction currency is Colombian Pesos (`COP`), formatted in standard Colombian currency notation.
- **Integrity Signatures**: Checkout references and webhook events utilize SHA-256 cryptographic checksum hashing concatenating the merchant reference, amount in cents, currency, and integrity secret as specified by Wompi protocol.
- **Duplicate Payment Prevention (No Stacking)**: A second payment from the same client is strictly not accepted. Users with an active Plan Pro cannot initiate checkouts, and duplicate transactions occurring concurrently or within the same day are rejected via idempotency and queued for reconciliation.
- **Decoupled Architecture**: In alignment with Constitution Principle II (Clean Architecture), all payment operations interact through gateway-agnostic domain interfaces (`PaymentGateway`, `PaymentRepository`), ensuring Wompi SDK/HTTP specifics remain strictly confined to the infrastructure layer.
- **Server-Side Secret Isolation**: Merchant private keys, webhook event secrets, and integrity secrets are stored strictly in server-side environment variables and are never transmitted to, bundled in, or accessible by client-side browser code.
