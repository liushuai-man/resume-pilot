CREATE TABLE "resume_versions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "change_summary" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "resume_versions_resume_id_created_at_idx" ON "resume_versions"("resume_id", "created_at");
CREATE INDEX "resume_versions_user_id_created_at_idx" ON "resume_versions"("user_id", "created_at");
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
