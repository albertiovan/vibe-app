# ChatGPT Image Sourcing Task - Romanian Activity Database

## YOUR MISSION
Find 3-5 high-quality, verified image URLs for EACH of the 420 activities listed below. These images will be used in a mobile app carousel for activity cards.

## CRITICAL REQUIREMENTS

### Image Quality Standards
1. **Resolution**: Minimum 1200x800px (landscape orientation preferred)
2. **Format**: JPG or PNG only
3. **Source**: Use ONLY verified, publicly accessible URLs from:
   - Unsplash (unsplash.com)
   - Pexels (pexels.com)
   - Pixabay (pixabay.com)
   - Official tourism websites (romania-tourism.com, visitbucharest.today, etc.)
   - Official venue websites (when available)

4. **Content Requirements**:
   - Images must be RELEVANT to the specific activity
   - Show the actual location/venue when possible
   - Capture the mood and energy level of the activity
   - For nightlife: show the venue atmosphere, crowds, lighting
   - For nature: show the actual landscape/trail/location
   - For culture: show the monument/museum/building
   - For sports: show people doing the activity
   - For wellness: show the spa/thermal bath/facility
   - For culinary: show the food, wine, or dining experience

5. **Avoid**:
   - Stock photos that look generic
   - Images with watermarks
   - Low resolution or blurry images
   - Images that don't match the activity description

### Output Format
For EACH activity, provide the data in this EXACT format:

```json
{
  "id": 1,
  "name": "Therme București Wellness Day",
  "image_urls": [
    "https://images.unsplash.com/photo-1234567890/therme-bucharest-pool.jpg",
    "https://images.pexels.com/photos/1234567/spa-thermal-bath.jpg",
    "https://images.unsplash.com/photo-9876543210/wellness-relaxation.jpg"
  ]
}
```

### Important Notes
- Provide 3-5 images per activity (minimum 3, maximum 5)
- Each image URL must be a direct link to the image file
- Test that URLs are accessible (return 200 OK)
- Order images by relevance (best/most representative first)
- For activities in the same location, you can reuse some images but try to vary them

## ACTIVITIES DATABASE (420 Total)

