-- Migration: Update activities with missing venue information
-- This updates latitude, longitude, city, and website for activities that were missing venue data

-- Batch 1: Creative workshops
UPDATE activities SET latitude = 44.4325205, longitude = 26.1362289, city = 'Bucharest', website = 'https://secretromania.com' WHERE id = 8;
UPDATE activities SET latitude = 44.4413568, longitude = 26.1152341, city = 'Bucharest', website = 'https://caractercucaracter.ro' WHERE id = 194;
UPDATE activities SET latitude = 44.4373835, longitude = 26.1166019, city = 'Bucharest', website = 'https://assamblage.org' WHERE id = 98;
UPDATE activities SET latitude = 44.4120232, longitude = 26.1172345, city = 'Bucharest', website = 'https://www.facebook.com/allkimik' WHERE id = 47;
UPDATE activities SET latitude = 44.4120232, longitude = 26.1172345, city = 'Bucharest', website = 'https://www.facebook.com/allkimik' WHERE id = 131;
UPDATE activities SET latitude = 44.4459784, longitude = 26.1077581, city = 'Bucharest', website = 'https://fundatiacaleavictoriei.ro' WHERE id = 172;
UPDATE activities SET latitude = 44.4459025, longitude = 26.1087096, city = 'Bucharest', website = 'https://rodia-artstudio.com' WHERE id = 192;
UPDATE activities SET latitude = 44.4381935, longitude = 26.1230414, city = 'Bucharest', website = 'https://arttime.ro' WHERE id = 130;
UPDATE activities SET latitude = 45.749611, longitude = 24.11057, city = 'Sibiu', website = 'https://muzeulastra.ro' WHERE id = 49;
UPDATE activities SET latitude = 44.4120232, longitude = 26.1172345, city = 'Bucharest', website = 'https://recul.ro' WHERE id = 45;

-- Batch 2: More creative workshops
UPDATE activities SET latitude = 44.412023, longitude = 26.117235, city = 'Bucharest', website = 'https://nodmakerspace.ro' WHERE id = 100;
UPDATE activities SET latitude = 44.436792, longitude = 26.069891, city = 'Bucharest', website = 'https://andrele.ro' WHERE id = 195;
UPDATE activities SET latitude = 44.439657, longitude = 26.096241, city = 'Bucharest', website = 'https://www.mnar.arts.ro' WHERE id = 166;
UPDATE activities SET latitude = 44.456945, longitude = 26.092716, city = 'Bucharest', website = 'https://muzeulhartilor.ro' WHERE id = 167;
UPDATE activities SET latitude = 44.440249, longitude = 26.098126, city = 'Bucharest', website = 'https://muzeulbucurestiului.ro/muzeul-theodor-aman.html' WHERE id = 184;
UPDATE activities SET latitude = 44.460899, longitude = 26.091029, city = 'Bucharest', website = 'https://mnar.ro/muzee-si-colectii/muzeul-k-h-zambaccian' WHERE id = 183;
UPDATE activities SET latitude = 44.445978, longitude = 26.107758, city = 'Bucharest', website = 'https://fundatiacaleavictoriei.ro' WHERE id = 171;
UPDATE activities SET latitude = 44.442669, longitude = 26.114728, city = 'Bucharest', website = 'https://madebyyou.ro' WHERE id = 193;
UPDATE activities SET latitude = 44.447434, longitude = 26.084648, city = 'Bucharest', website = 'https://www.facebook.com/atelierpastel' WHERE id = 170;
UPDATE activities SET latitude = 44.424257, longitude = 26.118365, city = 'Bucharest', website = 'https://clayplay.ro' WHERE id = 190;

