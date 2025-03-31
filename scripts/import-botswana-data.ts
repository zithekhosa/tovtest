/**
 * This script imports the Botswana mock data into the database
 * Run with: npx tsx scripts/import-botswana-data.ts
 */
import { db } from "../server/db";
import { users, properties, leases, payments, maintenanceRequests } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hash } from "../server/utils";

// Mock data structure (simplified version of the JSON)
interface MockTenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore: number;
  employmentStatus: string;
  monthlyIncome: number;
  moveInDate: string;
  activeLeases: string[];
  leaseHistory: string[];
}

interface MockProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  monthlyRent: number;
  availabilityStatus: string;
  currentLeaseId: string | null;
  amenities: string[];
}

interface MockPayment {
  date: string;
  amount: number;
  status: string;
  method: string;
}

interface MockLease {
  id: string;
  propertyId: string;
  tenantIds: string[];
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: string;
  leaseTerms: string;
  renewalOption: boolean;
  petAddendum: boolean;
  lateFees: {
    gracePeriod: number;
    feeAmount: number;
  };
  paymentHistory: MockPayment[];
}

interface MockMaintenanceRequest {
  id: string;
  propertyId: string;
  tenantId: string;
  dateSubmitted: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  completionDate: string | null;
  cost: number;
}

interface MockData {
  tenants: MockTenant[];
  properties: MockProperty[];
  leases: MockLease[];
  maintenanceRequests: MockMaintenanceRequest[];
}

