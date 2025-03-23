import { users, properties, units, leases, payments, maintenanceRequests, documents, messages } from "@shared/schema";
import type { 
  User, InsertUser, Property, InsertProperty, Unit, InsertUnit, 
  Lease, InsertLease, Payment, InsertPayment, MaintenanceRequest, 
  InsertMaintenanceRequest, Document as DocType, InsertDocument, 
  Message, InsertMessage 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Property operations
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  getAllProperties(): Promise<Property[]>;
  
  // Unit operations
  getUnit(id: number): Promise<Unit | undefined>;
  getUnitsByProperty(propertyId: number): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: number, unit: Partial<InsertUnit>): Promise<Unit | undefined>;
  deleteUnit(id: number): Promise<boolean>;
  
  // Lease operations
  getLease(id: number): Promise<Lease | undefined>;
  getLeasesByTenant(tenantId: number): Promise<Lease[]>;
  getLeasesByLandlord(landlordId: number): Promise<Lease[]>;
  getLeaseByUnit(unitId: number): Promise<Lease | undefined>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, lease: Partial<InsertLease>): Promise<Lease | undefined>;
  deleteLease(id: number): Promise<boolean>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByLease(leaseId: number): Promise<Payment[]>;
  getPaymentsByTenant(tenantId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Maintenance operations
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  getMaintenanceRequestsByUnit(unitId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByLandlord(landlordId: number): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  
  // Document operations
  getDocument(id: number): Promise<DocType | undefined>;
  getDocumentsByOwner(ownerId: number): Promise<DocType[]>;
  getDocumentsByProperty(propertyId: number): Promise<DocType[]>;
  getDocumentsByUnit(unitId: number): Promise<DocType[]>;
  createDocument(document: InsertDocument): Promise<DocType>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<DocType | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]>;
  getMessagesBySender(senderId: number): Promise<Message[]>;
  getMessagesByReceiver(receiverId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  // Session storage
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private units: Map<number, Unit>;
  private leases: Map<number, Lease>;
  private payments: Map<number, Payment>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  private documents: Map<number, DocType>;
  private messages: Map<number, Message>;
  private currentIds: Record<string, number>;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.units = new Map();
    this.leases = new Map();
    this.payments = new Map();
    this.maintenanceRequests = new Map();
    this.documents = new Map();
    this.messages = new Map();
    
    this.currentIds = {
      user: 1,
      property: 1,
      unit: 1,
      lease: 1,
      payment: 1,
      maintenanceRequest: 1,
      document: 1,
      message: 1,
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property operations
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.ownerId === ownerId
    );
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentIds.property++;
    const createdAt = new Date();
    const property: Property = { ...insertProperty, id, createdAt };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...propertyData };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }
  
  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  // Unit operations
  async getUnit(id: number): Promise<Unit | undefined> {
    return this.units.get(id);
  }
  
  async getUnitsByProperty(propertyId: number): Promise<Unit[]> {
    return Array.from(this.units.values()).filter(
      (unit) => unit.propertyId === propertyId
    );
  }
  
  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const id = this.currentIds.unit++;
    const createdAt = new Date();
    const unit: Unit = { ...insertUnit, id, createdAt };
    this.units.set(id, unit);
    return unit;
  }
  
  async updateUnit(id: number, unitData: Partial<InsertUnit>): Promise<Unit | undefined> {
    const unit = this.units.get(id);
    if (!unit) return undefined;
    
    const updatedUnit = { ...unit, ...unitData };
    this.units.set(id, updatedUnit);
    return updatedUnit;
  }
  
  async deleteUnit(id: number): Promise<boolean> {
    return this.units.delete(id);
  }

  // Lease operations
  async getLease(id: number): Promise<Lease | undefined> {
    return this.leases.get(id);
  }
  
  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.tenantId === tenantId
    );
  }
  
  async getLeasesByLandlord(landlordId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(
      (lease) => lease.landlordId === landlordId
    );
  }
  
  async getLeaseByUnit(unitId: number): Promise<Lease | undefined> {
    return Array.from(this.leases.values()).find(
      (lease) => lease.unitId === unitId && lease.isActive
    );
  }
  
  async createLease(insertLease: InsertLease): Promise<Lease> {
    const id = this.currentIds.lease++;
    const createdAt = new Date();
    const lease: Lease = { ...insertLease, id, createdAt };
    this.leases.set(id, lease);
    return lease;
  }
  
  async updateLease(id: number, leaseData: Partial<InsertLease>): Promise<Lease | undefined> {
    const lease = this.leases.get(id);
    if (!lease) return undefined;
    
    const updatedLease = { ...lease, ...leaseData };
    this.leases.set(id, updatedLease);
    return updatedLease;
  }
  
  async deleteLease(id: number): Promise<boolean> {
    return this.leases.delete(id);
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByLease(leaseId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.leaseId === leaseId
    );
  }
  
  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.tenantId === tenantId
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentIds.payment++;
    const createdAt = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Maintenance operations
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }
  
  async getMaintenanceRequestsByUnit(unitId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.unitId === unitId
    );
  }
  
  async getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.tenantId === tenantId
    );
  }
  
  async getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => request.assignedTo === assigneeId
    );
  }
  
  async getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]> {
    const propertyUnits = await this.getUnitsByProperty(propertyId);
    const unitIds = propertyUnits.map(unit => unit.id);
    
    return Array.from(this.maintenanceRequests.values()).filter(
      (request) => unitIds.includes(request.unitId)
    );
  }
  
  async getMaintenanceRequestsByLandlord(landlordId: number): Promise<MaintenanceRequest[]> {
    const properties = await this.getPropertiesByOwner(landlordId);
    const requests: MaintenanceRequest[] = [];
    
    for (const property of properties) {
      const propertyRequests = await this.getMaintenanceRequestsByProperty(property.id);
      requests.push(...propertyRequests);
    }
    
    return requests;
  }
  
  async createMaintenanceRequest(insertRequest: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const id = this.currentIds.maintenanceRequest++;
    const submittedAt = new Date();
    const request: MaintenanceRequest = { ...insertRequest, id, submittedAt, completedAt: null };
    this.maintenanceRequests.set(id, request);
    return request;
  }
  
  async updateMaintenanceRequest(id: number, requestData: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const request = this.maintenanceRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestData };
    if (requestData.status === "completed" && !request.completedAt) {
      updatedRequest.completedAt = new Date();
    }
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Document operations
  async getDocument(id: number): Promise<DocType | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByOwner(ownerId: number): Promise<DocType[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.ownerId === ownerId
    );
  }
  
  async getDocumentsByProperty(propertyId: number): Promise<DocType[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.propertyId === propertyId
    );
  }
  
  async getDocumentsByUnit(unitId: number): Promise<DocType[]> {
    return Array.from(this.documents.values()).filter(
      (document) => document.unitId === unitId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<DocType> {
    const id = this.currentIds.document++;
    const createdAt = new Date();
    const document: DocType = { ...insertDocument, id, createdAt };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<DocType | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...documentData };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBetweenUsers(userOneId: number, userTwoId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => 
        (message.senderId === userOneId && message.receiverId === userTwoId) ||
        (message.senderId === userTwoId && message.receiverId === userOneId)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
  
  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === senderId
    );
  }
  
  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.receiverId === receiverId
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const sentAt = new Date();
    const message: Message = { ...insertMessage, id, sentAt };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
