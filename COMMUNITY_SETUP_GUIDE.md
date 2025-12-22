# Community Tab Setup Guide 🚀

Quick guide to set up and test the Community Tab with sample data.

---

## Step 1: Run Database Migration

This creates all the necessary tables for the Community Tab.

```bash
cd backend
psql vibe_app < database/migrations/014_community_features.sql
```

**Expected output:**
```
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
CREATE TRIGGER
CREATE VIEW
```

**Verify tables were created:**
```bash
psql vibe_app -c "\dt community*"
```

You should see:
- `community_posts`
- `post_likes`
- `post_comments`
- `activity_reviews`
- `challenge_completions`
- `content_reports`
- `beta_waitlist`
- `push_notification_tokens`

---

## Step 2: Seed Sample Data

This creates 5 test accounts with 15 posts, likes, comments, and challenge completions.

```bash
cd backend
npx tsx scripts/seed-community-data.ts
```

**Expected output:**
```
🌱 Starting community data seeding...

📝 Creating sample posts...
✅ Created 15 posts

❤️  Adding likes...
✅ Added 40 likes

💬 Adding comments...
✅ Added 9 comments

🏆 Adding challenge completions...
✅ Added 10 challenge completions

📊 Summary Statistics:
   Posts:      15
   Likes:      40
   Comments:   9
   Challenges: 10

📱 Test User Accounts:
   Alex (user_alex_2024)
   Maria (user_maria_2024)
   David (user_david_2024)
   Sofia (user_sofia_2024)
   Chris (user_chris_2024)

✨ Community data seeding complete!
```

---

## Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
Server running on port 3000
Database connected
```

**Test the API:**
```bash
# Get feed
curl http://localhost:3000/api/community/feed?userId=user_alex_2024&limit=10

# Get leaderboard
curl http://localhost:3000/api/community/leaderboard?period=weekly
```

---

## Step 4: Start the App

In a new terminal:

```bash
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator.

---

## Step 5: Test the Community Tab

### Navigate to Community Tab
1. Open the app
2. Tap the Community icon (👥) in the bottom navigation
3. You should see the Feed tab with 15 posts!

### Test Feed Features
- ✅ Scroll through posts from different users
- ✅ See user avatars with initials (A, M, D, S, C)
- ✅ See post types (✅ Completed, 🔥 Challenge, 🌊 Vibe Check)
- ✅ See likes and comment counts
- ✅ Tap ❤️ to like/unlike posts
- ✅ Pull down to refresh
- ✅ Scroll to load more (pagination)

### Test Create Post
- ✅ Tap the floating ✨ button
- ✅ Select post type (Vibe Check or Completed Activity)
- ✅ Add content
- ✅ Add vibe before/after
- ✅ Tap "Choose Photo" or "Take Photo"
- ✅ Submit post
- ✅ See your new post appear at the top of the feed

### Test Leaderboard
- ✅ Tap "Leaderboard" tab
- ✅ See rankings with points
- ✅ See top 3 highlighted with gradients
- ✅ Switch between Weekly, Monthly, All Time
- ✅ See challenge counts and difficulty levels

### Test My Activity
- ✅ Tap "My Activity" tab
- ✅ See stats grid (Posts, Reviews, Challenges, Points)
- ✅ See engagement summary
- ✅ See progress bars

---

## Test User Accounts

You can use these user IDs to test different perspectives:

| Nickname | User ID | Posts | Challenges | Points |
|----------|---------|-------|------------|--------|
| Alex | user_alex_2024 | 3 | 2 | 250 |
| Maria | user_maria_2024 | 3 | 2 | 250 |
| David | user_david_2024 | 3 | 2 | 350 |
| Sofia | user_sofia_2024 | 3 | 2 | 200 |
| Chris | user_chris_2024 | 3 | 2 | 450 |

**To switch users in the app:**
The app uses AsyncStorage for the current user. You'll need to modify the user ID in your app's storage or create a dev menu option to switch users.

