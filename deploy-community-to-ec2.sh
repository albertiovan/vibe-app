#!/bin/bash
# Deploy Community API to EC2

echo "🚀 Deploying Community API to EC2..."
echo ""

# SSH to EC2 and update backend
ssh -i ~/Downloads/vibe-app-key.pem ec2-user@3.79.12.161 << 'EOF'
  echo "📦 Pulling latest code from GitHub..."
  cd ~/backend
  git pull origin main
  
  echo "📚 Installing dependencies..."
  npm install
  
  echo "🔄 Restarting backend..."
  pm2 restart vibe-backend
  
  echo "✅ Deployment complete!"
  echo ""
  echo "📊 Backend status:"
  pm2 status
  
  echo ""
  echo "📝 Recent logs:"
  pm2 logs vibe-backend --lines 20 --nostream
EOF

echo ""
echo "🎉 Community API deployed successfully!"
echo "Test at: http://3.79.12.161:3000/api/community/feed?userId=test&limit=10&offset=0"
