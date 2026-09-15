# Implementation Plan: Next.js LTS Upgrade, Server-Side Logging & Biome Toolchain

**Branch**: `005-next-lts-logging-biome` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-next-lts-logging-biome/spec.md` with Node 24 runtime, Pino server-side structured logging, payload truncation, sensitive data obfuscation, correlation ID propagation, and Biome migration replacing ESLint and Prettier.

---

## Summary

Modernize the core platform runtime and developer toolchain for `go-agree`:
1. **Framework & Runtime Upgrade (Next.js 16 Active LTS + Node.js 24)**:
   * Upgrade `apps/web` to Next.js 16 (Active LTS) and React 19.
   * Adopt Turbopack as default bundler.
   * Update server cookie and parameter resolution to mandatory asynchronous patterns (`await cookies()`, `await params`).
   * Update Netlify configuration (`netlify.toml`) to `NODE_VERSION = "24"`.
2. **Server-Side Structured Logging with Pino**:
   * Implement `PinoLoggerAdapter` in `@go-agree/infrastructure` satisfying `LoggerPort` in `@go-agree/application`.
   * Support dynamic severity filtering via `LOG_LEVEL` (`trace`, `debug`, `info`, `warn`, `error`, `fatal`).
   * Support human-readable colorized logs in development (`NODE_ENV=development`) and raw structured JSON in production/CI.
3. **Sensitive Data Obfuscation & Length Guardrails**:
   * Implement recursive sanitization up to 5 levels deep with circular reference detection.
   * Redact sensitive keys (`password`, `token`, `secret`, `authorization`, etc.) to `[REDACTED]`, configurable via `LOG_OBFUSCATE_KEYS` and `LOG_OBFUSCATION_ENABLED`.
   * Enforce field-level string truncation via `LOG_MAX_LENGTH` (default 2048 chars) without breaking JSON envelope integrity.
4. **Request Correlation & Observability Context**:
   * Use Node.js `AsyncLocalStorage` to bind `correlationId`, `userId`, and `contractId` throughout request processing.
   * Transmit `x-correlation-id` in HTTP response headers and embed `correlationId` into all API error response bodies (`{ code, message, correlationId }`).
5. **Toolchain Consolidation (Biome)**:
   * Replace Prettier and ESLint across the root monorepo and all workspaces with Biome (`@biomejs/biome` + `biome.json`).
   * Update root scripts (`pnpm lint`, `pnpm format`, `pnpm check`) to achieve $< 3$ second verification time.

---

## Technical Context

**Language/Version**: TypeScript 5.4+ / Node.js 24 (Active LTS)  
**Primary Dependencies**: Next.js 16.x (Active LTS), React 19.x, `@types/react` / `@types/react-dom` 19.x, Pino (`pino`, `pino-pretty` for dev), Biome (`@biomejs/biome`), `@supabase/ssr` (`^0.5.x`)  
**Storage**: N/A for logging (outputs to standard output/stream; correlation context held in Node.js `AsyncLocalStorage`)  
**Testing**: Vitest (`^1.6.0`), `@testing-library/react` (`^16.x` for React 19 compatibility), `happy-dom`  
**Target Platform**: Linux serverless (Netlify Next.js Runtime v5) and local developer macOS/Linux workstations  
**Project Type**: Monorepo full-stack application (Clean Architecture: `domain`, `application`, `infrastructure`, `apps/web`)  
**Performance Goals**: Log emission latency $< 0.2$ms; static analysis / lint check $< 3$s across entire monorepo; zero bundle size impact on client UI (Pino & Biome are server/dev-only)  
**Constraints**:
* Constitution Principle II: Domain package has zero dependencies on Pino, Next.js, or Biome.
* Constitution Principle VI: Minimal dependency footprint managed exclusively via `pnpm`.
* Constitution Principle VII: English for engineering artifacts and code identifiers; Spanish for user-facing copy.
* Redaction invariant: 0% confidential credentials leaked in emitted logs.

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md`. Must pass before Phase 0 research and re-checked after Phase 1 design.*

