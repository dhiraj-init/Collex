# Collex — Developer Learning Notes

## Phase 0: Architecture & Foundation

These notes are designed for a junior developer to understand every architectural decision, technology pattern, and concept used in the Collex foundation.

---

### 1. What Was Implemented

1. **Monorepo Structure**:
   - Clean separation of concerns between `/client` (frontend SPA) and `/server` (backend REST API).
   - Dedicated documentation directory in `/docs`.
   - Unified workspace root scripts in `package.json` for coordinated building, linting, and development.

2. **Backend Technical Foundation (Node.js + Express + TypeScript)**:
   - Configured strict TypeScript build pipeline (`tsconfig.json`).
   - Secure server environment with `helmet` for HTTP headers and `cors` whitelist handling.
   - Robust `dotenv` environment loader with defaults and production checks (`env.ts`).
   - Resilient MongoDB connection manager (`db.ts`) with lifecycle event logging and degraded mode fallback.
   - Structured logger utility (`logger.ts`) with ISO timestamps and log level gating.
   - Custom `AppError` class distinguishing operational errors from bugs.
   - Standardized API response envelopes for both success and error payloads.
   - Centralized error-handling middleware (`errorHandler.ts`) covering Mongoose cast errors, schema validation errors, duplicate keys (code 11000), and JSON syntax errors.
   - 404 Not Found catch-all middleware (`notFoundHandler.ts`).
   - Live system health-check controller and route (`GET /api/v1/health`).
   - Split `app.ts` (app configuration) and `server.ts` (server lifecycle and graceful shutdown).

3. **Frontend Technical Foundation (React 19 + TypeScript + Vite + Tailwind CSS)**:
   - Vite 8 project setup with strict TypeScript and `verbatimModuleSyntax`.
   - Tailwind CSS v4 styling with campus-oriented slate and emerald design palette.
   - Strongly-typed HTTP API client wrapper (`apiClient.ts`) with error unwrapping.
   - Campus branding header, live diagnostics health check panel, and architecture preview components.
   - Full empty, loading, degraded, and error states handled with zero mock data.

4. **10 Core Domain Data Model Proposals**:
   - Architected complete schemas and field indexes for: `User`, `College`, `Listing`, `Conversation`, `Message`, `Offer`, `Transaction`, `Review`, `Report`, `Notification`.

---

### 2. Important Files and Responsibilities

| File Path | Responsibility |
| :--- | :--- |
| `server/src/app.ts` | Configures Express, middleware chain (Helmet, CORS, JSON parser, logger), mounts `/api/v1`, and attaches error handlers. |
| `server/src/server.ts` | Initializes DB connection, starts HTTP listener on port 5000, and binds `SIGINT`/`SIGTERM` graceful shutdown hooks. |
| `server/src/config/db.ts` | Manages Mongoose connection, logs connection states, and prevents crashing if the database is offline at boot. |
| `server/src/config/env.ts` | Validates environment variables and exports a strongly-typed `config` object. |
| `server/src/middlewares/errorHandler.ts` | Single point of error transformation into uniform JSON responses. |
| `server/src/middlewares/requestLogger.ts` | Intercepts HTTP requests and logs method, route, status code, and latency in milliseconds. |
| `server/src/controllers/healthController.ts` | Gathers process uptime, memory usage, environment, and DB status for health checks. |
| `client/src/services/apiClient.ts` | Typed fetch wrapper with centralized error translation. |
| `client/src/components/common/HealthCheckPanel.tsx` | Real-time frontend diagnostics card querying `/api/v1/health` with loading, error, and refresh states. |
| `docs/ARCHITECTURE.md` | Architectural blueprint, request lifecycle diagrams, and domain data models. |

---

### 3. Key Concepts & Technologies Used

#### A. Separation of `app.ts` and `server.ts`
- **Why?** In Express applications, defining routes and starting the server on a port (`app.listen`) in the same file makes automated testing difficult. When testing with tools like Supertest, you want to import the Express app *without* binding to an actual network port.
- `app.ts` defines the behavior; `server.ts` controls the network process.

#### B. Centralized Error Handling vs. Ad-Hoc Try/Catch
- In unorganized code, developers often send `res.status(500).json(...)` inside every route handler. If the schema or error format changes, you have to edit dozens of files.
- With **Centralized Error Handling**:
  1. Any route or service simply calls `next(new AppError('Item not found', 404))` or throws inside async wrappers.
  2. The single error handler middleware formats the response, logs it, and strips stack traces in production.

#### C. Operational Errors vs. Programmer Bugs
- **Operational Errors**: Known, predictable issues that will inevitably occur in production (e.g., user supplies invalid email, resource not found, token expired). These are modeled via `AppError` and carry a 4xx HTTP status code.
- **Programmer Bugs**: Bugs in our code (e.g., reading a property of `undefined`, syntax errors). These are handled by catching them and returning a clean 500 without leaking stack traces or credentials to clients.

#### D. Non-blocking Database Degradation
- If a database server takes a few seconds to boot or network blips occur, a production application should not crash immediately. Instead, our database manager records the connection failure, allows the HTTP server to start, and reports a `degraded` health status until the connection recovers.

#### E. Strict TypeScript & `verbatimModuleSyntax`
- TypeScript’s `verbatimModuleSyntax` forces type-only imports to use `import type { Foo } from './foo'`. This guarantees that TypeScript types are fully stripped during bundling and prevents circular dependency runtime issues.

---

### 4. Important Interview Questions & Answers

#### Q1: Why should an API return consistent response envelopes?
> **Answer:** Frontend clients and third-party integrations should never have to guess whether a response contains `{ error: string }`, `{ message: string }`, or `{ err: object }`. A standardized envelope (such as `{ success, statusCode, message, data, errors, meta }`) allows the client's HTTP service to write a single generic response parser and error interceptor, significantly reducing boilerplate and runtime bugs.

#### Q2: What happens if an unhandled promise rejection occurs in Node.js?
> **Answer:** In modern Node.js (v15+), unhandled promise rejections terminate the Node process with a non-zero exit code if not caught. Registering `process.on('unhandledRejection', ...)` allows us to log the exact cause and safely trigger a graceful shutdown before the process crashes unpredictably.

#### Q3: What is the purpose of the `Helmet` middleware in Express?
> **Answer:** Helmet automatically configures critical HTTP response headers (such as `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `X-Frame-Options: SAMEORIGIN`). These protect against common web vulnerabilities like Cross-Site Scripting (XSS), clickjacking, and MIME-sniffing attacks.

#### Q4: Why is campus tenant isolation critical for Collex?
> **Answer:** Unlike Craigslist or Facebook Marketplace, Collex derives its competitive advantage and safety from student-only trust. Enforcing campus isolation ensures students only interact with peers from their own university, eliminating non-student actors, minimizing scam vectors, and enabling physical on-campus safe meetups.

---

### 5. Commands Reference

```bash
# ==============================================================================
# RUNNING LOCALLY
# ==============================================================================

# Start Express Backend (watch mode via tsx):
npm run dev:server

# Start Vite React Frontend:
npm run dev:client

# ==============================================================================
# BUILDING & LINTING
# ==============================================================================

# Build both backend (tsc) and frontend (vite build):
npm run build

# Run TypeScript checking & linting across the monorepo:
npm run lint

# ==============================================================================
# TESTING HEALTH CHECK VIA TERMINAL
# ==============================================================================

# PowerShell:
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health"

# cURL:
curl -i http://localhost:5000/api/v1/health
```
