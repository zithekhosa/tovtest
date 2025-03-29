/**
 * This script adds comprehensive mockup data to the TOV Property Management Platform
 * to demonstrate the full ecosystem functionality with realistic Botswana-specific data.
 */

import { storage } from "../server/storage";
import { 
  UserRole, 
  InsertUser, 
  InsertProperty, 
  InsertLease, 
  InsertPayment,
  InsertMaintenanceRequest,
  InsertDocument,
  InsertMessage
} from "../shared/schema";
import { hashPassword } from "../server/utils";

// Botswana-specific data
const botswanaLocations = {
  cities: [
    'Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Serowe', 
    'Selibe Phikwe', 'Mahalapye', 'Kanye', 'Lobatse', 'Palapye'
  ],
  areas: {
    'Gaborone': [
      'Block 5', 'Block 6', 'Block 7', 'Block 8', 'Block 9', 
      'Block 10', 'Phase 1', 'Phase 2', 'Phase 4', 'Phakalane',
      'Broadhurst', 'Extension 2', 'Extension 4', 'Extension 9',
      'Tlokweng', 'Gaborone North', 'Village', 'CBD', 'Gaborone West'
    ],
    'Francistown': [
      'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5',
      'Satellite', 'Gerald Estates', 'Monarch', 'Donga', 'Somerset'
    ],
    'Maun': [
      'Disaneng', 'Matlapana', 'Shashe', 'Tsanekona', 'Boseja',
      'Sedie', 'Matshwane', 'Botshabelo', 'Station', 'Thito'
    ]
  },
  streets: [
    'Independence Avenue', 'Queens Road', 'Khama Crescent', 'Sir Seretse Khama Road',
    'Nelson Mandela Drive', 'Maratadiba Road', 'Nyerere Drive', 'Kubu Road',
    'Chuma Drive', 'Limpopo Road', 'Zambezi Road', 'Machel Drive',
    'Western Bypass', 'Eastern Bypass', 'Morupule Drive', 'Tlokweng Road',
    'Molepolole Road', 'Old Lobatse Road', 'Notwane Road', 'Letlhakeng Road'
  ]
};

// Botswana first and last names
const botswanaNames = {
  firstNames: {
    male: [
      'Kabo', 'Tumelo', 'Kgosi', 'Thabo', 'Kagiso', 
      'Molefe', 'Lesego', 'Mothusi', 'Mpho', 'Boitumelo',
      'Tebogo', 'Moagi', 'Khumo', 'Phenyo', 'Oteng',
      'Tshepo', 'Pako', 'Oratile', 'Amantle', 'Ditiro'
    ],
    female: [
      'Gorata', 'Lesedi', 'Masego', 'Kefilwe', 'Naledi',
      'Lorato', 'Boipelo', 'Bontle', 'Katlego', 'Warona',
      'Onthatile', 'Tshiamo', 'Refilwe', 'Maipelo', 'Gaone',
      'Thato', 'Bojelo', 'Oarabile', 'Keneilwe', 'Maatla'
    ]
  },
  lastNames: [
    'Motswana', 'Kgosidintsi', 'Modise', 'Moilwa', 'Khumalo',
    'Mokgatlhe', 'Sebina', 'Molefe', 'Phiri', 'Seleka',
    'Tshukudu', 'Nkwe', 'Tau', 'Mosarwe', 'Baipidi',
    'Monthe', 'Letshwenyo', 'Ramoroka', 'Gaboutlwelwe', 'Montshiwa',
    'Sechele', 'Seretse', 'Gaseitsiwe', 'Khama', 'Moremi'
  ]
};

// Mock property types and features
const propertyTypes = [
  'Apartment', 'House', 'Townhouse', 'Villa', 'Duplex',
  'Studio', 'Condo', 'Single Family Home', 'Multi-Family Home'
];

const amenities = [
  'Air Conditioning', 'Swimming Pool', 'Garden', 'Garage', 'Security System',
  'Furnished', 'Balcony', 'Patio', 'Parking', 'Internet',
  'TV Cable', 'Washer/Dryer', 'Gym', 'Playground', 'Gated Community',
  'Water Borehole', 'Solar Power', 'Backup Generator', 'CCTV', 'Servant Quarters'
];

