ALTER TABLE "interview_results"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'completed',
ADD COLUMN "error_message" TEXT,
ADD COLUMN "completed_at" TIMESTAMP(3);

UPDATE "interview_results"
SET "completed_at" = "updated_at"
WHERE "status" = 'completed';

CREATE INDEX "interview_results_user_id_status_created_at_idx"
ON "interview_results"("user_id", "status", "created_at");
