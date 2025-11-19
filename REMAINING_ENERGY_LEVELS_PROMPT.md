# ChatGPT Prompt: Assign Energy Levels to Remaining 80 Activities

## Instructions

You are a fitness and activity classification expert. Assign energy levels to the following 80 activities from a Romanian activity database.

### Energy Level Guidelines:

**LOW energy** = Relaxing, contemplative, minimal physical exertion
- Examples: Wine tasting, museum visits, spa sessions, board games, coffee shops, reading, watching movies

**MEDIUM energy** = Moderate activity, some movement but not exhausting
- Examples: Yoga, swimming laps, escape rooms, cooking classes, walking tours, bowling, dancing (social)

**HIGH energy** = Intense physical activity, adrenaline, competitive sports
- Examples: CrossFit, rock climbing, skiing, skydiving, martial arts, competitive sports, intense cardio

### Output Format:

For each activity, output a SQL UPDATE statement:

```sql
UPDATE activities SET energy_level = '[low/medium/high]' WHERE name = '[exact activity name]';
```

### Critical Notes:

1. **Copy activity names EXACTLY** - including special characters, apostrophes, dashes, and Romanian characters
2. Use single quotes in SQL and escape apostrophes with two single quotes (`''`)
3. Classify based on the **physical and mental energy required**, not just fun level
4. When in doubt between two levels, consider: Would this tire you out? (high), Make you moderately active? (medium), or Let you relax? (low)

---

## 80 Activities to Classify:

1. Affordable Lengths at Olimpia (Iancului)
2. After-Work Dip at Daimon Wellness (Tineretului)
3. Alt & Electronic Nights at Control Club
4. Alt-Rock & Indie Nights at Expirat
5. Beach Club Night at EGO Mamaia
6. Beer O'Clock: Craft & Imports
7. Beluga: Music & Cocktails (Old Town)
8. Berăria H Beer Hall & Live Shows
9. BOA (Beat of Angels) Hip-Hop & R&B Night
10. Board-Game Evening at Snakes & Wizards
11. Bruno Wine Bar: Cellar Vibes
12. Campus Swim at Carol Davila Pool (Cotroceni)
13. City-Centre Swim at Novotel Wellness
14. City-High Cocktails at NOR Sky (SkyTower)
15. Club Șurubelnița: Underground Party Bar
16. Club Swim & Sun at Stejarii Country Club
17. Concert Night at Doors Club
18. Craft Beers at Beer O'Clock
19. D'Arc Unirii Sessions
20. EGO Mamaia Beach Club Nights
21. Euphoria Music Hall – Big-Room Live & Party
22. Evening Lanes at Dinamo Olympic Pool
23. Expirat Vama Veche Beach Sessions
24. Fire Club: Rock & Alternative
25. Flying Circus Alt Nights
26. Foraged Cocktails at FIX Me a Drink
27. Fratelli Beach & Club – House by the Sea
28. Fratelli Iași – Luxe Mixed Music Night
29. Grand Lanes at World Class The Grand (JW Marriott)
30. Halftime Sports Pub (Gabroveni)
31. High-End Night at Epic Society
32. High-Gloss Nights at E3 by Entourage
33. Hookah & Lounge at Macca-Villacrosse (Hugo)
34. House Night at Fratelli Lounge & Club
35. Infinity Hookah Lounge (Eminescu)
36. Intimate Jazz Night at Green Hours
37. Jazz & Blues Club Târgu Mureș
38. KIKI Lounge & Bar (LGBTQ+ friendly) Cocktails
39. KLANdestin: IOR Park View Drinks
40. Laps & Steam at Crowne Plaza ANA Spa
41. LINEA / Closer to the Moon Rooftop
42. Live Anthems at Hard Rock Cafe Bucharest
43. Live Band & Karaoke at Mojo Music Club
44. Live Jazz at Jazz & Blues Club
45. Live Jazz Sessions at The JAZZ BOOK
46. Lokal Oradea Rooftop Sundowners
47. Metal Nights at Rockstadt
48. Mojo: Karaoke & Live Band Nights
49. Moszkva Oradea Alt Scene
50. Music Pub Sibiu Rock Nights
51. Nova Lounge & Hookah (Ferdinand)
52. Origo Cocktail Evenings (Old Town)
53. Peak Weekend at FACE Club
54. Premium Party at NOA – Nest of Angels
55. Pura Vida Sky Bar (Old Town)
56. Quantic: Rock & Metal Live
57. Queens Club LGBTQ+ Night
58. Rooftop Cocktails at NOMAD Skybar
59. Rooftop Sundowners at Linea / Closer to the Moon
60. Scârț Loc Lejer Living-Room Lounge
61. Semi-Olympic Session at World Class Mega Mall (Pantelimon)
62. SHOTERIA Old Town: Rapid-Fire Shots
63. Sports & Pints at St. Patrick Irish Pub
64. Sports Bar Titan: Billiards & Darts
65. St. Patrick Irish Pub: Sports & Pints
66. Stand-Up Night at The Fool Comedy Club
67. Steampunk Cocktails at Joben
68. Student Night at Kulturhaus Bucharest
69. Sunset Rooftops at 18 Lounge (City Gate)
70. Sunset Splash at Magic Place Aqua Park
71. Tech-House Marathon at Kristal Glam Club
72. Tipografia Culture Bar
73. Trickshot AFI Cotroceni: Lanes & Cocktails
74. Trickshot Mega Mall: Bowling & Bar
75. Trickshot Promenada Rooftop
76. Uanderful: Floreasca Lounge & Late Drinks
77. Underground The Pub: Iași Rock Cellar
78. Viniloteca: Wine & Wax Nights
79. VIP Glam Night at BOA - Beat of Angels
80. Yolka Skybar Sundowners

---

## Expected Output:

80 SQL UPDATE statements, one per line, ready to paste into `energy-updates.sql`

Example:
```sql
UPDATE activities SET energy_level = 'medium' WHERE name = 'Affordable Lengths at Olimpia (Iancului)';
UPDATE activities SET energy_level = 'low' WHERE name = 'After-Work Dip at Daimon Wellness (Tineretului)';
...
```
