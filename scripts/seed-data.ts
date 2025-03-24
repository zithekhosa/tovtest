import { storage } from "../server/storage";
import { hashPassword } from "../server/utils";
import { UserRole } from "../shared/schema";

// Botswana specific data
const botswanaNames = {
  firstNames: [
    "Kgosi", "Lesedi", "Tumelo", "Mpho", "Tebogo", 
    "Thabo", "Kagiso", "Dineo", "Masego", "Boitumelo", 
    "Khumo", "Lorato", "Oratile", "Phenyo", "Tshepo"
  ],
  lastNames: [
    "Molefe", "Dube", "Kgosidintsi", "Moremi", "Moyo", 
    "Motswagole", "Kgosikoma", "Tsheko", "Seleka", "Nkgatle", 
    "Modise", "Baipidi", "Morapedi", "Maphane", "Galeitsiwe"
  ],
  streets: [
    "Tlokweng Road", "Gaborone West", "Mogoditshane Road", "Phakalane", 
    "Maun Road", "Broadhurst", "Nelson Mandela Drive", "Independence Avenue", 
    "Queens Road", "Notwane Road", "Lobatse Road", "Kgale Hill Drive", 
    "Airport Road", "Molepolole Road", "Botswana Road"
  ],
  cities: [
    "Gaborone", "Francistown", "Molepolole", "Maun", "Serowe", 
    "Selibe Phikwe", "Kanye", "Mahalapye", "Palapye", "Lobatse"
  ],
  districts: [
    "South-East", "Central", "Kgatleng", "North-East", "Ghanzi", 
    "North-West", "Kweneng", "Southern", "Kgalagadi", "Chobe"
  ],
  propertyTypes: [
    "Apartment", "House", "Villa", "Townhouse", "Studio"
  ]
};

