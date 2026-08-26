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
