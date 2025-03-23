import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: text("property_type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  squareFeet: integer("square_feet"),
  rentAmount: integer("rent_amount").notNull(),
  description: text("description"),
  available: boolean("available").notNull().default(true),
  images: jsonb("images").$type<string[]>(),
});

export const insertPropertySchema = createInsertSchema(properties).pick({
  landlordId: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  propertyType: true,
  bedrooms: true,
  bathrooms: true,
  squareFeet: true,
  rentAmount: true,
  description: true,
  available: true,
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
});

export const insertLeaseSchema = createInsertSchema(leases).pick({
  propertyId: true,
  tenantId: true,
  startDate: true,
  endDate: true,
  rentAmount: true,
  securityDeposit: true,
  documentUrl: true,
  active: true,
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentType: text("payment_type").notNull(),
  description: text("description"),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  leaseId: true,
  tenantId: true,
  amount: true,
  paymentDate: true,
  paymentType: true,
  description: true,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  assignedToId: integer("assigned_to_id"),
  images: jsonb("images").$type<string[]>(),
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).pick({
  propertyId: true,
  tenantId: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  assignedToId: true,
  images: true,
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

export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
