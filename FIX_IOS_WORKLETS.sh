#!/bin/bash

echo "🔧 Fixing iOS Worklets Mismatch..."
echo ""

# Step 1: Stop Metro
echo "1️⃣ Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Step 2: Clear all caches
echo "2️⃣ Clearing caches..."
watchman watch-del-all 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true

# Step 3: Clean node_modules
echo "3️⃣ Cleaning node_modules..."
rm -rf node_modules package-lock.json

# Step 4: Reinstall dependencies
echo "4️⃣ Reinstalling dependencies..."
npm install

# Step 5: Rebuild iOS native modules (CRITICAL)
echo "5️⃣ Rebuilding iOS native modules..."
if [ -d "ios" ]; then
    cd ios
    rm -rf Pods Podfile.lock
    pod install --repo-update
    cd ..
else
    echo "⚠️  No ios folder found - this is normal for Expo Go"
    echo "   Using Expo Go? You need to create a development build."
fi

echo ""
echo "✅ All fixes applied!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "For Expo Go users:"
echo "  npx expo prebuild"
echo "  npx expo run:ios"
echo ""
echo "For development build:"
echo "  npx expo start --clear"
echo ""
