ALTER TABLE "interview_results"
ADD COLUMN "evaluation_input_hash" TEXT,
ADD COLUMN "evaluation_checkpoint" JSONB;
