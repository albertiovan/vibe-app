#!/bin/bash

echo "🌊 Vibe App Setup Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Please install Node.js first:"
    echo "1. Visit https://nodejs.org/"
    echo "2. Download and install Node.js 18+ LTS"
    echo "3. Restart your terminal"
    echo "4. Run this script again"
    echo ""
    echo "Alternative - Install via Homebrew:"
    echo "1. Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "2. Install Node.js: brew install node"
    echo "3. Run this script again"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
if npm install; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install Expo CLI globally if not present
echo ""
echo "📦 Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "Installing Expo CLI globally..."
    if npm install -g @expo/cli; then
        echo "✅ Expo CLI installed"
    else
        echo "❌ Failed to install Expo CLI"
        echo "You may need to run: sudo npm install -g @expo/cli"
    fi
else
    echo "✅ Expo CLI found: $(expo --version)"
fi

# Setup environment files
echo ""
echo "🔧 Setting up environment files..."
cd ..

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
else
    echo "✅ Backend .env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from template"
else
    echo "✅ Frontend .env already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get a RapidAPI key from https://rapidapi.com/"
echo "2. Subscribe to TripAdvisor API"
echo "3. Edit backend/.env and add your RAPIDAPI_KEY"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npx expo start"
echo ""
echo "📚 See SETUP.md for detailed instructions"
