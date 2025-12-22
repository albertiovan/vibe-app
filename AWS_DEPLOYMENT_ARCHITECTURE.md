# AWS Deployment Architecture for Vibe App

## Current State Analysis

### Image Storage (Needs Migration):
1. **Activities Table**: 
   - `hero_image_url` (TEXT) - Currently stores URLs
   - `image_urls` (TEXT[]) - Array of image URLs
   - ✅ Already URL-based, just need to migrate to S3

2. **Users Table**:
   - `profile_picture` (TEXT) - Currently stores local URIs
   - ❌ Needs migration to S3 URLs

3. **Community Features**:
   - `vibe_stories.image_url` (TEXT)
   - `vibe_stories.video_url` (TEXT)
   - ❌ Needs S3 integration

## Target AWS Architecture

### 1. Storage Layer (AWS S3)

**Buckets Structure:**
```
vibe-app-production/
├── profile-pictures/
│   ├── {userId}/
│   │   └── avatar-{timestamp}.jpg
├── activity-images/
│   ├── {activityId}/
│   │   ├── hero-{timestamp}.jpg
│   │   └── gallery-{index}-{timestamp}.jpg
├── vibe-stories/
│   ├── images/
│   │   └── {storyId}-{timestamp}.jpg
│   └── videos/
│       └── {storyId}-{timestamp}.mp4
└── user-uploads/
    └── {userId}/
        └── {uploadId}-{timestamp}.{ext}
```

**S3 Configuration:**
- Region: `us-east-1` (or closest to Romania: `eu-central-1`)
- Versioning: Enabled
- Lifecycle: Delete old versions after 30 days
- CORS: Enabled for app domains
- CloudFront CDN: For fast global delivery
- Presigned URLs: For secure uploads from mobile

### 2. Database Layer (AWS RDS PostgreSQL)

**Configuration:**
- Engine: PostgreSQL 16
- Instance: db.t3.medium (2 vCPU, 4GB RAM) - Start small, scale up
- Storage: 100GB GP3 SSD with autoscaling
- Multi-AZ: Yes (for production)
- Automated Backups: 7 days retention
- Encryption: At rest and in transit

**Connection:**
- VPC: Private subnet
- Security Group: Only backend can access
- SSL/TLS: Required

### 3. Backend Layer (AWS ECS Fargate or EC2)

**Option A: ECS Fargate (Recommended)**
- Serverless containers
- Auto-scaling based on CPU/memory
- No server management
- Pay only for what you use

**Option B: EC2 (More control)**
- t3.medium instance (2 vCPU, 4GB RAM)
- Auto Scaling Group: 2-4 instances
- Application Load Balancer
- More cost-effective at scale

**Backend Configuration:**
- Node.js 20 LTS
- Express.js API
- Environment variables from AWS Secrets Manager
- Health checks: `/api/health`
- Logs: CloudWatch Logs

### 4. CDN Layer (CloudFront)

**Distribution:**
- Origin: S3 bucket
- SSL Certificate: AWS Certificate Manager (free)
- Custom domain: `cdn.vibeapp.com`
- Cache behavior: 1 year for images
- Geo-restriction: None (global access)

### 5. Networking

**VPC Setup:**
```
VPC: 10.0.0.0/16
├── Public Subnets (2 AZs)
│   ├── 10.0.1.0/24 (us-east-1a)
│   └── 10.0.2.0/24 (us-east-1b)
│   └── Resources: ALB, NAT Gateway
├── Private Subnets (2 AZs)
│   ├── 10.0.11.0/24 (us-east-1a)
│   └── 10.0.12.0/24 (us-east-1b)
│   └── Resources: ECS Tasks, RDS
└── Internet Gateway
```

## Implementation Plan

### Phase 1: AWS Infrastructure Setup (Day 1)

#### 1.1 Create S3 Bucket
```bash
aws s3 mb s3://vibe-app-production --region us-east-1
aws s3api put-bucket-versioning \
  --bucket vibe-app-production \
  --versioning-configuration Status=Enabled
```

#### 1.2 Configure S3 CORS
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### 1.3 Create RDS PostgreSQL Instance
- Use AWS Console or Terraform
- Note connection string
- Import existing database schema

#### 1.4 Set Up CloudFront Distribution
- Origin: S3 bucket
- Enable HTTPS only
- Create distribution

### Phase 2: Backend S3 Integration (Day 1-2)

