CREATE TABLE creator_profiles (user_id TEXT PRIMARY KEY NOT NULL, nickname TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE creator_maps (id TEXT PRIMARY KEY NOT NULL, owner_id TEXT NOT NULL, title TEXT NOT NULL, payload TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX creator_maps_feed ON creator_maps(status, created_at);
--> statement-breakpoint
CREATE TABLE creator_runs (id TEXT PRIMARY KEY NOT NULL, map_id TEXT NOT NULL, user_id TEXT NOT NULL, created_at INTEGER NOT NULL, consumed INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE INDEX creator_runs_rate ON creator_runs(user_id, created_at);
--> statement-breakpoint
CREATE TABLE creator_records (map_id TEXT NOT NULL, user_id TEXT NOT NULL, best_ms INTEGER NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(map_id,user_id));
