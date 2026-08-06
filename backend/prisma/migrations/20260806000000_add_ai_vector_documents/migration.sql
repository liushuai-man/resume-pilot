CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "ai_vector_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT,
    "scope_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_key" TEXT NOT NULL,
    "source_version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "embedding" vector NOT NULL,
    "embedding_dimension" INTEGER NOT NULL,
    "embedding_model" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_vector_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_vector_documents_source_key"
ON "ai_vector_documents"("user_id", "scope_id", "source_type", "source_key", "embedding_model");

CREATE INDEX "ai_vector_documents_scope_idx"
ON "ai_vector_documents"("user_id", "scope_id", "embedding_model", "embedding_dimension");

CREATE INDEX "ai_vector_documents_resume_idx"
ON "ai_vector_documents"("resume_id");

ALTER TABLE "ai_vector_documents"
ADD CONSTRAINT "ai_vector_documents_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_vector_documents"
ADD CONSTRAINT "ai_vector_documents_resume_id_fkey"
FOREIGN KEY ("resume_id") REFERENCES "resumes"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
