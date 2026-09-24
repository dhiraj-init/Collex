# Collex Security Architecture

## 1. Authentication & Session Management
- **JWT Authentication:** Stateful sessions are avoided to scale easily. JWTs are signed with a strong `JWT_SECRET`.
- **Token Expiry:** Access tokens have a short lifespan. In production, a refresh token mechanism (HTTP-only cookies) should be added.
- **Password Hashing:** Passwords are never stored in plaintext. They are hashed using `bcrypt` with a 10-round salt before saving to MongoDB.

## 2. API Protection & Rate Limiting
- **Global Rate Limiting:** Applied to all routes (`200 req/min`).
- **Auth Rate Limiting:** Stricter limits (`15 req/15min`) on `/api/v1/auth/login` to prevent brute-force attacks.
- **ML Endpoint Limiting:** Custom limits (`30 req/min`) on `/api/v1/ml/price/predict` and `/shield/check` to prevent abuse of compute-heavy resources.

## 3. Data Validation & Sanitization
- **Schema Validation:** Mongoose schemas enforce types, required fields, and enum constraints at the database level.
- **Payload Limits:** `express.json({ limit: '10mb' })` prevents memory exhaustion from large payloads (e.g., massive base64 images).
- **NoSQL Injection:** Mongoose inherently protects against most NoSQL injection by casting inputs to schema types.

## 4. Multi-Tenant Isolation
- **Query Scoping:** Every database query for listings, bundles, and wanted posts includes a filter for `college: req.user.college`.
- **Admin Authorization:** `COLLEGE_ADMIN` users can only modify settings for their specific college, verified by cross-referencing `req.user.college` with the target `College` document.

## 5. Network Security
- **CORS Configuration:** Configured to only allow requests from specific origins (the frontend client).
- **Helmet:** Sets secure HTTP headers (e.g., `Strict-Transport-Security`, `X-Content-Type-Options`).
- **Proxy Gateway:** The Python ML service is strictly internal. The Node.js server acts as an API gateway, preventing direct external access to the ML endpoints.
