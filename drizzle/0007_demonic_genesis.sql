CREATE TABLE `anonymous_outcomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` text NOT NULL,
	`outcome` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lead_id` integer,
	`actor_id` integer,
	`action` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_events_lead` ON `audit_events` (`lead_id`);--> statement-breakpoint
CREATE TABLE `maintenance_runs` (
	`day` text PRIMARY KEY NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL,
	`removed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `estimates` ADD `last_activity_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `classification` text DEFAULT 'review-required' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `completed_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `retention_category` text DEFAULT 'review-required' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `retention_due_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `retention_hold` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `retention_hold_reason` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `estimates_retention_due` ON `estimates` (`retention_due_at`);