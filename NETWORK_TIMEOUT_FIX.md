# Network Request Timed Out - Fix Guide

## 🐛 Error
```
Failed to initialize: TypeError: Network request timed out
```

## 🔍 Root Cause

The app can't connect to the backend server. Common reasons:

1. **Backend server not running**
2. **Wrong IP address** in API configuration
3. **Firewall blocking connection**
4. **Different WiFi network** (phone vs Mac)

---

## ✅ Quick Fix Steps

### Step 1: Check if Backend is Running

```bash
# In a new terminal
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
✅ Database connected
```

If not running, start it!

---

### Step 2: Find Your Mac's IP Address

```bash
# Get your Mac's local IP
ipconfig getifaddr en0
```

**Example output:** `10.103.28.232` or `192.168.1.x`

---

### Step 3: Update API URL

The API URL is currently hardcoded to: `10.103.30.198:3000`

**Option A: Use localhost (if using iOS Simulator)**
```typescript
// src/services/chatApi.ts
const API_URL = __DEV__
  ? 'http://localhost:3000/api'  // ✅ Works for simulator
  : 'https://your-production-api.com/api';
```

**Option B: Use your Mac's IP (if using real device)**
```typescript
// src/services/chatApi.ts
const API_URL = __DEV__
  ? 'http://10.103.28.232:3000/api'  // ✅ Replace with YOUR IP
  : 'https://your-production-api.com/api';
```

---

### Step 4: Verify Backend is Accessible

```bash
# Test from terminal
curl http://localhost:3000/health

# Or test with your IP
curl http://10.103.28.232:3000/health
```

**Expected response:**
```json
{"status":"ok"}
```

---

### Step 5: Reload the App

After updating the API URL:
1. **Stop Metro** (Ctrl+C)
2. **Clear cache:** `npx expo start --clear`
3. **Reload app** in simulator (Cmd+R)

---

## 🎯 Which IP to Use?

### Using iOS Simulator:
✅ **Use `localhost:3000`**
- Simulator shares network with Mac
- Simplest option

### Using Real iPhone:
✅ **Use your Mac's IP** (e.g., `10.103.28.232:3000`)
- Find IP with: `ipconfig getifaddr en0`
- Make sure iPhone and Mac are on **same WiFi**

---

## 🔧 Troubleshooting

### Issue: "Connection refused"
**Solution:** Backend not running
```bash
cd backend
npm run dev
```

### Issue: "Network request failed"
**Solution:** Wrong IP or different WiFi
- Check Mac IP: `ipconfig getifaddr en0`
- Ensure same WiFi network
- Update API URL in `chatApi.ts`

### Issue: "Timeout" persists
**Solution:** Firewall blocking
```bash
# Allow Node through firewall (macOS)
# System Settings → Network → Firewall → Options
# Allow incoming connections for Node
```

### Issue: Backend starts but crashes
**Solution:** Check backend logs
```bash
cd backend
npm run dev
# Look for errors in output
```

---

## 🚀 Recommended Setup

### For Development (iOS Simulator):

1. **Backend:** `http://localhost:3000`
2. **Frontend API:** `http://localhost:3000/api`
3. **No IP needed** - simulator uses localhost

### For Development (Real iPhone):

1. **Backend:** `http://localhost:3000` (on Mac)
2. **Frontend API:** `http://YOUR_MAC_IP:3000/api`
3. **Same WiFi required**

---

## 📝 Quick Commands

```bash
# Find your IP
ipconfig getifaddr en0

# Test backend
curl http://localhost:3000/health

# Start backend
cd backend && npm run dev

# Clear Metro cache
npx expo start --clear

# Restart everything
# Terminal 1: cd backend && npm run dev
# Terminal 2: npx expo start --clear
```

---

## ✅ Success Checklist

Before testing the app:
- [ ] Backend is running (`npm run dev`)
- [ ] Backend responds to health check
- [ ] API URL matches your setup (localhost or IP)
- [ ] Metro bundler is running
- [ ] App reloaded after changes

---

## 🎉 After Fix

Once connected, you should see:
- ✅ App loads without timeout
- ✅ Home screen appears
- ✅ Can enter vibes and get suggestions
- ✅ Activities load from backend

---

**Start by checking if your backend is running!** That's the most common cause. 🚀
