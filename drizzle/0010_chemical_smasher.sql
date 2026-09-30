ALTER TABLE `dashboard_users` ADD `role` text DEFAULT 'admin' NOT NULL;--> statement-breakpoint
UPDATE `dashboard_users` SET `role` = 'superadmin' WHERE `id` = 2 AND `username` = 'christopher.petronella@gmail.com';
