# ASTU SmartDesk

An AI-powered campus assistant for Adama Science and Technology University (ASTU), featuring intelligent document retrieval, multilingual support, and comprehensive administrative tools.

<!-- Add banner screenshot here -->

## Overview

ASTU SmartDesk is a full-stack web application that leverages Retrieval-Augmented Generation (RAG) to provide accurate, context-aware responses to student queries. The system combines MongoDB Atlas Vector Search, Voyage AI embeddings, and Google Gemini to deliver a seamless conversational experience in both English and Amharic.

## Key Features

### For Students
- 🤖 **AI Chat Assistant** - Get instant answers about university services, procedures, and policies
- 🌍 **Multilingual Support** - Converse in English or Amharic (አማርኛ)
- 📚 **Document-Backed Responses** - All answers are grounded in official university documents
- 💬 **Chat History** - Access previous conversations and continue where you left off
- 🔍 **Smart Search** - Vector-based semantic search finds relevant information accurately

### For Administrators
- 📄 **Document Management** - Upload, organize, and delete knowledge base documents
- 👥 **User Management** - Role-based access control (student, staff, admin)
- 📊 **Analytics Dashboard** - Monitor system usage and document performance
- 🔐 **Secure Authentication** - JWT-based authentication with protected routes

### Technical Highlights
- ⚡ **Fast Response Times** - Optimized vector search and caching
- 🔒 **Enterprise Security** - JWT authentication, role-based access, CORS protection
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🚀 **Scalable Architecture** - Built on MongoDB Atlas with vector search capabilities

## Screenshots

### Landing Page
<img width="1366" height="2135" alt="screencapture-localhost-3000-2026-02-14-21_17_59" src="https://github.com/user-attachments/assets/dc473a8c-8044-4885-89b9-9a164183467a" />

<img width="1366" height="2092" alt="screencapture-localhost-3000-2026-02-14-22_24_16" src="https://github.com/user-attachments/assets/3f2d14df-2068-4172-b481-7390f624f7d4" />



### Chat Interface
<img width="512" height="554" alt="image" src="https://github.com/user-attachments/assets/b26520f8-cd4a-4488-ba69-4b7facad4540" />


### Admin Dashboard
<img width="1366" height="805" alt="screencapture-localhost-3000-2026-02-14-22_29_09" src="https://github.com/user-attachments/assets/cf64dfde-010b-4443-b840-ff638c9a6e69" />

### Mobile View
<img width="285" height="565" alt="image" src="https://github.com/user-attachments/assets/da9cda12-a6db-46f0-9d13-937de8fe9f8e" />

### Authentication
<img width="1366" height="688" alt="screencapture-localhost-3000-2026-02-14-22_26_40" src="https://github.com/user-attachments/assets/1570fa1e-04ad-4c43-a1c2-f690de0ca165" />

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│                 │      │                 │      │                  │
│  React Frontend │─────▶│  Express API    │─────▶│  MongoDB Atlas   │
│  (Vite + TS)    │      │  (Node.js + TS) │      │  + Vector Search │
│                 │      │                 │      │                  │
└─────────────────┘      └─────────────────┘      └──────────────────┘
                                │
                                │
                    ┌───────────┴───────────┐
                    │                       │
              ┌─────▼──────┐         ┌─────▼──────┐
              │            │         │            │
              │ Voyage AI  │         │   Gemini   │
              │ Embeddings │         │    API     │
              │            │         │            │
              └────────────┘         └────────────┘
