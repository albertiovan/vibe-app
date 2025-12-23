# Deploy Community API to EC2

## Step 1: Connect to EC2
Go to AWS Console → EC2 → Instances → Select `vibe-app-backend` → Click "Connect" → Use "EC2 Instance Connect"

## Step 2: Run These Commands in EC2 Terminal

```bash
# Pull latest code
cd ~/backend
git pull origin main

# Install dependencies
npm install

# Restart backend
pm2 restart vibe-backend

# Check status
pm2 status

# View logs
pm2 logs vibe-backend --lines 20
```

## Step 3: Test Community API

Once deployed, test the endpoint:
```bash
curl http://3.79.12.161:3000/api/community/feed?userId=test&limit=10&offset=0
```

Should return:
```json
{
  "posts": [],
  "hasMore": false
}
```

## What This Deploys

Community API endpoints:
- GET `/api/community/feed` - Get community posts feed
- GET `/api/community/leaderboard` - Get challenge leaderboard
- GET `/api/community/users/:userId/stats` - Get user stats
- POST `/api/community/posts` - Create new post
- POST `/api/community/posts/:postId/like` - Like a post
- And more...

All endpoints are already coded and will work once deployed!
