import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric, real } from "drizzle-orm/pg-core";
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

// Market Analytics
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  propertyType: text("property_type").notNull(),
  bedrooms: integer("bedrooms"),
  period: text("period").notNull(), // monthly, quarterly, yearly
  date: timestamp("date").notNull(),
  averagePrice: integer("average_price").notNull(), // in local currency (BWP)
  medianPrice: integer("median_price").notNull(),
  priceChangePct: real("price_change_pct"), // percentage change from previous period
  inventory: integer("inventory"), // number of available properties
  daysOnMarket: integer("days_on_market"), // average days on market
  occupancyRate: real("occupancy_rate"), // occupancy rate percentage
  rentalYield: real("rental_yield"), // rental yield percentage
  transactionVolume: integer("transaction_volume"), // number of transactions
  additionalMetrics: jsonb("additional_metrics"), // flexible JSON for additional metrics
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertMarketDataSchema = createInsertSchema(marketData).pick({
  region: true,
  propertyType: true,
  bedrooms: true,
  period: true,
  date: true,
  averagePrice: true,
  medianPrice: true,
  priceChangePct: true,
  inventory: true,
  daysOnMarket: true,
  occupancyRate: true,
  rentalYield: true,
  transactionVolume: true,
  additionalMetrics: true,
});

export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type MarketData = typeof marketData.$inferSelect;

