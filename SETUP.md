# 🌊 Vibe App - Quick Setup Guide

## Prerequisites

You'll need Node.js (18+) and npm installed. If you don't have them:

### macOS
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Expo CLI globally
npm install -g @expo/cli
```

### Windows/Linux
Download Node.js from [nodejs.org](https://nodejs.org/) and install Expo CLI:
```bash
npm install -g @expo/cli
```

## 🚀 Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```

**Edit `.env` file with your API keys:**
- Get RapidAPI key from [rapidapi.com](https://rapidapi.com/)
- Subscribe to TripAdvisor API
- Add your key to `RAPIDAPI_KEY`

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

**Edit `.env` file:**
- Set `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api`

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npx expo start
```

### 4. Test the App

1. Backend health check: http://localhost:3000/api/health
2. Open Expo app on your phone and scan QR code
3. Or press 'w' to open in web browser

## 🔑 Required API Keys

### RapidAPI TripAdvisor
1. Go to [RapidAPI TripAdvisor](https://rapidapi.com/apidojo/api/travel-advisor/)
2. Subscribe to the API (free tier available)
3. Copy your API key
4. Add to backend `.env` file

## 📱 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:3000/api/health

# Test mood parsing
curl -X POST http://localhost:3000/api/parse-mood \
  -H "Content-Type: application/json" \
  -d '{"vibe": "I feel adventurous"}'

# Test recommendations (requires API key)
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"vibe": "I want something cozy", "city": "Bucharest, Romania"}'
```

### Test Frontend
1. Open app on device/simulator
2. Type a vibe like "I feel adventurous"
3. Should get activity recommendations

## 🛠️ Development Tips

### Backend Development
- Uses `tsx watch` for hot reloading
- TypeScript strict mode enabled
- All security middleware pre-configured

### Frontend Development
- Uses Expo for easy mobile development
- NativeWind for Tailwind CSS styling
- Moti for smooth animations

### Common Issues

**"Command not found: npx"**
- Install Node.js first

**CORS errors**
- Check backend CORS_ORIGINS in .env
- Make sure frontend URL is allowed

**API errors**
- Verify RapidAPI key is correct
- Check API subscription status

**Metro bundler issues**
- Run `npx expo start --clear` to clear cache

## 🔒 Security Notes

- Never commit `.env` files
- Rate limiting is pre-configured
- All inputs are validated
- Security headers applied automatically

## 📁 Project Structure

```
vibe-app/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Security & validation
│   │   └── types/    # TypeScript types
│   └── package.json
├── frontend/         # React Native + Expo
│   ├── src/
│   │   ├── screens/  # App screens
│   │   ├── components/ # UI components
│   │   ├── services/ # API calls
│   │   └── types/    # TypeScript types
│   └── package.json
└── README.md
```

## 🎯 Next Steps

1. **Get API Key**: Sign up for RapidAPI TripAdvisor
2. **Configure Environment**: Set up `.env` files
3. **Start Development**: Run both backend and frontend
4. **Test Features**: Try different vibes and see recommendations
5. **Customize**: Modify mood parsing rules or UI components

Need help? Check the full documentation in `README.md` and `DEPLOYMENT.md`.
