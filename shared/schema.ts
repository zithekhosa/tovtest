import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User role types
export const UserRole = {
  TENANT: "tenant",
  LANDLORD: "landlord",
  AGENCY: "agency",
  MAINTENANCE: "maintenance",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().$type<UserRoleType>(),
  phone: text("phone"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  phone: true,
  profileImage: true,
});

// Property table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull(),
  title: text("title").notNull().default("Property Listing"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  location: text("location").notNull(),
  propertyType: text("property_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFootage: integer("square_footage"),
  parkingSpaces: integer("parking_spaces").default(0),
  yearBuilt: integer("year_built"),
  rentAmount: integer("rent_amount").notNull(),
  securityDeposit: integer("security_deposit").notNull(),
  description: text("description"),
  available: boolean("available").notNull().default(true),
  availableDate: timestamp("available_date").notNull().defaultNow(),
  minLeaseTerm: integer("min_lease_term").default(12),
  amenities: jsonb("amenities").$type<string[]>(),
  images: jsonb("images").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
    relationName: "user_properties",
  }),
  leases: many(leases, { relationName: "property_leases" }),
  maintenanceRequests: many(maintenanceRequests, { relationName: "property_maintenance_requests" }),
  documents: many(documents, { relationName: "property_documents" }),
  applications: many(applications, { relationName: "property_applications" }),
}));

export const insertPropertySchema = createInsertSchema(properties).pick({
  landlordId: true,
  title: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  location: true,
  propertyType: true,
  bedrooms: true,
  bathrooms: true,
  squareFootage: true,
  parkingSpaces: true,
  yearBuilt: true,
  rentAmount: true,
  securityDeposit: true,
  description: true,
  available: true,
  availableDate: true,
  minLeaseTerm: true,
  amenities: true,
  images: true,
});

// Lease table
export const leases = pgTable("leases", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  rentAmount: integer("rent_amount").notNull(),
  securityDeposit: integer("security_deposit").notNull(),
  documentUrl: text("document_url"),
  active: boolean("active").notNull().default(true),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const leasesRelations = relations(leases, ({ one, many }) => ({
  property: one(properties, {
    fields: [leases.propertyId],
    references: [properties.id],
    relationName: "property_leases",
  }),
  tenant: one(users, {
    fields: [leases.tenantId],
    references: [users.id],
    relationName: "user_leases",
  }),
  payments: many(payments, { relationName: "lease_payments" }),
}));

export const insertLeaseSchema = createInsertSchema(leases).pick({
  propertyId: true,
  tenantId: true,
  startDate: true,
  endDate: true,
  rentAmount: true,
  securityDeposit: true,
  documentUrl: true,
  active: true,
  status: true,
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentType: text("payment_type").notNull(),
  paymentMethod: text("payment_method").notNull().default("bank transfer"),
  description: text("description"),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  lease: one(leases, {
    fields: [payments.leaseId],
    references: [leases.id],
    relationName: "lease_payments",
  }),
  tenant: one(users, {
    fields: [payments.tenantId],
    references: [users.id],
    relationName: "user_payments",
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).pick({
  leaseId: true,
  tenantId: true,
  amount: true,
  paymentDate: true,
  paymentType: true,
  paymentMethod: true,
  description: true,
  status: true,
});

// Maintenance Requests
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull(),
  category: text("category").default("general"),
  estimatedCost: integer("estimated_cost"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  assignedToId: integer("assigned_to_id"),
  images: jsonb("images").$type<string[]>(),
});

export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one, many }) => ({
  property: one(properties, {
    fields: [maintenanceRequests.propertyId],
    references: [properties.id],
    relationName: "property_maintenance_requests",
  }),
  tenant: one(users, {
    fields: [maintenanceRequests.tenantId],
    references: [users.id],
    relationName: "user_maintenance_requests",
  }),
  assignedTo: one(users, {
    fields: [maintenanceRequests.assignedToId],
    references: [users.id],
    relationName: "assigned_maintenance_requests",
  }),
  bids: many(maintenanceBids, { relationName: "maintenance_request_bids" }),
}));

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).pick({
  propertyId: true,
  tenantId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  category: true,
  estimatedCost: true,
  isPublic: true,
  assignedToId: true,
  images: true,
});

