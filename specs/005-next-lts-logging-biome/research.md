# Technical Research & Architecture Decisions: Next.js LTS Upgrade, Server-Side Logging & Biome Toolchain

**Feature Branch**: `005-next-lts-logging-biome` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

---

## 1. Next.js 16 Active LTS & Node.js 24 Runtime Migration

### Decision
Upgrade the core framework from `next@^14.2.3` to **`next@^16.x`** (Active LTS), upgrading `react` and `react-dom` to **`^19.x`**, configuring the runtime engine to **Node.js 24**, and adopting **Turbopack** as the default bundler for development and production compilation.

### Rationale
* **Support Lifecycle**: Next.js 14 is officially unsupported (EOL per `nextjs.org/support-policy`). Next.js 16 is the Active LTS release, ensuring enterprise security patches and long-term stability.
* **Node.js 24 (Active LTS)**: Provides V8 13.6 engine optimizations, native HTTP/3, and modern web platform APIs. Supported on Netlify via `NODE_VERSION = "24"` in `netlify.toml`.
* **Async Request APIs**: Next.js 16 requires asynchronous resolution for `cookies()`, `headers()`, and dynamic route `params`.
  * In `apps/web/src/lib/auth.ts`: `cookies()` changes from sync to `await cookies()`. Functions depending on server cookies (`getServerAuthAdapter`, `getServerContractRepository`, etc.) become asynchronous or accept a pre-resolved `ReadonlyRequestCookies` store.
  * In API Route Handlers (e.g., `apps/web/src/app/api/contracts/[id]/route.ts`): `{ params }: { params: Promise<{ id: string }> }` resolved with `const { id } = await params`.
* **Netlify Compatibility**: Netlify's Next.js Runtime v5 (OpenNext) natively supports Next.js 16 and Node 24. No legacy adapter pinning is required.

### Alternatives Considered
* *Upgrading only to Next.js 15 (Maintenance LTS)*: Rejected because Next 15 is already in maintenance mode and will transition to EOL earlier. Upgrading directly to Next 16 aligns with the Active LTS policy and avoids a double-migration.
* *Retaining Next.js 14 with Webpack*: Rejected because Next 14 is out of support, vulnerable to unpatched dependencies, and lacks Turbopack compilation speedups.

---

## 2. Server-Side Structured Logging Architecture (Pino)

### Decision
Implement server-side logging using **Pino** as the core structured logging engine encapsulated within a clean architecture adapter (`PinoLoggerAdapter`) implementing an application-level port (`LoggerPort`).

### Rationale
* **Performance**: Pino is the fastest JSON logger for Node.js with minimal overhead and zero garbage collection spikes.
* **Clean Architecture & SOLID (Constitution Principle II)**:
  * Pure domain models and core business logic remain completely decoupled from Pino.
  * `LoggerPort` is defined in `@go-agree/application` (or shared infrastructure boundary) with methods: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
* **Environment-Driven Severity Threshold**:
  * Driven by `LOG_LEVEL` environment variable (`trace` | `debug` | `info` | `warn` | `error` | `fatal`).
  * Defaults to `info` in production / CI and `debug` in development.
* **Dual Output Modes**:
  * **Production & CI**: Standard single-line raw JSON to `process.stdout` for ingestion by Netlify, Datadog, or CloudWatch.
  * **Local Development (`NODE_ENV=development`)**: Human-readable, colorized, timestamped console output via `pino-pretty` (or a lightweight dev-stream formatter) for optimal developer experience.

### Alternatives Considered
* *Winston*: Rejected due to substantially higher CPU/memory overhead, complex transport architecture, and larger bundle size compared to Pino.
* *Console.log wrappers*: Rejected because ad-hoc `console.log` produces unstructured text, lacks severity filtering, cannot guarantee uniform JSON schemas, and lacks redaction hooks.

---

## 3. Sensitive Data Obfuscation & Privacy Engine

### Decision
Implement a custom sanitization serializer and pre-logging redaction pipeline that recursively traverses logged objects and arrays up to **5 levels deep**, replacing values associated with sensitive keys with `'[REDACTED]'`, protected by an object identity `Set` for circular reference detection.

### Rationale
* **Security & Regulatory Compliance**: Prevents accidental leakage of authentication tokens, passwords, cookies, credit card numbers, or cryptographic signatures in server logs.
* **Configurable & Extensible**:
  * Default sensitive keys set: `password`, `token`, `accessToken`, `refreshToken`, `secret`, `authorization`, `cookie`, `signature`, `apiKey`, `creditCard`, `cvv`.
  * Extensible via `LOG_OBFUSCATE_KEYS` (comma-separated list).
  * Toggleable via `LOG_OBFUSCATION_ENABLED` (boolean, defaults to `true`, bypass allowed only in non-production).
