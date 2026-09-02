CREATE TABLE `marketing_suppressions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channel` text NOT NULL,
	`contact` text NOT NULL,
	`opted_out_at` text NOT NULL,
	`source` text DEFAULT 'dashboard' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `marketing_suppressions_channel_contact_unique` ON `marketing_suppressions` (`channel`,`contact`);--> statement-breakpoint
PRAGMA optimize;
