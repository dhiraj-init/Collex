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

### 2. Important Files and Responsibilities (Phase 0)

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
| `docs/ARCHITECTURE.md` | Architectural blueprint, request lifecycle diagrams, and domain data models. |

---

<br />

## Phase 1: Collex Design System & Frontend Experience

This phase established the startup-grade frontend marketplace experience for Collex with responsive mobile and desktop navigation, 10 core views, realistic campus mock data, and an accessible campus-first visual design system.

---

### 1. What Was Implemented in Phase 1

1. **Custom Visual Identity & Design System**:
   - Palette tailored for Indian university campuses: Deep Forest Emerald (`#059669`, `#10B981`), Ink Slate (`#0B0F19`, `#111827`), Warm Amber (`#D97706`) for verified status.
   - Consistent typography using Inter, uppercase tracked micro-badges (`text-[10px] uppercase font-semibold`), and high-contrast accessible states.
   - Clean Indian Rupee pricing formatting (`₹850`, `₹3,400`, `FREE`).
   - Zero AI-dashboard tropes (no generic purple gradients, no floating cards, no fake testimonial stats).

2. **Responsive Application Shell**:
   - **Desktop Navbar**: Collex crest, university campus switcher dropdown (`IIT Bombay`, `BITS Goa`, `DTU Delhi`, `NIT Trichy`, `RVCE Bengaluru`), global search bar with instant submit, `+ Sell Item` primary action button, notifications bell with popover, saved bookmarks with real-time counter, and student profile menu.
   - **Mobile Bottom Navigation Bar**: Fixed bottom bar providing one-thumb reach to Home, Explore, Sell (prominent central pill), Chat, and Profile.
   - **Polished Footer**: Safety policies, campus domain coverage, category links, trust & safety guarantees.

3. **10 Core Marketplace Pages**:
   - `LandingPage.tsx`: Hero banner with campus indicator, "The trusted marketplace for campus life", "Buy. Sell. Rent. Exchange", category navigation tiles, recent campus drops, safe meetup 3-step breakdown, and seller CTA.
   - `MarketplacePage.tsx`: Real-time search, horizontal category selector, active filter chips, sort dropdown (Newest, Price asc/desc, Most popular), filter drawer trigger, responsive listing card grid, and empty states.
   - `ListingDetailPage.tsx`: Photo gallery with thumbnails, pricing in ₹, discount calculation, campus meetup location, verified seller trust box (score 98%), item description, "Make an Offer" modal, "Chat with Seller" action, and related campus items.
   - `SellItemPage.tsx`: Multi-section publish form (Item Basics, Indian Pricing, Preset & Custom Photos, Campus Handoff Location) with a real-time **Live Card Preview** tab showing how the card will look in the marketplace.
   - `LoginPage.tsx`: Institutional email domain validator (`.edu`, `.ac.in`), password visibility toggle, campus trust reminder.
   - `RegisterPage.tsx`: Student onboarding with full name, college picker, branch, graduation batch (2025–2028), and Student Honor Code confirmation.
   - `MessagesPage.tsx`: Two-column chat experience with conversation threads, item context snapshot, daylight meetup reminders, safe meetup proposition button, and real-time message state.
   - `ProfilePage.tsx`: Student trust card (Trust Score 98/100, 4.9 rating, 14 items sold, 100% completion rate), tabs for peer reviews, active listings, and institutional domain verification audit.
   - `SavedItemsPage.tsx`: Wishlist with bookmarked items, instant un-save toggle, and empty state.
   - `MyListingsPage.tsx`: Seller dashboard with status breakdown (Active, Reserved, Sold), status toggles ("Reserve", "Mark as Sold"), total student views counter, and delete actions.

4. **Interactive State & Mock Data Layer (`MarketplaceContext.tsx`)**:
   - Centralized state for listings, bookmarks (`savedListingIds`), filters, conversations, notifications, and simulated student user.
   - Dynamically prepends newly published listings from `/sell` into the marketplace.
   - Toggle status and delete items directly from `/my-listings`.

---

### 2. Important Files and Responsibilities (Phase 1)

