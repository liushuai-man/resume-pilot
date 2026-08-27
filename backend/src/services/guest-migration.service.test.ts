import assert from 'node:assert/strict';
import test from 'node:test';
import { stableGuestCloudId } from '../utils/guest-migration-id';

test('同一用户与游客实体始终生成相同云端 UUID', () => {
  const first = stableGuestCloudId('user-1', 'resume', 'guest-resume-1');
  const second = stableGuestCloudId('user-1', 'resume', 'guest-resume-1');
  assert.equal(first, second);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('不同用户或实体不会映射到同一云端 ID', () => {
  assert.notEqual(stableGuestCloudId('user-1', 'resume', 'guest-1'), stableGuestCloudId('user-2', 'resume', 'guest-1'));
  assert.notEqual(stableGuestCloudId('user-1', 'resume', 'guest-1'), stableGuestCloudId('user-1', 'job', 'guest-1'));
});
