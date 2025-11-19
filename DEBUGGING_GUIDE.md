# Debugging Guide for Expo React Native App

## 🔍 How to See Console Logs in Expo

### **Method 1: Terminal Logs (EASIEST!)** ⭐

This is the simplest and most reliable method for Expo.

**Setup:**
1. Open your terminal where you run `npm start` or `expo start`
2. That's it! All `console.log()` output appears here automatically

**Usage:**
```bash
# Start the app
cd /Users/aai/CascadeProjects/vibe-app
npm start
# or
expo start

# Now all console.log statements will appear in this terminal!
```

**What you'll see:**
```
📊 ACTIVITIES RECEIVED:
Total activities: 4
Activity 1: { name: '...', hasDescription: true, ... }

🔍 WEBSITE LOOKUP DEBUG:
Activity object keys: ['id', 'name', 'description', ...]
Activity data: { "id": "123", "name": "..." }
Found website: undefined
❌ No website found in any field
```

**Tips:**
- Keep terminal visible while testing
- Logs appear in **real-time** as you interact with app
- Look for the emoji markers: 📊, 🔍, ❌
- Scroll up to see previous logs

---

### **Method 2: Expo Developer Menu**

**Open Dev Menu:**
- **iOS Simulator:** Cmd + D
- **Android Emulator:** Cmd + M (Mac) or Ctrl + M (Windows)
- **Physical Device:** Shake the device

**Then:**
- Select "Debug Remote JS" (for older Expo)
- Or "Open Debugger" (for newer Expo SDK 49+)
- Opens Chrome DevTools where you can see console

---

### **Method 3: React Native Debugger (Advanced)**

If you want a better debugging experience:

**Install:**
```bash
# macOS
brew install --cask react-native-debugger

# Or download from:
# https://github.com/jhen0409/react-native-debugger/releases
```

**Usage:**
1. Start React Native Debugger app
2. In your Expo app, open dev menu (shake device)
3. Select "Debug Remote JS"
4. Debugger will connect automatically
5. See console, network requests, Redux, etc.

---

### **Method 4: Expo Go App Logs (Physical Device)**

If testing on physical device with Expo Go:

**iOS:**
```bash
# Terminal - shows all logs from iOS device
npx react-native log-ios
```

**Android:**
```bash
# Terminal - shows all logs from Android device
npx react-native log-android

# Or use adb directly
adb logcat
```

---

## 🎯 Recommended Approach for Your Case

**For debugging website/activity issues:**

### **Use Terminal Logs (Method 1)**

This is the **fastest and most reliable** for your use case:

1. **Keep terminal visible** where `npm start` is running
2. **Interact with app:**
   - Submit a vibe query
   - Look for `📊 ACTIVITIES RECEIVED:` in terminal
   - Tap an activity card
   - Tap "Learn More" button
   - Look for `🔍 WEBSITE LOOKUP DEBUG:` in terminal

3. **Read the output:**
   ```
   📊 ACTIVITIES RECEIVED:
   Total activities: 4
   
   Activity 1: {
     name: 'Tandem Paragliding',
     hasDescription: true,
     descriptionLength: 150,
     hasWebsite: false,
     website: undefined,
     venues: 1,
     allKeys: [
       'id',
       'name', 
       'description',
       'booking_url',    ← AH HA! The URL is here!
       'external_link',
       'venues'
     ]
   }
   ```

4. **Share the output** - copy/paste the relevant parts from terminal

---

## 🔧 Troubleshooting

### **"I don't see any logs in terminal"**

**Check:**
1. Terminal where `npm start` is running (not a different terminal)
2. Scroll up - logs might be above current view
3. Try adding a simple test:
   ```typescript
   console.log('🔴 TEST LOG - App is running!');
   ```
   If you don't see this, there's a configuration issue.

**Solution:**
```bash
# Stop the app (Ctrl + C in terminal)
# Clear cache and restart
npx expo start --clear

# Or
npm start -- --reset-cache
```

### **"Logs are truncated or not showing full objects"**

