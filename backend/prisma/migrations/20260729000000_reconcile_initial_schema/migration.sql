-- Reconcile objects that existed in development databases created with
-- `prisma db push` but were missing from the original migration history.

ALTER TABLE "templates"
ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "user_model_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "base_url" TEXT,
    "display_name" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_model_configs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_model_configs_user_id_idx"
ON "user_model_configs"("user_id");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_model_configs_user_id_fkey'
    ) THEN
        ALTER TABLE "user_model_configs"
        ADD CONSTRAINT "user_model_configs_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
