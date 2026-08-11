CREATE TABLE "job_match_analyses" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "resume_id" TEXT NOT NULL,
  "resume_updated_at" TIMESTAMP(3) NOT NULL,
  "job_profile_id" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "dimensions" JSONB NOT NULL,
  "requirements" JSONB NOT NULL,
  "overall_confidence" DOUBLE PRECISION NOT NULL,
  "model_name" TEXT NOT NULL,
  "prompt_version" TEXT NOT NULL,
  "evaluator_version" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "job_match_analyses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_match_analyses_user_id_created_at_idx" ON "job_match_analyses"("user_id", "created_at");
CREATE INDEX "job_match_analyses_resume_id_job_profile_id_created_at_idx" ON "job_match_analyses"("resume_id", "job_profile_id", "created_at");
ALTER TABLE "job_match_analyses" ADD CONSTRAINT "job_match_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_match_analyses" ADD CONSTRAINT "job_match_analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_match_analyses" ADD CONSTRAINT "job_match_analyses_job_profile_id_fkey" FOREIGN KEY ("job_profile_id") REFERENCES "job_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
