# Feature Specification: Next.js LTS Upgrade, Server-Side Logging & Biome Toolchain

**Feature Branch**: `005-next-lts-logging-biome`

**Created**: 2026-09-14

**Status**: Ready for Review

**Input**: User description: "Realiza la actualización hacia la última versión LTS de Next Implementa logs del lado del servidor con pino y agrega logs de todos los niveles según el contexto del código que se mostrarán según el nivel de logging definido en variable de entorno, incluye además limitación de largo de log (parametrizable por variable de entorno) y obfuscado de valores sensibles si existen (parametrizable por variable de entorno), incluyendo además parámetros de correlation id, permitiendo encontrar logs asociado a usuario o contrato. Implementa biome como reemplazo de prettier y eslint."

## Clarifications

### Session 2026-09-14

- Q: Should the request correlation ID be included inside client-facing error response bodies in addition to the HTTP response header? (FR-012) → A: Include `correlationId` in HTTP response headers (`x-correlation-id`) and within JSON error response bodies (`{ code, message, correlationId }`).
- Q: Should the server logging facility format output using human-readable colors and timestamps during local development, or output raw structured JSON in all environments? (FR-003) → A: Human-readable formatted logs in local development (`NODE_ENV=development`), raw structured JSON in production and CI environments.
- Q: How should the sensitive data obfuscator handle nested objects and arrays when logging complex payloads? (FR-007) → A: Deep recursive traversal up to 5 levels deep with circular reference detection.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Active LTS Framework Modernization (Priority: P1)

As a platform engineer and business stakeholder, I want the web application runtime upgraded to the latest Active Long-Term Support (LTS) release of Next.js and aligned with Node.js 24 runtime standards, so that the application maintains official security patch support, benefits from compiler and bundler optimizations (Turbopack), and eliminates technical debt from deprecated framework APIs.

**Why this priority**: Operating on an unsupported framework version (Next.js 14) creates severe compliance and security vulnerabilities, prevents adopting modern ecosystem libraries, and risks unpatched runtime bugs in production.

**Independent Test**: Can be tested independently by running application builds and runtime serverless workflows on Node.js 24 and Next.js Active LTS (16.x), verifying that all server routes, middleware/routing layers, and page renders operate without runtime deprecation warnings or build failures.

**Acceptance Scenarios**:

1. **Given** the web application package configuration, **When** dependency resolution and compilation are performed with pnpm under Node.js 24, **Then** the application builds successfully using the modern Active LTS Next.js compiler toolchain without compilation errors.
2. **Given** server-side request processing components consuming cookies, headers, or dynamic route parameters, **When** incoming HTTP requests execute in runtime, **Then** all request data is resolved using asynchronous request access patterns without synchronous API access errors.
3. **Given** the deployment configuration for Netlify, **When** build and deployment pipelines run, **Then** the runtime environment executes under Node.js 24 using the modern Next.js runtime adapter without legacy plugin incompatibilities.
4. **Given** the existing automated test suite in Vitest, **When** test runs are executed across packages, **Then** 100% of unit and integration tests pass without framework compatibility regressions.

---

### User Story 2 - Contextual Structured Server-Side Logging (Priority: P1)

As a site reliability engineer and backend developer, I want server-side operations and API handlers to emit structured JSON diagnostic logs categorized by standard severity levels (fatal, error, warn, info, debug, trace) and governed by an environment-defined logging threshold, so that production environments record only pertinent actionable data while staging/local environments provide deep execution diagnostics.

**Why this priority**: Without structured server logging, debugging production incidents, payment failures, or contract processing exceptions is slow and unreliable. Structured contextual logging provides immediate root-cause visibility.

**Independent Test**: Can be tested independently by invoking API endpoints under different configured log levels (`LOG_LEVEL=error`, `LOG_LEVEL=info`, `LOG_LEVEL=debug`), confirming that only logs matching or exceeding the configured threshold are emitted to stdout in valid structured JSON format with timestamp, severity level, message, and execution context.

**Acceptance Scenarios**:

