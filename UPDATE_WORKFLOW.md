# 🎯 Your Complete Update Workflow

## One-Time Setup (Do Now)

### 1. Build the App with Updates Enabled

**In Xcode (already open):**

```
1. Product → Scheme → Edit Scheme
2. Change "Build Configuration" to "Release"
3. Product → Archive
4. Distribute → Ad Hoc → Export
5. Install .ipa on iPhone
```

This build now has **Expo Updates** configured! ✅

## Daily Workflow (Every Time You Code)

### When You Want to Add Features:

**1. Make your changes:**
```bash
# Edit any JavaScript/TypeScript files
code screens/HomeScreen.tsx
code components/ActivityCard.tsx
```

**2. Test locally (optional but recommended):**
```bash
npm start
# Test on simulator or dev build
```

**3. Push the update:**
```bash
npm run update "Added new activity filters"
```

**4. Done!** 🎉

Your iPhone app will:
- Check for updates on next launch
- Download the new code
- Apply it automatically
- Show your new features

## What You Can Update Instantly

✅ **All JavaScript/TypeScript code:**
- New screens
- UI changes
- Bug fixes
- New features
- API integrations
- Database queries
- Logic changes

✅ **No rebuild needed!**

## Example: Adding a New Feature

```bash
# 1. Add code for new feature
code screens/NewFeatureScreen.tsx

# 2. Update navigation
code App.tsx

# 3. Test it
npm start

# 4. Push to users
npm run update "Added awesome new feature"

# 5. Users get it on next app launch!
```

**Time:** 2-5 minutes (vs 15+ minutes for rebuild)

## Quick Commands

```bash
# Push update
npm run update "Your message here"

# Check what updates you've pushed
eas update:list

# View specific update
eas update:view [id]
```

## When You Need to Rebuild

Only rebuild when you:
- Add new native dependencies (rare)
- Change app permissions
- Upgrade Expo SDK

For 95% of changes, just use `npm run update`!

## Summary

**Old way:**
1. Make changes
2. Rebuild in Xcode (10-15 min)
3. Export .ipa
4. Reinstall on iPhone
5. Test

**New way:**
1. Make changes
2. `npm run update "message"`
3. Open app on iPhone
4. Done!

🚀 **Build once, update forever!**
