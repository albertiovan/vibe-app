#!/bin/bash

# EC2 Deployment Script for Vibe App Backend
# This script will be run ON the EC2 instance after SSH connection

echo "🚀 Starting Vibe App Backend Deployment..."
echo ""

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 20.x (LTS)
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo yum install -y git

# Install PostgreSQL client (for testing RDS connection)
echo "📦 Installing PostgreSQL client..."
sudo yum install -y postgresql15

# Install PM2 globally (process manager)
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create app directory
echo "📁 Creating application directory..."
mkdir -p ~/vibe-app
cd ~/vibe-app

# Clone repository (you'll need to provide the repo URL or upload files)
echo "⚠️  Repository cloning skipped - will upload files manually"

echo ""
echo "✅ System setup complete!"
echo ""
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo ""
echo "Next steps:"
echo "1. Upload backend files to ~/vibe-app/backend"
echo "2. Upload .env.production to ~/vibe-app/backend/"
echo "3. Run: cd ~/vibe-app/backend && npm install"
echo "4. Run: pm2 start src/server.ts --name vibe-backend --interpreter tsx"
echo "5. Run: pm2 save && pm2 startup"
