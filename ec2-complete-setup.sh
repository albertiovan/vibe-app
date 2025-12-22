#!/bin/bash

# Complete EC2 Backend Setup Script
# Run this script on your EC2 instance

set -e  # Exit on error

echo "🚀 Setting up Vibe App Backend on EC2..."
echo ""

# Create backend directory
echo "📁 Creating backend directory..."
mkdir -p ~/backend
cd ~/backend

# Initialize package.json
echo "📦 Initializing npm project..."
cat > package.json << 'EOF'
{
  "name": "vibe-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "tsx src/server.ts"
  }
}
EOF

# Install dependencies
echo "📦 Installing dependencies (this may take 2-3 minutes)..."
npm install express@4.18.2 \
  pg@8.11.3 \
  dotenv@16.3.1 \
  cors@2.8.5 \
  helmet@7.1.0 \
  express-rate-limit@7.1.5 \
  @anthropic-ai/sdk@0.9.1 \
  @aws-sdk/client-s3@3.470.0 \
  @aws-sdk/s3-request-presigner@3.470.0 \
  tsx@4.7.0

echo ""
echo "✅ Dependencies installed!"
echo ""
echo "📋 Next steps:"
echo "1. Create .env.production file with your credentials"
echo "2. Upload your backend source code"
echo "3. Start the server with PM2"
echo ""
echo "Directory structure created at: ~/backend"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
