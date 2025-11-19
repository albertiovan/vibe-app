# Quick Setup: ML-Ready Suggestions 🚀

## 🔧 **Setup Steps**

### **1. Run Database Migration**
```bash
cd /Users/aai/CascadeProjects/vibe-app/backend
psql -d vibe_app -f database/migrations/006_activity_feedback.sql
```

**Expected output:**
```
CREATE TABLE
CREATE TABLE
COMMENT
COMMENT
```

---

### **2. Restart Backend**
```bash
cd /Users/aai/CascadeProjects/vibe-app/backend
npm run dev
```

**Expected output:**
```
✅ Environment validated
🚀 Server running on http://localhost:3000
```

---

### **3. Reload Mobile App**
- **Shake device** → Press "Reload"
- Or restart Expo with `npx expo start`

---

## 🧪 **Test the New Flow**

### **Test 1: Browse Activities**
1. Open app
2. Type "outdoor adventure" in search
3. Press enter
4. **Expected:** Full-screen card appears
5. Swipe right → See card 2 of 5
6. Swipe left → Back to card 1 of 5
7. **Success!** ✅

### **Test 2: Accept Activity**
1. Browse to any card
2. Read all the information
3. Press **ACCEPT** button (blue gradient)
4. **Expected:** Exciting screen with glowing GO NOW button
5. Button should pulse and glow
6. Press **GO NOW**
7. **Expected:** Opens Google Maps
8. **Success!** ✅

### **Test 3: Deny Activity**
1. Browse to any card
2. Press **DENY** button (red)
3. **Expected:** Shows next card
4. Deny all 5 cards
5. **Expected:** Alert "All Activities Reviewed"
6. **Success!** ✅

### **Test 4: ML Tracking**
1. Accept 2 activities
2. Deny 3 activities
3. Check backend logs:
   ```
   📊 Activity feedback: accepted - Activity 5 by user_123
   📊 Activity feedback: denied - Activity 8 by user_123
   ```
4. Check database:
   ```bash
   psql -d vibe_app -c "SELECT * FROM activity_feedback ORDER BY created_at DESC LIMIT 5;"
   ```
5. **Expected:** See your accept/deny decisions
6. **Success!** ✅

---

## 🎯 **Key Features to Notice**

### **1. Full-Screen Cards**
- ✅ Background image (if available)
- ✅ Activity name (large title)
- ✅ Counter "1 of 5"
- ✅ Duration, distance, indoor/outdoor
- ✅ Location (city/region)
- ✅ Full description
- ✅ Energy level badge
- ✅ Website button (if available)

### **2. Swipe Navigation**
- ✅ Swipe right → Next card
- ✅ Swipe left → Previous card
- ✅ Can browse back and forth
- ✅ Different from Challenge Me (no swipe to accept/deny)

### **3. Accept/Deny Buttons**
- ✅ DENY button: Red gradient, left side
- ✅ ACCEPT button: Blue gradient, right side
- ✅ Large and easy to tap
- ✅ Clear visual feedback

### **4. Activity Accepted Screen**
- ✅ Animated entrance
- ✅ Success icon with gradient
- ✅ Activity name displayed
- ✅ Glowing GO NOW button
- ✅ Pulsing animation
- ✅ Opens Google Maps

### **5. ML Tracking**
- ✅ Every decision tracked
- ✅ Stored in database
- ✅ API endpoints for stats
- ✅ Ready for ML algorithms

---

## 🐛 **Troubleshooting**

### **Problem: Cards not showing**
**Solution:**
1. Check backend is running
2. Check API URL in `.env`
3. Reload app

### **Problem: GO NOW doesn't open maps**
**Solution:**
1. Check activity has latitude/longitude
2. Check Google Maps is installed
3. Check console logs for errors

### **Problem: ML tracking not working**
**Solution:**
1. Check database migration ran successfully
2. Check backend logs for errors
3. Verify `/api/activities/feedback` endpoint exists

### **Problem: Swipe not working**
**Solution:**
1. Make sure you're swiping on the card area
2. Try swiping faster
3. Check FlatList is rendering correctly

---

## 📊 **Check ML Data**

### **View Feedback Stats:**
```bash
curl "http://localhost:3000/api/activities/feedback/stats?deviceId=YOUR_DEVICE_ID"
```

### **View Recommendations:**
```bash
curl "http://localhost:3000/api/activities/feedback/recommendations?deviceId=YOUR_DEVICE_ID&limit=5"
```

### **View Raw Data:**
```bash
psql -d vibe_app -c "SELECT 
  af.action,
  a.name as activity_name,
  a.category,
  af.created_at
FROM activity_feedback af
JOIN activities a ON a.id = af.activity_id
ORDER BY af.created_at DESC
LIMIT 10;"
```

---

## 🎉 **You're All Set!**

The app now has:
- ✅ Full-screen swipeable activity cards
- ✅ Comprehensive information display
- ✅ Accept/Deny buttons for user feedback
- ✅ Exciting "Activity Accepted" screen
- ✅ ML tracking system
- ✅ Different design from Challenge Me

**Start using the app and watch it learn your preferences!** 🤖✨
