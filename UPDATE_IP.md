# IP Address Update Guide

## Current IP: 192.168.88.199
## New IP: **[YOUR NEW IP HERE]**

## Files to Update:

### 1. Backend Configuration
**File:** `/backend/.env`

Find and replace:
```env
# Old
DATABASE_URL=postgresql://localhost/vibe_app
# Keep this as localhost if database is on same machine

# If you have any IP references in .env, update them
```

### 2. Frontend API Configuration
**File:** `/src/config/api.ts`

```typescript
// Change this line:
export const API_BASE_URL = __DEV__
  ? 'http://YOUR_NEW_IP:3000'  // <-- UPDATE THIS
  : 'https://your-production-domain.com';
```

### 3. CORS Configuration (if needed)
**File:** `/backend/src/middleware/security.ts`

Update CORS origins if you have IP-specific origins:
```typescript
origin: [
  'http://localhost:3000',
  'http://localhost:19006',
  'exp://YOUR_NEW_IP:19000',      // <-- UPDATE
  'http://YOUR_NEW_IP:8081',      // <-- UPDATE
  'http://YOUR_NEW_IP:19006',     // <-- UPDATE
]
```

## Quick Update Steps:

### Option 1: Manual Search & Replace
1. Open VS Code
2. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows)
3. Search for: `192.168.88.199`
4. Replace with: `YOUR_NEW_IP`
5. Review each change before replacing

### Option 2: Command Line
```bash
# From project root
cd /Users/aai/CascadeProjects/vibe-app

# Search for old IP
grep -r "192.168.88.199" .

# Replace in specific files (review first!)
# sed -i '' 's/192.168.88.199/YOUR_NEW_IP/g' src/config/api.ts
```

## After Updating:

### 1. Restart Backend:
```bash
cd backend
npm run dev
```

### 2. Clear App Cache & Reload:
```bash
# In Expo terminal
# Press 'shift+r' to reload with cache clear
# Or press 'r' for normal reload
```

### 3. Test Connection:
```bash
# Test backend health
curl http://YOUR_NEW_IP:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### 4. Verify in App:
1. Open app
2. Navigate to Profile tab
3. Tap "Friends" button
4. Try searching for a user
5. Check console for API calls

## Troubleshooting:

### Backend won't start:
- Check if port 3000 is available: `lsof -i :3000`
- Check .env file is loaded correctly
- Verify PostgreSQL is running: `psql -d vibe_app -c "SELECT 1"`

### Frontend can't connect:
- Verify IP is correct in `/src/config/api.ts`
- Check phone/emulator is on same network
- Try `http://` not `https://` for local development
- Check firewall isn't blocking port 3000

### Database connection fails:
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Test connection: `psql -d vibe_app`

## Network Requirements:

For development:
- Backend server: Port 3000
- PostgreSQL: Port 5432 (localhost)
- Expo: Port 19000, 19001, 19002
- Metro bundler: Port 8081

Ensure your new IP is accessible from:
- Your development machine
- Your phone/emulator
- Same local network

## Quick Test:

```bash
# From your phone's browser, visit:
http://YOUR_NEW_IP:3000/api/health

# Should see:
# {"status":"healthy",...}
```

## Done! 🎉

Once updated, your friends system will be fully operational!
