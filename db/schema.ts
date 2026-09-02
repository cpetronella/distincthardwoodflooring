import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
  passwordSalt: text("password_salt").notNull(),
  passwordHash: text("password_hash").notNull(),
  sessionVersion: integer("session_version").notNull().default(1),
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