1. **Given** an environment configuration with `LOG_LEVEL=info`, **When** the server handles application requests, **Then** events logged at `info`, `warn`, `error`, and `fatal` are output to the standard log stream, while `debug` and `trace` events are suppressed.
2. **Given** an unexpected exception during contract generation or checkout handling, **When** the error is captured by the server error boundary or API route, **Then** a structured log event is emitted at `error` level containing the error code, structured message, stack trace metadata, and operational context without crashing the logging process.
3. **Given** an environment configuration with `LOG_LEVEL=debug`, **When** complex domain or integration flows execute (such as webhook verification or database queries), **Then** detailed diagnostic messages are output to facilitate tracing execution branch decisions.
4. **Given** a local development environment (`NODE_ENV=development`), **When** logs are output to the terminal, **Then** log statements are rendered with human-readable formatting, colors, and timestamps for enhanced developer ergonomics.

---

### User Story 3 - Sensitive Data Obfuscation & Log Length Guardrails (Priority: P1)

As a security officer and compliance stakeholder, I want all server log payloads to automatically mask sensitive data (such as passwords, auth tokens, session cookies, API secrets, and payment credentials) and enforce a configurable maximum character length, so that logs never expose confidential credentials or cause storage inflation / denial-of-service via oversized payloads.

**Why this priority**: Leaking sensitive personal data, authentication tokens, or payment details in server logs breaches data protection regulations and endangers user security. Unbounded log sizes can also cause excessive log ingestion costs or log buffer exhaustion.

**Independent Test**: Can be tested independently by logging an object containing sensitive properties (e.g. `password`, `token`, `secret`, `authorization`, `signature`) and oversized text blocks, verifying that sensitive values are replaced with `[REDACTED]` and strings exceeding `LOG_MAX_LENGTH` are cleanly truncated with a truncation indicator.

**Acceptance Scenarios**:

1. **Given** an incoming request or internal state containing sensitive fields (e.g., `password`, `accessToken`, `refreshToken`, `authorization`, `creditCard`, `integritySecret`), **When** log statements record the context object, **Then** sensitive property values are masked with `[REDACTED]` prior to emission, recursively inspecting nested objects and arrays up to 5 levels deep.
2. **Given** an environment configuration defining custom sensitive keys via `LOG_OBFUSCATE_KEYS`, **When** objects containing those keys are logged, **Then** all specified keys are redacted in the emitted log payload.
3. **Given** a log message or nested payload containing a large text string (such as legal contract document text, large JSON, or base64 data) that exceeds the configured `LOG_MAX_LENGTH`, **When** the log entry is processed, **Then** the string is truncated to the specified character limit with an explicit ellipsis indicator (e.g., `... [TRUNCATED]`), preserving system performance and log budget.
4. **Given** an environment where `LOG_OBFUSCATION_ENABLED=false` is explicitly set for a local debugging session, **When** logging occurs, **Then** the obfuscation engine bypasses redaction only when running in non-production environments.

---

### User Story 4 - Request Correlation & User/Contract Traceability (Priority: P2)

As a support engineer investigating a user report or contract defect, I want every server log entry within a request lifecycle to automatically include a unique Correlation ID, as well as the authenticated User ID and target Contract ID whenever available in context, so that I can filter log streams and view the complete end-to-end timeline of actions associated with a specific contract or user.

**Why this priority**: In a distributed serverless and multi-tenant environment, concurrent requests interleave log lines. Correlating log events by request, user, and contract is essential for isolating bugs and auditing legal agreement history.

**Independent Test**: Can be tested independently by sending an HTTP request with an `x-correlation-id` header (or letting the server generate one if omitted), performing contract operations, and verifying that all server log outputs generated during that request include the identical `correlationId`, along with `userId` and `contractId`.

**Acceptance Scenarios**:

1. **Given** an incoming HTTP request containing an `x-correlation-id` header, **When** the server handles the request, **Then** all log entries generated during processing inherit that correlation ID, and the response headers include the same `x-correlation-id`.
2. **Given** an incoming HTTP request without an `x-correlation-id` header, **When** the server receives the request, **Then** the server generates a unique UUID correlation ID, associates it with the request context, attaches it to all emitted logs, and returns it in the response headers.
3. **Given** an HTTP request that encounters an error (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error), **When** the server serializes the JSON error response, **Then** the payload includes the active `correlationId` property alongside `code` and `message` to facilitate direct reporting to support.
4. **Given** an authenticated user session performing operations on a contract (e.g., answering questionnaires, viewing status, completing generation), **When** server log events are produced, **Then** the structured log entry includes `userId` and `contractId` attributes, enabling direct filtering by either identifier in log aggregation tools.
5. **Given** an unauthenticated request (such as public landing page hits or public health checks), **When** logs are emitted, **Then** the `correlationId` remains present while `userId` and `contractId` are safely omitted or set to `null` without throwing errors.

