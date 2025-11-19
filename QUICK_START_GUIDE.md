# Quick Start Guide - Choose Your Path

## 🎯 Current Situation

Metro bundler is running successfully! You have two options:

---

## ⚡ **Option 1: Quick Test with Expo Go** (2 minutes)

Test most features immediately, but swipeable cards won't work.

### Steps:
1. **In the Metro terminal, press `s`** to switch to Expo Go mode
2. **Open Expo Go app** on your iPhone
3. **Scan the QR code** from the terminal
4. **App will load** (you'll see the Worklets error, but other features work)

### What Works:
- ✅ Home screen with orb
- ✅ AI query input
- ✅ Filters
- ✅ Vibe profiles
- ✅ Activity suggestions (list view)
- ✅ Activity details
- ❌ Swipeable card stack (Worklets error)

---

## 🚀 **Option 2: Full Development Build** (20 minutes)

Get all features working including swipeable cards.

### Step 1: Fix npm permissions (one-time)

```bash
# Create a directory for global npm packages
mkdir -p ~/.npm-global

# Configure npm to use this directory
npm config set prefix '~/.npm-global'

# Add to your PATH (add this line to ~/.zshrc)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc

# Reload shell config
source ~/.zshrc
```

### Step 2: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 3: Create Development Build

```bash
# Stop current Metro (Ctrl+C)

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS (takes 15-20 minutes)
eas build --profile development --platform ios

# After build completes:
# 1. Click the link EAS provides
# 2. Install via TestFlight or direct install
# 3. Then run:
npx expo start --dev-client
```

---

## 🎯 **My Recommendation**

### For Right Now:
**Use Option 1** - Press `s` in Metro terminal and test with Expo Go

### For Full Features:
**Do Option 2 later** when you have 20 minutes

---

## 📱 **What to Test with Expo Go**

Even though swipeable cards won't work, you can test:

1. **Home Screen**
   - Orb animation
   - Greeting with your name
   - AI query input
   - Challenge Me button
   - Filters button
   - Vibe Profiles button

2. **Activity Suggestions**
   - Will show list view instead of swipeable cards
   - All 5 activities visible
   - "Explore Now" buttons work

3. **Activity Details**
   - Photo carousel
   - Description
   - Metadata
   - "GO NOW" button

4. **Other Features**
   - User profile
   - Training mode
   - Custom vibe profiles
   - Filters

---

## 🔄 **Switching Between Modes**

### Currently Running:
Metro is in **development build mode** (waiting for dev client)

### To Switch to Expo Go:
Press `s` in the Metro terminal

### To Switch Back to Dev Build:
Press `s` again

---

## ⚡ **Quick Commands**

```bash
# Start with Expo Go
npx expo start

# Start with development build
npx expo start --dev-client

# Clear cache and start
npx expo start --clear

# Stop Metro
Ctrl+C
```

---

## 🆘 **Troubleshooting**

### "Metro is already running on port 8081"
- That's fine, it's using 8082 instead
- Or stop the other instance: `lsof -ti:8081 | xargs kill -9`

### "Can't scan QR code"
- Make sure iPhone and Mac are on same WiFi
- Try pressing `w` to open in web browser first

### "Worklets error appears"
- Expected with Expo Go
- Either ignore it or create development build

---

## ✅ **Next Steps**

1. **Right now**: Press `s` in Metro terminal → Test with Expo Go
2. **Later today**: Fix npm permissions → Create development build
3. **Enjoy**: All features working with smooth animations!