```

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: MongoDB Atlas with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Processing**: Multer, pdf-parse

### AI & ML
- **Embeddings**: Voyage AI (voyage-3-large, 1024 dimensions)
- **LLM**: Google Gemini (gemini-pro)
- **Vector Search**: MongoDB Atlas Vector Search

## Project Structure

```
astu-smartdesk/
├── frontend/
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── Auth.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── LandingPage.tsx
│   │   └── Navbar.tsx
│   ├── services/
│   │   └── backendApi.ts
│   ├── public/
│   │   └── assets/
│   ├── App.tsx
│   ├── index.tsx
│   ├── types.ts
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── chatController.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Document.ts
│   │   └── ChatHistory.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   └── chat.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── utils/
│   │   ├── textProcessing.ts
│   │   └── vectorUtils.ts
│   ├── config/
│   │   └── db.ts
│   ├── scripts/
│   │   └── createAdmin.ts
│   ├── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   └── screenshots/
├── README.md
└── .gitignore
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **MongoDB Atlas** account with a cluster
- **Voyage AI** API key ([Get one here](https://www.voyageai.com/))
- **Google Gemini** API key ([Get one here](https://aistudio.google.com/app/apikey))

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

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Configure your environment variables in `backend/.env`:

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

Create a `.env.local` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. MongoDB Atlas Vector Search Setup

Create a vector search index on your MongoDB Atlas cluster:

1. Navigate to your cluster in MongoDB Atlas
2. Go to the "Search" tab
3. Click "Create Search Index"
4. Choose "JSON Editor"
5. Use the following configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

6. Name the index: `vector_search`
7. Select the `documents` collection

For detailed instructions, see `backend/SETUP_ATLAS.md`


## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage Guide

### For Students

1. **Sign Up**: Create an account using your university email
2. **Login**: Access the chat interface
3. **Ask Questions**: Type your question in English or Amharic
4. **View Sources**: See which documents were used to answer your question
5. **Chat History**: Access previous conversations from the sidebar

### For Administrators

1. **Login**: Use your admin credentials
2. **Access Admin Dashboard**: Click on "Admin Dashboard" in the navigation
3. **Upload Documents**: 
   - Click "Upload Document"
   - Enter title, content, and category
   - Add relevant tags
   - Submit
4. **Manage Documents**: View, search, and delete documents
5. **Monitor Usage**: Check document view counts and user activity

## Configuration

### Document Categories

The system supports the following document categories:
- `registrar` - Registrar office procedures
- `academic` - Academic policies and guidelines
- `department` - Department-specific information
- `fees` - Fee structures and payment information
- `deadline` - Important dates and deadlines
- `lab` - Laboratory and facility information
- `internship` - Internship opportunities and guidelines
- `service` - Campus services
- `policy` - University policies
- `other` - Miscellaneous information

### Chat Modes

- `general` - Standard Q&A mode
- `where-to-go` - Provides office locations and required documents
- `deadline` - Highlights important dates and timelines

## Security Best Practices

### Production Deployment

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, randomly generated secret (minimum 32 characters)
3. **API Keys**: Rotate API keys regularly and restrict by IP if possible
4. **CORS**: Configure `FRONTEND_URL` to only allow your production domain
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Implement rate limiting on API endpoints
7. **Input Validation**: All inputs are validated using express-validator
8. **MongoDB**: Use MongoDB Atlas with IP whitelisting and strong passwords

### API Key Security

If you accidentally expose an API key:
1. Immediately revoke the key in the respective service dashboard
2. Generate a new key
3. Update your `.env` file
4. Restart the backend server

## Troubleshooting

### Common Issues

**Issue**: "Failed to connect to MongoDB"
- **Solution**: Check your `MONGODB_URI` in `.env` and ensure your IP is whitelisted in MongoDB Atlas

**Issue**: "Gemini API key is invalid"
- **Solution**: Verify your API key at https://aistudio.google.com/app/apikey

**Issue**: "Vector search returned no results"
- **Solution**: Ensure the vector search index is created correctly in MongoDB Atlas

**Issue**: "CORS error when calling API"
- **Solution**: Add your frontend URL to `FRONTEND_URL` in backend `.env`

**Issue**: "No documents found"
- **Solution**: Upload documents through the admin dashboard first

### Debug Mode

Enable detailed logging by setting in `backend/.env`:
```env
NODE_ENV=development
```

## Performance Optimization

- **Caching**: Implement Redis caching for frequently accessed documents
- **Indexing**: Ensure MongoDB indexes are created on frequently queried fields
- **Chunking**: Large documents are automatically chunked for better retrieval
- **Connection Pooling**: MongoDB connection pooling is enabled by default

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Adama Science and Technology University (ASTU)
- Google Gemini AI
- Voyage AI
- MongoDB Atlas
- The open-source community

## Support

For support, email support@astu.edu.et or open an issue in the GitHub repository.

## Roadmap

- [ ] Voice input support
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support for other universities
- [ ] Integration with university ERP system
- [ ] Automated document updates from official sources
- [ ] Student feedback and rating system

---

**Built with ❤️ for ASTU Students**