-- Batch 3: Pottery and arts
UPDATE activities SET latitude = 44.424257, longitude = 26.118365, city = 'Bucharest', website = 'https://clayplay.ro' WHERE id = 129;
UPDATE activities SET latitude = 44.447434, longitude = 26.084648, city = 'Bucharest', website = 'https://artandhobbystudio.ro' WHERE id = 169;
UPDATE activities SET latitude = 44.431907, longitude = 26.101647, city = 'Bucharest', website = 'https://carturesti.ro' WHERE id = 142;
UPDATE activities SET latitude = 44.431400, longitude = 26.099300, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 144;
UPDATE activities SET latitude = 44.426500, longitude = 26.088000, city = 'Bucharest', website = 'https://www.mnac.ro' WHERE id = 143;
UPDATE activities SET latitude = 44.411663, longitude = 26.058588, city = 'Bucharest', website = 'https://imperius.dance' WHERE id = 46;
UPDATE activities SET latitude = 44.412023, longitude = 26.117235, city = 'Bucharest', website = 'https://www.facebook.com/allkimik' WHERE id = 48;
UPDATE activities SET latitude = 44.434598, longitude = 26.113048, city = 'Bucharest', website = 'https://ateliereleilbah.ro' WHERE id = 173;
UPDATE activities SET latitude = 44.438432, longitude = 26.125204, city = 'Bucharest', website = 'https://tiffany-art.ro' WHERE id = 99;
UPDATE activities SET latitude = 45.749611, longitude = 24.110570, city = 'Sibiu', website = 'https://muzeulastra.ro' WHERE id = 50;
UPDATE activities SET latitude = 44.442161, longitude = 26.139767, city = 'Bucharest', website = 'https://cubul.ro' WHERE id = 191;

-- Batch 4: Culinary experiences
UPDATE activities SET latitude = 44.487735, longitude = 26.064941, city = 'Bucharest', website = 'https://artisangreenbean.com' WHERE id = 133;
UPDATE activities SET latitude = 46.770070, longitude = 23.590352, city = 'Cluj-Napoca', website = 'https://www.romanianfriend.com' WHERE id = 38;
UPDATE activities SET latitude = 44.211992, longitude = 28.643849, city = 'Constanța', website = 'https://restaurantreyna.ro' WHERE id = 44;
UPDATE activities SET latitude = 45.072521, longitude = 26.468487, city = 'Fințești', website = 'https://lacertawinery.ro' WHERE id = 43;
UPDATE activities SET latitude = 44.264868, longitude = 28.268542, city = 'Medgidia', website = 'https://domeniulbogdan.ro' WHERE id = 42;
UPDATE activities SET latitude = 47.094791, longitude = 27.607657, city = 'Vișan', website = 'https://grammawines.ro' WHERE id = 41;
UPDATE activities SET latitude = 44.419083, longitude = 26.114455, city = 'Bucharest', website = 'https://graintrip.com' WHERE id = 106;
UPDATE activities SET latitude = 44.421504, longitude = 26.087161, city = 'Bucharest', website = 'https://barsolutions.ro' WHERE id = 104;
UPDATE activities SET latitude = 44.428000, longitude = 26.103900, city = 'Bucharest', website = 'https://www.romanianfriend.com' WHERE id = 134;
UPDATE activities SET latitude = 44.460102, longitude = 26.095107, city = 'Bucharest', website = 'https://frudisiac.com' WHERE id = 164;

-- Batch 5: Cafes and cooking
UPDATE activities SET latitude = 44.465062, longitude = 26.085307, city = 'Bucharest', website = 'https://www.facebook.com/SteamCoffeeShop' WHERE id = 162;
UPDATE activities SET latitude = 44.436290, longitude = 26.094403, city = 'Bucharest', website = 'https://www.facebook.com/TroficFood' WHERE id = 165;
UPDATE activities SET latitude = 44.437629, longitude = 26.114680, city = 'Bucharest', website = 'https://romaniaprivatetours.com' WHERE id = 35;
UPDATE activities SET latitude = 46.770070, longitude = 23.590352, city = 'Cluj-Napoca', website = 'https://www.romanianfriend.com' WHERE id = 37;
UPDATE activities SET latitude = 45.797491, longitude = 24.151905, city = 'Sibiu', website = 'https://www.getyourguide.com' WHERE id = 39;
UPDATE activities SET latitude = 44.443427, longitude = 26.056363, city = 'Bucharest', website = 'https://sloanecoffee.com' WHERE id = 103;
UPDATE activities SET latitude = 44.427739, longitude = 26.072061, city = 'Bucharest', website = 'https://infinitea.ro' WHERE id = 149;
UPDATE activities SET latitude = 45.758585, longitude = 21.227160, city = 'Timișoara', website = 'https://bereta.beer' WHERE id = 40;