#### 2.1 Install AWS SDK
```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### 2.2 Create S3 Service
File: `/backend/src/services/s3Service.ts`

#### 2.3 Create Upload Endpoints
- `POST /api/upload/profile-picture` - Get presigned URL
- `POST /api/upload/activity-image` - Get presigned URL
- `POST /api/upload/story-media` - Get presigned URL

#### 2.4 Update User Routes
- Modify profile picture upload to use S3
- Return S3 URL instead of local URI

### Phase 3: Frontend Updates (Day 2)

#### 3.1 Update Profile Picture Upload Flow
1. Request presigned URL from backend
2. Upload directly to S3 from mobile
3. Save S3 URL to database
4. Display from CloudFront CDN

#### 3.2 Update Image Display Components
- Use CloudFront URLs
- Add loading states
- Add error fallbacks

### Phase 4: Data Migration (Day 2-3)

#### 4.1 Migrate Existing Images
- Script to upload local images to S3
- Update database with S3 URLs
- Verify all images accessible

#### 4.2 Database Schema Updates
- Add `s3_key` columns for tracking
- Add `cdn_url` columns for fast access

### Phase 5: Backend Deployment (Day 3-4)

#### 5.1 Dockerize Backend
Create `Dockerfile` and `docker-compose.yml`

#### 5.2 Deploy to ECS Fargate
- Create task definition
- Create service
- Configure auto-scaling
- Set up load balancer

#### 5.3 Configure Environment Variables
Use AWS Secrets Manager:
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DOMAIN`
- `CLAUDE_API_KEY`
- etc.

### Phase 6: iOS TestFlight Build (Day 4-5)

#### 6.1 Update API Configuration
```typescript
// src/config/api.ts
export const API_BASE_URL = __DEV__
  ? 'http://192.168.88.199:3000'
  : 'https://api.vibeapp.com';

export const CDN_BASE_URL = 'https://cdn.vibeapp.com';
```

#### 6.2 Configure Xcode Project
- Update bundle identifier
- Set up signing certificates
- Configure Info.plist
- Add app icons

#### 6.3 Build for TestFlight
- Archive in Xcode
- Upload to App Store Connect
- Submit for TestFlight review

## Cost Estimation (Monthly)

### Minimal Setup (Testing):
- **S3**: $5 (50GB storage + 100K requests)
- **RDS**: $30 (db.t3.micro, 20GB)
- **ECS Fargate**: $15 (0.25 vCPU, 0.5GB RAM, minimal usage)
- **CloudFront**: $5 (100GB transfer)
- **Total**: ~$55/month

### Production Setup (100 active users):
- **S3**: $20 (200GB storage + 1M requests)
- **RDS**: $80 (db.t3.medium, 100GB, Multi-AZ)
- **ECS Fargate**: $50 (0.5 vCPU, 1GB RAM, 24/7)
- **CloudFront**: $20 (500GB transfer)
- **ALB**: $20
- **Total**: ~$190/month

### Scale (1000 active users):
- **S3**: $50
- **RDS**: $150 (db.t3.large)
- **ECS Fargate**: $150 (1 vCPU, 2GB RAM, auto-scale)
- **CloudFront**: $50
- **ALB**: $20
- **Total**: ~$420/month

## Security Best Practices

### 1. IAM Roles
- Least privilege principle
- Separate roles for backend, uploads, reads
- No hardcoded credentials

### 2. S3 Security
- Block public access by default
- Use presigned URLs for uploads
- CloudFront for public reads
- Encryption at rest (AES-256)

### 3. Database Security
- Private subnet only
- SSL/TLS required
- Strong passwords in Secrets Manager
- Regular automated backups

### 4. API Security
- Rate limiting (already implemented)
- CORS properly configured
- API keys in environment variables
- HTTPS only in production

## Monitoring & Logging

### CloudWatch Dashboards:
- API response times
- Error rates
- Database connections
- S3 upload success/failure
- ECS CPU/Memory usage

### Alerts:
- API error rate > 5%
- Database CPU > 80%
- S3 upload failures
- ECS task failures

## Rollback Plan

### If Issues Occur:
1. Keep local backend running as fallback
2. DNS can point back to local IP
3. Database backups every 6 hours
4. S3 versioning allows recovery
5. ECS can roll back to previous task definition

## Next Steps

### Immediate Actions:
1. Create AWS account (if not exists)
2. Set up billing alerts
3. Create S3 bucket
4. Implement S3 service in backend
5. Test upload flow locally
6. Deploy to AWS
7. Build iOS app for TestFlight

### Timeline:
- **Day 1**: AWS setup + S3 integration
- **Day 2**: Frontend updates + testing
- **Day 3**: Backend deployment
- **Day 4**: iOS build + TestFlight
- **Day 5**: Testing + fixes

## Files to Create:
1. `/backend/src/services/s3Service.ts` - S3 upload/download logic
2. `/backend/src/routes/upload.ts` - Upload endpoints
3. `/backend/Dockerfile` - Container configuration
4. `/backend/docker-compose.yml` - Local testing
5. `/infrastructure/terraform/` - Infrastructure as code (optional)
6. `/docs/AWS_SETUP_GUIDE.md` - Step-by-step AWS setup
7. `/docs/TESTFLIGHT_GUIDE.md` - iOS deployment guide

Ready to start implementation?
