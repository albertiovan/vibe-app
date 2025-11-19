# Backend Setup for Standalone App

## Problem
Your standalone app can't access `http://10.103.30.198:3000` because:
- That's a local network IP
- Won't work when you're not on the same WiFi
- Won't work with cellular data

## Solution Options

### Option 1: ngrok (Easiest - Works Immediately)

**What it does:** Creates a public URL that tunnels to your local backend

**Steps:**
1. Install ngrok: `brew install ngrok/ngrok/ngrok`
2. Sign up at https://ngrok.com (free)
3. Get your auth token: `ngrok config add-authtoken YOUR_TOKEN`
4. Start tunnel: `ngrok http 3000`
5. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
6. Update your app config (see below)

**Pros:**
- ✅ Works instantly
- ✅ Works from anywhere (WiFi, cellular, etc.)
- ✅ Free tier is enough for testing

**Cons:**
- ❌ URL changes each time you restart ngrok
- ❌ Need to keep ngrok running
- ❌ Free tier has limits

### Option 2: Deploy Backend to Cloud (Best for Production)

**Services:**
- **Railway.app** - Free tier, easy deploy
- **Render.com** - Free tier, PostgreSQL included
- **Fly.io** - Free tier, global edge
- **Heroku** - $5/month (no free tier anymore)

**Steps:**
1. Push your backend code to GitHub
2. Connect to Railway/Render
3. Add PostgreSQL database
4. Set environment variables
5. Deploy
6. Get permanent URL (e.g., `https://vibe-app.up.railway.app`)

**Pros:**
- ✅ Permanent URL
- ✅ Always accessible
- ✅ Professional setup
- ✅ Auto-scaling

**Cons:**
- ❌ Takes 30-60 min to set up
- ❌ May cost money for production

### Option 3: Use Your Computer's Public IP (Limited)

**Only works if:**
- You're on the same WiFi as your computer
- Your router allows local network access

**Not recommended** - defeats the purpose of standalone app

## Recommended Approach

### For Testing (Now):
Use **ngrok** to get your app working immediately

### For Production (Later):
Deploy backend to **Railway** or **Render**

## Update App Configuration

Create a config file for API URLs:

```typescript
// src/config/api.ts
const NGROK_URL = 'https://YOUR-NGROK-URL.ngrok.io'; // Update this
const PRODUCTION_URL = 'https://your-production-api.com'; // When deployed

export const API_BASE_URL = __DEV__ 
  ? NGROK_URL 
  : PRODUCTION_URL;
```

Then update all API files to use this constant.

## Quick Start with ngrok

```bash
# 1. Install
brew install ngrok/ngrok/ngrok

# 2. Sign up and get token from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_TOKEN_HERE

# 3. Start your backend
cd backend
npm run dev

# 4. In a new terminal, start ngrok
ngrok http 3000

# 5. Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)

# 6. Update your app code with this URL

# 7. Rebuild your app
eas build --profile standalone --platform ios
```

## Environment Variables Approach

Better: Use environment variables so you don't hardcode URLs

```bash
# Create .env file
echo "API_URL=https://your-ngrok-url.ngrok.io" > .env
```

Then in your code:
```typescript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
```

And in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": process.env.API_URL
    }
  }
}
```
