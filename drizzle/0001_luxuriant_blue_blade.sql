CREATE TABLE "month_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO month_references (id, month, year, created_at, updated_at)
VALUES (gen_random_uuid(), 6, 2025, now(), now());

ALTER TABLE "transactions" ADD COLUMN "month_reference_id" uuid NOT NULL REFERENCES "month_references"("id");

UPDATE transactions
SET month_reference_id = (SELECT id FROM month_references WHERE month = 6 AND year = 2025);