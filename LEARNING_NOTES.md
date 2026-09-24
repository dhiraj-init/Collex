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

## Part 5: Real-Time Communication & Socket.IO Architecture (Phase 5)

### 1. Conceptual Breakdown for Beginners

#### A. HTTP Polling vs WebSockets (Socket.IO)
In traditional HTTP (REST), communication is **unidirectional and request-driven**:
$$\text{Client} \xrightarrow[\text{"Any new messages?"}]{\text{HTTP GET}} \text{Server} \xrightarrow[\text{"No"}]{200\text{ OK}} \text{Client}$$
If 1,000 students poll every 2 seconds, the server processes 30,000 requests every minute just checking for updates, causing massive server load and battery drain.

**The Socket.IO / WebSocket Solution:**
WebSockets establish a persistent, **bi-directional full-duplex TCP connection**:
$$\text{Client} \xleftrightarrow[\text{Instant 2-way message stream}]{\text{Persistent WebSocket Connection}} \text{Server}$$
When Student A sends a message or offer, the server immediately pushes it to Student B in sub-10 milliseconds without any polling.

```
       Client A                               Server                              Client B
          │                                      │                                   │
          │ ─── 1. HTTP Upgrade Handshake ─────► │                                   │
          │ ◄── 2. 101 Switching Protocols ────  │                                   │
          │ ─── 3. JWT Token Authenticated ────► │ ◄── Authenticated & Connected ──  │
          │                                      │                                   │
          │ ─── 4. emit('send_message') ───────► │                                   │
          │                                      │ ─── 5. to(room).emit('new_msg') ─►│
```

#### B. Socket.IO Handshake Authentication
To prevent unauthorized connections, Socket.IO intercepts the initial HTTP connection handshake:
```ts
// server/src/socket.ts
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const user = verifyAccessToken(token);
    socket.user = user; // Attach verified student payload
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
});
```

#### C. Room Isolation & Anti-Snoop Security
A critical vulnerability in real-time chat is allowing users to listen to conversations they do not belong to. Collex enforces room authorization before a socket can join any channel:
```ts
socket.on('join_conversation', async ({ conversationId }) => {
  const conversation = await Conversation.findById(conversationId);
  const isParticipant =
    conversation.buyer.toString() === socket.user.userId ||
    conversation.seller.toString() === socket.user.userId;

  if (!isParticipant) {
    return socket.emit('socket_error', { message: 'Unauthorized access to conversation' });
  }

  socket.join(`conversation:${conversationId}`);
});
```

#### D. The Real-Time Offer Negotiation System
In campus marketplaces, students negotiate prices before meeting. The offer system supports:
1. `OFFER` (Buyer sends proposed amount, e.g. ₹700).
2. `ACCEPT` (Seller accepts $\rightarrow$ automatically transitions listing to `RESERVED` and spawns a `Transaction` in `AGREED` state).
3. `REJECT` (Seller declines).
4. `COUNTER` (Seller proposes counter-offer, e.g. ₹800).

---

## Part 6: Campus Meetup & Transaction Lifecycle (Phase 6)

### 1. The Post-Offer Transaction State Machine

Once an offer is accepted, the peer-to-peer handoff lifecycle begins:

$$\boxed{\text{AGREED}} \longrightarrow \boxed{\text{MEETUP\_SCHEDULED}} \longrightarrow \boxed{\text{COMPLETED}} \;\Big(\text{or } \boxed{\text{CANCELLED}} \,/\, \boxed{\text{DISPUTED}}\Big)$$

1. **`AGREED`**: Offer price settled; peers proceed to choose a meetup spot and time.
2. **`MEETUP_SCHEDULED`**: Both buyer and seller agree on a designated public campus location.
3. **`COMPLETED`**: Physical handoff occurred; **both** buyer and seller submit dual-confirmation in the app.
4. **`CANCELLED`**: Either student cancels before handoff with an explicit reason.
5. **`DISPUTED`**: A no-show or condition mismatch is flagged for moderator review.

### 2. Hyperlocal Safe Campus Meetup Spots (Privacy First)
- **Why exact GPS locations are NOT used:** Exposing exact student locations or hostel room numbers creates severe student safety and stalking risks.
- **Approved Public Safe Spots:** Administrators configure well-lit, high-visibility campus locations:
  1. *Central Library Entrance* (Under main security desk)
  2. *Student Activity Centre (SAC)* (Cafeteria foyer)
  3. *Main Campus Gate* (Visitor security booth)
  4. *Hostel Quad / Warden Office* (Common room desk)

