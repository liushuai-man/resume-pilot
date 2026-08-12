ALTER TABLE "resume_optimization_actions"
ADD COLUMN "action_type" TEXT NOT NULL DEFAULT 'suggestion',
ADD COLUMN "parent_action_id" TEXT,
ADD COLUMN "reason" TEXT,
ADD COLUMN "evidence" TEXT;

CREATE INDEX "resume_optimization_actions_parent_action_id_idx"
ON "resume_optimization_actions"("parent_action_id");
