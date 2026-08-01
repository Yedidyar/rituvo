CREATE TYPE "public"."habit_frequency" AS ENUM('daily', 'specific_days');--> statement-breakpoint
CREATE TYPE "public"."habit_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TABLE "accountability_partnerships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"partner_user_id" varchar(255) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"frequency" "habit_frequency" NOT NULL,
	"schedule_days" smallint[],
	"reminder_time" varchar(5),
	"start_date" date NOT NULL,
	"target_value" numeric(10, 2),
	"target_unit" text,
	"partner_user_id" varchar(255),
	"status" "habit_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accountability_partnerships" ADD CONSTRAINT "accountability_partnerships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accountability_partnerships" ADD CONSTRAINT "accountability_partnerships_partner_user_id_users_id_fk" FOREIGN KEY ("partner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habits" ADD CONSTRAINT "habits_partner_user_id_users_id_fk" FOREIGN KEY ("partner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;