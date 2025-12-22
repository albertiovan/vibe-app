# AWS Setup Guide - Step by Step

## Prerequisites
- AWS Account (create at aws.amazon.com)
- AWS CLI installed: `brew install awscli`
- Node.js 20+ installed
- PostgreSQL client installed

## Part 1: AWS Account Setup (15 minutes)

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process
4. Add payment method (required, but we'll use free tier)

### Step 2: Set Up Billing Alerts
1. Go to AWS Console → Billing Dashboard
2. Click "Billing preferences"
3. Enable "Receive Billing Alerts"
4. Set alert at $10, $50, $100

### Step 3: Create IAM User (Security Best Practice)
```bash
# Don't use root account for daily operations
# Create IAM user with programmatic access
```

1. Go to IAM Console
2. Click "Users" → "Add users"
3. Username: `vibe-app-admin`
4. Access type: ✅ Programmatic access
5. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonECSFullAccess`
   - `CloudFrontFullAccess`
6. Download credentials CSV (SAVE THIS!)

### Step 4: Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [from CSV]
# AWS Secret Access Key: [from CSV]
# Default region: us-east-1
# Default output format: json
```

## Part 2: S3 Bucket Setup (10 minutes)

### Step 1: Create S3 Bucket
```bash
# Create bucket
aws s3 mb s3://vibe-app-production --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket vibe-app-production \
  --versioning-configuration Status=Enabled

# Block public access (we'll use CloudFront)
aws s3api put-public-access-block \
  --bucket vibe-app-production \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Step 2: Configure CORS
Create file `s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS:
```bash
aws s3api put-bucket-cors \
  --bucket vibe-app-production \
  --cors-configuration file://s3-cors.json
```

### Step 3: Create Folder Structure
```bash
# Create folders (optional, they'll be created on first upload)
aws s3api put-object --bucket vibe-app-production --key profile-pictures/
aws s3api put-object --bucket vibe-app-production --key activity-images/
aws s3api put-object --bucket vibe-app-production --key vibe-stories/
aws s3api put-object --bucket vibe-app-production --key user-uploads/
```

### Step 4: Set Lifecycle Rules (Optional)
Create file `s3-lifecycle.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
```

Apply lifecycle:
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket vibe-app-production \
  --lifecycle-configuration file://s3-lifecycle.json
```

## Part 3: CloudFront CDN Setup (15 minutes)

### Step 1: Create CloudFront Distribution
1. Go to CloudFront Console
2. Click "Create Distribution"
3. **Origin Settings:**
   - Origin Domain: `vibe-app-production.s3.us-east-1.amazonaws.com`
   - Origin Path: (leave empty)
   - Name: `vibe-app-s3`
   - Origin Access: Origin access control settings (recommended)
   - Create new OAC

4. **Default Cache Behavior:**
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - Cache Policy: CachingOptimized
   - Origin Request Policy: CORS-S3Origin

5. **Settings:**
   - Price Class: Use All Edge Locations (best performance)
   - Alternate Domain Names (CNAMEs): `cdn.vibeapp.com` (if you have domain)
   - SSL Certificate: Default CloudFront Certificate (or custom if you have domain)

6. Click "Create Distribution"
7. **Copy Distribution Domain Name** (e.g., `d1234567890.cloudfront.net`)

### Step 2: Update S3 Bucket Policy for CloudFront
CloudFront will provide a policy - copy and apply it to your S3 bucket.

## Part 4: RDS PostgreSQL Setup (20 minutes)

### Step 1: Create Database Subnet Group
1. Go to RDS Console → Subnet Groups
2. Click "Create DB Subnet Group"
3. Name: `vibe-app-db-subnet`
4. VPC: Default VPC
5. Add subnets from at least 2 availability zones
6. Create

### Step 2: Create Security Group
1. Go to EC2 Console → Security Groups
2. Click "Create Security Group"
3. Name: `vibe-app-db-sg`
4. Description: "PostgreSQL access for Vibe App"
5. Inbound Rules:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your IP (for testing)
   - Source: 0.0.0.0/0 (for backend - we'll restrict this later)
6. Create

### Step 3: Create RDS Instance
```bash
# Option 1: AWS CLI
aws rds create-db-instance \
  --db-instance-identifier vibe-app-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username vibeadmin \
  --master-user-password 'YourStrongPassword123!' \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name vibe-app-db-subnet \
  --backup-retention-period 7 \
  --publicly-accessible \
  --no-multi-az
```

**Option 2: AWS Console (Recommended for first time):**
1. Go to RDS Console
2. Click "Create database"
3. **Engine Options:**
   - Engine: PostgreSQL
   - Version: 16.1
   - Template: Free tier (for testing) or Production

4. **Settings:**
   - DB Instance Identifier: `vibe-app-db`
   - Master Username: `vibeadmin`
   - Master Password: `[Strong Password]` (SAVE THIS!)

5. **Instance Configuration:**
   - DB Instance Class: db.t3.micro (free tier) or db.t3.medium (production)

6. **Storage:**
   - Storage Type: GP3
   - Allocated Storage: 20 GB
   - Enable Storage Autoscaling: Yes
   - Maximum: 100 GB

7. **Connectivity:**
   - VPC: Default
   - Subnet Group: vibe-app-db-subnet
   - Public Access: Yes (for now, we'll restrict later)
   - VPC Security Group: vibe-app-db-sg

8. **Additional Configuration:**
   - Initial Database Name: `vibe_app`
   - Backup Retention: 7 days
   - Enable Encryption: Yes

9. Click "Create Database"
10. Wait 5-10 minutes for creation
11. **Copy Endpoint** (e.g., `vibe-app-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Step 4: Test Connection
```bash
# Install PostgreSQL client if needed
brew install postgresql@16

# Connect to RDS
psql -h vibe-app-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U vibeadmin \
     -d vibe_app

# If successful, you'll see:
# vibe_app=>
```

### Step 5: Import Database Schema
```bash
# From your local machine
cd /Users/aai/CascadeProjects/vibe-app/backend

# Run all migrations
for file in database/migrations/*.sql; do
  psql -h vibe-app-db.xxxxx.us-east-1.rds.amazonaws.com \
       -U vibeadmin \
       -d vibe_app \
       -f "$file"
done
```

## Part 5: Backend Environment Configuration (5 minutes)

### Update Backend .env
Create `/backend/.env.production`:
```env
# Server
NODE_ENV=production
PORT=3000

# Database (RDS)
DATABASE_URL=postgresql://vibeadmin:YourPassword@vibe-app-db.xxxxx.us-east-1.rds.amazonaws.com:5432/vibe_app

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=vibe-app-production
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# API Keys (same as before)
CLAUDE_API_KEY=sk-ant-...
GOOGLE_MAPS_API_KEY=AIza...
TAVILY_API_KEY=tvly-...
YOUTUBE_API_KEY=AIza...

# CORS
CORS_ORIGINS=https://vibeapp.com,exp://localhost:8081
```

## Part 6: Install AWS SDK (5 minutes)

```bash
cd /Users/aai/CascadeProjects/vibe-app/backend

# Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Verify installation
npm list @aws-sdk/client-s3
```

## Part 7: Test S3 Upload Locally (10 minutes)

### Step 1: Update Backend Server
Add to `/backend/src/server.ts`:
```typescript
import uploadRoutes from './routes/upload.js';

// Add route
app.use('/api/upload', uploadRoutes);
```

### Step 2: Start Backend with Production Config
```bash
cd backend
NODE_ENV=production npm run dev
```

### Step 3: Test Upload Endpoint
```bash
# Test S3 status
curl http://localhost:3000/api/upload/status

# Expected response:
# {
#   "s3Configured": true,
#   "bucket": "vibe-app-production",
#   "region": "us-east-1",
#   "cdnDomain": "d1234567890.cloudfront.net"
# }

# Test presigned URL generation
curl -X POST http://localhost:3000/api/upload/profile-picture \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","fileExtension":"jpg"}'

# Expected response:
# {
#   "uploadUrl": "https://vibe-app-production.s3.amazonaws.com/...",
#   "s3Key": "profile-pictures/test-user/...",
#   "cdnUrl": "https://d1234567890.cloudfront.net/...",
#   "expiresIn": 300
# }
```

### Step 4: Test Actual Upload
```bash
# Get upload URL
UPLOAD_DATA=$(curl -s -X POST http://localhost:3000/api/upload/profile-picture \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","fileExtension":"jpg"}')

UPLOAD_URL=$(echo $UPLOAD_DATA | jq -r '.uploadUrl')
CDN_URL=$(echo $UPLOAD_DATA | jq -r '.cdnUrl')

# Upload a test image
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --upload-file test-image.jpg

# Verify image is accessible
curl -I "$CDN_URL"
# Should return 200 OK
```

## Part 8: Cost Optimization

### Free Tier Limits (First 12 Months):
- **S3**: 5GB storage, 20,000 GET requests, 2,000 PUT requests
- **RDS**: 750 hours/month of db.t3.micro, 20GB storage
- **CloudFront**: 1TB data transfer out, 10M HTTP/HTTPS requests
- **EC2**: 750 hours/month of t2.micro (if using EC2 for backend)

### Cost Monitoring:
```bash
# Set up billing alerts
aws cloudwatch put-metric-alarm \
  --alarm-name "BillingAlert-50USD" \
  --alarm-description "Alert when bill exceeds $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

## Troubleshooting

### S3 Upload Fails:
- Check IAM permissions
- Verify CORS configuration
- Check bucket name in .env

### RDS Connection Fails:
- Verify security group allows your IP
- Check endpoint and credentials
- Ensure database is publicly accessible (for testing)

### CloudFront Not Serving Images:
- Wait 15-20 minutes for distribution to deploy
- Check origin access control settings
- Verify S3 bucket policy

## Next Steps

✅ AWS infrastructure is ready!

Now proceed to:
1. Deploy backend to AWS (ECS or EC2)
2. Update mobile app with production API URL
3. Build iOS app for TestFlight

See `BACKEND_DEPLOYMENT_GUIDE.md` and `TESTFLIGHT_GUIDE.md`
