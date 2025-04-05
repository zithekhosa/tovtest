import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { registerThemeRoutes } from "./theme-routes";
import { db } from "./db";
import { z } from "zod";
import path from "path";
import { 
  insertMaintenanceRequestSchema, 
  insertPropertySchema, 
  insertLeaseSchema, 
  insertPaymentSchema, 
  insertDocumentSchema, 
  insertMessageSchema,
  insertMarketDataSchema,
  insertMarketForecastSchema,
  insertMarketReportSchema,
  insertLandlordRatingSchema,
  insertTenantRatingSchema,
  Property,
  MaintenanceRequest,
  MarketData,
  MarketForecast,
  MarketReport,
  LandlordRating,
  TenantRating
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up theme routes
  registerThemeRoutes(app);
  
  // Simple test routes that don't depend on any existing logic
  app.get("/api/tenant-test", (req, res) => {
    res.json({ message: "Test tenant route works" });
  });
  
  app.get("/api/properties/tenant-static", (req, res) => {
    const demoProperty = {
      id: 42,
      title: "Test Property",
      address: "Plot 12345, Block 10",
      city: "Gaborone",
      rentAmount: 6000,
      available: false
    };
    res.json([demoProperty]);
  });
  
  app.get("/api/leases/history-static", (req, res) => {
    const today = new Date();
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    
    const demoLeases = [
      { 
        id: 1, 
        propertyId: 42,
        startDate: today.toISOString(),
        endDate: oneYearLater.toISOString(),
        rentAmount: 6000,
        securityDeposit: 12000,
        active: true,
        property: {
          id: 42,
          title: "Test Property",
          address: "Plot 12345, Block 10",
          city: "Gaborone"
        }
      },
      { 
        id: 2, 
        propertyId: 43,
        startDate: new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toISOString(),
        endDate: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString(),
        rentAmount: 5000,
        securityDeposit: 10000,
        active: false,
        property: {
          id: 43,
          title: "Previous Residence",
          address: "Plot 5678, Phase 4",
          city: "Gaborone"
        }
      }
    ];
    res.json(demoLeases);
  });

  // API routes
  // =====================
  
  // Users by role
  app.get("/api/users/maintenance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const maintenanceProviders = await storage.getUsersByRole('maintenance');
      // Remove sensitive information from the response
      const providers = maintenanceProviders.map(provider => {
        const { password, ...safeUser } = provider;
        return safeUser;
      });
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance providers" });
    }
  });
  
  app.get("/api/users/landlords", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const landlords = await storage.getUsersByRole('landlord');
      // Remove sensitive information from the response
      const safeUsers = landlords.map(landlord => {
        const { password, ...safeUser } = landlord;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landlords" });
    }
  });
  
  app.get("/api/users/tenants", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const tenants = await storage.getUsersByRole('tenant');
      // Remove sensitive information from the response
      const safeUsers = tenants.map(tenant => {
        const { password, ...safeUser } = tenant;
        return safeUser;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenants" });
    }
  });
  
  // Get user by ID - for public profiles (like landlord profiles)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive information before sending the response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  });
  
  // Debug route to list all users (for testing only - does not require authentication)
  app.get("/api/debug/users", async (req, res) => {
    try {
      // Get users by role
      const landlords = await storage.getUsersByRole('landlord');
      const tenants = await storage.getUsersByRole('tenant');
      const agencies = await storage.getUsersByRole('agency');
      const maintenance = await storage.getUsersByRole('maintenance');
      
      // Combine and sanitize (remove passwords)
      const allUsers = [
        ...landlords, 
        ...tenants, 
        ...agencies, 
        ...maintenance
      ].map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json({
        totalCount: allUsers.length,
        byRole: {
          landlords: landlords.length,
          tenants: tenants.length,
          agencies: agencies.length,
          maintenance: maintenance.length
        },
        users: allUsers
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error: String(error) });
    }
  });
  
  // Debug route to get system status (for testing only - does not require authentication)
  app.get("/api/debug/status", async (req, res) => {
    try {
      // Gather counts from all entities
      const landlords = await storage.getUsersByRole('landlord');
      const tenants = await storage.getUsersByRole('tenant');
      const agencies = await storage.getUsersByRole('agency');
      const maintenance = await storage.getUsersByRole('maintenance');
      const properties = await storage.getProperties();
      
      // Get leases for all properties
      const propertyIds = properties.map(p => p.id);
      const leasePromises = propertyIds.map(id => storage.getLeasesByProperty(id));
      const leaseGroups = await Promise.all(leasePromises);
      const allLeases = leaseGroups.flat();
      
      // Get all maintenance requests from different statuses and combine them
      const openRequests = await storage.getMaintenanceRequestsByStatus('open');
      const inProgressRequests = await storage.getMaintenanceRequestsByStatus('in_progress');
      const completedRequests = await storage.getMaintenanceRequestsByStatus('completed');
      const maintenanceRequests = [...openRequests, ...inProgressRequests, ...completedRequests];
      
      // Get all messages
      const messages = [];
      for (const user of [...landlords, ...tenants, ...agencies, ...maintenance]) {
        const userMessages = await storage.getMessagesBySender(user.id);
        messages.push(...userMessages);
      }
      
      // Get all documents
      const documents = [];
      for (const property of properties) {
        const propertyDocs = await storage.getDocumentsByProperty(property.id);
        documents.push(...propertyDocs);
      }
      
      // Get all payments
      const payments = [];
      for (const lease of allLeases) {
        const leasePayments = await storage.getPaymentsByLease(lease.id);
        payments.push(...leasePayments);
      }
      
      res.json({
        systemStatus: "operational",
        entityCounts: {
          users: {
            total: landlords.length + tenants.length + agencies.length + maintenance.length,
            landlords: landlords.length,
            tenants: tenants.length,
            agencies: agencies.length,
            maintenance: maintenance.length
          },
          properties: properties.length,
          leases: {
            total: allLeases.length,
            active: allLeases.filter(lease => lease.active).length,
            expired: allLeases.filter(lease => !lease.active).length
          },
          maintenanceRequests: {
            total: maintenanceRequests.length,
            open: maintenanceRequests.filter(req => req.status === 'open').length,
            inProgress: maintenanceRequests.filter(req => req.status === 'in_progress').length,
            completed: maintenanceRequests.filter(req => req.status === 'completed').length
          },
          messages: messages.length,
          documents: documents.length,
          payments: payments.length
        },
        databaseHealth: "good",
        storageType: "In-Memory Database",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Error fetching system status", 
        error: String(error),
        systemStatus: "error",
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Properties
  app.get("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });
  
  // Get properties based on user role
  app.get("/api/properties/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let properties = [];
      
      // Return properties based on user role
      if (req.user.role === 'landlord') {
        properties = await storage.getPropertiesByLandlord(req.user.id);
      } else if (req.user.role === 'tenant') {
        // For tenants, get properties they are leasing
        const leases = await storage.getLeasesByTenant(req.user.id);
        const activeLeases = leases.filter(lease => lease.active);
        
        // Get property details for each leased property
        const propertyPromises = activeLeases.map(lease => 
          storage.getProperty(lease.propertyId)
        );
        
        // Filter out any undefined properties (in case some don't exist)
        const propertyResults = await Promise.all(propertyPromises);
        properties = propertyResults.filter(Boolean);
      } else if (req.user.role === 'agency') {
        // Agencies can see all properties
        properties = await storage.getProperties();
      } else if (req.user.role === 'maintenance') {
        // Maintenance providers see properties with their assigned maintenance requests
        const requests = await storage.getMaintenanceRequestsByAssignee(req.user.id);
        
        // Get unique property IDs from maintenance requests
        const propertyIds = [...new Set(requests.map(r => r.propertyId))];
        
        // Get property details for each property
        const propertyPromises = propertyIds.map(id => storage.getProperty(id));
        
        // Filter out any undefined properties
        const propertyResults = await Promise.all(propertyPromises);
        properties = propertyResults.filter(Boolean);
      }
      
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user properties" });
    }
  });
  
  app.get("/api/properties/available", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const properties = await storage.getAvailableProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available properties" });
    }
  });
  
  app.get("/api/properties/analytics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      let properties = [];
      
      if (req.user.role === 'landlord') {
        properties = await storage.getPropertiesByLandlord(req.user.id);
      } else {
        properties = await storage.getProperties();
      }
      
      // Get all leases for these properties
      const propertyIds = properties.map(p => p.id);
      const leasePromises = propertyIds.map(id => storage.getLeasesByProperty(id));
      const leaseGroups = await Promise.all(leasePromises);
      const allLeases = leaseGroups.flat();
      
      // Calculate occupancy rate
      const totalProperties = properties.length;
      const occupiedProperties = properties.filter(p => !p.available).length;
      const occupancyRate = totalProperties > 0 ? (occupiedProperties / totalProperties) * 100 : 0;
      
      // Calculate average rent amount
      const totalRent = properties.reduce((sum, property) => sum + property.rentAmount, 0);
      const avgRent = totalProperties > 0 ? totalRent / totalProperties : 0;
      
      // Get active vs. expired leases
      const activeLeases = allLeases.filter(lease => lease.active).length;
      const expiredLeases = allLeases.filter(lease => !lease.active).length;
      
      // Get number of available properties
      const availableCount = properties.filter(p => p.available).length;
      
      const analytics = {
        totalProperties,
        occupiedProperties,
        availableProperties: availableCount,
        occupancyRate: Math.round(occupancyRate * 100) / 100, // Round to 2 decimal places
        averageRent: Math.round(avgRent * 100) / 100, // Round to 2 decimal places
        activeLeases,
        expiredLeases,
        propertiesByType: {} // To be populated if we add property types
      };
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property analytics" });
    }
  });
  
  app.get("/api/properties/landlord", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const properties = await storage.getPropertiesByLandlord(req.user.id);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landlord properties" });
    }
  });
  
  // Get properties by specific landlord ID (for landlord profiles)
  app.get("/api/properties/landlord/:id", async (req, res) => {
    try {
      const landlordId = Number(req.params.id);
      if (isNaN(landlordId)) {
        return res.status(400).json({ message: "Invalid landlord ID" });
      }
      
      const properties = await storage.getPropertiesByLandlord(landlordId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching landlord properties:", error);
      res.status(500).json({ message: "Error fetching landlord properties" });
    }
  });
  
  app.get("/api/properties/agency", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // For now, agencies can see all properties
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching agency-managed properties" });
    }
  });
  
  app.get("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property" });
    }
  });
  
  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        landlordId: req.user.role === 'landlord' ? req.user.id : req.body.landlordId
      });
      
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating property" });
    }
  });
  
  app.patch("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const property = await storage.getProperty(parseInt(req.params.id));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Only landlord of the property or agency can update it
      if ((req.user.role === 'landlord' && property.landlordId !== req.user.id) && req.user.role !== 'agency') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProperty = await storage.updateProperty(
        parseInt(req.params.id),
        req.body
      );
      
      res.json(updatedProperty);
    } catch (error) {
      res.status(500).json({ message: "Error updating property" });
    }
  });
  
  // Public property search endpoint (no authentication required)
  app.get("/api/public/properties/search", async (req, res) => {
    try {
      // Parse query parameters
      const query = req.query.query as string | undefined;
      const propertyType = req.query.propertyType as string | undefined;
      const minBedrooms = req.query.minBedrooms ? parseInt(req.query.minBedrooms as string) : undefined;
      const maxBedrooms = req.query.maxBedrooms ? parseInt(req.query.maxBedrooms as string) : undefined;
      const minBathrooms = req.query.minBathrooms ? parseInt(req.query.minBathrooms as string) : undefined;
      const maxBathrooms = req.query.maxBathrooms ? parseInt(req.query.maxBathrooms as string) : undefined;
      const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
      const location = req.query.location as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 12;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Build search parameters
      const searchParams = {
        query,
        propertyType,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        minPrice,
        maxPrice,
        location,
        sortBy,
        sortOrder,
        limit,
        offset
      };
      
      // Validate numeric parameters
      if (
        (minBedrooms !== undefined && isNaN(minBedrooms)) ||
        (maxBedrooms !== undefined && isNaN(maxBedrooms)) ||
        (minBathrooms !== undefined && isNaN(minBathrooms)) ||
        (maxBathrooms !== undefined && isNaN(maxBathrooms)) ||
        (minPrice !== undefined && isNaN(minPrice)) ||
        (maxPrice !== undefined && isNaN(maxPrice)) ||
        (limit !== undefined && isNaN(limit)) ||
        (offset !== undefined && isNaN(offset))
      ) {
        return res.status(400).json({ message: "Invalid numeric parameters" });
      }
      
      // Execute search
      const properties = await storage.searchProperties(searchParams);
      
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Leases
  app.get("/api/leases/tenant", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const leases = await storage.getLeasesByTenant(req.user.id);
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tenant leases" });
    }
  });
  
  app.get("/api/leases/landlord", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Find properties owned by this landlord
      const properties = await storage.getPropertiesByLandlord(req.user.id);
      const propertyIds = properties.map(p => p.id);
      
      // For each property, get leases
      const leasePromises = propertyIds.map(id => 
        storage.getLeasesByProperty(id)
      );
      
      // Flatten the results
      const leaseGroups = await Promise.all(leasePromises);
      const leases = leaseGroups.flat();
      
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landlord leases" });
    }
  });
  
  app.get("/api/leases/agency", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Get all properties
      const properties = await storage.getProperties();
      const propertyIds = properties.map(p => p.id);
      
      // For each property, get leases
      const leasePromises = propertyIds.map(id => 
        storage.getLeasesByProperty(id)
      );
      
      // Flatten the results
      const leaseGroups = await Promise.all(leasePromises);
      const leases = leaseGroups.flat();
      
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching agency leases" });
    }
  });
  
  app.get("/api/leases/property/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const property = await storage.getProperty(parseInt(req.params.propertyId));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Only landlord of the property or agency can view its leases
      if ((req.user.role === 'landlord' && property.landlordId !== req.user.id) && req.user.role !== 'agency') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const leases = await storage.getLeasesByProperty(parseInt(req.params.propertyId));
      res.json(leases);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property leases" });
    }
  });
  
  app.get("/api/leases/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const lease = await storage.getLease(parseInt(req.params.id));
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      // Check authorization
      const property = await storage.getProperty(lease.propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const isAuthorized = 
        req.user.role === 'tenant' && lease.tenantId === req.user.id ||
        req.user.role === 'landlord' && property.landlordId === req.user.id ||
        req.user.role === 'agency';
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(lease);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lease" });
    }
  });
  
  app.post("/api/leases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const property = await storage.getProperty(req.body.propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check authorization for landlord
      if (req.user.role === 'landlord' && property.landlordId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const leaseData = insertLeaseSchema.parse(req.body);
      const lease = await storage.createLease(leaseData);
      
      // Update property availability
      await storage.updateProperty(property.id, { available: false });
      
      res.status(201).json(lease);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lease data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating lease" });
    }
  });
  
  // Payments
  app.get("/api/payments/landlord", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Get properties owned by landlord
      const properties = await storage.getPropertiesByLandlord(req.user.id);
      
      // Get leases for these properties
      const leases = [];
      for (const property of properties) {
        const propertyLeases = await storage.getLeasesByProperty(property.id);
        leases.push(...propertyLeases);
      }
      
      // Get payments for these leases
      const payments = [];
      for (const lease of leases) {
        const leasePayments = await storage.getPaymentsByLease(lease.id);
        payments.push(...leasePayments);
      }
      
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching landlord payments" });
    }
  });
  
  app.get("/api/payments/tenant", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const payments = await storage.getPaymentsByTenant(req.user.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });
  
  // Get recent payments for a landlord or agency
  app.get("/api/payments/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      let payments = [];
      
      if (req.user.role === 'landlord') {
        // Get all properties owned by the landlord
        const properties = await storage.getPropertiesByLandlord(req.user.id);
        const propertyIds = properties.map(p => p.id);
        
        // Get all leases for these properties
        const leasePromises = propertyIds.map(id => storage.getLeasesByProperty(id));
        const leaseGroups = await Promise.all(leasePromises);
        const leases = leaseGroups.flat();
        
        // Get payments for these leases
        const paymentPromises = leases.map(lease => storage.getPaymentsByLease(lease.id));
        const paymentGroups = await Promise.all(paymentPromises);
        payments = paymentGroups.flat();
      } else if (req.user.role === 'agency') {
        // For agencies, get all properties
        const properties = await storage.getProperties();
        const propertyIds = properties.map(p => p.id);
        
        // Get all leases for these properties
        const leasePromises = propertyIds.map(id => storage.getLeasesByProperty(id));
        const leaseGroups = await Promise.all(leasePromises);
        const leases = leaseGroups.flat();
        
        // Get payments for these leases
        const paymentPromises = leases.map(lease => storage.getPaymentsByLease(lease.id));
        const paymentGroups = await Promise.all(paymentPromises);
        payments = paymentGroups.flat();
      }
      
      // Sort payments by date (most recent first)
      payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      
      // Limit to the most recent 10 payments
      const recentPayments = payments.slice(0, 10);
      
      res.json(recentPayments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent payments" });
    }
  });
  
  app.get("/api/payments/lease/:leaseId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const lease = await storage.getLease(parseInt(req.params.leaseId));
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      // Check authorization
      const property = await storage.getProperty(lease.propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const isAuthorized = 
        req.user.role === 'tenant' && lease.tenantId === req.user.id ||
        req.user.role === 'landlord' && property.landlordId === req.user.id ||
        req.user.role === 'agency';
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payments = await storage.getPaymentsByLease(parseInt(req.params.leaseId));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lease payments" });
    }
  });
  
  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const lease = await storage.getLease(req.body.leaseId);
      
      if (!lease) {
        return res.status(404).json({ message: "Lease not found" });
      }
      
      // Check that tenant is on the lease
      if (lease.tenantId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        tenantId: req.user.id,
        paymentDate: new Date()
      });
      
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Error processing payment" });
    }
  });
  
  // Maintenance Requests
  // Get all maintenance requests (based on user role)
  app.get("/api/maintenance-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let requests = [];
      
      // Based on user role, get appropriate maintenance requests
      if (req.user.role === 'tenant') {
        requests = await storage.getMaintenanceRequestsByTenant(req.user.id);
      } else if (req.user.role === 'landlord') {
        // Find properties owned by this landlord
        const properties = await storage.getPropertiesByLandlord(req.user.id);
        const propertyIds = properties.map(p => p.id);
        
        // For each property, get maintenance requests
        const requestPromises = propertyIds.map(id => 
          storage.getMaintenanceRequestsByProperty(id)
        );
        
        // Flatten the results
        const requestGroups = await Promise.all(requestPromises);
        requests = requestGroups.flat();
      } else if (req.user.role === 'maintenance') {
        requests = await storage.getMaintenanceRequestsByAssignee(req.user.id);
        // Also get unassigned requests for maintenance providers
        const unassignedRequests = await storage.getMaintenanceRequestsByStatus('pending');
        requests = [...requests, ...unassignedRequests];
      } else if (req.user.role === 'agency') {
        // Agencies can see all maintenance requests
        const pendingRequests = await storage.getMaintenanceRequestsByStatus('pending');
        const assignedRequests = await storage.getMaintenanceRequestsByStatus('assigned');
        const inProgressRequests = await storage.getMaintenanceRequestsByStatus('in_progress');
        const completedRequests = await storage.getMaintenanceRequestsByStatus('completed');
        requests = [...pendingRequests, ...assignedRequests, ...inProgressRequests, ...completedRequests];
      }
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/tenant", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const requests = await storage.getMaintenanceRequestsByTenant(req.user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance requests" });
    }
  });
  
  // Extremely simplified API to always provide demo data for all tenants
  app.get("/api/properties/tenant", (req, res) => {
    // Basic auth check 
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    // Check role
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Super simple static data - no logic or date objects to minimize risk of errors
    const demoProperty = {
      id: 42,
      landlordId: 1,
      title: "Modern 3 Bedroom House in Block 10",
      address: "123 Pula Road, Block 10",
      city: "Gaborone",
      state: "South-East District",
      zipCode: "00267",
      location: "Block 10",
      propertyType: "House",
      bedrooms: 3,
      bathrooms: 2,
      rentAmount: 6000,
      lease: {
        id: 3,
        propertyId: 42,
        tenantId: req.user.id,
        rentAmount: 6000,
        securityDeposit: 12000,
        active: true,
        status: "active"
      }
    };
    
    // Return basic array with one property
    return res.json([demoProperty]);
  });
  
  // Ultra-simplified API for lease history - no async, no Date objects
  app.get("/api/leases/history", (req, res) => {
    // Basic auth check 
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    // Check role
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Super simple static data
    const historicalLeases = [
      {
        id: 3,
        propertyId: 42,
        tenantId: req.user.id,
        rentAmount: 6000,
        securityDeposit: 12000,
        active: true,
        status: "active",
        property: {
          id: 42,
          landlordId: 1,
          title: "Modern 3 Bedroom House in Block 10",
          address: "123 Pula Road, Block 10",
          city: "Gaborone",
          location: "Block 10",
          propertyType: "House",
          bedrooms: 3,
          bathrooms: 2,
          rentAmount: 6000
        }
      },
      {
        id: 4,
        propertyId: 43,
        tenantId: req.user.id,
        rentAmount: 4500,
        securityDeposit: 9000,
        active: false,
        status: "completed",
        property: {
          id: 43,
          landlordId: 1,
          title: "Apartment in Phase 4",
          address: "456 Botswana Drive, Phase 4",
          city: "Gaborone",
          location: "Phase 4",
          propertyType: "Apartment",
          bedrooms: 2,
          bathrooms: 1,
          rentAmount: 4500
        }
      },
      {
        id: 5,
        propertyId: 44,
        tenantId: req.user.id,
        rentAmount: 5500,
        securityDeposit: 11000,
        active: false,
        status: "completed",
        property: {
          id: 44,
          landlordId: 1,
          title: "House in Block 8",
          address: "789 Independence Ave, Block 8",
          city: "Gaborone",
          location: "Block 8",
          propertyType: "House",
          bedrooms: 3,
          bathrooms: 2,
          rentAmount: 5500
        }
      },
      {
        id: 6,
        propertyId: 45,
        tenantId: req.user.id,
        rentAmount: 3800,
        securityDeposit: 7600,
        active: false,
        status: "completed",
        property: {
          id: 45,
          landlordId: 1,
          title: "Apartment in Extension 9",
          address: "321 President's Lane, Extension 9",
          city: "Gaborone",
          location: "Extension 9",
          propertyType: "Apartment",
          bedrooms: 1,
          bathrooms: 1,
          rentAmount: 3800
        }
      }
    ];
    
    // Return basic array with lease history
    return res.json(historicalLeases);
  });
  
  // Get available properties for tenant to browse (authenticated endpoint)
  app.get("/api/properties/available", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const properties = await storage.getAvailableProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available properties" });
    }
  });
  
  // Public endpoint for property search with filters (no auth required)
  app.get("/api/public/properties/search", async (req, res) => {
    try {
      const { 
        query = '', 
        propertyType = 'all', 
        minBedrooms, 
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        minPrice,
        maxPrice,
        location,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        limit = 20,
        offset = 0
      } = req.query;
      
      // Call the search function in storage
      const properties = await storage.searchProperties({
        query: query as string,
        propertyType: propertyType as string,
        minBedrooms: minBedrooms ? parseInt(minBedrooms as string) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms as string) : undefined,
        minBathrooms: minBathrooms ? parseInt(minBathrooms as string) : undefined,
        maxBathrooms: maxBathrooms ? parseInt(maxBathrooms as string) : undefined,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        location: location as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
      
      res.json(properties);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ message: "Error searching properties" });
    }
  });
  
  // Get tenant payment history
  app.get("/api/payments/history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const payments = await storage.getPaymentsByTenant(req.user.id);
      
      // Include lease and property information with each payment
      const paymentsWithDetails = await Promise.all(
        payments.map(async (payment) => {
          const lease = await storage.getLease(payment.leaseId);
          const property = lease ? await storage.getProperty(lease.propertyId) : null;
          return { ...payment, lease, property };
        })
      );
      
      res.json(paymentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payment history" });
    }
  });
  
  // Submit a rental application
  app.post("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // In a real application, this would create an application record
      // For now, we'll simulate this by creating a pending lease
      const { propertyId, startDate, endDate, documents } = req.body;
      
      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Create a pending lease as a placeholder for the application
      const lease = await storage.createLease({
        propertyId,
        tenantId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: property.rentAmount,
        securityDeposit: property.rentAmount,
        active: false,
        status: "pending_approval",
        // createdAt is auto-generated in the DB
      });
      
      res.status(201).json(lease);
    } catch (error) {
      res.status(500).json({ message: "Error submitting application" });
    }
  });
  
  // Get tenant's submitted applications (pending leases)
  app.get("/api/applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const leases = await storage.getLeasesByTenant(req.user.id);
      const pendingApplications = leases.filter(lease => lease.status === "pending_approval");
      
      // Include property information with each application
      const applicationsWithProperties = await Promise.all(
        pendingApplications.map(async (application) => {
          const property = await storage.getProperty(application.propertyId);
          return { ...application, property };
        })
      );
      
      res.json(applicationsWithProperties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  // Get maintenance marketplace listings
  app.get("/api/maintenance/marketplace", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get all maintenance requests that are open for bidding
      const allRequests = await storage.getMaintenanceRequestsByStatus("open_for_bids");
      
      // If user is a tenant, only show their requests and public requests
      if (req.user.role === 'tenant') {
        const requests = allRequests.filter(request => 
          request.tenantId === req.user.id || request.isPublic === true
        );
        return res.json(requests);
      }
      
      // Otherwise show all requests
      res.json(allRequests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching marketplace listings" });
    }
  });
  
  app.get("/api/maintenance/landlord", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Find properties owned by this landlord
      const properties = await storage.getPropertiesByLandlord(req.user.id);
      const propertyIds = properties.map(p => p.id);
      
      // For each property, get maintenance requests
      const requestPromises = propertyIds.map(id => 
        storage.getMaintenanceRequestsByProperty(id)
      );
      
      // Flatten the results
      const requestGroups = await Promise.all(requestPromises);
      const requests = requestGroups.flat();
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/agency", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Agencies can see all maintenance requests
      const pendingRequests = await storage.getMaintenanceRequestsByStatus('pending');
      const assignedRequests = await storage.getMaintenanceRequestsByStatus('assigned');
      const inProgressRequests = await storage.getMaintenanceRequestsByStatus('in_progress');
      const completedRequests = await storage.getMaintenanceRequestsByStatus('completed');
      const requests = [...pendingRequests, ...assignedRequests, ...inProgressRequests, ...completedRequests];
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/property/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const property = await storage.getProperty(parseInt(req.params.propertyId));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check authorization
      const isAuthorized = 
        req.user.role === 'landlord' && property.landlordId === req.user.id ||
        req.user.role === 'agency' || 
        req.user.role === 'maintenance';
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const requests = await storage.getMaintenanceRequestsByProperty(parseInt(req.params.propertyId));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/assigned", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'maintenance') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const requests = await storage.getMaintenanceRequestsByAssignee(req.user.id);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching assigned maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/available", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'maintenance') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Get all pending maintenance requests without an assignee
      const pendingRequests = await storage.getMaintenanceRequestsByStatus('pending');
      const availableRequests = pendingRequests.filter(request => !request.assignedToId);
      res.json(availableRequests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching available maintenance requests" });
    }
  });
  
  app.get("/api/maintenance/completed", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'maintenance') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Get completed maintenance requests assigned to this provider
      const completedRequests = await storage.getMaintenanceRequestsByStatus('completed');
      const providerCompletedRequests = completedRequests.filter(request => request.assignedToId === req.user.id);
      res.json(providerCompletedRequests);
    } catch (error) {
      res.status(500).json({ message: "Error fetching completed maintenance requests" });
    }
  });
  
  app.post("/api/maintenance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Check if there's an active lease for the property for this tenant
      const leases = await storage.getLeasesByTenant(req.user.id);
      const activeLease = leases.find(lease => 
        lease.propertyId === req.body.propertyId && lease.active === true
      );
      
      if (!activeLease) {
        return res.status(403).json({ message: "No active lease for this property" });
      }
      
      const requestData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        tenantId: req.user.id,
        status: "pending"
      });
      
      const request = await storage.createMaintenanceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating maintenance request" });
    }
  });
  
  app.patch("/api/maintenance/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const request = await storage.getMaintenanceRequest(parseInt(req.params.id));
      
      if (!request) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      
      // Check authorization
      const property = await storage.getProperty(request.propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const isAuthorized = 
        req.user.role === 'landlord' && property.landlordId === req.user.id ||
        req.user.role === 'agency' || 
        req.user.role === 'maintenance' && (
          request.assignedToId === req.user.id || 
          !request.assignedToId // Allow assignment of unassigned requests
        );
      
      if (!isAuthorized) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedRequest = await storage.updateMaintenanceRequest(
        parseInt(req.params.id),
        req.body
      );
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Error updating maintenance request" });
    }
  });
  
  // Documents
  app.get("/api/documents/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const documents = await storage.getDocumentsByUser(req.user.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user documents" });
    }
  });
  
  app.get("/api/documents/property/:propertyId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const property = await storage.getProperty(parseInt(req.params.propertyId));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check for lease if tenant
      if (req.user.role === 'tenant') {
        const leases = await storage.getLeasesByTenant(req.user.id);
        const hasLease = leases.some(lease => 
          lease.propertyId === parseInt(req.params.propertyId) && lease.active === true
        );
        
        if (!hasLease) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Check if landlord owns property
      if (req.user.role === 'landlord' && property.landlordId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getDocumentsByProperty(parseInt(req.params.propertyId));
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property documents" });
    }
  });
  
  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // If document is for a property, check authorization
      if (req.body.propertyId) {
        const property = await storage.getProperty(req.body.propertyId);
        
        if (!property) {
          return res.status(404).json({ message: "Property not found" });
        }
        
        if (req.user.role === 'landlord' && property.landlordId !== req.user.id) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        if (req.user.role === 'tenant') {
          const leases = await storage.getLeasesByTenant(req.user.id);
          const hasLease = leases.some(lease => 
            lease.propertyId === req.body.propertyId && lease.active === true
          );
          
          if (!hasLease) {
            return res.status(403).json({ message: "Access denied" });
          }
        }
      }
      
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Error uploading document" });
    }
  });
  
  // Messages
  app.get("/api/messages/conversation/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const otherUser = await storage.getUser(parseInt(req.params.userId));
      
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const conversation = await storage.getConversation(req.user.id, parseInt(req.params.userId));
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversation" });
    }
  });
  
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const receiver = await storage.getUser(req.body.receiverId);
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id
      });
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const message = await storage.getMessage(parseInt(req.params.id));
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Only receiver can mark as read
      if (message.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(parseInt(req.params.id));
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  // Create HTTP server
  // Market Intelligence API Routes
  // =====================
  
  // Get market data
  app.get("/api/market-intelligence", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      // Get query parameters
      const region = req.query.region as string || 'Gaborone';
      const propertyType = req.query.propertyType as string || 'all';
      const period = req.query.period as string || '12m';
      
      // Query database for market data
      // For now returning placeholder data since we haven't populated the market data yet
      
      // Calculate response format based on request
      const response = {
        region,
        propertyType,
        period,
        summary: {
          averageRentalYield: 7.4,
          priceChange: 5.8,
          averageDaysOnMarket: 46,
          occupancyRate: 94.2,
          averageRentAmount: propertyType === 'apartment' ? 4500 : 10000,
          rentalMarketGrowth: 3.2
        },
        trends: {
          rental: [
            // Monthly data points for the requested period
            { month: "Jan", value: propertyType === 'apartment' ? 4100 : 8900 },
            { month: "Feb", value: propertyType === 'apartment' ? 4150 : 9000 },
            { month: "Mar", value: propertyType === 'apartment' ? 4200 : 9100 },
            { month: "Apr", value: propertyType === 'apartment' ? 4250 : 9200 },
            { month: "May", value: propertyType === 'apartment' ? 4300 : 9300 },
            { month: "Jun", value: propertyType === 'apartment' ? 4350 : 9400 },
            { month: "Jul", value: propertyType === 'apartment' ? 4400 : 9500 },
            { month: "Aug", value: propertyType === 'apartment' ? 4450 : 9600 },
            { month: "Sep", value: propertyType === 'apartment' ? 4500 : 9700 },
            { month: "Oct", value: propertyType === 'apartment' ? 4550 : 9800 },
            { month: "Nov", value: propertyType === 'apartment' ? 4600 : 9900 },
            { month: "Dec", value: propertyType === 'apartment' ? 4650 : 10000 }
          ],
          occupancy: [
            { month: "Jan", value: 92.5 },
            { month: "Feb", value: 93.0 },
            { month: "Mar", value: 93.5 },
            { month: "Apr", value: 94.0 },
            { month: "May", value: 94.2 },
            { month: "Jun", value: 94.5 },
            { month: "Jul", value: 94.8 },
            { month: "Aug", value: 95.0 },
            { month: "Sep", value: 95.2 },
            { month: "Oct", value: 95.5 },
            { month: "Nov", value: 95.8 },
            { month: "Dec", value: 96.0 }
          ],
          priceChange: [
            { month: "Jan", value: 1.0 },
            { month: "Feb", value: 1.2 },
            { month: "Mar", value: 1.3 },
            { month: "Apr", value: 1.5 },
            { month: "May", value: 1.7 },
            { month: "Jun", value: 1.9 },
            { month: "Jul", value: 2.1 },
            { month: "Aug", value: 2.3 },
            { month: "Sep", value: 2.4 },
            { month: "Oct", value: 2.6 },
            { month: "Nov", value: 2.8 },
            { month: "Dec", value: 3.0 }
          ],
          daysOnMarket: [
            { month: "Jan", value: 55 },
            { month: "Feb", value: 54 },
            { month: "Mar", value: 52 },
            { month: "Apr", value: 51 },
            { month: "May", value: 50 },
            { month: "Jun", value: 49 },
            { month: "Jul", value: 48 },
            { month: "Aug", value: 47 },
            { month: "Sep", value: 46 },
            { month: "Oct", value: 45 },
            { month: "Nov", value: 44 },
            { month: "Dec", value: 42 }
          ]
        },
        hotspots: [
          // Areas with significant price movements
          { 
            area: "Gaborone Central", 
            change: 5.2, 
            direction: "up", 
            volume: 32,
            averagePrice: 8500,
            pricePerSqm: 950
          },
          { 
            area: "Phakalane", 
            change: 7.8, 
            direction: "up", 
            volume: 28,
            averagePrice: 12500,
            pricePerSqm: 1200
          },
          { 
            area: "Block 7", 
            change: 3.1, 
            direction: "up", 
            volume: 19,
            averagePrice: 7500,
            pricePerSqm: 850
          },
          { 
            area: "Extension 12", 
            change: -1.2, 
            direction: "down", 
            volume: 15,
            averagePrice: 6800,
            pricePerSqm: 750
          },
          { 
            area: "Tlokweng", 
            change: 6.5, 
            direction: "up", 
            volume: 23,
            averagePrice: 5500,
            pricePerSqm: 650
          },
          { 
            area: "Mogoditshane", 
            change: 4.2, 
            direction: "up", 
            volume: 35,
            averagePrice: 4500,
            pricePerSqm: 580
          },
          { 
            area: "Broadhurst", 
            change: 2.8, 
            direction: "up", 
            volume: 41,
            averagePrice: 5800,
            pricePerSqm: 680
          }
        ],
        insights: [
          "Demand for 2-3 bedroom apartments in CBD increased by 12% in Q1 2025",
          "New developments in Block 10 driving 8% premium on rental prices",
          "Commercial rentals seeing recovery with 5.2% growth year-over-year",
          "Phakalane estate properties command 15% premium over similar properties",
          "Student housing near UB shows consistent 98% occupancy rates"
        ],
        forecast: {
          rental: {
            projected: 4.2,
            confidence: 85,
            factors: ["Economic growth", "University expansion", "Infrastructure development"]
          },
          price: {
            projected: 6.7,
            confidence: 82,
            factors: ["Limited land availability", "Foreign investment", "Growing middle class"]
          },
          demand: {
            index: 76,
            trend: "increasing",
            factors: ["Urbanization", "Population growth", "Business expansion"]
          },
          supply: {
            index: 59,
            trend: "stable",
            factors: ["Construction delays", "Limited financing", "Material costs"]
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Error fetching market intelligence data" });
    }
  });
  
  // Get market reports
  app.get("/api/market-reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const reports = [
        {
          id: 1,
          title: "Botswana Property Market Quarterly Review",
          summary: "Overview of the Botswana property market for Q1 2025 with focus on emerging trends, opportunities, and challenges.",
          region: "National",
          reportType: "market overview",
          period: "Q1 2025",
          reportDate: new Date("2025-03-15T00:00:00.000Z"),
          insights: [
            "Urban property values increased by average of 5.8%",
            "Commercial property vacancy rates down to 7.2% from 9.1%",
            "Land prices in Gaborone suburbs appreciated by 12.3%",
            "New infrastructure projects driving growth in Francistown"
          ],
          fileUrl: "/reports/botswana-property-market-q1-2025.pdf"
        },
        {
          id: 2,
          title: "Gaborone Rental Market Analysis",
          summary: "In-depth analysis of rental yields, tenant demographics, and market opportunities in Gaborone's residential sector.",
          region: "Gaborone",
          reportType: "trend analysis",
          period: "2024-2025",
          reportDate: new Date("2025-02-22T00:00:00.000Z"),
          insights: [
            "Student rentals near UB showing 8.2% higher yields",
            "1-2 bedroom apartments experiencing highest demand growth",
            "Premium on furnished apartments increased to 15%",
            "Phakalane and Extension 9 remain top-performing suburbs"
          ],
          fileUrl: "/reports/gaborone-rental-market-analysis-2025.pdf"
        },
        {
          id: 3,
          title: "Investment Outlook: Botswana Commercial Property",
          summary: "Strategic investment analysis for commercial property investors in Botswana's major urban centers.",
          region: "National",
          reportType: "investment outlook",
          period: "2025-2026",
          reportDate: new Date("2025-01-10T00:00:00.000Z"),
          insights: [
            "Office spaces in CBD projected to appreciate 7.5% annually",
            "Retail properties show strong recovery after 2023 slowdown",
            "Industrial warehousing demand increases near transport hubs",
            "Mixed-use developments offering highest returns on investment"
          ],
          fileUrl: "/reports/botswana-commercial-investment-outlook-2025.pdf"
        }
      ];
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Error fetching market reports" });
    }
  });
  
  // Get market forecast
  app.get("/api/market-forecast", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
      return res.status(403).json({ message: "Access denied" });
    }
    
    try {
      const region = req.query.region as string || 'Gaborone';
      const propertyType = req.query.propertyType as string || 'all';
      const forecastType = req.query.forecastType as string || 'price';
      const period = req.query.period as string || '1y';
      
      // Sample forecast data structure
      const forecast = {
        region,
        propertyType,
        forecastType,
        period,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        forecastValue: forecastType === 'price' ? 6.7 : 4.2, // percentage increase
        confidenceLevel: 85,
        methodology: "Time series analysis with economic indicators",
        dataPoints: [
          { date: new Date(2025, 3, 1), value: forecastType === 'price' ? 1.5 : 1.0 },
          { date: new Date(2025, 4, 1), value: forecastType === 'price' ? 3.2 : 2.1 },
          { date: new Date(2025, 5, 1), value: forecastType === 'price' ? 4.1 : 2.7 },
          { date: new Date(2025, 6, 1), value: forecastType === 'price' ? 4.8 : 3.2 },
          { date: new Date(2025, 7, 1), value: forecastType === 'price' ? 5.3 : 3.5 },
          { date: new Date(2025, 8, 1), value: forecastType === 'price' ? 5.8 : 3.7 },
          { date: new Date(2025, 9, 1), value: forecastType === 'price' ? 6.2 : 3.9 },
          { date: new Date(2025, 10, 1), value: forecastType === 'price' ? 6.4 : 4.0 },
          { date: new Date(2025, 11, 1), value: forecastType === 'price' ? 6.6 : 4.1 },
          { date: new Date(2025, 12, 1), value: forecastType === 'price' ? 6.7 : 4.2 }
        ],
        factors: [
          {
            name: "Economic Growth",
            impact: "positive",
            weight: 0.35,
            description: "Botswana's GDP growth expected to reach 4.5% in 2025"
          },
          {
            name: "Population Growth",
            impact: "positive",
            weight: 0.25,
            description: "Urban population growing at 3.2% annually"
          },
          {
            name: "Infrastructure Development",
            impact: "positive",
            weight: 0.20,
            description: "Major road and utility expansions in urban areas"
          },
          {
            name: "Interest Rates",
            impact: "negative",
            weight: 0.15,
            description: "Potential increase in lending rates in Q3 2025"
          },
          {
            name: "Construction Costs",
            impact: "negative",
            weight: 0.05,
            description: "Rising material costs affecting new development"
          }
        ]
      };
      
      res.json(forecast);
    } catch (error) {
      res.status(500).json({ message: "Error fetching market forecast" });
    }
  });
  
  // Ratings routes
  // =====================
  
  // Landlord Ratings
  app.get('/api/landlord-ratings/:id', async (req, res) => {
    const rating = await storage.getLandlordRating(Number(req.params.id));
    if (!rating) {
      return res.status(404).json({ error: 'Landlord rating not found' });
    }
    res.json(rating);
  });

  app.get('/api/landlord-ratings/landlord/:landlordId', async (req, res) => {
    const ratings = await storage.getLandlordRatingsByLandlord(Number(req.params.landlordId));
    res.json(ratings);
  });

  app.get('/api/landlord-ratings/tenant/:tenantId', async (req, res) => {
    const ratings = await storage.getLandlordRatingsByTenant(Number(req.params.tenantId));
    res.json(ratings);
  });

  app.get('/api/landlord-ratings/property/:propertyId', async (req, res) => {
    const ratings = await storage.getLandlordRatingsByProperty(Number(req.params.propertyId));
    res.json(ratings);
  });

  app.post('/api/landlord-ratings', async (req, res) => {
    try {
      // Validate that the user is authenticated and is a tenant
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to rate a landlord' });
      }
      
      if (req.user.role !== 'tenant') {
        return res.status(403).json({ error: 'Only tenants can rate landlords' });
      }
      
      // Parse the input data first
      const ratingData = insertLandlordRatingSchema.parse(req.body);
      
      // Validate essential fields
      if (!ratingData.landlordId || !ratingData.propertyId || !ratingData.rating) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Override the tenant ID with the authenticated user's ID for security
      // This ensures tenants can only create ratings as themselves
      ratingData.tenantId = req.user.id;
    
      // Create the rating
      const rating = await storage.createLandlordRating(ratingData);
    
      // Notify the landlord via WebSocket if they're connected
      broadcastPropertyNotification({
        type: 'new-landlord-rating',
        rating,
        propertyId: rating.propertyId,
        message: `You have received a new rating from a tenant for property #${rating.propertyId}`,
        userId: rating.landlordId
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Error creating landlord rating:', error);
      res.status(500).json({ error: 'Failed to create landlord rating' });
    }
  });

  app.put('/api/landlord-ratings/:id', async (req, res) => {
    try {
      // Validate that the user is authenticated and is the tenant who created the rating
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to update a rating' });
      }
      
      const rating = await storage.getLandlordRating(Number(req.params.id));
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      
      if (req.user.id !== rating.tenantId) {
        return res.status(403).json({ error: 'You can only update your own ratings' });
      }
      
      // Update the rating
      const updatedRating = await storage.updateLandlordRating(Number(req.params.id), req.body);
      
      // Notify the landlord via WebSocket
      broadcastPropertyNotification({
        type: 'updated-landlord-rating',
        rating: updatedRating,
        propertyId: updatedRating.propertyId,
        message: `A tenant has updated their rating for property #${updatedRating.propertyId}`,
        userId: updatedRating.landlordId
      });
      
      res.json(updatedRating);
    } catch (error) {
      console.error('Error updating landlord rating:', error);
      res.status(500).json({ error: 'Failed to update landlord rating' });
    }
  });

  app.delete('/api/landlord-ratings/:id', async (req, res) => {
    try {
      // Validate that the user is authenticated and is the tenant who created the rating or an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to delete a rating' });
      }
      
      const rating = await storage.getLandlordRating(Number(req.params.id));
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      
      if (req.user.id !== rating.tenantId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You can only delete your own ratings' });
      }
      
      // Delete the rating
      const deleted = await storage.deleteLandlordRating(Number(req.params.id));
      
      if (deleted) {
        // Notify the landlord via WebSocket
        broadcastPropertyNotification({
          type: 'deleted-landlord-rating',
          ratingId: Number(req.params.id),
          propertyId: rating.propertyId,
          message: `A tenant has deleted their rating for property #${rating.propertyId}`,
          userId: rating.landlordId
        });
        
        return res.status(204).end();
      } else {
        return res.status(500).json({ error: 'Failed to delete rating' });
      }
    } catch (error) {
      console.error('Error deleting landlord rating:', error);
      res.status(500).json({ error: 'Failed to delete landlord rating' });
    }
  });
  
  // Tenant Ratings
  app.get('/api/tenant-ratings/:id', async (req, res) => {
    const rating = await storage.getTenantRating(Number(req.params.id));
    if (!rating) {
      return res.status(404).json({ error: 'Tenant rating not found' });
    }
    res.json(rating);
  });

  app.get('/api/tenant-ratings/tenant/:tenantId', async (req, res) => {
    const ratings = await storage.getTenantRatingsByTenant(Number(req.params.tenantId));
    res.json(ratings);
  });

  app.get('/api/tenant-ratings/landlord/:landlordId', async (req, res) => {
    const ratings = await storage.getTenantRatingsByLandlord(Number(req.params.landlordId));
    res.json(ratings);
  });

  app.get('/api/tenant-ratings/property/:propertyId', async (req, res) => {
    const ratings = await storage.getTenantRatingsByProperty(Number(req.params.propertyId));
    res.json(ratings);
  });

  app.post('/api/tenant-ratings', async (req, res) => {
    try {
      // Validate that the user is authenticated and is a landlord or agency
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to rate a tenant' });
      }
      
      if (req.user.role !== 'landlord' && req.user.role !== 'agency') {
        return res.status(403).json({ error: 'Only landlords and agencies can rate tenants' });
      }
      
      // Parse the input data first
      const ratingData = insertTenantRatingSchema.parse(req.body);
      
      // Validate essential fields
      if (!ratingData.tenantId || !ratingData.propertyId || !ratingData.rating) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Override the landlord ID with the authenticated user's ID for security
      // This ensures landlords can only create ratings as themselves
      ratingData.landlordId = req.user.id;
      
      // Create the rating
      const rating = await storage.createTenantRating(ratingData);
      
      // Notify the tenant via WebSocket if they're connected
      sendToUser(rating.tenantId, {
        type: 'new-tenant-rating',
        rating,
        message: `You have received a new rating from your landlord for property #${rating.propertyId}`
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Error creating tenant rating:', error);
      res.status(500).json({ error: 'Failed to create tenant rating' });
    }
  });

  app.put('/api/tenant-ratings/:id', async (req, res) => {
    try {
      // Validate that the user is authenticated and is the landlord who created the rating
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to update a rating' });
      }
      
      const rating = await storage.getTenantRating(Number(req.params.id));
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      
      if (req.user.id !== rating.landlordId) {
        return res.status(403).json({ error: 'You can only update your own ratings' });
      }
      
      // Update the rating
      const updatedRating = await storage.updateTenantRating(Number(req.params.id), req.body);
      
      // Notify the tenant via WebSocket
      sendToUser(updatedRating.tenantId, {
        type: 'updated-tenant-rating',
        rating: updatedRating,
        message: `Your landlord has updated their rating for property #${updatedRating.propertyId}`
      });
      
      res.json(updatedRating);
    } catch (error) {
      console.error('Error updating tenant rating:', error);
      res.status(500).json({ error: 'Failed to update tenant rating' });
    }
  });

  app.delete('/api/tenant-ratings/:id', async (req, res) => {
    try {
      // Validate that the user is authenticated and is the landlord who created the rating or an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to delete a rating' });
      }
      
      const rating = await storage.getTenantRating(Number(req.params.id));
      if (!rating) {
        return res.status(404).json({ error: 'Rating not found' });
      }
      
      if (req.user.id !== rating.landlordId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You can only delete your own ratings' });
      }
      
      // Delete the rating
      const deleted = await storage.deleteTenantRating(Number(req.params.id));
      
      if (deleted) {
        // Notify the tenant via WebSocket
        sendToUser(rating.tenantId, {
          type: 'deleted-tenant-rating',
          ratingId: Number(req.params.id),
          propertyId: rating.propertyId,
          message: `Your landlord has deleted their rating for property #${rating.propertyId}`
        });
        
        return res.status(204).end();
      } else {
        return res.status(500).json({ error: 'Failed to delete rating' });
      }
    } catch (error) {
      console.error('Error deleting tenant rating:', error);
      res.status(500).json({ error: 'Failed to delete tenant rating' });
    }
  });
  
  const httpServer = createServer(app);
  
  // Initialize WebSocket server on the same HTTP server
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws' 
  });
  
  // Create a map to store active connections by user ID
  const activeConnections = new Map<number, WebSocket[]>();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    // Handle authentication and message routing
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication message (first message sent after connection)
        if (data.type === 'auth' && data.userId) {
          userId = data.userId as number;
          
          // Store connection in the map
          if (!activeConnections.has(userId)) {
            activeConnections.set(userId, []);
          }
          activeConnections.get(userId)?.push(ws);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'Authentication successful'
          }));
        }
        
        // Handle other message types once authenticated
        if (userId) {
          if (data.type === 'maintenance_update' && data.requestId) {
            // Broadcast maintenance update to relevant users
            broadcastMaintenanceUpdate(data);
          } else if (data.type === 'property_notification' && data.propertyId) {
            // Broadcast property notification to relevant users
            broadcastPropertyNotification(data);
          } else if (data.type === 'chat_message' && data.receiverId) {
            // Send direct message to a specific user
            sendDirectMessage(data.receiverId, data);
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      if (userId) {
        // Remove this connection from the user's connections
        const userConnections = activeConnections.get(userId);
        if (userConnections) {
          const index = userConnections.indexOf(ws);
          if (index !== -1) {
            userConnections.splice(index, 1);
          }
          
          // If no more connections, remove the user from the map
          if (userConnections.length === 0) {
            activeConnections.delete(userId);
          }
        }
      }
    });
  });
  
  // Helper function to broadcast maintenance updates
  function broadcastMaintenanceUpdate(data: any) {
    // Find the maintenance request
    storage.getMaintenanceRequest(data.requestId)
      .then(request => {
        if (!request) return;
        
        // Get the property
        return storage.getProperty(request.propertyId)
          .then(property => {
            if (!property) return;
            
            // Send to tenant who created the request
            sendToUser(request.tenantId, data);
            
            // Send to assigned maintenance provider
            if (request.assignedToId) {
              sendToUser(request.assignedToId, data);
            }
            
            // Send to landlord who owns the property
            sendToUser(property.landlordId, data);
            
            // Send to all agency users (in a real system, would be more targeted)
            storage.getUsersByRole('agency')
              .then(agencies => {
                agencies.forEach(agency => {
                  sendToUser(agency.id, data);
                });
              });
          });
      })
      .catch(error => {
        console.error('Error broadcasting maintenance update:', error);
      });
  }
  
  // Helper function to broadcast property notifications
  function broadcastPropertyNotification(data: any) {
    // Find the property
    storage.getProperty(data.propertyId)
      .then(property => {
        if (!property) return;
        
        // Send to landlord who owns the property
        sendToUser(property.landlordId, data);
        
        // Send to all tenants with active leases on this property
        storage.getLeasesByProperty(property.id)
          .then(leases => {
            leases.forEach(lease => {
              if (lease.active) {
                sendToUser(lease.tenantId, data);
              }
            });
          });
        
        // Send to all agency users
        storage.getUsersByRole('agency')
          .then(agencies => {
            agencies.forEach(agency => {
              sendToUser(agency.id, data);
            });
          });
      })
      .catch(error => {
        console.error('Error broadcasting property notification:', error);
      });
  }
  
  // Helper function to send a message to a specific user
  function sendToUser(userId: number, data: any) {
    const userConnections = activeConnections.get(userId);
    if (userConnections && userConnections.length > 0) {
      const message = JSON.stringify(data);
      userConnections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(message);
        }
      });
    }
  }
  
  // Helper function to send a direct message
  function sendDirectMessage(receiverId: number, data: any) {
    sendToUser(receiverId, data);
  }
  
  // Serve debug HTML files directly (outside the React router)
  app.get('/test-debug.html', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'test-debug.html'));
  });
  
  app.get('/test-websocket.html', (req, res) => {
    res.sendFile(path.resolve(process.cwd(), 'test-websocket.html'));
  });

  return httpServer;
}
