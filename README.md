# InsightDocs AI

AI-powered document analysis platform built with the FARM stack (FastAPI + React + MongoDB).  
Upload PDF, DOCX, or TXT files and get instant AI-generated summaries, key findings, methodology breakdowns, and visual data charts.

## Tech Stack

| Layer     | Technology                                      |
|-----------|--------------------------------------------------|
| Frontend  | React 19, Material UI v5, Reflow, Axios        |
| Backend   | FastAPI, Motor (async MongoDB), Pydantic          |
| AI/Agents | LangChain, LangGraph, Google Gemini (free tier)   |
| Database  | MongoDB Atlas                                     |
| Auth      | JWT + bcrypt                                      |

## Features

- **Multi-format upload** – PDF, DOCX, TXT with drag-and-drop
- **AI analysis** – Overview, Methodology, Key Points, Summary
- **Visual charts** – Auto-generated bar/pie charts via Recharts
- **ChatGPT-style sidebar** – History, search, rename, delete
- **Dark/Light theme** – Persistent toggle with MUI ThemeProvider
- **JWT authentication** – Secure signup/login flow
- **Download reports** – Export analysis as text report

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- Google Gemini API key

### 1. Clone & Configure

```bash
git clone <repo-url>
cd ai-research-paper-analyser
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Edit `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/insightdocs?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
```

Start the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. API Endpoints

| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| POST   | `/api/auth/signup`          | Register new user       |
| POST   | `/api/auth/login`           | Authenticate user       |
| POST   | `/api/upload/analyze`       | Upload & analyze file   |
| GET    | `/api/history`              | Get analysis history    |
| GET    | `/api/history/{id}`         | Get specific analysis   |
| PUT    | `/api/history/{id}/rename`  | Rename analysis         |
| DELETE | `/api/history/{id}`         | Delete analysis         |

## Project Structure

```
ai-research-paper-analyser/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Settings from .env
│   ├── database.py           # MongoDB connection
│   ├── requirements.txt
│   ├── .env
│   ├── models/               # Pydantic schemas
│   ├── routes/               # API route handlers
│   ├── services/             # Document parsing
│   ├── agents/               # LangGraph AI pipeline
│   └── utils/                # JWT helpers
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios config
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth & Theme contexts
│   │   ├── pages/            # Route pages
│   │   ├── theme.js          # MUI theme config
│   │   ├── App.jsx           # Router setup
│   │   └── main.jsx          # React entry
│   ├── package.json
│   └── vite.config.js
└── README.md
```