// Market Forecasts
export const marketForecasts = pgTable("market_forecasts", {
  id: serial("id").primaryKey(),
  region: text("region").notNull(),
  propertyType: text("property_type").notNull(),
  forecastType: text("forecast_type").notNull(), // price, rent, yield, etc.
  period: text("period").notNull(), // 3m, 6m, 1y, 2y, 5y
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  forecastValue: numeric("forecast_value").notNull(),
  confidenceLevel: real("confidence_level"), // statistical confidence
  methodology: text("methodology").notNull(), // how the forecast was calculated
  authorId: integer("author_id"), // user who created the forecast (if applicable)
  dataPoints: jsonb("data_points"), // array of forecast data points
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertMarketForecastSchema = createInsertSchema(marketForecasts).pick({
  region: true,
  propertyType: true,
  forecastType: true,
  period: true,
  startDate: true,
  endDate: true,
  forecastValue: true,
  confidenceLevel: true,
  methodology: true,
  authorId: true,
  dataPoints: true
});

export type InsertMarketForecast = z.infer<typeof insertMarketForecastSchema>;
export type MarketForecast = typeof marketForecasts.$inferSelect;

// Market Reports
export const marketReports = pgTable("market_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  region: text("region").notNull(),
  reportType: text("report_type").notNull(), // market overview, trend analysis, investment outlook
  period: text("period").notNull(), // period covered
  reportDate: timestamp("report_date").notNull(),
  content: text("content").notNull(),
  fileUrl: text("file_url"),
  authorId: integer("author_id"),
  insights: jsonb("insights"), // key market insights
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertMarketReportSchema = createInsertSchema(marketReports).pick({
  title: true,
  summary: true,
  region: true,
  reportType: true,
  period: true,
  reportDate: true,
  content: true,
  fileUrl: true,
  authorId: true,
  insights: true
});

export type InsertMarketReport = z.infer<typeof insertMarketReportSchema>;
export type MarketReport = typeof marketReports.$inferSelect;

// Landlord Ratings table - for tenants to rate landlords
export const landlordRatings = pgTable("landlord_ratings", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  propertyId: integer("property_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  communicationRating: integer("communication_rating"), // 1-5 stars
  maintenanceRating: integer("maintenance_rating"), // 1-5 stars
  valueRating: integer("value_rating"), // 1-5 stars
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const landlordRatingsRelations = relations(landlordRatings, ({ one }) => ({
  landlord: one(users, {
    fields: [landlordRatings.landlordId],
    references: [users.id],
    relationName: "landlord_ratings",
  }),
  tenant: one(users, {
    fields: [landlordRatings.tenantId],
    references: [users.id],
    relationName: "tenant_given_ratings",
  }),
  property: one(properties, {
    fields: [landlordRatings.propertyId],
    references: [properties.id],
    relationName: "property_landlord_ratings",
  }),
}));

export const insertLandlordRatingSchema = createInsertSchema(landlordRatings).pick({
  landlordId: true,
  tenantId: true,
  propertyId: true,
  rating: true,
  review: true,
  communicationRating: true,
  maintenanceRating: true,
  valueRating: true,
});

export type InsertLandlordRating = z.infer<typeof insertLandlordRatingSchema>;
export type LandlordRating = typeof landlordRatings.$inferSelect;

// Tenant Ratings table - for landlords to rate tenants
export const tenantRatings = pgTable("tenant_ratings", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  propertyId: integer("property_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  paymentRating: integer("payment_rating"), // 1-5 stars for payment timeliness
  propertyRespectRating: integer("property_respect_rating"), // 1-5 stars for property care
  communicationRating: integer("communication_rating"), // 1-5 stars for communication
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const tenantRatingsRelations = relations(tenantRatings, ({ one }) => ({
  tenant: one(users, {
    fields: [tenantRatings.tenantId],
    references: [users.id],
    relationName: "tenant_ratings",
  }),
  landlord: one(users, {
    fields: [tenantRatings.landlordId],
    references: [users.id],
    relationName: "landlord_given_ratings",
  }),
  property: one(properties, {
    fields: [tenantRatings.propertyId],
    references: [properties.id],
    relationName: "property_tenant_ratings",
  }),
}));

export const insertTenantRatingSchema = createInsertSchema(tenantRatings).pick({
  tenantId: true,
  landlordId: true,
  propertyId: true,
  rating: true,
  review: true,
  paymentRating: true,
  propertyRespectRating: true,
  communicationRating: true,
});

export type InsertTenantRating = z.infer<typeof insertTenantRatingSchema>;
export type TenantRating = typeof tenantRatings.$inferSelect;

// Financial Accounts and Transactions
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountType: text("account_type").notNull(), // bank, mobile_money, escrow
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  currency: text("currency").notNull().default("BWP"),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const financialAccountsRelations = relations(financialAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [financialAccounts.userId],
    references: [users.id],
    relationName: "user_financial_accounts",
  }),
  transactions: many(financialTransactions, { relationName: "account_transactions" }),
}));

// Financial Transactions (comprehensive transaction tracking)
export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull(),
  userId: integer("user_id").notNull(),
  transactionType: text("transaction_type").notNull(), // rent_payment, security_deposit, maintenance_fee, commission, etc.
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BWP"),
  description: text("description").notNull(),
  reference: text("reference"), // external reference number
  status: text("status").notNull().default("pending"), // pending, completed, failed, cancelled
  paymentMethod: text("payment_method").notNull(),
  relatedEntityType: text("related_entity_type"), // lease, property, maintenance_request, etc.
  relatedEntityId: integer("related_entity_id"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  account: one(financialAccounts, {
    fields: [financialTransactions.accountId],
    references: [financialAccounts.id],
    relationName: "account_transactions",
  }),
  user: one(users, {
    fields: [financialTransactions.userId],
    references: [users.id],
    relationName: "user_financial_transactions",
  }),
}));

// Property Analytics and Performance Metrics
export const propertyAnalytics = pgTable("property_analytics", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  period: text("period").notNull(), // monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  occupancyRate: real("occupancy_rate"), // percentage
  averageRent: numeric("average_rent", { precision: 10, scale: 2 }),
  totalIncome: numeric("total_income", { precision: 12, scale: 2 }),
  totalExpenses: numeric("total_expenses", { precision: 12, scale: 2 }),
  netIncome: numeric("net_income", { precision: 12, scale: 2 }),
  roi: real("roi"), // return on investment percentage
  maintenanceCosts: numeric("maintenance_costs", { precision: 10, scale: 2 }),
  vacancyDays: integer("vacancy_days"),
  tenantTurnover: integer("tenant_turnover"),
  marketValue: numeric("market_value", { precision: 12, scale: 2 }),
  appreciationRate: real("appreciation_rate"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertyAnalyticsRelations = relations(propertyAnalytics, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAnalytics.propertyId],
    references: [properties.id],
    relationName: "property_analytics",
  }),
}));

// Notification System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // payment_due, maintenance_update, lease_expiry, etc.
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  relatedEntityType: text("related_entity_type"),
  relatedEntityId: integer("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  actionRequired: boolean("action_required").notNull().default(false),
  actionUrl: text("action_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "user_notifications",
  }),
}));

// Audit Trail for all critical operations
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(), // create, update, delete, login, etc.
  entityType: text("entity_type").notNull(), // user, property, lease, payment, etc.
  entityId: integer("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
    relationName: "user_audit_logs",
  }),
}));

