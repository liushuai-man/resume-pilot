CREATE TABLE "resume_content_analyses" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "resume_id" TEXT NOT NULL,
  "resume_updated_at" TIMESTAMP(3) NOT NULL,
  "content_hash" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "dimensions" JSONB NOT NULL,
  "issues" JSONB NOT NULL,
  "overall_confidence" DOUBLE PRECISION NOT NULL,
  "model_name" TEXT NOT NULL,
  "prompt_version" TEXT NOT NULL,
  "evaluator_version" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "resume_content_analyses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "resume_content_analyses_user_id_created_at_idx" ON "resume_content_analyses"("user_id", "created_at");
CREATE INDEX "resume_content_analyses_resume_id_created_at_idx" ON "resume_content_analyses"("resume_id", "created_at");

ALTER TABLE "resume_content_analyses"
  ADD CONSTRAINT "resume_content_analyses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "resume_content_analyses"
  ADD CONSTRAINT "resume_content_analyses_resume_id_fkey"
  FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
