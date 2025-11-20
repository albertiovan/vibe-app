# Build Standalone App (No Metro Needed)

## The Problem

You used "Debugging" distribution which requires Metro bundler running. That's why it crashes - it's trying to connect to localhost:8081.

## ✅ Solution: Build Release Archive

**In Xcode:**

1. **Change to Release mode:**
   - Product → Scheme → Edit Scheme
   - Click "Run" in left sidebar
   - Change "Build Configuration" to **"Release"**
   - Click "Close"

2. **Archive:**
   - Product → Archive
   - Wait for build (~5-10 min)

3. **Distribute (IMPORTANT - different choice):**
   - When Organizer opens, click "Distribute App"
   - Choose **"Release Testing"** (NOT Debugging!)
   - Click "Next"
   - Keep defaults → "Next" → "Export"

4. **Install:**
   - Connect iPhone
   - Drag .ipa to iPhone in Finder

## Why This Works

- **"Debugging"** = Needs Metro running (what you used before)
- **"Release Testing"** = JavaScript bundled inside, works standalone

This will create a true standalone app that doesn't need Metro or your Mac.
