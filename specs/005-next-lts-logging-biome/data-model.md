# Data Model & Entity Specifications: Next.js LTS Upgrade, Server-Side Logging & Biome Toolchain

**Feature Branch**: `005-next-lts-logging-biome` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

---

## 1. Entity Definitions

### 1.1 `StructuredLogEntry`
Represents the canonical machine-readable JSON log record emitted by the server to `stdout`.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `level` | `number` / `string` | Yes | Numeric or label severity level (`10: trace`, `20: debug`, `30: info`, `40: warn`, `50: error`, `60: fatal`) | `30` / `"info"` |
| `time` | `number` | Yes | Timestamp in milliseconds since Unix epoch | `1789408800000` |
| `pid` | `number` | Yes | Node.js process identifier | `4210` |
| `hostname` | `string` | Yes | Machine or serverless worker hostname | `"srv-lambda-iad-1"` |
| `correlationId` | `string` | Yes | UUIDv4 request correlation identifier | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` |
| `userId` | `string \| null` | No | Authenticated user ID associated with the operation | `"usr_98a72b1c"` |
| `contractId` | `string \| null` | No | ID of the contract undergoing processing or inspection | `"ctr_55e219ba"` |
| `msg` | `string` | Yes | Descriptive log message (truncated if exceeding `LOG_MAX_LENGTH`) | `"Contract generation initiated"` |
| `context` | `Record<string, unknown>` | No | Sanitized contextual metadata payload | `{"action": "create", "tier": "pro"}` |
| `err` | `SerializedError` | No | Serialized error metadata (for error/fatal logs) | `{"name": "DomainError", "code": "LIMIT_REACHED"}` |

---

### 1.2 `CorrelationContext`
In-memory request-scoped context stored in Node.js `AsyncLocalStorage` to associate log statements and downstream operations with the originating request.

```typescript
export interface CorrelationContext {
  readonly correlationId: string;
  userId?: string;
  contractId?: string;
  readonly startTime: number;
}
```

* **Immutability**: The `correlationId` is established upon request arrival and cannot be modified within the request execution.
* **Mutation**: `userId` and `contractId` are populated dynamically as authentication or contract resolution succeeds during request handling.

---

### 1.3 `LogSanitizationConfig`
Domain entity encapsulating runtime configuration for log level, truncation, and data masking.

```typescript
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogSanitizationConfig {
  readonly logLevel: LogLevel;
  readonly maxLength: number;
  readonly obfuscationEnabled: boolean;
  readonly sensitiveKeys: ReadonlySet<string>;
  readonly prettyPrint: boolean;
}
```

* **Validation Rules**:
  * `logLevel`: Must be one of the six standard log levels; defaults to `'info'` in production/test and `'debug'` in development.
  * `maxLength`: Positive integer $\ge 64$; defaults to `2048` if unconfigured or invalid.
  * `obfuscationEnabled`: Defaults to `true`; cannot be disabled in `production` environment (`NODE_ENV === 'production'`).
  * `sensitiveKeys`: Set of lowercase string tokens; matches case-insensitively against object keys.

---

### 1.4 `ApiErrorEnvelope`
Standardized client-facing error structure returned by server routes when errors occur.

```typescript
export interface ApiErrorEnvelope {
  code: string;
  message: string;
  correlationId: string;
  details?: unknown;
}
```

---

## 2. State Transitions & Lifecycle

### 2.1 Request Correlation & Logging Lifecycle

```
[Incoming HTTP Request]
       │
       ▼
[Extract / Generate correlationId] ──► (Validate UUID; fallback to new UUIDv4)
       │
       ▼
[Initialize AsyncLocalStorage] ──► Stores { correlationId, startTime }
       │
       ▼
[Invoke API Route / Server Action]
       │
       ├──► Authentication succeeds ──► Update context { userId }
       │
       ├──► Contract loaded ──────────► Update context { contractId }
       │
       ├──► Logger called: logger.info("message", { data })
       │         │
       │         ▼
       │    [Sanitize Payload]
       │         ├── Check depth (<= 5)
       │         ├── Check circular references (Visited Set)
       │         ├── Mask sensitive keys -> "[REDACTED]"
       │         └── Truncate strings > LOG_MAX_LENGTH -> "... [TRUNCATED]"
       │         │
       │         ▼
       │    [Inject Context] ──► Adds correlationId, userId, contractId
       │         │
       │         ▼
       │    [Emit Output] ──► Pino transport (stdout raw JSON / pretty in dev)
       │
       ▼
[Finalize HTTP Response]
       ├── Set Header: x-correlation-id = correlationId
       └── If Error: Return ApiErrorEnvelope with correlationId
```

---

## 3. Biome Toolchain Schema (`biome.json`)

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs", "**/*.json"]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "es5"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "style": {
        "noNonNullAssertion": "warn"
      }
    }
  }
}
```
