# AWS Deployment Credentials & Configuration

## ✅ Completed Setup

### AWS Account
- **Account ID**: `083777493502`
- **IAM User**: `vibe-app-admin`
- **Region**: `eu-central-1` (Frankfurt)

### S3 Bucket
- **Bucket Name**: `vibe-app-prod-eu`
- **Region**: `eu-central-1`
- **Status**: ✅ Created and configured
- **Versioning**: Enabled
- **CORS**: Configured
- **Public Access**: Blocked (secure)

### CloudFront CDN
- **Distribution Domain**: `d21r1yhibxp0mq.cloudfront.net`
- **Status**: 🔄 Deploying (10-15 minutes)
- **Origin**: S3 bucket `vibe-app-prod-eu`
- **SSL**: Default CloudFront certificate

### RDS PostgreSQL
- **Instance ID**: `vibe-app-db`
- **Engine**: PostgreSQL 16.x
- **Username**: `vibeadmin`
- **Password**: `[SAVED IN YOUR CREDENTIALS FILE]`
- **Database Name**: `vibe_app`
- **Status**: 🔄 Creating (5-10 minutes)
- **Endpoint**: `[PENDING - Will update when available]`

### Backend Configuration
- **AWS SDK**: ✅ Installed
- **Upload Routes**: ✅ Registered
- **Production .env**: ✅ Created

## 📝 Next Steps

### 1. Update Production .env (When RDS is Ready)
Edit `/backend/.env.production`:
```env
# Replace these values:
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
DATABASE_URL=postgresql://vibeadmin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/vibe_app
```

### 2. Update S3 Bucket Policy (When CloudFront is Ready)
1. Go to CloudFront console
2. Copy the bucket policy from the blue banner
3. Go to S3 → vibe-app-prod-eu → Permissions
4. Paste the policy

### 3. Test S3 Uploads Locally
```bash
cd backend
NODE_ENV=production npm run dev

# Test endpoint
curl http://localhost:3000/api/upload/status
```

### 4. Migrate Database to RDS
```bash
# Connect to RDS
psql -h YOUR_RDS_ENDPOINT -U vibeadmin -d vibe_app

# Run migrations
for file in database/migrations/*.sql; do
  psql -h YOUR_RDS_ENDPOINT -U vibeadmin -d vibe_app -f "$file"
done
```

### 5. Deploy Backend to AWS
- Option A: EC2 instance (manual)
- Option B: ECS Fargate (containerized)

### 6. Update Mobile App
Edit `/src/config/api.ts`:
```typescript
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.88.199:3000'
  : 'https://YOUR_EC2_IP:3000'; // Or load balancer URL

export const CDN_BASE_URL = 'https://d21r1yhibxp0mq.cloudfront.net';
```

### 7. Build for TestFlight
```bash
cd ios
pod install
open vibeapp.xcworkspace
# Archive and upload to TestFlight
```

## 🔐 Security Notes

- ✅ Never commit `.env.production` to git
- ✅ AWS credentials stored securely
- ✅ RDS in private subnet (will configure)
- ✅ S3 public access blocked
- ✅ CloudFront HTTPS only

## 💰 Current Costs

**Estimated Monthly:**
- S3: ~$5
- RDS (db.t3.micro): ~$30
- CloudFront: ~$5
- **Total**: ~$40-50/month

**Free Tier Eligible:** First 12 months may be free or heavily discounted!

## 📞 Support

If issues arise:
1. Check AWS Console for error messages
2. Review CloudWatch Logs
3. Test locally first
4. Verify all credentials are correct

---

**Status**: Setup in progress - waiting for RDS and CloudFront to finish deploying
