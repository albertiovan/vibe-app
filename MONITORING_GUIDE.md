# Vibe App Monitoring Guide

## Overview
This guide explains how to monitor user accounts, API usage, and system performance now that your app is live on TestFlight.

---

## 1. User Account Monitoring

### Check User Accounts in Database

**Connect to RDS from your Mac:**
```bash
PGPASSWORD='zyprif-2cuQxa-jowgoc' \
/opt/homebrew/Cellar/postgresql@16/16.10/bin/psql \
  "sslmode=require host=vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com \
   port=5432 dbname=vibe_app user=vibeadmin"
```

**Useful Queries:**

```sql
-- Total users
SELECT COUNT(*) as total_users FROM users;

-- Recent users (last 7 days)
SELECT COUNT(*) as new_users 
FROM users 
WHERE created_at > NOW() - INTERVAL '7 days';

-- User details
SELECT id, device_id, full_name, email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 20;

-- Users with activity
SELECT u.id, u.full_name, COUNT(sp.id) as saved_activities
FROM users u
LEFT JOIN saved_activities sp ON u.id = sp.user_id
GROUP BY u.id, u.full_name
ORDER BY saved_activities DESC;
```

---

## 2. Claude API Usage Monitoring

### Current State: No Built-in Tracking

Your app currently **does not track** Claude API usage. You need to add this.

### What You Should Track:
- Number of API calls per user
- Tokens used per request
- Response times
- Error rates
- Cost per user

### How to Add Tracking:

**Create a new table:**
```sql
CREATE TABLE api_usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  device_id VARCHAR(255),
  endpoint VARCHAR(100),
  provider VARCHAR(50), -- 'claude', 'openai', etc.
  model VARCHAR(100),
  tokens_used INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON api_usage_logs(user_id);
CREATE INDEX idx_api_usage_created ON api_usage_logs(created_at);
```

**Add logging to backend:**
```typescript
// In your Claude API calls
const startTime = Date.now();
try {
  const response = await anthropic.messages.create({...});
  const responseTime = Date.now() - startTime;
  
  // Log successful call
  await db.query(`
    INSERT INTO api_usage_logs 
    (user_id, device_id, endpoint, provider, model, tokens_used, response_time_ms, success)
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
  `, [userId, deviceId, 'chat', 'claude', model, response.usage.total_tokens, responseTime]);
  
} catch (error) {
  // Log failed call
  await db.query(`
    INSERT INTO api_usage_logs 
    (user_id, device_id, endpoint, provider, model, success, error_message)
    VALUES ($1, $2, $3, $4, $5, false, $6)
  `, [userId, deviceId, 'chat', 'claude', model, error.message]);
}
```

**Monitor API usage:**
```sql
-- Total API calls today
SELECT COUNT(*) as calls_today 
FROM api_usage_logs 
WHERE created_at > CURRENT_DATE;

-- Tokens used today
SELECT SUM(tokens_used) as total_tokens 
FROM api_usage_logs 
WHERE created_at > CURRENT_DATE;

-- Average response time
SELECT AVG(response_time_ms) as avg_response_ms 
FROM api_usage_logs 
WHERE success = true 
AND created_at > NOW() - INTERVAL '1 hour';

-- Error rate
SELECT 
  COUNT(*) as total_calls,
  SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as errors,
  ROUND(100.0 * SUM(CASE WHEN success = false THEN 1 ELSE 0 END) / COUNT(*), 2) as error_rate_pct
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Top users by API usage
SELECT 
  u.full_name,
  COUNT(*) as api_calls,
  SUM(tokens_used) as total_tokens
FROM api_usage_logs l
JOIN users u ON l.user_id = u.id
WHERE l.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.full_name
ORDER BY api_calls DESC
LIMIT 10;
```

---

## 3. Training Data Collection

### Check Training Mode Data

**You already have this table:** `training_feedback`

```sql
-- Total training sessions
SELECT COUNT(DISTINCT session_id) as total_sessions 
FROM training_feedback;

-- Approval rate by activity
SELECT 
  activity_name,
  COUNT(*) as total_ratings,
  SUM(CASE WHEN approved THEN 1 ELSE 0 END) as approvals,
  ROUND(100.0 * SUM(CASE WHEN approved THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate
FROM training_feedback
GROUP BY activity_name
HAVING COUNT(*) >= 3
ORDER BY approval_rate DESC;

-- Vibes with low approval rates (need prompt improvement)
SELECT 
  vibe_input,
  COUNT(*) as ratings,
  ROUND(100.0 * SUM(CASE WHEN approved THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate
FROM training_feedback
GROUP BY vibe_input
HAVING COUNT(*) >= 5
ORDER BY approval_rate ASC
LIMIT 10;

-- Recent training feedback
SELECT 
  vibe_input,
  activity_name,
  approved,
  created_at
FROM training_feedback
ORDER BY created_at DESC
LIMIT 20;
```

---

## 4. User Activity Monitoring

### Track User Engagement

