# EC2 Deployment Guide - Vibe App Backend

## Your EC2 Instance Details
- **Public IP**: `3.79.12.161`
- **Instance Name**: `vibe-app-backend`
- **SSH Key**: `vibe-app-key.pem` (should be in your Downloads folder)
- **Backend URL**: `http://3.79.12.161:3000`

## Step-by-Step Deployment

### Step 1: Connect to EC2 via SSH

Open Terminal and run:

```bash
# Set correct permissions on your SSH key
chmod 400 ~/Downloads/vibe-app-key.pem

# Connect to EC2
ssh -i ~/Downloads/vibe-app-key.pem ec2-user@3.79.12.161
```

**Note**: If the key file is not in Downloads, find it first:
```bash
find ~ -name "vibe-app-key.pem" 2>/dev/null
```

### Step 2: Install Node.js and Dependencies (ON EC2)

Once connected to EC2, run these commands:

```bash
# Update system
sudo yum update -y

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PostgreSQL client
sudo yum install -y postgresql15

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
```

### Step 3: Upload Backend Files to EC2

**Option A: Using SCP (from your Mac)**

Open a NEW terminal window (keep SSH connection open) and run:

```bash
# Navigate to your project
cd /Users/aai/CascadeProjects/vibe-app

# Upload backend directory
scp -i ~/Downloads/vibe-app-key.pem -r backend ec2-user@3.79.12.161:~/

# Upload .env.production
scp -i ~/Downloads/vibe-app-key.pem backend/.env.production ec2-user@3.79.12.161:~/backend/.env.production
```

**Option B: Using Git (if you have a private repo)**

On EC2:
```bash
cd ~
git clone YOUR_REPO_URL vibe-app
cd vibe-app/backend
```

Then manually create `.env.production` with your credentials.

### Step 4: Install Dependencies and Start Backend (ON EC2)

Back in your SSH session:

```bash
# Navigate to backend
cd ~/backend

# Install dependencies
npm install

# Test the backend
NODE_ENV=production npm run dev
```

**Test it works**: Open browser and visit `http://3.79.12.161:3000/api/health`

If it works, press `Ctrl+C` to stop, then:

```bash
# Start with PM2 (keeps running 24/7)
NODE_ENV=production pm2 start src/server.ts --name vibe-backend --interpreter tsx

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
# Copy and run the command it outputs

# Check status
pm2 status
pm2 logs vibe-backend
```

### Step 5: Update CORS in .env.production (ON EC2)

Edit the CORS_ORIGINS to allow your mobile app:

```bash
nano ~/backend/.env.production
```

Update this line:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:19006,exp://localhost:8081,http://3.79.12.161:3000
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

Restart backend:
```bash
pm2 restart vibe-backend
```

### Step 6: Test from Your Phone

Open Safari on your iPhone and visit:
```
http://3.79.12.161:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

## Troubleshooting

### Can't connect via SSH
```bash
# Check if key file exists
ls -la ~/Downloads/vibe-app-key.pem

# If not found, re-download from EC2 console or create new key pair
```

### Backend won't start
```bash
# Check logs
pm2 logs vibe-backend

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart vibe-backend
```

### Can't access from phone
```bash
# Check if backend is running
pm2 status

# Check security group allows port 3000
# Go to EC2 Console → Security Groups → Check inbound rules

# Test from EC2 itself
curl http://localhost:3000/api/health
```

### Database connection issues
```bash
# Test RDS connection from EC2
psql "sslmode=require host=vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com port=5432 dbname=vibe_app user=vibeadmin"

# Check .env.production has correct DATABASE_URL
cat ~/backend/.env.production | grep DATABASE_URL
```

## PM2 Useful Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs vibe-backend

# Restart
pm2 restart vibe-backend

# Stop
pm2 stop vibe-backend

# Delete
pm2 delete vibe-backend

# Monitor
pm2 monit
```

## Next Steps After Deployment

1. ✅ Backend running on EC2: `http://3.79.12.161:3000`
2. Update mobile app API URL to `http://3.79.12.161:3000`
3. Build iOS app in Xcode
4. Upload to TestFlight
5. Test with multiple phones!

## Monthly Cost

- EC2 t3.micro: ~$10/month (free tier eligible for 12 months)
- RDS + S3 + CloudFront: ~$30-35/month
- **Total**: ~$40-45/month (first year: ~$30-35 with free tier)

## Security Notes

- ⚠️ Backend is HTTP only (not HTTPS)
- For production, you should:
  - Get a domain name
  - Set up SSL certificate
  - Use Application Load Balancer
  - Restrict security group to specific IPs

For now, HTTP is fine for TestFlight testing!
