/**
 * This script sets up a complete rental history for the demo-tenant user
 * with the demo-landlord as their current landlord.
 * It creates:
 * 1. A property in Block 10, Gaborone owned by demo-landlord
 * 2. Current active lease for 6000 BWP monthly
 * 3. Historical lease data for previous properties
 * 4. Payment history for all leases
 * 5. Sample lease documents
 */

import { storage } from "../server/storage";
import { db } from "../server/db";
import { 
  insertPropertySchema, 
  insertLeaseSchema, 
  insertPaymentSchema,
  insertDocumentSchema
} from "../shared/schema";
import { createHash } from "crypto";

const randomString = () => createHash('md5').update(Math.random().toString()).digest('hex').substring(0, 8);

async function setupTenantDemo() {
  try {
    console.log("Setting up tenant demo data...");
    
    // Get demo users
    const demoLandlord = await storage.getUserByUsername("demo-landlord");
    const demoTenant = await storage.getUserByUsername("demo-tenant");
    
    if (!demoLandlord || !demoTenant) {
      console.error("Demo users not found. Please run create-demo-users.ts first.");
      return;
    }
    
    console.log(`Found landlord: ${demoLandlord.id} and tenant: ${demoTenant.id}`);

    // 1. Create current property in Block 10, Gaborone
    const existingProperties = await storage.getPropertiesByLandlord(demoLandlord.id);
    
    // Check if a Block 10 property already exists
    let block10Property = existingProperties.find(p => p.address.includes("Block 10"));
    
    if (!block10Property) {
      const currentPropertyData = insertPropertySchema.parse({
        landlordId: demoLandlord.id,
        title: "Modern 3 Bedroom House in Block 10",
        address: "123 Pula Road, Block 10",
        city: "Gaborone",
        state: "South-East District",
        zipCode: "00267",
        location: "Block 10",
        propertyType: "House",
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1800,
        parkingSpaces: 2,
        yearBuilt: 2015,
        rentAmount: 6000, // 6000 pula monthly as specified
        securityDeposit: 12000, // 2 months rent
        description: "Spacious modern house with garden, security wall, and servant quarters. Located in the upscale Block 10 area with easy access to malls and schools.",
        available: false, // Currently occupied
        minLeaseTerm: 12,
        amenities: [
          "Garden", 
          "Security wall", 
          "Servant quarters", 
          "High-speed internet", 
          "Water tank", 
          "Covered parking"
        ],
        images: [
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/1876045/pexels-photo-1876045.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        ]
      });
      
      block10Property = await storage.createProperty(currentPropertyData);
      console.log(`Created Block 10 property with ID: ${block10Property.id}`);
    } else {
      console.log(`Block 10 property already exists with ID: ${block10Property.id}`);
    }

    // 2. Create current active lease
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);
    
    // Check if a lease already exists for this property and tenant
    const existingLeases = await storage.getLeasesByTenant(demoTenant.id);
    let currentLease = existingLeases.find(l => l.propertyId === block10Property.id);
    
    if (!currentLease) {
      const leaseData = insertLeaseSchema.parse({
        propertyId: block10Property.id,
        tenantId: demoTenant.id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmount: 6000,
        securityDeposit: 12000,
        active: true,
        status: "active"
      });
      
      currentLease = await storage.createLease(leaseData);
      console.log(`Created current lease with ID: ${currentLease.id}`);
    } else {
      console.log(`Current lease already exists with ID: ${currentLease.id}`);
    }
    
    // Create lease document for the current lease
    // Check if document already exists
    const existingDocuments = await storage.getDocumentsByProperty(block10Property.id);
    const leaseDocument = existingDocuments.find(d => d.documentType === "lease" && d.propertyId === block10Property.id);
    
    if (!leaseDocument) {
      const leaseDocData = insertDocumentSchema.parse({
        userId: demoLandlord.id,
        propertyId: block10Property.id,
        fileName: `Lease_Agreement_Block10_${demoTenant.lastName}.pdf`,
        fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQCUhCwuEsCwWDZnA8mPkVAkEX3qrOZn_NuW5Xo4gO6xBcWLK1aITNs1tFUDoosFXPXXUWQKQIo4TcJ/pub",
        fileType: "application/pdf",
        documentType: "lease"
      });
      
      const newLeaseDoc = await storage.createDocument(leaseDocData);
      console.log(`Created current lease document with ID: ${newLeaseDoc.id}`);
    } else {
      console.log(`Lease document already exists with ID: ${leaseDocument.id}`);
    }
    
    // 3. Create historical properties and leases (3 previous residences)
    const historicalProperties = [
      {
        title: "Apartment in Phase 4",
        location: "Phase 4",
        address: "456 Botswana Drive, Phase 4",
        rentAmount: 4500,
        startYearsAgo: 4,
        endYearsAgo: 2,
      },
      {
        title: "House in Block 8",
        location: "Block 8",
        address: "789 Independence Ave, Block 8",
        rentAmount: 5500,
        startYearsAgo: 6,
        endYearsAgo: 4,
      },
      {
        title: "Apartment in Extension 9",
        location: "Extension 9",
        address: "321 President's Lane, Extension 9",
        rentAmount: 3800,
        startYearsAgo: 10,
        endYearsAgo: 6,
      }
    ];
    
    for (const [index, histProperty] of historicalProperties.entries()) {
      // Check if this historical property already exists
      const existingHistProperty = existingProperties.find(p => 
        p.address.includes(histProperty.location) || p.title === histProperty.title);
      
      let propertyId: number;
      
      if (!existingHistProperty) {
        const propertyData = insertPropertySchema.parse({
          landlordId: demoLandlord.id,
          title: histProperty.title,
          address: histProperty.address,
          city: "Gaborone",
          state: "South-East District",
          zipCode: "00267",
          location: histProperty.location,
          propertyType: index === 0 || index === 2 ? "Apartment" : "House",
          bedrooms: index === 2 ? 1 : (index === 0 ? 2 : 3),
          bathrooms: index === 2 ? 1 : 2,
          squareFootage: index === 2 ? 800 : (index === 0 ? 1200 : 1600),
          parkingSpaces: index === 2 ? 1 : 2,
          yearBuilt: 2010 - index * 3,
          rentAmount: histProperty.rentAmount,
          securityDeposit: histProperty.rentAmount * 2,
          description: `Previous residence of tenant in ${histProperty.location}`,
          available: true, // Now available
          minLeaseTerm: 12,
          amenities: [
            "Security guard", 
            "Water connection", 
            "Electricity connection"
          ],
          images: [
            "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          ]
        });
        
        const newProperty = await storage.createProperty(propertyData);
        propertyId = newProperty.id;
        console.log(`Created historical property ${histProperty.title} with ID: ${propertyId}`);
      } else {
        propertyId = existingHistProperty.id;
        console.log(`Historical property ${histProperty.title} already exists with ID: ${propertyId}`);
      }
      
      // Check if a historical lease already exists for this property
      const existingHistLease = existingLeases.find(l => l.propertyId === propertyId);
      
      if (!existingHistLease) {
        const startDate = new Date();
        startDate.setFullYear(currentDate.getFullYear() - histProperty.startYearsAgo);
        
        const endDate = new Date();
        endDate.setFullYear(currentDate.getFullYear() - histProperty.endYearsAgo);
        
        const leaseData = insertLeaseSchema.parse({
          propertyId: propertyId,
          tenantId: demoTenant.id,
          startDate: startDate,
          endDate: endDate,
          rentAmount: histProperty.rentAmount,
          securityDeposit: histProperty.rentAmount * 2,
          active: false,
          status: "completed"
        });
        
        const histLease = await storage.createLease(leaseData);
        console.log(`Created historical lease for ${histProperty.title} with ID: ${histLease.id}`);
        
        // Create historical lease document
        const leaseDocData = insertDocumentSchema.parse({
          userId: demoLandlord.id,
          propertyId: propertyId,
          fileName: `Historical_Lease_${histProperty.location}_${demoTenant.lastName}.pdf`,
          fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQCUhCwuEsCwWDZnA8mPkVAkEX3qrOZn_NuW5Xo4gO6xBcWLK1aITNs1tFUDoosFXPXXUWQKQIo4TcJ/pub",
          fileType: "application/pdf",
          documentType: "lease"
        });
        
        const histLeaseDoc = await storage.createDocument(leaseDocData);
        console.log(`Created historical lease document with ID: ${histLeaseDoc.id}`);
      } else {
        console.log(`Historical lease for ${histProperty.title} already exists with ID: ${existingHistLease.id}`);
      }
    }
    
    // 4. Create payment history for current lease
    const existingPayments = await storage.getPaymentsByLease(currentLease.id);
    
    if (existingPayments.length < 10) {
      // Create 12 monthly payments for the current lease (some in the past)
      for (let i = 11; i >= 0; i--) {
        const paymentDate = new Date();
        paymentDate.setMonth(paymentDate.getMonth() - i);
        
        // Skip if payment already exists for this month
        const existingMonthPayment = existingPayments.find(p => {
          const pDate = new Date(p.paymentDate);
          return pDate.getMonth() === paymentDate.getMonth() && 
                 pDate.getFullYear() === paymentDate.getFullYear();
        });
        
        if (existingMonthPayment) {
          console.log(`Payment for ${paymentDate.toLocaleString('default', { month: 'long' })} ${paymentDate.getFullYear()} already exists`);
          continue;
        }
        
        // Add some randomness to payment methods and dates
        const paymentMethod = i % 4 === 0 ? "m-zaka" : 
                             i % 3 === 0 ? "orange money" : 
                             i % 2 === 0 ? "bank transfer" : "credit card";
        
        // Add some randomness to payment dates (some on time, some late)
        if (i > 0) { // Only adjust past payments
          const daysLate = i % 3 === 0 ? 2 : (i % 5 === 0 ? 5 : 0);
          paymentDate.setDate(3 + daysLate); // Rent due on the 3rd, sometimes late
        }
        
        const paymentData = insertPaymentSchema.parse({
          leaseId: currentLease.id,
          tenantId: demoTenant.id,
          amount: 6000, // Current rent amount
          paymentDate: paymentDate,
          paymentType: "rent",
          paymentMethod: paymentMethod,
          description: `Monthly rent payment for ${paymentDate.toLocaleString('default', { month: 'long' })} ${paymentDate.getFullYear()}`,
          status: "paid"
        });
        
        const payment = await storage.createPayment(paymentData);
        console.log(`Created payment for ${paymentDate.toLocaleString('default', { month: 'long' })} ${paymentDate.getFullYear()} with ID: ${payment.id}`);
      }
    } else {
      console.log("Current lease already has sufficient payment history");
    }
    
    // 5. Create payment history for historical leases
    const historicalLeases = existingLeases.filter(l => l.id !== currentLease.id);
    
    for (const histLease of historicalLeases) {
      const existingHistPayments = await storage.getPaymentsByLease(histLease.id);
      
      if (existingHistPayments.length < 5) {
        // Get property for this lease
        const property = await storage.getProperty(histLease.propertyId);
        
        // Create payment history - simplifying to just a few key payments per historical lease
        const leaseStartDate = new Date(histLease.startDate);
        const leaseEndDate = new Date(histLease.endDate);
        const leaseDurationMonths = (leaseEndDate.getFullYear() - leaseStartDate.getFullYear()) * 12 + 
                                  (leaseEndDate.getMonth() - leaseStartDate.getMonth());
        
        // Create a few sample payments spaced throughout the lease
        const paymentCount = Math.min(10, leaseDurationMonths);
        
        for (let i = 0; i < paymentCount; i++) {
          const paymentDate = new Date(leaseStartDate);
          paymentDate.setMonth(leaseStartDate.getMonth() + Math.floor(i * leaseDurationMonths / paymentCount));
          
          const paymentMethod = i % 4 === 0 ? "m-zaka" : 
                               i % 3 === 0 ? "orange money" : 
                               i % 2 === 0 ? "bank transfer" : "credit card";
          
          const paymentData = insertPaymentSchema.parse({
            leaseId: histLease.id,
            tenantId: demoTenant.id,
            amount: histLease.rentAmount,
            paymentDate: paymentDate,
            paymentType: "rent",
            paymentMethod: paymentMethod,
            description: `Historical rent payment for ${property?.title} - ${paymentDate.toLocaleString('default', { month: 'long' })} ${paymentDate.getFullYear()}`,
            status: "paid"
          });
          
          const payment = await storage.createPayment(paymentData);
          console.log(`Created historical payment for ${property?.title} with ID: ${payment.id}`);
        }
      } else {
        console.log(`Historical lease ID ${histLease.id} already has sufficient payment history`);
      }
    }
    
    // 6. Create additional documents
    // Add a receipt document for security deposit
    const receiptDoc = existingDocuments.find(d => d.documentType === "receipt" && d.propertyId === block10Property.id);
    
    if (!receiptDoc) {
      const receiptDocData = insertDocumentSchema.parse({
        userId: demoLandlord.id,
        propertyId: block10Property.id,
        fileName: `Security_Deposit_Receipt_${demoTenant.lastName}.pdf`,
        fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQCUhCwuEsCwWDZnA8mPkVAkEX3qrOZn_NuW5Xo4gO6xBcWLK1aITNs1tFUDoosFXPXXUWQKQIo4TcJ/pub",
        fileType: "application/pdf",
        documentType: "receipt"
      });
      
      const newReceiptDoc = await storage.createDocument(receiptDocData);
      console.log(`Created security deposit receipt with ID: ${newReceiptDoc.id}`);
    }
    
    // Add property inspection document
    const inspectionDoc = existingDocuments.find(d => d.documentType === "inspection" && d.propertyId === block10Property.id);
    
    if (!inspectionDoc) {
      const inspectionDocData = insertDocumentSchema.parse({
        userId: demoLandlord.id,
        propertyId: block10Property.id,
        fileName: `Property_Inspection_Report_Block10.pdf`,
        fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQCUhCwuEsCwWDZnA8mPkVAkEX3qrOZn_NuW5Xo4gO6xBcWLK1aITNs1tFUDoosFXPXXUWQKQIo4TcJ/pub",
        fileType: "application/pdf",
        documentType: "inspection"
      });
      
      const newInspectionDoc = await storage.createDocument(inspectionDocData);
      console.log(`Created property inspection document with ID: ${newInspectionDoc.id}`);
    }
    
    // Add rules and regulations document
    const rulesDoc = existingDocuments.find(d => d.documentType === "rules" && d.propertyId === block10Property.id);
    
    if (!rulesDoc) {
      const rulesDocData = insertDocumentSchema.parse({
        userId: demoLandlord.id,
        propertyId: block10Property.id,
        fileName: `House_Rules_and_Regulations.pdf`,
        fileUrl: "https://docs.google.com/document/d/e/2PACX-1vQCUhCwuEsCwWDZnA8mPkVAkEX3qrOZn_NuW5Xo4gO6xBcWLK1aITNs1tFUDoosFXPXXUWQKQIo4TcJ/pub",
        fileType: "application/pdf",
        documentType: "rules"
      });
      
      const newRulesDoc = await storage.createDocument(rulesDocData);
      console.log(`Created rules and regulations document with ID: ${newRulesDoc.id}`);
    }
    
    console.log("Demo tenant setup completed successfully!");
    
  } catch (error) {
    console.error("Error setting up tenant demo data:", error);
  }
}

setupTenantDemo()
  .then(() => {
    console.log("Script execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });