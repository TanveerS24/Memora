# 💖 Memora – Our Love Archive

A privacy-first, multimodal AI-powered relationship memory assistant using a local LLM.

## 🏗️ Architecture

Microservices-based system with 9 services:

- **auth-service** – User authentication and JWT tokens
- **partner-service** – Partner matching and couple management
- **chat-service** – Real-time WebSocket messaging
- **memory-service** – Memory ingestion, storage, and pipeline
- **rag-service** – Retrieval-augmented generation with local LLM
- **media-service** – Image and audio processing
- **insight-service** – Analytics and relationship insights
- **scheduler-service** – Reminders and daily love feed
- **gateway-service** – API gateway for routing

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python) – All microservices
- **PostgreSQL** – Relational database
- **ChromaDB** – Vector database for embeddings
- **Ollama** – Local LLM (llama3.1:8b, nomic-embed-text)

### Frontend
- **React Native** – Primary mobile app
- **React.js** – Web application

### Deployment
- **Docker** + **docker-compose**

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend)
- Python 3.11+ (for local development)

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd Memora

# Start all services
docker-compose up -d

# Wait for services to initialize (Ollama needs to pull models)
docker-compose logs -f
```

### Frontend Setup

#### React Native App

```bash
cd frontend/mobile-app

# Install dependencies
npm install

# For iOS
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### Web App

```bash
cd frontend/web-app

# Install dependencies
npm install

# Start development server
npm start
```

## 📁 Project Structure

```
Memora/
├── docker-compose.yml
├── services/
│   ├── auth-service/
│   ├── partner-service/
│   ├── chat-service/
│   ├── memory-service/
│   ├── rag-service/
│   ├── media-service/
│   ├── insight-service/
│   ├── scheduler-service/
│   └── gateway-service/
├── shared/
│   ├── models/          # Shared database models
│   ├── schemas/         # Pydantic schemas
│   └── utils/           # Shared utilities
└── frontend/
    ├── mobile-app/      # React Native
    └── web-app/         # React.js
```

## 🔐 API Endpoints

All APIs are accessible through the gateway at `http://localhost:8000`

### Authentication
- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Login and get JWT token
- `GET /api/auth/me` – Get current user info

### Partner
- `POST /api/partner/search` – Search partner by UID/username
- `POST /api/partner/request` – Send partner request
- `POST /api/partner/accept` – Accept partner request
- `POST /api/partner/reject` – Reject partner request
- `GET /api/partner/info` – Get partner info

### Chat
- `WS /api/chat/ws` – WebSocket connection for real-time chat
- `GET /api/chat/history` – Get chat history
- `POST /api/chat/send` – Send message (fallback)

### Memory
- `POST /api/memory/ingest` – Ingest new memory
- `POST /api/memory/confirm` – Confirm and save memory
- `GET /api/memory/timeline` – Get memory timeline
- `GET /api/memory/active` – Get active memories
- `GET /api/memory/archived` – Get archived memories
- `POST /api/memory/timecapsule` – Create time capsule

### RAG
- `POST /api/rag/query` – Query memories with AI
- `POST /api/rag/loveletter` – Generate love letter
- `POST /api/rag/caption` – Generate caption
- `POST /api/rag/summary` – Generate summary

### Insights
- `GET /api/insights/trends` – Get communication trends
- `GET /api/insights/emotions` – Get emotion trends
- `GET /api/insights/activity` – Get activity frequency

### Scheduler
- `GET /api/scheduler/lovefeed` – Get daily love feed
- `POST /api/scheduler/reminders` – Set up reminders
- `GET /api/scheduler/upcoming` – Get upcoming events

## 🧠 AI Models

### Local LLM (Ollama)
- **llama3.1:8b** – Text generation
- **nomic-embed-text** – Text embeddings

### RAG Pipeline
1. Embed query using nomic-embed-text
2. Retrieve top 5-8 relevant memories from ChromaDB
3. Filter by memory layer (ACTIVE/ARCHIVED)
4. Generate response using llama3.1:8b

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Privacy-first design (no automatic saves)
- Time capsules locked until unlock date

## 📱 Frontend Features

### React Native App
- Gender-based theming (blue/pink gradients)
- WhatsApp-style chat interface
- Memory upload with preview
- Monthly timeline view
- Daily love feed with animations
- Relationship insights dashboard
- Time capsule with countdown
- Real-time shared notes

### Web App
- All mobile features optimized for desktop
- Responsive design
- Same API integration

## 🧪 Development

### Running Individual Services

```bash
# Run specific service
docker-compose up auth-service

# Run with logs
docker-compose up auth-service --build
```

### Database Migrations

```bash
# Access PostgreSQL
docker-compose exec postgres psql -U memora -d memora
```

### Testing

```bash
# Run backend tests
cd services/<service-name>
pytest

# Run frontend tests
cd frontend/mobile-app
npm test
```

## 📝 Environment Variables

Key environment variables (see docker-compose.yml):

- `POSTGRES_URL` – PostgreSQL connection string
- `JWT_SECRET` – Secret key for JWT tokens
- `CHROMA_URL` – ChromaDB connection URL
- `OLLAMA_URL` – Ollama service URL
- `SERVICE_PORT` – Port for each service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License – See LICENSE file for details

## 💖 Made with Love

Built for couples who want to cherish their memories together.
