# Collex 🎓

> **Hyperlocal campus marketplace exclusively for verified college students.**  
> Buy, sell, rent, exchange, and giveaway items securely within your university community.

---

## ⚡ Technical Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Helmet, CORS
- **Database:** MongoDB Atlas / Local with Mongoose ODM
- **Realtime (Upcoming):** Socket.IO
- **Media Storage (Upcoming):** Cloudinary
- **Authentication (Upcoming):** JWT with campus email domain verification
- **Machine Learning (Roadmap):** Python, FastAPI, scikit-learn

---

## 📁 Repository Structure

```text
Collex/
├── client/              # React 19 + TypeScript frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── config/      # Typed environment variables
│   │   ├── services/    # API client layer (apiClient.ts)
│   │   └── types/       # Domain interfaces & API envelopes
│   ├── .env.example     # Client environment variable template
│   └── package.json
│
├── server/              # Express + TypeScript backend application
│   ├── src/
│   │   ├── config/      # Database (Mongoose) & Environment config
│   │   ├── controllers/ # Route handlers (healthController.ts)
│   │   ├── middlewares/ # Centralized error handling, request logging, 404
│   │   ├── routes/      # API routers (/api/v1/health)
│   │   └── utils/       # Custom AppError, Logger, API response envelope
│   ├── .env.example     # Server environment variable template
│   └── package.json
│
├── docs/
│   └── ARCHITECTURE.md  # Detailed architectural specification & data models
│
├── LEARNING_NOTES.md    # Concepts, interview prep, and command reference
├── .env.example         # Root monorepo environment template
└── package.json         # Workspace scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **npm**: v10 or higher (`npm -v`)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

### 2. Environment Setup
Copy the environment example files:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Ensure your `server/.env` contains your MongoDB URI:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/collex
API_PREFIX=/api/v1
```

### 3. Run Development Servers
From the root directory:

```bash
# Start backend API (runs on http://localhost:5000)
npm run dev:server

# In a separate terminal, start frontend client (runs on http://localhost:5173)
npm run dev:client
```

### 4. Build and Lint Verification
```bash
# Build both client and server
npm run build

# Lint both client and server
npm run lint
```

---

## 🩺 System Health Check

The backend exposes a structured health endpoint at:
`GET http://localhost:5000/api/v1/health`

Example response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "All systems operational",
  "data": {
    "service": "collex-api",
    "status": "healthy",
    "version": "0.1.0",
    "environment": "development",
    "uptimeSeconds": 42,
    "database": {
      "connected": true,
      "state": "connected",
      "code": 1
    },
    "system": {
      "nodeVersion": "v22.23.1",
      "platform": "win32",
      "memoryUsageMB": {
        "rss": 76.02,
        "heapUsed": 18.47,
        "heapTotal": 36.19
      }
    }
  }
}
```

---

## 📚 Documentation & Learning
- [System Architecture & 10 Data Model Proposals](file:///c:/Users/Dhiraj%20Behera/Desktop/Collex/docs/ARCHITECTURE.md)
- [Phase 0 Learning Notes & Interview Preparation](file:///c:/Users/Dhiraj%20Behera/Desktop/Collex/LEARNING_NOTES.md)
