# ASTU SmartDesk

AI-powered campus assistant for Adama Science and Technology University (ASTU). The app provides multilingual chat, document-based answers (RAG), and admin tools for managing knowledge sources.

<img width="1366" height="2135" alt="screencapture-localhost-3000-2026-02-14-21_17_59" src="https://github.com/user-attachments/assets/18edfa42-1a82-406c-9d3f-8d1c07c032f3" />


## Overview
ASTU SmartDesk is a full-stack web application that uses Retrieval-Augmented Generation (RAG) to answer student questions with context from uploaded documents. It combines MongoDB Atlas Vector Search, Voyage AI embeddings, and Google Gemini to deliver responses in English and Amharic.

## Key Features
- AI chat assistant backed by document retrieval (RAG)
- English and Amharic conversation support
- JWT authentication and protected API routes
- Role-based access: `student`, `staff`, `admin`
- Admin/Staff document management (upload, list, delete)
- Chat history sessions per user

## Architecture
```
+-------------------+      +-------------------+      +----------------------+
|  React Frontend   | ---> |   Express API     | ---> |   MongoDB Atlas      |
|  (Vite + TS)      |      |  (Node.js + TS)   |      | + Vector Search      |
+-------------------+      +-------------------+      +----------------------+
                                   |
                                   |
                     +---------------------------+
                     |   AI Services            |
                     | - Voyage AI Embeddings   |
                     | - Google Gemini          |
                     +---------------------------+
```

## Tech Stack
### Frontend
- Framework: React 19 with TypeScript
- Build Tool: Vite 6
- Routing: React Router DOM 7
- Styling: Tailwind CSS 3
- HTTP Client: Fetch API

### Backend
- Runtime: Node.js 18+
- Framework: Express.js 4
- Language: TypeScript 5
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT (`jsonwebtoken`)
- Validation: `express-validator`
- File Processing: Multer, `pdf-parse`

### AI & ML
- Embeddings: Voyage AI (`voyage-3-large`, 1024 dimensions)
- LLM: Google Gemini (`gemini-pro`)
- Vector Search: MongoDB Atlas Vector Search

## Project Structure
```
astu-smartdesk/
├─ frontend/
│  ├─ components/
│  │  ├─ AdminDashboard.tsx
│  │  ├─ Auth.tsx
│  │  ├─ ChatWidget.tsx
│  │  ├─ LandingPage.tsx
│  │  └─ Navbar.tsx
│  ├─ services/
│  │  └─ backendApi.ts
│  ├─ public/
│  │  └─ assets/
│  ├─ App.tsx
│  ├─ index.tsx
│  ├─ types.ts
│  ├─ package.json
│  └─ vite.config.ts
├─ backend/
│  ├─ controllers/
│  │  ├─ authController.ts
│  │  └─ chatController.ts
│  ├─ models/
│  │  ├─ User.ts
│  │  ├─ Document.ts
│  │  └─ ChatHistory.ts
│  ├─ routes/
│  │  ├─ auth.ts
│  │  └─ chat.ts
│  ├─ middleware/
│  │  └─ auth.ts
│  ├─ utils/
│  │  ├─ textProcessing.ts
│  │  └─ vectorUtils.ts
│  ├─ config/
│  │  └─ db.ts
│  ├─ scripts/
│  │  └─ createAdmin.ts
│  ├─ server.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ docs/
│  └─ screenshots/
├─ README.md
└─ .gitignore
```

## Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB Atlas account with a cluster
- Voyage AI API key
- Google Gemini API key

## Installation
### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/astu-smartdesk.git
cd astu-smartdesk
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend`:
```bash
cp .env.example .env
```

Configure `backend/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/astu-smartdesk

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AI Services
VOYAGE_API_KEY=your_voyage_api_key
GEMINI_API_KEY=your_gemini_api_key

# CORS
FRONTEND_URL=http://localhost:5173,http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```


## RAG Configuration
Create an Atlas Vector Search index named `vector_search` on `documents.embedding`.

See full guide: `backend/SETUP_ATLAS.md`

## API Overview
### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Chat / RAG
- `POST /api/chat/ask`
- `POST /api/chat/upload/text` (admin/staff)
- `POST /api/chat/upload/file` (admin/staff)
- `GET /api/chat/documents`
- `DELETE /api/chat/documents/:id` (admin/staff)
- `GET /api/chat/history`
- `GET /api/chat/history/:sessionId`
- `DELETE /api/chat/history/:sessionId`



## Security Notes
- Do not commit real `.env` secrets.
- Rotate exposed API keys immediately.
- Use strong production JWT secrets and restricted CORS origins.

## Scripts
### Frontend (`frontend/package.json`)
- `npm run dev`
- `npm run build`
- `npm run preview`

### Backend (`backend/package.json`)
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run type-check`
- `npm run create-admin`
