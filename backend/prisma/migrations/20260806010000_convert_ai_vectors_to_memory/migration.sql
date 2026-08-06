-- Resume content is now passed to the model directly. Previous vector documents
-- are removed and the table is narrowed to long-term conversation memories.
DELETE FROM "ai_vector_documents";

DROP INDEX IF EXISTS "ai_vector_documents_source_key";
DROP INDEX IF EXISTS "ai_vector_documents_scope_idx";
DROP INDEX IF EXISTS "ai_vector_documents_resume_idx";

ALTER TABLE "ai_vector_documents" RENAME TO "ai_memories";

ALTER TABLE "ai_memories"
ADD COLUMN "session_id" TEXT NOT NULL,
DROP COLUMN "scope_id",
DROP COLUMN "source_type",
DROP COLUMN "source_key",
DROP COLUMN "source_version";

-- Keep text memories even when no embedding model is configured or embedding
-- generation temporarily fails. Those rows are available to keyword fallback.
ALTER TABLE "ai_memories"
ALTER COLUMN "embedding" DROP NOT NULL,
ALTER COLUMN "embedding_dimension" DROP NOT NULL,
ALTER COLUMN "embedding_model" DROP NOT NULL;

CREATE UNIQUE INDEX "ai_memories_turn_key"
ON "ai_memories"("user_id", "session_id", "content_hash");

CREATE INDEX "ai_memories_vector_idx"
ON "ai_memories"("user_id", "embedding_model", "embedding_dimension");

CREATE INDEX "ai_memories_session_idx"
ON "ai_memories"("user_id", "session_id");

CREATE INDEX "ai_memories_resume_idx"
ON "ai_memories"("resume_id");
