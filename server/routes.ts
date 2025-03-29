import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
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

  return httpServer;
}