| File Path | Responsibility |
| :--- | :--- |
| `client/src/context/MarketplaceContext.tsx` | Central state store managing listings, filters, saved bookmarks, chat threads, and notifications. |
| `client/src/data/mockData.ts` | Realistic Indian campus datasets (calculators, drafters, cycles, hostel gear, universities, peer reviews). |
| `client/src/components/layout/Navbar.tsx` | Top desktop navigation with campus switcher and notification popover. |
| `client/src/components/layout/MobileNav.tsx` | Fixed bottom bar optimized for mobile one-thumb campus browsing. |
| `client/src/components/marketplace/ListingCard.tsx` | Core card component with price in ₹, discount pill, condition tag, seller trust badge, and save toggle. |
| `client/src/components/marketplace/CategoryBar.tsx` | Horizontally scrollable category selector with student icons. |
| `client/src/components/marketplace/FilterDrawer.tsx` | Slide-over drawer with price range slider, condition checkboxes, and deal type selectors. |
| `client/src/components/common/EmptyState.tsx` | Reusable empty state view with descriptive call-to-action. |
| `client/src/App.tsx` | Routing engine configuring all 10 views with React Router. |

---

### 3. Key Concepts & Technologies Used in Phase 1

#### A. React 19 Context Architecture vs External Store
- For prototyping and early startup validation, React's built-in `createContext` and `useContext` provides zero-dependency global state without the complexity and bundle weight of Redux Toolkit or Zustand.
- State is partitioned into clear actions (`toggleSaveListing`, `addListing`, `toggleListingStatus`, `sendMessage`) that mirror future REST and WebSocket API contracts.

#### B. Compound Client-Side Filtering Pipeline
- `MarketplacePage.tsx` uses a multi-stage `useMemo` filter pipeline:
  $$\text{Listings} \xrightarrow{\text{Campus}} \xrightarrow{\text{Search Query}} \xrightarrow{\text{Category}} \xrightarrow{\text{Condition}} \xrightarrow{\text{Deal Type}} \xrightarrow{\text{Price Range}} \xrightarrow{\text{Sort}} \text{Filtered Listings}$$
- This guarantees instant 60fps UI feedback without re-fetching from the network on every keystroke.

#### C. Mobile-First Bottom Navigation (Thumb Zone Ergonomics)
- Over 75% of college students browse marketplaces on their smartphones between lectures.
- Traditional hamburger menus create high interaction friction. The fixed bottom bar (`MobileNav`) positions the primary actions (Explore, Sell, Chat) directly inside the thumb zone.

#### D. Accessible Form Design
- Every input on `/sell`, `/login`, and `/register` features explicit semantic `<label>` associations, accessible error messages, helper text, and clear focus states (`focus:border-emerald-500`) rather than relying solely on placeholder text.

---

### 4. Important Interview Questions & Answers (Phase 1)

#### Q1: When should you use client-side filtering versus server-side filtering?
> **Answer:** Client-side filtering is ideal when the dataset is bounded (e.g. hundreds of items in a single campus) because it delivers instantaneous sub-10ms response times and offline/cached resilience. However, once the catalog exceeds thousands of items, server-side pagination (e.g. cursor-based pagination with database indexing) is required to reduce memory usage, initial payload size, and battery consumption on mobile devices.

#### Q2: Why is optimistic UI updates important in marketplace applications?
> **Answer:** Optimistic UI updates (such as immediately filling the bookmark heart icon or adding a chat message to the thread before waiting for the network roundtrip) make the application feel immediate and native. If the network call subsequently fails, the UI rolls back the state and displays a non-intrusive toast notification.

#### Q3: Why is mobile viewport layout testing critical for marketplaces?
> **Answer:** Touch target sizing (minimum 44x44px per WCAG guidelines), preventing horizontal overflow on small screens (375px/390px), and avoiding sticky element overlaps (like floating bottom bars obscuring form submit buttons) directly affect student conversion and retention rates.

---

## Part 2: Authentication, Security & Verified Student System (Phase 2)

### 1. Conceptual Breakdown for Beginners

#### A. JSON Web Tokens (JWT) Architecture
A **JSON Web Token (JWT)** is a compact, URL-safe means of representing claims to be transferred between two parties. Unlike traditional session cookies stored in server memory (which break when scaling across multiple server instances without Redis), JWTs are **stateless**. The server signs the token using a cryptographic secret key; any tampering immediately invalidates the signature.

