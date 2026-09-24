# Collex Multi-Tenancy Architecture

## Tenant Isolation Strategy
Collex employs a **Logical Multi-Tenancy** model using a single shared database (MongoDB). This is the most cost-effective and scalable approach for thousands of colleges, compared to deploying separate databases or schemas per college.

### 1. Data Modeling
Every multi-tenant resource (`Listing`, `User`, `Transaction`, `WantedPost`, `Bundle`, `ExchangeProposal`) includes a `college` string field.

### 2. Query Scoping (The Golden Rule)
Tenant isolation is enforced strictly at the backend query level. The frontend never decides which tenant data it receives.
- When a user requests the marketplace feed:
  `Listing.find({ college: req.user.college, status: 'ACTIVE' })`
- If the user is unauthenticated, the feed uses the college slug from the URL:
  `Listing.find({ college: req.params.slug, status: 'ACTIVE' })`

### 3. College Administration
Each college is represented by a `College` document containing:
- `slug` (e.g., `wce`) for URL routing (e.g., `collex.in/campus/wce`)
- `emailDomains` (e.g., `['wce.ac.in']`) for automatic student verification.
- `settings` (e.g., `allowRentals`, `maxListingsPerStudent`)
- `approvedMeetupSpots` (Safe zones configured by admins)

### 4. Role-Based Access Control (RBAC)
- **STUDENT:** Can only see and interact with data in their own college.
- **COLLEGE_ADMIN:** Can access the College Admin Dashboard (`/api/v1/colleges/:slug/dashboard`) to view analytics, but only for `req.user.college`.
- **SUPER_ADMIN:** Can create new Colleges and access all tenant data.

### 5. URL Architecture
- **Marketing/Landing:** `https://collex.in`
- **Campus Portal:** `https://collex.in/campus/wce`
- **App Dashboard:** `https://app.collex.in` (Reads user's campus from JWT)
