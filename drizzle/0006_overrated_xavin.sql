CREATE TABLE `dashboard_login_throttles` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dashboard_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`password_salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`session_version` integer DEFAULT 1 NOT NULL,
	`password_updated_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dashboard_users_username_unique` ON `dashboard_users` (`username`);--> statement-breakpoint
PRAGMA optimize;--> statement-breakpoint
ALTER TABLE `estimates` ADD `marketing_consent_text` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `estimates` ADD `marketing_consent_source` text DEFAULT '' NOT NULL;