// Property Inspections
export const propertyInspections = pgTable("property_inspections", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  inspectorId: integer("inspector_id").notNull(),
  inspectionType: text("inspection_type").notNull(), // move_in, move_out, routine, maintenance
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  status: text("status").notNull().default("scheduled"),
  overallCondition: text("overall_condition"), // excellent, good, fair, poor
  findings: jsonb("findings"), // structured inspection data
  images: jsonb("images").$type<string[]>(),
  report: text("report"),
  actionItems: jsonb("action_items"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertyInspectionsRelations = relations(propertyInspections, ({ one }) => ({
  property: one(properties, {
    fields: [propertyInspections.propertyId],
    references: [properties.id],
    relationName: "property_inspections",
  }),
  inspector: one(users, {
    fields: [propertyInspections.inspectorId],
    references: [users.id],
    relationName: "inspector_inspections",
  }),
}));

// Lease Templates for standardization
export const leaseTemplates = pgTable("lease_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  templateContent: text("template_content").notNull(),
  propertyType: text("property_type"),
  region: text("region"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  version: text("version").notNull().default("1.0"),
  legallyReviewed: boolean("legally_reviewed").notNull().default(false),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const leaseTemplatesRelations = relations(leaseTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [leaseTemplates.createdBy],
    references: [users.id],
    relationName: "user_lease_templates",
  }),
}));

// Expense Categories for better financial tracking
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: integer("parent_category_id"),
  isActive: boolean("is_active").notNull().default(true),
  isTaxDeductible: boolean("is_tax_deductible").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expenseCategoriesRelations = relations(expenseCategories, ({ one, many }) => ({
  parentCategory: one(expenseCategories, {
    fields: [expenseCategories.parentCategoryId],
    references: [expenseCategories.id],
    relationName: "parent_expense_category",
  }),
  subCategories: many(expenseCategories, { relationName: "parent_expense_category" }),
  expenses: many(expenses, { relationName: "category_expenses" }),
}));

// Expenses tracking
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id"),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  expenseDate: timestamp("expense_date").notNull(),
  vendor: text("vendor"),
  receiptUrl: text("receipt_url"),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPeriod: text("recurring_period"), // monthly, quarterly, yearly
  isTaxDeductible: boolean("is_tax_deductible").notNull().default(false),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  property: one(properties, {
    fields: [expenses.propertyId],
    references: [properties.id],
    relationName: "property_expenses",
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
    relationName: "user_expenses",
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
    relationName: "category_expenses",
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
    relationName: "user_approved_expenses",
  }),
}));