* **Recursion Guardrail (Bounded Depth 5)**:
  * Inspects deep nested structures (e.g., webhook transaction bodies, session tokens).
  * Hard limit of 5 levels prevents excessive CPU cycles or stack overflow on deep domain models.
  * Tracks visited object references via a `WeakSet` / `Set` to immediately halt circular reference loops.

### Alternatives Considered
* *Pino's built-in `redact` array*: Useful for known static paths (`req.headers.authorization`), but fragile for arbitrary nested payloads or dynamic error objects. A hybrid approach combines Pino fast-path redaction with a recursive sanitizer for complex metadata objects.
* *Shallow 1-level redaction*: Rejected because sensitive payload properties frequently arrive nested under `data`, `payload`, or `headers` objects (e.g., in Wompi webhook payloads).

---

## 4. Log Payload Length Guardrails (Field-Level Truncation)

### Decision
Enforce a configurable maximum string length threshold (`LOG_MAX_LENGTH`, defaulting to 2048 characters) applied at the **field value level**, rather than truncating the outer raw JSON log line.

### Rationale
* **JSON Structural Integrity**: Truncating an entire serialized JSON line breaks the JSON envelope, causing cloud log aggregators to flag log entries as unparseable raw strings or discard them.
* **Granular Protection**: Legal agreement texts, base64 attachments, and large JSON payloads are truncated individually with an explicit marker: `<content>... [TRUNCATED 2048 chars]`, while preserving all envelope metadata (`level`, `time`, `correlationId`, `userId`, `contractId`).

### Alternatives Considered
* *Stream-level character truncation*: Rejected because cutting a byte stream mid-line creates invalid JSON syntax.
* *Dropping oversized payloads entirely*: Rejected because dropping messages hides essential context during debugging.

---

## 5. Request Correlation & Context Propagation

### Decision
Leverage Node.js `AsyncLocalStorage` to maintain an asynchronous `CorrelationContext` across the request lifecycle in Next.js Server Components and API Route Handlers.

### Rationale
* **Correlation Invariance**:
  * Extracts incoming `x-correlation-id` (or `x-request-id`). If absent or invalid, generates a standard UUIDv4.
  * Stores `correlationId`, optional `userId`, and optional `contractId` in `AsyncLocalStorage`.
* **Zero-Parameter Ingestion**:
  * Any server log statement invoked during that request automatically inherits the ambient context without needing developers to manually pass `correlationId` into every helper or service call.
* **Boundary Propagation**:
  * Sets the `x-correlation-id` header in all outgoing HTTP responses.
  * Injects `correlationId` into all standard JSON error response payloads (`{ code, message, correlationId }`) for support traceability (clarification Q1).

### Alternatives Considered
* *Manual parameter passing (`logger.info({ correlationId }, msg)`)*: Highly error-prone; developers frequently forget to pass the context, resulting in disjointed logs.
* *Next.js middleware-only headers*: Useful for incoming routing, but does not propagate down into deep service calls unless paired with `AsyncLocalStorage` or request context binding.

---

## 6. Toolchain Consolidation: Biome Migration

### Decision
Completely remove ESLint (`eslint`, `eslint-config-next`), Prettier (`prettier`), and their ancillary plugins, replacing them with **Biome** (`@biomejs/biome`) configured via a root `biome.json`.

### Rationale
* **Speed & Performance**: Biome is written in Rust and formats/lints TypeScript code 25x-35x faster than ESLint + Prettier.
* **Consolidation**: Eliminates duplicate AST parsing and removes formatting vs linting rule collisions.
* **Constitution Compliance**:
  * Minimal Dependencies (Principle VI): Replaces ~6 disparate lint/prettier packages with a single, standalone toolchain package.
  * Strict Quality Gates (Section Development Workflow): Enforces zero warnings or errors on `pnpm check`.
* **Configuration Mapping**:
  * Formatting: 2 spaces, single quotes, semicolons enabled, 100 character line width (preserving existing repository style).
  * Linter: Recommended rules enabled, React and TypeScript rules enabled.

### Alternatives Considered
* *Retaining Prettier alongside Biome for formatting*: Rejected because Biome's built-in formatter is 97%+ compatible with Prettier and avoids running two tools.
* *ESLint flat config migration*: Rejected because ESLint flat config is slower, still requires multiple plugins, and adds configuration complexity compared to Biome.