### Activities 1-50
1. Therme București Wellness Day - București-Ilfov, Bucharest - wellness
2. Peleș Castle Guided Visit - Prahova, Sinaia - culture
3. Bran Castle (Dracula's Castle) Visit - Brașov, Bran - culture
4. Brașov Old Town Walking Tour - Brașov, Brașov - culture
5. Skiing in Poiana Brașov - Brașov, Poiana Brașov - sports
6. Danube Delta Boat Safari from Tulcea - Tulcea, Tulcea - nature
7. Wine Tasting in Dealu Mare - Prahova, Dealu Mare - culinary
8. Transfăgărășan Scenic Day Tour - Sibiu, Sibiu - adventure
9. Turda Salt Mine Underground Park - Cluj, Turda - culture
10. Dimitrie Gusti National Village Museum - Bucharest, Bucharest - culture
11. Bucovina Painted Monasteries Tour - Suceava, Suceava - culture
12. Bear Watching from a Hide (Brașov) - Brașov, Brașov - nature
13. Parc Aventura Brașov Zipline & Ropes - Brașov, Brașov - adventure
14. Black Sea Sea-Kayaking (Mangalia) - Constanța, Mangalia - water
15. Electronic Club Night in Bucharest - București, Bucharest - nightlife
16. Cluj Live Music & Club Night - Cluj, Cluj-Napoca - nightlife
17. Timisoara Club Night - Timiș, Timișoara - nightlife
18. Iași Night Out (Bars & Clubs) - Iași, Iași - nightlife
19. Bucharest Escape Room Challenge - București, Bucharest - social
20. Cluj Escape Room Adventure - Cluj, Cluj-Napoca - social
21. Bucharest Yoga Class (Vinyasa/Hatha) - București, Bucharest - fitness
22. CrossFit Session in Cluj - Cluj, Cluj-Napoca - fitness
23. CrossFit Session in Bucharest - București, Bucharest - fitness
24. Oradea Thermal Aqua Day (Aquaparks) - Bihor, Oradea - wellness
25. Sovata Bear Lake & Spa Day - Mureș, Sovata - wellness
26. Balvanyos Forest Spa Ritual - Covasna, Balvanyos - wellness
27. Black Sea Coastal Kayaking Coaching - Constanța, Constanța - water
28. Wakeboarding Session near Bucharest - Ilfov, Snagov - water
29. Intro to Golf in Transylvania - Cluj, Apahida - sports
30. Romantic Boat Ride on Herăstrău Lake - București, Bucharest - romance
31. Hot Air Balloon Flight near Cluj - Cluj, Cluj-Napoca - romance
32. Christmas Market Sibiu (Piața Mare) - Sibiu, Sibiu - seasonal
33. Christmas Market Cluj-Napoca (Piața Unirii) - Cluj, Cluj-Napoca - seasonal
34. Christmas Market Bucharest (Constitution Square) - București, Bucharest - seasonal
35. Christmas Market Timișoara (Victory Square) - Timiș, Timișoara - seasonal
36. Bucharest Traditional Food Tour - București, Bucharest - culinary
37. Romanian Cooking Class in Bucharest - București, Bucharest - culinary
38. Cluj-Napoca Street Food & Market Tasting - Cluj, Cluj-Napoca - culinary
39. Sibiu Old Town Food Tour - Sibiu, Sibiu - culinary
40. Timișoara Craft Beer Tasting Crawl - Timiș, Timișoara - culinary
41. Gramma Winery Visit & Tasting (Iași) - Iași, Iași - culinary
42. Domeniul Bogdan Organic Winery Tour - Constanța, Peștera - culinary
43. Dealu Mare Winery Trio (Lacerta/Serve/Budureasca) - Prahova, Ceptura - culinary
44. Constanța Seafood Tasting Experience - Constanța, Constanța - culinary
45. Improvisation Theatre Workshop (Bucharest) - București, Bucharest - creative
46. Salsa/Bachata Beginner Class (Bucharest) - București, Bucharest - creative
47. Cyanotype & Alternative Photography Workshop - București, Bucharest - creative
48. Screen Printing Basics (Bucharest) - București, Bucharest - creative
49. Icon on Glass Workshop (ASTRA Museum) - Sibiu, Sibiu - creative
50. Weaving on the Loom (ASTRA Museum) - Sibiu, Sibiu - creative

### Activities 51-100
51. Romanian Language Crash Course (Bucharest) - București, Bucharest - learning
52. Specialty Coffee Brewing Class (Bucharest) - București, Bucharest - learning
53. Barista Basics Workshop (Cluj) - Cluj, Cluj-Napoca - learning
54. Sibiu Traditional Cooking Class - Sibiu, Sibiu - learning
55. Intro to Romanian Wine (Bucharest) - București, Bucharest - learning
56. Sound Bath & Breathwork (Bucharest) - București, Bucharest - mindfulness
57. Halotherapy & Mindful Walk – Turda Salt Mine - Cluj, Turda - mindfulness
58. Salt Mine Wellness Session – Praid - Harghita, Praid - mindfulness
59. Therme Sauna Rituals & Mindful Heat - Ilfov, Balotești - mindfulness
60. Ana Aslan Health Spa Day – Eforie Nord - Constanța, Eforie Nord - wellness
61. Aqvatonic Med Spa Pass – Eforie Nord - Constanța, Eforie Nord - wellness
62. Leaota Mountain Horseback Trail Ride - Dâmbovița, Runcu - nature
63. Bucegi Plateau Hike: Babele & Sphinx - Prahova, Bușteni - nature
64. Scărișoara Ice Cave & Apuseni Views - Alba, Gârda de Sus - nature
65. Cheile Turzii Gorge Guided Hike - Cluj, Tureni - nature
66. Retezat National Park Day Hike - Hunedoara, Râușor - nature
67. Viscri Pastures Bike & Haystack Walk - Brașov, Viscri - nature
68. Board Game Night in Bucharest Old Town - București, Bucharest - social
69. Pub Quiz Night in the Old Town (Mojo & The PUB) - București, Bucharest - social
70. Karaoke Night in Bucharest - București, Bucharest - social
71. Trivia Night at The Harp Irish Pub - București, Bucharest - social
72. Bucharest Pub Crawl Experience - București, Bucharest - social
73. Cluj Pub Crawl - Cluj, Cluj-Napoca - social
74. Timișoara Pub Crawl - Timiș, Timișoara - social
75. Brașov Pub Crawl - Brașov, Brașov - social
76. Bucharest Street Art & Graffiti Tour - București, Bucharest - culture
77. Communist Bucharest Walking Tour - București, Bucharest - culture
78. Comana Adventure Park & Kayak - Giurgiu, Comana - adventure
79. Paintball Battle in Bucharest - București, Bucharest - adventure
80. Go-Karting in Bucharest - București, Bucharest - adventure
81. Indoor Skydiving Experience (Bucharest) - București, Bucharest - adventure
82. Bungee Jumping from Bâlea Viaduct - Sibiu, Bâlea Lac - adventure
83. Via Ferrata Climbing in Piatra Craiului - Brașov, Zărnești - adventure
84. Canyoning in Apuseni Mountains - Alba, Arieșeni - adventure
85. Paragliding in Brașov - Brașov, Brașov - adventure
86. Mountain Biking in Bucegi - Prahova, Bușteni - adventure
87. Rock Climbing in Cheile Turzii - Cluj, Tureni - adventure
88. Ice Climbing in Făgăraș Mountains - Brașov, Bâlea Lac - adventure
89. Snowshoeing in Piatra Craiului - Brașov, Zărnești - adventure
90. Dog Sledding in Bucovina - Suceava, Vatra Dornei - adventure
91. Rafting on Jiu River - Gorj, Bumbești-Jiu - adventure
92. Indoor Climbing Session (Top-rope & Bouldering) - București, Bucharest - adventure
93. Bucharest Bike Tour - București, Bucharest - culture
94. Cluj Bike Tour - Cluj, Cluj-Napoca - culture
95. Timișoara Bike Tour - Timiș, Timișoara - culture
96. Brașov Bike Tour - Brașov, Brașov - culture
97. Sibiu Bike Tour - Sibiu, Sibiu - culture
98. Constanța Beach Day - Constanța, Constanța - water
99. Mamaia Beach Club Day - Constanța, Mamaia - water
100. Vama Veche Beach Hangout - Constanța, Vama Veche - water

### Activities 101-200
[Continue with all remaining activities from the database - I'll provide the complete list in sections to stay within limits]

101. Stand-Up Paddleboarding on Snagov Lake - Ilfov, Snagov - water
102. Windsurfing Lessons at Mamaia - Constanța, Mamaia - water
103. Kitesurfing at Vama Veche - Constanța, Vama Veche - water
104. Scuba Diving in the Black Sea - Constanța, Constanța - water
105. Sailing Trip on the Black Sea - Constanța, Constanța - water
106. Fishing Trip on Danube Delta - Tulcea, Tulcea - water
107. Bucharest Food Market Tour - București, Bucharest - culinary
108. Cluj Food Market Tour - Cluj, Cluj-Napoca - culinary
109. Timișoara Food Market Tour - Timiș, Timișoara - culinary
110. Brașov Food Market Tour - Brașov, Brașov - culinary
... [Continue through all 420 activities]

## DELIVERY INSTRUCTIONS

1. **Format**: Provide your response as a single JSON array containing all 420 activity objects
2. **Structure**: Each object must have exactly 3 fields: `id`, `name`, `image_urls`
3. **Validation**: Ensure all URLs are accessible and direct image links
4. **Order**: Maintain the same order as the activities list (ID 1-1972)
5. **Completeness**: Do NOT skip any activities - all 420 must have images

## EXAMPLE OUTPUT STRUCTURE

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
      "https://images.unsplash.com/photo-1234567890/peles-castle-exterior.jpg",
      "https://images.pexels.com/photos/1234567/peles-interior.jpg",
      "https://images.unsplash.com/photo-9876543210/peles-gardens.jpg",
      "https://images.unsplash.com/photo-1111111111/peles-architecture.jpg"
    ]
  }
  // ... continue for all 420 activities
]
```

## TIPS FOR SUCCESS

1. **Search Strategy**:
   - Start with specific venue names (e.g., "Therme Bucharest")
   - Then search by activity type + location (e.g., "thermal spa Romania")
   - Use category keywords (e.g., "nightlife Bucharest", "hiking Carpathians")

2. **Quality Over Quantity**:
   - 3 excellent images > 5 mediocre images
   - Prioritize images that capture the essence of the activity

3. **Variety**:
   - Mix wide shots and detail shots
   - Include both day and night images for nightlife venues
   - Show different angles/perspectives

4. **Verification**:
   - Test URLs before including them
   - Ensure images load quickly
   - Check that images are landscape-oriented when possible

## START HERE

Begin with Activity ID 1 and work through all 420 activities systematically. Take your time to find quality images that will make users excited to explore these activities!

**IMPORTANT**: When you're done, paste the ENTIRE JSON array in your response so I can copy it directly into Cascade for implementation.