---

### User Story 5 - Toolchain Consolidation with Biome (Priority: P2)

As a developer in the Go-Agree repository, I want Prettier and ESLint replaced with Biome across all monorepo packages, so that code formatting and static analysis run in a single ultra-fast tool with zero configuration conflicts, enforcing high code quality and strict constitutional principles.

**Why this priority**: Maintaining separate ESLint and Prettier setups with complex plugin chains slows down CI/CD checks, causes formatting/linting disputes, and increases dependency maintenance overhead. Biome unifies both in a fast Rust-based toolchain.

**Independent Test**: Can be tested independently by running `pnpm lint` and `pnpm format` (or `pnpm check`) across all packages, verifying that Biome checks syntax, formatting, imports, and code rules across the entire monorepo in a fraction of the time, replacing the legacy eslint and prettier scripts.

**Acceptance Scenarios**:

1. **Given** the monorepo root and workspace configurations, **When** legacy ESLint and Prettier packages and configuration files are removed, **Then** a unified `biome.json` configuration file governs formatting and linting for all TypeScript and JavaScript files.
2. **Given** developer workflow scripts in `package.json`, **When** `pnpm lint`, `pnpm format`, or `pnpm check` are invoked, **Then** Biome executes format and lint checks across the codebase, reporting zero errors when code conforms to standards.
3. **Given** source code with deliberate formatting deviations (e.g. invalid indentation or missing semicolons), **When** running the Biome format command with write flag, **Then** Biome formats the files according to repository conventions (2 spaces, single quotes where appropriate) matching previous Prettier styling.

---

### Edge Cases

- What happens if the incoming request contains an invalid or maliciously oversized `x-correlation-id` header?
  The server sanitizes the header value or discards it in favor of a fresh server-generated UUIDv4 to prevent header injection and log poisoning.
- What happens if a log statement attempts to serialize a circular reference object?
  The logging serialization engine safely handles circular references with visited object set tracking without throwing unhandled exceptions or crashing the Node process.
- What happens if `LOG_MAX_LENGTH` is set to a non-numeric or negative value in environment variables?
  The logging subsystem falls back gracefully to a safe default threshold (e.g., 2048 characters) and logs an initial startup warning.
- What happens if an error object has nested `cause` or custom properties containing sensitive data?
  The obfuscation mechanism traverses nested error objects recursively up to 5 levels deep to redact sensitive values before outputting the stack trace and metadata.
- What happens when dynamic routes in Next.js Active LTS receive params that are promises?
  Route handlers and page components await the parameters asynchronously before accessing route properties, ensuring backwards compatibility and eliminating runtime hydration/SSR warnings.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST execute on Node.js 24 and Next.js Active LTS release (16.x) across development, testing, and production deployment configurations.
- **FR-002**: The system MUST resolve all server-side request data (including cookies, headers, and dynamic route params) asynchronously in compliance with Next.js Active LTS API specifications.
- **FR-003**: The system MUST provide a centralized server-side structured logging facility using Pino that outputs raw machine-readable JSON format in production and CI environments, and human-readable formatted output with colors and timestamps during local development (`NODE_ENV=development`).
- **FR-004**: The logging facility MUST support standard log severity levels: `trace`, `debug`, `info`, `warn`, `error`, and `fatal`.
- **FR-005**: The active logging threshold MUST be dynamically configurable via the `LOG_LEVEL` environment variable, defaulting to `info` in production and `debug` in development environments.
- **FR-006**: The logging facility MUST enforce a configurable maximum character limit per logged text field/payload via the `LOG_MAX_LENGTH` environment variable, defaulting to 2048 characters, appending a clear truncation notice when limit is exceeded.
- **FR-007**: The logging facility MUST automatically obfuscate sensitive keys (including passwords, access tokens, refresh tokens, auth headers, private keys, API secrets, and credit card numbers) by replacing their values with `[REDACTED]`, recursively inspecting nested objects and arrays up to a maximum depth of 5 levels with circular reference protection.
- **FR-008**: The list of obfuscated keys MUST be configurable and extensible via the `LOG_OBFUSCATE_KEYS` environment variable.
- **FR-009**: The obfuscation mechanism MUST be active by default and only disabled when `LOG_OBFUSCATION_ENABLED` is explicitly set to `false`.
- **FR-010**: Every server request lifecycle MUST have an associated `correlationId`, extracted from the `x-correlation-id` request header if valid, or generated as a UUIDv4 if missing.
- **FR-011**: All server-side log entries emitted within a request lifecycle MUST automatically include the active `correlationId`.
- **FR-012**: The system MUST include the active `correlationId` in the `x-correlation-id` response header for all server API and route responses, AND inside the response body payload of all error responses (`{ code, message, correlationId }`) to enable client and user-facing support reporting.
- **FR-013**: When handling requests associated with an authenticated session, log entries MUST include the `userId` attribute in the structured log context.
- **FR-014**: When handling operations associated with a specific contract, log entries MUST include the `contractId` attribute in the structured log context.
- **FR-015**: The codebase MUST replace Prettier and ESLint with Biome as the single authoritative linter and formatter across all monorepo packages.
- **FR-016**: Monorepo scripts (`pnpm lint`, `pnpm format`, `pnpm check`) MUST execute via Biome CLI, enforcing strict formatting and linting rules with zero warnings or errors required for passing quality gates.
- **FR-017**: Existing legacy linting and formatting configuration files (`.eslintrc*`, `.prettierrc*`, `.eslintignore`, `.prettierignore`) and dependencies MUST be decommissioned and removed.

