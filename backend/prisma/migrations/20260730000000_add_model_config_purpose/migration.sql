ALTER TABLE "user_model_configs"
ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'chat';

CREATE INDEX "user_model_configs_user_id_purpose_idx"
ON "user_model_configs"("user_id", "purpose");
