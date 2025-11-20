#!/bin/bash

echo "🚀 Building Vibe App for iPhone (Fixed)"
echo ""

# Check if device is connected
echo "📱 Checking for connected iPhone..."
if xcrun xctrace list devices 2>&1 | grep -q "iPhone"; then
    echo "✅ iPhone detected"
    echo ""
else
    echo "⚠️  No iPhone detected"
    echo "Please connect your iPhone via USB and trust this computer."
    exit 1
fi

echo "🔨 Building with Xcode..."
echo ""
echo "This will open Xcode. Please:"
echo "1. Select your iPhone 'Michael' from the device dropdown"
echo "2. Click the Play button (▶) or press Cmd+R"
echo ""

# Open in Xcode
open ios/VIBEDEBUG.xcworkspace

echo "✅ Xcode opened"
echo ""
echo "After the app installs on your iPhone:"
echo "1. Settings → General → VPN & Device Management"
echo "2. Tap your developer account → Trust"
echo ""
echo "Then start Metro:"
echo "  npx expo start --dev-client"