A JWT consists of three parts separated by dots (`.`):
$$\underbrace{\text{eyJhbGciOi...}}_{\text{Header}}.\underbrace{\text{eyJ1c2VySWQi...}}_{\text{Payload}}.\underbrace{\text{GoD7X4AFV...}}_{\text{Signature}}$$

1. **Header**: Specifies the hashing algorithm (e.g., `HS256` - HMAC SHA-256) and token type (`JWT`).
2. **Payload**: Contains the claims (e.g., `userId`, `email`, `college`, `role`, `verificationStatus`, expiration `exp`). **Crucial note:** The payload is Base64Url-encoded, NOT encrypted! Anyone can decode and read it, so *never* put passwords or sensitive credit card data inside a JWT.
3. **Signature**: Computed by taking `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), SECRET_KEY)`. Only the server possessing the secret key can generate this signature.

#### B. The Dual-Token Strategy: Access Token vs Refresh Token
| Feature | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Lifespan** | Very Short (e.g., 15 minutes) | Long (e.g., 7 days) |
| **Purpose** | Sent on every HTTP request to access protected routes | Used *only* to request a new access token when the old one expires |
| **Storage** | Client memory / Authorization Header | Secure HttpOnly Cookie or isolated secure storage |
| **Revocation** | Cannot be revoked until expiration (short window mitigates risk) | Can be revoked or rotated in the database on user logout or breach |

**Why not just use one long-lived token?**
If a hacker intercepts a token that lasts 30 days, they control the student's account for 30 days. With the dual-token strategy, an intercepted access token expires in 15 minutes, cutting off the attacker's window of opportunity.

#### C. Password Hashing with Bcrypt & Salt Rounds
- **Why plaintext passwords are unacceptable:** If a database is ever leaked, plaintext passwords immediately compromise all user accounts across the web.
- **Why SHA-256 or MD5 is NOT enough:** General-purpose hash functions are designed to be fast (billions of hashes per second). An attacker using modern GPUs can try billions of dictionary combinations every second using precomputed lookup tables called **Rainbow Tables**.
- **The Bcrypt Solution (Slow Hashing & Salting):**
  - **Salt**: A random string generated for every password before hashing. Even if two students choose the identical password `"Password123"`, their hashed values in MongoDB will look completely different, defeating rainbow tables.
  - **Work Factor (Salt Rounds):** We configured `saltRounds = 12`. This makes the hashing algorithm computationally expensive (taking ~250ms per check), which is negligible for a student logging in once, but renders brute-force attacks computationally impossible for attackers.

```
Plaintext Password + Unique Random Salt (12 rounds) 
             │
             ▼
        [bcrypt.hash()]
             │
             ▼
$2b$12$K1qWJ1V2... (Stored in MongoDB User Collection)
```

#### D. Express Authentication Middleware (`authenticate` & `authorize`)
In Express, middleware functions execute sequentially in the request-response lifecycle before reaching the route controller:

$$\text{HTTP Request} \longrightarrow \boxed{\text{Rate Limiter}} \longrightarrow \boxed{\text{authenticate}} \longrightarrow \boxed{\text{authorize(roles)}} \longrightarrow \boxed{\text{Controller}} \longrightarrow \text{HTTP Response}$$

1. **`authenticate`**:
   - Extracts the `Authorization: Bearer <token>` header.
   - Verifies the signature with `jwt.verify(token, JWT_ACCESS_SECRET)`.
   - Fetches the active student record from MongoDB and attaches it to `req.user`.
   - Rejects expired or malformed tokens with an explicit `401 Unauthorized`.
2. **`authorize(...roles)`**:
   - Role-Based Access Control (RBAC). Checks if `req.user.role` matches allowed roles (`STUDENT`, `MODERATOR`, `COLLEGE_ADMIN`, `SUPER_ADMIN`).
   - Rejects unauthorized users with `403 Forbidden`.
3. **`requireVerification(status)`**:
   - Ensures that sensitive campus features (e.g. posting a listing or initiating a transaction) are gated behind `EMAIL_VERIFIED` or `STUDENT_VERIFIED`.