| Principle / Gate | Status | Compliance Details |
|---|---|---|
| **I. Clean Code & SOLID** | **PASS** | `LoggerPort` separates interface from implementation (ISP/DIP); `PinoLoggerAdapter` and `LogSanitizer` have single responsibilities (SRP); logging errors never crash application processes. |
| **II. Clean Architecture & DDD** | **PASS** | Inward Dependency Rule strictly preserved: `domain` defines pure business types; `application` defines `LoggerPort` and `CorrelationContextPort`; `infrastructure` provides Pino adapter and sanitizer; `apps/web` configures Next 16 routing and middleware. |
| **III. Test-Driven Development** | **PASS** | Unit tests for log level thresholding, sensitive data masking, truncation limit, correlation context propagation, and error envelopes precede implementation. |
| **IV. Spec & Code Synchronization** | **PASS** | All 17 functional requirements and 7 success criteria from `spec.md` map 1:1 to design artifacts (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`). |
| **V. Responsive & Accessible (WCAG 2.1 AA)** | **PASS** | N/A for backend logging and build toolchain; UI error modals quoting `correlationId` maintain accessible text contrast $\ge 4.5:1$ and semantic alerts. |
| **VI. Minimal Dependencies & pnpm** | **PASS** | Replaces 6+ ESLint/Prettier packages with a single Biome binary; uses lightweight Pino; managed strictly with `pnpm`. |
| **VII. Language & Localization Separation** | **PASS** | Internal logger, identifiers, and docs strictly in English; user-facing error messages and localized guidance strictly in Spanish. |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-next-lts-logging-biome/
├── spec.md                              # Feature specification with clarifications
├── checklists/
│   └── requirements.md                  # Spec quality checklist (16/16 passing)
├── plan.md                              # This file (/speckit-plan command output)
├── research.md                          # Phase 0 output: Technical decisions & research
├── data-model.md                        # Phase 1 output: Entities, lifecycle & schema
├── quickstart.md                        # Phase 1 output: Runnable validation guide
└── contracts/                           # Phase 1 output: Interface & port contracts
    ├── logger.contract.ts
    ├── correlation-context.contract.ts
    ├── log-sanitizer.contract.ts
    └── api-error-response.contract.ts
```

### Source Code Changes (Monorepo Layout)

```text
go-agree/
├── biome.json                               # [NEW] Root Biome configuration file
├── package.json                             # [MODIFY] Replace prettier/eslint scripts with biome, update typescript
├── netlify.toml                             # [MODIFY] Update NODE_VERSION to "24"
│
├── packages/
│   ├── application/
│   │   ├── src/
│   │   │   └── ports/
│   │   │       ├── logger.port.ts           # [NEW] Application logging port
│   │   │       └── correlation.port.ts      # [NEW] Correlation context port
│   │   └── package.json
│   │
│   ├── infrastructure/
│   │   ├── src/
│   │   │   └── logging/
│   │   │       ├── pino-logger.adapter.ts   # [NEW] Pino implementation of LoggerPort
│   │   │       ├── log-sanitizer.ts         # [NEW] Obfuscation & length truncation engine
│   │   │       ├── correlation-storage.ts   # [NEW] AsyncLocalStorage correlation runner
│   │   │       └── index.ts                 # Export logging adapters and utilities
│   │   ├── tests/
│   │   │   └── logging/
│   │   │       ├── pino-logger.test.ts      # [NEW] Logger unit tests
│   │   │       └── log-sanitizer.test.ts    # [NEW] Sanitizer & truncation unit tests
│   │   └── package.json                     # [MODIFY] Add pino dependency
│   │
│   └── domain/                              # [UNCHANGED] Remains 100% pure
│
└── apps/
    └── web/
        ├── package.json                     # [MODIFY] Upgrade next to 16.x, react & types to 19.x, @testing-library/react to 16.x
        ├── next.config.mjs                  # [MODIFY] Adapt Webpack fallbacks for Next 16 Turbopack
        └── src/
            ├── middleware.ts                # [MODIFY] Ingest/propagate x-correlation-id header
            ├── lib/
            │   ├── auth.ts                  # [MODIFY] Convert cookies() calls to async
            │   ├── contracts.ts             # [MODIFY] Convert cookies() calls to async
            │   ├── payments.ts              # [MODIFY] Convert cookies() calls to async
            │   ├── subscription.ts          # [MODIFY] Convert cookies() calls to async
            │   └── logger.ts                # [NEW] Server logger factory binding AsyncLocalStorage
            └── app/
                └── api/
                    └── **/*.ts              # [MODIFY] Await route params, attach correlationId, log requests/errors
```

---

## Complexity Tracking

> **Constitution Check: 0 Violations. No exceptions or unjustified complexity.**

| Aspect | Architectural Approach | Rationale & Justification |
|---|---|---|
| **Logging Separation** | `LoggerPort` in `@go-agree/application` + `PinoLoggerAdapter` in `@go-agree/infrastructure` | Preserves Clean Architecture (Principle II) so domain and application layers have zero vendor lock-in to Pino. |
| **Correlation Context** | Node.js standard `AsyncLocalStorage` | Eliminates manual plumbing of `correlationId` into every business method while guaranteeing request isolation. |
| **Toolchain** | Standalone Biome binary | Replaces 6+ conflicting ESLint/Prettier plugins, achieving dramatic CI speedups and zero configuration drift. |