// Generate random Botswana phone number
const generateBotswanaPhone = () => {
  const prefixes = ['71', '72', '73', '74', '75', '76', '77'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffixNumber = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+267 ${prefix} ${suffixNumber}`;
};

// Generate random email based on name
const generateEmail = (firstName: string, lastName: string) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'btc.bw', 'gov.bw', 'ub.bw'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

// Generate random price in Botswana Pula (BWP)
const generateRentAmount = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min) * 100; // Rounded to nearest 100 BWP
};

// Generate a random date in the past
const generatePastDate = (maxDaysAgo: number) => {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  today.setDate(today.getDate() - daysAgo);
  return today;
};

// Generate a random date in the future
const generateFutureDate = (minDaysAhead: number, maxDaysAhead: number) => {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * (maxDaysAhead - minDaysAhead + 1) + minDaysAhead);
  today.setDate(today.getDate() + daysAhead);
  return today;
};

// Generate a random address in Botswana
const generateAddress = () => {
  const plotNumber = Math.floor(Math.random() * 9000) + 1000;
  const street = botswanaNames.streets[Math.floor(Math.random() * botswanaNames.streets.length)];
  return `Plot ${plotNumber}, ${street}`;
};

// Random selection from array
const randomFrom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate unique username
const generateUsername = (firstName: string, lastName: string) => {
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomNum}`;
};

// Create landlords
const createLandlords = async () => {
  const landlords = [];
  
  // Create 3 landlords
  for (let i = 0; i < 3; i++) {
    const firstName = randomFrom(botswanaNames.firstNames);
    const lastName = randomFrom(botswanaNames.lastNames);
    const username = generateUsername(firstName, lastName);
    const email = generateEmail(firstName, lastName);
    const phone = generateBotswanaPhone();

    const landlord = await storage.createUser({
      username,
      password: await hashPassword("password123"),
      firstName,
      lastName,
      email,
      phone,
      role: UserRole.LANDLORD,
      profileImage: null
    });
    
    landlords.push(landlord);
    console.log(`Created landlord: ${firstName} ${lastName}`);
  }
  
  return landlords;
};

// Create tenants
const createTenants = async () => {
  const tenants = [];
  
  // Create 6 tenants
  for (let i = 0; i < 6; i++) {
    const firstName = randomFrom(botswanaNames.firstNames);
    const lastName = randomFrom(botswanaNames.lastNames);
    const username = generateUsername(firstName, lastName);
    const email = generateEmail(firstName, lastName);
    const phone = generateBotswanaPhone();

    const tenant = await storage.createUser({
      username,
      password: await hashPassword("password123"),
      firstName,
      lastName,
      email,
      phone,
      role: UserRole.TENANT,
      profileImage: null
    });
    
    tenants.push(tenant);
    console.log(`Created tenant: ${firstName} ${lastName}`);
  }
  
  return tenants;
};

// Create agencies
const createAgencies = async () => {
  const agencies = [];
  
  // Create 2 agencies
  for (let i = 0; i < 2; i++) {
    const firstName = randomFrom(botswanaNames.firstNames);
    const lastName = randomFrom(botswanaNames.lastNames);
    const username = generateUsername(firstName, lastName);
    const email = generateEmail(firstName, lastName);
    const phone = generateBotswanaPhone();

    const agency = await storage.createUser({
      username,
      password: await hashPassword("password123"),
      firstName,
      lastName,
      email,
      phone,
      role: UserRole.AGENCY,
      profileImage: null
    });
    
    agencies.push(agency);
    console.log(`Created agency rep: ${firstName} ${lastName}`);
  }
  
  return agencies;
};

// Create maintenance providers
const createMaintenanceProviders = async () => {
  const maintenanceProviders = [];
  
  // Create 3 maintenance providers
  for (let i = 0; i < 3; i++) {
    const firstName = randomFrom(botswanaNames.firstNames);
    const lastName = randomFrom(botswanaNames.lastNames);
    const username = generateUsername(firstName, lastName);
    const email = generateEmail(firstName, lastName);
    const phone = generateBotswanaPhone();

    const maintenanceProvider = await storage.createUser({
      username,
      password: await hashPassword("password123"),
      firstName,
      lastName,
      email,
      phone,
      role: UserRole.MAINTENANCE,
      profileImage: null
    });
    
    maintenanceProviders.push(maintenanceProvider);
    console.log(`Created maintenance provider: ${firstName} ${lastName}`);
  }
  
  return maintenanceProviders;
};

// Create properties
const createProperties = async (landlords: any[]) => {
  const properties = [];
  
  // First landlord will have 3 properties
  const landlord1 = landlords[0];
  for (let i = 0; i < 3; i++) {
    const address = generateAddress();
    const city = randomFrom(botswanaNames.cities);
    const state = randomFrom(botswanaNames.districts);
    const zipCode = Math.floor(Math.random() * 900) + 100; // 3 digit postal code
    const propertyType = randomFrom(botswanaNames.propertyTypes);
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const squareFeet = (Math.floor(Math.random() * 150) + 50) * 10; // 500-2000 sq ft
    const rentAmount = generateRentAmount(3000, 15000); // 3000-15000 BWP
    const available = Math.random() > 0.7; // 30% chance of being available

    const property = await storage.createProperty({
      address,
      city,
      state,
      zipCode: zipCode.toString(),
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      rentAmount,
      description: `Beautiful ${bedrooms} bedroom ${propertyType.toLowerCase()} in ${city}`,
      available,
      images: null,
      landlordId: landlord1.id
    });
    
    properties.push(property);
    console.log(`Created property: ${address}, ${city} for landlord ${landlord1.firstName}`);
  }
  
  // Second landlord will have 2 properties
  const landlord2 = landlords[1];
  for (let i = 0; i < 2; i++) {
    const address = generateAddress();
    const city = randomFrom(botswanaNames.cities);
    const state = randomFrom(botswanaNames.districts);
    const zipCode = Math.floor(Math.random() * 900) + 100;
    const propertyType = randomFrom(botswanaNames.propertyTypes);
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const squareFeet = (Math.floor(Math.random() * 150) + 50) * 10;
    const rentAmount = generateRentAmount(3000, 15000);
    const available = Math.random() > 0.7;

    const property = await storage.createProperty({
      address,
      city,
      state,
      zipCode: zipCode.toString(),
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      rentAmount,
      description: `Spacious ${bedrooms} bedroom ${propertyType.toLowerCase()} in ${city}`,
      available,
      images: null,
      landlordId: landlord2.id
    });
    
    properties.push(property);
    console.log(`Created property: ${address}, ${city} for landlord ${landlord2.firstName}`);
  }
  
  // Third landlord will have 1 property
  const landlord3 = landlords[2];
  const address = generateAddress();
  const city = randomFrom(botswanaNames.cities);
  const state = randomFrom(botswanaNames.districts);
  const zipCode = Math.floor(Math.random() * 900) + 100;
  const propertyType = randomFrom(botswanaNames.propertyTypes);
  const bedrooms = Math.floor(Math.random() * 4) + 1;
  const bathrooms = Math.floor(Math.random() * 3) + 1;
  const squareFeet = (Math.floor(Math.random() * 150) + 50) * 10;
  const rentAmount = generateRentAmount(3000, 15000);
  const available = Math.random() > 0.7;

  const property = await storage.createProperty({
    address,
    city,
    state,
    zipCode: zipCode.toString(),
    propertyType,
    bedrooms,
    bathrooms,
    squareFeet,
    rentAmount,
    description: `Luxurious ${bedrooms} bedroom ${propertyType.toLowerCase()} in ${city}`,
    available,
    images: null,
    landlordId: landlord3.id
  });
  
  properties.push(property);
  console.log(`Created property: ${address}, ${city} for landlord ${landlord3.firstName}`);
  
  return properties;
};

// Create leases
const createLeases = async (properties: any[], tenants: any[]) => {
  const leases = [];
  let tenantIndex = 0;
  
  // Create leases for 70% of properties (some properties will be available for rent)
  for (let i = 0; i < Math.ceil(properties.length * 0.7); i++) {
    const property = properties[i];
    const tenant = tenants[tenantIndex];
    tenantIndex = (tenantIndex + 1) % tenants.length;
    
    const startDate = generatePastDate(365); // Lease started in the last year
    const endDate = generateFutureDate(30, 365); // Lease will end between 1 month and 1 year from now
    const securityDeposit = property.rentAmount * 2; // Two months rent as security deposit
    
    // Only create lease if property is not available (already rented)
    if (!property.available) {
      const lease = await storage.createLease({
        propertyId: property.id,
        tenantId: tenant.id,
        rentAmount: property.rentAmount,
        startDate,
        endDate,
        securityDeposit,
        documentUrl: null,
        active: true
      });
      
      leases.push(lease);
      console.log(`Created lease for property ${property.address} for tenant ${tenant.firstName}`);
    }
  }
  
  return leases;
};

// Create payments
const createPayments = async (leases: any[]) => {
  const payments = [];
  
  // Create 1-5 payments for each lease
  for (const lease of leases) {
    const paymentCount = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < paymentCount; i++) {
      const paymentDate = generatePastDate(180); // Payment made in the last 6 months
      const paymentTypes = ["Bank Transfer", "Mobile Money", "Credit Card", "Cash"];
      const paymentType = randomFrom(paymentTypes);
      
      const payment = await storage.createPayment({
        leaseId: lease.id,
        tenantId: lease.tenantId,
        amount: lease.rentAmount,
        paymentDate,
        paymentType,
        description: `Monthly rent payment for ${paymentDate.toLocaleDateString()}`
      });
      
      payments.push(payment);
      console.log(`Created payment for lease ${lease.id}`);
    }
  }
  
  return payments;
};