```sql
-- Active users (made a query in last 7 days)
SELECT COUNT(DISTINCT user_id) as active_users
FROM conversation_history
WHERE created_at > NOW() - INTERVAL '7 days';

-- Total conversations
SELECT COUNT(*) as total_conversations 
FROM conversation_history;

-- Average activities saved per user
SELECT AVG(activity_count) as avg_saved_activities
FROM (
  SELECT user_id, COUNT(*) as activity_count
  FROM saved_activities
  GROUP BY user_id
) subquery;

-- Most popular activities
SELECT 
  a.name,
  COUNT(*) as times_saved
FROM saved_activities sa
JOIN activities a ON sa.activity_id = a.id
GROUP BY a.id, a.name
ORDER BY times_saved DESC
LIMIT 10;

-- User retention (users who came back)
SELECT 
  COUNT(DISTINCT user_id) as returning_users
FROM (
  SELECT user_id, DATE(created_at) as activity_date
  FROM conversation_history
  GROUP BY user_id, DATE(created_at)
  HAVING COUNT(DISTINCT DATE(created_at)) > 1
) subquery;
```

---

## 5. System Health Monitoring

### Backend Health Checks

**From your Mac:**
```bash
# Check if backend is responding
curl http://3.79.12.161:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"...","uptime":...}
```

**On EC2:**
```bash
ssh -i ~/Downloads/vibe-app-key.pem ec2-user@3.79.12.161

# Check PM2 status
pm2 status

# Check logs
pm2 logs vibe-backend --lines 50

# Check memory usage
free -h

# Check disk space
df -h
```

---

## 6. Cost Monitoring

### AWS Costs

**Check AWS Billing Dashboard:**
https://console.aws.amazon.com/billing

**Set up billing alerts:**
1. Go to Billing Dashboard
2. Click "Budgets"
3. Create budget: $50/month
4. Set alert at 80% ($40)

### Claude API Costs

**Anthropic Console:**
https://console.anthropic.com/settings/usage

**Current pricing (as of Dec 2024):**
- Claude 3 Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- Typical conversation: ~1,000 tokens = $0.001-0.002

**Estimate monthly cost:**
```sql
-- If you add token tracking
SELECT 
  SUM(tokens_used) as total_tokens,
  ROUND(SUM(tokens_used) * 0.001 / 1000, 2) as estimated_cost_usd
FROM api_usage_logs
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 7. Quick Daily Checks

**Run these queries daily:**

```sql
-- Daily summary
SELECT 
  CURRENT_DATE as date,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM users WHERE created_at > CURRENT_DATE) as new_users_today,
  (SELECT COUNT(DISTINCT user_id) FROM conversation_history WHERE created_at > CURRENT_DATE) as active_users_today,
  (SELECT COUNT(*) FROM conversation_history WHERE created_at > CURRENT_DATE) as conversations_today,
  (SELECT COUNT(*) FROM saved_activities WHERE created_at > CURRENT_DATE) as activities_saved_today;
```

---

## 8. Setting Up Automated Monitoring (Optional)

### Create a monitoring script:

```bash
#!/bin/bash
# monitor.sh - Run daily health checks

echo "=== Vibe App Daily Report ==="
echo "Date: $(date)"
echo ""

# Backend health
echo "Backend Status:"
curl -s http://3.79.12.161:3000/api/health | jq
echo ""

# Database stats
echo "Database Stats:"
PGPASSWORD='zyprif-2cuQxa-jowgoc' \
psql "sslmode=require host=vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com port=5432 dbname=vibe_app user=vibeadmin" \
  -c "SELECT COUNT(*) as total_users FROM users;" \
  -c "SELECT COUNT(*) as conversations_today FROM conversation_history WHERE created_at > CURRENT_DATE;"

echo ""
echo "=== End Report ==="
```

---

## 9. What to Watch For

### Red Flags:
- ⚠️ Error rate > 5%
- ⚠️ Response time > 5 seconds
- ⚠️ No new users for 24 hours (if you're actively testing)
- ⚠️ Backend not responding to health check
- ⚠️ AWS costs > $50/month unexpectedly

### Good Signs:
- ✅ Users creating accounts
- ✅ Multiple conversations per user
- ✅ Activities being saved
- ✅ Training feedback being collected
- ✅ Low error rates

---

## 10. Important Notes

### Claude API "Learning"
**Claude does NOT learn from your users automatically.** 

What you have:
- Training Mode collects feedback
- Data stored in `training_feedback` table
- You manually analyze and improve prompts

To "improve" the system:
1. Review training data weekly
2. Identify patterns (low approval rates)
3. Update system prompts in backend
4. Update vibe lexicon
5. Test improvements
6. Deploy updates

### Privacy Considerations
- User conversations are stored in database
- Be transparent about data collection
- Consider adding privacy policy
- Allow users to delete their data

---

## Quick Reference Commands

```bash
# Connect to database
PGPASSWORD='zyprif-2cuQxa-jowgoc' psql "sslmode=require host=vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com port=5432 dbname=vibe_app user=vibeadmin"

# Check backend health
curl http://3.79.12.161:3000/api/health

# SSH to EC2
ssh -i ~/Downloads/vibe-app-key.pem ec2-user@3.79.12.161

# Check PM2 status
pm2 status

# View logs
pm2 logs vibe-backend --lines 50
```

---

**Next Steps:**
1. Add API usage logging to backend (optional but recommended)
2. Run daily database queries to monitor users
3. Check AWS billing dashboard weekly
4. Review training data monthly to improve prompts
