# Deployment Quick Start - Get Your App Live!

## 🎯 Goal
Deploy Vibe app to AWS and TestFlight so you can use it on your iPhone like a real user.

## 📋 What You Need
- [ ] AWS Account (create at aws.amazon.com)
- [ ] Apple Developer Account ($99/year - developer.apple.com)
- [ ] 3-4 hours of focused time
- [ ] Credit card (for AWS - minimal charges ~$55/month)

## 🚀 Quick Path (Follow in Order)

### Step 1: AWS Infrastructure (1 hour)
**Follow:** `AWS_SETUP_GUIDE.md`

**Quick Commands:**
```bash
# Install AWS CLI
brew install awscli

# Configure AWS
aws configure

# Create S3 bucket
aws s3 mb s3://vibe-app-production --region us-east-1

# Install AWS SDK in backend
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**What You'll Create:**
- ✅ S3 bucket for images
- ✅ CloudFront CDN for fast delivery
- ✅ RDS PostgreSQL database
- ✅ IAM user with proper permissions

**Cost:** ~$55/month (free tier eligible for 12 months)

### Step 2: Backend Deployment (30 minutes)
**Update Backend .env:**
```env
# Add these to backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=vibe-app-production
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net
DATABASE_URL=postgresql://vibeadmin:password@vibe-app-db.xxxxx.us-east-1.rds.amazonaws.com:5432/vibe_app
```

**Register Upload Routes:**
Add to `/backend/src/server.ts`:
```typescript
import uploadRoutes from './routes/upload.js';
app.use('/api/upload', uploadRoutes);
```

**Test Locally:**
```bash
cd backend
npm run dev

# Test S3 status
curl http://localhost:3000/api/upload/status
```

### Step 3: Deploy Backend to AWS (1 hour)
**Options:**

**Option A: Quick Deploy (EC2)**
1. Launch t3.micro EC2 instance
2. Install Node.js 20
3. Clone repo
4. Run `npm install && npm start`
5. Configure security group (port 3000)

**Option B: Production Deploy (ECS Fargate)**
- Follow Docker deployment guide
- More scalable, auto-healing
- Slightly more complex setup

### Step 4: iOS TestFlight Build (1 hour)
**Follow:** `TESTFLIGHT_GUIDE.md`

**Quick Steps:**
```bash
# Update API URL
# Edit src/config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.88.199:3000'
  : 'https://your-aws-url.com';

# Open Xcode
cd ios
pod install
open vibeapp.xcworkspace

# In Xcode:
# 1. Update bundle ID
# 2. Configure signing
# 3. Product → Archive
# 4. Distribute → TestFlight
```

**Timeline:** 
- Archive: 10 min
- Upload: 10 min
- Processing: 10-15 min
- Install on device: 2 min

## 📊 Current Status Check

### Database ✅
- [x] PostgreSQL running locally
- [x] Friends system tables created
- [x] Backend connected and working
- [ ] Migrated to AWS RDS

### Backend ✅
- [x] Running locally on port 3000
- [x] All routes working
- [x] Friends API functional
- [ ] S3 integration added
- [ ] Deployed to AWS

### Frontend ✅
- [x] App working on simulator
- [x] Friends system integrated
- [x] Profile customization working
- [ ] API pointing to production
- [ ] Built for TestFlight

## 🎯 Today's Action Plan

### Phase 1: AWS Setup (Do First)
```bash
# 1. Create AWS account
# 2. Set up billing alerts
# 3. Create S3 bucket
# 4. Create RDS database
# 5. Get CloudFront domain

Estimated time: 1 hour
```

### Phase 2: Backend Updates (Do Second)
```bash
# 1. Install AWS SDK
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# 2. Add upload routes to server.ts
# 3. Test S3 locally
# 4. Deploy to AWS

Estimated time: 1 hour
```

### Phase 3: iOS Build (Do Third)
```bash
# 1. Update API URLs
# 2. Configure Xcode
# 3. Archive and upload
# 4. Install on iPhone

Estimated time: 1 hour
```

## 💰 Cost Breakdown

### AWS (Monthly):
- **S3 Storage**: $5 (50GB)
- **RDS Database**: $30 (db.t3.micro)
- **EC2 Backend**: $10 (t3.micro)
- **CloudFront CDN**: $5 (100GB transfer)
- **Total**: ~$50-60/month

### Apple:
- **Developer Account**: $99/year (~$8/month)

### Grand Total: ~$60-70/month

### Free Tier Benefits (First 12 Months):
- Most AWS services free or heavily discounted
- Actual cost: ~$20-30/month for first year

## 🔧 Files Created for You

### AWS Integration:
- ✅ `/backend/src/services/s3Service.ts` - S3 upload logic
- ✅ `/backend/src/routes/upload.ts` - Upload endpoints
- ✅ `AWS_SETUP_GUIDE.md` - Step-by-step AWS setup
- ✅ `AWS_DEPLOYMENT_ARCHITECTURE.md` - Full architecture

### iOS Deployment:
- ✅ `TESTFLIGHT_GUIDE.md` - Complete iOS guide
- ✅ API configuration ready in `src/config/api.ts`

### Documentation:
- ✅ `FRIENDS_SYSTEM_COMPLETE.md` - Friends feature docs
- ✅ This file - Quick start guide

## ⚠️ Important Notes

### Before You Start:
1. **Backup your local database:**
   ```bash
   pg_dump vibe_app > backup.sql
   ```

2. **Save all credentials:**
   - AWS Access Keys
   - RDS password
   - Apple Developer credentials

3. **Test locally first:**
   - Ensure backend works with S3
   - Test upload flow
   - Verify all features work

### Security Checklist:
- [ ] Never commit AWS credentials to git
- [ ] Use environment variables for secrets
- [ ] Enable MFA on AWS account
- [ ] Use strong passwords for RDS
- [ ] Keep .env files in .gitignore

## 🎉 Success Criteria

### You're Done When:
1. ✅ AWS infrastructure is running
2. ✅ Backend deployed and accessible
3. ✅ S3 uploads working
4. ✅ RDS database connected
5. ✅ App installed on iPhone via TestFlight
6. ✅ Can use app like a real user
7. ✅ Profile pictures upload to S3
8. ✅ Friends system works
9. ✅ All features functional

## 🆘 Need Help?

### Common Issues:

**AWS Access Denied:**
- Check IAM permissions
- Verify credentials in .env
- Ensure policies are attached

**RDS Connection Failed:**
- Check security group
- Verify endpoint URL
- Test with psql first

**TestFlight Upload Failed:**
- Clean Xcode build folder
- Check bundle ID matches
- Verify signing certificate

**App Crashes on Launch:**
- Check API_BASE_URL
- Verify backend is accessible
- Review Xcode crash logs

## 📚 Full Documentation

For detailed instructions, see:
1. **AWS_SETUP_GUIDE.md** - Complete AWS setup
2. **AWS_DEPLOYMENT_ARCHITECTURE.md** - Architecture details
3. **TESTFLIGHT_GUIDE.md** - iOS deployment
4. **FRIENDS_SYSTEM_COMPLETE.md** - Friends feature

## 🚦 Start Here

**Ready to begin?**

```bash
# Step 1: Open AWS setup guide
open AWS_SETUP_GUIDE.md

# Step 2: Follow along step-by-step
# Step 3: Come back here to check progress
# Step 4: Move to next phase

# You got this! 🚀
```

**Estimated Total Time:** 3-4 hours
**Difficulty:** Intermediate
**Result:** Production-ready app on your iPhone!

Let's make it happen! 💪