// Create maintenance requests
const createMaintenanceRequests = async (properties: any[], tenants: any[], maintenanceProviders: any[]) => {
  const requests = [];
  const statuses = ["pending", "in progress", "completed"];
  const priorities = ["low", "medium", "high", "urgent"];
  
  // Create 1-2 maintenance requests for each property
  for (const property of properties) {
    const requestCount = Math.floor(Math.random() * 2) + 1;
    
    // Find tenant for this property
    const lease = await storage.getLeasesByProperty(property.id);
    let tenantId = null;
    
    if (lease && lease.length > 0) {
      tenantId = lease[0].tenantId;
    } else {
      // If no lease, assign a random tenant
      tenantId = randomFrom(tenants).id;
    }
    
    for (let i = 0; i < requestCount; i++) {
      const title = randomFrom([
        "Leaking Faucet", 
        "Broken Air Conditioner", 
        "Electrical Issue", 
        "Plumbing Problem",
        "Broken Window",
        "Door Lock Issue",
        "Ceiling Fan not Working"
      ]);
      
      const description = `I need assistance with ${title.toLowerCase()} in the ${randomFrom([
        "kitchen", "bathroom", "bedroom", "living room"
      ])}.`;
      
      const createdAt = generatePastDate(90); // Created in the last 3 months
      const updatedAt = new Date(createdAt);
      updatedAt.setDate(createdAt.getDate() + Math.floor(Math.random() * 14)); // Updated within 2 weeks of creation
      
      const status = randomFrom(statuses);
      const priority = randomFrom(priorities);
      
      // Assign to maintenance provider if status is in progress or completed
      let assignedToId = null;
      if (status === "in progress" || status === "completed") {
        assignedToId = randomFrom(maintenanceProviders).id;
      }
      
      const request = await storage.createMaintenanceRequest({
        title,
        propertyId: property.id,
        tenantId,
        description,
        priority,
        status,
        assignedToId,
        createdAt,
        updatedAt,
        images: null
      });
      
      requests.push(request);
      console.log(`Created maintenance request for property ${property.address}`);
    }
  }
  
  return requests;
};

