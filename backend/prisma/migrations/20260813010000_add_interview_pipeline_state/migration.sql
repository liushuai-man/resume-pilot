ALTER TABLE "interview_results"
ADD COLUMN "current_node" TEXT,
ADD COLUMN "failed_node" TEXT,
ADD COLUMN "pipeline_state" JSONB NOT NULL DEFAULT '{}';

UPDATE "interview_results"
SET "current_node" = CASE WHEN "status" = 'completed' THEN 'report_published' ELSE NULL END,
    "pipeline_state" = CASE WHEN "status" = 'completed'
      THEN '{"transcript_validation":"succeeded","batch_evaluation":"succeeded","report_composition":"succeeded","report_publication":"succeeded"}'::jsonb
      ELSE '{}'::jsonb END;
