import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// Production RDS connection
const PRODUCTION_DB_URL = 'postgresql://vibeadmin:VibeApp2024Secure!@vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com:5432/vibe_app?sslmode=require';

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
  { id: 2020, image_urls: ["https://simpasibiu.ro/wp-content/uploads/2019/09/post-1.jpg"] }
];

async function importToProduction() {
  const pool = new Pool({
    connectionString: PRODUCTION_DB_URL,
    ssl: { rejectUnauthorized: true }
  });

  let updated = 0;
  let failed = 0;
  const errors: { id: number; error: string }[] = [];

  console.log('🚀 Starting import to PRODUCTION RDS database...');
  console.log(`📊 Total images to import: ${imageData.length}`);
  console.log('🔒 Using SSL connection to RDS\n');

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
          if (updated % 10 === 0) {
            console.log(`✅ Progress: ${updated}/${imageData.length} updated`);
          }
        } else {
          failed++;
          errors.push({ id: item.id, error: 'Activity not found in production DB' });
        }
      } catch (err) {
        failed++;
        errors.push({ id: item.id, error: String(err) });
      }
    }

    console.log('\n========== PRODUCTION IMPORT COMPLETE ==========');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors:');
      errors.forEach(e => console.log(`  - ID ${e.id}: ${e.error}`));
    }

    // Verify production database state
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN array_length(image_urls, 1) > 0 THEN 1 END) as with_images
       FROM activities`
    );
    
    console.log('\n📊 Production Database Stats:');
    console.log(`  Total activities: ${stats.rows[0].total_activities}`);
    console.log(`  Activities with images: ${stats.rows[0].with_images}`);

  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    await pool.end();
    console.log('\n🔒 Connection closed');
  }
}

importToProduction().catch(console.error);
