import { users, properties, leases, payments, maintenanceRequests, documents, messages, applications, maintenanceJobs, maintenanceBids, type User, type Property, type Lease, type Payment, type MaintenanceRequest, type Document, type Message, type Application, type MaintenanceJob, type MaintenanceBid, type InsertUser, type InsertProperty, type InsertLease, type InsertPayment, type InsertMaintenanceRequest, type InsertDocument, type InsertMessage, type InsertApplication, type InsertMaintenanceJob, type InsertMaintenanceBid, type UserRoleType } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { and, eq, or, desc, asc, isNull, gte, lte, ilike } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

const MemoryStore = createMemoryStore(session);
const PostgresStore = connectPg(session);

// define the storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  clearUsers(): Promise<void>;
  
  // Properties
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  getPropertiesByLandlord(landlordId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  getAvailableProperties(): Promise<Property[]>;
  searchProperties(params: {
    query?: string;
    propertyType?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Property[]>;
  clearProperties(): Promise<void>;
  
  // Leases
  getLease(id: number): Promise<Lease | undefined>;
  getLeasesByTenant(tenantId: number): Promise<Lease[]>;
  getLeasesByProperty(propertyId: number): Promise<Lease[]>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease | undefined>;
  clearLeases(): Promise<void>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByTenant(tenantId: number): Promise<Payment[]>;
  getPaymentsByLease(leaseId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  clearPayments(): Promise<void>;
  
  // Maintenance Requests
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByStatus(status: string): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  clearMaintenanceRequests(): Promise<void>;
  
  // Documents
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUser(userId: number): Promise<Document[]>;
  getDocumentsByProperty(propertyId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  clearDocuments(): Promise<void>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySender(senderId: number): Promise<Message[]>;
  getMessagesByReceiver(receiverId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  clearMessages(): Promise<void>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private leases: Map<number, Lease>;
  private payments: Map<number, Payment>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  private documents: Map<number, Document>;
  private messages: Map<number, Message>;
  
  sessionStore: session.Store;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private leaseIdCounter: number;
  private paymentIdCounter: number;
  private maintenanceRequestIdCounter: number;
  private documentIdCounter: number;
  private messageIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.leases = new Map();
    this.payments = new Map();
    this.maintenanceRequests = new Map();
    this.documents = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.leaseIdCounter = 1;
    this.paymentIdCounter = 1;
    this.maintenanceRequestIdCounter = 1;
    this.documentIdCounter = 1;
    this.messageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
      stale: true, // Allow stale sessions
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days to match cookie
    });
    
    // Add error handler for session store
    this.sessionStore.on('error', (error) => {
      console.error('Session store error:', error);
    });
  }
  
  // Clear data methods for testing and cleanup
  async clearUsers(): Promise<void> {
    this.users.clear();
    this.userIdCounter = 1;
  }
  
  async clearProperties(): Promise<void> {
    this.properties.clear();
    this.propertyIdCounter = 1;
  }
  
  async clearLeases(): Promise<void> {
    this.leases.clear();
    this.leaseIdCounter = 1;
  }
  
  async clearPayments(): Promise<void> {
    this.payments.clear();
    this.paymentIdCounter = 1;
  }
  
  async clearMaintenanceRequests(): Promise<void> {
    this.maintenanceRequests.clear();
    this.maintenanceRequestIdCounter = 1;
  }
  
  async clearDocuments(): Promise<void> {
    this.documents.clear();
    this.documentIdCounter = 1;
  }
  
  async clearMessages(): Promise<void> {
    this.messages.clear();
    this.messageIdCounter = 1;
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      email: insertUser.email,
      role: insertUser.role as unknown as UserRoleType,
      phone: insertUser.phone || null,
      profileImage: insertUser.profileImage || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
  
  // Properties
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }
  
  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.landlordId === landlordId,
    );
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const property: Property = {
      id,
      landlordId: insertProperty.landlordId,
      address: insertProperty.address,
      city: insertProperty.city,
      state: insertProperty.state,
      zipCode: insertProperty.zipCode,
      propertyType: insertProperty.propertyType,
      bedrooms: insertProperty.bedrooms,
      bathrooms: insertProperty.bathrooms,
      squareFeet: insertProperty.squareFeet || null,
      rentAmount: insertProperty.rentAmount,
      description: insertProperty.description || null,
      available: insertProperty.available ?? true,
      images: insertProperty.images || null
    };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async getAvailableProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.available === true,
    );
  }
  
  async searchProperties(params: {
    query?: string;
    propertyType?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
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
    } = params;
    
    // Get all available properties
    let properties = Array.from(this.properties.values()).filter(property => property.available === true);
    
    // Apply text search filter if query is provided
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      properties = properties.filter(property => {
        // Search across multiple fields
        const searchText = [
          property.title || '',
          property.description || '',
          property.location || '',
          property.city || '',
          property.address || ''
        ].join(' ').toLowerCase();
        
        // Match if any search term exists in the search text
        return searchTerms.some(term => searchText.includes(term));
      });
    }
    
    // Filter by property type
    if (propertyType && propertyType !== 'all') {
      properties = properties.filter(property => property.propertyType === propertyType);
    }
    
    // Filter by bedrooms range
    if (minBedrooms !== undefined) {
      properties = properties.filter(property => property.bedrooms >= minBedrooms);
    }
    if (maxBedrooms !== undefined) {
      properties = properties.filter(property => property.bedrooms <= maxBedrooms);
    }
    
    // Filter by bathrooms range
    if (minBathrooms !== undefined) {
      properties = properties.filter(property => property.bathrooms >= minBathrooms);
    }
    if (maxBathrooms !== undefined) {
      properties = properties.filter(property => property.bathrooms <= maxBathrooms);
    }
    
    // Filter by price range
    if (minPrice !== undefined) {
      properties = properties.filter(property => property.rentAmount >= minPrice);
    }
    if (maxPrice !== undefined) {
      properties = properties.filter(property => property.rentAmount <= maxPrice);
    }
    
    // Filter by location
    if (location) {
      const locationLower = location.toLowerCase();
      properties = properties.filter(property => {
        return (property.location || '').toLowerCase().includes(locationLower) ||
               (property.city || '').toLowerCase().includes(locationLower) ||
               (property.address || '').toLowerCase().includes(locationLower);
      });
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      properties.sort((a, b) => {
        return sortOrder === 'asc' ? 
          a.rentAmount - b.rentAmount : 
          b.rentAmount - a.rentAmount;
      });
    } else if (sortBy === 'bedrooms') {
      properties.sort((a, b) => {
        return sortOrder === 'asc' ? 
          a.bedrooms - b.bedrooms : 
          b.bedrooms - a.bedrooms;
      });
    } else if (sortBy === 'bathrooms') {
      properties.sort((a, b) => {
        return sortOrder === 'asc' ? 
          a.bathrooms - b.bathrooms : 
          b.bathrooms - a.bathrooms;
      });
    } else if (sortBy === 'area') {
      properties.sort((a, b) => {
        const aArea = a.squareFeet || 0;
        const bArea = b.squareFeet || 0;
        return sortOrder === 'asc' ? 
          aArea - bArea : 
          bArea - aArea;
      });
    } else {
      // Default to sorting by creation date if available (newer first)
      properties.sort((a, b) => {
        const aDate = a.createdAt ? a.createdAt.getTime() : 0;
        const bDate = b.createdAt ? b.createdAt.getTime() : 0;
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      });
    }
    
    // Apply pagination
    return properties.slice(offset, offset + limit);
  }
  
  // Leases
  async getLease(id: number): Promise<Lease | undefined> {
    return this.leases.get(id);
  }
  
  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.tenantId === tenantId,
    );
  }
  
  async getLeasesByProperty(propertyId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.propertyId === propertyId,
    );
  }
  
  async createLease(insertLease: InsertLease): Promise<Lease> {
    const id = this.leaseIdCounter++;
    const lease: Lease = { 
      id,
      rentAmount: insertLease.rentAmount,
      propertyId: insertLease.propertyId,
      tenantId: insertLease.tenantId,
      startDate: insertLease.startDate,
      endDate: insertLease.endDate,
      securityDeposit: insertLease.securityDeposit,
      documentUrl: insertLease.documentUrl || null,
      active: insertLease.active ?? true
    };
    this.leases.set(id, lease);
    return lease;
  }
  
  async updateLease(id: number, updates: Partial<InsertLease>): Promise<Lease | undefined> {
    const lease = this.leases.get(id);
    if (!lease) return undefined;
    
    const updatedLease = { ...lease, ...updates };
    this.leases.set(id, updatedLease);
    return updatedLease;
  }
  
  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.tenantId === tenantId,
    );
  }
  
  async getPaymentsByLease(leaseId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.leaseId === leaseId,
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const payment: Payment = { 
      id,
      tenantId: insertPayment.tenantId,
      leaseId: insertPayment.leaseId,
      amount: insertPayment.amount,
      paymentDate: insertPayment.paymentDate,
      paymentType: insertPayment.paymentType,
      description: insertPayment.description || null
    };
    this.payments.set(id, payment);
    return payment;
  }
  
  // Maintenance Requests
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }
  
  async getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.tenantId === tenantId,
    );
  }
  
  async getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.propertyId === propertyId,
    );
  }
  
  async getMaintenanceRequestsByStatus(status: string): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.status === status,
    );
  }
  
  async getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.assignedToId === assigneeId,
    );
  }
  
  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = this.maintenanceRequestIdCounter++;
    const request: MaintenanceRequest = { 
      id,
      title: insertRequest.title, 
      description: insertRequest.description,
      propertyId: insertRequest.propertyId,
      tenantId: insertRequest.tenantId,
      priority: insertRequest.priority,
      status: insertRequest.status || 'New',
      images: insertRequest.images || null,
      assignedToId: insertRequest.assignedToId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.maintenanceRequests.set(id, request);
    return request;
  }
  
  async updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const request = this.maintenanceRequests.get(id);
    if (!request) return undefined;
    
    // Process images array separately if provided
    let processedImages = request.images;
    if (updates.images !== undefined) {
      processedImages = updates.images || null;
    }
    
    // Create a new object with all updates
    const updatedRequest: MaintenanceRequest = {
      ...request,
      title: updates.title ?? request.title,
      description: updates.description ?? request.description,
      propertyId: updates.propertyId ?? request.propertyId,
      tenantId: updates.tenantId ?? request.tenantId,
      priority: updates.priority ?? request.priority,
      status: updates.status ?? request.status,
      assignedToId: updates.assignedToId !== undefined ? (updates.assignedToId || null) : request.assignedToId,
      images: processedImages,
      updatedAt: new Date()
    };
    
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Documents
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.userId === userId,
    );
  }
  
  async getDocumentsByProperty(propertyId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.propertyId === propertyId,
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const document: Document = { 
      id,
      userId: insertDocument.userId,
      fileName: insertDocument.fileName,
      fileUrl: insertDocument.fileUrl,
      fileType: insertDocument.fileType,
      documentType: insertDocument.documentType,
      propertyId: insertDocument.propertyId || null,
      uploadedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  
  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === senderId,
    );
  }
  
  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.receiverId === receiverId,
    );
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = { 
      ...insertMessage, 
      id,
      sentAt: new Date(),
      read: false
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, read: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async clearUsers(): Promise<void> {
    await db.delete(users);
  }
  
  // Properties
  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }
  
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties);
  }
  
  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.landlordId, landlordId));
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db.insert(properties).values(insertProperty).returning();
    return property;
  }
  
  async updateProperty(id: number, updatedProperty: Partial<InsertProperty>): Promise<Property | undefined> {
    const [property] = await db
      .update(properties)
      .set(updatedProperty)
      .where(eq(properties.id, id))
      .returning();
    return property;
  }
  
  async getAvailableProperties(): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.available, true));
  }
  
  async searchProperties(params: {
    query?: string;
    propertyType?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
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
    } = params;
    
    // Base query
    let queryBuilder = db.select().from(properties)
      .where(eq(properties.available, true));
    
    // Apply filters
    if (propertyType && propertyType !== 'all') {
      queryBuilder = queryBuilder.where(eq(properties.propertyType, propertyType));
    }
    
    if (minBedrooms !== undefined) {
      queryBuilder = queryBuilder.where(gte(properties.bedrooms, minBedrooms));
    }
    
    if (maxBedrooms !== undefined) {
      queryBuilder = queryBuilder.where(lte(properties.bedrooms, maxBedrooms));
    }
    
    if (minBathrooms !== undefined) {
      queryBuilder = queryBuilder.where(gte(properties.bathrooms, minBathrooms));
    }
    
    if (maxBathrooms !== undefined) {
      queryBuilder = queryBuilder.where(lte(properties.bathrooms, maxBathrooms));
    }
    
    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.where(gte(properties.rentAmount, minPrice));
    }
    
    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.where(lte(properties.rentAmount, maxPrice));
    }
    
    if (location) {
      // Search in location, city, and address fields
      queryBuilder = queryBuilder.where(
        or(
          ilike(properties.location, `%${location}%`),
          ilike(properties.city, `%${location}%`),
          ilike(properties.address, `%${location}%`)
        )
      );
    }
    
    // Text search across multiple fields
    if (query) {
      queryBuilder = queryBuilder.where(
        or(
          ilike(properties.title, `%${query}%`),
          ilike(properties.description, `%${query}%`),
          ilike(properties.location, `%${query}%`),
          ilike(properties.city, `%${query}%`),
          ilike(properties.address, `%${query}%`)
        )
      );
    }
    
    // Apply sorting
    if (sortBy === 'price') {
      queryBuilder = sortOrder === 'asc' 
        ? queryBuilder.orderBy(asc(properties.rentAmount)) 
        : queryBuilder.orderBy(desc(properties.rentAmount));
    } else if (sortBy === 'bedrooms') {
      queryBuilder = sortOrder === 'asc' 
        ? queryBuilder.orderBy(asc(properties.bedrooms)) 
        : queryBuilder.orderBy(desc(properties.bedrooms));
    } else if (sortBy === 'bathrooms') {
      queryBuilder = sortOrder === 'asc' 
        ? queryBuilder.orderBy(asc(properties.bathrooms)) 
        : queryBuilder.orderBy(desc(properties.bathrooms));
    } else if (sortBy === 'area') {
      queryBuilder = sortOrder === 'asc' 
        ? queryBuilder.orderBy(asc(properties.squareFootage)) 
        : queryBuilder.orderBy(desc(properties.squareFootage));
    } else {
      // Default to creation date
      queryBuilder = queryBuilder.orderBy(desc(properties.createdAt));
    }
    
    // Apply pagination
    queryBuilder = queryBuilder.limit(limit).offset(offset);
    
    return await queryBuilder;
  }
  
  async clearProperties(): Promise<void> {
    await db.delete(properties);
  }
  
  // Leases
  async getLease(id: number): Promise<Lease | undefined> {
    const [lease] = await db.select().from(leases).where(eq(leases.id, id));
    return lease;
  }
  
  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return await db.select().from(leases).where(eq(leases.tenantId, tenantId));
  }
  
  async getLeasesByProperty(propertyId: number): Promise<Lease[]> {
    return await db.select().from(leases).where(eq(leases.propertyId, propertyId));
  }
  
  async createLease(insertLease: InsertLease): Promise<Lease> {
    const [lease] = await db.insert(leases).values(insertLease).returning();
    return lease;
  }
  
  async updateLease(id: number, updatedLease: Partial<InsertLease>): Promise<Lease | undefined> {
    const [lease] = await db
      .update(leases)
      .set(updatedLease)
      .where(eq(leases.id, id))
      .returning();
    return lease;
  }
  
  async clearLeases(): Promise<void> {
    await db.delete(leases);
  }
  
  // Payments
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }
  
  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.tenantId, tenantId));
  }
  
  async getPaymentsByLease(leaseId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.leaseId, leaseId));
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }
  
  async clearPayments(): Promise<void> {
    await db.delete(payments);
  }
  
  // Maintenance Requests
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    const [request] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
    return request;
  }
  
  async getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.tenantId, tenantId));
  }
  
  async getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.propertyId, propertyId));
  }
  
  async getMaintenanceRequestsByStatus(status: string): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.status, status));
  }
  
  async getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]> {
    return await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.assignedToId, assigneeId));
  }
  
  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [request] = await db.insert(maintenanceRequests).values(insertRequest).returning();
    return request;
  }
  
  async updateMaintenanceRequest(id: number, updatedRequest: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const [request] = await db
      .update(maintenanceRequests)
      .set(updatedRequest)
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return request;
  }
  
  async clearMaintenanceRequests(): Promise<void> {
    await db.delete(maintenanceRequests);
  }
  
  // Documents
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async getDocumentsByUser(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
  
  async getDocumentsByProperty(propertyId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.propertyId, propertyId));
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }
  
  async clearDocuments(): Promise<void> {
    await db.delete(documents);
  }
  
  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }
  
  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.senderId, senderId));
  }
  
  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.receiverId, receiverId));
  }
  
  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(asc(messages.sentAt));
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return message;
  }
  
  async clearMessages(): Promise<void> {
    await db.delete(messages);
  }
}

// Use PostgreSQL storage in production, MemStorage for development
export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
