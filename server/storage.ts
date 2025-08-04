import { 
  type User, 
  type Property, 
  type Lease, 
  type Payment,
  type MaintenanceRequest,
  type PropertyMaintenanceSettings,
  type Message,
  type InsertUser,
  type InsertProperty,
  type InsertLease,
  type InsertPayment,
  type InsertMaintenanceRequest,
  type InsertPropertyMaintenanceSettings,
  type InsertMessage
} from "@shared/schema";
import { Application } from "express";
import { Application } from "express";
import { Application } from "express";
import { Application } from "express";
import { Application } from "express";

// Simplified storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Properties
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  getPropertiesByLandlord(landlordId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Leases
  getLease(id: number): Promise<Lease | undefined>;
  getLeasesByTenant(tenantId: number): Promise<Lease[]>;
  getLeasesByProperty(propertyId: number): Promise<Lease[]>;
  createLease(lease: InsertLease): Promise<Lease>;
  updateLease(id: number, updates: Partial<InsertLease>): Promise<Lease | undefined>;
  
  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByTenant(tenantId: number): Promise<Payment[]>;
  getPaymentsByLease(leaseId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Maintenance Requests
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]>;
  getMaintenanceRequestsByStatus(status: string): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  
  // Maintenance Bids
  getMaintenanceBids(requestId: number): Promise<any[]>;
  createMaintenanceBid(data: any): Promise<any>;
  updateMaintenanceBid(id: number, data: any): Promise<any>;
  
  // Applications
  getApplicationsByTenant(tenantId: number): Promise<any[]>;
  getApplicationsByProperty(propertyId: number): Promise<any[]>;
  getApplication(id: number): Promise<any>;
  createApplication(data: any): Promise<any>;
  updateApplication(id: number, data: any): Promise<any>;
  getApplications(): Promise<any[]>;
  
  // Property Maintenance Settings
  getPropertyMaintenanceSettings(propertyId: number): Promise<any>;
  createPropertyMaintenanceSettings(data: any): Promise<any>;
  updatePropertyMaintenanceSettings(propertyId: number, data: any): Promise<any>;
  
  // Agent Property Assignments
  getAgentPropertyAssignments(landlordId: number): Promise<any[]>;
  createAgentPropertyAssignment(data: any): Promise<any>;
  
  // Emergency Contacts
  getEmergencyContactsByUser(userId: number): Promise<any[]>;
  createEmergencyContact(data: any): Promise<any>;
  
  // Documents
  getDocumentsByUser(userId: number): Promise<any[]>;
  createDocument(data: any): Promise<any>;
  
  // Notifications
  getNotificationsByUser(userId: number): Promise<any[]>;
  createNotification(data: any): Promise<any>;
  
  // Audit Logs
  createAuditLog(data: any): Promise<any>;
  
  // Lease Terminations
  getLeaseTermination(id: number): Promise<any | undefined>;
  getLeaseTerminationByLeaseId(leaseId: number): Promise<any | undefined>;
  getLeaseTerminationsByLeaseIds(leaseIds: number[]): Promise<any[]>;
  getLeaseTerminationsByTenant(tenantId: number): Promise<any[]>;
  getLeaseTerminationsByLandlord(landlordId: number): Promise<any[]>;
  createLeaseTermination(data: any): Promise<any>;
  updateLeaseTermination(id: number, updates: any): Promise<any | undefined>;
  
  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBySender(senderId: number): Promise<Message[]>;
  getMessagesByReceiver(receiverId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, updates: Partial<InsertMessage>): Promise<Message | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private properties: Map<number, Property> = new Map();
  private leases: Map<number, Lease> = new Map();
  private payments: Map<number, Payment> = new Map();
  private maintenanceRequests: Map<number, MaintenanceRequest> = new Map();
  private messages: Map<number, Message> = new Map();
  
  private userIdCounter = 1;
  private propertyIdCounter = 1;
  private leaseIdCounter = 1;
  private paymentIdCounter = 1;
  private maintenanceRequestIdCounter = 1;
  private messageIdCounter = 1;

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    // Add test users with minimal required fields
    const testUsers = [
      {
        id: 1,
        username: 'testuser',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'landlord' as const,
        phone: '+267 71234567',
        profileImage: null,
        emergencyContactId: null,
        createdAt: new Date(),
        updatedAt: null,
        isEmergencyProvider: false,
        emergencyAvailability: null,
        emergencySpecialties: null,
        emergencyResponseTime: null,
        emergencyContactInfo: null,
        emergencyServiceRadius: null,
        emergencyRating: null,
        // Verification fields (default values)
        verificationStatus: 'unverified',
        verificationSubmittedAt: null,
        verificationApprovedAt: null,
        verificationExpiresAt: null,
        verificationNotes: null,
        monthlyIncome: null,
        employmentStatus: null,
        verificationBadge: 'none'
      },
      {
        id: 2,
        username: 'tenant',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'Tenant',
        email: 'tenant@example.com',
        role: 'tenant' as const,
        phone: '+267 72345678',
        profileImage: null,
        emergencyContactId: null,
        createdAt: new Date(),
        updatedAt: null,
        isEmergencyProvider: false,
        emergencyAvailability: null,
        emergencySpecialties: null,
        emergencyResponseTime: null,
        emergencyContactInfo: null,
        emergencyServiceRadius: null,
        emergencyRating: null,
        // Verification fields (default values)
        verificationStatus: 'unverified',
        verificationSubmittedAt: null,
        verificationApprovedAt: null,
        verificationExpiresAt: null,
        verificationNotes: null,
        monthlyIncome: null,
        employmentStatus: null,
        verificationBadge: 'none'
      },
      {
        id: 3,
        username: 'agency',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'Agency',
        email: 'agency@example.com',
        role: 'agency' as const,
        phone: '+267 73456789',
        profileImage: null,
        emergencyContactId: null,
        createdAt: new Date(),
        updatedAt: null,
        isEmergencyProvider: false,
        emergencyAvailability: null,
        emergencySpecialties: null,
        emergencyResponseTime: null,
        emergencyContactInfo: null,
        emergencyServiceRadius: null,
        emergencyRating: null,
        // Verification fields (default values)
        verificationStatus: 'unverified',
        verificationSubmittedAt: null,
        verificationApprovedAt: null,
        verificationExpiresAt: null,
        verificationNotes: null,
        monthlyIncome: null,
        employmentStatus: null,
        verificationBadge: 'none'
      }
    ];

    testUsers.forEach(user => this.users.set(user.id, user));
    this.userIdCounter = 4;

    // Add test properties
    const testProperties = [
      {
        id: 1,
        landlordId: 1,
        agencyId: null || null,
        title: 'Modern Apartment in Gaborone',
        description: 'A beautiful 2-bedroom apartment in the heart of Gaborone',
        address: '123 Main Street',
        city: 'Gaborone',
        state: 'South East',
        zipCode: '00000',
        location: 'Gaborone CBD',
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        squareMeters: 120,
        parkingSpaces: 1,
        yearBuilt: 2020,
        rentAmount: 8000,
        securityDeposit: 8000,
        available: true,
        availableDate: new Date(),
        isListed: false, // Add isListed field - default to private
        minLeaseTerm: 12,
        maxLeaseTerm: 24,
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
        amenities: ['Parking', 'Security', 'Pool'],
        createdAt: new Date(),
        updatedAt: null
      },
      {
        id: 2,
        landlordId: 1,
        agencyId: null || null,
        title: 'Family House with Garden',
        description: 'Spacious 3-bedroom house with a beautiful garden',
        address: '456 Oak Avenue',
        city: 'Gaborone',
        state: 'South East',
        zipCode: '00001',
        location: 'Extension 15',
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 180,
        parkingSpaces: 2,
        yearBuilt: 2018,
        rentAmount: 12000,
        securityDeposit: 12000,
        available: true,
        availableDate: new Date(),
        isListed: false, // Add isListed field - default to private
        minLeaseTerm: 12,
        maxLeaseTerm: 36,
        images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'],
        amenities: ['Garden', 'Garage', 'Study Room'],
        createdAt: new Date(),
        updatedAt: null
      }
    ];

    testProperties.forEach(property => this.properties.set(property.id, property));
    this.propertyIdCounter = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      ...userData,
      createdAt: new Date(),
      updatedAt: null,
      isEmergencyProvider: false,
      emergencyAvailability: null,
      emergencySpecialties: null,
      emergencyResponseTime: null,
      emergencyContactInfo: null,
      emergencyServiceRadius: null,
      emergencyRating: null
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getPropertiesByLandlord(landlordId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      property => property.landlordId === landlordId
    );
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const property: Property = {
      propertyCategory: "residential" as const,
      id: this.propertyIdCounter++,
      ...propertyData,
      createdAt: new Date(),
      updatedAt: null
    };
    this.properties.set(property.id, property);
    return property;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;

    const updatedProperty = { ...property, ...updates, updatedAt: new Date() };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const property = this.properties.get(id);
    if (!property) return false;

    this.properties.delete(id);
    return true;
  }

  // Lease methods
  async getLease(id: number): Promise<Lease | undefined> {
    return this.leases.get(id);
  }

  async getLeasesByTenant(tenantId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(lease => lease.tenantId === tenantId);
  }

  async getLeasesByProperty(propertyId: number): Promise<Lease[]> {
    return Array.from(this.leases.values()).filter(lease => lease.propertyId === propertyId);
  }

  async createLease(leaseData: InsertLease): Promise<Lease> {
    const lease: Lease = {
      id: this.leaseIdCounter++,
      ...leaseData,
      createdAt: new Date(),
      updatedAt: null
    };
    this.leases.set(lease.id, lease);
    return lease;
  }

  async updateLease(id: number, updates: Partial<InsertLease>): Promise<Lease | undefined> {
    const lease = this.leases.get(id);
    if (!lease) return undefined;

    const updatedLease = { ...lease, ...updates, updatedAt: new Date() };
    this.leases.set(id, updatedLease);
    return updatedLease;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByTenant(tenantId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.tenantId === tenantId);
  }

  async getPaymentsByLease(leaseId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.leaseId === leaseId);
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      id: this.paymentIdCounter++,
      ...paymentData,
      createdAt: new Date(),
      updatedAt: null
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Maintenance Request methods
  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }

  async getMaintenanceRequestsByTenant(tenantId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      request => request.tenantId === tenantId
    );
  }

  async getMaintenanceRequestsByProperty(propertyId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      request => request.propertyId === propertyId
    );
  }

  async getMaintenanceRequestsByStatus(status: string): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(
      request => request.status === status
    );
  }

  async createMaintenanceRequest(requestData: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const request: MaintenanceRequest = {
      id: this.maintenanceRequestIdCounter++,
      ...requestData,
      createdAt: new Date(),
      updatedAt: null
    };
    this.maintenanceRequests.set(request.id, request);
    return request;
  }

  async updateMaintenanceRequest(id: number, updates: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const request = this.maintenanceRequests.get(id);
    if (!request) return undefined;

    const updatedRequest = { ...request, ...updates, updatedAt: new Date() };
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getPropertyById(id: number): Promise<Property | undefined> {
    return this.getProperty(id);
  }

  async getMaintenanceRequestsByAssignee(assigneeId: number): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values())
      .filter(request => request.assignedToId === assigneeId);
  }

  async getPropertyMaintenanceSettings(propertyId: number): Promise<PropertyMaintenanceSettings | undefined> {
    return Array.from(this.propertyMaintenanceSettings.values())
      .find(settings => settings.propertyId === propertyId);
  }

  async getApplicationsByTenant(tenantId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.tenantId === tenantId);
  }

  async getApplicationsByProperty(propertyId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.propertyId === propertyId);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async createApplication(data: any): Promise<Application> {
    const id = this.applications.size + 1;
    const application = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: null
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, data: any): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (application) {
      const updated = { ...application, ...data, updatedAt: new Date() };
      this.applications.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // ===== MESSAGE METHODS =====
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBySender(senderId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === senderId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async getMessagesByReceiver(receiverId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === receiverId)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      id,
      ...messageData,
      sentAt: new Date(),
      read: false
    };
    this.messages.set(id, message);
    return message;
  }

  async updateMessage(id: number, updates: Partial<InsertMessage>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (message) {
      const updated = { ...message, ...updates };
      this.messages.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Placeholder implementations for missing methods
  async getPropertyMaintenanceSettings(propertyId: number): Promise<any> {
    return null;
  }

  async createPropertyMaintenanceSettings(data: any): Promise<any> {
    return data;
  }

  async updatePropertyMaintenanceSettings(propertyId: number, data: any): Promise<any> {
    return data;
  }

  async getAgentPropertyAssignments(landlordId: number): Promise<any[]> {
    return [];
  }

  async createAgentPropertyAssignment(data: any): Promise<any> {
    return data;
  }

  async getEmergencyContactsByUser(userId: number): Promise<any[]> {
    return [];
  }

  async createEmergencyContact(data: any): Promise<any> {
    return data;
  }

  async getDocumentsByUser(userId: number): Promise<any[]> {
    return [];
  }

  async createDocument(data: any): Promise<any> {
    return data;
  }

  async getNotificationsByUser(userId: number): Promise<any[]> {
    return [];
  }

  async createNotification(data: any): Promise<any> {
    return data;
  }

  async createAuditLog(data: any): Promise<any> {
    return data;
  }
}

// Export storage instance
export const storage = new MemStorage();