#!/bin/bash

echo "🔍 Running app to see crash error"
echo ""
echo "This will:"
echo "1. Start Metro bundler"
echo "2. Build and run on your iPhone"
echo "3. Show the actual error message"
echo ""

# Start Metro
npx expo start --dev-client &
METRO_PID=$!
echo "Metro started (PID: $METRO_PID)"
echo ""

sleep 3

echo "Now in Xcode:"
echo "1. Select your iPhone from device dropdown"
echo "2. Product → Run (⌘R)"
echo ""
echo "The app will launch and show the error in Xcode console"
echo ""
echo "Press Ctrl+C to stop Metro when done"

# Open Xcode
open ios/VIBEDEBUG.xcworkspace

# Wait for user to stop
wait $METRO_PID
