import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, numeric, real } from "drizzle-orm/pg-core";
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

// Verification status types
export const VerificationStatus = {
  UNVERIFIED: "unverified",
  PENDING: "pending", 
  BASIC_VERIFIED: "basic_verified",
  PREMIUM_VERIFIED: "premium_verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatusType = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const VerificationBadge = {
  NONE: "none",
  VERIFIED: "verified",
  INCOME_VERIFIED: "income_verified", 
} as const;

export type VerificationBadgeType = (typeof VerificationBadge)[keyof typeof VerificationBadge];

// Application decision types
export const ApplicationDecision = {
  PENDING: "pending",
  APPROVED: "approved", 
  REJECTED: "rejected",
} as const;

export type ApplicationDecisionType = (typeof ApplicationDecision)[keyof typeof ApplicationDecision];

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
  emergencyContactId: integer("emergency_contact_id"), // NEW: Reference to emergency contact
  // Emergency provider fields
  isEmergencyProvider: boolean("is_emergency_provider").default(false),
  emergencyAvailability: text("emergency_availability").default("none"), // "24/7" | "business_hours" | "on_call" | "none"
  emergencySpecialties: jsonb("emergency_specialties").$type<string[]>(), // ["plumbing", "electrical", "hvac", "security"]
  emergencyResponseTime: integer("emergency_response_time"), // Minutes to respond
  emergencyContactPhone: text("emergency_contact_phone"), // Dedicated emergency line
  emergencyRating: real("emergency_rating").default(0), // Emergency service rating
  lastEmergencyResponse: timestamp("last_emergency_response"), // Track response history
  // Verification fields
  verificationStatus: text("verification_status").default("unverified").$type<VerificationStatusType>(),
  verificationSubmittedAt: timestamp("verification_submitted_at"),
  verificationApprovedAt: timestamp("verification_approved_at"),  
  verificationExpiresAt: timestamp("verification_expires_at"),
  verificationNotes: text("verification_notes"), // Internal staff notes
  monthlyIncome: integer("monthly_income"), // Extracted from bank slip
  employmentStatus: text("employment_status"), // "employed", "self_employed", "student", "unemployed"
  verificationBadge: text("verification_badge").default("none").$type<VerificationBadgeType>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.string(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  emergencyContactId: z.number().optional(),
  isEmergencyProvider: z.boolean().optional(),
  emergencyAvailability: z.enum(["24/7", "business_hours", "on_call", "none"]).optional(),
  emergencySpecialties: z.array(z.string()).optional(),
  emergencyResponseTime: z.number().optional(),
  emergencyContactPhone: z.string().optional(),
  // Verification fields (optional for user creation)
  verificationStatus: z.enum(["unverified", "pending", "basic_verified", "premium_verified", "rejected"]).optional(),
  verificationSubmittedAt: z.date().optional(),
  verificationApprovedAt: z.date().optional(),
  verificationExpiresAt: z.date().optional(),
  verificationNotes: z.string().optional(),
  monthlyIncome: z.number().optional(),
  employmentStatus: z.enum(["employed", "self_employed", "student", "unemployed"]).optional(),
  verificationBadge: z.enum(["none", "verified", "income_verified"]).optional(),
});

// Emergency Contacts table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // User this contact belongs to
  name: text("name").notNull(),
  relationship: text("relationship").notNull(), // "family", "friend", "property_manager", "maintenance_company"
  phone: text("phone").notNull(),
  email: text("email"),
  isPrimary: boolean("is_primary").default(false),
  canAuthorizeEmergencyWork: boolean("can_authorize_emergency_work").default(false),
  maxAuthorizationAmount: integer("max_authorization_amount"), // Max amount they can authorize
  availableHours: text("available_hours").default("24/7"), // When they're available
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const emergencyContactsRelations = relations(emergencyContacts, ({ one }) => ({
  user: one(users, {
    fields: [emergencyContacts.userId],
    references: [users.id],
    relationName: "user_emergency_contacts",
  }),
}));

export const insertEmergencyContactSchema = z.object({
  userId: z.number(),
  name: z.string(),
  relationship: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  isPrimary: z.boolean().optional(),
  canAuthorizeEmergencyWork: z.boolean().optional(),
  maxAuthorizationAmount: z.number().optional(),
  availableHours: z.string().optional(),
  notes: z.string().optional(),
});

// Emergency Escalation Rules table
export const emergencyEscalationRules = pgTable("emergency_escalation_rules", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  escalationLevel: integer("escalation_level").notNull(), // 1, 2, 3, etc.
  triggerCondition: text("trigger_condition").notNull(), // "no_response_15min", "no_response_30min", "high_cost", "safety_critical"
  actionType: text("action_type").notNull(), // "notify_emergency_contact", "auto_approve", "call_emergency_services", "escalate_to_manager"
  targetContactId: integer("target_contact_id"), // Emergency contact to notify
  maxCostAuthorization: integer("max_cost_authorization"), // Max cost to auto-approve at this level
  notificationMethods: jsonb("notification_methods").$type<string[]>(), // ["sms", "call", "email", "push"]
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const emergencyEscalationRulesRelations = relations(emergencyEscalationRules, ({ one }) => ({
  property: one(properties, {
    fields: [emergencyEscalationRules.propertyId],
    references: [properties.id],
    relationName: "property_emergency_rules",
  }),
  landlord: one(users, {
    fields: [emergencyEscalationRules.landlordId],
    references: [users.id],
    relationName: "landlord_emergency_rules",
  }),
  targetContact: one(emergencyContacts, {
    fields: [emergencyEscalationRules.targetContactId],
    references: [emergencyContacts.id],
    relationName: "emergency_contact_rules",
  }),
}));

export const insertEmergencyEscalationRuleSchema = z.object({
  propertyId: z.number(),
  landlordId: z.number(),
  escalationLevel: z.number(),
  triggerCondition: z.string(),
  actionType: z.string(),
  targetContactId: z.number().optional(),
  maxCostAuthorization: z.number().optional(),
  notificationMethods: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Property table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  landlordId: integer("landlord_id").notNull(),
  agencyId: integer("agency_id"), // NEW: Agency managing this property
  title: text("title").notNull().default("Property Listing"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  location: text("location").notNull(),
  plotNumber: text("plot_number").notNull(),
  unitNumber: text("unit_number"), // Optional unit number for apartments/complexes
  propertyType: text("property_type").notNull(),
  // NEW: Property category for multi-type support
  propertyCategory: text("property_category").notNull().default("residential"), // "residential" | "commercial"
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareMeters: integer("square_meters"),
  parkingSpaces: integer("parking_spaces").default(0),
  yearBuilt: integer("year_built"),
  rentAmount: integer("rent_amount").notNull(),
  securityDeposit: integer("security_deposit").notNull(),
  description: text("description"),
  available: boolean("available").notNull().default(true),
  availableDate: timestamp("available_date").notNull().defaultNow(),
  isListed: boolean("is_listed").notNull().default(false), // NEW: Controls if property appears in public browser
  minLeaseTerm: integer("min_lease_term").default(12),
  amenities: jsonb("amenities").$type<string[]>(),
  images: jsonb("images").$type<string[]>(),
  managementType: text("management_type").default("direct"), // NEW: direct or agency
  commissionRate: real("commission_rate").default(8.5), // NEW: Default 8.5% commission
  leaseTemplateId: integer("lease_template_id"), // NEW: Reference to lease template
  // NEW: Commercial-specific fields
  squareFootage: integer("square_footage"), // Commercial property size in sq ft
  annualRent: integer("annual_rent"), // Annual rent for commercial properties
  zoning: text("zoning"), // Zoning classification for commercial properties
  commercialType: text("commercial_type"), // "office" | "retail" | "warehouse" | "industrial"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
    relationName: "user_properties",
  }),
  agency: one(users, {
    fields: [properties.agencyId],
    references: [users.id],
    relationName: "agency_properties",
  }),
  leases: many(leases, { relationName: "property_leases" }),
  maintenanceRequests: many(maintenanceRequests, { relationName: "property_maintenance_requests" }),
  documents: many(documents, { relationName: "property_documents" }),
  applications: many(applications, { relationName: "property_applications" }),
  maintenanceSettings: one(propertyMaintenanceSettings, {
    fields: [properties.id],
    references: [propertyMaintenanceSettings.propertyId],
    relationName: "property_maintenance_settings"
  }),
  agentAssignments: many(agentPropertyAssignments, { relationName: "property_agent_assignments" }),
  agentBids: many(agentAssignmentBids, { relationName: "property_agent_bids" }),
}));

