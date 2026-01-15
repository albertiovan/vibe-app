import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vibe_app'
});

const imageData = [
  {
    "id": 1,
    "image_urls": [
      "https://cdn-imgix.headout.com/media/images/0be8474e3dc416d92e03147fc8c91ec1-Therme%20Bucuresti.jpg"
    ]
  },
  {
    "id": 2,
    "image_urls": [
      "https://cdn.getyourguide.com/image/format=auto,fit=contain,gravity=center,quality=60,width=1440,height=650,dpr=1/tour_img/e15dfd07d07662bbb20cc7149fbff560d5b4354ca8d9f8699fe339a27f7fed99.jpeg"
    ]
  },
  {
    "id": 3,
    "image_urls": [
      "https://cdn-imgix.headout.com/media/images/6856273c-7d7a-4005-8f08-ea5dc503fcdd-1756806266276-307599.jpg?auto=compress%2Cformat&w=1216.3200000000002&h=760.2&q=210&ar=16%3A10&crop=faces&fit=crop"
    ]
  },
  {
    "id": 4,
    "image_urls": [
      "https://www.pelago.com/img/products/RO-Romania/brasov-old-town-small-group-walking-tour/afe224b3-f6ba-4476-b6f5-2cfcb8b8435d_brasov-old-town-small-group-walking-tour-medium.jpg"
    ]
  },
  {
    "id": 5,
    "image_urls": [
      "https://www.discoverpoiana.ro/uploads/galleries/2023/01/30/ffd6_untitled_design_80_1920x1080.jpg"
    ]
  },
  {
    "id": 6,
    "image_urls": [
      "https://www.discoverdanubedelta.com/wp-content/uploads/2020/01/danube-delta-guided-trip-3.jpg"
    ]
  },
  {
    "id": 7,
    "image_urls": [
      "https://images.trvl-media.com/localexpert/4570085/badd943c-5bf3-4224-8cb2-2dffc6f00e6e.jpg?impolicy=resizecrop&rw=1005&rh=565"
    ]
  },
  {
    "id": 8,
    "image_urls": [
      "https://cdn-imgix.headout.com/media/images/ec7bbdb6-a004-443d-a455-9fef454c6201-1764760726803-333101.jpg?w=1041.6000000000001&h=651&crop=faces&auto=compress%2Cformat&fit=min"
    ]
  },
  {
    "id": 9,
    "image_urls": [
      "https://www.salinaturda.eu/wp-content/uploads/2016/09/Mina-Rudolf-2.jpg"
    ]
  },
  {
    "id": 10,
    "image_urls": [
      "https://image.arrivalguides.com/x/05/9053a400b0611ee3d1c52a929ed02019.jpg"
    ]
  },
  {
    "id": 11,
    "image_urls": [
      "https://www.crafted-tours-romania.com/images/attractions/large/bucovina-painted-monasteries-1.webp"
    ]
  },
  {
    "id": 12,
    "image_urls": [
      "https://bearwatching.ro/wp-content/uploads/2020/03/Bear-watching-tour-in-Romania.jpg"
    ]
  },
  {
    "id": 13,
    "image_urls": [
      "https://img.oastatic.com/img2/65508195/max/variant.jpg"
    ]
  },
  {
    "id": 14,
    "image_urls": [
      "https://www.celticpaddles.com/images/black-sea-paddlers.jpg"
    ]
  },
  {
    "id": 15,
    "image_urls": [
      "https://www.technoairlines.com/wp-content/uploads/2024/08/kristal-glam-club-en-ta-2024-1.jpg"
    ]
  },
  {
    "id": 16,
    "image_urls": [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/27/9f/c7/c0/pictures-from-flying.jpg?w=500&h=500&s=1"
    ]
  },
  {
    "id": 17,
    "image_urls": [
      "https://fratelli.ro/wp-content/uploads/2025/08/Fratelli-TM-.jpg"
    ]
  },
  {
    "id": 18,
    "image_urls": [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/cd/e9/24/fratelli-iasi.jpg?w=900&h=-1&s=1"
    ]
  },
  {
    "id": 19,
    "image_urls": [
      "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/18/78/80/our-medieval-reception.jpg?w=1200&h=-1&s=1"
    ]
  },
  {
    "id": 20,
    "image_urls": [
      "https://extasy-resources-prod.s3-eu-west-1.amazonaws.com/event/18161/24ac25f3-655b-45d2-aee2-bb3f2efc0961.jpg"
    ]
  },
  {
    "id": 21,
    "image_urls": [
      "https://shantiloft.ro/wp-content/uploads/2023/10/VINYASA-FLOW-FUSION-YOGA-LISTINGS.jpg"
    ]
  },
  {
    "id": 22,
    "image_urls": [
      "https://www.arkafit.com/images/class/class1.jpg"
    ]
  },
  {
    "id": 23,
    "image_urls": [
      "https://www.experimenteaza.ro/18226-superlarge_default_2x/healthy-mind-in-healthy-body-crossfit-workouts-in-bucharest.jpg"
    ]
  },
  {
    "id": 24,
    "image_urls": [
      "https://airial.travel/_next/image?url=https%3A%2F%2Fmedia-cdn.tripadvisor.com%2Fmedia%2Fphoto-w%2F0c%2Fc2%2Fb9%2F47%2Faquapark-nymphaea-oradea.jpg&w=3840&q=75"
    ]
  },
  {
    "id": 25,
    "image_urls": [
      "https://wondersoftransylvania.com/app/wt/assets/images/szovata_medve-to_furdozo_turistak_ml_6818.jpg?v=1511277636"
    ]
  },
  {
    "id": 26,
    "image_urls": [
      "https://balvanyosresort.ro/wp-content/uploads/2024/10/balvanyos_216-1024x683.jpg"
    ]
  },
  {
    "id": 27,
    "image_urls": [
      "https://lirp.cdn-website.com/ab807adf/dms3rep/multi/opt/GP010126-6a65aeb8-640w.png"
    ]
  }
];

async function importImages() {
  const client = await pool.connect();
  
  try {
    let successCount = 0;
    let errorCount = 0;

    for (const activity of imageData) {
      try {
        // Update the activity with image URLs
        // Set the first image as hero_image_url
        const result = await client.query(
          `UPDATE activities 
           SET image_urls = $1, 
               hero_image_url = $2,
               updated_at = NOW()
           WHERE id = $3
           RETURNING id, name`,
          [activity.image_urls, activity.image_urls[0], activity.id]
        );

        if (result.rowCount > 0) {
          console.log(`✅ Updated activity ${activity.id}: ${result.rows[0].name}`);
          successCount++;
        } else {
          console.log(`⚠️  Activity ${activity.id} not found in database`);
          errorCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating activity ${activity.id}:`, err);
        errorCount++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Successfully updated: ${successCount} activities`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📸 Total images imported: ${successCount}`);

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

importImages();