---

### Key Entities *(include if feature involves data)*

- **StructuredLogEntry**: Represents a machine-readable JSON log record emitted by the server, comprising `level`, `time`, `pid`, `hostname`, `correlationId`, optional `userId`, optional `contractId`, `msg`, and contextual metadata attributes.
- **CorrelationContext**: An asynchronous request context holding the immutable `correlationId`, authenticated `userId` (when resolved), active `contractId` (when available), and request start time throughout the execution lifecycle of a request.
- **LogSanitizationConfig**: Configuration entity defining the `logLevel`, `maxLength`, `obfuscationEnabled`, and set of `sensitiveKeys` governing log formatting and payload redaction.
- **BiomeConfiguration**: Project-level toolchain configuration (`biome.json`) specifying file inclusion/exclusion rules, syntax formatting conventions (indentation, quotes, line endings), and active linter rule categories (correctness, style, suspense, security).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Server build and static analysis execution time in CI/CD pipelines is reduced by at least 40% compared to previous Webpack + ESLint/Prettier execution.
- **SC-002**: 100% of server-side log entries emitted during API request processing are valid structured JSON containing a valid `correlationId` and accurate severity level.
- **SC-003**: 0% of logged outputs contain unmasked sensitive credentials or secrets across all test scenarios validating sensitive data handling.
- **SC-004**: Any logged string exceeding `LOG_MAX_LENGTH` is truncated to within the specified limit without truncating valid JSON envelope boundaries.
- **SC-005**: Engineers can isolate 100% of log statements corresponding to a specific user or contract using a single query filter (`correlationId`, `userId`, or `contractId`) in log monitoring viewers.
- **SC-006**: Monorepo linting and formatting (`pnpm check`) runs in under 3 seconds locally on modern hardware with zero errors or warnings.
- **SC-007**: 100% of existing automated unit and integration tests pass successfully on Node.js 24 and Next.js Active LTS without regressions.

---

## Assumptions

- **Default Truncation Threshold**: If `LOG_MAX_LENGTH` is omitted from environment variables, the system assumes a default threshold of 2048 characters per string field.
- **Default Redacted Keys**: The default sensitive keys list covers standard security conventions: `password`, `token`, `accessToken`, `refreshToken`, `secret`, `authorization`, `cookie`, `signature`, `apiKey`, `creditCard`, `cvv`.
- **Node.js Target**: The hosting platform (Netlify) and local development environments support Node.js 24 runtime, configured in `netlify.toml` via `NODE_VERSION = "24"`.
- **Correlation Header Standard**: The primary header name for incoming and outgoing request correlation is `x-correlation-id`, with fallback check for `x-request-id` if present.
- **Code Style Continuity**: Biome will be configured to preserve the existing code style (2 spaces indentation, single quotes for JavaScript/TypeScript, trailing commas where valid, 100-character line width) to minimize unnecessary whitespace git diffs.
- **Clean Architecture Boundaries**: The logger and correlation context will reside in the infrastructure/application boundary, keeping domain core pure and free from direct logging framework dependencies.
