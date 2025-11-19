# ChatGPT Prompt: Assign Energy Levels to ALL 516 Activities

I need you to assign energy levels to each of the following **516 activities** in my database. Based on the activity name alone, estimate whether it requires **low**, **medium**, or **high** energy. Don't research each activity—just use your judgment based on what the name suggests.

**Energy Level Guidelines:**
- **low**: Relaxing, passive, minimal physical exertion (e.g., spa, meditation, museum visits, wine tasting, bookstore browsing, quiet benches)
- **medium**: Moderate activity, some movement but not intense (e.g., walking tours, cooking classes, casual sports, board games, language exchange)
- **high**: Intense physical activity, adrenaline, or sustained exertion (e.g., skiing, rock climbing, CrossFit, skydiving, via ferrata, whitewater rafting)

**Output Format:**
Provide the result as SQL UPDATE statements that I can copy-paste directly into my database. Use this exact format:

```sql
UPDATE activities SET energy_level = 'low' WHERE name = 'Activity Name Here';
UPDATE activities SET energy_level = 'medium' WHERE name = 'Activity Name Here';
UPDATE activities SET energy_level = 'high' WHERE name = 'Activity Name Here';
```

**IMPORTANT:** 
- Use the EXACT activity names as shown below (including special characters like – and ă, ș, ț, etc.)
- Output SQL statements ONLY
- Use 'low', 'medium', or 'high' (lowercase)
- Process ALL 516 activities

---

## All 516 Activities to Classify:

1. 321sport Community Run
2. 5-a-Side Football Pitch Hire (South)
3. 50m Lap Swim (Olympic Pool)
4. Abel's Wine Bar Discovery Night
5. Adult Ceramics Starter (Școala Populară de Arte Cluj)
6. Adventure Park Brașov Mega Zip & Ropes
7. Affordable Lengths at Olimpia (Iancului)
8. After-Work Dip at Daimon Wellness (Tineretului)
9. Alt & Electronic Nights at Control Club
10. Alt-Rock & Indie Nights at Expirat
11. Amateur Cooking at Atelierele ILBAH
12. Amateur Cooking at Atelierele ILBAH
13. Ana Aslan Health Spa Day – Eforie Nord
14. Ana Spa Daypass at Crowne Plaza
15. Aquapark Nymphaea Day Pass
16. Aqvatonic Med Spa Pass – Eforie Nord
17. Aromatherapy & natural perfume workshop
18. Arthouse Cinema Session (Elvire Popesco)
19. Artisan Techniques at Artisan Cooking Classes
20. Artisan Techniques at Artisan Cooking Classes
21. ASTRA Museum Hands-on Crafts Workshop
22. ATV/Quad Biking (Cernica Forest)
23. ATV/Quad Off-Road Tour – Zărnești & Plaiul Foii
24. Avalanche Skills & Freetouring – Bâlea
25. Azuga Guided Snowmobile Ride
26. Backcountry Snowmobile Tour – Harghita-Mădăraș
27. Badminton Courts & Group Play (Sun Plaza)
28. Bâlea Ice Climbing Intro
29. Bâlea Ski Mountaineering Clinic (Făgăraș)
30. Balvanyos Forest Spa Ritual
31. Barista Basics Workshop (Cluj)
32. Basketball Court Booking (Full Court Run)
33. Beach Club Night at EGO Mamaia
34. Beach Tennis Doubles
35. Bear Watching from a Hide (Brașov)
36. Beer O'Clock: Craft & Imports
37. Beginner Archery Class (Sector 5 Range)
38. Beluga: Music & Cocktails (Old Town)
39. Berăria H Beer Hall & Live Shows
40. BERĂRIA H Live & Beer Hall
41. Bicaz Gorges Ice Climbing
42. BlaBla Language Exchange (Constanța)
43. BlaBla Language Exchange (Iași)
44. Black Sea Coastal Kayaking Coaching
45. Black Sea Intro Dive with Marine Explorers
46. Black Sea Sea-Kayaking (Mangalia)
47. BOA (Beat of Angels) Hip-Hop & R&B Night
48. BOA Beat of Angels Luxury Night
49. Board Game Night in Bucharest Old Town
50. Board Game Social at The Guild Hall
51. Board Games Night at Harmony Cafe
52. Board Games Zone Social (Timișoara)
53. Board-Game Evening at Snakes & Wizards
54. Boat Ride on Herăstrău Lake
55. Botanical Garden: Palmhouse & remedy garden loop
56. Botanical Watercolor with Irina Neacșu
57. Boxing Fitness (No Sparring)
58. Boxing Gym Session (Pads & Bag)
59. Bran Castle (Dracula's Castle) Visit
60. Brașov Old Town Walking Tour
61. Breathwork fundamentals (Wim Hof/box/paced)
62. Bruno Wine Bar: Cellar Vibes
63. Bucegi Plateau Hike: Babele & Sphinx
64. Bucegi Ski Touring (Busteni/Sinaia)
65. Bucharest Escape Room Challenge
66. Bucharest Language Exchange Social
67. Bucharest Traditional Food Tour
68. Bucharest Yoga Class (Vinyasa/Hatha)
69. Bucovina Painted Monasteries Tour
70. Bungee Jump (Râșnoavei Gorge)
71. Buzău River Whitewater Rafting (Class III–IV) with Green Adventure
72. Calisthenics Park Training (Parc Tei)
73. Calligraphy & lettering workshop
74. Campus Swim at Carol Davila Pool (Cotroceni)
75. Ceramics Hand-Building (Alimeria Ceramics)
76. Chef Course at ICEP București
77. Chef Course at ICEP București
78. Cheile Râșnoavei Bungee Jump
79. Cheile Turzii Gorge Guided Hike
80. Chocolate Tasting Foundations (Artisan HUB events)
81. Christmas Market Bucharest (Constitution Square)
82. Christmas Market Cluj-Napoca (Piața Unirii)
83. Christmas Market Sibiu (Piața Mare)
84. Christmas Market Timișoara (Victory Square)
85. City-Centre Swim at Novotel Wellness
86. City-High Cocktails at NOR Sky (SkyTower)
87. Classic Film at Cinemateca Eforie
88. Club Badminton at CSM Timișoara
89. Club Badminton at CSM Timișoara
90. Club Șurubelnița: Underground Party Bar
91. Club Swim & Sun at Stejarii Country Club
92. Cluj Escape Room Adventure
93. Cluj Live Music & Club Night
94. Cluj Tandem Paragliding at Feleacu
95. Cluj-Napoca Street Food & Market Tasting
96. Coastal Tennis at Tenis Club IDU
97. Coastal Tennis at Tenis Club IDU
98. Coastal Training at World Class Constanța
99. Coastal Training at World Class Constanța
100. Comana Adventure Park & Kayak
101. Community Badminton at Banu Sport
102. Community Badminton at Banu Sport
103. Community Swimming at Bazinul Vega
104. Community Swimming at Bazinul Vega
105. Community Tennis at BDK Tennis Herăstrău
106. Community Tennis at BDK Tennis Herăstrău
107. Competitive Badminton at Badminton Club Cluj
108. Competitive Badminton at Badminton Club Cluj
109. Concert Night at Doors Club
110. Constanța Seafood Tasting Experience
111. Contemporary Jewelry Making (Assamblage Institute)
112. Control Club Electronic Night
113. Cooking for Beginners at DallesGO
114. Cooking for Beginners at DallesGO
115. Corks Cozy Winebar Social Tasting
116. Couples' Photoshoot in Old Town
117. Cowork Timișoara Language Hangout
118. Craft Beers at Beer O'Clock
119. Cramele Recaș Estate Visit & Tasting
120. CrossFit Session in Bucharest
121. CrossFit Session in Cluj
122. Culinary Masterclass at Horeca School
123. Culinary Masterclass at Horeca School
124. Culinary Workshops at KUXA Studio
125. Culinary Workshops at KUXA Studio
126. Cyanotype & Alternative Photography Workshop
127. Cyanotype & Screen Printing Lab (Allkimik)
128. D'Arc Unirii Sessions
129. Danube Delta Boat Safari from Tulcea
130. Dealu Mare Winery Trio (Lacerta/Serve/Budureasca)
131. Deane's Wednesday Pub Quiz (Brașov)
132. Dimitrie Gusti National Village Museum
133. Dodgeball League Night
134. Domeniul Bogdan Organic Winery Tour
135. Downhill & Enduro Runs (Postăvaru Bike Park)
136. Downhill MTB – Bike Resort Sinaia
137. Drift Taxi & Hot Laps at Academia Titi Aur
138. Edenland Park Zipline & Aerial Courses
139. EGO Mamaia Beach Club Nights
140. Electronic Club Night in Bucharest
141. Embroidery & Traditional Motifs – FCV
142. Encanto Latin Social (Constanța)
143. Energiea Gastropub Social Night
144. Ensana Sovata Spa & Saltwater Pools
145. Escape Room Marathon (Central Bucharest)
146. Euphoria Music Hall – Big-Room Live & Party
147. Evening acrylic painting class (Rodia Art Studio)
148. Evening Lanes at Dinamo Olympic Pool
149. ExitGames Team Escape (Timișoara)
150. Expirat Halele Carol Live & DJ
151. Expirat Vama Veche Beach Sessions
152. Express Beauty Reset (GETT'S Color Bar – malls)
153. F45 HIIT Team Training
154. Făgăraș Ski Touring Week (High Alpine)
155. Făgăraș Winter Mountaineering Weekend
156. Fashion Illustration After-Work (DallesGO)
157. Fencing Intro: Foil Basics
158. Fire Club: Rock & Alternative
159. First-Time Caving – Apuseni Mountains (Guided)
160. Float Therapy Session (Sensory Deprivation)
161. Flying Circus Alt Nights
162. Footvolley/Beach Football On Sand
163. Foraged Cocktails at FIX Me a Drink
164. Fratelli Beach & Club – House by the Sea
165. Fratelli Iași – Luxe Mixed Music Night
166. Fratelli Studios High-End Clubbing
167. Free-Roam VR Arena & Escape Games (Gateway VR)
168. French Techniques at Disciples Escoffier
169. French Techniques at Disciples Escoffier
170. Full-Day Thermal & Sauna at Therme București
171. Fun Bowling & Billiards at Trickshot
172. Fusion Cuisine at Miorita Culinary School
173. Fusion Cuisine at Miorita Culinary School
174. Gatsby Bucharest Roaring Twenties Night
175. Glam Night at Kristal Glam Club
176. Go-Karting: VMAX (Indoor) or AMCKart (Outdoor)
177. Gramma Winery Visit & Tasting (Iași)
178. Group Cycling (Spin Class)
179. Group Fitness Class (HIIT/Bootcamp)
180. Guided Hike & Picnic in Comana Natural Park
181. Guided Snowshoe Trek – Bucegi or Piatra Craiului
182. Halotherapy & Mindful Walk – Turda Salt Mine
183. Handmade Soap & Cosmetics Workshop
184. Herăstrău Paddleboat Rental
185. Herăstrău Park Bike Rental
186. Herăstrău Park Rollerblading
187. High-Altitude Ski Touring – Făgăraș (Multi-Day)
188. Hike & Picnic at Comana Natural Park
189. Hiking & Scrambling: Piatra Craiului Ridge
190. Hip-Hop & R&B at BOA (Beat of Angels)
191. Horseback Riding Lesson (Beginner)
192. Hot Air Balloon Flight near Cluj
193. Iași Night Out (Bars & Clubs)
194. Ice Climbing Intro – Bâlea Waterfall
195. Ice Skating Session (AFI Cotroceni)
196. Icon on Glass Workshop (ASTRA Museum)
197. Immersive Escape Room Adventure
198. Improvisation Theatre Workshop (Bucharest)
199. Indoor Bouldering Session
200. Indoor Climbing Session (Top-rope & Bouldering)
201. Indoor Rock Climbing (Vertical Gym)
202. Intro to Golf in Transylvania
203. Intro to Romanian Wine (Bucharest)
204. Jazz Night at Green Hours
205. Karaoke Night at Mojo Music Club
206. Kayaking on Snagov Lake
207. Kitesurfing Intro (Mamaia)
208. Kristal Glam Club: Luxe Night Out
209. Kulturhaus Bucharest Student Night
210. Language Exchange at Seneca AntiCafe
211. Laser Tag Battles
212. Late-Night Cocktails at Joben Bistro
213. Late-Night Lounge at Uanderful
214. Leaota Mountain Horseback Trail Ride
215. Leather Crafting Basics (Handmade Wallets/Belts)
216. Linea / Closer to the Moon Rooftop Cocktails
217. Live Jazz at Green Hours 22
218. Live Music at Expirat Halele Carol
219. Live Music at Fire Club
220. Live Music at The Fool
221. Live Music Night at Berăria H
222. Macrame Plant Hanger Workshop
223. Mamaia Beach Volleyball
224. Mamaia Kitesurfing Intro
225. Mamaia Windsurfing Intro
226. Metalworking & Welding Intro (NOD Makerspace)
227. Mindful Swim at Stejarii Country Club
228. Mixology Masterclass (Cocktail Basics)
229. Modern Dance Class (Contemporary/Jazz)
230. Mojo Music Club Karaoke Night
231. Motorcycle Track Day (MotorPark Romania)
232. Mountain Biking (Sinaia Trails)
233. Mountain Biking – Postăvaru Bike Park
234. Muay Thai Kickboxing Class
235. Multi-Pitch Climbing – Vânturătoarea Ridge (Bucegi)
236. Museum Hopping: MNAC + Village Museum
237. Natural Cosmetics DIY (Soap/Balm/Scrub)
238. Natural Wine Tasting at Corks
239. Nightlife Crawl: Lipscani Old Town Bars
240. NOMAD Skybar Rooftop Cocktails
241. NOR Sky Rooftop Dinner for Two
242. Off-Road Driving Experience (4x4 Trails)
243. Oil Painting Basics (Rodia Art Studio)
244. Old Town Pub Crawl
245. Olympic Pool Session at Dinamo
246. One-Day Ski Touring Intro – Bucegi
247. Oradea Thermal Aqua Day (Aquaparks)
248. Outdoor Yoga in Herăstrău Park
249. Padel Court Booking (Romexpo Area)
250. Paintball Battle (Outdoor Arena)
251. Parc Aventura Brașov Zipline & Ropes
252. Peleș Castle Guided Visit
253. Perfume-Making Workshop (Scent Design)
254. Pilates Mat Class
255. Ping-Pong Social at Ping Pong Academy
256. Poiana Brașov Downhill Mountain Biking
257. Poiana Brașov Skiing & Snowboarding
258. Pottery Wheel Throwing Class
259. Premium Swim at World Class (Mega Mall)
260. Private Boat Ride on Herăstrău Lake
261. Private Snagov Lake Boat Cruise
262. Pub Quiz Night in the Old Town (Mojo & The PUB)
263. Public Speaking Practice (Toastmasters Bucharest)
264. Quick Reset: Bookstore Browsing at Cărturești
265. Quick Reset: Botanical Garden Rosarium Loop
266. Quick Reset: Carol Park Mausoleum Viewpoint Bench
267. Quick Reset: Cișmigiu Gardens Quiet Loop & Bench 7
268. Quick Reset: Kiseleff Shaded Boulevard Benches
269. Quick Reset: Macca–Vilacrosse Passage Stroll
270. Quick Reset: MNAC Rooftop Terrace View
271. Quick reset: Saint Roastery coffee stop
272. Quick reset: Throwback Dorobanți
273. Quick Reset: Titan (A.I. Cuza) Lakeside – Insula Artelor
274. Quick reset: Two Minutes Coffee Shop
275. Quiet bench: Grădina Icoanei
276. Quiet bench: Parcul Circului (Lotus Lake)
277. Resin Art: Pour & Finish (NOD cursuri)
278. Retezat Backcountry Ski (6-Day)
279. Retezat National Park Day Hike
280. Retro Café Board-Game Social
281. Rhein Azuga 1892 Cellar Tour & Bubbles
282. Rock Ridge Climb – Acele Morarului (Bucegi)
283. Romanian Cooking Class in Bucharest
284. Romanian Language Crash Course (Bucharest)
285. Romantic Boat Ride on Herăstrău Lake
286. Romantic Candlelight Concert (Fever)
287. Rooftop Cocktails at Linea/Closer to the Moon
288. Rooftop Cocktails at NOMAD Skybar
289. Rooftop Sundowners at Linea / Closer to the Moon
290. Rugby Intro Session (Non-contact Basics)
291. Runners Club Cluj – Social Run
292. Salsa/Bachata Beginner Class (Bucharest)
293. Salt Mine Wellness Session – Praid
294. Scărișoara Ice Cave & Apuseni Views
295. Scârț Loc Lejer Living-Room Lounge
296. Screen Printing Basics (Bucharest)
297. Scuba Diving — Discover Scuba (DSD)
298. Self-Guided Architecture Audio Walk (Old Town)
299. Semi-Olympic Session at World Class Mega Mall (Pantelimon)
300. Seneca AntiCafe – Board Game & Social Work Sesh
301. Seven Ladders Canyon Tyrolean Zipline (Dâmbul Morii)
302. Seven Ladders Canyon Via Ferrata Sprint
303. Sewing & Patternmaking Basics (Atelierele ILBAH)
304. Sewing Basics – Atelierele ILBAH
305. Shiseido Spa Rituals at Stejarii Country Club
306. SHOTERIA Old Town: Rapid-Fire Shots
307. Sibiu Old Town Food Tour
308. Sibiu Traditional Cooking Class
309. Sip & Paint Night (PaintandParty.ro)
310. Skiing in Poiana Brașov
311. Social Badminton at WePlay Brașov
312. Social Badminton at WePlay Brașov
313. Social Ping-Pong at Ping Pong Academy
314. Sound Bath & Breathwork (Bucharest)
315. Sound bath with gongs & bowls
316. Sourdough & Pastry Fundamentals (Horeca Culinary School)
317. Sovata Bear Lake & Spa Day
318. Specialty Coffee Brewing Class (Bucharest)
319. Specialty Coffee Cupping & Barista Basics
320. Sports & Pints at St. Patrick Irish Pub
321. Sports Bar Titan: Billiards & Darts
322. Sports Hall Badminton at Sala STOMART
323. Sports Hall Badminton at Sala STOMART
324. Squash Session & Coaching (Central-East)
325. St. Patrick Irish Pub: Sports & Pints
326. Stained Glass (Tiffany Technique) Workshop
327. Stained Glass (Tiffany Technique) Workshop
328. Stained Glass (Tiffany) Intro Workshop
329. Stand-Up Night at The Fool Comedy Club
330. Stand-Up Paddle (City Session)
331. Stargazing at Vasile Urseanu Observatory
332. Steampunk Cocktails at Joben
333. Student Club Badminton at Sportul Studențesc
334. Student Club Badminton at Sportul Studențesc
335. Student Night at Kulturhaus Bucharest
336. Sunset Rooftops at 18 Lounge (City Gate)
337. Sunset Splash at Magic Place Aqua Park
338. Surfing Lesson (Black Sea)
339. Table Tennis Club Session
340. Tai Chi & Qigong Classes (Taijidao)
341. Tandem Paragliding Clopotiva (Retezat)
342. Tandem Skydive – Tuzla Aerodrome (Black Sea)
343. Tandem Skydive at Clinceni (TNT Brothers)
344. Tandem Skydive at Clinceni (TNT Brothers)
345. Tandem Skydive Luncani (Skydive Transilvania)
346. Tandem Skydive over the Black Sea (Tuzla)
347. Tandem Skydive Timișoara (GoJump LRSG)
348. Tandem Skydiving at Clinceni Airfield
349. Tandem Skydiving over Cluj with Skydive Transilvania
350. Tea Tasting & Ceremony (Cotroceni Teahouses)
351. Team Escape at Captive
352. Tech-House Marathon at Kristal Glam Club
353. Technical University Pool at UTCN
354. Technical University Pool at UTCN
355. Tennis Lesson Or Court (Herăstrău)
356. Thai Massage & Aromatherapy (THAIco Spa Dorobanți)
357. The Dungeon – Team Escape Night
358. The Escapers Team Escape (Constanța)
359. Therme București Full-Day Thermal Spa
360. Therme București Wellness Day
361. Therme Sauna Rituals & Mindful Heat
362. Timisoara Club Night
363. Timișoara Craft Beer Tasting Crawl
364. Tipografia Culture Bar
365. Toastmasters Public Speaking Night (Constanța)
366. Toastmasters Public Speaking Night (Iași)
367. Toastmasters Public Speaking Night (Timișoara)
368. Track Day Laps at MotorPark Romania
369. Track Session (Iolanda Balaș-Soter)
370. Traditional Cookery at Casa Ratiu
371. Traditional Cookery at Casa Ratiu
372. Traditional Embroidery at Casa cu Rost
373. Traditional Pottery at Ceramica de Nocrich
374. Traditional Rowing (Canotcă) Basics
375. Trail Running Clinic (Brașov)
376. Training & Play at ACS Pro Badminton
377. Training & Play at ACS Pro Badminton
378. Training Session at Bazinul Olimpic Dinamo
379. Training Session at Bazinul Olimpic Dinamo
380. Transfăgărășan Scenic Day Tour
381. Transylvanian Laps at Bazinul Olimpic Târgu Mureș
382. Transylvanian Laps at Bazinul Olimpic Târgu Mureș
383. Trickshot AFI Cotroceni: Lanes & Cocktails
384. Trickshot Mega Mall: Bowling & Bar
385. Trickshot Promenada Rooftop
386. Turda Salt Mine Underground Park
387. Uanderful: Floreasca Lounge & Late Drinks
388. Ultimate Frisbee Pickup Night
389. Underground The Pub: Iași Rock Cellar
390. University Pool at Complexul de Natație UBB
391. University Pool at Complexul de Natație UBB
392. Urban Hammam & Thermal Circuit (Orhideea Spa)
393. Urban Nature Walk & Birdwatching (Văcărești)
394. Urban Tennis at Tenis Club AS
395. Urban Tennis at Tenis Club AS
396. Vertical Spirit Social Climb Night
397. Via Ferrata "Casa Zmeului"
398. Via Ferrata Casa Zmeului – Vadu Crișului
399. Via Ferrata Casa Zmeului (Vadu Crișului)
400. Via Ferrata Hili's Cave (Cheile Turzii)
401. Via Ferrata Pietrele Negre – Vârtop (Apuseni)
402. Via Ferrata Wild Ferenc in Bicaz Gorges
403. Village Museum Curated Guided Tour
404. Vineri 15 Riverfront Quiz Night
405. Viniloteca: Wine & Wax Nights
406. VIP Glam Night at BOA - Beat of Angels
407. Viscri Pastures Bike & Haystack Walk
408. Volleyball Social Play – CCSS Tei
409. Wakeboarding Session near Bucharest
410. Weaving on the Loom (ASTRA Museum)
411. Wellness & Tennis at Pescariu Sports
412. Wellness & Tennis at Pescariu Sports
413. Wellness visit: Salina Turda (salt mine)
414. Western Tennis at Tenis Timișoara
415. Western Tennis at Tenis Timișoara
416. Western Training at Bazinul Olimpic Ioan Alexandrescu
417. Western Training at Bazinul Olimpic Ioan Alexandrescu
418. Wheel Throwing Intro at Clay Play
419. Wheel Throwing Starter at Em Chang Studio
420. Wheel-throwing taster at CUBUL
421. Windsurfing Intro (Mamaia)
422. Wine Tasting in Dealu Mare
423. Woodworking Basics at NOD Makerspace
424. Year-Round Swimming at Aria Aqua Park
425. Year-Round Swimming at Aria Aqua Park
426. Yolka Skybar Sundowners
427. ZborHub Language Exchange (Brașov)
428. Zipline & Rope Courses at Comana Adventure Park
429. Zumba Dance Fitness

---

**CRITICAL NOTES:**
- This is the COMPLETE list of all 516 activities in the database
- Some activities appear twice (duplicates in database) - classify both instances
- Use EXACT names including Romanian characters (ă, â, î, ș, ț)
- Use EXACT punctuation (–, &, /, etc.)
- Output format: `UPDATE activities SET energy_level = 'X' WHERE name = 'Exact Name';`

**Suggested approach to avoid token limits:**
You may want to process these in batches (e.g., 100 at a time) and I'll combine them. Or output all 516 at once if possible.