-- Batch 6: Cultural venues
UPDATE activities SET latitude = 44.440195, longitude = 26.095749, city = 'Bucharest', website = 'https://www.fge.org.ro' WHERE id = 122;
UPDATE activities SET latitude = 44.440989, longitude = 26.097651, city = 'Bucharest', website = 'https://www.btripbucharest.com' WHERE id = 121;
UPDATE activities SET latitude = 44.430900, longitude = 26.105800, city = 'Bucharest', website = 'https://www.unzipromania.com' WHERE id = 120;
UPDATE activities SET latitude = 44.437006, longitude = 26.104083, city = 'Bucharest', website = 'https://interestingtimes.ro' WHERE id = 119;
UPDATE activities SET latitude = 44.433971, longitude = 26.062000, city = 'Bucharest', website = 'https://muzeulcotroceni.ro' WHERE id = 118;
UPDATE activities SET latitude = 44.444632, longitude = 26.084267, city = 'Bucharest', website = 'https://www.georgeenescu.ro' WHERE id = 117;
UPDATE activities SET latitude = 44.427500, longitude = 26.087500, city = 'Bucharest', website = 'https://cic.cdep.ro' WHERE id = 116;
UPDATE activities SET latitude = 44.455114, longitude = 26.081824, city = 'Bucharest', website = 'https://muzeultaranuluiroman.ro' WHERE id = 115;
UPDATE activities SET latitude = 44.440195, longitude = 26.095749, city = 'Bucharest', website = 'https://www.fge.org.ro' WHERE id = 114;
UPDATE activities SET latitude = 44.431674, longitude = 26.100333, city = 'Bucharest', website = 'https://www.stavropoleos.ro' WHERE id = 113;

-- Batch 7: Fitness and learning
UPDATE activities SET latitude = 44.446471, longitude = 26.086042, city = 'Bucharest', website = 'https://yogahub.ro' WHERE id = 21;
UPDATE activities SET latitude = 44.452783, longitude = 26.080151, city = 'Bucharest', website = 'https://crossfitroa.ro' WHERE id = 23;
UPDATE activities SET latitude = 46.763947, longitude = 23.570127, city = 'Cluj-Napoca', website = 'https://smartmove.ro' WHERE id = 22;
UPDATE activities SET latitude = 46.774999, longitude = 23.587024, city = 'Cluj-Napoca', website = 'https://meron.coffee' WHERE id = 53;
UPDATE activities SET latitude = 44.433947, longitude = 26.096751, city = 'Bucharest', website = 'https://www.anf-cinemateca.ro' WHERE id = 148;
UPDATE activities SET latitude = 44.412023, longitude = 26.117235, city = 'Bucharest', website = 'https://nodmakerspace.ro' WHERE id = 124;
UPDATE activities SET latitude = 44.433609, longitude = 26.053875, city = 'Bucharest', website = 'https://scoalainformala.ro' WHERE id = 125;
UPDATE activities SET latitude = 44.446900, longitude = 26.092700, city = 'Bucharest', website = 'https://1000dechipuri.ro' WHERE id = 55;
UPDATE activities SET latitude = 44.454466, longitude = 26.083805, city = 'Bucharest', website = 'https://antipa.ro' WHERE id = 168;
UPDATE activities SET latitude = 44.426380, longitude = 26.097419, city = 'Bucharest', website = 'https://academia.f64.ro' WHERE id = 123;
UPDATE activities SET latitude = 44.433500, longitude = 26.109400, city = 'Bucharest', website = 'https://rolang.ro' WHERE id = 51;
UPDATE activities SET latitude = 44.434043, longitude = 26.102509, city = 'Bucharest', website = 'https://izi.travel' WHERE id = 151;
UPDATE activities SET latitude = 45.797491, longitude = 24.151905, city = 'Sibiu', website = 'https://visitsibiu.com' WHERE id = 54;
UPDATE activities SET latitude = 44.433273, longitude = 26.094507, city = 'Bucharest', website = 'https://origo.coffee' WHERE id = 52;

