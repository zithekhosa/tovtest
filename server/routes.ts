import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import path from "path";
import { 
  insertMaintenanceRequestSchema, 
  insertPropertySchema, 
  insertLeaseSchema, 
  insertPaymentSchema, 
  insertDocumentSchema, 
  insertMessageSchema,
  Property,
  MaintenanceRequest
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

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
