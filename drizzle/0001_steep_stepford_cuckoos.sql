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
