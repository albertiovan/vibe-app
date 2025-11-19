# ChatGPT Prompt: Assign Energy Levels to Activities

I need you to assign energy levels to each of the following 95 activities. Based on the activity name alone, estimate whether it requires **low**, **medium**, or **high** energy. Don't research each activity—just use your judgment based on what the name suggests.

**Energy Level Guidelines:**
- **low**: Relaxing, passive, minimal physical exertion (e.g., spa, meditation, museum visits)
- **medium**: Moderate activity, some movement but not intense (e.g., walking tours, cooking classes, casual sports)
- **high**: Intense physical activity, adrenaline, or sustained exertion (e.g., skiing, rock climbing, CrossFit)

**Output Format:**
Provide the result as SQL UPDATE statements that I can copy-paste directly into my database. Use this exact format:

```sql
UPDATE activities SET energy_level = 'low' WHERE name = 'Activity Name Here';
UPDATE activities SET energy_level = 'medium' WHERE name = 'Activity Name Here';
UPDATE activities SET energy_level = 'high' WHERE name = 'Activity Name Here';
```

---

## Activities to Classify (95 total):

1. 5-a-Side Football Pitch Hire (South)
2. Ana Aslan Health Spa Day – Eforie Nord
3. Aqvatonic Med Spa Pass – Eforie Nord
4. Badminton Courts & Group Play (Sun Plaza)
5. Balvanyos Forest Spa Ritual
6. Barista Basics Workshop (Cluj)
7. Bear Watching from a Hide (Brașov)
8. Beginner Archery Class (Sector 5 Range)
9. Black Sea Coastal Kayaking Coaching
10. Black Sea Sea-Kayaking (Mangalia)
11. Board Game Night in Bucharest Old Town
12. Boat Ride on Herăstrău Lake
13. Bran Castle (Dracula's Castle) Visit
14. Brașov Old Town Walking Tour
15. Bucegi Plateau Hike: Babele & Sphinx
16. Bucharest Escape Room Challenge
17. Bucharest Language Exchange Social
18. Bucharest Traditional Food Tour
19. Bucharest Yoga Class (Vinyasa/Hatha)
20. Bucovina Painted Monasteries Tour
21. Cheile Turzii Gorge Guided Hike
22. Christmas Market Bucharest (Constitution Square)
23. Christmas Market Cluj-Napoca (Piața Unirii)
24. Christmas Market Sibiu (Piața Mare)
25. Christmas Market Timișoara (Victory Square)
26. Cluj Escape Room Adventure
27. Cluj Live Music & Club Night
28. Cluj-Napoca Street Food & Market Tasting
29. Comana Adventure Park & Kayak
30. Constanța Seafood Tasting Experience
31. Couples' Photoshoot in Old Town
32. CrossFit Session in Bucharest
33. CrossFit Session in Cluj
34. Cyanotype & Alternative Photography Workshop
35. Danube Delta Boat Safari from Tulcea
36. Dealu Mare Winery Trio (Lacerta/Serve/Budureasca)
37. Dimitrie Gusti National Village Museum
38. Domeniul Bogdan Organic Winery Tour
39. Edenland Park Zipline & Aerial Courses
40. Electronic Club Night in Bucharest
41. Escape Room Marathon (Central Bucharest)
42. Free-Roam VR Arena & Escape Games (Gateway VR)
43. Fun Bowling & Billiards at Trickshot
44. Go-Karting: VMAX (Indoor) or AMCKart (Outdoor)
45. Gramma Winery Visit & Tasting (Iași)
46. Halotherapy & Mindful Walk – Turda Salt Mine
47. Hot Air Balloon Flight near Cluj
48. Iași Night Out (Bars & Clubs)
49. Ice Skating Session (AFI Cotroceni)
50. Icon on Glass Workshop (ASTRA Museum)
51. Immersive Escape Room Adventure
52. Improvisation Theatre Workshop (Bucharest)
53. Indoor Climbing Session (Top-rope & Bouldering)
54. Intro to Golf in Transylvania
55. Intro to Romanian Wine (Bucharest)
56. Karaoke Night at Mojo Music Club
57. Laser Tag Battles
58. Leaota Mountain Horseback Trail Ride
59. NOR Sky Rooftop Dinner for Two
60. Oradea Thermal Aqua Day (Aquaparks)
61. Padel Court Booking (Romexpo Area)
62. Parc Aventura Brașov Zipline & Ropes
63. Peleș Castle Guided Visit
64. Private Boat Ride on Herăstrău Lake
65. Private Snagov Lake Boat Cruise
66. Pub Quiz Night in the Old Town (Mojo & The PUB)
67. Retezat National Park Day Hike
68. Romanian Cooking Class in Bucharest
69. Romanian Language Crash Course (Bucharest)
70. Romantic Boat Ride on Herăstrău Lake
71. Romantic Candlelight Concert (Fever)
72. Rooftop Cocktails at Linea/Closer to the Moon
73. Salsa/Bachata Beginner Class (Bucharest)
74. Salt Mine Wellness Session – Praid
75. Scărișoara Ice Cave & Apuseni Views
76. Screen Printing Basics (Bucharest)
77. Sibiu Old Town Food Tour
78. Sibiu Traditional Cooking Class
79. Skiing in Poiana Brașov
80. Sound Bath & Breathwork (Bucharest)
81. Sovata Bear Lake & Spa Day
82. Specialty Coffee Brewing Class (Bucharest)
83. Squash Session & Coaching (Central-East)
84. Stargazing at Vasile Urseanu Observatory
85. Tandem Skydiving at Clinceni Airfield
86. Therme București Wellness Day
87. Therme Sauna Rituals & Mindful Heat
88. Timisoara Club Night
89. Timișoara Craft Beer Tasting Crawl
90. Transfăgărășan Scenic Day Tour
91. Turda Salt Mine Underground Park
92. Viscri Pastures Bike & Haystack Walk
93. Wakeboarding Session near Bucharest
94. Weaving on the Loom (ASTRA Museum)
95. Wine Tasting in Dealu Mare

---

**Remember:** 
- Output SQL UPDATE statements only
- Use exact activity names as shown above
- Classify based on name alone (don't research)
- Use 'low', 'medium', or 'high' (lowercase)