// Maintenance Jobs (marketplace listings)
export const maintenanceJobs = pgTable("maintenance_jobs", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  availability: text("availability").notNull(),
  rating: integer("rating"),
  images: jsonb("images").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const maintenanceJobsRelations = relations(maintenanceJobs, ({ one }) => ({
  provider: one(users, {
    fields: [maintenanceJobs.providerId],
    references: [users.id],
    relationName: "user_maintenance_jobs",
  }),
}));

export const insertMaintenanceJobSchema = createInsertSchema(maintenanceJobs).pick({
  providerId: true,
  title: true,
  description: true,
  price: true,
  category: true,
  availability: true,
  rating: true,
  images: true,
});

// Maintenance Bids
export const maintenanceBids = pgTable("maintenance_bids", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  providerId: integer("provider_id").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  estimatedDuration: text("estimated_duration").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const maintenanceBidsRelations = relations(maintenanceBids, ({ one }) => ({
  request: one(maintenanceRequests, {
    fields: [maintenanceBids.requestId],
    references: [maintenanceRequests.id],
    relationName: "maintenance_request_bids",
  }),
  provider: one(users, {
    fields: [maintenanceBids.providerId],
    references: [users.id],
    relationName: "provider_bids",
  }),
}));

export const insertMaintenanceBidSchema = createInsertSchema(maintenanceBids).pick({
  requestId: true,
  providerId: true,
  amount: true,
  description: true,
  estimatedDuration: true,
  status: true,
});

// Rental Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  status: text("status").notNull().default("pending"),
  moveInDate: timestamp("move_in_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  property: one(properties, {
    fields: [applications.propertyId],
    references: [properties.id],
    relationName: "property_applications",
  }),
  tenant: one(users, {
    fields: [applications.tenantId],
    references: [users.id],
    relationName: "user_applications",
  }),
}));

export const insertApplicationSchema = createInsertSchema(applications).pick({
  propertyId: true,
  tenantId: true,
  status: true,
  moveInDate: true,
  notes: true,
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id"),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  documentType: text("document_type").notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
    relationName: "user_documents",
  }),
  property: one(properties, {
    fields: [documents.propertyId],
    references: [properties.id],
    relationName: "property_documents",
  }),
}));

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  propertyId: true,
  fileName: true,
  fileUrl: true,
  fileType: true,
  documentType: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "user_sent_messages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "user_received_messages",
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  content: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type Lease = typeof leases.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type PaymentWithDetails = Payment & {
  lease?: Lease;
  property?: Property;
};

export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type MaintenanceRequestWithBids = MaintenanceRequest & {
  bids: MaintenanceBid[];
  property?: Property;
};

export type InsertMaintenanceJob = z.infer<typeof insertMaintenanceJobSchema>;
export type MaintenanceJob = typeof maintenanceJobs.$inferSelect;

export type InsertMaintenanceBid = z.infer<typeof insertMaintenanceBidSchema>;
export type MaintenanceBid = typeof maintenanceBids.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type ApplicationWithProperty = Application & {
  property: Property;
};

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Now that all tables are defined, we can add user relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties, { relationName: "user_properties" }),
  leases: many(leases, { relationName: "user_leases" }),
  payments: many(payments, { relationName: "user_payments" }),
  maintenanceRequests: many(maintenanceRequests, { relationName: "user_maintenance_requests" }),
  documents: many(documents, { relationName: "user_documents" }),
  sentMessages: many(messages, { relationName: "user_sent_messages" }),
  receivedMessages: many(messages, { relationName: "user_received_messages" }),
  maintenanceJobs: many(maintenanceJobs, { relationName: "user_maintenance_jobs" }),
  applications: many(applications, { relationName: "user_applications" }),
}));
