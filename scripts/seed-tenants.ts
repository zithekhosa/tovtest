import { UserRole } from "../shared/schema";
import { storage } from "../server/storage";
import { hashPassword } from "../server/utils";

/**
 * This script seeds the database with test tenant users and properties for the
 * TOV Property Management Platform with Botswana-specific data.
 */
async function seedTenants() {
  console.log("Creating test tenants with Botswana-specific data...");
  
  try {
    // First, ensure we have a landlord to assign properties to
    let landlord = await storage.getUserByUsername("landlord");
    if (!landlord) {
      // Create the landlord if they don't exist
      landlord = await storage.createUser({
        username: "landlord",
        password: await hashPassword("password123"),
        firstName: "Kago",
        lastName: "Moagi",
        email: "kago.moagi@example.com",
        role: UserRole.LANDLORD,
        phone: "+267 71234567",
        profileImage: null
      });
      console.log("Created landlord user");
    }
    
    // Create test tenant users with Botswana names
    const tenants = [
      {
        username: "boitumelo",
        password: await hashPassword("password123"),
        firstName: "Boitumelo",
        lastName: "Khumalo",
        email: "boitumelo.khumalo@example.com",
        role: UserRole.TENANT,
        phone: "+267 72345678",
        profileImage: null
      },
      {
        username: "kagiso",
        password: await hashPassword("password123"),
        firstName: "Kagiso",
        lastName: "Tshepo",
        email: "kagiso.tshepo@example.com",
        role: UserRole.TENANT,
        phone: "+267 73456789",
        profileImage: null
      },
      {
        username: "naledi",
        password: await hashPassword("password123"),
        firstName: "Naledi",
        lastName: "Mokgatla",
        email: "naledi.mokgatla@example.com",
        role: UserRole.TENANT,
        phone: "+267 74567890",
        profileImage: null
      }
    ];
    
    // Create or update tenants
    for (const tenant of tenants) {
      const existingUser = await storage.getUserByUsername(tenant.username);
      if (!existingUser) {
        await storage.createUser(tenant);
        console.log(`Created tenant: ${tenant.firstName} ${tenant.lastName}`);
      } else {
        console.log(`Tenant ${tenant.firstName} ${tenant.lastName} already exists`);
      }
    }
    
    // Create properties with Botswana addresses
    const properties = [
      {
        landlordId: landlord.id,
        address: "15 Khama Crescent",
        city: "Gaborone",
        state: "South-East District",
        zipCode: "00267",
        propertyType: "apartment",
        bedrooms: 2,
        bathrooms: 1,
        squareFeet: 750,
        rentAmount: 500000, // 5,000 Pula (stored in cents)
        description: "Modern apartment in the heart of Gaborone CBD, walking distance to Main Mall.",
        available: true,
        images: ["https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&auto=format&fit=crop"]
      },
      {
        landlordId: landlord.id,
        address: "42 Maun Road",
        city: "Francistown",
        state: "North-East District",
        zipCode: "00267",
        propertyType: "house",
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1200,
        rentAmount: 750000, // 7,500 Pula (stored in cents)
        description: "Spacious family home in a quiet neighborhood with garden and security wall.",
        available: true,
        images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop"]
      },
      {
        landlordId: landlord.id,
        address: "7 Chobe Street",
        city: "Maun",
        state: "North-West District",
        zipCode: "00267",
        propertyType: "house",
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 1800,
        rentAmount: 900000, // 9,000 Pula (stored in cents)
        description: "Luxury riverside property with views of the Okavango Delta, perfect for nature lovers.",
        available: true,
        images: ["https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&auto=format&fit=crop"]
      }
    ];
    
    // Create or update properties
    const createdProperties = [];
    for (const property of properties) {
      // Check if property already exists by address (simplified check)
      const existingProperties = await storage.getPropertiesByLandlord(landlord.id);
      const existingProperty = existingProperties.find(p => p.address === property.address);
      
      if (!existingProperty) {
        const newProperty = await storage.createProperty(property);
        createdProperties.push(newProperty);
        console.log(`Created property: ${property.address}, ${property.city}`);
      } else {
        createdProperties.push(existingProperty);
        console.log(`Property ${property.address}, ${property.city} already exists`);
      }
    }
    
    // Make sure we have tenant users
    const allTenants = await storage.getUsersByRole(UserRole.TENANT);
    if (allTenants.length === 0) {
      console.log("No tenants found in the database!");
      return;
    }
    
    // Create leases linking tenants to properties
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    const leases = [
      {
        propertyId: createdProperties[0].id,
        tenantId: allTenants[0].id,
        startDate: today,
        endDate: oneYearFromNow,
        rentAmount: createdProperties[0].rentAmount,
        securityDeposit: createdProperties[0].rentAmount, // One month's rent as deposit
        documentUrl: null,
        active: true
      },
      {
        propertyId: createdProperties[1].id,
        tenantId: allTenants[1].id,
        startDate: today,
        endDate: oneYearFromNow,
        rentAmount: createdProperties[1].rentAmount,
        securityDeposit: createdProperties[1].rentAmount,
        documentUrl: null,
        active: true
      },
      {
        propertyId: createdProperties[2].id,
        tenantId: allTenants[2].id,
        startDate: today,
        endDate: oneYearFromNow,
        rentAmount: createdProperties[2].rentAmount,
        securityDeposit: createdProperties[2].rentAmount,
        documentUrl: null,
        active: true
      }
    ];
    
    // Create or update leases
    for (const lease of leases) {
      // Check if lease already exists
      const existingLeases = await storage.getLeasesByProperty(lease.propertyId);
      const existingLease = existingLeases.find(l => 
        l.tenantId === lease.tenantId && 
        l.propertyId === lease.propertyId
      );
      
      if (!existingLease) {
        await storage.createLease(lease);
        console.log(`Created lease for property ID ${lease.propertyId} and tenant ID ${lease.tenantId}`);
        
        // Create a sample payment for this lease
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        await storage.createPayment({
          leaseId: lease.propertyId,
          tenantId: lease.tenantId,
          amount: lease.rentAmount,
          paymentDate: oneMonthAgo,
          paymentType: "bank_transfer",
          description: "Monthly rent payment"
        });
        console.log(`Created payment record for tenant ID ${lease.tenantId}`);
      } else {
        console.log(`Lease for property ID ${lease.propertyId} and tenant ID ${lease.tenantId} already exists`);
      }
    }
    
    console.log("\n=== Seed completed successfully ===");
    console.log(`Total tenants: ${allTenants.length}`);
    console.log(`Total properties: ${createdProperties.length}`);
    console.log(`Total leases created or verified: ${leases.length}`);
    
  } catch (error) {
    console.error("Error seeding tenants and properties:", error);
  }
}

seedTenants().catch(console.error);