export const insertPropertySchema = z.object({
  landlordId: z.number(),
  agencyId: z.number().optional(),
  title: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  location: z.string(),
  plotNumber: z.string(),
  unitNumber: z.string().optional(),
  propertyType: z.string(),
  // NEW: Property category validation
  propertyCategory: z.enum(["residential", "commercial"]).default("residential"),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  squareMeters: z.number().optional(),
  parkingSpaces: z.number().optional(),
  yearBuilt: z.number().optional(),
  rentAmount: z.number(),
  securityDeposit: z.number(),
  description: z.string().optional(),
  available: z.boolean().optional(),
  availableDate: z.date().optional(),
  isListed: z.boolean().optional(),
  minLeaseTerm: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  managementType: z.string().optional(),
  commissionRate: z.number().optional(),
  // NEW: Commercial-specific field validation
  squareFootage: z.number().optional(),
  annualRent: z.number().optional(),
  zoning: z.string().optional(),
  commercialType: z.enum(["office", "retail", "warehouse", "industrial"]).optional(),
}).refine((data) => {
  // Validation for residential properties
  if (data.propertyCategory === "residential") {
    return data.bedrooms !== undefined && data.bathrooms !== undefined;
  }
  // Validation for commercial properties
  if (data.propertyCategory === "commercial") {
    return data.squareFootage !== undefined && data.commercialType !== undefined;
  }
  return true;
}, {
  message: "Residential properties require bedrooms and bathrooms. Commercial properties require squareFootage and commercialType.",
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
  evictionStatus: text("eviction_status").default("none"), // NEW: none, pending, evicted
  renewalDate: timestamp("renewal_date"), // NEW: Date when lease can be renewed
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

export const insertLeaseSchema = z.object({
  propertyId: z.number(),
  tenantId: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  rentAmount: z.number(),
  securityDeposit: z.number(),
  documentUrl: z.string().optional(),
  active: z.boolean().optional(),
  status: z.string().optional(),
  evictionStatus: z.string().optional(),
  renewalDate: z.date().optional(),
});

// Lease Terminations table
export const leaseTerminations = pgTable("lease_terminations", {
  id: serial("id").primaryKey(),
  leaseId: integer("lease_id").notNull(),
  initiatedBy: text("initiated_by").notNull(), // 'landlord' | 'tenant'
  reason: text("reason").notNull(), // 'non_payment' | 'lease_violation' | 'early_exit' | 'mutual_agreement' | 'eviction' | 'natural_expiry'
  noticeDate: timestamp("notice_date").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  noticePeriodDays: integer("notice_period_days").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled'
  terminationFee: integer("termination_fee").default(0),
  securityDepositRefund: integer("security_deposit_refund"),
  outstandingBalance: integer("outstanding_balance").default(0),
  documentUrl: text("document_url"),
  legalNotes: text("legal_notes"),
  inspectionScheduled: timestamp("inspection_scheduled"),
  inspectionCompleted: timestamp("inspection_completed"),
  keyReturnDate: timestamp("key_return_date"),
  finalUtilityReading: text("final_utility_reading"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const leaseTerminationsRelations = relations(leaseTerminations, ({ one }) => ({
  lease: one(leases, {
    fields: [leaseTerminations.leaseId],
    references: [leases.id],
    relationName: "lease_terminations",
  }),
}));

export const insertLeaseTerminationSchema = z.object({
  leaseId: z.number(),
  initiatedBy: z.enum(['landlord', 'tenant']),
  reason: z.enum(['non_payment', 'lease_violation', 'early_exit', 'mutual_agreement', 'eviction', 'natural_expiry', 'relocation', 'financial_hardship', 'property_issues', 'safety_concerns', 'health_emergency', 'domestic_violence', 'job_loss', 'family_emergency']),
  noticeDate: z.string().or(z.date()),
  effectiveDate: z.string().or(z.date()),
  noticePeriodDays: z.number(),
  status: z.enum(['pending', 'active', 'completed', 'disputed', 'cancelled']).optional(),
  terminationFee: z.number().optional(),
  securityDepositRefund: z.number().optional(),
  outstandingBalance: z.number().optional(),
  documentUrl: z.string().optional(),
  legalNotes: z.string().optional(),
  inspectionScheduled: z.string().or(z.date()).optional(),
  inspectionCompleted: z.string().or(z.date()).optional(),
  keyReturnDate: z.string().or(z.date()).optional(),
  finalUtilityReading: z.string().optional(),
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

export const insertPaymentSchema = z.object({
  leaseId: z.number(),
  tenantId: z.number(),
  amount: z.number(),
  paymentDate: z.date(),
  paymentType: z.string(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
});

// Maintenance Requests - Enhanced for workflow support
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
  // NEW: Workflow support fields
  paymentPreference: text("payment_preference").default("landlord"), // "tenant" | "landlord"
  approvalStatus: text("approval_status").default("pending"), // "pending" | "approved" | "denied" | "not_required"
  approvalDate: timestamp("approval_date"),
  approvedById: integer("approved_by_id"),
  denialReason: text("denial_reason"),
  workflowStatus: text("workflow_status").default("submitted"), // "submitted" | "approved" | "bidding" | "assigned" | "in_progress" | "completed" | "cancelled"
  selectedBidId: integer("selected_bid_id"),
  completionDate: timestamp("completion_date"),
  tenantRating: integer("tenant_rating"), // 1-5 stars
  tenantReview: text("tenant_review"),
  isEmergency: boolean("is_emergency").default(false),
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

export const insertMaintenanceRequestSchema = z.object({
  propertyId: z.number(),
  tenantId: z.number(),
  title: z.string(),
  description: z.string(),
  status: z.string().optional(),
  priority: z.string(),
  category: z.string().optional(),
  estimatedCost: z.number().optional(),
  isPublic: z.boolean().optional(),
  assignedToId: z.number().optional(),
  images: z.array(z.string()).optional(),
  // NEW: Workflow fields
  paymentPreference: z.string().optional(),
  approvalStatus: z.string().optional(),
  workflowStatus: z.string().optional(),
  isEmergency: z.boolean().optional(),
});

// Emergency Request Tracking table
export const emergencyRequestTracking = pgTable("emergency_request_tracking", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().unique(),
  emergencyLevel: text("emergency_level").notNull(), // "critical", "high", "medium"
  emergencyType: text("emergency_type").notNull(), // "safety", "security", "water", "electrical", "hvac", "structural"
  autoApproved: boolean("auto_approved").default(false),
  escalationLevel: integer("escalation_level").default(0), // Current escalation level
  lastEscalationAt: timestamp("last_escalation_at"),
  emergencyContactsNotified: jsonb("emergency_contacts_notified").$type<number[]>(), // Array of contact IDs notified
  emergencyProvidersNotified: jsonb("emergency_providers_notified").$type<number[]>(), // Array of provider IDs notified
  responseDeadline: timestamp("response_deadline").notNull(), // When response is required by
  firstResponseAt: timestamp("first_response_at"), // When first provider responded
  assignedEmergencyProviderId: integer("assigned_emergency_provider_id"), // Emergency provider assigned
  emergencyResolved: boolean("emergency_resolved").default(false),
  resolutionTime: integer("resolution_time"), // Minutes from creation to resolution
  emergencyNotes: text("emergency_notes"), // Special notes for emergency handling
  notificationOverrides: jsonb("notification_overrides").$type<string[]>(), // ["sms", "call", "email"] - override user preferences
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const emergencyRequestTrackingRelations = relations(emergencyRequestTracking, ({ one }) => ({
  request: one(maintenanceRequests, {
    fields: [emergencyRequestTracking.requestId],
    references: [maintenanceRequests.id],
    relationName: "emergency_request_tracking",
  }),
  assignedEmergencyProvider: one(users, {
    fields: [emergencyRequestTracking.assignedEmergencyProviderId],
    references: [users.id],
    relationName: "emergency_provider_assignments",
  }),
}));

export const insertEmergencyRequestTrackingSchema = z.object({
  requestId: z.number(),
  emergencyLevel: z.enum(["critical", "high", "medium"]),
  emergencyType: z.enum(["safety", "security", "water", "electrical", "hvac", "structural"]),
  autoApproved: z.boolean().optional(),
  escalationLevel: z.number().optional(),
  emergencyContactsNotified: z.array(z.number()).optional(),
  emergencyProvidersNotified: z.array(z.number()).optional(),
  responseDeadline: z.date(),
  assignedEmergencyProviderId: z.number().optional(),
  emergencyNotes: z.string().optional(),
  notificationOverrides: z.array(z.string()).optional(),
});

// NEW: Property Maintenance Settings table
export const propertyMaintenanceSettings = pgTable("property_maintenance_settings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().unique(),
  landlordId: integer("landlord_id").notNull(),
  // Payment responsibility settings
  paymentResponsibility: text("payment_responsibility").notNull().default("landlord"), // "landlord" | "tenant" | "split"
  tenantPaymentLimit: integer("tenant_payment_limit"), // Amount tenant pays up to (for split)
  // Approval process settings
  approvalRequired: text("approval_required").notNull().default("all"), // "all" | "over_amount" | "none"
  autoApprovalLimit: integer("auto_approval_limit"), // Auto-approve under this amount
  // Visibility and notification settings
  alwaysNotify: boolean("always_notify").notNull().default(true), // Always notify landlord
  requirePhotos: boolean("require_photos").notNull().default(true), // Require photos with requests
  requireCompletionPhotos: boolean("require_completion_photos").notNull().default(true), // Require completion photos
  // Emergency settings
  emergencyAutoApprove: boolean("emergency_auto_approve").notNull().default(true), // Auto-approve emergency requests
  emergencyContactOverride: boolean("emergency_contact_override").notNull().default(false), // Use emergency contact for urgent issues
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const propertyMaintenanceSettingsRelations = relations(propertyMaintenanceSettings, ({ one }) => ({
  property: one(properties, {
    fields: [propertyMaintenanceSettings.propertyId],
    references: [properties.id],
    relationName: "property_maintenance_settings",
  }),
  landlord: one(users, {
    fields: [propertyMaintenanceSettings.landlordId],
    references: [users.id],
    relationName: "landlord_maintenance_settings",
  }),
}));

export const insertPropertyMaintenanceSettingsSchema = z.object({
  propertyId: z.number(),
  landlordId: z.number(),
  paymentResponsibility: z.enum(["landlord", "tenant", "split"]).default("landlord"),
  tenantPaymentLimit: z.number().optional(),
  approvalRequired: z.enum(["all", "over_amount", "none"]).default("all"),
  autoApprovalLimit: z.number().optional(),
  alwaysNotify: z.boolean().default(true),
  requirePhotos: z.boolean().default(true),
  requireCompletionPhotos: z.boolean().default(true),
  emergencyAutoApprove: z.boolean().default(true),
  emergencyContactOverride: z.boolean().default(false),
});

// NEW: Agent Property Assignments table
export const agentPropertyAssignments = pgTable("agent_property_assignments", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  propertyId: integer("property_id").notNull(),
  assignmentType: text("assignment_type").notNull().default("marketing"), // "marketing" | "management" | "both"
  status: text("status").notNull().default("active"), // "active" | "pending" | "terminated"
  commissionRate: real("commission_rate").notNull().default(8.5), // Commission percentage
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  contractUrl: text("contract_url"), // Link to signed contract
  assignmentTerms: jsonb("assignment_terms"), // Flexible terms storage
  performanceMetrics: jsonb("performance_metrics"), // Track agent performance
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const agentPropertyAssignmentsRelations = relations(agentPropertyAssignments, ({ one }) => ({
  agent: one(users, {
    fields: [agentPropertyAssignments.agentId],
    references: [users.id],
    relationName: "agent_assignments",
  }),
  landlord: one(users, {
    fields: [agentPropertyAssignments.landlordId],
    references: [users.id],
    relationName: "landlord_agent_assignments",
  }),
  property: one(properties, {
    fields: [agentPropertyAssignments.propertyId],
    references: [properties.id],
    relationName: "property_agent_assignments",
  }),
}));

export const insertAgentPropertyAssignmentSchema = z.object({
  agentId: z.number(),
  landlordId: z.number(),
  propertyId: z.number(),
  assignmentType: z.enum(["marketing", "management", "both"]).default("marketing"),
  status: z.enum(["active", "pending", "terminated"]).default("active"),
  commissionRate: z.number().default(8.5),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  contractUrl: z.string().optional(),
  assignmentTerms: z.any().optional(),
});

// NEW: Agent Assignment Bids table (for competitive agent selection)
export const agentAssignmentBids = pgTable("agent_assignment_bids", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  propertyId: integer("property_id").notNull(),
  proposedCommissionRate: real("proposed_commission_rate").notNull(),
  marketingPlan: text("marketing_plan").notNull(),
  estimatedTimeToRent: integer("estimated_time_to_rent"), // Days
  proposedRentAmount: integer("proposed_rent_amount"),
  bidStatus: text("bid_status").notNull().default("pending"), // "pending" | "accepted" | "rejected"
  bidExpiresAt: timestamp("bid_expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const agentAssignmentBidsRelations = relations(agentAssignmentBids, ({ one }) => ({
  agent: one(users, {
    fields: [agentAssignmentBids.agentId],
    references: [users.id],
    relationName: "agent_bids",
  }),
  landlord: one(users, {
    fields: [agentAssignmentBids.landlordId],
    references: [users.id],
    relationName: "landlord_received_bids",
  }),
  property: one(properties, {
    fields: [agentAssignmentBids.propertyId],
    references: [properties.id],
    relationName: "property_agent_bids",
  }),
}));

export const insertAgentAssignmentBidSchema = z.object({
  agentId: z.number(),
  landlordId: z.number(),
  propertyId: z.number(),
  proposedCommissionRate: z.number(),
  marketingPlan: z.string(),
  estimatedTimeToRent: z.number().optional(),
  proposedRentAmount: z.number().optional(),
  bidExpiresAt: z.date(),
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

export const insertMaintenanceJobSchema = z.object({
  providerId: z.number(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  availability: z.string(),
  rating: z.number().optional(),
  images: z.array(z.string()).optional(),
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

export const insertMaintenanceBidSchema = z.object({
  requestId: z.number(),
  providerId: z.number(),
  amount: z.number(),
  description: z.string(),
  estimatedDuration: z.string(),
  status: z.string().optional(),
});

// Rental Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  status: text("status").notNull().default("pending"),
  moveInDate: timestamp("move_in_date").notNull(),
  notes: text("notes"),
  // Landlord review fields
  landlordReviewedAt: timestamp("landlord_reviewed_at"),
  landlordDecision: text("landlord_decision").$type<ApplicationDecisionType>(),
  landlordNotes: text("landlord_notes"),
  autoLeaseEligible: boolean("auto_lease_eligible").default(false),
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

export const insertApplicationSchema = z.object({
  propertyId: z.number(),
  tenantId: z.number(),
  status: z.string().optional(),
  moveInDate: z.date(),
  notes: z.string().optional(),
  // Landlord review fields (optional for application creation)
  landlordReviewedAt: z.date().optional(),
  landlordDecision: z.enum(["approved", "rejected", "pending"]).optional(),
  landlordNotes: z.string().optional(),
  autoLeaseEligible: z.boolean().optional(),
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

export const insertDocumentSchema = z.object({
  userId: z.number(),
  propertyId: z.number().optional(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  documentType: z.string(),
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

export const insertMessageSchema = z.object({
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type Lease = typeof leases.$inferSelect;

export type InsertLeaseTermination = z.infer<typeof insertLeaseTerminationSchema>;
export type LeaseTermination = typeof leaseTerminations.$inferSelect;

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

// NEW: Property Maintenance Settings types
export type InsertPropertyMaintenanceSettings = z.infer<typeof insertPropertyMaintenanceSettingsSchema>;
export type PropertyMaintenanceSettings = typeof propertyMaintenanceSettings.$inferSelect;

// NEW: Emergency Contact types
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;

// NEW: Emergency Escalation Rule types
export type InsertEmergencyEscalationRule = z.infer<typeof insertEmergencyEscalationRuleSchema>;
export type EmergencyEscalationRule = typeof emergencyEscalationRules.$inferSelect;

// NEW: Emergency Request Tracking types
export type InsertEmergencyRequestTracking = z.infer<typeof insertEmergencyRequestTrackingSchema>;
export type EmergencyRequestTracking = typeof emergencyRequestTracking.$inferSelect;

// NEW: Agent Property Assignment types
export type InsertAgentPropertyAssignment = z.infer<typeof insertAgentPropertyAssignmentSchema>;
export type AgentPropertyAssignment = typeof agentPropertyAssignments.$inferSelect;

// NEW: Agent Assignment Bid types
export type InsertAgentAssignmentBid = z.infer<typeof insertAgentAssignmentBidSchema>;
export type AgentAssignmentBid = typeof agentAssignmentBids.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type ApplicationWithProperty = Application & {
  property: Property;
};

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

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

export const insertMarketDataSchema = z.object({
  region: z.string(),
  propertyType: z.string(),
  bedrooms: z.number(),
  period: z.string(),
  date: z.date(),
  averagePrice: z.number(),
  medianPrice: z.number(),
  priceChangePct: z.number(),
  inventory: z.number(),
  daysOnMarket: z.number(),
  occupancyRate: z.number(),
  rentalYield: z.number(),
  transactionVolume: z.number(),
  additionalMetrics: z.any().optional(),
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

export const insertMarketForecastSchema = z.object({
  region: z.string(),
  propertyType: z.string(),
  forecastType: z.string(),
  period: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  forecastValue: z.number(),
  confidenceLevel: z.number().optional(),
  methodology: z.string(),
  authorId: z.number().optional(),
  dataPoints: z.any().optional(),
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

export const insertMarketReportSchema = z.object({
  title: z.string(),
  summary: z.string(),
  region: z.string(),
  reportType: z.string(),
  period: z.string(),
  reportDate: z.date(),
  content: z.string(),
  fileUrl: z.string().optional(),
  authorId: z.number().optional(),
  insights: z.any().optional(),
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

export const insertLandlordRatingSchema = z.object({
  landlordId: z.number(),
  tenantId: z.number(),
  propertyId: z.number(),
  rating: z.number(),
  review: z.string().optional(),
  communicationRating: z.number().optional(),
  maintenanceRating: z.number().optional(),
  valueRating: z.number().optional(),
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

export const insertTenantRatingSchema = z.object({
  tenantId: z.number(),
  landlordId: z.number(),
  propertyId: z.number(),
  rating: z.number(),
  review: z.string().optional(),
  paymentRating: z.number().optional(),
  propertyRespectRating: z.number().optional(),
  communicationRating: z.number().optional(),
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
export const insertFinancialAccountSchema = z.object({
  userId: z.number(),
  accountType: z.string(),
  accountName: z.string(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  currency: z.string(),
  balance: z.number(),
  isActive: z.boolean().optional(),
});

export const insertFinancialTransactionSchema = z.object({
  accountId: z.number(),
  userId: z.number(),
  transactionType: z.string(),
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  reference: z.string().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().optional(),
});

export const insertPropertyAnalyticsSchema = z.object({
  propertyId: z.number(),
  period: z.string(),
  periodStart: z.date(),
  periodEnd: z.date(),
  occupancyRate: z.number(),
  averageRent: z.number(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netIncome: z.number(),
  roi: z.number(),
  maintenanceCosts: z.number(),
  vacancyDays: z.number(),
  tenantTurnover: z.number(),
  marketValue: z.number(),
  appreciationRate: z.number(),
});

export const insertNotificationSchema = z.object({
  userId: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  priority: z.string(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().optional(),
  actionRequired: z.boolean().optional(),
  actionUrl: z.string().optional(),
  expiresAt: z.date().optional(),
});

export const insertAuditLogSchema = z.object({
  userId: z.number(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.number().optional(),
  oldValues: z.string().optional(),
  newValues: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  success: z.boolean().optional(),
  errorMessage: z.string().optional(),
});

export const insertPropertyInspectionSchema = z.object({
  propertyId: z.number(),
  inspectorId: z.number(),
  inspectionType: z.string(),
  scheduledDate: z.date(),
  completedDate: z.date().optional(),
  status: z.string().optional(),
  overallCondition: z.string().optional(),
  findings: z.string().optional(),
  images: z.array(z.string()).optional(),
  report: z.string().optional(),
  actionItems: z.string().optional(),
});

export const insertLeaseTemplateSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  templateContent: z.string(),
  propertyType: z.string().optional(),
  region: z.string().optional(),
  isActive: z.boolean().optional(),
  createdBy: z.number().optional(),
  version: z.string().optional(),
  legallyReviewed: z.boolean().optional(),
});

export const insertExpenseCategorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  parentCategoryId: z.number().optional(),
  isActive: z.boolean().optional(),
  isTaxDeductible: z.boolean().optional(),
});

export const insertExpenseSchema = z.object({
  propertyId: z.number(),
  userId: z.number(),
  categoryId: z.number(),
  amount: z.number(),
  description: z.string(),
  expenseDate: z.date(),
  vendor: z.string().optional(),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPeriod: z.string().optional(),
  isTaxDeductible: z.boolean().optional(),
  status: z.string().optional(),
});

export const insertPropertyValuationSchema = z.object({
  propertyId: z.number(),
  valuationType: z.string(),
  valuationAmount: z.number(),
  valuationDate: z.date(),
  valuatorId: z.number(),
  methodology: z.string().optional(),
  comparableProperties: z.array(z.number()).optional(),
  marketConditions: z.string().optional(),
  reportUrl: z.string().optional(),
  isOfficial: z.boolean().optional(),
  expiresAt: z.date().optional(),
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

// NEW TABLES FOR PHASE 1

// Agency-Landlord Agreements
export const agencyLandlordAgreements = pgTable("agency_landlord_agreements", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  agreementType: text("agreement_type").notNull(), // exclusive, non-exclusive, referral
  commissionRate: real("commission_rate").notNull(), // percentage
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default("active"), // active, expired, terminated
  terms: text("terms"), // agreement terms and conditions
  documentUrl: text("document_url"), // signed agreement document
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Property Agency Assignments
export const propertyAgencyAssignments = pgTable("property_agency_assignments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  agencyId: integer("agency_id").notNull(),
  assignmentType: text("assignment_type").notNull(), // listing, management, both
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  commissionRate: real("commission_rate").notNull(), // percentage
  status: text("status").notNull().default("active"), // active, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Commission Payments
export const commissionPayments = pgTable("commission_payments", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  propertyId: integer("property_id").notNull(),
  leaseId: integer("lease_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: real("commission_rate").notNull(),
  paymentType: text("payment_type").notNull(), // listing, management, referral
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue, cancelled
  paymentMethod: text("payment_method").default("bank transfer"),
  reference: text("reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Viewing Appointments
export const viewingAppointments = pgTable("viewing_appointments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  agentId: integer("agent_id").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull().default(60), // minutes
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled, no-show
  notes: text("notes"),
  tenantNotes: text("tenant_notes"),
  agentNotes: text("agent_notes"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Eviction Records
export const evictionRecords = pgTable("eviction_records", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull(),
  propertyId: integer("property_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  agencyId: integer("agency_id"),
  evictionReason: text("eviction_reason").notNull(),
  evictionDate: timestamp("eviction_date").notNull(),
  noticeDate: timestamp("notice_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, completed, cancelled
  courtCaseNumber: text("court_case_number"),
  legalFees: numeric("legal_fees", { precision: 12, scale: 2 }).default("0"),
  outstandingRent: numeric("outstanding_rent", { precision: 12, scale: 2 }).default("0"),
  damages: text("damages"),
  notes: text("notes"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Lease Renewals
export const leaseRenewals = pgTable("lease_renewals", {
  id: serial("id").primaryKey(),
  originalLeaseId: integer("original_lease_id").notNull(),
  newLeaseId: integer("new_lease_id"),
  tenantId: integer("tenant_id").notNull(),
  propertyId: integer("property_id").notNull(),
  landlordId: integer("landlord_id").notNull(),
  renewalType: text("renewal_type").notNull(), // automatic, manual, tenant_requested
  status: text("status").notNull().default("pending"), // pending, approved, rejected, completed
  requestedStartDate: timestamp("requested_start_date").notNull(),
  requestedEndDate: timestamp("requested_end_date").notNull(),
  newRentAmount: integer("new_rent_amount"),
  rentIncrease: numeric("rent_increase", { precision: 12, scale: 2 }).default("0"),
  rentIncreaseReason: text("rent_increase_reason"),
  tenantResponse: text("tenant_response"), // accept, reject, negotiate
  landlordResponse: text("landlord_response"), // accept, reject, counter
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Agent Performance Metrics
export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull(),
  period: text("period").notNull(), // monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  propertiesListed: integer("properties_listed").default(0),
  propertiesRented: integer("properties_rented").default(0),
  propertiesSold: integer("properties_sold").default(0),
  totalCommission: numeric("total_commission", { precision: 12, scale: 2 }).default("0"),
  averageDaysOnMarket: integer("average_days_on_market").default(0),
  conversionRate: real("conversion_rate").default(0),
  clientSatisfaction: real("client_satisfaction").default(0),
  responseTime: integer("response_time").default(0), // hours
  viewingsScheduled: integer("viewings_scheduled").default(0),
  viewingsCompleted: integer("viewings_completed").default(0),
  leadsGenerated: integer("leads_generated").default(0),
  leadsConverted: integer("leads_converted").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});



// Vehicle and Pet Information
export const vehiclePetInfo = pgTable("vehicle_pet_info", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // vehicle, pet
  name: text("name").notNull(),
  description: text("description"),
  make: text("make"), // for vehicles
  model: text("model"), // for vehicles
  year: integer("year"), // for vehicles
  color: text("color"),
  licensePlate: text("license_plate"), // for vehicles
  species: text("species"), // for pets
  breed: text("breed"), // for pets
  weight: real("weight"), // for pets
  age: integer("age"), // for pets
  isRegistered: boolean("is_registered").default(false),
  registrationNumber: text("registration_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Maintenance Appointments - for scheduling maintenance work
export const maintenanceAppointments = pgTable("maintenance_appointments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  maintenanceId: integer("maintenance_id").notNull(),
  agentId: integer("agent_id"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull().default(60), // in minutes
  status: text("status").notNull().default("scheduled"), // scheduled, confirmed, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Emergency Jobs - for urgent maintenance requests
export const emergencyJobs = pgTable("emergency_jobs", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  maintenanceId: integer("maintenance_id"),
  emergencyType: text("emergency_type").notNull(), // plumbing, electrical, security, structural
  description: text("description").notNull(),
  priority: text("priority").notNull().default("high"), // low, medium, high, critical
  status: text("status").notNull().default("pending"), // pending, assigned, in_progress, completed
  assignedDate: timestamp("assigned_date"),
  completedDate: timestamp("completed_date"),
  estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }),
  actualCost: numeric("actual_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Quality Assurance - for maintenance work quality checks
export const maintenanceQuality = pgTable("maintenance_quality", {
  id: serial("id").primaryKey(),
  maintenanceJobId: integer("maintenance_job_id").notNull(),
  inspectorId: integer("inspector_id").notNull(),
  inspectionDate: timestamp("inspection_date").notNull(),
  qualityScore: integer("quality_score").notNull(), // 1-10 scale
  workmanship: text("workmanship").notNull(), // excellent, good, satisfactory, poor
  materials: text("materials").notNull(), // excellent, good, satisfactory, poor
  cleanliness: text("cleanliness").notNull(), // excellent, good, satisfactory, poor
  safety: text("safety").notNull(), // excellent, good, satisfactory, poor
  compliance: text("compliance").notNull(), // yes, no, partial
  issues: text("issues"), // any issues found
  recommendations: text("recommendations"), // improvement recommendations
  status: text("status").notNull().default("pending"), // pending, approved, rejected, needs_improvement
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Maintenance Appointments Relations
export const maintenanceAppointmentsRelations = relations(maintenanceAppointments, ({ one }) => ({
  property: one(properties, {
    fields: [maintenanceAppointments.propertyId],
    references: [properties.id],
    relationName: "property_maintenance_appointments",
  }),
  maintenance: one(users, {
    fields: [maintenanceAppointments.maintenanceId],
    references: [users.id],
    relationName: "maintenance_appointments",
  }),
  agent: one(users, {
    fields: [maintenanceAppointments.agentId],
    references: [users.id],
    relationName: "agent_maintenance_appointments",
  }),
}));

// Emergency Jobs Relations
export const emergencyJobsRelations = relations(emergencyJobs, ({ one }) => ({
  property: one(properties, {
    fields: [emergencyJobs.propertyId],
    references: [properties.id],
    relationName: "property_emergency_jobs",
  }),
  tenant: one(users, {
    fields: [emergencyJobs.tenantId],
    references: [users.id],
    relationName: "user_emergency_jobs",
  }),
  maintenance: one(users, {
    fields: [emergencyJobs.maintenanceId],
    references: [users.id],
    relationName: "maintenance_emergency_jobs",
  }),
}));

// Quality Assurance Relations
export const maintenanceQualityRelations = relations(maintenanceQuality, ({ one }) => ({
  maintenance: one(users, {
    fields: [maintenanceQuality.inspectorId],
    references: [users.id],
    relationName: "inspector_quality_assurance",
  }),
}));

// Dispute Resolution - for handling payment and quality disputes
export const disputeResolution = pgTable("dispute_resolution", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  disputeType: text("dispute_type").notNull(), // "payment", "quality", "timeline", "scope"
  initiatorId: integer("initiator_id").notNull(), // Who started the dispute
  respondentId: integer("respondent_id").notNull(), // Who is being disputed against
  status: text("status").notNull().default("open"), // "open", "in_review", "mediation", "resolved", "closed"
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high", "urgent"
  description: text("description").notNull(),
  evidence: jsonb("evidence").$type<string[]>(), // Photos, documents, etc.
  mediatorId: integer("mediator_id"), // Assigned mediator
  resolution: text("resolution"), // Final resolution description
  resolutionDate: timestamp("resolution_date"),
  compensationAmount: integer("compensation_amount"), // Any compensation awarded
  compensationPaidTo: integer("compensation_paid_to"), // Who receives compensation
  escalationLevel: integer("escalation_level").default(1), // 1=initial, 2=escalated, 3=legal
  timelineEvents: jsonb("timeline_events").$type<{
    timestamp: string;
    event: string;
    userId: number;
    notes?: string;
  }[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const disputeResolutionRelations = relations(disputeResolution, ({ one }) => ({
  request: one(maintenanceRequests, {
    fields: [disputeResolution.requestId],
    references: [maintenanceRequests.id],
    relationName: "maintenance_request_disputes",
  }),
  initiator: one(users, {
    fields: [disputeResolution.initiatorId],
    references: [users.id],
    relationName: "user_initiated_disputes",
  }),
  respondent: one(users, {
    fields: [disputeResolution.respondentId],
    references: [users.id],
    relationName: "user_respondent_disputes",
  }),
  mediator: one(users, {
    fields: [disputeResolution.mediatorId],
    references: [users.id],
    relationName: "mediator_disputes",
  }),
}));

// Provider Reliability Tracking - track provider performance and penalties
export const providerReliability = pgTable("provider_reliability", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  totalJobs: integer("total_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  cancelledJobs: integer("cancelled_jobs").default(0),
  noShowJobs: integer("no_show_jobs").default(0),
  averageRating: real("average_rating").default(0),
  averageResponseTime: integer("average_response_time"), // Minutes
  averageCompletionTime: integer("average_completion_time"), // Hours
  qualityScore: real("quality_score").default(0), // Based on quality assessments
  reliabilityScore: real("reliability_score").default(100), // Overall reliability (0-100)
  penaltyPoints: integer("penalty_points").default(0),
  suspensionCount: integer("suspension_count").default(0),
  lastSuspensionDate: timestamp("last_suspension_date"),
  currentStatus: text("current_status").default("active"), // "active", "warning", "suspended", "banned"
  warningLevel: integer("warning_level").default(0), // 0=none, 1=first, 2=second, 3=final
  lastWarningDate: timestamp("last_warning_date"),
  performanceNotes: text("performance_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const providerReliabilityRelations = relations(providerReliability, ({ one }) => ({
  provider: one(users, {
    fields: [providerReliability.providerId],
    references: [users.id],
    relationName: "provider_reliability_tracking",
  }),
}));

// Provider Penalties - track specific penalty incidents
export const providerPenalties = pgTable("provider_penalties", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  requestId: integer("request_id"), // Related maintenance request if applicable
  penaltyType: text("penalty_type").notNull(), // "no_show", "poor_quality", "late_completion", "unprofessional", "safety_violation"
  severity: text("severity").notNull(), // "minor", "moderate", "major", "critical"
  points: integer("points").notNull(), // Penalty points assigned
  description: text("description").notNull(),
  evidence: jsonb("evidence").$type<string[]>(), // Photos, documents, etc.
  issuedById: integer("issued_by_id").notNull(), // Who issued the penalty
  status: text("status").default("active"), // "active", "appealed", "overturned", "expired"
  appealDate: timestamp("appeal_date"),
  appealReason: text("appeal_reason"),
  appealDecision: text("appeal_decision"),
  expiryDate: timestamp("expiry_date"), // When penalty expires
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const providerPenaltiesRelations = relations(providerPenalties, ({ one }) => ({
  provider: one(users, {
    fields: [providerPenalties.providerId],
    references: [users.id],
    relationName: "provider_penalties",
  }),
  request: one(maintenanceRequests, {
    fields: [providerPenalties.requestId],
    references: [maintenanceRequests.id],
    relationName: "maintenance_request_penalties",
  }),
  issuedBy: one(users, {
    fields: [providerPenalties.issuedById],
    references: [users.id],
    relationName: "penalty_issuer",
  }),
}));

// Photo Verification - for work completion verification
export const photoVerification = pgTable("photo_verification", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  photoType: text("photo_type").notNull(), // "before", "during", "after", "completion", "issue"
  photoUrl: text("photo_url").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  verificationStatus: text("verification_status").default("pending"), // "pending", "verified", "rejected", "flagged"
  verifiedById: integer("verified_by_id"),
  verificationDate: timestamp("verification_date"),
  verificationNotes: text("verification_notes"),
  isRequired: boolean("is_required").default(false), // Whether this photo was required by settings
  gpsLocation: text("gps_location"), // GPS coordinates if available
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata").$type<{
    deviceInfo?: string;
    fileSize?: number;
    dimensions?: { width: number; height: number };
    exifData?: any;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const photoVerificationRelations = relations(photoVerification, ({ one }) => ({
  request: one(maintenanceRequests, {
    fields: [photoVerification.requestId],
    references: [maintenanceRequests.id],
    relationName: "maintenance_request_photos",
  }),
  uploadedBy: one(users, {
    fields: [photoVerification.uploadedById],
    references: [users.id],
    relationName: "user_uploaded_photos",
  }),
  verifiedBy: one(users, {
    fields: [photoVerification.verifiedById],
    references: [users.id],
    relationName: "user_verified_photos",
  }),
}));

// INSERT SCHEMAS FOR PHASE 1 TABLES

// Agency-Landlord Agreements
export const insertAgencyLandlordAgreementSchema = z.object({
  agencyId: z.number(),
  landlordId: z.number(),
  agreementType: z.string(),
  commissionRate: z.number(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.string().optional(),
  terms: z.string().optional(),
  documentUrl: z.string().optional(),
});

export type InsertAgencyLandlordAgreement = z.infer<typeof insertAgencyLandlordAgreementSchema>;
export type AgencyLandlordAgreement = typeof agencyLandlordAgreements.$inferSelect;

// Property Agency Assignments
export const insertPropertyAgencyAssignmentSchema = z.object({
  propertyId: z.number(),
  agencyId: z.number(),
  assignmentType: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  commissionRate: z.number(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertPropertyAgencyAssignment = z.infer<typeof insertPropertyAgencyAssignmentSchema>;
export type PropertyAgencyAssignment = typeof propertyAgencyAssignments.$inferSelect;

// Commission Payments
export const insertCommissionPaymentSchema = z.object({
  agencyId: z.number(),
  landlordId: z.number(),
  propertyId: z.number(),
  leaseId: z.number(),
  amount: z.number(),
  commissionRate: z.number(),
  paymentType: z.string(),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertCommissionPayment = z.infer<typeof insertCommissionPaymentSchema>;
export type CommissionPayment = typeof commissionPayments.$inferSelect;

// Viewing Appointments
export const insertViewingAppointmentSchema = z.object({
  propertyId: z.number(),
  tenantId: z.number(),
  agentId: z.number(),
  scheduledDate: z.date(),
  duration: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  tenantNotes: z.string().optional(),
  agentNotes: z.string().optional(),
  reminderSent: z.boolean().optional(),
});

export type InsertViewingAppointment = z.infer<typeof insertViewingAppointmentSchema>;
export type ViewingAppointment = typeof viewingAppointments.$inferSelect;

// Eviction Records
export const insertEvictionRecordSchema = z.object({
  tenantId: z.number(),
  propertyId: z.number(),
  landlordId: z.number(),
  agencyId: z.number().optional(),
  evictionReason: z.string(),
  evictionDate: z.date(),
  noticeDate: z.date(),
  status: z.string().optional(),
  courtCaseNumber: z.string().optional(),
  legalFees: z.number().optional(),
  outstandingRent: z.number().optional(),
  damages: z.string().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().optional(),
});

export type InsertEvictionRecord = z.infer<typeof insertEvictionRecordSchema>;
export type EvictionRecord = typeof evictionRecords.$inferSelect;

// Lease Renewals
export const insertLeaseRenewalSchema = z.object({
  originalLeaseId: z.number(),
  newLeaseId: z.number().optional(),
  tenantId: z.number(),
  propertyId: z.number(),
  landlordId: z.number(),
  renewalType: z.string(),
  status: z.string().optional(),
  requestedStartDate: z.date(),
  requestedEndDate: z.date(),
  newRentAmount: z.number().optional(),
  rentIncrease: z.number().optional(),
  rentIncreaseReason: z.string().optional(),
  tenantResponse: z.string().optional(),
  landlordResponse: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertLeaseRenewal = z.infer<typeof insertLeaseRenewalSchema>;
export type LeaseRenewal = typeof leaseRenewals.$inferSelect;

// Agent Performance Metrics
export const insertAgentPerformanceMetricSchema = z.object({
  agentId: z.number(),
  period: z.string(),
  periodStart: z.date(),
  periodEnd: z.date(),
  propertiesListed: z.number().optional(),
  propertiesRented: z.number().optional(),
  propertiesSold: z.number().optional(),
  totalCommission: z.number().optional(),
  averageDaysOnMarket: z.number().optional(),
  conversionRate: z.number().optional(),
  clientSatisfaction: z.number().optional(),
  responseTime: z.number().optional(),
  viewingsScheduled: z.number().optional(),
  viewingsCompleted: z.number().optional(),
  leadsGenerated: z.number().optional(),
  leadsConverted: z.number().optional(),
});

export type InsertAgentPerformanceMetric = z.infer<typeof insertAgentPerformanceMetricSchema>;
export type AgentPerformanceMetric = typeof agentPerformanceMetrics.$inferSelect;



// Vehicle and Pet Information
export const insertVehiclePetInfoSchema = z.object({
  userId: z.number(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
  species: z.string().optional(),
  breed: z.string().optional(),
  weight: z.number().optional(),
  age: z.number().optional(),
  isRegistered: z.boolean().optional(),
  registrationNumber: z.string().optional(),
});

export type InsertVehiclePetInfo = z.infer<typeof insertVehiclePetInfoSchema>;
export type VehiclePetInfo = typeof vehiclePetInfo.$inferSelect;

// Maintenance Appointments
export const insertMaintenanceAppointmentSchema = z.object({
  propertyId: z.number(),
  maintenanceId: z.number(),
  agentId: z.number().optional(),
  scheduledDate: z.date(),
  duration: z.number().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertMaintenanceAppointment = z.infer<typeof insertMaintenanceAppointmentSchema>;
export type MaintenanceAppointment = typeof maintenanceAppointments.$inferSelect;

// Emergency Jobs
export const insertEmergencyJobSchema = z.object({
  propertyId: z.number(),
  tenantId: z.number(),
  maintenanceId: z.number().optional(),
  emergencyType: z.string(),
  description: z.string(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedDate: z.date().optional(),
  completedDate: z.date().optional(),
  estimatedCost: z.number().optional(),
  actualCost: z.number().optional(),
  notes: z.string().optional(),
});

export type InsertEmergencyJob = z.infer<typeof insertEmergencyJobSchema>;
export type EmergencyJob = typeof emergencyJobs.$inferSelect;

// Quality Assurance
export const insertMaintenanceQualitySchema = z.object({
  maintenanceJobId: z.number(),
  inspectorId: z.number(),
  inspectionDate: z.date(),
  qualityScore: z.number(),
  workmanship: z.string(),
  materials: z.string(),
  cleanliness: z.string(),
  safety: z.string(),
  compliance: z.string(),
  issues: z.string().optional(),
  recommendations: z.string().optional(),
  status: z.string().optional(),
});

export type InsertMaintenanceQuality = z.infer<typeof insertMaintenanceQualitySchema>;
export type MaintenanceQuality = typeof maintenanceQuality.$inferSelect;

// Dispute Resolution
export const insertDisputeResolutionSchema = z.object({
  requestId: z.number(),
  disputeType: z.enum(["payment", "quality", "timeline", "scope"]),
  initiatorId: z.number(),
  respondentId: z.number(),
  status: z.enum(["open", "in_review", "mediation", "resolved", "closed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  description: z.string(),
  evidence: z.array(z.string()).optional(),
  mediatorId: z.number().optional(),
  resolution: z.string().optional(),
  resolutionDate: z.date().optional(),
  compensationAmount: z.number().optional(),
  compensationPaidTo: z.number().optional(),
  escalationLevel: z.number().default(1),
  timelineEvents: z.array(z.object({
    timestamp: z.string(),
    event: z.string(),
    userId: z.number(),
    notes: z.string().optional(),
  })).optional(),
});

export type InsertDisputeResolution = z.infer<typeof insertDisputeResolutionSchema>;
export type DisputeResolution = typeof disputeResolution.$inferSelect;

// Provider Reliability
export const insertProviderReliabilitySchema = z.object({
  providerId: z.number(),
  totalJobs: z.number().default(0),
  completedJobs: z.number().default(0),
  cancelledJobs: z.number().default(0),
  noShowJobs: z.number().default(0),
  averageRating: z.number().default(0),
  averageResponseTime: z.number().optional(),
  averageCompletionTime: z.number().optional(),
  qualityScore: z.number().default(0),
  reliabilityScore: z.number().default(100),
  penaltyPoints: z.number().default(0),
  suspensionCount: z.number().default(0),
  lastSuspensionDate: z.date().optional(),
  currentStatus: z.enum(["active", "warning", "suspended", "banned"]).default("active"),
  warningLevel: z.number().default(0),
  lastWarningDate: z.date().optional(),
  performanceNotes: z.string().optional(),
});

export type InsertProviderReliability = z.infer<typeof insertProviderReliabilitySchema>;
export type ProviderReliability = typeof providerReliability.$inferSelect;

// Provider Penalties
export const insertProviderPenaltySchema = z.object({
  providerId: z.number(),
  requestId: z.number().optional(),
  penaltyType: z.enum(["no_show", "poor_quality", "late_completion", "unprofessional", "safety_violation"]),
  severity: z.enum(["minor", "moderate", "major", "critical"]),
  points: z.number(),
  description: z.string(),
  evidence: z.array(z.string()).optional(),
  issuedById: z.number(),
  status: z.enum(["active", "appealed", "overturned", "expired"]).default("active"),
  appealDate: z.date().optional(),
  appealReason: z.string().optional(),
  appealDecision: z.string().optional(),
  expiryDate: z.date().optional(),
});

export type InsertProviderPenalty = z.infer<typeof insertProviderPenaltySchema>;
export type ProviderPenalty = typeof providerPenalties.$inferSelect;

// Photo Verification
export const insertPhotoVerificationSchema = z.object({
  requestId: z.number(),
  photoType: z.enum(["before", "during", "after", "completion", "issue"]),
  photoUrl: z.string(),
  uploadedById: z.number(),
  verificationStatus: z.enum(["pending", "verified", "rejected", "flagged"]).default("pending"),
  verifiedById: z.number().optional(),
  verificationDate: z.date().optional(),
  verificationNotes: z.string().optional(),
  isRequired: z.boolean().default(false),
  gpsLocation: z.string().optional(),
  timestamp: z.date().optional(),
  metadata: z.object({
    deviceInfo: z.string().optional(),
    fileSize: z.number().optional(),
    dimensions: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
    exifData: z.any().optional(),
  }).optional(),
});

export type InsertPhotoVerification = z.infer<typeof insertPhotoVerificationSchema>;
export type PhotoVerification = typeof photoVerification.$inferSelect;

// Add missing relations for agency tables
export const agencyLandlordAgreementsRelations = relations(agencyLandlordAgreements, ({ one }) => ({
  agency: one(users, {
    fields: [agencyLandlordAgreements.agencyId],
    references: [users.id],
    relationName: "agency_agreements",
  }),
  landlord: one(users, {
    fields: [agencyLandlordAgreements.landlordId],
    references: [users.id],
    relationName: "landlord_agreements",
  }),
}));

export const propertyAgencyAssignmentsRelations = relations(propertyAgencyAssignments, ({ one }) => ({
  property: one(properties, {
    fields: [propertyAgencyAssignments.propertyId],
    references: [properties.id],
    relationName: "property_assignments",
  }),
  agency: one(users, {
    fields: [propertyAgencyAssignments.agencyId],
    references: [users.id],
    relationName: "agency_assignments",
  }),
}));

export const commissionPaymentsRelations = relations(commissionPayments, ({ one }) => ({
  agency: one(users, {
    fields: [commissionPayments.agencyId],
    references: [users.id],
    relationName: "agency_commission_payments",
  }),
  landlord: one(users, {
    fields: [commissionPayments.landlordId],
    references: [users.id],
    relationName: "landlord_commission_payments",
  }),
  property: one(properties, {
    fields: [commissionPayments.propertyId],
    references: [properties.id],
    relationName: "property_commission_payments",
  }),
  lease: one(leases, {
    fields: [commissionPayments.leaseId],
    references: [leases.id],
    relationName: "lease_commission_payments",
  }),
}));

export const viewingAppointmentsRelations = relations(viewingAppointments, ({ one }) => ({
  property: one(properties, {
    fields: [viewingAppointments.propertyId],
    references: [properties.id],
    relationName: "property_viewing_appointments",
  }),
  tenant: one(users, {
    fields: [viewingAppointments.tenantId],
    references: [users.id],
    relationName: "tenant_viewing_appointments",
  }),
  agent: one(users, {
    fields: [viewingAppointments.agentId],
    references: [users.id],
    relationName: "agent_viewing_appointments",
  }),
}));

export const evictionRecordsRelations = relations(evictionRecords, ({ one }) => ({
  tenant: one(users, {
    fields: [evictionRecords.tenantId],
    references: [users.id],
    relationName: "tenant_eviction_records",
  }),
  property: one(properties, {
    fields: [evictionRecords.propertyId],
    references: [properties.id],
    relationName: "property_eviction_records",
  }),
  landlord: one(users, {
    fields: [evictionRecords.landlordId],
    references: [users.id],
    relationName: "landlord_eviction_records",
  }),
  agency: one(users, {
    fields: [evictionRecords.agencyId],
    references: [users.id],
    relationName: "agency_eviction_records",
  }),
}));

export const leaseRenewalsRelations = relations(leaseRenewals, ({ one }) => ({
  originalLease: one(leases, {
    fields: [leaseRenewals.originalLeaseId],
    references: [leases.id],
    relationName: "original_lease_renewals",
  }),
  newLease: one(leases, {
    fields: [leaseRenewals.newLeaseId],
    references: [leases.id],
    relationName: "new_lease_renewals",
  }),
  tenant: one(users, {
    fields: [leaseRenewals.tenantId],
    references: [users.id],
    relationName: "tenant_lease_renewals",
  }),
  property: one(properties, {
    fields: [leaseRenewals.propertyId],
    references: [properties.id],
    relationName: "property_lease_renewals",
  }),
  landlord: one(users, {
    fields: [leaseRenewals.landlordId],
    references: [users.id],
    relationName: "landlord_lease_renewals",
  }),
}));

export const agentPerformanceMetricsRelations = relations(agentPerformanceMetrics, ({ one }) => ({
  agent: one(users, {
    fields: [agentPerformanceMetrics.agentId],
    references: [users.id],
    relationName: "agent_performance_metrics",
  }),
}));

export const vehiclePetInfoRelations = relations(vehiclePetInfo, ({ one }) => ({
  user: one(users, {
    fields: [vehiclePetInfo.userId],
    references: [users.id],
    relationName: "user_vehicle_pet_info",
  }),
}));
