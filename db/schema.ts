import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";

export const estimates = sqliteTable("estimates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  email: text("email").notNull().default(""),
  zipCode: text("zip_code").notNull(),
  billingAddress: text("billing_address").notNull().default(""),
  billingCity: text("billing_city").notNull().default(""),
  billingState: text("billing_state").notNull().default(""),
  billingZipCode: text("billing_zip_code").notNull().default(""),
  service: text("service").notNull().default(""),
  customerType: text("customer_type").notNull().default(""),
  customerTypeOther: text("customer_type_other").notNull().default(""),
  meetingType: text("meeting_type").notNull().default(""),
  preferredDate: text("preferred_date").notNull().default(""),
  preferredTime: text("preferred_time").notNull().default(""),
  details: text("details").notNull().default(""),
  consent: integer("consent", { mode: "boolean" }).notNull().default(false),
  emailMarketingConsent: integer("email_marketing_consent", { mode: "boolean" }).notNull().default(false),
  phoneMarketingConsent: integer("phone_marketing_consent", { mode: "boolean" }).notNull().default(false),
  marketingConsentCapturedAt: text("marketing_consent_captured_at").notNull().default(""),
  marketingConsentVersion: text("marketing_consent_version").notNull().default(""),
  marketingConsentText: text("marketing_consent_text").notNull().default(""),
  marketingConsentSource: text("marketing_consent_source").notNull().default(""),
  emailMarketingOptedOutAt: text("email_marketing_opted_out_at").notNull().default(""),
  phoneMarketingOptedOutAt: text("phone_marketing_opted_out_at").notNull().default(""),
  status: text("status").notNull().default("new"),
  estimateAmountCents: integer("estimate_amount_cents").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  lastActivityAt: text("last_activity_at").notNull().default(""),
  classification: text("classification").notNull().default("review-required"),
  completedAt: text("completed_at").notNull().default(""),
  retentionCategory: text("retention_category").notNull().default("review-required"),
  retentionDueAt: text("retention_due_at").notNull().default(""),
  retentionHold: integer("retention_hold", { mode: "boolean" }).notNull().default(false),
  retentionHoldReason: text("retention_hold_reason").notNull().default(""),
  archivedAt: text("archived_at").notNull().default(""),
}, table => [index("estimates_retention_due").on(table.retentionDueAt)]);

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id"),
  actorId: integer("actor_id"),
  action: text("action").notNull(),
  details: text("details").notNull().default(""),
  createdAt: text("created_at").notNull(),
}, table => [index("audit_events_lead").on(table.leadId)]);

export const maintenanceRuns = sqliteTable("maintenance_runs", {
  day: text("day").primaryKey(),
  completedAt: text("completed_at").notNull().default(""),
  removed: integer("removed").notNull().default(0),
});

export const anonymousOutcomes = sqliteTable("anonymous_outcomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  year: text("year").notNull(),
  outcome: text("outcome").notNull(),
});

export const marketingSuppressions = sqliteTable("marketing_suppressions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channel: text("channel").notNull(),
  contact: text("contact").notNull(),
  optedOutAt: text("opted_out_at").notNull(),
  source: text("source").notNull().default("dashboard"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("marketing_suppressions_channel_contact_unique").on(table.channel, table.contact),
]);

export const dashboardUsers = sqliteTable("dashboard_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("admin"),
  passwordSalt: text("password_salt").notNull(),
  passwordHash: text("password_hash").notNull(),
  sessionVersion: integer("session_version").notNull().default(1),
  lastLoginAt: text("last_login_at").notNull().default(""),
  previousLoginAt: text("previous_login_at").notNull().default(""),
  passwordUpdatedAt: text("password_updated_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("dashboard_users_username_unique").on(table.username),
]);

export const dashboardLoginThrottles = sqliteTable("dashboard_login_throttles", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  lockedUntil: text("locked_until").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
