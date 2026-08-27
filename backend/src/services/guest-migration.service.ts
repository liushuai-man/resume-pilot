import type { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import { stableGuestCloudId } from '../utils/guest-migration-id';

export type GuestMigrationEntity = {
  entityType: 'resume' | 'job' | 'analysis' | 'interview-result';
  entityId: string;
  payload: any;
};

export const guestMigrationService = {
  async migrate(userId: string, entities: GuestMigrationEntity[]) {
    const unique = [...new Map(entities.map((entity) => [`${entity.entityType}:${entity.entityId}`, entity])).values()];
    const idMap = new Map(unique.map((entity) => [`${entity.entityType}:${entity.entityId}`, stableGuestCloudId(userId, entity.entityType, entity.entityId)]));
    const profileIdMap = new Map<string, string>();
    const migratedKeys = new Set<string>();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const entity of unique.filter((item) => item.entityType === 'resume')) {
        const payload = entity.payload;
        const id = idMap.get(`resume:${entity.entityId}`)!;
        await tx.resume.upsert({
          where: { id },
          create: { id, user_id: userId, template_id: payload.template_id || null, title: String(payload.title || '游客简历'), content: payload.content || {} },
          update: { title: String(payload.title || '游客简历'), content: payload.content || {}, template_id: payload.template_id || null, is_deleted: false },
        });
        migratedKeys.add(`resume:${entity.entityId}`);
      }

      for (const entity of unique.filter((item) => item.entityType === 'job')) {
        const payload = entity.payload;
        const id = idMap.get(`job:${entity.entityId}`)!;
        await tx.jobDescription.upsert({
          where: { id },
          create: { id, user_id: userId, title: payload.title || null, company: payload.company || null, raw_text: String(payload.rawText || ''), source_url: payload.sourceUrl || null },
          update: { title: payload.title || null, company: payload.company || null, raw_text: String(payload.rawText || ''), source_url: payload.sourceUrl || null, is_deleted: false },
        });
        if (payload.latestProfile) {
          const profile = payload.latestProfile;
          const profileId = stableGuestCloudId(userId, 'job-profile', String(profile.id || `${entity.entityId}:profile`));
          profileIdMap.set(String(profile.id || `${entity.entityId}:profile`), profileId);
          await tx.jobProfile.upsert({
            where: { id: profileId },
            create: { id: profileId, job_description_id: id, user_id: userId, version: Number(profile.version || 1), status: profile.status || 'confirmed', job_title: String(profile.jobTitle || payload.title || '目标岗位'), seniority: profile.seniority || null, industry: profile.industry || null, responsibilities: profile.responsibilities || [], required_skills: profile.requiredSkills || [], preferred_skills: profile.preferredSkills || [], keywords: profile.keywords || [], confidence: profile.confidence ?? null, parser_version: profile.parserVersion || 'guest-migration-v1', prompt_version: profile.promptVersion || 'guest-migration-v1', model_name: profile.modelName || null, confirmed_at: profile.confirmedAt ? new Date(profile.confirmedAt) : null },
            update: { status: profile.status || 'confirmed', job_title: String(profile.jobTitle || payload.title || '目标岗位'), seniority: profile.seniority || null, industry: profile.industry || null, responsibilities: profile.responsibilities || [], required_skills: profile.requiredSkills || [], preferred_skills: profile.preferredSkills || [], keywords: profile.keywords || [], confidence: profile.confidence ?? null, model_name: profile.modelName || null, confirmed_at: profile.confirmedAt ? new Date(profile.confirmedAt) : null },
          });
        }
        migratedKeys.add(`job:${entity.entityId}`);
      }

      for (const entity of unique.filter((item) => item.entityType === 'analysis')) {
        const payload = entity.payload;
        const result = payload.result || {};
        const resumeId = idMap.get(`resume:${payload.resumeId}`);
        if (!resumeId || payload.kind === 'ats') continue;
        const id = idMap.get(`analysis:${entity.entityId}`)!;
        if (payload.kind === 'content-quality') {
          await tx.resumeContentAnalysis.upsert({
            where: { id },
            create: { id, user_id: userId, resume_id: resumeId, resume_updated_at: new Date(result.resumeUpdatedAt || Date.now()), content_hash: `guest:${entity.entityId}`, score: Number(result.score || 0), dimensions: result.dimensions || [], issues: result.issues || [], overall_confidence: Number(result.overallConfidence || 0), model_name: result.modelName || 'guest-migration', prompt_version: result.promptVersion || 'guest-v1', evaluator_version: result.evaluatorVersion || 'guest-v1' },
            update: { score: Number(result.score || 0), dimensions: result.dimensions || [], issues: result.issues || [], overall_confidence: Number(result.overallConfidence || 0) },
          });
          migratedKeys.add(`analysis:${entity.entityId}`);
        }
        if (payload.kind === 'job-match') {
          const profileId = profileIdMap.get(String(payload.jobProfileId));
          if (!profileId) continue;
          await tx.jobMatchAnalysis.upsert({
            where: { id },
            create: { id, user_id: userId, resume_id: resumeId, resume_updated_at: new Date(result.resumeUpdatedAt || Date.now()), job_profile_id: profileId, score: Number(result.score || 0), dimensions: result.dimensions || [], requirements: result.requirements || [], overall_confidence: Number(result.overallConfidence || 0), model_name: result.modelName || 'guest-migration', prompt_version: result.promptVersion || 'guest-v1', evaluator_version: result.evaluatorVersion || 'guest-v1' },
            update: { score: Number(result.score || 0), dimensions: result.dimensions || [], requirements: result.requirements || [], overall_confidence: Number(result.overallConfidence || 0) },
          });
          migratedKeys.add(`analysis:${entity.entityId}`);
        }
      }

      for (const entity of unique.filter((item) => item.entityType === 'interview-result')) {
        const payload = entity.payload;
        const id = idMap.get(`interview-result:${entity.entityId}`)!;
        const resumeId = payload.resume_id ? idMap.get(`resume:${payload.resume_id}`) : undefined;
        await tx.interviewResult.upsert({
          where: { id },
          create: { id, user_id: userId, resume_id: resumeId || null, position: String(payload.position || '模拟面试'), score: Number(payload.score || 0), report: payload.report || {}, status: payload.status || 'completed', completed_at: payload.completed_at ? new Date(payload.completed_at) : null },
          update: { resume_id: resumeId || null, position: String(payload.position || '模拟面试'), score: Number(payload.score || 0), report: payload.report || {}, status: payload.status || 'completed', completed_at: payload.completed_at ? new Date(payload.completed_at) : null, is_deleted: false },
        });
        migratedKeys.add(`interview-result:${entity.entityId}`);
      }
    });

    return unique.filter((entity) => migratedKeys.has(`${entity.entityType}:${entity.entityId}`)).map((entity) => ({ entityType: entity.entityType, guestEntityId: entity.entityId, cloudEntityId: idMap.get(`${entity.entityType}:${entity.entityId}`)! }));
  },
};