#### E. Campus Domain Verification Architecture
Collex is not an open, anonymous classifieds site. Trust relies on ensuring participants actually belong to the college campus they claim.
- **Email Domain Extraction:** When a student registers with `aryan.sharma@iitb.ac.in`, the backend extracts `iitb.ac.in`.
- **Approved Institutional Whitelist:** During registration, `collegeDomain` is checked against `.ac.in`, `.edu`, and configurable approved campus domains.
- **3-Tier Verification Hierarchy:**
  1. `UNVERIFIED`: Account registered without confirming email link or domain.
  2. `EMAIL_VERIFIED`: Confirmed ownership of active student email inbox.
  3. `STUDENT_VERIFIED`: Completed student ID card or campus credential verification, unlocking trusted seller badges.

---

### 2. Key Interview Questions & Answers (Phase 2)

#### Q1: What is the difference between Authentication (401) and Authorization (403)?
> **Answer:** 
> - **Authentication (401 Unauthorized)** answers *"Who are you?"* It validates credentials (identity). A 401 occurs when a token is missing, expired, or invalid.
> - **Authorization (403 Forbidden)** answers *"Are you allowed to do this?"* The server knows who the user is (they are authenticated), but their role or permissions do not grant them access to the requested resource (e.g., a `STUDENT` attempting to access `/api/v1/admin/colleges`).

#### Q2: How does Refresh Token Rotation prevent replay attacks?
> **Answer:** Every time a client exchanges a refresh token for a new access token, the backend issues *both* a new access token and a brand-new refresh token, invalidating the previous refresh token. If a malicious actor intercepts a refresh token and attempts to use it later, the server detects that an already-used refresh token was submitted, flags suspicious activity, and invalidates all active sessions for that user.

---

## Part 3: Hyperlocal Marketplace Architecture & Listing Lifecycle (Phase 3)

### 1. Conceptual Breakdown for Beginners

#### A. Listing Status State Machine
A campus marketplace listing is not simply a static row; it transitions through a defined lifecycle:

$$\boxed{\text{DRAFT}} \longrightarrow \boxed{\text{ACTIVE}} \rightleftarrows \boxed{\text{RESERVED}} \longrightarrow \boxed{\text{SOLD}} \longrightarrow \boxed{\text{ARCHIVED}}$$

1. **`ACTIVE`**: Visible to all students on the campus feed. Inquiries and offers can be initiated.
2. **`RESERVED`**: A buyer and seller have agreed on a meetup (e.g. at the campus library). The item remains listed with a "Reserved" banner so other students know negotiations are in progress.
3. **`SOLD`**: The item has been physically handed over and payment settled. Removed from active search feeds but retained for seller analytics and transaction history.
4. **`ARCHIVED`**: Delisted by the student or moderator.

#### B. Ownership Authorization (The IDOR Defense)
A critical security vulnerability in multi-tenant marketplaces is **Insecure Direct Object Reference (IDOR)**, where a malicious user edits the URL parameter from `/api/v1/listings/123` to `/api/v1/listings/124` to modify or delete someone else's listing.

**How Collex Enforces Strict Ownership:**
```ts
// server/src/controllers/listingController.ts
const isOwner = listing.seller.toString() === req.user._id.toString();
const isStaff = req.user.role === 'SUPER_ADMIN' || req.user.role === 'MODERATOR';

if (!isOwner && !isStaff) {
  throw new AppError('Unauthorized: You can only edit your own listings', 403);
}
```
Even if an attacker sends a valid JWT, the server explicitly matches the token's authenticated `userId` against the listing's `seller` ObjectId in MongoDB before permitting any mutation.

#### C. Cloudinary CDN & Image Optimization
Images are typically the heaviest assets on any marketplace page (often 2–5MB per smartphone photo).
- **The Problem:** Serving raw multi-megabyte photos on mobile cellular networks slows page loads and triggers high bounce rates.
- **The Solution:** Collex uploads photos to Cloudinary with automated pipeline transforms:
  - `width: 1200, height: 900, crop: 'limit'`: Bounds images to screen dimensions.
  - `quality: 'auto:good'`: Applies perceptual compression without visible quality degradation.
  - `fetch_format: 'auto'`: Delivers next-gen WebP or AVIF formats based on browser support.

---

## Part 4: Campus Discovery, Search & Trending Algorithm (Phase 4)

### 1. The Campus Trending Score Algorithm

To prevent fabricating fake trending metrics while keeping the campus feed engaging and dynamic, Collex implements an algorithmic decay scoring model inspired by Hacker News and Reddit:

