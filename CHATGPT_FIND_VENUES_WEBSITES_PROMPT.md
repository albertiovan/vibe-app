# ChatGPT Prompt: Find Venues & Websites for Romanian Activities

## Instructions
For each activity below, find the **real venue name, full address, city, coordinates (latitude/longitude), and official website** in Romania. 

**CRITICAL REQUIREMENTS:**
1. Find ACTUAL venues in Romania (Bucharest, Cluj, Brașov, Timișoara, Iași, Constanța, Sibiu, etc.)
2. Provide REAL coordinates (latitude, longitude) - use Google Maps
3. Find OFFICIAL websites (not Facebook unless that's the only option)
4. If multiple venues exist, pick the most popular/established one
5. For tours/experiences without fixed venues, use the tour operator's office/meeting point

**OUTPUT FORMAT (JSON):**
Return ONLY valid JSON array with this exact structure:

```json
[
  {
    "activity_id": 8,
    "activity_name": "Transfăgărășan Scenic Day Tour",
    "venue_name": "Transfăgărășan Tour Operators Office",
    "full_address": "Strada Example 123, Sector 1",
    "city": "Bucharest",
    "latitude": 44.4268,
    "longitude": 26.1025,
    "website": "https://example.ro"
  }
]
```

---

## ACTIVITIES TO RESEARCH (202 total)

### Adventure (1 activity)
1. **Transfăgărășan Scenic Day Tour** (ID: 8)
   - Description: Ride Romania's legendary alpine road past viaducts, tunnels and glacial lakes. Most tours run seasonally when the high pass is open, with stops at Bâlea Lake and viewpoints for photos.
   - Find: Tour operator in Bucharest or Sibiu offering this tour

---

### Creative (30 activities)

2. **Calligraphy & lettering workshop** (ID: 194)
   - Description: Practice mindful pen work with a pro instructor—strokes, letterforms, spacing, and simple compositions.
   - Find: Calligraphy workshop venue in Bucharest

3. **Contemporary Jewelry Making (Assamblage Institute)** (ID: 98)
   - Description: Romania's flagship jewelry school guides you through saw-piercing, filing, soldering and finishing to produce a silver piece.
   - Find: Assamblage Institute in Bucharest (near Jewish quarter)

4. **Cyanotype & Alternative Photography Workshop** (ID: 47)
   - Description: Blueprint-style prints using sunlight and chemistry—coat paper, arrange objects, expose, rinse and watch cyan-blue images emerge.
   - Find: Photography workshop venue in Bucharest

5. **Cyanotype & Screen Printing Lab (Allkimik)** (ID: 131)
   - Description: Hands-on printmaking in a shared studio: coat, expose, develop cyanotypes or pull screen-print editions.
   - Find: Allkimik studio in Bucharest

6. **Embroidery & Traditional Motifs – FCV** (ID: 172)
   - Description: Learn Romanian folk stitches and geometric patterns in a heritage-focused workshop.
   - Find: Fundația Calea Victoriei (FCV) in Bucharest

7. **Evening acrylic painting class (Rodia Art Studio)** (ID: 192)
   - Description: Guided acrylic painting session—canvas, brushes, and step-by-step instruction provided.
   - Find: Rodia Art Studio in Bucharest

8. **Hand-Building Ceramics Workshop (ArtTime Atelier)** (ID: 130)
   - Description: Pinch, coil and slab-build your own clay forms, then glaze and fire them in a friendly neighborhood studio.
   - Find: ArtTime Atelier in Bucharest

9. **Icon on Glass Workshop (ASTRA Museum)** (ID: 49)
   - Description: Paint a traditional Romanian reverse-glass icon using egg tempera and gold leaf under expert guidance at one of Europe's largest open-air museums.
   - Find: ASTRA Museum in Sibiu

10. **Improvisation Theatre Workshop (Bucharest)** (ID: 45)
    - Description: Learn improv games, scene-building and "yes, and" techniques in a supportive group setting.
    - Find: Improv theater venue in Bucharest

11. **Intro to Woodworking (NOD Makerspace)** (ID: 100)
    - Description: Safely use saws, sanders and routers to craft a small wooden object—cutting board, box or shelf—in Bucharest's premier makerspace.
    - Find: NOD Makerspace in Bucharest

12. **Knitting & crochet at a textile atelier** (ID: 195)
    - Description: Learn basic stitches, read patterns, and start a scarf or hat in a cozy textile studio.
    - Find: Textile/knitting workshop in Bucharest

13. **Micro-Visit: MNAR European Gallery (1 Room)** (ID: 166)
    - Description: Spend 20 minutes with one masterpiece room—Rembrandt, Rubens or French Impressionists—at the National Museum of Art.
    - Find: MNAR (Muzeul Național de Artă al României) in Bucharest

14. **Micro-Visit: Museum of Maps – 1 Gallery** (ID: 167)
    - Description: Quick cartography fix: antique maps, globes and navigation instruments in a single focused gallery.
    - Find: Museum of Maps in Bucharest

15. **Micro-visit: Theodor Aman Museum** (ID: 184)
    - Description: 15-minute visit to the intimate house-museum of Romania's 19th-century master painter.
    - Find: Theodor Aman Museum in Bucharest

16. **Micro-visit: Zambaccian Museum (one-gallery focus)** (ID: 183)
    - Description: Quick art fix in a collector's villa—Romanian modernists and French impressionists in one curated room.
    - Find: Zambaccian Museum in Bucharest

17. **Modern Calligraphy – Fundația Calea Victoriei** (ID: 171)
    - Description: Brush lettering and modern calligraphy techniques in a heritage foundation setting.
    - Find: Fundația Calea Victoriei in Bucharest

18. **Paint-your-own pottery (MadeByYou)** (ID: 193)
    - Description: Pick a bisque piece, paint it with underglazes, and collect your fired creation a week later.
    - Find: MadeByYou pottery studio in Bucharest

19. **Painting Class at Atelier Pastel (Dorobanți)** (ID: 170)
    - Description: Guided painting session with acrylics or watercolors in a bright Dorobanți studio.
    - Find: Atelier Pastel in Bucharest (Dorobanți neighborhood)

20. **Pottery basics: hand-building & glazing** (ID: 190)
    - Description: Shape clay by hand, apply glazes, and fire your pieces in a beginner-friendly ceramics studio.
    - Find: Pottery studio in Bucharest

21. **Pottery Wheel Throwing for Beginners (Clay Play)** (ID: 129)
    - Description: Center clay, pull walls and shape a bowl or mug on the wheel, then glaze and fire it.
    - Find: Clay Play pottery studio in Bucharest

22. **Pottery Workshop (Urban Crafts/Extasy)** (ID: 169)
    - Description: Hand-building or wheel-throwing session with glazing and firing included.
    - Find: Urban Crafts or Extasy pottery venue in Bucharest

23. **Quick Reset: Bookstore Browsing at Cărturești** (ID: 142)
    - Description: 20-minute browse through art books, design magazines and Romanian literature in a beautiful bookstore.
    - Find: Cărturești Carusel in Bucharest (Old Town)

24. **Quick Reset: Macca–Vilacrosse Passage Stroll** (ID: 144)
    - Description: 10-minute covered arcade walk with Belle Époque glass roof and terrace cafés.
    - Find: Macca-Vilacrosse Passage in Bucharest (coordinates for entrance)

25. **Quick Reset: MNAC Rooftop Terrace View** (ID: 143)
    - Description: 5-minute panorama from the National Museum of Contemporary Art rooftop.
    - Find: MNAC (Muzeul Național de Artă Contemporană) in Bucharest

26. **Salsa/Bachata Beginner Class (Bucharest)** (ID: 46)
    - Description: Learn basic steps, timing and partner work in a welcoming Latin dance studio.
    - Find: Salsa/Bachata dance school in Bucharest

27. **Screen Printing Basics (Bucharest)** (ID: 48)
    - Description: Design, expose a screen, mix inks and pull prints on paper or fabric in a shared printmaking studio.
    - Find: Screen printing studio in Bucharest

28. **Sewing Basics – Atelierele ILBAH** (ID: 173)
    - Description: Learn to use a sewing machine, read patterns, and complete a simple garment or accessory.
    - Find: Atelierele ILBAH in Bucharest

29. **Stained Glass (Tiffany Technique) Workshop** (ID: 99)
    - Description: Cut colored glass, wrap edges in copper foil, solder joints and assemble a small Tiffany-style panel or suncatcher.
    - Find: Stained glass workshop in Bucharest

30. **Weaving on the Loom (ASTRA Museum)** (ID: 50)
    - Description: Try a traditional wooden loom and weave a small textile sample using folk patterns at ASTRA's craft workshops.
    - Find: ASTRA Museum in Sibiu

31. **Wheel-throwing taster at CUBUL** (ID: 191)
    - Description: 90-minute intro to the pottery wheel—center, shape, and trim a piece with guidance.
    - Find: CUBUL pottery studio in Bucharest

---

### Culinary (28 activities)

32. **Chocolate Tasting Foundations (Artisan HUB events)** (ID: 133)
    - Description: Sample single-origin bars, learn tasting notes and cacao processing in a guided chocolate workshop.
    - Find: Artisan HUB or chocolate tasting venue in Bucharest

33. **Cluj-Napoca Street Food & Market Tasting** (ID: 38)
    - Description: Walking food tour through Cluj's markets and street vendors—covrigi, kürtőskalács, local cheeses and craft beer.
    - Find: Food tour operator in Cluj-Napoca

34. **Constanța Seafood Tasting Experience** (ID: 44)
    - Description: Fresh Black Sea fish, mussels and grilled seafood at a waterfront restaurant with a sommelier pairing.
    - Find: Seafood restaurant or tour operator in Constanța

35. **Dealu Mare Winery Trio (Lacerta/Serve/Budureasca)** (ID: 43)
    - Description: Visit three wineries in one day—Lacerta, SERVE and Budureasca—for tastings and vineyard tours.
    - Find: Winery tour operator or Lacerta Winery in Dealu Mare region

36. **Domeniul Bogdan Organic Winery Tour** (ID: 42)
    - Description: Organic viticulture tour and tasting at a family estate in Muntenia.
    - Find: Domeniul Bogdan winery in Romania

37. **Gramma Winery Visit & Tasting (Iași)** (ID: 41)
    - Description: Moldavian wine tasting at Gramma estate with cellar tour and local cheese pairing.
    - Find: Gramma Winery near Iași

38. **Homebakers by Grain Trip (Bread & Viennoiserie)** (ID: 106)
    - Description: Hands-on sourdough or croissant workshop with natural fermentation and lamination techniques.
    - Find: Grain Trip bakery/workshop in Bucharest

39. **Mixology & Cocktail Fundamentals (Exquisite Bar Solutions)** (ID: 104)
    - Description: Learn shaking, stirring, muddling and balancing flavors in a professional bartending workshop.
    - Find: Exquisite Bar Solutions or cocktail school in Bucharest

40. **Old Town Street Food Tour (Small Group)** (ID: 134)
    - Description: Guided tasting walk through Bucharest's Old Town—mici, covrigi, papanași and craft beer.
    - Find: Food tour operator in Bucharest

41. **Quick Reset Café: FRUDISIAC** (ID: 164)
    - Description: 15-minute smoothie bowl or fresh juice break in a bright, health-focused café.
    - Find: FRUDISIAC café in Bucharest

42. **Quick Reset Café: Steam Coffee Shop Victoriei** (ID: 162)
    - Description: 10-minute specialty coffee stop in a minimalist café on Calea Victoriei.
    - Find: Steam Coffee Shop on Calea Victoriei, Bucharest

43. **Quick Reset Café: TROFIC (City Center)** (ID: 165)
    - Description: Quick healthy bite or smoothie in a wellness-focused café.
    - Find: TROFIC café in Bucharest city center

44. **Romanian Cooking Class (Bucharest)** (ID: 35)
    - Description: Make sarmale, mămăligă and papanași from scratch with a local chef, then sit down to enjoy your feast.
    - Find: Cooking class venue in Bucharest

45. **Romanian Cooking Class (Cluj)** (ID: 37)
    - Description: Traditional Transylvanian dishes—sarmale, bulz, and cozonac—in a home kitchen or culinary studio.
    - Find: Cooking class venue in Cluj-Napoca

46. **Romanian Cooking Class (Sibiu)** (ID: 39)
    - Description: Learn Transylvanian recipes in a historic Saxon house kitchen.
    - Find: Cooking class venue in Sibiu

47. **Specialty Coffee Cupping & Barista Basics** (ID: 103)
    - Description: Taste single-origin coffees, learn cupping protocol and basic espresso extraction at a specialty roastery.
    - Find: Specialty coffee roastery in Bucharest

48. **Tea Tasting & Ceremony (Cotroceni Teahouses)** (ID: 149)
    - Description: Sample rare teas and learn brewing techniques in a traditional teahouse setting.
    - Find: Teahouse in Cotroceni, Bucharest

49. **Timișoara Craft Beer Tasting Crawl** (ID: 40)
    - Description: Guided pub crawl through Timișoara's craft beer scene with local brewers and food pairings.
    - Find: Craft beer tour operator in Timișoara

---

### Culture (10 activities)

50. **Athenaeum Guided Tour (Architecture & Acoustics)** (ID: 122)
    - Description: Behind-the-scenes tour of Romania's iconic concert hall—frescoes, golden hall and legendary acoustics.
    - Find: Romanian Athenaeum in Bucharest

51. **Bucharest Communist Tour (Revolution Square & People's Palace)** (ID: 121)
    - Description: Walking tour through Ceaușescu's Bucharest—Revolution Square, Palace of Parliament and socialist-era boulevards.
    - Find: Communist tour operator in Bucharest

52. **Bucharest Jewish Heritage Walk** (ID: 120)
    - Description: Explore the historic Jewish quarter—synagogues, memorial sites and cultural landmarks with a local guide.
    - Find: Jewish heritage tour operator in Bucharest

53. **Bucharest Street Art & Graffiti Tour** (ID: 119)
    - Description: Discover murals, stencils and urban art in Bucharest's alternative neighborhoods with a street artist guide.
    - Find: Street art tour operator in Bucharest

54. **Cotroceni Palace Museum Visit** (ID: 118)
    - Description: Guided tour of the presidential residence—royal apartments, art collections and gardens (advance booking required).
    - Find: Cotroceni Palace Museum in Bucharest

55. **George Enescu Museum (Cantacuzino Palace)** (ID: 117)
    - Description: Explore the composer's life and works in a Belle Époque palace with period instruments and manuscripts.
    - Find: George Enescu Museum in Bucharest

56. **Parliament Palace Tour (World's Heaviest Building)** (ID: 116)
    - Description: Guided tour through Ceaușescu's megalomaniac palace—marble halls, chandeliers and communist-era grandeur.
    - Find: Palace of Parliament in Bucharest

57. **Peasant Museum Guided Tour** (ID: 115)
    - Description: Discover Romanian folk art, textiles and traditional architecture with expert commentary.
    - Find: Museum of the Romanian Peasant in Bucharest

58. **Romanian Athenaeum Concert (Classical Music)** (ID: 114)
    - Description: Evening concert in Bucharest's most beautiful concert hall—George Enescu Philharmonic or visiting orchestras.
    - Find: Romanian Athenaeum in Bucharest

59. **Stavropoleos Monastery & Byzantine Chant** (ID: 113)
    - Description: Visit a hidden Old Town monastery with intricate stonework and attend a Byzantine chant service.
    - Find: Stavropoleos Monastery in Bucharest

---

### Fitness (2 activities)

60. **Bucharest Yoga Class (Vinyasa/Hatha)** (ID: 21)
    - Description: Flow through sun salutations and standing poses in a welcoming studio with experienced instructors.
    - Find: Yoga studio in Bucharest

61. **CrossFit Session in Bucharest** (ID: 23)
    - Description: High-intensity functional fitness—Olympic lifts, gymnastics and metabolic conditioning in a supportive box.
    - Find: CrossFit gym in Bucharest

62. **CrossFit Session in Cluj** (ID: 22)
    - Description: Coached CrossFit WOD with scaling options for all fitness levels.
    - Find: CrossFit gym in Cluj-Napoca

---

### Learning (14 activities)

63. **Barista Basics Workshop (Cluj)** (ID: 53)
    - Description: Learn espresso extraction, milk steaming and latte art in a hands-on coffee workshop.
    - Find: Coffee workshop venue in Cluj-Napoca

64. **Classic Film at Cinemateca Eforie** (ID: 148)
    - Description: Vintage cinema screening in a retro theater by the Black Sea.
    - Find: Cinemateca Eforie in Eforie Nord

65. **Intro to 3D Printing & Rapid Prototyping (NOD)** (ID: 124)
    - Description: Design a 3D model, slice it and print your first object at Bucharest's premier makerspace.
    - Find: NOD Makerspace in Bucharest

66. **Intro to Programming (Școala Informală de IT)** (ID: 125)
    - Description: Beginner-friendly coding workshop—HTML, CSS, JavaScript or Python basics in a collaborative environment.
    - Find: Școala Informală de IT in Bucharest

67. **Intro to Romanian Wine (Bucharest)** (ID: 55)
    - Description: Taste indigenous grapes—Fetească, Tămâioasă, Negru de Drăgășani—and learn Romania's wine regions.
    - Find: Wine tasting venue in Bucharest

68. **Micro-Visit: Antipa – One Hall Only (Coral & Fish)** (ID: 168)
    - Description: 15-minute focused visit to the aquarium and coral reef hall at Grigore Antipa Natural History Museum.
    - Find: Grigore Antipa Museum in Bucharest

69. **Photography Fundamentals (Academia F64)** (ID: 123)
    - Description: Learn exposure, composition and manual mode in a hands-on photography workshop.
    - Find: Academia F64 in Bucharest

70. **Romanian Language Crash Course (Bucharest)** (ID: 51)
    - Description: 2-hour survival Romanian—greetings, numbers, ordering food and asking directions with a native teacher.
    - Find: Language school in Bucharest

71. **Self-Guided Architecture Audio Walk (Old Town)** (ID: 151)
    - Description: Download an audio guide and explore Bucharest's Belle Époque and interwar architecture at your own pace.
    - Find: Old Town Bucharest (coordinates for starting point)

72. **Sibiu Traditional Cooking Class** (ID: 54)
    - Description: Learn Transylvanian recipes in a Saxon house kitchen—sarmale, bulz and cozonac.
    - Find: Cooking class venue in Sibiu

73. **Specialty Coffee Brewing Class (Bucharest)** (ID: 52)
    - Description: Master pour-over, AeroPress and French press techniques with a specialty coffee roaster.
    - Find: Specialty coffee venue in Bucharest

---

### Mindfulness (11 activities)

74. **Breathwork fundamentals (Wim Hof/box/paced)** (ID: 178)
    - Description: Learn controlled breathing techniques for stress reduction and energy management.
    - Find: Breathwork workshop venue in Bucharest

75. **Float Therapy Session (Sensory Deprivation)** (ID: 137)
    - Description: 60-minute float in an Epsom salt tank—weightless, silent, dark relaxation for deep mental reset.
    - Find: Float therapy center in Bucharest

76. **Gong & Sound Bath (The Inner)** (ID: 138)
    - Description: Lie down and let gong vibrations wash over you in a meditative sound healing session.
    - Find: The Inner or sound bath venue in Bucharest

77. **Guided meditation session** (ID: 177)
    - Description: 30-minute guided meditation for beginners—breath awareness, body scan and mindfulness techniques.
    - Find: Meditation center in Bucharest

78. **Halotherapy & Mindful Walk – Turda Salt Mine** (ID: 57)
    - Description: Breathe mineral-rich air deep underground, then walk the subterranean lake and Ferris wheel.
    - Find: Salina Turda in Turda

79. **Intro to Raja Yoga Meditation (Brahma Kumaris)** (ID: 139)
    - Description: Learn meditation techniques for inner peace and self-awareness in a welcoming spiritual community.
    - Find: Brahma Kumaris center in Bucharest

80. **Salt Mine Wellness Session – Praid** (ID: 58)
    - Description: Halotherapy and relaxation in a Transylvanian salt mine with healing microclimate.
    - Find: Salina Praid in Praid

81. **Sound Bath & Breathwork (Bucharest)** (ID: 56)
    - Description: Combine guided breathwork with crystal bowl and gong vibrations for deep relaxation.
    - Find: Sound bath venue in Bucharest

82. **Sound bath with gongs & bowls** (ID: 176)
    - Description: Immersive sound healing session with Tibetan bowls, gongs and chimes.
    - Find: Sound healing venue in Bucharest

83. **Tai Chi & Qigong Classes (Taijidao)** (ID: 140)
    - Description: Learn slow, flowing movements for balance, flexibility and inner calm in a park or studio setting.
    - Find: Taijidao or Tai Chi venue in Bucharest

84. **Therme Sauna Rituals & Mindful Heat** (ID: 59)
    - Description: Guided sauna experience with aufguss rituals, cold plunges and relaxation zones.
    - Find: Therme București in Balotești

---

### Nature (14 activities)

85. **Botanical Garden: Palmhouse & remedy garden loop** (ID: 189)
    - Description: 20-minute walk through tropical plants and medicinal herb gardens.
    - Find: Botanical Garden in Bucharest

86. **Japanese Garden Stroll (King Michael I Park)** (ID: 145)
    - Description: Zen garden with koi pond, stone lanterns and cherry trees in Herăstrău Park.
    - Find: Japanese Garden in King Michael I Park, Bucharest

87. **Mini-walk & overlook: Tineretului Park** (ID: 188)
    - Description: 15-minute lakeside loop with city views and green space.
    - Find: Tineretului Park in Bucharest

88. **Photo spot & sit: Izvor Park Parliament view** (ID: 187)
    - Description: 10-minute bench stop with Parliament Palace backdrop.
    - Find: Izvor Park in Bucharest

89. **Quick Reset: Botanical Garden Rosarium Loop** (ID: 159)
    - Description: 15-minute rose garden walk with hundreds of varieties in bloom (May-October).
    - Find: Botanical Garden in Bucharest

90. **Quick Reset: Carol Park Mausoleum Viewpoint Bench** (ID: 158)
    - Description: 10-minute hilltop bench with panoramic city views and neoclassical monument.
    - Find: Carol Park in Bucharest

91. **Quick Reset: Cișmigiu Gardens Quiet Loop & Bench 7** (ID: 157)
    - Description: 15-minute lakeside walk and favorite bench in Bucharest's oldest park.
    - Find: Cișmigiu Gardens in Bucharest

92. **Quick Reset: Kiseleff Shaded Boulevard Benches** (ID: 160)
    - Description: 10-minute tree-lined avenue stroll with historic mansions.
    - Find: Șoseaua Kiseleff in Bucharest

93. **Quick Reset: Titan (A.I. Cuza) Lakeside – Insula Artelor** (ID: 161)
    - Description: 15-minute lakeside walk and art island visit in eastern Bucharest.
    - Find: Titan Park (A.I. Cuza) in Bucharest

94. **Quiet bench: Grădina Icoanei** (ID: 186)
    - Description: Hidden neighborhood park with shaded benches and quiet atmosphere.
    - Find: Grădina Icoanei in Bucharest

95. **Quiet bench: Parcul Circului (Lotus Lake)** (ID: 185)
    - Description: Small park with lotus-covered lake and peaceful benches.
    - Find: Parcul Circului in Bucharest

96. **Retezat National Park Day Hike** (ID: 66)
    - Description: Hike to glacial lakes and alpine meadows in Romania's wildest national park.
    - Find: Retezat National Park visitor center or trailhead

97. **Urban Nature Walk & Birdwatching (Văcărești)** (ID: 146)
    - Description: Explore Bucharest's urban wetland—herons, egrets and wild landscapes in the city.
    - Find: Văcărești Nature Park in Bucharest

---

### Nightlife (100 activities - SAMPLE FIRST 10)

98. **Alt & Electronic Nights at Control Club** (ID: 1893)
    - Description: Underground electronic music and alternative club nights.
    - Find: Control Club in Bucharest

99. **Alt-Rock & Indie Nights at Expirat** (ID: 1910)
    - Description: Live indie bands and alternative music in a grungy venue.
    - Find: Expirat in Bucharest

100. **Beach Club Night at EGO Mamaia** (ID: 1969)
     - Description: Beachfront club with DJs and summer party vibes.
     - Find: EGO Beach Club in Mamaia

101. **Beer O'Clock: Craft & Imports** (ID: 1926)
     - Description: Craft beer bar with rotating taps and bottle selection.
     - Find: Beer O'Clock in Bucharest

102. **Beluga: Music & Cocktails (Old Town)** (ID: 1923)
     - Description: Upscale cocktail bar with live music in Old Town.
     - Find: Beluga in Bucharest Old Town

103. **Berăria H Beer Hall & Live Shows** (ID: 1905)
     - Description: Traditional beer hall with live music and hearty food.
     - Find: Berăria H in Bucharest

104. **BOA (Beat of Angels) Hip-Hop & R&B Night** (ID: 1896)
     - Description: Hip-hop and R&B club nights with DJs.
     - Find: BOA Club in Bucharest

105. **Bruno Wine Bar: Cellar Vibes** (ID: 1927)
     - Description: Intimate wine bar with cellar atmosphere.
     - Find: Bruno Wine Bar in Bucharest

106. **City-High Cocktails at NOR Sky (SkyTower)** (ID: 1918)
     - Description: Rooftop cocktails with panoramic city views.
     - Find: NOR Sky in SkyTower, Bucharest

107. **Club Șurubelnița: Underground Party Bar** (ID: 1928)
     - Description: Alternative underground bar with eclectic music.
     - Find: Club Șurubelnița in Bucharest

*[Continue for remaining 90 nightlife activities...]*

---

### Romance (6 activities)

*[List romance activities 108-113]*

---

### Sports (32 activities)

*[List sports activities 114-145]*

---

### Water (6 activities)

*[List water activities 146-151]*

---

### Wellness (3 activities)

152. **Ana Spa Daypass at Crowne Plaza** (ID: 155)
     - Description: Thermal pools, saunas and spa treatments at a luxury hotel.
     - Find: Ana Spa at Crowne Plaza in Bucharest

153. **Balvanyos Forest Spa Ritual** (ID: 26)
     - Description: Natural mofette (CO2) therapy and forest bathing in Transylvania.
     - Find: Balvanyos Spa in Balvanyos

154. **Oradea Thermal Aqua Day (Aquaparks)** (ID: 24)
     - Description: Thermal water parks and spa facilities in Oradea.
     - Find: Aquapark in Oradea

155. **Sovata Bear Lake & Spa Day** (ID: 25)
     - Description: Float in heliothermal Bear Lake and visit spa facilities.
     - Find: Bear Lake (Lacul Ursu) in Sovata

---

## IMPORTANT NOTES:

1. **Nightlife venues (100 activities)**: I've only listed the first 10 above. The full list includes bars, clubs, and music venues across Bucharest, Cluj, Timișoara, Brașov, Constanța, and other cities. Please research ALL nightlife activities in the exported JSON file.

2. **For activities without specific venue names**: Find the most popular/established venue offering that activity type in the specified city.

3. **Coordinates**: Use Google Maps to get accurate latitude/longitude (decimal format, 6 decimal places).

4. **Websites**: Prefer official websites over social media, but Facebook pages are acceptable if that's the primary online presence.

5. **Output**: Return ONLY the JSON array with all 202 activities filled in. No explanations, no markdown, just valid JSON.

---

## COPY-PASTE THIS TO CHATGPT:

I need you to research and find real venues, addresses, coordinates, and websites for 202 Romanian activities. Return ONLY a valid JSON array with this structure for each activity:

```json
[
  {
    "activity_id": 8,
    "activity_name": "Activity Name",
    "venue_name": "Venue Name",
    "full_address": "Street Address, Sector/District",
    "city": "City Name",
    "latitude": 44.4268,
    "longitude": 26.1025,
    "website": "https://website.ro"
  }
]
```

Use Google Maps for coordinates (decimal format). Find official websites. For activities without specific venues, find the most popular venue offering that activity type.

[Then paste the full activity list from ACTIVITIES_MISSING_VENUES.json]
