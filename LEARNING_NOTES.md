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

### 5. Commands Reference

```bash
# Start local development servers:
npm run dev:server    # Backend API on http://localhost:5000
npm run dev:client    # Frontend React App on http://localhost:5173

# Run production build validation:
npm run build         # Validates tsc on server and vite build on client

# Run zero-warning lint check:
npm run lint          # Validates tsc on server and oxlint on client
```