-- Batch 8: Mindfulness and nature
UPDATE activities SET latitude = 44.438900, longitude = 26.110200, city = 'Bucharest', website = 'https://theinner.ro' WHERE id = 178;
UPDATE activities SET latitude = 44.458000, longitude = 26.086000, city = 'Bucharest', website = 'https://floatroom.ro' WHERE id = 137;
UPDATE activities SET latitude = 44.441500, longitude = 26.109000, city = 'Bucharest', website = 'https://theinner.ro' WHERE id = 138;
UPDATE activities SET latitude = 44.444600, longitude = 26.102300, city = 'Bucharest', website = 'https://brahmakumaris.org' WHERE id = 177;
UPDATE activities SET latitude = 46.586790, longitude = 23.787363, city = 'Turda', website = 'https://salinaturda.eu' WHERE id = 57;
UPDATE activities SET latitude = 44.439900, longitude = 26.094900, city = 'Bucharest', website = 'https://brahmakumaris.org' WHERE id = 139;
UPDATE activities SET latitude = 46.552900, longitude = 25.133700, city = 'Praid', website = 'https://salinapraid.ro' WHERE id = 58;
UPDATE activities SET latitude = 44.441500, longitude = 26.109000, city = 'Bucharest', website = 'https://theinner.ro' WHERE id = 56;
UPDATE activities SET latitude = 44.443500, longitude = 26.080000, city = 'Bucharest', website = 'https://gongbath.ro' WHERE id = 176;
UPDATE activities SET latitude = 44.435900, longitude = 26.096900, city = 'Bucharest', website = 'https://taijidao.ro' WHERE id = 140;
UPDATE activities SET latitude = 44.590722, longitude = 26.077939, city = 'Balotești', website = 'https://therme.ro' WHERE id = 59;
UPDATE activities SET latitude = 44.439229, longitude = 26.063321, city = 'Bucharest', website = 'https://gradina-botanica.ro' WHERE id = 189;
UPDATE activities SET latitude = 44.468900, longitude = 26.080700, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 145;
UPDATE activities SET latitude = 44.406739, longitude = 26.106548, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 188;
UPDATE activities SET latitude = 44.426300, longitude = 26.087800, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 187;
UPDATE activities SET latitude = 44.438000, longitude = 26.062800, city = 'Bucharest', website = 'https://gradina-botanica.ro' WHERE id = 159;
UPDATE activities SET latitude = 44.415556, longitude = 26.097222, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 158;
UPDATE activities SET latitude = 44.434500, longitude = 26.092500, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 157;
UPDATE activities SET latitude = 44.462222, longitude = 26.081389, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 160;
UPDATE activities SET latitude = 44.425278, longitude = 26.186944, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 161;
UPDATE activities SET latitude = 44.440836, longitude = 26.100000, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 186;
UPDATE activities SET latitude = 44.453900, longitude = 26.118800, city = 'Bucharest', website = 'https://visitbucharest.today' WHERE id = 185;
UPDATE activities SET latitude = 45.346667, longitude = 22.895833, city = 'Nucșoara', website = 'https://retezat.ro' WHERE id = 66;
UPDATE activities SET latitude = 44.409722, longitude = 26.125000, city = 'Bucharest', website = 'https://parcnaturalvacaresti.ro' WHERE id = 146;

-- Batch 9: Nightlife venues
UPDATE activities SET latitude = 44.435900, longitude = 26.096600, city = 'Bucharest', website = 'https://control-club.ro' WHERE id = 1893;
UPDATE activities SET latitude = 44.417000, longitude = 26.097800, city = 'Bucharest', website = 'https://expirat.org' WHERE id = 1910;
UPDATE activities SET latitude = 44.257800, longitude = 28.630600, city = 'Mamaia', website = 'https://egoclub.ro' WHERE id = 1969;
UPDATE activities SET latitude = 44.432100, longitude = 26.099900, city = 'Bucharest', website = 'https://beeroclock.ro' WHERE id = 1926;
UPDATE activities SET latitude = 44.431900, longitude = 26.100200, city = 'Bucharest', website = 'https://belugamusic.ro' WHERE id = 1923;
UPDATE activities SET latitude = 44.472500, longitude = 26.080500, city = 'Bucharest', website = 'https://berariah.ro' WHERE id = 1905;
UPDATE activities SET latitude = 44.474700, longitude = 26.110400, city = 'Bucharest', website = 'https://boa.ro' WHERE id = 1896;
UPDATE activities SET latitude = 44.432000, longitude = 26.099200, city = 'Bucharest', website = 'https://brunowinebar.ro' WHERE id = 1927;
UPDATE activities SET latitude = 44.474112, longitude = 26.109038, city = 'Bucharest', website = 'https://nor-sky.ro' WHERE id = 1918;
UPDATE activities SET latitude = 44.432400, longitude = 26.099500, city = 'Bucharest', website = 'https://www.facebook.com/surubelnitaclub' WHERE id = 1928;
