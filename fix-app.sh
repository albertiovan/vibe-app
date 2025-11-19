#!/bin/bash

echo "🔧 Fixing Expo App Errors..."
echo ""

# Step 1: Stop any running processes
echo "1️⃣ Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Step 2: Clear all caches
echo "2️⃣ Clearing caches..."

# Clear watchman
if command -v watchman &> /dev/null; then
    echo "   - Clearing watchman..."
    watchman watch-del-all 2>/dev/null || true
fi

# Clear Metro cache
echo "   - Clearing Metro cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

# Clear Expo cache
echo "   - Clearing Expo cache..."
rm -rf ~/.expo/cache 2>/dev/null || true

# Clear React Native cache
echo "   - Clearing React Native cache..."
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Step 3: Clean node_modules
echo "3️⃣ Cleaning node_modules..."
rm -rf node_modules
rm -f package-lock.json

# Step 4: Reinstall dependencies
echo "4️⃣ Reinstalling dependencies..."
npm install

echo ""
echo "✅ All fixes applied!"
echo ""
echo "🚀 Now run: npx expo start --clear"
echo ""
