# 🔥 IMPORTANT: Update Your ngrok URL

## Step 1: Open the config file
Open: `src/config/api.ts`

## Step 2: Replace the placeholder
Find this line:
```typescript
const NGROK_URL = 'https://YOUR-NGROK-URL-HERE.ngrok-free.app';
```

Replace with YOUR actual ngrok forwarding URL, for example:
```typescript
const NGROK_URL = 'https://abc123.ngrok-free.app';
```

## Step 3: Save the file

## Step 4: Rebuild the iOS app
```bash
eas build --profile standalone --platform ios
```

This will take 10-20 minutes. When done, you'll get a QR code to install on your iPhone!

---

## What We Just Did

✅ Created centralized API config (`src/config/api.ts`)
✅ Updated all API services to use it:
   - userApi.ts
   - chatApi.ts  
   - enrichmentApi.ts

Now your app will connect to your backend through ngrok, which means:
- ✅ Works from anywhere (not just same WiFi)
- ✅ Works with cellular data
- ✅ Backend stays on your computer

## Important Notes

1. **Keep ngrok running** - If you stop ngrok, the app won't work
2. **Backend must be running** - `cd backend && npm run dev`
3. **URL changes** - Free ngrok URLs change when you restart. You'll need to:
   - Update `src/config/api.ts` with new URL
   - Rebuild the app

## Alternative: Deploy Backend (Permanent Solution)

For a permanent URL that doesn't change:
- Deploy to Railway.app or Render.com
- Update `PRODUCTION_URL` in config
- Build with production profile
