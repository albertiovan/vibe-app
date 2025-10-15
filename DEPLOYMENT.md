# 🚀 Vibe App Deployment Guide

This document outlines the deployment process and policies for the Vibe application, following the PRD security and operational requirements.

## 📋 Prerequisites

### Development Environment Setup

1. **Install Node.js (18+)**
   ```bash
   # Using Homebrew (macOS)
   brew install node
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

3. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd vibe-app
   ```

### Required API Keys

1. **RapidAPI TripAdvisor Key**
   - Sign up at [RapidAPI](https://rapidapi.com/)
   - Subscribe to TripAdvisor API
   - Get your API key

2. **Environment Configuration**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your actual values
   ```

## 🔧 Local Development

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

## 🛡️ Security Policies (PRD Compliance)

### Rate Limiting
- **Global**: 300 requests / 15 minutes / IP
- **Auth routes**: 50 requests / 15 minutes / IP  
- **External API**: 60 requests / minute / IP

### Security Headers
- Helmet.js for security headers
- CORS with environment-configured origins
- JSON payload limit: 100KB
- No multipart uploads on public routes

### Error Handling
- Structured JSON error responses
- 5xx error logging with timestamp/route
- No PII in logs

## 🚀 Deployment Process

### Deployment Policy (PRD Requirements)

1. **Deploy from main branch only**
2. **Auto-restart on crash with cooldown**
3. **Revert after 3 consecutive failed runs**
4. **Log all 5xx responses**

### Backend Deployment

#### Option 1: Windsurf Container Runtime
```bash
cd backend
npm run build
npm start
```

#### Option 2: Replit Deployments
1. Import project to Replit
2. Set environment variables
3. Deploy using Replit's deployment system

### Frontend Deployment

#### Development Build
```bash
cd frontend
npx expo start
```

#### Production Build
```bash
# For web
npx expo export:web

# For mobile (requires EAS Build)
npx expo build:android
npx expo build:ios
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/metrics` - System metrics

### Monitoring Setup
```bash
# Check backend health
curl http://localhost:3000/api/health

# Check metrics
curl http://localhost:3000/api/metrics
```

### Log Rotation Policy
- Lightweight logs only (API usage, rate-limit triggers)
- Weekly log rotation
- No PII retention
- 5xx errors logged with timestamp and route

## 🔄 Restart & Recovery Policies

### Auto-Restart Configuration
```javascript
// PM2 ecosystem file example
module.exports = {
  apps: [{
    name: 'vibe-backend',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 5000, // 5 second cooldown
    max_restarts: 3,
    min_uptime: '10s'
  }]
}
```

### Failure Recovery
1. **Single failure**: Auto-restart with 5s cooldown
2. **3 consecutive failures**: Revert to last stable version
3. **Critical failure**: Manual intervention required

## 🌍 Environment Configuration

### Backend Environment Variables
```env
# Server
PORT=3000
NODE_ENV=production

# Security
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300

# External APIs
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=travel-advisor.p.rapidapi.com
```

### Frontend Environment Variables
```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

# Features
EXPO_PUBLIC_ENABLE_DEBUG=false
```

## 📈 Performance Targets (PRD Metrics)

| Metric | Target | Monitoring |
|--------|--------|------------|
| Time-to-first-recommendation | < 4s | API response time |
| Crash-free sessions | > 99% | Error tracking |
| Activity engagement | ≥ 60% | Analytics |
| Rate-limit trigger rate | < 1% | Rate limit logs |

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ORIGINS` environment variable
   - Ensure frontend URL is in allowed origins

2. **Rate Limiting**
   - Monitor rate limit logs
   - Adjust limits if needed (within PRD constraints)

3. **API Failures**
   - Check RapidAPI key validity
   - Monitor external API status

4. **Build Failures**
   - Verify all dependencies are installed
   - Check TypeScript compilation errors

### Debug Commands
```bash
# Backend logs
npm run dev # Development mode with detailed logs

# Frontend debugging
npx expo start --clear # Clear cache and restart

# Health check
curl -v http://localhost:3000/api/health
```

## 🔒 Security Checklist

- [ ] All environment variables configured
- [ ] Rate limiting enabled and tested
- [ ] CORS properly configured
- [ ] No secrets in repository
- [ ] Security headers applied
- [ ] Input validation working
- [ ] Error responses structured
- [ ] Logging excludes PII

## 📝 Deployment Checklist

- [ ] Code reviewed and tested
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Security policies verified
- [ ] Performance targets met
- [ ] Monitoring configured
- [ ] Backup/rollback plan ready

---

**Note**: This deployment guide follows the Vibe PRD security and operational requirements. All security middleware must remain intact and cannot be bypassed or removed.
