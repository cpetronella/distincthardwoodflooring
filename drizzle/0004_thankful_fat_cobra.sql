ALTER TABLE `estimates` ADD `email_marketing_consent` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `phone_marketing_consent` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `marketing_consent_captured_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `marketing_consent_version` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `email_marketing_opted_out_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `phone_marketing_opted_out_at` text DEFAULT '' NOT NULL;