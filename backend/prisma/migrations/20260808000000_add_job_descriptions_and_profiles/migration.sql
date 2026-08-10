CREATE TABLE "job_descriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "company" TEXT,
    "raw_text" TEXT NOT NULL,
    "source_url" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_descriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_profiles" (
    "id" TEXT NOT NULL,
    "job_description_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "job_title" TEXT NOT NULL,
    "seniority" TEXT,
    "industry" TEXT,
    "responsibilities" JSONB NOT NULL DEFAULT '[]',
    "required_skills" JSONB NOT NULL DEFAULT '[]',
    "preferred_skills" JSONB NOT NULL DEFAULT '[]',
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION,
    "parser_version" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "model_name" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "job_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_descriptions_user_id_updated_at_idx" ON "job_descriptions"("user_id", "updated_at");
CREATE INDEX "job_profiles_user_id_updated_at_idx" ON "job_profiles"("user_id", "updated_at");
CREATE UNIQUE INDEX "job_profiles_job_description_id_version_key" ON "job_profiles"("job_description_id", "version");

ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_profiles" ADD CONSTRAINT "job_profiles_job_description_id_fkey" FOREIGN KEY ("job_description_id") REFERENCES "job_descriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_profiles" ADD CONSTRAINT "job_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
