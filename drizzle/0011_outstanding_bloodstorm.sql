ALTER TABLE `dashboard_users` ADD `last_login_at` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `dashboard_users` ADD `previous_login_at` text DEFAULT '' NOT NULL;