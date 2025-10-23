# How to Use Activity Filters 🎯

## Where to Find Filters

The filter button appears **at the top of the chat screen**, right below the gradient header.

## Visual States

### Collapsed (Default)
You'll see a button that says:
- **"Add Filters"** - When no filters are active
- **"Filters Active"** with emoji badges (📍 ⏱️ 👥 🎯 💰) - When filters are applied

### Expanded (After Tapping)
The full filter panel opens showing all filter categories with beautiful cards and icons.

## How to Use

### 1. Open Chat
- Tap on any conversation or start a new one
- Look for the filter button at the top of the screen

### 2. Tap "Add Filters"
- The filter panel expands
- You'll see all available filter options organized by category

### 3. Select Your Preferences

**📍 Distance** (requires location permission)
- Tap a distance range: Nearby, Walking, Biking, In City, or Anywhere
- The app will use your GPS location to filter activities

**⏱️ Duration**
- Select how much time you have: Quick, Short, Medium, Long, or Full Day
- Single selection (one at a time)

**👥 Crowd Size**
- Choose preferred crowd sizes: Intimate, Small, Medium, Large, or Massive
- Multi-select (tap multiple options)

**🌍 Vibe (Crowd Type)**
- Pick the atmosphere: Locals, Mixed, or Tourists
- Multi-select

**🎯 Group Size**
- Select who you're with: Solo, Couples, Small Group, or Large Group
- Multi-select

**💰 Price**
- Set your budget: Free, Budget, Moderate, Premium, or Luxury
- Multi-select

### 4. Apply Filters
- Tap the blue **"Apply Filters"** button at the bottom
- The panel closes and badges appear on the collapsed filter button

### 5. Ask Your Vibe
- Type your message normally: "I want something creative"
- The AI will only show activities matching your filters
- Results will be sorted by distance if location is enabled

### 6. Clear Filters (Optional)
- Expand the filter panel again
- Tap **"Clear All"** to remove all filters
- Or individually deselect options

## Examples

### Example 1: Quick Nearby Activity
```
Filters:
📍 Nearby (< 2km)
⏱️ Quick (< 1h)
💰 Free, Budget

Vibe: "I need a break"
Results: Parks, quick walks, free nature spots within 2km
```

### Example 2: Solo Evening Activity
```
Filters:
⏱️ Medium (2-4h)
🎯 Solo-friendly
👥 Intimate, Small
💰 Moderate

Vibe: "I'm feeling creative"
Results: Workshops, classes, solo-friendly creative activities
```

### Example 3: Weekend Adventure
```
Filters:
📍 In City (< 20km)
⏱️ Full Day (6h+)
🎯 Small Group
👥 Medium
💰 Moderate, Premium

Vibe: "adventure with friends"
Results: Day trips, sports, adventure activities for groups
```

## Tips

### Location Permissions
- **Allow location access** when prompted to enable distance filtering
- Without location, distance filters won't appear
- Location updates automatically in the background

### Filter Combinations
- **Start broad, then narrow**: Try 1-2 filters first, add more if needed
- **Mix and match**: Combine different filter types for precise results
- **Too restrictive?**: If you get no results, try removing some filters

### Active Filter Badges
The collapsed filter button shows emoji badges for active filter types:
- 📍 = Distance filter active
- ⏱️ = Duration filter active
- 👥 = Crowd size filter active
- 🎯 = Group suitability filter active
- 💰 = Price filter active

### Performance
- Filters are **super fast** (< 100ms)
- Distance calculations use GPS for accuracy
- Results update instantly

## Troubleshooting

### "I don't see the filter button"
- Make sure you're on the **ChatConversationScreen**
- Check you have the latest code updates
- Try restarting the app

### "Distance filters don't appear"
- The app needs location permission
- Grant permission when prompted
- Check your device location services are enabled

### "No results with my filters"
- Your filter combination might be too restrictive
- Try removing one filter at a time
- Use "Clear All" and start over

### "Filters don't seem to work"
- Make sure you tapped **"Apply Filters"**
- Check the backend server is running
- Look for filter badges on the collapsed button

## Filter Icons Reference

| Icon | Meaning |
|------|---------|
| 🚶 walk | Nearby/Walking distance |
| 🚲 bicycle | Biking distance |
| 🚗 car | In City (driving) |
| 🌍 globe | Anywhere / Massive crowds |
| ⚡ flash | Quick duration |
| ⏰ time | Short duration |
| ⏳ hourglass | Medium duration |
| ⏲️ timer | Long duration |
| ☀️ sunny | Full day |
| ❤️ heart | Intimate crowd / Couples |
| 👥 people | Small/Medium crowd / Small group |
| 🎯 target | Group activities |
| 🎁 gift | Free activities |
| 💵 cash | Budget |
| 💳 card | Moderate |
| 💎 diamond | Premium |
| ⭐ star | Luxury |
| 🏠 home | Locals vibe |
| ✈️ airplane | Tourists vibe |

## What Happens Behind the Scenes

1. **You select filters** → Stored in local state
2. **You send a vibe message** → Filters + location sent to API
3. **Backend filters database** → SQL query with your constraints
4. **Distance calculation** → Haversine formula for accuracy
5. **Feedback integration** → Poorly-rated activities removed
6. **Semantic matching** → AI matches vibe to filtered activities
7. **Results sorted** → By distance (if location) and quality
8. **You see results** → Only activities matching ALL your filters

## Advanced Tips

### Save Time with Common Filters
If you always use certain filters, consider:
- Keep distance at "In City" for broader options
- Use "Any Duration" unless time-constrained
- Multi-select price tiers to avoid missing options

### Combine with Vibes
Filters work WITH your vibe, not instead of it:
- Good: "creative" + Solo-friendly + Moderate price
- Good: "adventure" + Biking distance + Full day
- Good: "relax" + Intimate + Premium

### Discover Hidden Gems
Try these filter combos:
- **Local secrets**: Locals vibe + Intimate + < 5km
- **Budget adventures**: Free/Budget + Full day + Outdoor
- **Premium experiences**: Premium/Luxury + Intimate + Locals

---

**The filter system is now live in your app! 🎉**

Tap the filter button, explore the options, and enjoy perfectly matched activity recommendations!
