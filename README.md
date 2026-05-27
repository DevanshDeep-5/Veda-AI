# Veda AI — Production-Grade AI Assessment Creator

A full-stack, AI-powered platform for educators to create structured exam papers in seconds. Built with Next.js, Express, MongoDB, Redis, BullMQ, Socket.io, and OpenAI GPT-4o.

---

## Architecture

```
Frontend (Next.js 14 + TypeScript + Tailwind + Zustand + Socket.io)
  └── /create          → Assignment creation form
  └── /assignments     → List of all papers
  └── /assignments/[id] → Real-time progress + generated paper view

Backend (Express + TypeScript + MongoDB + Redis + BullMQ + Socket.io)
  └── POST /assignments/create        → Create + enqueue
  └── GET  /assignments/:id          → Fetch with paper
  └── GET  /assignments              → List all
  └── POST /assignments/:id/regenerate → Re-queue
  └── GET  /assignments/:id/pdf      → Download PDF

Queue Pipeline (BullMQ + Redis)
  └── generation-started → ai-processing → parsing-output → pdf-generating → completed
```

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS |
| State       | Zustand                              |
| WebSocket   | Socket.io (client + server)          |
| Backend     | Express.js, TypeScript               |
| Database    | MongoDB (native driver, no ORM)      |
| Cache/Queue | Redis + BullMQ                       |
| AI          | OpenAI GPT-4o (JSON mode + Zod)      |
| PDF         | pdfkit (server-side)                 |

---

## Project Structure

```
veda-ai/
├── apps/
│   ├── web/                      # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── assignments/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── components/
│   │   │   ├── forms/            # AssignmentForm, DifficultySlider, FileUpload
│   │   │   ├── layout/           # Header
│   │   │   ├── paper/            # PaperView, QuestionCard, DifficultyBadge
│   │   │   └── progress/         # GenerationProgress
│   │   ├── hooks/                # useSocket, useAssignment
│   │   ├── lib/                  # utils (cn)
│   │   ├── services/             # api.ts
│   │   ├── sockets/              # socketClient.ts
│   │   ├── stores/               # Zustand stores
│   │   └── types/                # Type re-exports
│   │
│   └── server/                   # Express backend
│       └── src/
│           ├── config/           # db, redis, openai
│           ├── controllers/      # assignmentController
│           ├── models/           # Assignment, GeneratedPaper
│           ├── queues/           # assignmentQueue
│           ├── routes/           # assignments router
│           ├── schemas/          # paperSchema (Zod)
│           ├── services/         # aiService, pdfService
│           ├── sockets/          # socketManager
│           ├── utils/            # logger
│           ├── workers/          # assignmentWorker
│           └── index.ts          # app entrypoint
│
└── packages/
    └── types/                    # Shared TypeScript interfaces
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- OpenAI API key

### Install prerequisites (macOS)

```bash
# MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Redis
brew install redis
brew services start redis
```

---

## Setup & Installation

### 1. Clone and install

```bash
git clone <repo-url>
cd veda-ai
npm install
```

### 2. Configure backend environment

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/veda-ai
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key-here
FRONTEND_URL=http://localhost:3000
PDF_OUTPUT_DIR=./pdfs
NODE_ENV=development
```

### 3. Configure frontend environment

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

`apps/web/.env.local` (defaults work for local dev):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

### 4. Start development

```bash
# From repo root — starts both frontend and backend
npm run dev
```

Or separately:
```bash
# Backend only
cd apps/server && npm run dev

# Frontend only
cd apps/web && npm run dev
```

---

## Usage

1. Open `http://localhost:3000`
2. Click **"Create Paper"**
3. Fill in: title, subject, question types, difficulty distribution
4. Click **"Generate Question Paper"**
5. Watch real-time progress (queued → AI → parsing → PDF)
6. View the formatted exam paper
7. Click **"Download PDF"** to get the print-ready PDF

---

## WebSocket Events

| Event               | Description                        |
|---------------------|------------------------------------|
| `job-queued`        | Request added to Redis queue        |
| `generation-started`| Worker picked up the job           |
| `ai-processing`     | OpenAI API call in progress        |
| `parsing-output`    | Validating & saving AI response    |
| `pdf-generating`    | pdfkit generating PDF              |
| `completed`         | Done — paper + PDF ready           |
| `failed`            | Error occurred (with message)      |

---

## API Reference

| Method | Endpoint                      | Description                  |
|--------|-------------------------------|------------------------------|
| POST   | `/assignments/create`         | Create + queue generation    |
| GET    | `/assignments`                | List all assignments          |
| GET    | `/assignments/:id`            | Get assignment + paper        |
| POST   | `/assignments/:id/regenerate` | Re-queue generation           |
| GET    | `/assignments/:id/pdf`        | Download PDF                  |
| GET    | `/health`                     | Health check                  |

---

## Production Deployment

### Backend
```bash
cd apps/server
npm run build
NODE_ENV=production node dist/index.js
```

### Frontend
```bash
cd apps/web
npm run build
npm start
```

Update environment variables for production:
- `MONGODB_URI` → MongoDB Atlas connection string
- `REDIS_URL` → Upstash Redis URL
- `FRONTEND_URL` → your production domain
- `NEXT_PUBLIC_API_URL` → your backend URL
- `NEXT_PUBLIC_SOCKET_URL` → your backend URL

---

## Screen-Recording



https://github.com/user-attachments/assets/a5c6af12-add3-4866-95cb-75a42003f1a6





## License

MIT
