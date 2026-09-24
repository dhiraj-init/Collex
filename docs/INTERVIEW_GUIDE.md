# Full-Stack Engineering Interview Guide

This guide is designed to help you confidently explain the architecture and technical decisions behind Collex in a software engineering interview.

## 1. System Architecture: Monolith vs Microservices
**Question:** "Why did you build Collex this way?"
**Answer:** "Collex uses a modular monolith for the core API (Node.js/Express) and a separate sidecar microservice for Machine Learning (Python/FastAPI).
- **Why a Monolith for Core?** For a campus-scoped application, a single Node.js API is easiest to maintain, deploy, and scale. Network latency is minimized since all domain logic (users, listings, chats) lives together.
- **Why a Python Sidecar?** Machine learning models (like scikit-learn for Price Intelligence) run best in Python. Separating this into a FastAPI sidecar prevents the Node.js event loop from blocking during heavy inference tasks and allows independent scaling of the ML workers."

## 2. Database Trade-offs: MongoDB vs PostgreSQL
**Question:** "Why did you choose MongoDB over a relational database?"
**Answer:** "Marketplace listings are highly heterogeneous. An electronics listing has different attributes (brand, specs) than a textbook (course, edition). MongoDB's document model allows flexible schemas without sparse tables or complex EAV (Entity-Attribute-Value) anti-patterns. Furthermore, MongoDB's geospatial indexing and full-text search out-of-the-box simplified the MVP."

## 3. Real-Time Chat: Socket.IO vs Long Polling
**Question:** "How did you implement real-time offers and messaging?"
**Answer:** "I used Socket.IO, which wraps WebSockets and falls back to HTTP long-polling if WebSockets are blocked (common on strict university networks). I implemented Socket.IO rooms based on `conversationId`. Security is enforced in a middleware that verifies the JWT before upgrading the connection, ensuring a user can only join rooms they are a participant in."

## 4. Multi-Tenancy Strategy
**Question:** "How does Collex isolate data between different colleges?"
**Answer:** "I used **Logical Multi-Tenancy**. Instead of spinning up a new database per college (which is expensive and hard to migrate), every document (User, Listing) has a `college` field. The backend enforces isolation at the query level (e.g., `Listing.find({ college: req.user.college })`). This ensures a student at Stanford never sees a listing from MIT."

## 5. Machine Learning Integration
**Question:** "Tell me about the Price Intelligence and Collex Shield features."
**Answer:**
- **Price Intelligence:** A Random Forest regressor trained on historical pricing data. It takes features like category, condition, original price, and age, outputting a recommended price range.
- **Collex Shield:** A rule-based risk engine that evaluates listing anomalies (e.g., price > 50% off original, seller has high cancellation ratio) and returns a risk score (LOW, MEDIUM, HIGH) to warn buyers before meeting up.

## 6. Hardest Technical Challenge
**Answer:** "Ensuring consistent tenant isolation and security. When adding features like the Wanted Board or Graduation Bundles, it was critical that users couldn't modify items belonging to other students or view data from other colleges. I solved this by strictly enforcing college filters at the Mongoose query level and verifying resource ownership (`listing.seller.toString() === req.user.id`) in the controllers."

---

## Resume Bullet Options

**Option 1 (Full-Stack Focus):**
- Architected and deployed a multi-tenant hyperlocal campus marketplace using React, Node.js, and MongoDB, supporting secure real-time messaging via Socket.IO and college-isolated product discovery.

**Option 2 (Backend / ML Focus):**
- Built a secure Express.js API gateway routing to a Python/FastAPI microservice for ML-driven price recommendations and real-time scam detection (Collex Shield), utilizing a Random Forest regressor.

**Option 3 (Product / Feature Focus):**
- Engineered signature marketplace features including Course-Aware Discovery, a Wanted Board, and a Barter system, implementing deterministic recommendation algorithms and JWT-based Role-Based Access Control (RBAC).
