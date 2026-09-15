# Quickstart Validation Guide: Next.js LTS Upgrade, Server-Side Logging & Biome Toolchain

**Feature Branch**: `005-next-lts-logging-biome` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

This guide outlines runnable verification scenarios to validate the implementation end-to-end.

---

## Prerequisites

* **Node.js**: `v24.x` (`node -v` $\ge 24.0.0$)
* **pnpm**: `v10.30.3` (`pnpm -v`)
* **Environment Variables**: Local `.env.local` configured with test flags:
  ```bash
  LOG_LEVEL=debug
  LOG_MAX_LENGTH=256
  LOG_OBFUSCATION_ENABLED=true
  LOG_OBFUSCATE_KEYS=token,secret,password,signature,customSecret
  ```

---

## Scenario 1: Validate Node 24 & Next.js 16 Active LTS Build

**Objective**: Verify that the monorepo compiles cleanly under Node 24 and Next.js 16 with Turbopack.

```bash
# 1. Verify Node.js version
node -v # Must output v24.x.x

# 2. Run full monorepo build
pnpm build
```

**Expected Outcome**:
* All packages (`@go-agree/domain`, `@go-agree/application`, `@go-agree/infrastructure`, `@go-agree/web`) compile without TypeScript or bundler errors.
* Next.js build runs using Turbopack engine and completes with zero deprecation warnings regarding synchronous `cookies()` or `headers()`.

---

## Scenario 2: Validate Biome Toolchain (Format & Lint)

**Objective**: Verify that Biome replaces Prettier and ESLint, checking and formatting the monorepo in under 3 seconds.

```bash
# 1. Run full Biome check (linter + formatter check)
pnpm check

# 2. Test auto-formatting with write mode
pnpm format

# 3. Verify zero lint errors remain
pnpm lint
```

**Expected Outcome**:
* Biome scans all TypeScript/JavaScript/JSON files in the monorepo in $< 3$ seconds.
* Reports `Checked X files in Yms. No errors found.`
* Zero ESLint or Prettier commands are required or referenced in `package.json`.

---

## Scenario 3: Validate Structured Logging & Severity Filtering

**Objective**: Verify that server logging filters logs according to `LOG_LEVEL` and outputs structured JSON (or pretty output in dev).

```bash
# Run logger test suite in vitest
pnpm test packages/infrastructure/src/logging
```

**Manual Verification**:
1. Start dev server: `pnpm dev`
2. Invoke an API route: `curl -i http://localhost:3000/api/contracts/test-id`
3. Observe terminal output:
   * Formatted, readable log entries with timestamp, severity tag (`[INFO]`), message, and context.
4. Set `LOG_LEVEL=error` and restart server:
   * Only `error` and `fatal` logs are emitted; `info` and `debug` statements are suppressed.

---

## Scenario 4: Validate Sensitive Data Masking & Truncation

**Objective**: Verify that sensitive attributes are replaced with `[REDACTED]` and oversized strings are truncated.

```bash
# Run data masking unit tests
pnpm test packages/infrastructure/src/logging/sanitizer.test.ts
```

**Verification Details**:
* An object containing `{ password: "my-secret-password", token: "jwt-12345", nested: { apiKey: "key-999" } }` outputs:
  ```json
  { "password": "[REDACTED]", "token": "[REDACTED]", "nested": { "apiKey": "[REDACTED]" } }
  ```
* A legal contract text block of 500 characters when `LOG_MAX_LENGTH=100` outputs:
  `"... [TRUNCATED 100 chars]"` without corrupting outer JSON envelope structure.

---

## Scenario 5: Validate Correlation ID & User/Contract Traceability

**Objective**: Verify that requests carry `x-correlation-id` and error responses include the correlation ID payload.

```bash
# 1. Send request with explicit correlation ID
curl -i -H "x-correlation-id: test-corr-12345" http://localhost:3000/api/contracts/non-existent-id
```

**Expected Outcome**:
* Response HTTP Headers contain:
  ```http
  x-correlation-id: test-corr-12345
  ```
* Response JSON body contains:
  ```json
  {
    "code": "NOT_FOUND",
    "message": "Contract with ID non-existent-id not found",
    "correlationId": "test-corr-12345"
  }
  ```
* Server stdout log line includes:
  `"correlationId": "test-corr-12345"`