### 3. Dual Confirmation Handoff & Mutual Reviews
To prevent one party from falsely claiming an item was not delivered:
- The transaction only transitions to `COMPLETED` when **both** `buyerConfirmedHandoff` and `sellerConfirmedHandoff` evaluate to `true`.
- Once completed, the listing is automatically marked `SOLD`, and both peers are prompted for mutual reviews (rating 1-5, punctuality, and item accuracy), which feeds directly into the recipient's Collex Trust Score.

---

## Part 7: Collex Trust and Safety Layer (Phase 7)

### 1. The Explainable Collex Trust Score (0 - 100)

Unlike black-box reputation scores, Collex uses an **explainable, deterministic calculation** based on verified signals:

$$\text{TrustScore} = \underbrace{\text{VerificationPoints}}_{10 - 50} + \underbrace{\text{CompletedDeals}}_{0 - 20} + \underbrace{\text{PeerRatings}}_{0 - 20} + \underbrace{\text{CampusLongevity}}_{3 - 10} - \underbrace{\text{Penalties}}_{0 - 50}$$

#### Signal Breakdown:
| Signal | Weight | Logic |
| :--- | :--- | :--- |
| **Verification** | Max 50 pts | `STUDENT_VERIFIED` (50 pts), `EMAIL_VERIFIED` (35 pts), `UNVERIFIED` (10 pts) |
| **Completed Deals** | Max 20 pts | +4 points per clean physical handoff (capped at 5 deals) |
| **Peer Ratings** | Max 20 pts | $\frac{\text{AverageRating}}{5.0} \times 20$ (Neutral baseline of 12 pts for new students) |
| **Campus Longevity** | Max 10 pts | $>90\text{ days}$ (10 pts), $>30\text{ days}$ (7 pts), $\le 30\text{ days}$ (3 pts) |
| **Cancellation Penalty** | Deductive | $-15\text{ pts}$ if cancellation rate exceeds 35% |
| **Conduct Penalty** | Deductive | $-25\text{ pts}$ per confirmed moderation violation |

#### Trust Tiers:
* **`CAMPUS_CHAMPION`** ($\ge 90$): Trusted campus senior with stellar review track record.
* **`TRUSTED_TRADER`** ($75 - 89$): Active student with multiple confirmed transactions.
* **`VERIFIED_PEER`** ($50 - 74$): Verified college member in good standing.
* **`NEW_STUDENT`** ($< 50$): Newly joined student.

---

### 2. Key Interview Questions & Answers (Phase 5, 6, & 7)

#### Q1: How do you secure WebSockets against unauthorized cross-tenant room subscriptions?
> **Answer:** Never trust client-supplied identifiers over WebSocket events. On connection, authenticate the socket using the JWT access token in the handshake. When a client emits `join_conversation`, the server queries the database to verify that the socket's authenticated user ID matches either the buyer or seller before calling `socket.join(room)`.

