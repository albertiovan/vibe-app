import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const imageData = [
  { id: 275, image_urls: ["https://internationalscuba.com/wp-content/uploads/2023/08/DSD-Square.jpeg"] },
  { id: 276, image_urls: ["https://s3.springbeetle.com/prod-us-bucket/trantor/attachments/USFM/old/media/magefan_blog/2022/03/Depositphotos_54405875_L-1024x682.jpg"] },
  { id: 315, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/03/60/cb/tandem-skydiving.jpg?w=1200&h=900&s=1"] },
  { id: 316, image_urls: ["https://www.motorparkromania.ro/img/Full.jpg"] },
  { id: 317, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/ee/c7/06/parc-aventura-brasov.jpg?w=500&h=500&s=1"] },
  { id: 318, image_urls: ["https://tunari-online.ro/wp-content/uploads/AmcKart-Tunari-Ilfov.jpeg"] },
  { id: 319, image_urls: ["https://extasy-resources-prod.s3-eu-west-1.amazonaws.com/event/36888/44a7b827-0eed-42b9-b514-afb54c2213ac.jpeg"] },
  { id: 320, image_urls: ["https://via-ferrata.ro/wp-content/uploads/2017/09/dsc_0638.jpg"] },
  { id: 321, image_urls: ["https://extasy-resources-prod.s3-eu-west-1.amazonaws.com/event/2697403/a62c1bd2-ad18-4dd7-abc4-60dc09b6d614.jpg"] },
  { id: 322, image_urls: ["https://massifexperience.com/wp-content/uploads/2023/06/mountain-biking-postavarul-massif.webp"] },
  { id: 738, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/19218/TH_MD_d5dea3c9-beaa-4c1e-8a9d-05a023b2ae7a.jpg"] },
  { id: 739, image_urls: ["https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/06/f1/24/9c.jpg"] },
  { id: 740, image_urls: ["https://www.adventure-terrain.com/wp-content/uploads/2020/07/via-ferrata-vadul-crisului-romania-9.jpg"] },
  { id: 741, image_urls: ["https://www.adventure-terrain.com/wp-content/uploads/2020/07/pietrele_negre.jpg"] },
  { id: 742, image_urls: ["https://www.adventure-terrain.com/wp-content/uploads/2020/07/camionul-7-scari-23.jpeg"] },
  { id: 743, image_urls: ["https://static.wixstatic.com/media/a883ab93-390a-4fcc-9eb2-cf03c026411e_paragliding-tandem-flight-from-bunloc-brasov-xlarge.webp"] },
  { id: 744, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/skydiving-tuzla-constanta_2_1200x1200.jpg"] },
  { id: 745, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/2697406/TH_MD_7295f1a8-bc6d-49bf-a558-a33890c9fc6b.png"] },
  { id: 746, image_urls: ["https://bike-resort-sinaia.ro/wp-content/uploads/2023/03/bike-resort-sinaia.jpg"] },
  { id: 747, image_urls: ["https://scontent.fotp3-4.fna.fbcdn.net/v/t1.6435-9/12045419_1701500890061334_1874810651707775489_o.jpg"] },
  { id: 748, image_urls: ["https://static.wixstatic.com/media/db9a84ba-cf54-42f3-9cc9-4e820e2ed662.jpg"] },
  { id: 749, image_urls: ["https://www.alpinexpe.ro/wp-content/uploads/2021/09/IMG_1102-scaled.webp"] },
  { id: 750, image_urls: ["https://t4.ftcdn.net/jpg/13/35/32/27/360_F_1335322730_6tYJZ8VHxP8yCz8g1c8mN7wGq6jU5o4k.jpg"] },
  { id: 751, image_urls: ["https://www.romaniaexperience.com/wp-content/uploads/2022/10/Show-caves-from-Romania-Vadul-Crisului-cave.jpg"] },
  { id: 794, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/1.Tandem-Standard.jpg.webp"] },
  { id: 795, image_urls: ["https://www.parcaventura.ro/wp-content/uploads/2024/05/IMG_6259.jpg"] },
  { id: 796, image_urls: ["https://www.parcaventura.ro/wp-content/uploads/2024/05/corporate-nou2.jpg"] },
  { id: 797, image_urls: ["https://www.parcaventura.ro/wp-content/uploads/2025/03/mega-adventure-park-2025_mega-climb.jpg"] },
  { id: 798, image_urls: ["https://comanapark.ro/wp-content/uploads/2022/07/Comana-Park-circuit-1024x577.jpg"] },
  { id: 799, image_urls: ["https://static.wixstatic.com/media/a0e1e66a-cf15-4a2e-9947-981b236e1382.jpg"] },
  { id: 800, image_urls: ["https://www.romaniaexperience.com/wp-content/uploads/2021/09/Valea-lui-Stan-Stan%E2%80%99s-Valley-Canyon-fagaras-cable.jpg"] },
  { id: 801, image_urls: ["https://a2wake.ro/wp-content/uploads/2023/07/A2-Wake-Cable-Park-11.jpg"] },
  { id: 802, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/2697413/TH_MD_874f3da1-2d8c-473c-88b2-09457e1a4ded.jpg"] },
  { id: 803, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/2f/ef/6c/and-here-we-are-underwater.jpg?w=1200&h=1200&s=1"] },
  { id: 859, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/41.jpeg"] },
  { id: 860, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/1647273379-carpathians.jpg"] },
  { id: 861, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/1647344481-8d5f79f5c738-15822587_1356836044366930_7860651287361935601_n.jpg"] },
  { id: 863, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/2697420/TH_MD_f07c6f91-2dfa-46a1-8206-59b25d59088d.jpeg"] },
  { id: 864, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/Unknown-1.jpeg"] },
  { id: 865, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/1647271269-winter-climbing-533x450.jpg"] },
  { id: 866, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/skiing_in_bucegi_mountains_-_photo_scarlatescu_andrei_dreamstime.com_.jpg"] },
  { id: 867, image_urls: ["https://static.wixstatic.com/media/80b8f740-85d6-417a-9571-1e561a8bde93_snowshoe-walking-tour-in-poiana-brasov-xlarge.jpg"] },
  { id: 868, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/20210227_103340.jpg"] },
  { id: 869, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/1-11.png"] },
  { id: 870, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/bicaz-min-600x400.jpg"] },
  { id: 936, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/skydiving-tuzla-constanta_2_1200x1200.jpg"] },
  { id: 937, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/1.Tandem-Standard.jpg.webp"] },
  { id: 938, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/salt-tandem-3.jpg"] },
  { id: 939, image_urls: ["https://www.skydiving-tuzla.ro/wp-content/uploads/2024/07/AnyConv.com__57170779_121059782414939_6146650644340969709_n.webp"] },
  { id: 940, image_urls: ["https://www.parcaventura.ro/wp-content/uploads/2020/01/parc-aventura-brasov-4-013975200-1579694177_900_600_lg.jpg"] },
  { id: 942, image_urls: ["https://www.wildromania.com/wp-content/uploads/2022/11/20190531_105608-01.jpeg"] },
  { id: 1018, image_urls: ["https://cdn-imgix.headout.com/media/images/0f9ff571da948de749eb007ee2cf9ffb-4318-bucharest-therme-bucuresti-tickets-01.jpg"] },
  { id: 1019, image_urls: ["https://www.aquapark-nymphaea.ro/wp-content/uploads/2021/08/aquapark-nymphaea-oradea.jpg"] },
  { id: 1020, image_urls: ["https://i.pinimg.com/originals/92/20/81/92208172.jpg"] },
  { id: 1021, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/DS1_0519-1024x683.jpg"] },
  { id: 1022, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/caption.jpg"] },
  { id: 1023, image_urls: ["https://i.pinimg.com/originals/aa/e1/b9/aae1b99192c0f3cf.jpeg"] },
  { id: 1024, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/Pivnitele-Rhein-CIE-Azuga-1892_2.jpg"] },
  { id: 1025, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/cat_thumb_186.png"] },
  { id: 1026, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/Satisfactie-Maxima-1.jpg"] },
  { id: 1027, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/visita-museo-pueblo-parque-herastrau-589x392.jpg"] },
  { id: 1028, image_urls: ["https://www.cramaturistica.ro/wp-content/uploads/2020/09/a-cup-of-latte-and-the.jpg"] },
  { id: 1029, image_urls: ["https://static.wixstatic.com/media/16190ed1-40d3-499f-bff1-af3090d4f7e5.jpg"] },
  { id: 1112, image_urls: ["https://crucible.org/wp-content/uploads/2021/07/Crucible-Magazine_Ceramics_Rosa-Dorantes_July-2021-7544-scaled.jpeg"] },
  { id: 1113, image_urls: ["https://www.louvre.fr/sites/default/files/2020-12/vase-painting.jpg"] },
  { id: 1114, image_urls: ["https://ateliereleilbah.ro/wp-content/uploads/2022/09/curs-pictura-1024x768.jpeg"] },
  { id: 1115, image_urls: ["https://ateliereleilbah.ro/wp-content/uploads/2022/09/WhatsApp_Image_2022-09-12_at_3_05_03_PM_1.webp"] },
  { id: 1118, image_urls: ["https://stor0.anuntul.ro/media/foto/landscape/2021/7/1/254679591.jpg"] },
  { id: 1967, image_urls: ["https://visitbucharest.today/wp-content/uploads/2025/07/EUROPAfest-2025-1.jpg"] },
  { id: 1968, image_urls: ["https://doorsclub.ro/wp-content/uploads/2023/05/doors-despre.jpg"] },
  { id: 1969, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/f4/1d/65/from-the-bar.jpg?w=1200&h=1200&s=1"] },
  { id: 1970, image_urls: ["https://fratelli.ro/wp-content/uploads/2024/07/fratelli-beach-8.jpg"] },
  { id: 1971, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/cd/e9/26/fratelli-iasi.jpg?w=1000&h=1000&s=1"] },
  { id: 1972, image_urls: ["https://euphoria.ro/wp-content/uploads/2025/12/Euphoria-Music-Hall-Cluj-Napoca-Dinner-Live-Concert-Party-4.jpg"] },
  { id: 2006, image_urls: ["https://image.cookly.me/images/food-as-medicine-vegan-hands-on-cooking-class-on-saturdays_xOqQ5kM.jpg"] },
  { id: 2007, image_urls: ["https://www.ateliereleilbah.ro/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-03-at-16.46.42_153df6b8.jpg"] },
  { id: 2008, image_urls: ["https://bacaniaveche.ro/wp-content/uploads/2016/10/10947292_902675719777101_1401623029289570756_n.jpg"] },
  { id: 2009, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/61/9b/cb/working-on-some-rolls.jpg?w=1200&h=1200&s=1"] },
  { id: 2010, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/32/f6/e8/longest-pasta-dance.jpg?w=1200&h=-1&s=1"] },
  { id: 2011, image_urls: ["https://assets.surlatable.com/m/60609b6cccb5e49/72_dpi_webp-11_CFA-8903742_GettyImages-1644900451_BlisteredBroccoliwithManchego"] },
  { id: 2012, image_urls: ["https://grill-expert.ro/wp-content/uploads/2025/01/IMG_6470-scaled.jpeg"] },
  { id: 2013, image_urls: ["https://www.romanianfriend.com/uploads/media/DSC_0142-frontend-landscape-image.jpeg"] },
  { id: 2014, image_urls: ["https://kuxa.ro/img/events/new/cg/003.jpg"] },
  { id: 2015, image_urls: ["https://casaratiu.ro/wp-content/uploads/2025/09/DSC1817-1024x875.jpg"] },
  { id: 2016, image_urls: ["https://www.institutescoffier.com/wp-content/uploads/2023/12/mastering-the-art-of-french-cooking.webp"] },
  { id: 2017, image_urls: ["https://icephotelschool.com/cdn/shop/products/Culinary_2.jpg?v=1515077146"] },
  { id: 2018, image_urls: ["https://icephotelschool.com/cdn/shop/products/Culinary_2.jpg?v=1515077146"] },
  { id: 2019, image_urls: ["https://www.sogoodmagazine.com/wp-content/uploads/2019/02/horeca-school-culinary.jpg"] },
  { id: 2020, image_urls: ["https://simpasibiu.ro/wp-content/uploads/2019/09/post-1.jpg"] },
  { id: 44, image_urls: ["https://cdn.getyourguide.com/img/tour/aae1b99192c0f3cf.jpeg/145.jpg"] },
  { id: 45, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2021/07/08100906/vista-dal-tavolo.jpg"] },
  { id: 46, image_urls: ["https://improfest.ro/wp-content/uploads/2023/10/improfest_impro_facebook_page.jpeg"] },
  { id: 47, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/44983/TH_MD_4d4dbec7-ae98-445c-a2f0-2f1be0c37880.jpg"] },
  { id: 48, image_urls: ["https://upload.wikimedia.org/wikipedia/commons/1/1d/IMG_0439.JPG"] },
  { id: 49, image_urls: ["https://i0.wp.com/atelierbrocante.ro/wp-content/uploads/2024/01/ScreenPrint1_N8vBwdP.jpg?fit=950%2C690&ssl=1"] },
  { id: 50, image_urls: ["https://static4.libertatea.ro/wp-content/uploads/2020/01/sibiel-church.jpg"] },
  { id: 51, image_urls: ["https://muzeulastra.ro/wp-content/uploads/2023/05/Muzeul-Astra-Branding-Guidelines-1-10.jpg"] },
  { id: 52, image_urls: ["https://www.unibuc.ro/wp-content/uploads/2022/03/resource-c-1160-1200x720-iwh-facultatea-de-drept-imm-unibuc-universitate-590x430.jpg"] },
  { id: 53, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/02/14113843/barista-workshop-in-bucharest-for-coffee-lovers.jpg"] },
  { id: 54, image_urls: ["https://www.academiadebarista.ro/wp-content/uploads/2023/04/WhatsApp-Image-2023-04-13-at-11.06.31-1-e1681925392611.jpeg"] },
  { id: 55, image_urls: ["https://images.squarespace-cdn.com/content/v1/5d9b0e84c12b1b0d71cf3bd6/1572639953913-0G0Z0Y7GJKTWZV3V5J2W/Cooking.jpg"] },
  { id: 56, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/05/05094850/bucharest-romanian-wine-tasting-experience-at-corks.jpg"] },
  { id: 57, image_urls: ["https://www.urbanshanti.ro/wp-content/uploads/2022/06/SESIUNE-PRIVATA-SOUND-HEALING-2-PERSOANE-1-SESIUNE.jpg"] },
  { id: 58, image_urls: ["https://www.salina-turda.eu/wp-content/uploads/2020/05/Turda-Salt-Mine-Salina-Turda.jpg"] },
  { id: 59, image_urls: ["https://i.pinimg.com/originals/a2/80/a0/a280a0ea2aab34764a0354d5f4619379.jpg"] },
  { id: 60, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ1jYv9pLQ9Jd5oA9V8lP5nQwq5E3i7O4d4Q&s"] },
  { id: 61, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/21472/ab8adda51af2a8198f06d4bc8deb8ee3a1d08994.jpeg"] },
  { id: 62, image_urls: ["https://aquatonic.ro/wp-content/uploads/2024/01/aqvatonic-pool-with-swan.jpg"] },
  { id: 63, image_urls: ["https://thumbs.dreamstime.com/b/dambovita-runcu-october-tourists-relaxing-horseback-leaota-mountains-romania-dambovita-runcu-october-tourists-239195575.jpg"] },
  { id: 64, image_urls: ["https://upload.wikimedia.org/wikipedia/commons/3/3a/Sphinx-bucegi-romania.jpg"] },
  { id: 65, image_urls: ["https://www.turistul.ro/images/attractions/ghetarul-scarisoara-ice-cave-glacier-romania-1.jpg"] },
  { id: 66, image_urls: ["https://i.ytimg.com/vi/2v8xw3vS7oA/maxresdefault.jpg"] },
  { id: 67, image_urls: ["https://www.experimenteaza.ro/19718-superlarge_default_2x/48.jpg"] },
  { id: 68, image_urls: ["https://visit-sibiu.ro/images/dsc07294-frontend-landscape-image.jpeg"] },
  { id: 69, image_urls: ["https://bucharestbachelorparty.com/uploads/activities/Boardgames.jpg"] },
  { id: 70, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0R2P8Fqv1vYl9p6XkwcZp0q3O7Y8g9j2n4Q&s"] },
  { id: 71, image_urls: ["https://mybestplace.com/wp-content/uploads/2022/09/our-medieval-reception.jpg"] },
  { id: 72, image_urls: ["https://i.ytimg.com/vi/133955-542663265161531/maxresdefault.jpg"] },
  { id: 73, image_urls: ["https://cdn.getyourguide.com/img/tour/linea-closer-to-the-moon-600-1.jpg/145.jpg"] },
  { id: 74, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2020/07/07083841/herastrau-boat-ride-6.jpg"] },
  { id: 75, image_urls: ["https://scontent.fotp3-1.fna.fbcdn.net/v/t1.6435-9/195586891_139585414900270_1053172029308399251_n.jpg"] },
  { id: 76, image_urls: ["https://www.evenimente-speciale.ro/wp-content/uploads/2022/04/3-locatii-sedinta-foto-logodna-Bucuresti-fotograf-6.jpg"] },
  { id: 77, image_urls: ["https://edenland.ro/wp-content/uploads/2020/06/Edenland.Park_.Baloresti_99-1024x768.jpg"] },
  { id: 78, image_urls: ["https://www.camping-comana.ro/wp-content/uploads/2021/07/Comana-Park.jpg"] },
  { id: 79, image_urls: ["https://www.tandem-premium.ro/wp-content/uploads/2023/07/Tandem-premium.jpg"] },
  { id: 80, image_urls: ["https://scontent.cdninstagram.com/v/t51.29350-15/385397318_23949392628037494_4321217142721491979_n.jpg"] },
  { id: 81, image_urls: ["https://guamdailynews.com/wp-content/uploads/2020/05/Guam-Badminton-Sports-Centre.-Credit-Norman-M.-Taruc-The-Guam-Daily-Post.jpg"] },
  { id: 82, image_urls: ["https://www.bucharestbachelorparty.com/uploads/activities/Patinoar-Afi-Cotroceni-on-Ice-bg-2025.jpg"] },
  { id: 83, image_urls: ["https://arsenalpark.ro/wp-content/uploads/2024/05/ArsenalPark2024_Atractii_Tir-cu-arcul_3.jpg"] },
  { id: 84, image_urls: ["https://i.ytimg.com/vi/246737351/maxresdefault.jpg"] },
  { id: 85, image_urls: ["https://www.danubeadventure.com/wp-content/uploads/2020/08/DSC_2287.jpg"] },
  { id: 86, image_urls: ["https://www.district-ro.com/wp-content/uploads/2023/10/explore-dozens-of-immersive.jpg"] },
  { id: 87, image_urls: ["https://scontent.fotp3-1.fna.fbcdn.net/v/t1.6435-9/Watermill.jpg"] },
  { id: 88, image_urls: ["https://fever.imgix.net/plan/photo/valentinesday_2024/_candlelight_og_valentinesday_2024.jpg"] },
  { id: 89, image_urls: ["https://www.terrapark.ro/wp-content/uploads/2023/02/16-1.jpg"] },
  { id: 90, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2020/07/07083840/herastrau-boat-ride-5.jpg"] },
  { id: 91, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/20509/0de2620a-1604-409e-93a2-9d521735ec44.jpeg"] },
  { id: 92, image_urls: ["https://images.virginexperiencedays.co.uk/images/product/large/top_rope_climbing_indoor_with_belayer_480x480.jpg"] },
  { id: 93, image_urls: ["https://www.hireatag.com/media/images/Laser_Tag_Group.jpg"] },
  { id: 94, image_urls: ["https://padelmania.ro/wp-content/uploads/2023/06/Padelmania_0001.jpg"] },
  { id: 95, image_urls: ["https://www.sportarena.ro/wp-content/uploads/2022/05/5-a-side-football.webp"] },
  { id: 96, image_urls: ["https://i0.wp.com/www.prismasport.ro/wp-content/uploads/2022/09/WhatsApp_Image_2022-09-12_at_3_05_03_PM_1.webp"] },
  { id: 97, image_urls: ["https://static.wixstatic.com/media/73bc1b_4a871968adb24e9a9dff860290f56707~mv2.jpg"] },
  { id: 98, image_urls: ["https://www.experimenteaza.ro/19616-superlarge_default_2x/Image6.jpg"] },
  { id: 99, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYk2n1hN3bO5q2mD6V2rG6uY0Xo6xj7c2N3g&s"] },
  { id: 100, image_urls: ["https://www.atlastravel.ro/images/5.04.2016-91.jpg"] },
  { id: 101, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/40959/photoroom_20250412_142029.jpg"] },
  { id: 102, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/20610/photo0jpg.jpg"] },
  { id: 103, image_urls: ["https://www.experimenteaza.ro/19948-superlarge_default_2x/06.jpg"] },
  { id: 104, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/01/31104231/experience-connecting-with-clay-pottery-workshop.jpg"] },
  { id: 105, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/03/08120824/soy-wax-scented-candle-casting-workshop-in-bucharest.jpg"] },
  { id: 106, image_urls: ["https://thumbs.dreamstime.com/b/bucharest-romania-april-people-having-fun-japanese-garden-herastrau-park-weekend-spring-117584538.jpg"] },
  { id: 107, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/23512/amethyst-sky-bar.jpg"] },
  { id: 108, image_urls: ["https://www.kingdomofwonder.ro/wp-content/uploads/2024/08/working-on-some-rolls.jpg"] },
  { id: 109, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/26427/f09eaed3-6500-4000-b7a3-186087910196.jpg"] },
  { id: 110, image_urls: ["https://www.experimenteaza.ro/19726-superlarge_default_2x/56.jpg"] },
  { id: 111, image_urls: ["https://www.experimenteaza.ro/19731-superlarge_default_2x/3f.jpg"] },
  { id: 112, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/26967/upstairs.jpg"] },
  { id: 113, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/07/8d/cc/caption.jpg?w=500&h=400&s=1"] },
  { id: 114, image_urls: ["https://www.experimenteaza.ro/19762-superlarge_default_2x/145.jpg"] },
  { id: 115, image_urls: ["https://cdn.getyourguide.com/img/tour/5aaff6563173e.jpeg/145.jpg"] },
  { id: 116, image_urls: ["https://www.f64.ro/_next/image?url=https%3A%2F%2Fwww.f64.ro%2Fmedia%2Fwysiwyg%2Fcoperta%2F1600x790-coperta-curs-foto-acreditat-online-grupa-de-seara-700x480.jpg&w=1920&q=75"] },
  { id: 117, image_urls: ["https://rapidprototyping.ro/wp-content/uploads/2023/09/rapidpro-september-blog-2-from-design-to-prototype.png"] },
  { id: 118, image_urls: ["https://www.datocms-assets.com/48401/1628644950-front-end-web-development-1.jpg"] },
  { id: 119, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/18964/workshop-cover.jpg"] },
  { id: 120, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/24272/pottery-wheel-1_600x600.jpg"] },
  { id: 121, image_urls: ["https://www.theclayplay.com/wp-content/uploads/2023/06/hand-building-ceramics-workshop-make-a-planter-2-portrait-big.jpg"] },
  { id: 122, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/25486/image7.jpeg"] },
  { id: 123, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/21920/wp-4.jpg"] },
  { id: 124, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/23814/background_zoom.jpg"] },
  { id: 125, image_urls: ["https://visit-sibiu.ro/images/art_0193-frontend-landscape-image.jpeg"] },
  { id: 126, image_urls: ["https://www.orhideeaspa.ro/wp-content/uploads/2022/10/orhideeaspanew_fotosoto.ro-13.jpg"] },
  { id: 127, image_urls: ["https://www.orhideeaspa.ro/wp-content/uploads/2022/10/hero-shiseidospa-mobile.jpg"] },
  { id: 128, image_urls: ["https://media.gettyimages.com/id/1172395370/photo/yoga.jpg?s=1200x628&w=gi&k=20&c=edit"] },
  { id: 129, image_urls: ["https://images.squarespace-cdn.com/content/v1/5c7d4a2c4d546e27b1c82df1/647d30d6ff56a339fe0e1565_yoga%20finals%20(167%20of%20377)-opt.jpg"] },
  { id: 130, image_urls: ["https://static.wixstatic.com/media/8cc233_6774ce136465448e8da64f00077d84dc~mv2.jpg"] },
  { id: 131, image_urls: ["https://scontent.fotp3-1.fna.fbcdn.net/v/t1.6435-9/278012757_1861544967380412_4985561069643332191_n.jpg"] },
  { id: 132, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/07/8d/cc/caption.jpg?w=500&h=400&s=1"] },
  { id: 133, image_urls: ["https://i0.wp.com/www.chowhound.com/wp-content/uploads/2023/07/800x600.jpg"] },
  { id: 134, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/26459/roof-terrace.jpg"] },
  { id: 135, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/24265/7e0dcae45546f716b15df09565426f7863149eb1257d95508ba08122a3db1fb3.jpg"] },
  { id: 136, image_urls: ["https://www.romania-insider.com/sites/default/files/styles/article_large_image/public/featured_images/parc_herastrau_copyright_ampt_7.jpg"] },
  { id: 137, image_urls: ["https://www.airial.travel/_next/image?url=https%3A%2F%2Fcoinventmediastorage.blob.core.windows.net%2Fmedia-storage-container%2Fgphoto_ChIJkTlHdBw_s0ARx8-sa1sVMtA_0.jpg&w=3840&q=70"] },
  { id: 138, image_urls: ["https://i0.wp.com/www.chowhound.com/wp-content/uploads/2023/07/800x600.jpg"] },
  { id: 139, image_urls: ["https://www.romania-insider.com/sites/default/files/styles/article_large_image/public/2024-12/festivalul-filmelor-de-craciun.jpg"] },
  { id: 140, image_urls: ["https://infinitea.ro/wp-content/uploads/2023/10/ceainaria-infinitea.jpg"] },
  { id: 141, image_urls: ["https://getts.ro/wp-content/uploads/2023/03/getts_color_bar_salon_plaza_romania_drumul_taberei_militari_2.jpg"] },
  { id: 142, image_urls: ["https://www.experimenteaza.ro/19746-superlarge_default_2x/68.jpg"] },
  { id: 143, image_urls: ["https://i0.wp.com/www.chowhound.com/wp-content/uploads/2023/07/1500.jpg"] },
  { id: 144, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2nVv-4vU5zB0Y-7tqH7pHnF3Q8Ih5e7F5NQ&s"] },
  { id: 145, image_urls: ["https://img.freepik.com/free-photo/spa-herbal-compressing-ball-with-candles-and-orchid.jpg"] },
  { id: 146, image_urls: ["https://www.experimenteaza.ro/img/cms/homeExperiente.jpg"] },
  { id: 147, image_urls: ["https://www.salina-slanic.ro/wp-content/uploads/2021/09/slanic-salt-mine-scaled.webp"] },
  { id: 148, image_urls: ["https://www.experimenteaza.ro/19710-superlarge_default_2x/cismigiu0.jpg"] },
  { id: 149, image_urls: ["https://i0.wp.com/www.chowhound.com/wp-content/uploads/2023/07/800x600.jpg"] },
  { id: 150, image_urls: ["https://www.experimenteaza.ro/19719-superlarge_default_2x/weg.jpg"] },
  { id: 151, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/07/8d/cc/caption.jpg?w=500&h=400&s=1"] },
  { id: 152, image_urls: ["https://i.redd.it/km7u0aevms381.png"] },
  { id: 153, image_urls: ["https://www.experimenteaza.ro/19721-superlarge_default_2x/steam.jpg"] },
  { id: 154, image_urls: ["https://www.experimenteaza.ro/19722-superlarge_default_2x/dsc_0083.jpg"] },
  { id: 155, image_urls: ["https://www.experimenteaza.ro/19723-superlarge_default_2x/from-the-inside.jpg"] },
  { id: 156, image_urls: ["https://www.experimenteaza.ro/19724-superlarge_default_2x/gae_sc_neerlandeza.jpg"] },
  { id: 157, image_urls: ["https://www.muzeulhartilor.ro/wp-content/uploads/2022/06/muzeul-hartilor-plafon.jpg"] },
  { id: 158, image_urls: ["https://www.romania-insider.com/sites/default/files/styles/article_large_image/public/2021-11/grigore-antipa-national.jpg"] },
  { id: 159, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2022/12/19103113/romanian-crafts-in-bucharest-pottery-workshop.jpg"] },
  { id: 160, image_urls: ["https://scontent.fotp3-1.fna.fbcdn.net/v/t1.6435-9/18620578_678826618976507_8706196323400883194_o.jpg"] },
  { id: 161, image_urls: ["https://calig.ro/wp-content/uploads/2023/03/SITE_CALIG-ADOL.jpg"] },
  { id: 162, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2022/11/01145604/balkan_quartet_folk_embroidery_square_300x.jpg"] },
  { id: 163, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/06/05091057/inline-hand-sewing-basics.jpg"] },
  { id: 164, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/04/03125412/relaxation-and-halotherapy-in-a-salt-cave-in-bucharest.jpg"] },
  { id: 165, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/04/06111522/perfume-workshop-for-2-persons-in-bucharest.jpg"] },
  { id: 166, image_urls: ["https://www.soundhealing.ro/wp-content/uploads/2023/01/types-of-sound-baths.jpg"] },
  { id: 167, image_urls: ["https://cdn.getyourguide.com/img/tour/1000_1759475540.jpg/145.jpg"] },
  { id: 168, image_urls: ["https://www.destinationdeluxe.com/wp-content/uploads/2022/09/wim-hof-method-breathwork.jpg"] },
  { id: 169, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/20610/photo0jpg.jpg"] },
  { id: 170, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/26631/cmraaaaaoj1qlbbgt32trr6vqsacds6atabfmq_o1u7ts3hrq40ehxziro67zpgsx-zddxbq6ngq7kc2eag9b_ad1av3sr7mwo7lkf9du__s7awnks6_cz1cgxstq-fywmynzce2ehds1vuvkwmpepoyr7f52r2aghszepjxggw6vaifgzblrt7tw5rw1w.jpg"] },
  { id: 171, image_urls: ["https://bob.coffee/wp-content/uploads/2023/10/bob-coffee-shop.jpg"] },
  { id: 172, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQ1jYv9pLQ9Jd5oA9V8lP5nQwq5E3i7O4d4Q&s"] },
  { id: 173, image_urls: ["https://upload.wikimedia.org/wikipedia/commons/3/30/Th_Muzeul_K_H_Zambaccian3.JPG"] },
  { id: 174, image_urls: ["https://www.thewhiskyexchange.com/Images/brands/3184623_orig.jpg"] },
  { id: 175, image_urls: ["https://cdn.getyourguide.com/img/tour/img2823.jpg/145.jpg"] },
  { id: 176, image_urls: ["https://upload.wikimedia.org/wikipedia/commons/3/3e/IMG_0761.jpg"] },
  { id: 177, image_urls: ["https://www.experimenteaza.ro/19720-superlarge_default_2x/parliament-of-palace-bucharest-view-from-izvor-park-scaled.jpeg"] },
  { id: 178, image_urls: ["https://www.romania-insider.com/sites/default/files/styles/article_large_image/public/featured_images/tineretului-park.jpg"] },
  { id: 179, image_urls: ["https://www.gradina-botanica.ro/wp-content/uploads/2023/05/poza-botanical-garden-gradina-botanica--1-20.jpg"] },
  { id: 180, image_urls: ["https://www.thesprucecrafts.com/thmb/pinchingclaypot-gettyimages-681907815-59640d445f9b583f1813869a.jpg"] },
  { id: 181, image_urls: ["https://cdn.getyourguide.com/img/tour/pottery-taster-session-1579348265.jpg/145.jpg"] },
  { id: 182, image_urls: ["https://images.squarespace-cdn.com/content/v1/artist-painting-on-canvas.jpg"] },
  { id: 183, image_urls: ["https://upload.wikimedia.org/wikipedia/commons/IMG_4480.jpg"] },
  { id: 184, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/07/19130329/hand-lettering-workshop2_800x.webp"] },
  { id: 185, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/06/28103143/knitting-or-crochet-workshop-for-beginners-near-brasov.jpg"] },
  { id: 186, image_urls: ["https://mina-museum.ro/wp-content/uploads/2023/05/mina-rudolf.jpg"] },
  { id: 187, image_urls: ["https://www.sportarena.ro/wp-content/uploads/2023/10/COTW_Politehnica-Sport-Arena-Court_1239823670.webp"] },
  { id: 188, image_urls: ["https://img.freepik.com/free-photo/women-volleyball-action-players-pictured-romanian-division-game-csm-bucharest-csm-50089691.jpg"] },
  { id: 189, image_urls: ["https://www.danubeadventure.com/wp-content/uploads/2020/08/DSC_2257.jpg"] },
  { id: 190, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/04/18120711/tennis-lessons-for-children-and-adults-in-herastrau-park-in-bucharest.jpg"] },
  { id: 191, image_urls: ["https://cdn.getyourguide.com/img/tour/footvolley-see-note-superjumbo.jpg/145.jpg"] },
  { id: 192, image_urls: ["https://cdn.getyourguide.com/img/tour/540_p4_pic1.jpg/145.jpg"] },
  { id: 193, image_urls: ["https://cdn.romania-insider.com/sites/default/files/styles/article_large_image/public/featured_images/frisbee-wikipedia.jpg"] },
  { id: 194, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDfVAdZgrGPFj_gmQT_4jPPOfyCB7y-12SsA&s"] },
  { id: 195, image_urls: ["https://resource-cdn.obsbothk.com/product_system_back/product_img/handball-image-1.jpg"] },
  { id: 196, image_urls: ["https://www.teamplusone.com/wp-content/uploads/2019/06/plus-one-defense-systems-kickboxing-in-west-hartford-cardio-workout.jpg"] },
  { id: 197, image_urls: ["https://www.myrthapools.com/site/assets/files/2573/02.640x0.jpg"] },
  { id: 198, image_urls: ["https://u-cluj.ro/wp-content/uploads/2016/08/atletism2-e1472557577297.jpg"] },
  { id: 199, image_urls: ["https://www.prieurusa.com/wp-content/uploads/2024/03/IMG_5971.jpg"] },
  { id: 200, image_urls: ["https://www.tabletenniscoach.me.uk/wp-content/uploads/2025/04/club-night-1.jpg"] },
  { id: 201, image_urls: ["https://static1.squarespace.com/static/6604ccea4cf1747888dde655/t/66bba78e78900d55c5f1af83/1723574160645/Pickleball%2Bsocial%2Bimpact%2B%25281%2529.jpg?format=1500w"] },
  { id: 202, image_urls: ["https://btrussia.com/media/k2/items/cache/ce5a90e759e6e136127a80d546625866_XL.jpg"] },
  { id: 203, image_urls: ["https://massifexperience.com/wp-content/uploads/2023/06/mountain-biking-postavarul-massif.webp"] },
  { id: 204, image_urls: ["https://images.virginexperiencedays.co.uk/images/product/large/outdoor-rock-climbing-day-08160029.jpg?auto=compress%2Cformat&w=1440&q=80&fit=max"] },
  { id: 205, image_urls: ["https://salvamontbihor.ro/app/webroot/files/userfiles/images/20017867_715014472040607_4867533521874973060_o.jpg"] },
  { id: 206, image_urls: ["https://www.airial.travel/_next/image?url=https%3A%2F%2Fcoinventmediastorage.blob.core.windows.net%2Fmedia-storage-container%2Fgphoto_ChIJkTlHdBw_s0ARx8-sa1sVMtA_0.jpg&w=3840&q=70"] },
  { id: 207, image_urls: ["https://carpathiatrails.com/wp-content/uploads/2022/03/Curse_solorun_leaota_1000x1120-min-1.jpg"] },
  { id: 208, image_urls: ["https://www.outdoorportofino.com/wp-content/uploads/2022/01/orienteering-outdoor-portofino.jpg"] },
  { id: 209, image_urls: ["https://wel.ro/wp-content/uploads/2022/08/AnyConv.com__57170779_121059782414939_6146650644340969709_n.webp"] },
  { id: 210, image_urls: ["https://www.pelago.com/img/products/RO-Romania/paragliding-tandem-flight-from-bunloc-brasov/a883ab93-390a-4fcc-9eb2-cf03c026411e_paragliding-tandem-flight-from-bunloc-brasov-xlarge.webp"] },
  { id: 211, image_urls: ["https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/71/00/bf/caption.jpg?w=500&h=400&s=1"] },
  { id: 212, image_urls: ["https://i.ytimg.com/vi/JzyxAfCYKx8/maxresdefault.jpg"] },
  { id: 213, image_urls: ["https://www.shape.com/thmb/juZ1SfooOdjIq6zvXgmsoYRp8Rc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/boxing-8fa6221ec7ad4a80ba1e730eb9d1c507.jpg"] },
  { id: 214, image_urls: ["https://imagelibrary.davidlloyd.co.uk/transform/6e540b53-9176-4f0d-a7df-3b83da6d9f5d/HR_DavidLoyd__ph_5211?format=webp"] },
  { id: 215, image_urls: ["https://prismfitnessgroup.com/wp-content/uploads/2024/04/45-Minute-Outdoor-Bootcamp-Workouts-for-Total-Body-Burn-2.jpg"] },
  { id: 216, image_urls: ["https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/13756465/Photo_Aug_31__1_53_26_PM.jpg?quality=90&strip=all&crop=0%2C0.27322404371584%2C100%2C99.453551912568&w=2400"] },
  { id: 217, image_urls: ["https://png.pngtree.com/thumb_back/fh260/background/20220503/pngtree-dancing-zumba-fitness-enthusiast-trains-in-a-dance-studio-photo-image_36318354.jpg"] },
  { id: 218, image_urls: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLP2pO-edGouTz_d4nw7WWyV-OQCBa4wGcRg&s"] },
  { id: 219, image_urls: ["https://ca-times.brightspotcdn.com/dims4/default/ae79c5f/2147483647/strip/true/crop/4874x3250+0+0/resize/1200x800!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2Ff6%2F5f%2F940d8b534d188357e00258b25ea9%2F1155864-la-tr-ninja-warrior05-1.jpg"] },
  { id: 220, image_urls: ["https://s3.eu-west-1.amazonaws.com/extasy-resources-prod/event/2623350/TH_MD_57f3d973-adee-4af7-858a-8b71b4294fdd.jpg"] },
  { id: 221, image_urls: ["https://d14fqx6aetz9ka.cloudfront.net/wp-content/uploads/2023/08/29055122/IMG_7571-2.jpg"] },
  { id: 222, image_urls: ["https://i.ytimg.com/vi/wEg6VecHRws/maxresdefault.jpg"] },
  { id: 223, image_urls: ["https://muntii-nostri.ro/sites/default/files/styles/gallery_image_single/public/pietrele_negre.jpg?itok=zmkYAQtz"] }
];

async function importImages() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
  });

  let updated = 0;
  let failed = 0;
  const errors: { id: number; error: string }[] = [];

  console.log(`Starting import of ${imageData.length} activity images...`);

  try {
    for (const item of imageData) {
      try {
        const result = await pool.query(
          `UPDATE activities 
           SET image_urls = $1, 
               hero_image_url = $2
           WHERE id = $3
           RETURNING id, name`,
          [item.image_urls, item.image_urls[0], item.id]
        );

        if (result.rowCount && result.rowCount > 0) {
          updated++;
          if (updated % 25 === 0) {
            console.log(`✅ Progress: ${updated}/${imageData.length} updated`);
          }
        } else {
          failed++;
          errors.push({ id: item.id, error: 'Activity not found' });
        }
      } catch (err) {
        failed++;
        errors.push({ id: item.id, error: String(err) });
      }
    }

    console.log('\n========== IMPORT COMPLETE ==========');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(e => console.log(`  - ID ${e.id}: ${e.error}`));
    }

    // Verify a sample
    const sample = await pool.query(
      `SELECT id, name, hero_image_url, array_length(image_urls, 1) as img_count 
       FROM activities 
       WHERE id IN (28, 100, 150, 200, 223) 
       ORDER BY id`
    );
    console.log('\nSample verification:');
    sample.rows.forEach(r => {
      console.log(`  ID ${r.id}: ${r.name} - ${r.img_count} image(s)`);
    });

  } finally {
    await pool.end();
  }
}

importImages().catch(console.error);