The debug logs I added use `JSON.stringify()` which shows full objects:
```typescript
console.log('Activity data:', JSON.stringify(activity, null, 2));
```

This will show the **complete** activity object structure.

### **"Too many logs, hard to find the ones I need"**

Look for the emoji markers:
- 📊 = Activities received
- 🔍 = Website lookup debug
- ❌ = Error/not found

Or filter in terminal:
```bash
# macOS/Linux - filter logs
npm start 2>&1 | grep "WEBSITE LOOKUP"
```

---

## 📱 Testing Flow

**Complete debugging workflow:**

1. **Start app with terminal visible:**
   ```bash
   cd /Users/aai/CascadeProjects/vibe-app
   npm start
   ```

2. **In the app:**
   - Enter a vibe (e.g., "adventurous")
   - Press submit
   - **Check terminal** → See `📊 ACTIVITIES RECEIVED:`
   - Note how many activities and what properties they have

3. **Tap any activity card:**
   - App navigates to detail screen
   - **Check terminal** → See activity data loaded

4. **Tap "Learn More" button:**
   - **Check terminal** → See `🔍 WEBSITE LOOKUP DEBUG:`
   - See full activity JSON
   - See all properties checked
   - See if website found or not

5. **Copy relevant output and share:**
   ```
   Activity object keys: ['id', 'name', 'booking_url', ...]
   ```

---

## 💡 Quick Reference

| What You Want | How to See It |
|---------------|---------------|
| Console logs | Terminal where `npm start` runs |
| Activity data | Look for 📊 emoji in terminal |
| Website debug | Look for 🔍 emoji in terminal |
| Full object structure | Shown via JSON.stringify in logs |
| Real-time logs | Automatically in terminal |
| Advanced debugging | React Native Debugger |
| Network requests | React Native Debugger |

---

## 🎯 Example Terminal Output

**What you should see after tapping "Learn More":**

```bash
🔍 WEBSITE LOOKUP DEBUG:
Activity object keys: [
  'id',
  'name',
  'description',
  'category',
  'duration_min',
  'duration_max',
  'energy_level',
  'city',
  'venues',
  'booking_url',        ← This is where URL might be!
  'external_link',
  'photos'
]

Activity data: {
  "id": "act_123",
  "name": "Tandem Paragliding Clopotiva (Retezat)",
  "description": "Experience the thrill of...",
  "booking_url": "https://skyrush.ro/paragliding",  ← FOUND IT!
  "external_link": "https://skyrush.ro",
  "venues": [
    {
      "id": "v_456",
      "name": "SkyRush Paragliding - Clopotiva",
      "website": "https://skyrush.ro",  ← Also here!
      "location": { "lat": 45.123, "lng": 23.456 }
    }
  ]
}

Selected venue: {
  "id": "v_456",
  "name": "SkyRush Paragliding - Clopotiva",
  "website": "https://skyrush.ro",
  "location": { "lat": 45.123, "lng": 23.456 }
}

Found website: https://skyrush.ro
Opening URL: https://skyrush.ro
```

**Or if not found:**
```bash
Found website: undefined
❌ No website found in any field
Checked fields: [
  'selectedVenue.website',
  'selectedVenue.websiteUrl',
  'selectedVenue.url',
  'selectedVenue.link',
  'activity.website',
  'activity.websiteUrl',
  'activity.url',
  'activity.link',
  'venues[0].website',
  'venues[0].websiteUrl',
  'venues[0].url',
  'venues[0].link'
]
```

---

## ✅ Action Items

**Right now:**

1. **Find your terminal** where you ran `npm start` or `expo start`
2. **Keep it visible** alongside your phone/simulator
3. **Test the flow:**
   - Submit vibe → Check terminal for 📊
   - Tap activity → Tap "Learn More" → Check terminal for 🔍
4. **Copy the output** from terminal (especially "Activity object keys" and the activity data JSON)
5. **Share with me** so we can see:
   - What properties exist on activities
   - Where the website URL is stored
   - Why it's not being found

---

**The terminal logs will tell us everything we need to know!** 🎯
