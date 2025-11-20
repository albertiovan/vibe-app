#!/bin/bash

echo "🏗️  Building Release iOS App (Standalone)"
echo ""

# Clean derived data
echo "1️⃣  Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/VIBEDEBUG-*
rm -rf ios/build

# Pre-bundle JavaScript to avoid sandbox issues
echo ""
echo "2️⃣  Pre-bundling JavaScript..."
mkdir -p ios/build
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.ts \
  --bundle-output ios/build/main.jsbundle \
  --assets-dest ios/build

echo ""
echo "3️⃣  Opening Xcode..."
open ios/VIBEDEBUG.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ JavaScript pre-bundled successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 In Xcode:"
echo ""
echo "1. Select 'Any iOS Device (arm64)' from device dropdown"
echo "   (NOT a simulator, NOT your specific device)"
echo ""
echo "2. Product → Archive"
echo ""
echo "3. When Organizer opens:"
echo "   - Click 'Distribute App'"
echo "   - Choose 'Ad Hoc'"
echo "   - Click 'Next' → 'Export'"
echo ""
echo "4. Install the .ipa on your iPhone"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ This creates a TRUE STANDALONE app!"
echo "   - Works anywhere (no Mac needed)"
echo "   - JavaScript bundled inside"
echo "   - All animations included"
echo "   - OTA updates enabled"
echo ""
echo "🎉 Follow the steps above!"