// Helper functions
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomBoolean = (trueProb = 0.5): boolean => {
  return Math.random() < trueProb;
};

const generateRandomPhone = (): string => {
  // Botswana mobile numbers typically start with 71-74 or 76-77
  const prefix = getRandomElement(['71', '72', '73', '74', '76', '77']);
  const suffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return prefix + suffix;
};

const generateRandomEmail = (firstName: string, lastName: string): string => {
  const providers = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'bw-mail.co.bw', 'ub.ac.bw'];
  const provider = getRandomElement(providers);
  const randomNum = Math.floor(Math.random() * 1000);
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${provider}`;
};

const generateRandomAddress = (): string => {
  const city = getRandomElement(botswanaLocations.cities);
  const area = getRandomElement(botswanaLocations.areas[city as keyof typeof botswanaLocations.areas] || botswanaLocations.areas['Gaborone']);
  const street = getRandomElement(botswanaLocations.streets);
  const plotNumber = `Plot ${getRandomInt(1000, 99999)}`;
  return `${plotNumber}, ${street}, ${area}, ${city}`;
};

const formatAddress = (address: string): {
  address: string;
  city: string;
  state: string;
  zipCode: string;
} => {
  const parts = address.split(', ');
  return {
    address: `${parts[0]}, ${parts[1]}`,
    city: parts.length > 3 ? parts[2] : parts[1],
    state: 'Botswana',
    zipCode: getRandomInt(100, 999).toString()
  };
};

// Generate a person with Botswana-specific attributes
const generatePerson = (isMale: boolean = Math.random() > 0.5): {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
} => {
  const firstName = isMale 
    ? getRandomElement(botswanaNames.firstNames.male) 
    : getRandomElement(botswanaNames.firstNames.female);
  const lastName = getRandomElement(botswanaNames.lastNames);
  return {
    firstName,
    lastName,
    email: generateRandomEmail(firstName, lastName),
    phone: generateRandomPhone()
  };
};

// Property image URLs (would be replaced with actual images in a real system)
const propertyImageUrls = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
  "https://images.unsplash.com/photo-1592595896551-12b371d546d5",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83",
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a"
];

// Document types
const documentTypes = [
  'Lease Agreement', 'Rent Receipt', 'Property Inspection Report', 
  'Maintenance Invoice', 'Tenant Application', 'Property Tax Document',
  'Insurance Policy', 'Inventory List', 'Utility Bill', 'Move-in Checklist'
];

// Maintenance issue types
const maintenanceIssueTypes = [
  'Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural',
  'Pest Control', 'Landscaping', 'Security', 'Painting', 'Flooring'
];

// Maintenance descriptions
const maintenanceDescriptions = {
  'Plumbing': [
    'Leaking kitchen faucet', 'Clogged toilet', 'Broken shower head', 
    'Water pressure issues', 'Leaking pipes under sink', 'Hot water not working'
  ],
  'Electrical': [
    'Light fixture not working', 'Power outlet not working', 'Circuit breaker trips frequently', 
    'Ceiling fan malfunction', 'Doorbell not working', 'Flickering lights'
  ],
  'HVAC': [
    'Air conditioner not cooling', 'Heater not working', 'Strange noise from AC unit', 
    'Fan not working properly', 'Thermostat malfunction', 'Air not flowing through vents'
  ],
  'Appliance': [
    'Refrigerator not cooling', 'Stove burner not working', 'Washing machine leaking', 
    'Dryer not heating', 'Microwave not turning on', 'Dishwasher not draining'
  ],
  'Structural': [
    'Ceiling leak', 'Cracked wall', 'Door not closing properly', 
    'Broken window', 'Loose floor tiles', 'Cabinet door broken'
  ]
};

// Maintenance status messages
const maintenanceStatusMessages = {
  'pending': [
    'Request received, awaiting assignment', 
    'Your request has been logged in our system',
    'Request is in queue for processing'
  ],
  'assigned': [
    'Technician has been assigned to your request', 
    'A maintenance provider will contact you soon',
    'Your request has been assigned to our team'
  ],
  'in_progress': [
    'Technician is working on the issue', 
    'Repairs are underway',
    'Parts have been ordered, work in progress'
  ],
  'completed': [
    'Repairs have been completed', 
    'Issue has been resolved',
    'Maintenance work completed successfully'
  ],
  'cancelled': [
    'Request has been cancelled as requested', 
    'Maintenance request cancelled',
    'Request cancelled due to duplication'
  ]
};

// Payment methods
const paymentMethods = [
  'Bank Transfer', 'Mobile Money', 'Cash', 'Cheque', 'Direct Debit',
  'Orange Money', 'MyZaka', 'Credit Card', 'Debit Card'
];

// Lease terms
const leaseTerms = [
  '12 months, with option to renew', 
  '6 months fixed term', 
  '24 months with 60-day notice for termination',
  '12 months with automatic renewal',
  'Month-to-month after initial 6-month period'
];

// Main function to add mockup data
export const addMockupData = async () => {
  console.log("Starting to add comprehensive mockup data...");
  
  // Generate landlords (5)
  const landlords: number[] = [];
  for (let i = 0; i < 5; i++) {
    const person = generatePerson();
    const landlord: InsertUser = {
      username: `landlord${i + 2}`,
      password: await hashPassword("password123"),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      role: UserRole.LANDLORD,
      profileImage: null,
      bio: `Property owner with multiple investments in Botswana. Focused on providing quality housing.`
    };
    
    const createdLandlord = await storage.createUser(landlord);
    landlords.push(createdLandlord.id);
    console.log(`Created landlord: ${person.firstName} ${person.lastName}`);
  }
  
  // Generate agencies (3)
  const agencies: number[] = [];
  for (let i = 0; i < 3; i++) {
    const person = generatePerson();
    const agencyNames = ['Pula Realty', 'BW Properties', 'Gaborone Estates', 'Botswana Home Finders', 'Capital Property Services'];
    const agencyName = agencyNames[i % agencyNames.length];
    
    const agency: InsertUser = {
      username: `agency${i + 2}`,
      password: await hashPassword("password123"),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      role: UserRole.AGENCY,
      profileImageUrl: null,
      bio: `Representing ${agencyName}, specializing in property management and lettings across Botswana.`
    };
    
    const createdAgency = await storage.createUser(agency);
    agencies.push(createdAgency.id);
    console.log(`Created agency: ${agencyName} (${person.firstName} ${person.lastName})`);
  }
  
  // Generate maintenance providers (7)
  const maintenanceProviders: number[] = [];
  for (let i = 0; i < 7; i++) {
    const person = generatePerson(true); // Most maintenance providers are male in Botswana
    const skills = getRandomElements([...Object.keys(maintenanceDescriptions), 'Carpentry', 'Painting', 'Roofing', 'Tiling'], getRandomInt(2, 4));
    
    const provider: InsertUser = {
      username: `maintenance${i + 2}`,
      password: await hashPassword("password123"),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      role: UserRole.MAINTENANCE,
      profileImageUrl: null,
      bio: `Experienced maintenance professional specializing in ${skills.join(', ')}. Available for residential and commercial properties.`
    };
    
    const createdProvider = await storage.createUser(provider);
    maintenanceProviders.push(createdProvider.id);
    console.log(`Created maintenance provider: ${person.firstName} ${person.lastName} (${skills.join(', ')})`);
  }

  // Generate tenants (10)
  const tenants: number[] = [];
  for (let i = 0; i < 10; i++) {
    const isMale = Math.random() > 0.5;
    const person = generatePerson(isMale);
    const occupations = ['Teacher', 'IT Specialist', 'Doctor', 'Engineer', 'Government Employee', 
                         'Bank Clerk', 'Shop Owner', 'University Student', 'Accountant', 'Nurse'];
    
    const tenant: InsertUser = {
      username: `tenant${i + 2}`,
      password: await hashPassword("password123"),
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      role: UserRole.TENANT,
      profileImageUrl: null,
      bio: `${getRandomElement(occupations)} working in ${getRandomElement(botswanaLocations.cities)}. Looking for a comfortable place to call home.`
    };
    
    const createdTenant = await storage.createUser(tenant);
    tenants.push(createdTenant.id);
    console.log(`Created tenant: ${person.firstName} ${person.lastName}`);
  }

  // Generate properties (25) - distributed among landlords and agencies
  const properties: number[] = [];
  for (let i = 0; i < 25; i++) {
    const fullAddress = generateRandomAddress();
    const { address, city, state, zipCode } = formatAddress(fullAddress);
    
    const propertyType = getRandomElement(propertyTypes);
    const bedrooms = getRandomInt(1, 4);
    const bathrooms = Math.max(1, Math.round(bedrooms * 0.75));
    const squareFeet = bedrooms * getRandomInt(250, 400);
    const rentAmount = getRandomInt(3000, 15000); // BWP
    
    // Decide if property is managed by landlord directly or through agency
    const isAgencyManaged = Math.random() < 0.4; // 40% of properties are managed by agencies
    const ownerId = getRandomElement(landlords);
    const agencyId = isAgencyManaged ? getRandomElement(agencies) : null;
    
    const propertyAmenities = getRandomElements(amenities, getRandomInt(3, 8));
    const imageUrls = getRandomElements(propertyImageUrls, getRandomInt(1, 5));
    
    const property: InsertProperty = {
      address,
      description: `${bedrooms} bedroom ${propertyType.toLowerCase()} in ${city}. Features include ${propertyAmenities.slice(0, 3).join(', ')}.`,
      landlordId: ownerId,
      agencyId,
      city,
      state,
      zipCode,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      rentAmount,
      available: getRandomBoolean(0.3), // 30% available
      images: imageUrls
    };
    
    const createdProperty = await storage.createProperty(property);
    properties.push(createdProperty.id);
    console.log(`Created property: ${bedrooms} bedroom ${propertyType} in ${city} (${isAgencyManaged ? 'Agency managed' : 'Owner managed'})`);
  }

  // Create leases (15) - some properties should be leased, others available
  const leases: number[] = [];
  const leasedProperties = getRandomElements(properties, 15);
  
  for (let i = 0; i < leasedProperties.length; i++) {
    const propertyId = leasedProperties[i];
    const property = await storage.getProperty(propertyId);
    
    if (!property) continue;
    
    // Mark property as unavailable since it's leased
    await storage.updateProperty(propertyId, { available: false });
    
    const tenantId = getRandomElement(tenants);
    const startDate = getRandomDate(new Date(2022, 0, 1), new Date(2023, 6, 1));
    
    // Lease duration between 6 and 24 months
    const duration = getRandomInt(6, 24);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);
    
    const securityDeposit = property.rentAmount * getRandomInt(1, 3);
    const terms = getRandomElement(leaseTerms);
    
    const lease: InsertLease = {
      propertyId,
      tenantId,
      rentAmount: property.rentAmount,
      startDate,
      endDate,
      securityDeposit,
      documentUrl: null,
      active: new Date() < endDate // Active if end date is in the future
    };
    
    const createdLease = await storage.createLease(lease);
    leases.push(createdLease.id);
    console.log(`Created lease for property ID ${propertyId} to tenant ID ${tenantId}, ${duration} months`);
  }

  // Generate payments (40) - historical rent payments for the leases
  for (let i = 0; i < 40; i++) {
    const leaseId = getRandomElement(leases);
    const lease = await storage.getLease(leaseId);
    
    if (!lease) continue;
    
    const today = new Date();
    const dayDiff = Math.floor((today.getTime() - lease.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const monthsFromStart = Math.floor(dayDiff / 30);
    
    // Only create payments for months that have already passed since lease start
    if (monthsFromStart <= 0) continue;
    
    const paymentMonth = new Date(lease.startDate);
    paymentMonth.setMonth(paymentMonth.getMonth() + getRandomInt(0, Math.min(monthsFromStart, 6)));
    
    const dueDate = new Date(paymentMonth);
    dueDate.setDate(1); // Due on 1st of the month
    
    const paymentDate = getRandomBoolean(0.8) 
      ? new Date(dueDate.getTime() + getRandomInt(-3, 7) * 24 * 60 * 60 * 1000) // 80% paid around due date
      : null; // 20% not paid yet
    
    const status = paymentDate ? (paymentDate <= dueDate ? 'paid_on_time' : 'paid_late') : 'pending';
    const amount = lease.rentAmount;
    const method = paymentDate ? getRandomElement(paymentMethods) : null;
    
    const payment: InsertPayment = {
      leaseId,
      amount,
      dueDate,
      paymentDate,
      status,
      method: method || null,
      tenantId: lease.tenantId,
      landlordId: (await storage.getProperty(lease.propertyId))?.landlordId || 0
    };
    
    await storage.createPayment(payment);
    console.log(`Created ${status} payment for lease ID ${leaseId}, due ${dueDate.toISOString().split('T')[0]}`);
  }

  // Generate maintenance requests (30) - covering different statuses and priorities
  for (let i = 0; i < 30; i++) {
    // Choose a leased property for maintenance request
    const leaseId = getRandomElement(leases);
    const lease = await storage.getLease(leaseId);
    
    if (!lease) continue;
    
    const propertyId = lease.propertyId;
    const tenantId = lease.tenantId;
    
    // Randomly select maintenance issue type and description
    const issueType = getRandomElement(Object.keys(maintenanceDescriptions));
    const title = getRandomElement(maintenanceDescriptions[issueType as keyof typeof maintenanceDescriptions]);
    
    // Generate detailed description
    const detailedDescription = `${title} in ${getRandomElement(['kitchen', 'bathroom', 'bedroom', 'living room', 'hallway'])}. ${
      getRandomElement([
        'This issue started yesterday',
        'The problem has been ongoing for a week',
        'This just happened this morning',
        'I first noticed this issue last weekend',
        'The problem is getting worse'
      ])
    }. ${
      getRandomElement([
        'Please fix as soon as possible',
        'Please advise on next steps',
        'I\'ve tried to fix it myself but couldn\'t resolve it',
        'The issue is causing inconvenience',
        'It needs urgent attention'
      ])
    }`;
    
    // Determine status with a distribution
    const statusProbabilities = [0.15, 0.2, 0.25, 0.3, 0.1]; // pending, assigned, in_progress, completed, cancelled
    const statusOptions = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    
    let statusIndex = 0;
    const r = Math.random();
    let cumulativeProbability = 0;
    
    for (let j = 0; j < statusProbabilities.length; j++) {
      cumulativeProbability += statusProbabilities[j];
      if (r <= cumulativeProbability) {
        statusIndex = j;
        break;
      }
    }
    
    const status = statusOptions[statusIndex];
    
    // Assign to maintenance provider if status requires it
    const assignedToId = ['assigned', 'in_progress', 'completed'].includes(status)
      ? getRandomElement(maintenanceProviders)
      : null;
    
    // Determine priority
    const priority = getRandomElement(['low', 'medium', 'high', 'emergency']);
    
    // Create dates based on status
    const now = new Date();
    const createdAt = getRandomDate(new Date(now.getFullYear(), now.getMonth() - 3), now);
    
    let updatedAt = null;
    if (status !== 'pending') {
      updatedAt = new Date(createdAt);
      updatedAt.setDate(updatedAt.getDate() + getRandomInt(1, 7));
    }
    
    // Add some random status update messages
    const notes = status !== 'pending' ? getRandomElement(maintenanceStatusMessages[status as keyof typeof maintenanceStatusMessages]) : null;
    
    const request: InsertMaintenanceRequest = {
      propertyId,
      tenantId,
      title,
      description: detailedDescription,
      status,
      priority,
      createdAt,
      updatedAt,
      assignedToId,
      images: null
    };
    
    const createdRequest = await storage.createMaintenanceRequest(request);
    
    console.log(`Created ${priority} priority ${status} maintenance request: ${title} for property ID ${propertyId}`);
    
    // Add additional status update messages for completed requests
    if (status === 'completed' && assignedToId) {
      // Add a 'before work' message
      const beforeMessage = getRandomElement([
        'Will be arriving tomorrow morning to assess the issue',
        'I\'ve ordered the necessary parts and will schedule repair soon',
        'I can come by this afternoon to look at this problem',
        'Scheduled for inspection next Tuesday at 10am',
        'Will need access to the property to fix this issue'
      ]);
      
      // Add a 'during work' message
      const duringMessage = getRandomElement([
        'Currently working on the repair. Will need another hour to complete',
        'The issue is more complex than expected. Need to order additional parts',
        'Making good progress on the repairs',
        'Almost finished with the repair',
        'Had to replace more components than initially expected'
      ]);
      
      // Add a 'completion' message
      const completionMessage = getRandomElement([
        'All repairs have been completed. Please let me know if you notice any issues',
        'Fixed the problem. Had to replace the entire unit',
        'Repair complete. Everything should be working properly now',
        'Completed the maintenance work. Please test and confirm all is working',
        'Job done. Cleaned up the area as well'
      ]);
      
      // Create a message from the provider to tenant
      const message1: InsertMessage = {
        senderId: assignedToId,
        receiverId: tenantId,
        content: beforeMessage,
        isRead: true,
        sentAt: new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day after request
      };
      
      const message2: InsertMessage = {
        senderId: assignedToId,
        receiverId: tenantId,
        content: duringMessage,
        isRead: true,
        sentAt: new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days after request
      };
      
      const message3: InsertMessage = {
        senderId: assignedToId,
        receiverId: tenantId,
        content: completionMessage,
        isRead: getRandomBoolean(0.7), // 70% have been read
        sentAt: new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days after request
      };
      
      await storage.createMessage(message1);
      await storage.createMessage(message2);
      await storage.createMessage(message3);
      
      console.log(`Added conversation messages for maintenance request ID ${createdRequest.id}`);
    }
  }
  
  // Generate documents (25) - various document types for properties and leases
  for (let i = 0; i < 25; i++) {
    const documentType = getRandomElement(documentTypes);
    const name = `${documentType} - ${new Date().getFullYear()}`;
    
    // Half of documents related to properties, half to leases
    let userId, propertyId;
    
    if (i % 2 === 0 && leases.length > 0) {
      // Lease-related document
      const leaseId = getRandomElement(leases);
      const lease = await storage.getLease(leaseId);
      
      if (!lease) continue;
      
      propertyId = lease.propertyId;
      userId = Math.random() > 0.5 ? lease.tenantId : (await storage.getProperty(propertyId))?.landlordId || 0;
    } else {
      // Property-related document
      propertyId = getRandomElement(properties);
      const property = await storage.getProperty(propertyId);
      
      if (!property) continue;
      
      userId = property.landlordId;
    }
    
    const uploadDate = getRandomDate(new Date(2022, 0, 1), new Date());
    
    const document: InsertDocument = {
      name,
      description: `${documentType} for property record purposes`,
      fileUrl: `https://example.com/documents/${documentType.toLowerCase().replace(/\s+/g, '-')}-${i}.pdf`,
      fileType: 'pdf',
      uploadDate,
      userId,
      propertyId
    };
    
    await storage.createDocument(document);
    console.log(`Created document: ${name} for property ID ${propertyId}`);
  }
  
  // Generate messages (50) - create conversations between users
  for (let i = 0; i < 50; i++) {
    // Decide on conversation participants
    let senderId, receiverId;
    
    const conversationType = getRandomInt(1, 5);
    
    switch (conversationType) {
      case 1: // Tenant to Landlord
        senderId = getRandomElement(tenants);
        receiverId = getRandomElement(landlords);
        break;
      case 2: // Landlord to Tenant
        senderId = getRandomElement(landlords);
        receiverId = getRandomElement(tenants);
        break;
      case 3: // Tenant to Agency
        senderId = getRandomElement(tenants);
        receiverId = getRandomElement(agencies);
        break;
      case 4: // Tenant to Maintenance
        senderId = getRandomElement(tenants);
        receiverId = getRandomElement(maintenanceProviders);
        break;
      case 5: // Landlord to Agency
        senderId = getRandomElement(landlords);
        receiverId = getRandomElement(agencies);
        break;
    }
    
    const messageTemplates = {
      'tenant_to_landlord': [
        'Hello, I wanted to inquire about the rent increase mentioned in your last notice.',
        'Could you please send someone to fix the kitchen tap? It\'s been leaking for 2 days.',
        'Is it possible to extend my lease for another 6 months?',
        'Are pets allowed in the property? I\'m considering adopting a small dog.'
      ],
      'landlord_to_tenant': [
        'Your rent payment for this month hasn\'t been received yet. Please confirm when you will make the payment.',
        'I\'ll be inspecting the property next Tuesday at 2pm. Please let me know if this works for you.',
        'The maintenance team will come tomorrow to fix your reported issue.',
        'Thank you for your prompt rent payment. Your receipt has been attached.'
      ],
      'tenant_to_agency': [
        'I\'m looking for a 2-bedroom apartment in Gaborone. Do you have any available units?',
        'What documents do I need to provide for the rental application?',
        'Could you arrange a viewing of the property at Queens Road this weekend?',
        'I\'d like to renew my lease. What is the process?'
      ],
      'tenant_to_maintenance': [
        'The bathroom sink is clogged. When can you come to fix it?',
        'There\'s a water leak under the kitchen sink that needs immediate attention.',
        'The air conditioner is not cooling properly. Can you check it?',
        'One of the electrical outlets in the living room is not working.'
      ],
      'landlord_to_agency': [
        'How are the viewings going for my property on Independence Avenue?',
        'I need to update the rental amount for my properties. Can we discuss?',
        'Could you send me the financial report for last month?',
        'I\'m considering adding another property to your management portfolio.'
      ]
    };
    
    let messageContent;
    
    if (conversationType === 1) {
      messageContent = getRandomElement(messageTemplates.tenant_to_landlord);
    } else if (conversationType === 2) {
      messageContent = getRandomElement(messageTemplates.landlord_to_tenant);
    } else if (conversationType === 3) {
      messageContent = getRandomElement(messageTemplates.tenant_to_agency);
    } else if (conversationType === 4) {
      messageContent = getRandomElement(messageTemplates.tenant_to_maintenance);
    } else {
      messageContent = getRandomElement(messageTemplates.landlord_to_agency);
    }
    
    const sentAt = getRandomDate(new Date(2023, 0, 1), new Date());
    
    const message: InsertMessage = {
      senderId,
      receiverId,
      content: messageContent,
      isRead: getRandomBoolean(0.6), // 60% chance of being read
      sentAt
    };
    
    await storage.createMessage(message);
    
    // 30% chance to create a reply message
    if (Math.random() < 0.3) {
      const replyDelay = getRandomInt(1, 48) * 60 * 60 * 1000; // 1-48 hours in milliseconds
      const replySentAt = new Date(sentAt.getTime() + replyDelay);
      
      // Swap sender and receiver for the reply
      const replyMessage: InsertMessage = {
        senderId: receiverId,
        receiverId: senderId,
        content: getRandomElement([
          'Thank you for your message. I will look into this and get back to you soon.',
          'I\'ve noted your request and will take appropriate action.',
          'I appreciate your message. Let me check and respond properly.',
          'Thanks for letting me know. I\'ll address this promptly.'
        ]),
        isRead: getRandomBoolean(0.7), // 70% chance of being read
        sentAt: replySentAt
      };
      
      await storage.createMessage(replyMessage);
    }
    
    console.log(`Created message from user ID ${senderId} to user ID ${receiverId}`);
  }
  
  console.log("Mockup data generation completed successfully!");
  return {
    landlords,
    agencies,
    maintenanceProviders,
    tenants,
    properties,
    leases
  };
};

// Function is already exported at the declaration