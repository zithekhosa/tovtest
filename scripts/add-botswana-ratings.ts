/**
 * This script adds ratings between demo landlord and tenants imported from Botswana mock data
 * Run with: npx tsx scripts/add-botswana-ratings.ts
 */
import { db } from "../server/db";
import { landlordRatings, tenantRatings } from "../shared/schema";

// The ratings to add for each tenant -> landlord
const landlordRatingData = [
  {
    tenantName: "Kgosi Molefe",
    rating: 4,
    review: "Good landlord overall. The property is well-maintained and the rent is fair for the location. Communication can sometimes be slow but issues get resolved.",
    communicationRating: 3,
    maintenanceRating: 4,
    valueRating: 5
  },
  {
    tenantName: "Lesego Khumalo",
    rating: 5,
    review: "Excellent landlord who is responsive and professional. The property is beautiful and any maintenance issues are addressed immediately. Very satisfied with my experience.",
    communicationRating: 5,
    maintenanceRating: 5,
    valueRating: 4
  },
  {
    tenantName: "Tumelo Mokoena",
    rating: 3,
    review: "Average experience. The property is nice but there have been some maintenance delays. Rent is slightly higher than similar properties in the area.",
    communicationRating: 3,
    maintenanceRating: 2,
    valueRating: 3
  },
  {
    tenantName: "Boitumelo Seelo",
    rating: 4,
    review: "Reliable landlord who keeps the property in good condition. Responsive to urgent issues and fair with the security deposit. Would rent from again.",
    communicationRating: 4,
    maintenanceRating: 4,
    valueRating: 4
  },
  {
    tenantName: "Mpho Kgopolelo",
    rating: 5,
    review: "Fantastic experience with this landlord. Very professional, transparent, and maintains high standards for the property. Highly recommended!",
    communicationRating: 5,
    maintenanceRating: 5,
    valueRating: 5
  }
];

// The ratings to add for each landlord -> tenant
const tenantRatingData = [
  {
    tenantName: "Kgosi Molefe",
    rating: 5,
    review: "Excellent tenant who pays rent on time and maintains the property in pristine condition. Very respectful of neighbors and community rules.",
    communicationRating: 5,
    paymentRating: 5,
    propertyRespectRating: 5
  },
  {
    tenantName: "Lesego Khumalo",
    rating: 4,
    review: "Good tenant overall. Occasionally pays rent a few days late but communicates about it in advance. Keeps the property clean and reports issues promptly.",
    communicationRating: 4,
    paymentRating: 3,
    propertyRespectRating: 5
  },
  {
    tenantName: "Tumelo Mokoena",
    rating: 5,
    review: "Reliable tenant who always pays on time and takes good care of the property. Easy to communicate with and respectful of neighbors.",
    communicationRating: 5,
    paymentRating: 5,
    propertyRespectRating: 4
  },
  {
    tenantName: "Boitumelo Seelo",
    rating: 5,
    review: "Outstanding tenant. Always pays on time, maintains the property beautifully, and is a pleasure to work with. Highly recommended.",
    communicationRating: 5,
    paymentRating: 5,
    propertyRespectRating: 5
  },
  {
    tenantName: "Mpho Kgopolelo",
    rating: 3,
    review: "Acceptable tenant but there have been some issues with noise complaints from neighbors. Property is kept in decent condition and rent is usually on time.",
    communicationRating: 3,
    paymentRating: 4,
    propertyRespectRating: 3
  }
];

