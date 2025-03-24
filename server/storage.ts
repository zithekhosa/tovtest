import { users, properties, leases, payments, maintenanceRequests, documents, messages, type User, type Property, type Lease, type Payment, type MaintenanceRequest, type Document, type Message, type InsertUser, type InsertProperty, type InsertLease, type InsertPayment, type InsertMaintenanceRequest, type InsertDocument, type InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
    const user: User = { ...insertUser, id };
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
    const property: Property = { ...insertProperty, id };
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
    const lease: Lease = { ...insertLease, id };
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
    const payment: Payment = { ...insertPayment, id };
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
      ...insertRequest, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.maintenanceRequests.set(id, request);
    return request;
  }
  
  async updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const request = this.maintenanceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { 
      ...request, 
      ...updates, 
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
      ...insertDocument, 
      id,
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

export const storage = new MemStorage();
