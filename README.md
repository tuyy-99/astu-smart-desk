# ASTU SmartDesk

AI-powered campus assistant for Adama Science and Technology University (ASTU), with JWT auth, role-based admin tools, and Retrieval-Augmented Generation (RAG) using MongoDB Atlas Vector Search.

## Key Features
- AI chat assistant backed by document retrieval (RAG)
- English and Amharic conversation support
- JWT authentication and protected API routes
- Role-based access (`student`, `staff`, `admin`)
- Admin/Staff document management (upload, list, delete)
- Chat history sessions per user

## Architecture
- `frontend/`: React + Vite + TypeScript UI
- `backend/`: Express + TypeScript API
- `MongoDB Atlas`: user data, documents, chat history, vector search
- `Voyage AI`: embeddings (`voyage-3-large`)
- `Google Gemini`: response generation (`gemini-2.5-flash`)

## Tech Stack
- Frontend: React, React Router, Vite, Tailwind CSS
- Backend: Node.js, Express, Mongoose, express-validator
- AI: `@google/generative-ai`, Voyage Embeddings API
- Database: MongoDB Atlas + Atlas Vector Search

## Project Structure
```text
astu-smartdesk/
+- frontend/
¦  +- components/
¦  +- services/
¦  +- App.tsx
¦  +- package.json
+- backend/
¦  +- controllers/
¦  +- models/
¦  +- routes/
¦  +- scripts/
¦  +- server.ts
¦  +- .env.example
¦  +- package.json
+- README.md
```

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas cluster
- Voyage API key
- Gemini API key

## Quick Start
### 1. Backend setup
```bash
cd backend
npm install
copy .env.example .env
```

Set these in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
VOYAGE_API_KEY=your_voyage_key
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:3000,http://localhost:3001,http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### 2. Frontend setup
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

## Admin Access
Public signup always creates `student` users. Use the admin script for admin credentials:

```bash
cd backend
npm run create-admin
```

Default admin credentials after script reset/create:
- Email: `admin@astu.edu.et`
- Password: `Admin123!`
- University ID: `ugr/00001/24`

## RAG Configuration
Create Atlas Vector Search index named `vector_search` on `documents.embedding`.

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

## Screenshots
Store screenshots in `docs/screenshots/` and reference them in Markdown.

Example:
```md
![Landing Page](docs/screenshots/landing-page.png)
![Chat Widget](docs/screenshots/chat-widget.png)
![Admin Dashboard](docs/screenshots/admin-dashboard.png)
```

Preview section:

![Landing Page](docs/screenshots/landing-page.png)
![Chat Widget](docs/screenshots/chat-widget.png)
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

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
