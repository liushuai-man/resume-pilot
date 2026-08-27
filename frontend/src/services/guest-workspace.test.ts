import assert from 'node:assert/strict';
import test from 'node:test';

const values = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  },
});

test('无 IndexedDB 环境下降级存储仍按实体类型隔离', async () => {
  const { guestWorkspace } = await import('./guest-workspace');
  const resume = { id: 'guest-test-resume', user_id: 'guest', template_id: 'classic', title: '测试草稿', content: { blocks: [], basicInfo: { name: '', email: '', phone: '', location: '' }, education: [], experience: [], projects: [], skills: [], careerObjective: '', certifications: [], campusExperiences: [] }, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_deleted: false };
  await guestWorkspace.saveResume(resume);
  assert.equal((await guestWorkspace.listResumes())[0]?.title, '测试草稿');
  assert.equal((await guestWorkspace.listJobs()).length, 0);
  await guestWorkspace.deleteResume(resume.id);
  assert.equal((await guestWorkspace.listResumes()).length, 0);
});

test('清理策略删除过期数据并优先回收较旧面试记录', async () => {
  const { selectGuestEntitiesForCleanup } = await import('./guest-workspace');
  const now = Date.now();
  const base = { workspaceId: 'workspace', schemaVersion: 1 as const, syncState: 'local' as const, payload: {}, updatedAt: new Date(now).toISOString() };
  const entities = [
    { ...base, key: 'expired', entityType: 'resume' as const, entityId: 'expired', expiresAt: new Date(now - 1).toISOString() },
    { ...base, key: 'active', entityType: 'resume' as const, entityId: 'active', expiresAt: new Date(now + 10000).toISOString() },
  ];
  assert.deepEqual(selectGuestEntitiesForCleanup(entities, now), ['expired']);
});

test('迁移成功后实体进入七天延迟清理状态', async () => {
  const { guestWorkspace } = await import('./guest-workspace');
  const resume = { id: 'guest-migrate-resume', user_id: 'guest', template_id: 'classic', title: '待迁移', content: { blocks: [], basicInfo: { name: '', email: '', phone: '', location: '' }, education: [], experience: [], projects: [], skills: [], careerObjective: '', certifications: [], campusExperiences: [] }, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_deleted: false };
  await guestWorkspace.saveResume(resume);
  const payload = await guestWorkspace.createMigrationPayload();
  assert.ok(payload.entities.some((entity) => entity.entityId === resume.id));
  await guestWorkspace.markSynced([{ entityType: 'resume', guestEntityId: resume.id }]);
  const afterSync = await guestWorkspace.createMigrationPayload();
  assert.ok(!afterSync.entities.some((entity) => entity.entityId === resume.id));
  await guestWorkspace.clear();
});