async function addBotswanaRatings() {
  try {
    console.log("Starting to add ratings for Botswana mock data...");

    // 1. Get the demo landlord ID
    const demoLandlordResult = await db.execute(
      `SELECT id FROM users WHERE username = 'demo-landlord' LIMIT 1`
    );
    
    if (!demoLandlordResult.rows.length) {
      console.error("Demo landlord account not found!");
      return;
    }
    
    const demoLandlordId = demoLandlordResult.rows[0].id;
    console.log(`Found demo landlord with ID: ${demoLandlordId}`);

    // 2. Get all tenants and their properties
    console.log("Finding tenant and property data...");
    
    const tenantPropertiesResult = await db.execute(`
      SELECT 
        u.id as tenant_id, 
        u.first_name, 
        u.last_name,
        p.id as property_id,
        p.address
      FROM users u
      JOIN leases l ON u.id = l.tenant_id
      JOIN properties p ON l.property_id = p.id
      WHERE u.role = 'tenant' AND p.landlord_id = $1
    `, [demoLandlordId]);
    
    if (!tenantPropertiesResult.rows.length) {
      console.error("No tenants found renting from demo landlord!");
      return;
    }
    
    console.log(`Found ${tenantPropertiesResult.rows.length} tenant-property relationships`);
    
    // 3. Add landlord ratings (tenants rating landlord)
    console.log("Adding landlord ratings...");
    
    for (const tenant of tenantPropertiesResult.rows) {
      const tenantFullName = `${tenant.first_name} ${tenant.last_name}`;
      
      // Find matching rating data
      const ratingData = landlordRatingData.find(r => 
        r.tenantName.toLowerCase() === tenantFullName.toLowerCase()
      );
      
      if (!ratingData) {
        console.log(`No rating data found for tenant: ${tenantFullName}, using default`);
        continue;
      }
      
      // Check if rating already exists
      const existingRatingResult = await db.execute(`
        SELECT id FROM landlord_ratings 
        WHERE landlord_id = $1 AND tenant_id = $2 AND property_id = $3
      `, [demoLandlordId, tenant.tenant_id, tenant.property_id]);
      
      if (existingRatingResult.rows.length) {
        // Update existing rating
        await db.execute(`
          UPDATE landlord_ratings SET
            rating = $1,
            review = $2,
            communication_rating = $3,
            maintenance_rating = $4,
            value_rating = $5,
            updated_at = NOW()
          WHERE id = $6
        `, [
          ratingData.rating,
          ratingData.review,
          ratingData.communicationRating,
          ratingData.maintenanceRating,
          ratingData.valueRating,
          existingRatingResult.rows[0].id
        ]);
        console.log(`Updated landlord rating from tenant ${tenantFullName}`);
      } else {
        // Create new rating
        await db.execute(`
          INSERT INTO landlord_ratings (
            landlord_id, tenant_id, property_id, rating, review,
            communication_rating, maintenance_rating, value_rating,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          demoLandlordId,
          tenant.tenant_id,
          tenant.property_id,
          ratingData.rating,
          ratingData.review,
          ratingData.communicationRating,
          ratingData.maintenanceRating,
          ratingData.valueRating
        ]);
        console.log(`Created new landlord rating from tenant ${tenantFullName}`);
      }
    }
    
    // 4. Add tenant ratings (landlord rating tenants)
    console.log("Adding tenant ratings...");
    
    for (const tenant of tenantPropertiesResult.rows) {
      const tenantFullName = `${tenant.first_name} ${tenant.last_name}`;
      
      // Find matching rating data
      const ratingData = tenantRatingData.find(r => 
        r.tenantName.toLowerCase() === tenantFullName.toLowerCase()
      );
      
      if (!ratingData) {
        console.log(`No rating data found for tenant: ${tenantFullName}, using default`);
        continue;
      }
      
      // Check if rating already exists
      const existingRatingResult = await db.execute(`
        SELECT id FROM tenant_ratings 
        WHERE landlord_id = $1 AND tenant_id = $2 AND property_id = $3
      `, [demoLandlordId, tenant.tenant_id, tenant.property_id]);
      
      if (existingRatingResult.rows.length) {
        // Update existing rating
        await db.execute(`
          UPDATE tenant_ratings SET
            rating = $1,
            review = $2,
            communication_rating = $3,
            payment_rating = $4,
            property_respect_rating = $5,
            updated_at = NOW()
          WHERE id = $6
        `, [
          ratingData.rating,
          ratingData.review,
          ratingData.communicationRating,
          ratingData.paymentRating,
          ratingData.propertyRespectRating,
          existingRatingResult.rows[0].id
        ]);
        console.log(`Updated tenant rating for tenant ${tenantFullName}`);
      } else {
        // Create new rating
        await db.execute(`
          INSERT INTO tenant_ratings (
            landlord_id, tenant_id, property_id, rating, review,
            communication_rating, payment_rating, property_respect_rating,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          demoLandlordId,
          tenant.tenant_id,
          tenant.property_id,
          ratingData.rating,
          ratingData.review,
          ratingData.communicationRating,
          ratingData.paymentRating,
          ratingData.propertyRespectRating
        ]);
        console.log(`Created new tenant rating for tenant ${tenantFullName}`);
      }
    }
    
    console.log("\nBotswana ratings added successfully!");
  } catch (error) {
    console.error("Error adding Botswana ratings:", error);
  }
}

// Run the function
addBotswanaRatings().then(() => {
  console.log("Script finished");
  process.exit(0);
}).catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});