const mockData: MockData = {
  tenants: [
    {
      id: "T001",
      firstName: "Kgosi",
      lastName: "Molefe",
      email: "kgosi.molefe@example.com",
      phone: "267-71-123-456",
      creditScore: 720,
      employmentStatus: "Full-time",
      monthlyIncome: 15200,
      moveInDate: "2023-06-15",
      activeLeases: ["L001"],
      leaseHistory: ["L004"]
    },
    {
      id: "T002",
      firstName: "Lesego",
      lastName: "Khumalo",
      email: "lesego.k@example.com",
      phone: "267-72-987-654",
      creditScore: 690,
      employmentStatus: "Full-time",
      monthlyIncome: 14800,
      moveInDate: "2022-09-01",
      activeLeases: ["L002"],
      leaseHistory: ["L005", "L008"]
    },
    {
      id: "T003",
      firstName: "Tumelo",
      lastName: "Mokoena",
      email: "tmokoena@example.com",
      phone: "267-73-456-789",
      creditScore: 740,
      employmentStatus: "Self-employed",
      monthlyIncome: 16300,
      moveInDate: "2024-01-10",
      activeLeases: ["L003"],
      leaseHistory: []
    },
    {
      id: "T004",
      firstName: "Boitumelo",
      lastName: "Seelo",
      email: "boitumelo.s@example.com",
      phone: "267-74-567-890",
      creditScore: 710,
      employmentStatus: "Full-time",
      monthlyIncome: 17500,
      moveInDate: "2023-04-01",
      activeLeases: ["L006"],
      leaseHistory: ["L007"]
    },
    {
      id: "T005",
      firstName: "Mpho",
      lastName: "Kgopolelo",
      email: "mpho.k@example.com",
      phone: "267-75-678-901",
      creditScore: 680,
      employmentStatus: "Part-time",
      monthlyIncome: 8900,
      moveInDate: "2023-10-15",
      activeLeases: ["L009"],
      leaseHistory: []
    }
  ],
  properties: [
    {
      id: "P001",
      address: "123 Kgale View, Phase 2",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Apartment",
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      monthlyRent: 4200,
      availabilityStatus: "Occupied",
      currentLeaseId: "L001",
      amenities: ["Dishwasher", "Air Conditioning", "Security Guard"]
    },
    {
      id: "P002",
      address: "456 Phakalane Estate",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Single Family Home",
      bedrooms: 3,
      bathrooms: 2.5,
      squareFeet: 1750,
      monthlyRent: 7500,
      availabilityStatus: "Occupied",
      currentLeaseId: "L002",
      amenities: ["Swimming Pool", "Garage", "Garden"]
    },
    {
      id: "P003",
      address: "789 Extension 12, Unit 12",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Townhouse",
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      monthlyRent: 5500,
      availabilityStatus: "Occupied",
      currentLeaseId: "L003",
      amenities: ["Community Pool", "Gym Access", "Patio"]
    },
    {
      id: "P004",
      address: "32 Maru-a-Pula Road",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Apartment",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1100,
      monthlyRent: 6200,
      availabilityStatus: "Occupied",
      currentLeaseId: "L006",
      amenities: ["Balcony", "Security System", "Covered Parking"]
    },
    {
      id: "P005",
      address: "17 Mokolodi Crescent",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Single Family Home",
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2200,
      monthlyRent: 9800,
      availabilityStatus: "Occupied",
      currentLeaseId: "L009",
      amenities: ["Swimming Pool", "Garden", "Outdoor Entertainment Area"]
    },
    {
      id: "P006",
      address: "8 Mahalapye Road",
      city: "Palapye",
      state: "Central District",
      zipCode: "00267",
      type: "Single Family Home",
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1450,
      monthlyRent: 4800,
      availabilityStatus: "Available",
      currentLeaseId: null,
      amenities: ["Garden", "Carport", "Security Wall"]
    },
    {
      id: "P007",
      address: "25 Tlokweng Road",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      type: "Apartment",
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 650,
      monthlyRent: 3200,
      availabilityStatus: "Available",
      currentLeaseId: null,
      amenities: ["24/7 Security", "Shared Garden", "Water Tank"]
    }
  ],
  leases: [
    {
      id: "L001",
      propertyId: "P001",
      tenantIds: ["T001"],
      startDate: "2023-06-15",
      endDate: "2024-06-14",
      monthlyRent: 4200,
      securityDeposit: 4200,
      status: "Active",
      leaseTerms: "12 months",
      renewalOption: true,
      petAddendum: false,
      lateFees: {
        gracePeriod: 5,
        feeAmount: 420
      },
      paymentHistory: [
        {
          date: "2024-03-01",
          amount: 4200,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-02-01",
          amount: 4200,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-01-01",
          amount: 4200,
          status: "Paid",
          method: "Debit Card"
        }
      ]
    },
    {
      id: "L002",
      propertyId: "P002",
      tenantIds: ["T002"],
      startDate: "2023-09-01",
      endDate: "2024-08-31",
      monthlyRent: 7500,
      securityDeposit: 7500,
      status: "Active",
      leaseTerms: "12 months",
      renewalOption: true,
      petAddendum: true,
      lateFees: {
        gracePeriod: 3,
        feeAmount: 750
      },
      paymentHistory: [
        {
          date: "2024-03-01",
          amount: 7500,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-02-01",
          amount: 7500,
          status: "Late",
          method: "Bank Transfer"
        },
        {
          date: "2024-01-01",
          amount: 7500,
          status: "Paid",
          method: "Bank Transfer"
        }
      ]
    },
    {
      id: "L003",
      propertyId: "P003",
      tenantIds: ["T003"],
      startDate: "2024-01-10",
      endDate: "2025-01-09",
      monthlyRent: 5500,
      securityDeposit: 5500,
      status: "Active",
      leaseTerms: "12 months",
      renewalOption: true,
      petAddendum: false,
      lateFees: {
        gracePeriod: 5,
        feeAmount: 550
      },
      paymentHistory: [
        {
          date: "2024-03-01",
          amount: 5500,
          status: "Paid",
          method: "Debit Card"
        },
        {
          date: "2024-02-01",
          amount: 5500,
          status: "Paid",
          method: "Debit Card"
        },
        {
          date: "2024-01-10",
          amount: 5500,
          status: "Paid",
          method: "Debit Card"
        }
      ]
    },
    {
      id: "L004",
      propertyId: "P007",
      tenantIds: ["T001"],
      startDate: "2021-05-01",
      endDate: "2023-05-01",
      monthlyRent: 3050,
      securityDeposit: 3050,
      status: "Completed",
      leaseTerms: "24 months",
      renewalOption: false,
      petAddendum: false,
      lateFees: {
        gracePeriod: 5,
        feeAmount: 305
      },
      paymentHistory: [
        {
          date: "2023-05-01",
          amount: 3050,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2023-04-01",
          amount: 3050,
          status: "Paid",
          method: "Bank Transfer"
        }
      ]
    },
    {
      id: "L005",
      propertyId: "P006",
      tenantIds: ["T002"],
      startDate: "2020-07-15",
      endDate: "2022-07-15",
      monthlyRent: 4800,
      securityDeposit: 4800,
      status: "Completed",
      leaseTerms: "24 months",
      renewalOption: false,
      petAddendum: true,
      lateFees: {
        gracePeriod: 3,
        feeAmount: 480
      },
      paymentHistory: [
        {
          date: "2022-07-01",
          amount: 4800,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2022-06-01",
          amount: 4800,
          status: "Paid",
          method: "Bank Transfer"
        }
      ]
    },
    {
      id: "L006",
      propertyId: "P004",
      tenantIds: ["T004"],
      startDate: "2023-04-01",
      endDate: "2024-03-31",
      monthlyRent: 6200,
      securityDeposit: 6200,
      status: "Active",
      leaseTerms: "12 months",
      renewalOption: true,
      petAddendum: false,
      lateFees: {
        gracePeriod: 4,
        feeAmount: 620
      },
      paymentHistory: [
        {
          date: "2024-03-01",
          amount: 6200,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-02-01",
          amount: 6200,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-01-01",
          amount: 6200,
          status: "Paid",
          method: "Mobile Payment"
        }
      ]
    },
    {
      id: "L007",
      propertyId: "P006",
      tenantIds: ["T004"],
      startDate: "2021-03-15",
      endDate: "2023-03-14",
      monthlyRent: 4500,
      securityDeposit: 4500,
      status: "Completed",
      leaseTerms: "24 months",
      renewalOption: false,
      petAddendum: false,
      lateFees: {
        gracePeriod: 5,
        feeAmount: 450
      },
      paymentHistory: [
        {
          date: "2023-03-01",
          amount: 4500,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2023-02-01",
          amount: 4500,
          status: "Late",
          method: "Bank Transfer"
        }
      ]
    },
    {
      id: "L008",
      propertyId: "P003",
      tenantIds: ["T002"],
      startDate: "2018-05-01",
      endDate: "2020-04-30",
      monthlyRent: 4900,
      securityDeposit: 4900,
      status: "Completed",
      leaseTerms: "24 months",
      renewalOption: false,
      petAddendum: true,
      lateFees: {
        gracePeriod: 3,
        feeAmount: 490
      },
      paymentHistory: [
        {
          date: "2020-04-01",
          amount: 4900,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2020-03-01",
          amount: 4900,
          status: "Paid",
          method: "Bank Transfer"
        }
      ]
    },
    {
      id: "L009",
      propertyId: "P005",
      tenantIds: ["T005"],
      startDate: "2023-10-15",
      endDate: "2024-10-14",
      monthlyRent: 9800,
      securityDeposit: 9800,
      status: "Active",
      leaseTerms: "12 months",
      renewalOption: true,
      petAddendum: true,
      lateFees: {
        gracePeriod: 3,
        feeAmount: 980
      },
      paymentHistory: [
        {
          date: "2024-03-01",
          amount: 9800,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-02-01",
          amount: 9800,
          status: "Paid",
          method: "Bank Transfer"
        },
        {
          date: "2024-01-01",
          amount: 9800,
          status: "Paid",
          method: "Bank Transfer"
        }
      ]
    }
  ],
  maintenanceRequests: [
    {
      id: "M001",
      propertyId: "P001",
      tenantId: "T001",
      dateSubmitted: "2024-02-15",
      category: "Plumbing",
      description: "Water leaking from kitchen sink",
      priority: "Medium",
      status: "Completed",
      assignedTo: "Thabo Maintenance Services",
      completionDate: "2024-02-17",
      cost: 650.00
    },
    {
      id: "M002",
      propertyId: "P002",
      tenantId: "T002",
      dateSubmitted: "2024-03-05",
      category: "Electrical",
      description: "Power outlets not working in master bedroom",
      priority: "High",
      status: "In Progress",
      assignedTo: "Botswana Electric Solutions",
      completionDate: null,
      cost: 0
    },
    {
      id: "M003",
      propertyId: "P003",
      tenantId: "T003",
      dateSubmitted: "2024-02-28",
      category: "HVAC",
      description: "Air conditioning not cooling properly",
      priority: "Medium",
      status: "Scheduled",
      assignedTo: "Cool Air Technicians",
      completionDate: null,
      cost: 0
    },
    {
      id: "M004",
      propertyId: "P004",
      tenantId: "T004",
      dateSubmitted: "2024-01-20",
      category: "Pest Control",
      description: "Ants in the kitchen area",
      priority: "Low",
      status: "Completed",
      assignedTo: "Gaborone Pest Solutions",
      completionDate: "2024-01-22",
      cost: 350.00
    },
    {
      id: "M005",
      propertyId: "P005",
      tenantId: "T005",
      dateSubmitted: "2024-03-10",
      category: "Structural",
      description: "Crack in bathroom ceiling",
      priority: "High",
      status: "Assigned",
      assignedTo: "Build It Right Contractors",
      completionDate: null,
      cost: 0
    }
  ]
};

