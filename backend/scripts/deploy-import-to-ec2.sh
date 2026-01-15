#!/bin/bash

# Deploy and run image import on EC2
EC2_IP="3.79.12.161"
KEY_PATH="$HOME/Downloads/vibe-app-key.pem"

echo "📦 Copying image data to EC2..."
scp -i "$KEY_PATH" /tmp/all-images.json ubuntu@$EC2_IP:/tmp/

echo "📦 Copying import script to EC2..."
scp -i "$KEY_PATH" ./scripts/import-all-images-to-production.ts ubuntu@$EC2_IP:/home/ubuntu/

echo "🚀 Running import on EC2..."
ssh -i "$KEY_PATH" ubuntu@$EC2_IP << 'EOF'
cd /home/ubuntu/vibe-app/backend
# Copy the script and data
cp /home/ubuntu/import-all-images-to-production.ts ./scripts/
cp /tmp/all-images.json /tmp/

# Run the import
npx tsx ./scripts/import-all-images-to-production.ts
EOF

echo "✅ Import complete!"
