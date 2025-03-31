import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { hashPassword } from "./utils";
import { storage } from "./storage";
import { UserRole } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

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
      profileImage: null
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
      profileImage: null
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
      profileImage: null
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
      profileImage: null
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

(async () => {
  const server = await registerRoutes(app);
  
  // Verify database and test users on server startup
  await verifyDatabaseAndUsers();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error details:', err);
    
    // Check if headers have already been sent
    if (res.headersSent) {
      return _next(err);
    }
    
    // Handle different error types
    if (err.name === 'UnauthorizedError' || err.status === 401) {
      return res.status(401).json({
        message: 'Unauthorized access: Please login to access this resource'
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors || 'Invalid data provided'
      });
    }
    
    if (err.name === 'NotFoundError' || err.status === 404) {
      return res.status(404).json({
        message: err.message || 'Resource not found'
      });
    }
    
    // Generic error handling
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    return res.status(status).json({
      message,
      error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.toString()
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