---

## Sample Posts Created

1. **Alex** - Yoga session (completion)
2. **Maria** - Coffee vibes (vibe check)
3. **David** - Mountain biking (challenge) 🏆
4. **Sofia** - Wine tasting (completion)
5. **Chris** - Reading day (vibe check)
6. **Alex** - Rock climbing (completion)
7. **Maria** - Sunrise hike (challenge) 🏆
8. **David** - Market vibes (vibe check)
9. **Sofia** - Pottery class (completion)
10. **Chris** - Paragliding (challenge) 🏆
11. **Alex** - Coding session (vibe check)
12. **Maria** - Spa day (completion)
13. **David** - Cooking class (completion)
14. **Sofia** - Gallery hopping (vibe check)
15. **Chris** - Escape room (completion)

Posts have realistic timestamps (spread over the last 7 days) and engagement (likes and comments).

---

## Troubleshooting

### Migration fails
```bash
# Check if tables already exist
psql vibe_app -c "\dt community*"

# If they exist, drop them first (WARNING: deletes data)
psql vibe_app -c "DROP TABLE IF EXISTS community_posts CASCADE;"
# Then run migration again
```

### Seeding fails
```bash
# Check database connection
psql vibe_app -c "SELECT 1;"

# Check if .env file exists
cat backend/.env

# Make sure DATABASE_URL is set correctly
```

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

### App can't connect to backend
- Make sure backend is running on port 3000
- Check `src/config/api.ts` for correct API URL
- For iOS simulator: use `http://localhost:3000`
- For Android emulator: use `http://10.0.2.2:3000`

---

## Reset Everything

If you want to start fresh:

```bash
# Drop all community tables
psql vibe_app << EOF
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS post_comments CASCADE;
DROP TABLE IF EXISTS activity_reviews CASCADE;
DROP TABLE IF EXISTS challenge_completions CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS beta_waitlist CASCADE;
DROP TABLE IF EXISTS push_notification_tokens CASCADE;
DROP VIEW IF EXISTS weekly_challenge_leaderboard CASCADE;
DROP VIEW IF EXISTS monthly_challenge_leaderboard CASCADE;
DROP VIEW IF EXISTS alltime_challenge_leaderboard CASCADE;
EOF

# Run migration again
psql vibe_app < backend/database/migrations/014_community_features.sql

# Seed data again
npx tsx backend/scripts/seed-community-data.ts
```

---

## What's Next?

After testing, you might want to:

1. **Add more test data** - Modify `seed-community-data.ts` to add more posts
2. **Test edge cases** - Empty states, long content, many likes, etc.
3. **Add comment detail view** - Modal to view all comments on a post
4. **Set up push notifications** - Configure Expo Notifications
5. **Add image CDN** - Upload photos to Cloudinary or S3
6. **Add activity picker** - Select activity when creating post
7. **Add user profiles** - Tap avatar to view user's posts

---

## Quick Commands Reference

```bash
# Migration
psql vibe_app < backend/database/migrations/014_community_features.sql

# Seed data
npx tsx backend/scripts/seed-community-data.ts

# Start backend
cd backend && npm run dev

# Start app
npm start

# Check tables
psql vibe_app -c "\dt community*"

# Check data
psql vibe_app -c "SELECT COUNT(*) FROM community_posts;"
psql vibe_app -c "SELECT * FROM weekly_challenge_leaderboard;"
```

---

## 🎉 You're Ready!

Run the three commands and enjoy your fully populated Community Tab!

```bash
# 1. Migration
psql vibe_app < backend/database/migrations/014_community_features.sql

# 2. Seed data
npx tsx backend/scripts/seed-community-data.ts

# 3. Start servers
cd backend && npm run dev  # Terminal 1
npm start                   # Terminal 2
```

Then open the app and tap the Community icon (👥) to see your vibrant community! 🌊
