# How to Run Community Migration on EC2

The EC2 Instance Connect terminal seems to be having issues showing output. Here are alternative methods:

## Method 1: Use SSH from your Mac (if you have the key)

```bash
ssh -i ~/Downloads/vibe-app-key.pem ec2-user@3.79.12.161

cd ~/vibe-app/backend
npx tsx src/scripts/ensure-community-tables.ts
```

## Method 2: Use AWS Systems Manager Session Manager

1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Click "Connect" → "Session Manager" tab
4. Click "Connect"
5. Run:
```bash
cd /home/ec2-user/vibe-app/backend
npx tsx src/scripts/ensure-community-tables.ts
```

## Method 3: Run via PM2 (one-time command)

In EC2 terminal:
```bash
cd ~/vibe-app/backend
pm2 start --name migration --no-autorestart -- npx tsx src/scripts/ensure-community-tables.ts
pm2 logs migration
pm2 delete migration
```

## Method 4: Add to package.json and run via PM2

Already done! Just run:
```bash
cd ~/vibe-app/backend
git pull origin main
npm run migrate:community
```

## Verify it worked

After running any method:
```bash
curl "http://localhost:3000/api/community/feed?userId=test&limit=10&offset=0"
```

Should return:
```json
{"posts":[],"hasMore":false}
```

Instead of:
```json
{"error":"Failed to fetch community feed"}
```
