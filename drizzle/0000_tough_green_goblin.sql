CREATE TABLE "outbound_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"racket_id" text NOT NULL,
	"merchant" text NOT NULL,
	"source" text NOT NULL,
	"locale" text,
	"affiliate" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locale" text NOT NULL,
	"mode" text NOT NULL,
	"answers" jsonb NOT NULL,
	"candidate_count" integer NOT NULL,
	"status" text NOT NULL,
	"error_kind" text,
	"model" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_run_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"racket_id" text NOT NULL,
	"justification" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_quiz_run_id_quiz_runs_id_fk" FOREIGN KEY ("quiz_run_id") REFERENCES "public"."quiz_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "outbound_clicks_created_at_idx" ON "outbound_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "outbound_clicks_racket_id_idx" ON "outbound_clicks" USING btree ("racket_id");--> statement-breakpoint
CREATE INDEX "quiz_runs_created_at_idx" ON "quiz_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "recommendations_racket_id_idx" ON "recommendations" USING btree ("racket_id");