#!/bin/bash

echo "🚀 Vibe App - iOS Device Build"
echo ""
echo "This script will:"
echo "1. Start Metro bundler"
echo "2. Open Xcode for you to build"
echo ""

# Check if Metro is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Metro is already running on port 8081"
else
    echo "📦 Starting Metro bundler..."
    npx expo start --dev-client &
    METRO_PID=$!
    echo "Metro PID: $METRO_PID"
    sleep 5
fi

echo ""
echo "📱 Opening Xcode..."
open ios/VIBEDEBUG.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 IMPORTANT: Follow these steps in Xcode:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Click 'VIBEDEBUG' project (top left)"
echo "2. Select 'VIBEDEBUG' target"
echo "3. Go to 'Build Phases' tab"
echo "4. Find 'Bundle React Native code and images'"
echo "5. UNCHECK the checkbox to disable it"
echo "6. Select your device (Michael) from dropdown"
echo "7. Press Play (▶) or Cmd+R"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The app will build without sandbox errors!"
echo "It will connect to Metro automatically."
echo ""
echo "Press Ctrl+C to stop Metro when done."
