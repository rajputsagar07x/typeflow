CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"xp_value" integer DEFAULT 10 NOT NULL,
	"requirement" text NOT NULL,
	"requirement_value" integer NOT NULL,
	"icon" text DEFAULT 'trophy' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "homepage_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "homepage_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "lesson_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"content" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"views" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"instructions" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mode" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortcut_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortcut_id" integer NOT NULL,
	"views" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortcuts" (
	"id" serial PRIMARY KEY NOT NULL,
	"keys" text[] NOT NULL,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"explanation" text NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"total_visitors" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"visitors_today" integer DEFAULT 0 NOT NULL,
	"visitors_this_week" integer DEFAULT 0 NOT NULL,
	"total_practice_sessions" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"google_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"picture" text,
	"provider" text DEFAULT 'google' NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
