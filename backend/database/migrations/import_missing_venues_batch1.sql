-- Import missing venue data for activities 8, 15-23
-- Batch 1: 10 venues with location and website data

-- Insert venues
INSERT INTO venues (activity_id, name, address, city, latitude, longitude, website, created_at, updated_at)
VALUES 
  (8, 'Cabana Bâlea Lac', 'Bâlea Lac, Transfăgărășan (DN7C), Cârțișoara 557075, Sibiu County, Romania', 'Bâlea Lac', 45.6042, 24.6182, 'https://balealac.ro', NOW(), NOW()),
  (15, 'Control Club', 'Strada Constantin Mille 4, București 010142, Romania', 'Bucharest', 44.4329, 26.1063, 'http://www.control-club.ro', NOW(), NOW()),
  (16, 'FORM Space', 'Aleea Stadionului 2, Cluj-Napoca 400000, Romania', 'Cluj-Napoca', 46.7675, 23.5727, 'https://www.formspace.ro', NOW(), NOW()),
  (17, 'Database Club Timișoara', 'Calea Circumvalațiunii 8-10, Timișoara 300012, Romania', 'Timișoara', 45.7570, 21.2201, 'https://clubdatabase.ro', NOW(), NOW()),
  (18, 'Fratelli Lounge & Club Iași', 'Strada Palas 5D, Iași 700259, Romania', 'Iași', 47.1557, 27.5887, 'https://fratelli.ro/fratelli-iasi/', NOW(), NOW()),
  (19, 'Mystery Rooms Escape București', 'Bulevardul Schitu Măgureanu 45, București 010184, Romania', 'Bucharest', 44.4355, 26.0815, 'https://www.mysteryrooms.ro', NOW(), NOW()),
  (20, 'The Dungeon Escape Room', 'Strada Observatorului 90, Cluj-Napoca 400352, Romania', 'Cluj-Napoca', 46.7570, 23.5840, 'https://thedungeon.ro', NOW(), NOW()),
  (21, 'Cub Yoga Studio', 'Bulevardul Pache Protopopescu 43A, București 021401, Romania', 'Bucharest', 44.4395, 26.1231, 'https://www.cubyogastudio.com', NOW(), NOW()),
  (22, 'Smart Move CrossFit Berăriei', 'Strada Berăriei 6, Cluj-Napoca 400380, Romania', 'Cluj-Napoca', 46.7636, 23.5701, 'https://www.smartmovecrossfit.ro', NOW(), NOW()),
  (23, 'Replay CrossFit', 'Iride Business Park, Clădirea 13, Bulevardul Dimitrie Pompeiu 9-9A, București 020335, Romania', 'Bucharest', 44.4841, 26.1187, 'http://www.replaycrossfit.ro', NOW(), NOW());

-- Update activities table with website URLs (if not already set)
UPDATE activities SET website = 'https://balealac.ro', updated_at = NOW() WHERE id = 8 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'http://www.control-club.ro', updated_at = NOW() WHERE id = 15 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://www.formspace.ro', updated_at = NOW() WHERE id = 16 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://clubdatabase.ro', updated_at = NOW() WHERE id = 17 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://fratelli.ro/fratelli-iasi/', updated_at = NOW() WHERE id = 18 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://www.mysteryrooms.ro', updated_at = NOW() WHERE id = 19 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://thedungeon.ro', updated_at = NOW() WHERE id = 20 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://www.cubyogastudio.com', updated_at = NOW() WHERE id = 21 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'https://www.smartmovecrossfit.ro', updated_at = NOW() WHERE id = 22 AND (website IS NULL OR website = '');
UPDATE activities SET website = 'http://www.replaycrossfit.ro', updated_at = NOW() WHERE id = 23 AND (website IS NULL OR website = '');

-- Update activities table with city and location data (if not already set)
UPDATE activities SET city = 'Bâlea Lac', latitude = 45.6042, longitude = 24.6182, updated_at = NOW() WHERE id = 8 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Bucharest', latitude = 44.4329, longitude = 26.1063, updated_at = NOW() WHERE id = 15 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Cluj-Napoca', latitude = 46.7675, longitude = 23.5727, updated_at = NOW() WHERE id = 16 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Timișoara', latitude = 45.7570, longitude = 21.2201, updated_at = NOW() WHERE id = 17 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Iași', latitude = 47.1557, longitude = 27.5887, updated_at = NOW() WHERE id = 18 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Bucharest', latitude = 44.4355, longitude = 26.0815, updated_at = NOW() WHERE id = 19 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Cluj-Napoca', latitude = 46.7570, longitude = 23.5840, updated_at = NOW() WHERE id = 20 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Bucharest', latitude = 44.4395, longitude = 26.1231, updated_at = NOW() WHERE id = 21 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Cluj-Napoca', latitude = 46.7636, longitude = 23.5701, updated_at = NOW() WHERE id = 22 AND (city IS NULL OR city = '');
UPDATE activities SET city = 'Bucharest', latitude = 44.4841, longitude = 26.1187, updated_at = NOW() WHERE id = 23 AND (city IS NULL OR city = '');
