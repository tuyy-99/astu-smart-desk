# ASTU SmartDesk Frontend

## Prerequisites
- Node.js 18+
- Backend API running (`../backend`)

## Environment
Create/update `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Run
```bash
cd frontend
npm install
npm run dev
```

## Notes
- Auth now uses backend JWT endpoints.
- Chat requests use `POST /api/chat/ask`.
- Admin document management uses backend document endpoints.