async function importBotswanaData() {
  try {
    console.log("Starting Botswana mock data import...");

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

    // 2. Create or update tenant users
    console.log("Creating/updating tenant users...");
    const mockTenantIds = new Map<string, number>(); // Map from mock ID to real ID
    
    for (const mockTenant of mockData.tenants) {
      // Check if tenant with this email already exists
      const existingTenantResult = await db.execute(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        [mockTenant.email]
      );
      
      let tenantId: number;
      
      if (existingTenantResult.rows.length) {
        // Update existing tenant
        tenantId = existingTenantResult.rows[0].id;
        await db.execute(
          `UPDATE users SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4`,
          [mockTenant.firstName, mockTenant.lastName, mockTenant.phone, tenantId]
        );
        console.log(`Updated existing tenant ${mockTenant.firstName} ${mockTenant.lastName}`);
      } else {
        // Create new tenant
        const hashedPassword = await hash("password123");
        const username = mockTenant.firstName.toLowerCase() + mockTenant.lastName.toLowerCase();
        
        const insertResult = await db.execute(
          `INSERT INTO users (username, password, first_name, last_name, email, role, phone, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id`,
          [username, hashedPassword, mockTenant.firstName, mockTenant.lastName, mockTenant.email, 'tenant', mockTenant.phone]
        );
        
        tenantId = insertResult.rows[0].id;
        console.log(`Created new tenant ${mockTenant.firstName} ${mockTenant.lastName} with ID ${tenantId}`);
      }
      
      mockTenantIds.set(mockTenant.id, tenantId);
    }
    
    // 3. Create or update properties
    console.log("Creating/updating properties...");
    const mockPropertyIds = new Map<string, number>(); // Map from mock ID to real ID
    
    for (const mockProperty of mockData.properties) {
      // Check if property with this address already exists
      const existingPropertyResult = await db.execute(
        `SELECT id FROM properties WHERE address = $1 LIMIT 1`,
        [mockProperty.address]
      );
      
      let propertyId: number;
      
      if (existingPropertyResult.rows.length) {
        // Update existing property
        propertyId = existingPropertyResult.rows[0].id;
        await db.execute(
          `UPDATE properties SET 
            landlord_id = $1, 
            city = $2, 
            state = $3, 
            zip_code = $4, 
            property_type = $5, 
            bedrooms = $6, 
            bathrooms = $7, 
            rent_amount = $8,
            security_deposit = $9,
            available = $10,
            amenities = $11,
            updated_at = NOW()
          WHERE id = $12`,
          [
            demoLandlordId,
            mockProperty.city,
            mockProperty.state,
            mockProperty.zipCode,
            mockProperty.type,
            mockProperty.bedrooms,
            mockProperty.bathrooms,
            mockProperty.monthlyRent,
            mockProperty.monthlyRent, // Using same amount for security deposit
            mockProperty.availabilityStatus === 'Available',
            JSON.stringify(mockProperty.amenities),
            propertyId
          ]
        );
        console.log(`Updated existing property at ${mockProperty.address}`);
      } else {
        // Create new property
        const insertResult = await db.execute(
          `INSERT INTO properties (
            address, landlord_id, city, state, zip_code, location, 
            property_type, bedrooms, bathrooms, rent_amount, security_deposit, 
            available, title, description, amenities, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW()) RETURNING id`,
          [
            mockProperty.address,
            demoLandlordId,
            mockProperty.city,
            mockProperty.state,
            mockProperty.zipCode,
            `${mockProperty.city}, ${mockProperty.state}`,
            mockProperty.type,
            mockProperty.bedrooms,
            mockProperty.bathrooms,
            mockProperty.monthlyRent,
            mockProperty.monthlyRent, // Using same amount for security deposit
            mockProperty.availabilityStatus === 'Available',
            `${mockProperty.bedrooms}BR ${mockProperty.type} in ${mockProperty.city}`,
            `Beautiful ${mockProperty.bedrooms} bedroom ${mockProperty.type.toLowerCase()} with ${mockProperty.bathrooms} bathrooms located in ${mockProperty.city}`,
            JSON.stringify(mockProperty.amenities),
          ]
        );
        
        propertyId = insertResult.rows[0].id;
        console.log(`Created new property at ${mockProperty.address} with ID ${propertyId}`);
      }
      
      mockPropertyIds.set(mockProperty.id, propertyId);
    }
    
    // 4. Create leases and payments
    console.log("Creating leases and payments...");
    
    for (const mockLease of mockData.leases) {
      const propertyId = mockPropertyIds.get(mockLease.propertyId);
      const tenantId = mockTenantIds.get(mockLease.tenantIds[0]);
      
      if (!propertyId || !tenantId) {
        console.error(`Could not find property ID ${mockLease.propertyId} or tenant ID ${mockLease.tenantIds[0]}`);
        continue;
      }
      
      // Check if lease already exists
      const existingLeaseResult = await db.execute(
        `SELECT id FROM leases WHERE property_id = $1 AND tenant_id = $2 AND start_date = $3 LIMIT 1`,
        [propertyId, tenantId, mockLease.startDate]
      );
      
      let leaseId: number;
      
      if (existingLeaseResult.rows.length) {
        // Update existing lease
        leaseId = existingLeaseResult.rows[0].id;
        await db.execute(
          `UPDATE leases SET 
            end_date = $1, 
            rent_amount = $2, 
            security_deposit = $3, 
            status = $4, 
            active = $5,
            updated_at = NOW()
          WHERE id = $6`,
          [
            mockLease.endDate,
            mockLease.monthlyRent,
            mockLease.securityDeposit,
            mockLease.status,
            mockLease.status === 'Active',
            leaseId
          ]
        );
        console.log(`Updated existing lease between property ${propertyId} and tenant ${tenantId}`);
      } else {
        // Create new lease
        const insertResult = await db.execute(
          `INSERT INTO leases (
            property_id, tenant_id, start_date, end_date, rent_amount, 
            security_deposit, status, active, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`,
          [
            propertyId,
            tenantId,
            mockLease.startDate,
            mockLease.endDate,
            mockLease.monthlyRent,
            mockLease.securityDeposit,
            mockLease.status,
            mockLease.status === 'Active'
          ]
        );
        
        leaseId = insertResult.rows[0].id;
        console.log(`Created new lease between property ${propertyId} and tenant ${tenantId} with ID ${leaseId}`);
      }
      
      // Create payments for this lease
      for (const mockPayment of mockLease.paymentHistory) {
        // Check if payment already exists
        const existingPaymentResult = await db.execute(
          `SELECT id FROM payments WHERE lease_id = $1 AND payment_date = $2 LIMIT 1`,
          [leaseId, mockPayment.date]
        );
        
        if (existingPaymentResult.rows.length) {
          // Update existing payment
          await db.execute(
            `UPDATE payments SET 
              amount = $1, 
              status = $2, 
              payment_type = $3,
              payment_method = $4,
              updated_at = NOW()
            WHERE id = $5`,
            [
              mockPayment.amount,
              mockPayment.status.toLowerCase(),
              'Rent',
              mockPayment.method,
              existingPaymentResult.rows[0].id
            ]
          );
          console.log(`Updated existing payment for lease ${leaseId} dated ${mockPayment.date}`);
        } else {
          // Create new payment
          await db.execute(
            `INSERT INTO payments (
              tenant_id, lease_id, amount, payment_date, payment_type, 
              payment_method, status, description, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              tenantId,
              leaseId,
              mockPayment.amount,
              mockPayment.date,
              'Rent',
              mockPayment.method,
              mockPayment.status.toLowerCase(),
              `Monthly rent payment for ${new Date(mockPayment.date).toLocaleString('default', { month: 'long', year: 'numeric' })}`
            ]
          );
          console.log(`Created new payment for lease ${leaseId} dated ${mockPayment.date}`);
        }
      }
    }
    
    // 5. Create maintenance requests
    console.log("Creating maintenance requests...");
    
    for (const mockRequest of mockData.maintenanceRequests) {
      const propertyId = mockPropertyIds.get(mockRequest.propertyId);
      const tenantId = mockTenantIds.get(mockRequest.tenantId);
      
      if (!propertyId || !tenantId) {
        console.error(`Could not find property ID ${mockRequest.propertyId} or tenant ID ${mockRequest.tenantId}`);
        continue;
      }

      // Get maintenance provider ID
      const maintenanceProviderResult = await db.execute(
        `SELECT id FROM users WHERE role = 'maintenance' LIMIT 1`
      );
      
      if (!maintenanceProviderResult.rows.length) {
        console.error("No maintenance provider found!");
        continue;
      }
      
      const providerId = maintenanceProviderResult.rows[0].id;
      
      // Check if maintenance request already exists
      const existingRequestResult = await db.execute(
        `SELECT id FROM maintenance_requests WHERE property_id = $1 AND tenant_id = $2 AND title LIKE $3 LIMIT 1`,
        [propertyId, tenantId, `%${mockRequest.category}%`]
      );
      
      if (existingRequestResult.rows.length) {
        // Update existing request
        await db.execute(
          `UPDATE maintenance_requests SET 
            description = $1, 
            status = $2, 
            priority = $3, 
            category = $4,
            estimated_cost = $5,
            assigned_to_id = $6,
            updated_at = NOW()
          WHERE id = $7`,
          [
            mockRequest.description,
            mockRequest.status.toLowerCase(),
            mockRequest.priority.toLowerCase(),
            mockRequest.category,
            mockRequest.cost,
            providerId,
            existingRequestResult.rows[0].id
          ]
        );
        console.log(`Updated existing maintenance request for property ${propertyId} by tenant ${tenantId}`);
      } else {
        // Create new maintenance request
        await db.execute(
          `INSERT INTO maintenance_requests (
            property_id, tenant_id, title, description, status, 
            priority, category, estimated_cost, assigned_to_id, is_public, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            propertyId,
            tenantId,
            `${mockRequest.category} Issue: ${mockRequest.description.substring(0, 30)}...`,
            mockRequest.description,
            mockRequest.status.toLowerCase(),
            mockRequest.priority.toLowerCase(),
            mockRequest.category,
            mockRequest.cost || null,
            providerId,
            true,
            mockRequest.dateSubmitted
          ]
        );
        console.log(`Created new maintenance request for property ${propertyId} by tenant ${tenantId}`);
      }
    }
    
    console.log("\nBotswana mock data import completed successfully!");
  } catch (error) {
    console.error("Error importing Botswana mock data:", error);
  }
}

// Run the import function
importBotswanaData().then(() => {
  console.log("Script finished");
  process.exit(0);
}).catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});