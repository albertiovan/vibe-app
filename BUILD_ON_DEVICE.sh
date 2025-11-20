#!/bin/bash

echo "🚀 Building Vibe App for iPhone"
echo ""
echo "The command-line build has sandbox restrictions."
echo "Building in Xcode instead..."
echo ""

# Open Xcode
open ios/VIBEDEBUG.xcworkspace

echo "✅ Xcode opened!"
echo ""
echo "📱 To build on your iPhone:"
echo "1. Select 'Michael' (your iPhone) from device dropdown at top"
echo "2. Press Play button (▶) or Cmd+R"
echo ""
echo "First time only:"
echo "• Trust certificate on iPhone:"
echo "  Settings → General → VPN & Device Management"
echo ""
echo "Then start Metro:"
echo "  npx expo start --dev-client"
echo ""
echo "The app will connect automatically! 🎉"
