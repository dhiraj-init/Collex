# Collex — The Trusted Campus Marketplace 🎓

![Collex Cover Image](https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop)

Collex is a premium, multi-tenant marketplace designed exclusively for university students. It solves a crucial problem in campus life: graduating seniors throwing away perfectly good items and incoming freshmen buying expensive new ones. By providing a secure, college-isolated platform, Collex allows students to buy, sell, rent, and barter safely within their own campus community.

---

## ✨ Signature Features

### 🏢 Strict Multi-Tenancy
Users are cryptographically isolated to their specific campus environment. A student at Stanford cannot see listings or interact with students from MIT. This ensures hyperlocal relevance and builds community trust.

### 🔄 The Barter System
No cash? No problem. The Barter System allows users to propose direct item exchanges ("I have X, I want Y") and even include optional cash adjustments (e.g., "I'll trade my TI-84 Calculator and pay ₹500 for your iPad"). 

### 🎯 Wanted Board
A dedicated space for students to post requests. If a student needs a specific textbook or piece of lab equipment, they can post their budget and requirements, allowing sellers to fulfill the need directly.

### 📊 Campus Admin Dashboard
Institutional oversight built right in. Users with the `COLLEGE_ADMIN` role have access to a real-time metrics dashboard tracking active students, listings, estimated campus savings, and moderation queues for reported items.

### 🧠 Machine Learning Integration
- **Price Intelligence Engine:** A FastAPI Python service that analyzes listing features to predict and suggest fair market price ranges for sellers in real-time.
- **Collex Shield:** An automated risk-assessment engine that scans listings for potential scams, suspicious anomalies, and restricted keywords, warning buyers before they engage.

### 💬 Real-Time Communication
Secure Socket.IO chat rooms allow buyers and sellers to negotiate offers, share meetup locations, and securely close deals without exchanging personal phone numbers.

---

## 🏗️ Architecture & Technology Stack

Collex utilizes a modern, decoupled Monolith + Sidecar architecture.

```mermaid
graph TD
    Client[React + Vite + Tailwind] <-->|REST API & WebSockets| NodeGateway[Node.js + Express API]
    NodeGateway <-->|Mongoose| MongoDB[(MongoDB Atlas)]
    NodeGateway <-->|HTTP| MLService[Python FastAPI Service]
```

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Socket.IO, JWT Auth |
| **Database** | MongoDB (Mongoose) |
| **ML Service** | Python 3.11, FastAPI, scikit-learn, pandas |
| **Testing** | Node.js native test runner, Supertest |
| **DevOps** | Docker, Docker Compose |

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v20+)
- Python (v3.11+)
- Docker (optional, for running everything at once)
- MongoDB instance (local or Atlas)

### 1. Clone & Install
```bash
git clone https://github.com/dhiraj-init/Collex.git
cd Collex

# Install all dependencies across the monorepo
npm install
npm --prefix server install
npm --prefix client install

# Setup Python environment
cd ml-service
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Environment Variables
Create a `.env` file in the `server` directory. Use the provided MongoDB Atlas string for immediate database access:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://dhirajtech02_db_user:FoHiRQUG9EbnstGR@cluster0.w9zbmgk.mongodb.net/?appName=Cluster0
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ML_SERVICE_URL=http://localhost:8000
```

### 3. Run Development Servers

**Run the entire Node + React stack:**
```bash
npm run dev:server
npm run dev:client
```

**Run the Python ML Service (in a separate terminal):**
```bash
cd ml-service
# ensure venv is activated
uvicorn main:app --reload --port 8000
```

### 4. Running with Docker Compose (Alternative)
If you prefer running the entire stack in isolated containers:
```bash
docker-compose up -d --build
```
The application will be served at `http://localhost:80`.

---

## 📚 Technical Documentation

Deep dive into the engineering decisions and architecture behind Collex:

- 🔐 [Security & Auth Architecture](./docs/SECURITY.md)
- 🏢 [Multi-Tenancy Setup](./docs/MULTI_TENANCY.md)
- 🧠 [Price Intelligence ML Model](./docs/PRICE_MODEL.md)
- 🛡️ [Collex Shield Anti-Fraud Engine](./docs/COLLEX_SHIELD.md)
- 🎤 [Interview Talking Points](./docs/INTERVIEW_GUIDE.md)

---

## 🔮 Future Roadmap
1. Migrate from `bcrypt` to `Argon2` for enhanced password security.
2. Implement Redis for caching heavily accessed public campus listings.
3. Replace deterministic recommendations with a collaborative filtering ML model.
4. Integrate Cloudinary for scalable image uploads instead of storing raw base64.
