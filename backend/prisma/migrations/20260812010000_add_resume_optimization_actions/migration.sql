CREATE TABLE "resume_optimization_actions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "version_id" TEXT,
    "source" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "field_id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "final_text" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'accepted',
    "score_before" INTEGER,
    "score_after" INTEGER,
    "resolved" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "resume_optimization_actions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "resume_optimization_actions_resume_id_created_at_idx" ON "resume_optimization_actions"("resume_id", "created_at");
CREATE INDEX "resume_optimization_actions_user_id_source_status_idx" ON "resume_optimization_actions"("user_id", "source", "status");
CREATE INDEX "resume_optimization_actions_version_id_idx" ON "resume_optimization_actions"("version_id");
ALTER TABLE "resume_optimization_actions" ADD CONSTRAINT "resume_optimization_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_optimization_actions" ADD CONSTRAINT "resume_optimization_actions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_optimization_actions" ADD CONSTRAINT "resume_optimization_actions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