#### Q2: Why is dual-confirmation required for in-person marketplace transactions?
> **Answer:** In cash/peer-to-peer in-person transactions where no third-party courier exists, requiring independent confirmation from both parties prevents unilateral fraud (e.g. a buyer taking the item and refusing to confirm, or a seller claiming payment wasn't received). Only mutual agreement unlocks review submissions and status finalization.

#### Q3: What is the principle of explainable trust scores versus opaque AI algorithms?
> **Answer:** Opaque scores leave students confused and frustrated when their score drops without explanation. Explainable trust scores provide clear, deterministic visibility into *why* a score is what it is (e.g., +35 for college email verification, +16 for 4 completed handoffs, -8 for a high cancellation rate), creating positive behavioral incentives for honesty and punctuality across the campus community.

---

### 5. Commands Reference

```bash
# Start local development servers:
npm run dev:server    # Backend API on http://localhost:5000 (MongoDB Atlas Connected + Socket.IO)
npm run dev:client    # Frontend React App on http://localhost:5173

# Run production build validation:
npm run build         # Validates tsc on server and vite build on client (zero errors)

# Run zero-warning lint check:
npm run lint          # Validates tsc on server and oxlint on client (zero errors)
```



---

## Phase 8: Collex Price Intelligence (ML Service)

### What Is It?

A separate Python/FastAPI microservice that uses a trained machine learning model to estimate a fair selling price for a second-hand campus item. It runs on port 8000 and is only accessible through the Node.js backend (the browser never talks to it directly).

### Why a Separate Python Service?

Node.js is poor for ML. The Python ML ecosystem (scikit-learn, pandas, numpy) is mature and widely used in industry. Keeping them separate follows the microservices pattern: each service does what it is best at.

```
Browser --> Node.js (port 5000) --> Python ML (port 8000)
              |
              |-- Authenticates the user (JWT)
              |-- Validates the request
              |-- Forwards to ML service
              |-- Returns ML response to client
```

This means the Python service URL (port 8000) is never exposed to the internet. Only the Node.js server can reach it.

### How Does the ML Pipeline Work?

1. **generate_dataset.py** creates synthetic training data (3,000 rows)
2. **train.py** builds a preprocessing + model pipeline:
   - `OneHotEncoder` for categorical features (category, condition, listing_type)
   - `passthrough` for numeric features (price, age, engineered ratio)
   - `RandomForestRegressor` as the estimator
3. `joblib.dump(pipeline, "model/price_model.joblib")` saves it to disk
4. **predictor.py** loads the saved pipeline at startup (once) and calls `.predict()` on each request
5. **main.py** (FastAPI) exposes `POST /price/predict` and uses the predictor singleton

### Why scikit-learn Pipeline?

A common mistake is to apply preprocessing separately from the model. This causes "training-serving skew" - your model was trained on processed data but you forget to apply the same transformation at inference time. `sklearn.Pipeline` guarantees that the exact same preprocessing is always applied both during training and prediction.

```python
# ONE object handles both:
pipeline.fit(X_train, y_train)    # preprocessing + training in one step
pipeline.predict(X_test)          # same preprocessing + inference
```

### Why RandomForest?

- Robust to outliers (campus prices range from Rs10 to Rs80,000)
- Handles non-linear relationships (depreciation is not linear with age)
- No feature scaling required
- Individual tree variance gives free uncertainty estimates
- Easy to explain in interviews

### Uncertainty Quantification

A key feature is honest confidence estimation. We use the variance across the 200 individual decision trees:

```python
estimators = pipeline.named_steps["regressor"].estimators_
tree_preds = [t.predict(X)[0] for t in estimators]
std = np.std(tree_preds)
```

High std = trees disagree a lot = LOW confidence. Low std = trees agree = potentially HIGH confidence. This is not a perfect probability estimate but it is honest and interpretable.

### Debounced API Calls in the Frontend

The SellItemPage calls the price prediction API as the user fills in the form. To avoid spamming the API on every keystroke:

```typescript
// Wait 800ms after the user stops changing values before calling the API
priceDebounceRef.current = setTimeout(async () => {
  const result = await mlService.predictPrice({ ... });
  setPricePrediction(result);
}, 800);

// Cancel the pending call if the user changes values again
if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
```

This is called "debouncing" and is a standard UX pattern for expensive async operations.

---

## Phase 9: Collex Shield (Risk Assessment)

### What Is It?

A rule-based engine that evaluates signals about a listing and seller to produce an advisory risk assessment. It helps buyers make informed decisions but never definitively accuses sellers of fraud.

### The Core Design Rule: Advisory Language

This is the most important engineering constraint in the entire feature. Every signal, every UI string, and every API response must use advisory language:

- CORRECT: "Price is substantially lower than similar listings."
- WRONG: "This listing is probably a scam."
- CORRECT: "Seller account was very recently created."
- WRONG: "This seller is suspicious."

Why? Because:
1. Legitimate sellers will trigger these signals (student urgently selling before exams)
2. Definitively labeling a real person as fraudulent has serious legal implications
3. Trust is Collex's core brand value - being wrong and accusatory destroys trust faster than fraud

### How Risk Scoring Works

```python
score = 0

if listing_price < (fair_price * 0.15):   # extreme low price
    score += 40
elif listing_price < (fair_price * 0.35): # substantially low
    score += 25

if seller_account_age_days < 3:   # very new
    score += 20
elif seller_account_age_days < 14: # recent
    score += 10

# ... more signals ...

score = min(score, 100)  # cap at 100

if score >= 50: risk_level = "HIGH"
elif score >= 20: risk_level = "MEDIUM"
else: risk_level = "LOW"
```

Signals are additive. A listing with multiple medium signals accumulates into HIGH risk. A single signal that is easily explained (new account but everything else is clean) stays MEDIUM.

### Fair Price Estimation in Shield

The shield's price anomaly detection uses the **same deterministic formula** as the training data generator, not the ML model. This is intentional:

- The ML model has uncertainty and occasionally produces surprising predictions
- A deterministic formula (original_price * condition_factor * age_factor) is predictable and explainable
- This consistency prevents the shield from being gamed through edge cases in the ML model

### Graceful Degradation

If the ML service is down, the shield and price intelligence features fail silently on the frontend:

```typescript
try {
  const result = await mlService.checkShield({ ... });
  setShieldResult(result);
} catch {
  // Shield unavailable - don't block the listing view
}
```

The user can still view and interact with listings. The ML features are enhancements, not required functionality.

### False Positive Awareness

Collex Shield has a deliberate "be helpful but not harmful" design:

- LOW risk: subtle shield badge, minimal UI (don't scare buyers away from good listings)
- MEDIUM risk: expandable badge, signals listed, neutral tone
- HIGH risk: expanded by default, full buyer guidance, always includes disclaimer

Every single buyer guidance message ends with either "These signals do not necessarily indicate a problem" or a reminder that legitimate scenarios exist.

### Interview Questions for Phase 8 & 9

**Q: What is a scikit-learn Pipeline and why use it?**
A: A Pipeline chains preprocessing steps and a model into a single object. It prevents training-serving skew (the bug where you forget to apply preprocessing at inference time). It also makes the code cleaner and the model artifact completely self-contained.

**Q: How would you evaluate a price prediction model for a marketplace?**
A: Primary metric: MAPE (Mean Absolute Percentage Error) because it is scale-independent and business-interpretable ("we are off by X% on average"). MAE in rupees matters for absolute budget. R2 tells you how well the model explains variance vs. predicting the mean. Avoid RMSE as the primary metric because it is sensitive to outliers.

**Q: Why not use a deep learning model for price prediction?**
A: Dataset size. With 3,000 rows of synthetic data, a neural network would overfit severely. RandomForest is the correct choice at this data scale. Revisit with gradient boosting (XGBoost) when real transaction data accumulates to ~50,000+ rows.

**Q: How do you prevent bad actors from gaming Collex Shield?**
A: Specific weights are not published. Signals are evaluated simultaneously, so improving one does not guarantee avoiding detection. Future: add behavioral signals (message patterns, device fingerprints) that are much harder to fake than account age.

**Q: How do you handle false positives in a safety system?**
A: Design the system's language to be advisory not accusatory. Expose signals with explanations, not verdicts. Build a moderator feedback loop so false positives can be dismissed and create training data for future models. Surface false positive metrics in admin dashboards. Never allow the system to take automated punitive action (blocking) without human moderator review.

---

## Phase 10: Signature Features
- **MongoDB `$in` Operator:** Used in Bundles to fetch multiple listings efficiently.
- **Barter System:** Designed `ExchangeProposal` schema to encapsulate complex entity relationships (User -> User, target Listing, optional offered Listing).
- **Deterministic Recommendations:** Scored listings based on weights (same department = +30, recency decay) to provide relevant course-aware discovery without needing a full ML model upfront.

## Phase 11: Multi-Tenancy & Admin
- **Logical Multi-Tenancy:** By adding a `college` field to every document and enforcing it at the Express query level, we maintain strict tenant isolation without the DevOps overhead of maintaining multiple database instances.
- **Aggregation Pipelines:** Used MongoDB `$group`, `$match`, and `$sum` to compute real-time College Dashboard statistics efficiently.

## Phase 12: Production Hardening
- **Rate Limiting (express-rate-limit):** Stricter limits applied.
- **Test Strategy (Supertest):** API routes tested natively. *Lesson learned:* In a real CI environment, it is better to use `mongodb-memory-server` to spin up ephemeral databases for testing rather than relying on a local daemon.

## Phase 13: Deployment
- **Docker Compose:** Configured a multi-container environment (Node.js backend, React frontend, FastAPI ML service, MongoDB) communicating via a private bridge network.
- **Nginx in Docker:** Used `nginx:alpine` for serving the built React static files in production.