// Property Valuation History
export const propertyValuations = pgTable("property_valuations", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  valuationType: text("valuation_type").notNull(), // market, insurance, tax, rental
  valuationAmount: numeric("valuation_amount", { precision: 12, scale: 2 }).notNull(),
  valuationDate: timestamp("valuation_date").notNull(),
  valuatorId: integer("valuator_id"),
  methodology: text("methodology"),
  comparableProperties: jsonb("comparable_properties"),
  marketConditions: text("market_conditions"),
  reportUrl: text("report_url"),
  isOfficial: boolean("is_official").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertyValuationsRelations = relations(propertyValuations, ({ one }) => ({
  property: one(properties, {
    fields: [propertyValuations.propertyId],
    references: [properties.id],
    relationName: "property_valuations",
  }),
  valuator: one(users, {
    fields: [propertyValuations.valuatorId],
    references: [users.id],
    relationName: "valuator_assessments",
  }),
}));

// Create comprehensive insert schemas for new tables
export const insertFinancialAccountSchema = createInsertSchema(financialAccounts).pick({
  userId: true,
  accountType: true,
  accountName: true,
  accountNumber: true,
  bankName: true,
  currency: true,
  balance: true,
  isActive: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).pick({
  accountId: true,
  userId: true,
  transactionType: true,
  amount: true,
  currency: true,
  description: true,
  reference: true,
  status: true,
  paymentMethod: true,
  relatedEntityType: true,
  relatedEntityId: true,
});

export const insertPropertyAnalyticsSchema = createInsertSchema(propertyAnalytics).pick({
  propertyId: true,
  period: true,
  periodStart: true,
  periodEnd: true,
  occupancyRate: true,
  averageRent: true,
  totalIncome: true,
  totalExpenses: true,
  netIncome: true,
  roi: true,
  maintenanceCosts: true,
  vacancyDays: true,
  tenantTurnover: true,
  marketValue: true,
  appreciationRate: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  priority: true,
  relatedEntityType: true,
  relatedEntityId: true,
  actionRequired: true,
  actionUrl: true,
  expiresAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  oldValues: true,
  newValues: true,
  ipAddress: true,
  userAgent: true,
  sessionId: true,
  success: true,
  errorMessage: true,
});

export const insertPropertyInspectionSchema = createInsertSchema(propertyInspections).pick({
  propertyId: true,
  inspectorId: true,
  inspectionType: true,
  scheduledDate: true,
  completedDate: true,
  status: true,
  overallCondition: true,
  findings: true,
  images: true,
  report: true,
  actionItems: true,
});

export const insertLeaseTemplateSchema = createInsertSchema(leaseTemplates).pick({
  name: true,
  description: true,
  templateContent: true,
  propertyType: true,
  region: true,
  isActive: true,
  createdBy: true,
  version: true,
  legallyReviewed: true,
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).pick({
  name: true,
  description: true,
  parentCategoryId: true,
  isActive: true,
  isTaxDeductible: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  propertyId: true,
  userId: true,
  categoryId: true,
  amount: true,
  description: true,
  expenseDate: true,
  vendor: true,
  receiptUrl: true,
  isRecurring: true,
  recurringPeriod: true,
  isTaxDeductible: true,
  status: true,
});

export const insertPropertyValuationSchema = createInsertSchema(propertyValuations).pick({
  propertyId: true,
  valuationType: true,
  valuationAmount: true,
  valuationDate: true,
  valuatorId: true,
  methodology: true,
  comparableProperties: true,
  marketConditions: true,
  reportUrl: true,
  isOfficial: true,
  expiresAt: true,
});

// Type definitions for new tables
export type InsertFinancialAccount = z.infer<typeof insertFinancialAccountSchema>;
export type FinancialAccount = typeof financialAccounts.$inferSelect;

export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;

export type InsertPropertyAnalytics = z.infer<typeof insertPropertyAnalyticsSchema>;
export type PropertyAnalytics = typeof propertyAnalytics.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertPropertyInspection = z.infer<typeof insertPropertyInspectionSchema>;
export type PropertyInspection = typeof propertyInspections.$inferSelect;

export type InsertLeaseTemplate = z.infer<typeof insertLeaseTemplateSchema>;
export type LeaseTemplate = typeof leaseTemplates.$inferSelect;

export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

export type InsertPropertyValuation = z.infer<typeof insertPropertyValuationSchema>;
export type PropertyValuation = typeof propertyValuations.$inferSelect;

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
  // Ratings relations
  landlordRatings: many(landlordRatings, { relationName: "landlord_ratings" }),
  givenLandlordRatings: many(landlordRatings, { relationName: "tenant_given_ratings" }),
  tenantRatings: many(tenantRatings, { relationName: "tenant_ratings" }),
  givenTenantRatings: many(tenantRatings, { relationName: "landlord_given_ratings" }),
  // New relations
  financialAccounts: many(financialAccounts, { relationName: "user_financial_accounts" }),
  financialTransactions: many(financialTransactions, { relationName: "user_financial_transactions" }),
  notifications: many(notifications, { relationName: "user_notifications" }),
  auditLogs: many(auditLogs, { relationName: "user_audit_logs" }),
  inspections: many(propertyInspections, { relationName: "inspector_inspections" }),
  leaseTemplates: many(leaseTemplates, { relationName: "user_lease_templates" }),
  expenses: many(expenses, { relationName: "user_expenses" }),
  approvedExpenses: many(expenses, { relationName: "user_approved_expenses" }),
  valuations: many(propertyValuations, { relationName: "valuator_assessments" }),
}));

// Enhanced property relations
export const enhancedPropertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
    relationName: "user_properties",
  }),
  leases: many(leases, { relationName: "property_leases" }),
  maintenanceRequests: many(maintenanceRequests, { relationName: "property_maintenance_requests" }),
  documents: many(documents, { relationName: "property_documents" }),
  applications: many(applications, { relationName: "property_applications" }),
  analytics: many(propertyAnalytics, { relationName: "property_analytics" }),
  inspections: many(propertyInspections, { relationName: "property_inspections" }),
  expenses: many(expenses, { relationName: "property_expenses" }),
  valuations: many(propertyValuations, { relationName: "property_valuations" }),
  landlordRatings: many(landlordRatings, { relationName: "property_landlord_ratings" }),
  tenantRatings: many(tenantRatings, { relationName: "property_tenant_ratings" }),
}));
