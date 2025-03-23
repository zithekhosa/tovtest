import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertPropertySchema, insertUnitSchema, insertLeaseSchema, insertPaymentSchema, insertMaintenanceRequestSchema, insertDocumentSchema, insertMessageSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Property routes
  app.get("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const properties = await storage.getAllProperties();
    res.json(properties);
  });

  app.get("/api/properties/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role === "landlord") {
      const properties = await storage.getPropertiesByOwner(req.user.id);
      res.json(properties);
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const property = await storage.getProperty(Number(req.params.id));
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  });

  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== "landlord" && req.user.role !== "agency") {
      return res.status(403).json({ message: "Only landlords and agencies can create properties" });
    }
    
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        ownerId: req.user.id
      });
      
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid property data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create property" });
      }
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const propertyId = Number(req.params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.ownerId !== req.user.id && req.user.role !== "agency") {
      return res.status(403).json({ message: "You don't have permission to update this property" });
    }
    
    try {
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(propertyId, validatedData);
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid property data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update property" });
      }
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const propertyId = Number(req.params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to delete this property" });
    }
    
    const deleted = await storage.deleteProperty(propertyId);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Unit routes
  app.get("/api/properties/:propertyId/units", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const propertyId = Number(req.params.propertyId);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    const units = await storage.getUnitsByProperty(propertyId);
    res.json(units);
  });

  app.post("/api/properties/:propertyId/units", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const propertyId = Number(req.params.propertyId);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.ownerId !== req.user.id && req.user.role !== "agency") {
      return res.status(403).json({ message: "You don't have permission to add units to this property" });
    }
    
    try {
      const validatedData = insertUnitSchema.parse({
        ...req.body,
        propertyId
      });
      
      const unit = await storage.createUnit(validatedData);
      res.status(201).json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid unit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create unit" });
      }
    }
  });

  // Maintenance Request routes
  app.get("/api/maintenance-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let requests;
    
    switch (req.user.role) {
      case "landlord":
        requests = await storage.getMaintenanceRequestsByLandlord(req.user.id);
        break;
      case "tenant":
        requests = await storage.getMaintenanceRequestsByTenant(req.user.id);
        break;
      case "maintenance":
        requests = await storage.getMaintenanceRequestsByAssignee(req.user.id);
        break;
      default:
        return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(requests);
  });

  app.post("/api/maintenance-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== "tenant") {
      return res.status(403).json({ message: "Only tenants can create maintenance requests" });
    }
    
    try {
      const validatedData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        tenantId: req.user.id,
      });
      
      const request = await storage.createMaintenanceRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create maintenance request" });
      }
    }
  });

  app.put("/api/maintenance-requests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const requestId = Number(req.params.id);
    const request = await storage.getMaintenanceRequest(requestId);
    
    if (!request) {
      return res.status(404).json({ message: "Maintenance request not found" });
    }
    
    // Allow landlords to assign and update status, maintenance to update status
    if (req.user.role === "landlord") {
      try {
        const validatedData = insertMaintenanceRequestSchema.partial().parse(req.body);
        const updatedRequest = await storage.updateMaintenanceRequest(requestId, validatedData);
        res.json(updatedRequest);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid request data", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to update maintenance request" });
        }
      }
    } else if (req.user.role === "maintenance" && request.assignedTo === req.user.id) {
      try {
        // Maintenance providers can only update status
        const validatedData = insertMaintenanceRequestSchema.pick({ status: true }).parse(req.body);
        const updatedRequest = await storage.updateMaintenanceRequest(requestId, validatedData);
        res.json(updatedRequest);
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({ message: "Invalid request data", errors: error.errors });
        } else {
          res.status(500).json({ message: "Failed to update maintenance request" });
        }
      }
    } else {
      res.status(403).json({ message: "You don't have permission to update this request" });
    }
  });

  // Lease routes
  app.get("/api/leases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let leases;
    
    switch (req.user.role) {
      case "landlord":
        leases = await storage.getLeasesByLandlord(req.user.id);
        break;
      case "tenant":
        leases = await storage.getLeasesByTenant(req.user.id);
        break;
      default:
        return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(leases);
  });

  app.post("/api/leases", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can create leases" });
    }
    
    try {
      const validatedData = insertLeaseSchema.parse({
        ...req.body,
        landlordId: req.user.id,
      });
      
      const lease = await storage.createLease(validatedData);
      
      // Update unit with tenant information
      await storage.updateUnit(validatedData.unitId, {
        isOccupied: true,
        currentTenantId: validatedData.tenantId
      });
      
      res.status(201).json(lease);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lease data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lease" });
      }
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let payments;
    
    switch (req.user.role) {
      case "landlord":
        // This is inefficient but works for memory storage
        const leases = await storage.getLeasesByLandlord(req.user.id);
        payments = [];
        for (const lease of leases) {
          const leasePayments = await storage.getPaymentsByLease(lease.id);
          payments.push(...leasePayments);
        }
        break;
      case "tenant":
        payments = await storage.getPaymentsByTenant(req.user.id);
        break;
      default:
        return res.status(403).json({ message: "Access denied" });
    }
    
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Both tenants and landlords can create payment records
    if (req.user.role !== "tenant" && req.user.role !== "landlord") {
      return res.status(403).json({ message: "Only tenants and landlords can create payments" });
    }
    
    try {
      let validatedData;
      
      if (req.user.role === "tenant") {
        validatedData = insertPaymentSchema.parse({
          ...req.body,
          tenantId: req.user.id,
        });
      } else {
        validatedData = insertPaymentSchema.parse(req.body);
      }
      
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create payment" });
      }
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const documents = await storage.getDocumentsByOwner(req.user.id);
    res.json(documents);
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid document data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create document" });
      }
    }
  });

  // Message routes
  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const otherUserId = Number(req.params.userId);
    const messages = await storage.getMessagesBetweenUsers(req.user.id, otherUserId);
    
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
      });
      
      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const messageId = Number(req.params.id);
    const message = await storage.getMessage(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ message: "You don't have permission to mark this message as read" });
    }
    
    const updatedMessage = await storage.markMessageAsRead(messageId);
    res.json(updatedMessage);
  });

  const httpServer = createServer(app);
  return httpServer;
}
