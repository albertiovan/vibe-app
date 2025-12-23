# Manual EC2 Deployment for Community Routes

The issue is that the EC2 backend doesn't have the community routes file. Here's how to fix it:

## Option 1: Copy the community.ts file directly

In your EC2 terminal, run:

```bash
cd ~/backend/src/routes

# Check if community.ts exists
ls -la community.ts

# If it doesn't exist, create it
cat > community.ts << 'ENDOFFILE'
# Paste the entire content from /Users/aai/CascadeProjects/vibe-app/backend/src/routes/community.ts
ENDOFFILE
```

## Option 2: Clone the entire repo fresh

```bash
# Backup current backend
cd ~
mv backend backend.old

# Clone fresh from GitHub
git clone https://github.com/albertiovan/vibe-app.git
cd vibe-app/backend

# Copy .env.production from old backend
cp ~/backend.old/.env.production .

# Install dependencies
npm install

# Stop old PM2 process
pm2 delete vibe-backend

# Start new backend
pm2 start npm --name vibe-backend -- start
pm2 save
```

## Option 3: Use rsync to sync files (from your Mac)

```bash
# From your Mac terminal
rsync -avz --exclude 'node_modules' \
  /Users/aai/CascadeProjects/vibe-app/backend/ \
  ec2-user@3.79.12.161:~/backend/
```

## After any option, restart PM2:

```bash
cd ~/backend
npm install
pm2 restart vibe-backend
pm2 logs vibe-backend --lines 20
```

## Test the API:

```bash
curl "http://3.79.12.161:3000/api/community/feed?userId=test&limit=10&offset=0"
```

Should return:
```json
{"posts":[],"hasMore":false}
```
