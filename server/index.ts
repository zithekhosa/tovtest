import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Phase 1: Enhanced Environment Validation
function validateEnvironment() {
  const requiredVars = [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SESSION_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate session secret strength
  const sessionSecret = process.env.SESSION_SECRET!;
  if (sessionSecret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

// Run environment validation on startup
validateEnvironment();

// Debug: Check if environment variables are loaded
console.log('=== Environment Variables Debug ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Present' : 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('===================================');

import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { hashPassword } from "./utils";
import { storage } from "./storage-factory";
import { UserRole } from "@shared/schema";
// Core middleware for basic functionality
import { 
  securityMiddleware, 
  requestLoggingMiddleware, 
  globalErrorHandler,
  rateLimitMiddleware,
  validateRequest 
} from "./middleware";
import { healthRoutes } from "./health-routes";
import { initializeNotificationService } from "./websocket-server";
import qualityAssuranceRoutes from "./quality-assurance-routes";
import { workflowMonitoringRoutes } from "./workflow-monitoring-routes";
import { workflowEngine } from "./workflow-engine";
import { auditLogger } from "./audit-logger";
import { monitoringDashboard } from "./monitoring-dashboard";
import { backupRecoveryManager } from "./backup-recovery";

const app = express();

// CORS configuration for frontend-backend communication
app.use((req, res, next) => {
  // Allow requests from frontend development server
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Enhanced middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'tov-property-management-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Apply security middleware
app.use(securityMiddleware);

// Middleware to set user from session
app.use(async (req, res, next) => {
  console.log('🔍 Session middleware - Session:', req.session);
  console.log('🔍 Session middleware - Session ID:', req.sessionID);
  
  if (req.session?.userId) {
    try {
      console.log(`🔍 Loading user ${req.session.userId} from storage...`);
      const user = await storage.getUser(req.session.userId);
      if (user) {
        (req as any).user = user;
        console.log(`✅ User loaded successfully: ${user.email} (${user.role})`);
      } else {
        console.log(`❌ User ${req.session.userId} not found in storage`);
      }
    } catch (error) {
      console.error('Error loading user from session:', error);
    }
  } else {
    console.log('🔍 No session userId found');
  }
  next();
});

// Apply request logging and performance tracking
app.use(requestLoggingMiddleware);

// Apply request validation
app.use(validateRequest);

// Apply rate limiting to API routes (increased limits for development)
app.use('/api', rateLimitMiddleware(15 * 60 * 1000, 500)); // 500 requests per 15 minutes

// Use modular health and error management routes
app.use('/api', healthRoutes);

// Use quality assurance routes
app.use('/api', qualityAssuranceRoutes);

// Use workflow monitoring routes
app.use('/api/monitoring', workflowMonitoringRoutes);

// Apply global error handler AFTER routes are registered
app.use(globalErrorHandler);

// Function to verify database connectivity and create test users if needed
async function verifyDatabaseAndUsers() {
  try {
    console.log("Verifying database connection and users...");
    
    // Check database connectivity by getting existing users
    try {
      // Check the database status by role
      const landlords = await storage.getUsersByRole(UserRole.LANDLORD);
      const tenants = await storage.getUsersByRole(UserRole.TENANT);
      const agencies = await storage.getUsersByRole(UserRole.AGENCY);
      const maintenanceProviders = await storage.getUsersByRole(UserRole.MAINTENANCE);
      
      console.log("=== Database User Status ===");
      console.log(`Landlords: ${landlords.length}`);
      console.log(`Tenants: ${tenants.length}`);
      console.log(`Agencies: ${agencies.length}`);
      console.log(`Maintenance Providers: ${maintenanceProviders.length}`);
      
      // Get some properties
      const properties = await storage.getProperties();
      console.log(`Properties: ${properties.length}`);
      
      // Get leases
      const leases = await storage.getLeasesByTenant(tenants[0]?.id || 0);
      console.log(`Leases for first tenant: ${leases.length}`);
      
      if (landlords.length > 0 && tenants.length > 0 && agencies.length > 0 && maintenanceProviders.length > 0) {
        console.log("Database contains users for all roles, skipping test user creation");
        return;
      }
    } catch (dbError) {
      console.error("Error connecting to database or retrieving users:", dbError);
      console.log("Will proceed with creating local test users");
    }
    
    // Check if basic test users already exist
    const existingLandlord = await storage.getUserByUsername("landlord");
    if (existingLandlord) {
      console.log("Test users already exist, skipping creation");
      return;
    }
    
    // Create landlord user
    await storage.createUser({
      username: "landlord",
      password: await hashPassword("password123"),
      firstName: "Kago",
      lastName: "Moagi",
      email: "kago.moagi@example.com",
      role: UserRole.LANDLORD,
      phone: "+267 71234567",
      profileImage: undefined
    });
    
    // Create tenant user
    await storage.createUser({
      username: "tenant",
      password: await hashPassword("password123"),
      firstName: "Tumelo",
      lastName: "Ndaba",
      email: "tumelo.ndaba@example.com",
      role: UserRole.TENANT,
      phone: "+267 72345678",
      profileImage: undefined
    });
    
    // Create agency user
    await storage.createUser({
      username: "agency",
      password: await hashPassword("password123"),
      firstName: "Lesego",
      lastName: "Tshwene",
      email: "lesego.tshwene@example.com",
      role: UserRole.AGENCY,
      phone: "+267 73456789",
      profileImage: undefined
    });
    
    // Create maintenance user
    await storage.createUser({
      username: "maintenance",
      password: await hashPassword("password123"),
      firstName: "Mpho",
      lastName: "Rampou",
      email: "mpho.rampou@example.com",
      role: UserRole.MAINTENANCE,
      phone: "+267 74567890",
      profileImage: undefined
    });
    
    console.log("Test users created successfully");
    
    // Verify users were created
    const landlord = await storage.getUserByUsername("landlord");
    const tenant = await storage.getUserByUsername("tenant");
    const agency = await storage.getUserByUsername("agency");
    const maintenance = await storage.getUserByUsername("maintenance");
    
    console.log("=== Test User Verification ===");
    console.log(`Landlord exists: ${Boolean(landlord)}`);
    console.log(`Tenant exists: ${Boolean(tenant)}`);
    console.log(`Agency exists: ${Boolean(agency)}`);
    console.log(`Maintenance exists: ${Boolean(maintenance)}`);
    
  } catch (error) {
    console.error("Error during database and user verification:", error);
  }
}

// Phase 1: Enhanced Server Startup with Error Handling
(async () => {
  try {
    console.log('🚀 Starting TOV Property Management Server...');
    
    console.log('📝 Registering routes...');
    const server = await registerRoutes(app);
    console.log('✅ Routes registered successfully');
    
    // Verify database and test users on server startup FIRST
    console.log('🔍 Verifying database and users...');
    try {
      await verifyDatabaseAndUsers();
      console.log('✅ Database verification completed');
    } catch (error) {
      console.error('❌ Database verification failed, but continuing server startup:', error);
    }
    
    // Sample data creation disabled for clean testing
    try {
      console.log("✅ Sample data creation disabled for clean testing");
      /*
      // ALL SAMPLE DATA CREATION COMMENTED OUT
      const sampleProperty1 = await storage.createProperty({
          propertyCategory: "residential",
          title: "Modern Apartment in Gaborone",
          description: "Beautiful 2-bedroom apartment in the heart of Gaborone",
          address: "123 Main Street",
          city: "Gaborone",
          state: "Gaborone",
          zipCode: "00000",
          location: "Gaborone",
          propertyType: "apartment",
          bedrooms: 2,
          bathrooms: 2,
          squareMeters: 120,
          rentAmount: 8000,
          securityDeposit: 8000,
          available: false,
          isListed: true, // Make sample properties visible for testing
          landlordId: landlord.id,
          images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
          amenities: ["Parking", "Security", "Garden"]
        });
        
        const sampleProperty2 = await storage.createProperty({
          propertyCategory: "residential",
          title: "Luxury House in Phakalane",
          description: "Spacious 4-bedroom house with garden and pool",
          address: "456 Luxury Lane",
          city: "Phakalane",
          state: "Gaborone",
          zipCode: "00000",
          location: "Phakalane",
          propertyType: "house",
          bedrooms: 4,
          bathrooms: 3,
          squareMeters: 250,
          rentAmount: 15000,
          securityDeposit: 15000,
          available: true,
          isListed: true, // Make sample properties visible for testing
          landlordId: landlord.id,
          images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500"],
          amenities: ["Pool", "Garden", "Security", "Parking"]
        });
        
        console.log("Sample properties created:", sampleProperty1.id, sampleProperty2.id);
        
        // Create sample lease for tenant
        const tenant = await storage.getUserByUsername("tenant");
        if (tenant) {
          const activeLease = await storage.createLease({
            tenantId: tenant.id,
            propertyId: sampleProperty1.id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-01-01'),
            rentAmount: sampleProperty1.rentAmount,
            securityDeposit: sampleProperty1.securityDeposit,
            active: true,
            status: 'active',
            documentUrl: undefined
          });
          console.log("Sample active lease created:", activeLease.id);
          
          // Create sample payments for the lease
          const samplePayments = [
            {
              tenantId: tenant.id,
              leaseId: activeLease.id,
              amount: activeLease.rentAmount,
              paymentDate: new Date('2024-10-01'),
              status: 'paid' as const,
              paymentMethod: 'Credit Card',
              paymentType: 'rent',
              transactionId: 'TXN001'
            },
            {
              tenantId: tenant.id,
              leaseId: activeLease.id,
              amount: activeLease.rentAmount,
              paymentDate: new Date('2024-11-01'),
              status: 'paid' as const,
              paymentMethod: 'Bank Transfer',
              paymentType: 'rent',
              transactionId: 'TXN002'
            },
            {
              tenantId: tenant.id,
              leaseId: activeLease.id,
              amount: activeLease.rentAmount,
              paymentDate: new Date('2024-12-01'),
              status: 'pending' as const,
              paymentMethod: 'Credit Card',
              paymentType: 'rent',
              transactionId: 'TXN003'
            }
          ];
          
          for (const paymentData of samplePayments) {
            const payment = await storage.createPayment(paymentData);
            console.log("Sample payment created:", payment.id);
          }
        }
      } else {
        console.log("Properties already exist, skipping sample data creation");
        
        // Still check and create lease if needed
        const tenant = await storage.getUserByUsername("tenant");
        const existingLeases = tenant ? await storage.getLeasesByTenant(tenant.id) : [];
        
        if (tenant && existingLeases.length === 0) {
          const properties = await storage.getProperties();
          if (properties.length > 0) {
            const activeLease = await storage.createLease({
              tenantId: tenant.id,
              propertyId: properties[0].id,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2025-01-01'),
              rentAmount: properties[0].rentAmount,
              securityDeposit: properties[0].securityDeposit,
              active: true,
              status: 'active',
              documentUrl: undefined
            });
            console.log("Sample active lease created for existing property:", activeLease.id);
            
            // Create sample payments for the existing property lease
            const samplePayments = [
              {
                tenantId: tenant.id,
                leaseId: activeLease.id,
                amount: activeLease.rentAmount,
                paymentDate: new Date('2024-10-01'),
                status: 'paid' as const,
                paymentMethod: 'Credit Card',
                transactionId: 'TXN001'
              },
              {
                tenantId: tenant.id,
                leaseId: activeLease.id,
                amount: activeLease.rentAmount,
                paymentDate: new Date('2024-11-01'),
                status: 'paid' as const,
                paymentMethod: 'Bank Transfer',
                transactionId: 'TXN002'
              },
              {
                tenantId: tenant.id,
                leaseId: activeLease.id,
                amount: activeLease.rentAmount,
                paymentDate: new Date('2024-12-01'),
                status: 'pending' as const,
                paymentMethod: 'Credit Card',
                transactionId: 'TXN003'
              }
            ];
            
            for (const paymentData of samplePayments) {
              const payment = await storage.createPayment(paymentData);
              console.log("Sample payment created for existing property:", payment.id);
            }
          }
        }
      }
      */ 
      // End of commented sample data
    } catch (error) {
      console.error("Error with sample data (disabled):", error);
    }

    // Initialize WebSocket notification service
    initializeNotificationService(server);

    // Initialize workflow and monitoring systems
    console.log('🔧 Initializing workflow engine and monitoring systems...');
    
    // Log system startup
    await auditLogger.logSystemAction(
      'system_startup',
      {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3003
      },
      true
    );

    console.log('✅ Workflow engine and monitoring systems initialized');

    const port = process.env.PORT || 3003;
    server.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`🌐 Health check: http://localhost:${port}/api/health`);
      console.log(`📊 Server status: http://localhost:${port}/api/status`);
      console.log(`🔗 API base URL: http://localhost:${port}/api`);
      console.log(`🔔 WebSocket notifications: ws://localhost:${port}/ws/notifications`);
    });

    // Phase 1: Graceful Shutdown Handling
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
})();