$$\text{TrendingScore} = \frac{\text{views} \times 1.5 + \text{saves} \times 3.0 + 10}{(\text{ageInHours} + 2)^{1.2}}$$

#### Why This Mathematical Formula Works:
1. **Purchase Intent Weighting ($\text{saves} \times 3.0$ vs $\text{views} \times 1.5$):**
   - A *view* indicates passive browsing.
   - A *save (bookmark)* indicates strong buying intent and high perceived value. Therefore, bookmarks carry twice the weight of casual views.
2. **Cold-Start Base Boost ($+10$):**
   - Brand new listings start with 0 views and 0 saves. Without the $+10$ constant, their initial score would be $0$, preventing new student listings from ever appearing on the trending feed.
3. **Time-Decay Exponent ($(\text{ageInHours} + 2)^{1.2}$):**
   - As hours elapse, the denominator grows exponentially. An older item with 300 views will gradually yield the top spot to a freshly posted scientific calculator or textbook with rapid early momentum.

---

### 2. MongoDB Indexing Strategy for Fast Campus Discovery

Without indexes, MongoDB must perform a **Collection Scan (`COLLSCAN`)**, reading every single document in the collection into RAM. With thousands of items, queries become unacceptably slow.

Collex defines three optimized compound indexes and a full-text search index in `server/src/models/Listing.ts`:

```ts
// 1. Campus Feed Index (Equality on college + Equality on status + Range/Sort on createdAt)
listingSchema.index({ college: 1, status: 1, createdAt: -1 });

// 2. Category & Price Filter Index (ESR Rule: Equality -> Sort -> Range)
listingSchema.index({ college: 1, category: 1, status: 1, price: 1 });

// 3. Seller Dashboard Index
listingSchema.index({ seller: 1, status: 1 });

// 4. Multi-Field Full-Text Search Index with Relevancy Weights
listingSchema.index(
  { title: 'text', description: 'text', brand: 'text', tags: 'text' },
  { weights: { title: 10, brand: 5, tags: 5, description: 2 } }
);
```

#### The ESR (Equality, Sort, Range) Rule Explained:
When designing compound indexes in MongoDB:
1. **Equality fields first:** Match exact college (`college: 'IIT Bombay'`) and status (`status: 'ACTIVE'`).
2. **Sort fields second:** Match the ordering required (`createdAt: -1` or `price: 1`).
3. **Range fields third:** Filters like `$gte` and `$lte` for price ranges.

---

### 3. Key Interview Questions & Answers (Phase 3 & Phase 4)

#### Q1: What is the ESR rule in MongoDB indexing, and why is index order critical?
> **Answer:** The ESR rule states that compound index keys should be ordered: **E**quality, **S**ort, **R**ange. If you place a range query field before a sort field, MongoDB cannot use the index to perform the sort in memory and must execute an expensive in-memory sort (`SORT_KEY_GENERATOR`), which errors out if the result set exceeds 32MB.

#### Q2: What is an IDOR vulnerability, and how did we protect listing updates in Collex?
> **Answer:** Insecure Direct Object Reference (IDOR) happens when an application relies on client-supplied IDs without verifying whether the requesting user actually owns that entity. In Collex, our `updateListing` and `deleteListing` controllers extract the authenticated `userId` from the verified JWT token (`req.user._id`) and verify that `listing.seller.equals(req.user._id)` before saving any changes.

#### Q3: How do you handle image uploads in production without overwhelming your application server?
> **Answer:** Uploading high-resolution images directly through Node.js consumes valuable CPU cycles and memory. The production approach is to either:
> 1. Use Cloudinary/S3 **Presigned Direct Upload URLs**, allowing the frontend client to upload binary bytes directly to the storage bucket, bypassing the Node server entirely.
> 2. Offload processing to a dedicated microservice or cloud transform pipeline that optimizes dimensions, formats (WebP/AVIF), and CDN caching headers automatically.

---

### 4. Commands Reference

```bash
# Start local development servers:
npm run dev:server    # Backend API on http://localhost:5000 (MongoDB Atlas Connected)
npm run dev:client    # Frontend React App on http://localhost:5173

# Run production build validation:
npm run build         # Validates tsc on server and vite build on client (zero errors)

# Run zero-warning lint check:
npm run lint          # Validates tsc on server and oxlint on client (zero errors)
```


