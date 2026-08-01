CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" text,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
