CREATE TABLE `access_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `access_total` (
	`id` integer PRIMARY KEY NOT NULL,
	`total` integer DEFAULT 0 NOT NULL
);
