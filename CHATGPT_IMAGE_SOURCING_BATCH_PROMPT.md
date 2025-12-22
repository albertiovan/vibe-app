# ChatGPT Image Sourcing - Romanian Activities Database

## YOUR MISSION
Find 3-5 high-quality, verified image URLs for activities in the batch below. These images will be used in a mobile app carousel for activity cards.

---

## IMAGE QUALITY REQUIREMENTS

### Resolution & Format
- **Minimum**: 1200x800px (landscape preferred)
- **Format**: JPG or PNG only
- **Direct URLs**: Must be direct image links (ending in .jpg, .png, etc.)

### Approved Sources
1. **Unsplash** (unsplash.com) - Best quality, free to use
2. **Pexels** (pexels.com) - High quality stock photos
3. **Pixabay** (pixabay.com) - Free images
4. **Official Tourism Sites** (romania-tourism.com, visitbucharest.today)
5. **Venue Websites** (when publicly accessible)

### Content Guidelines
✅ **DO**: Show actual locations, capture activity mood, show people engaged in activity
❌ **AVOID**: Generic stock photos, watermarks, blurry images, unrelated content

---

## OUTPUT FORMAT (CRITICAL)

Provide results as a **JSON array** with this EXACT structure:

```json
[
  {
    "id": 1,
    "name": "Therme București Wellness Day",
    "image_urls": [
      "https://images.unsplash.com/photo-1234567890/therme-pool.jpg",
      "https://images.pexels.com/photos/1234567/spa-wellness.jpg",
      "https://images.unsplash.com/photo-9876543210/thermal-bath.jpg"
    ]
  },
  {
    "id": 2,
    "name": "Peleș Castle Guided Visit",
    "image_urls": [
      "https://images.unsplash.com/photo-1234567890/peles-castle.jpg",
      "https://images.pexels.com/photos/1234567/peles-interior.jpg"
    ]
  }
]
```

**Rules**:
- 3-5 images per activity (minimum 3, maximum 5)
- Direct image URLs only
- Order by relevance (best first)
- Test URLs are accessible

---

## BATCH 1: Activities 1-50

1. Therme București Wellness Day - Bucharest, București-Ilfov - wellness
2. Peleș Castle Guided Visit - Sinaia, Prahova - culture
3. Bran Castle (Dracula's Castle) Visit - Bran, Brașov - culture
4. Brașov Old Town Walking Tour - Brașov, Brașov - culture
5. Skiing in Poiana Brașov - Poiana Brașov, Brașov - sports
6. Danube Delta Boat Safari from Tulcea - Tulcea, Tulcea - nature
7. Wine Tasting in Dealu Mare - Dealu Mare, Prahova - culinary
8. Transfăgărășan Scenic Day Tour - Bucharest, Sibiu - adventure
9. Turda Salt Mine Underground Park - Turda, Cluj - culture
10. Dimitrie Gusti National Village Museum - Bucharest, Bucharest - culture
11. Bucovina Painted Monasteries Tour - Suceava, Suceava - culture
12. Bear Watching from a Hide (Brașov) - Brașov, Brașov - nature
13. Parc Aventura Brașov Zipline & Ropes - Brașov, Brașov - adventure
14. Black Sea Sea-Kayaking (Mangalia) - Mangalia, Constanța - water
15. Electronic Club Night in Bucharest - Bucharest, București - nightlife
16. Cluj Live Music & Club Night - Cluj-Napoca, Cluj - nightlife
17. Timisoara Club Night - Timișoara, Timiș - nightlife
18. Iași Night Out (Bars & Clubs) - Iași, Iași - nightlife
19. Bucharest Escape Room Challenge - Bucharest, București - social
20. Cluj Escape Room Adventure - Cluj-Napoca, Cluj - social
21. Bucharest Yoga Class (Vinyasa/Hatha) - Bucharest, București - fitness
22. CrossFit Session in Cluj - Cluj-Napoca, Cluj - fitness
23. CrossFit Session in Bucharest - Bucharest, București - fitness
24. Oradea Thermal Aqua Day (Aquaparks) - Oradea, Bihor - wellness
25. Sovata Bear Lake & Spa Day - Sovata, Mureș - wellness
26. Balvanyos Forest Spa Ritual - Balvanyos, Covasna - wellness
27. Black Sea Coastal Kayaking Coaching - Constanța, Constanța - water
28. Wakeboarding Session near Bucharest - Snagov, Ilfov - water
29. Intro to Golf in Transylvania - Apahida, Cluj - sports
30. Romantic Boat Ride on Herăstrău Lake - Bucharest, București - romance
31. Hot Air Balloon Flight near Cluj - Cluj-Napoca, Cluj - romance
32. Christmas Market Sibiu (Piața Mare) - Sibiu, Sibiu - seasonal
33. Christmas Market Cluj-Napoca (Piața Unirii) - Cluj-Napoca, Cluj - seasonal
34. Christmas Market Bucharest (Constitution Square) - Bucharest, București - seasonal
35. Christmas Market Timișoara (Victory Square) - Bucharest, Timiș - seasonal
36. Bucharest Traditional Food Tour - Bucharest, București - culinary
37. Romanian Cooking Class in Bucharest - Cluj-Napoca, București - culinary
38. Cluj-Napoca Street Food & Market Tasting - Cluj-Napoca, Cluj - culinary
39. Sibiu Old Town Food Tour - Sibiu, Sibiu - culinary
40. Timișoara Craft Beer Tasting Crawl - Timișoara, Timiș - culinary
41. Gramma Winery Visit & Tasting (Iași) - Vișan, Iași - culinary
42. Domeniul Bogdan Organic Winery Tour - Medgidia, Constanța - culinary
43. Dealu Mare Winery Trio (Lacerta/Serve/Budureasca) - Fințești, Prahova - culinary
44. Constanța Seafood Tasting Experience - Constanța, Constanța - culinary
45. Improvisation Theatre Workshop (Bucharest) - Bucharest, București - creative
46. Salsa/Bachata Beginner Class (Bucharest) - Bucharest, București - creative
47. Cyanotype & Alternative Photography Workshop - Bucharest, București - creative
48. Screen Printing Basics (Bucharest) - Bucharest, București - creative
49. Icon on Glass Workshop (ASTRA Museum) - Sibiu, Sibiu - creative
50. Weaving on the Loom (ASTRA Museum) - Sibiu, Sibiu - creative

---

## SEARCH TIPS

1. **Specific First**: Search venue name (e.g., "Therme Bucharest")
2. **Then Generic**: Activity + location (e.g., "thermal spa Romania")
3. **Category Keywords**: Use category (e.g., "nightlife Bucharest", "hiking Carpathians")
4. **Quality Over Quantity**: 3 excellent images > 5 mediocre ones

---

## READY TO START?

Copy the JSON array format above and fill in the image URLs for all 50 activities in this batch. When done, paste the complete JSON array so I can import it directly.

**IMPORTANT**: Make sure your response is ONLY the JSON array - no extra text before or after!