// Create documents
const createDocuments = async (properties: any[], tenants: any[], landlords: any[]) => {
  const documents = [];
  const documentTypes = ["Lease Agreement", "Inspection Report", "Invoice", "Property Deed", "Maintenance Contract"];
  
  // Create 1-2 documents for each property
  for (const property of properties) {
    const documentCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < documentCount; i++) {
      const uploadedAt = generatePastDate(180); // Uploaded in the last 6 months
      const documentType = randomFrom(documentTypes);
      const fileType = randomFrom(["pdf", "docx", "jpg"]);
      const fileName = `${documentType.replace(/\s/g, '_')}_${property.id}_${uploadedAt.getTime()}.${fileType}`;
      
      const document = await storage.createDocument({
        propertyId: property.id,
        userId: property.landlordId, // Document uploaded by landlord
        fileName,
        fileUrl: `/uploads/documents/${fileName}`,
        fileType,
        uploadedAt,
        documentType
      });
      
      documents.push(document);
      console.log(`Created document ${fileName} for property ${property.address}`);
    }
  }
  
  return documents;
};

// Create messages
const createMessages = async (tenants: any[], landlords: any[]) => {
  const messages = [];
  
  // Create 1-3 messages between each tenant and landlord
  for (const tenant of tenants) {
    const landlord = randomFrom(landlords);
    const messageCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < messageCount; i++) {
      const sentAt = generatePastDate(30); // Sent in the last month
      const isFromTenant = Math.random() > 0.5; // 50% chance of being from tenant
      
      const senderId = isFromTenant ? tenant.id : landlord.id;
      const receiverId = isFromTenant ? landlord.id : tenant.id;
      
      const messageContent = isFromTenant 
        ? randomFrom([
            "Hi, when can I schedule a maintenance visit?",
            "I've noticed a small issue with the plumbing.",
            "When is the rent due this month?",
            "Is it possible to extend my lease?",
            "The neighbors are being too loud at night."
          ])
        : randomFrom([
            "I'll schedule a maintenance visit soon.",
            "Thanks for letting me know about the issue.",
            "Rent is due on the 5th as usual.",
            "We can discuss extending your lease next month.",
            "I'll speak with the neighbors about the noise."
          ]);
      
      const message = await storage.createMessage({
        senderId,
        receiverId,
        content: messageContent,
        sentAt,
        read: Math.random() > 0.3 // 70% chance of being read
      });
      
      messages.push(message);
      console.log(`Created message between ${tenant.firstName} and ${landlord.firstName}`);
    }
  }
  
  return messages;
};

// Main seeding function
export const seedData = async () => {
  try {
    console.log("Starting seed data process with Botswana specific data...");
    
    console.log("Creating users...");
    const landlords = await createLandlords();
    const tenants = await createTenants();
    const agencies = await createAgencies();
    const maintenanceProviders = await createMaintenanceProviders();
    
    console.log("Creating properties...");
    const properties = await createProperties(landlords);
    
    console.log("Creating leases...");
    const leases = await createLeases(properties, tenants);
    
    console.log("Creating payments...");
    const payments = await createPayments(leases);
    
    console.log("Creating maintenance requests...");
    const maintenanceRequests = await createMaintenanceRequests(properties, tenants, maintenanceProviders);
    
    console.log("Creating documents...");
    const documents = await createDocuments(properties, tenants, landlords);
    
    console.log("Creating messages...");
    const messages = await createMessages(tenants, landlords);
    
    console.log("Seed data process completed successfully!");
    
    return {
      landlords,
      tenants,
      agencies,
      maintenanceProviders,
      properties,
      leases,
      payments,
      maintenanceRequests,
      documents,
      messages
    };
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

// Function to clean up all test data
export const cleanupData = async () => {
  try {
    console.log("Starting cleanup of all test data...");
    
    // Clear all tables in reverse order of dependencies
    await storage.clearMessages();
    await storage.clearDocuments();
    await storage.clearMaintenanceRequests();
    await storage.clearPayments();
    await storage.clearLeases();
    await storage.clearProperties();
    await storage.clearUsers();
    
    console.log("All test data has been successfully removed!");
  } catch (error) {
    console.error("Error cleaning up data:", error);
    throw error;
  }
};