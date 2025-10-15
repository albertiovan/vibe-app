# 🌊 Vibe - AI-Powered Activity Recommendation App

Vibe is a minimalist, AI-powered mobile application that recommends real-world activities in Romania based on the user's current mood. Users simply describe how they're feeling, and Vibe suggests personalized activities from cafés and hiking trails to creative workshops and adventure sports.

## ✨ Features

- **AI Mood Parsing**: Rule-based NLP that interprets user vibes into actionable activity categories
- **Real-time Recommendations**: Live data from TripAdvisor API via secure server proxy
- **Beautiful UI**: Light, minimal design with smooth animations using Moti/Reanimated
- **Smart Filtering**: Location-based, price-level, and category filtering
- **Security-First**: Comprehensive rate limiting, input validation, and error handling

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, npm, and Expo CLI

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd vibe-app
   ```

2. **Backend setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your RapidAPI key
   npm run dev
   ```

3. **Frontend setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with API base URL
   npx expo start
   ```

4. **Get API Key**: Sign up at [RapidAPI](https://rapidapi.com/) and subscribe to TripAdvisor API

📖 **Detailed Setup**: See [SETUP.md](SETUP.md) for complete instructions

## 📁 Project Structure

```
vibe-app/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints (/health, /recommendations)
│   │   ├── services/     # Business logic (mood parsing, TripAdvisor)
│   │   ├── middleware/   # Security, validation, rate limiting
│   │   └── types/        # TypeScript interfaces
│   └── package.json
├── frontend/             # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/      # HomeScreen, ResultsScreen
│   │   ├── components/   # VibeInput, ActivityCard, LoadingShimmer
│   │   ├── services/     # API client
│   │   └── types/        # Shared type definitions
│   └── package.json
├── README.md             # This file
├── PRD.md               # Product Requirements Document
├── SETUP.md             # Quick setup guide
└── DEPLOYMENT.md        # Deployment and security policies
```

## 🛡️ Security & Compliance

Following strict PRD security requirements:

- **Rate Limiting**: 300/15min global, 50/15min auth, 60/min external API
- **Input Validation**: Zod schemas with sanitization
- **Security Headers**: Helmet.js with CSP
- **CORS Protection**: Environment-configured origins
- **Error Handling**: Structured JSON responses, no PII logging
- **Payload Limits**: 100KB JSON limit, no multipart uploads

## 🏗️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native + Expo, TypeScript, NativeWind, Moti |
| **Backend** | Node.js + Express, TypeScript, Helmet, CORS, Zod |
| **External APIs** | TripAdvisor via RapidAPI |
| **AI/NLP** | Rule-based mood parsing (v1) |
| **Deployment** | Windsurf container runtime |
| **Monitoring** | Health endpoints, structured logging |

## 🎯 API Endpoints

### Backend API
- `GET /api/health` - Health check
- `GET /api/metrics` - System metrics
- `POST /api/recommendations` - Get activity recommendations
- `POST /api/parse-mood` - Parse mood from vibe text

### Example Usage
```bash
# Test mood parsing
curl -X POST http://localhost:3000/api/parse-mood \
  -H "Content-Type: application/json" \
  -d '{"vibe": "I feel adventurous"}'

# Get recommendations
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"vibe": "I want something cozy", "city": "Bucharest, Romania"}'
```

## 🎨 Design Language

- **Visual**: Light, minimal, smooth transitions
- **Typography**: Inter font family, rounded and readable
- **Colors**: Primary blue (#0ea5e9), light gray palette
- **Aesthetic**: ChatGPT × Instagram Direct - immersive yet clean
- **Animations**: Subtle, purposeful motion with Moti/Reanimated

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Time-to-first-recommendation | < 4s | ✅ Optimized |
| Crash-free sessions | > 99% | ✅ Error handling |
| Activity engagement | ≥ 60% | 📊 To measure |
| Rate-limit trigger rate | < 1% | ✅ Configured |

## 🔄 Development Workflow

1. **Code Changes**: TypeScript everywhere, minimal edits
2. **Security**: Never remove rate limiting or validation middleware
3. **Testing**: Health checks, API validation, mood parsing tests
4. **Deployment**: From main branch only, auto-restart with cooldown
5. **Monitoring**: 5xx logging, metrics endpoints, no PII

## 🌍 Deployment

- **Development**: Local with hot reloading
- **Production**: Windsurf container runtime or Replit
- **Mobile**: Expo development builds
- **Monitoring**: Health endpoints and structured logging

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

## 📝 Contributing

1. Follow PRD security requirements (never remove security middleware)
2. Use TypeScript with strict mode
3. Maintain structured error responses
4. Keep changes minimal and purposeful
5. Test all security policies

## 🔗 Documentation

- [PRD.md](PRD.md) - Complete product requirements and security rules
- [SETUP.md](SETUP.md) - Quick setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment and operational policies

## 📄 License

MIT License - Built for discovering Romania's amazing activities! 🇷🇴
