import type { InterviewResult } from '@/api/interview.api';
import type { JobDescription } from '@/types/job';
import type { Resume } from '@/types/resume';
import type { AtsAnalysisResult, JobMatchAnalysis } from '@/types/job';
import type { ContentQualityAnalysis } from '@/types/content-quality';

const DATABASE_NAME = 'resume-pilot-guest-workspace';
const STORE_NAME = 'entities';
const DATABASE_VERSION = 1;
const LOCAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SYNCED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTITY_COUNT = 200;
const MAX_APPROXIMATE_BYTES = 15 * 1024 * 1024;
export const GUEST_WORKSPACE_ID_KEY = 'resume-pilot:guest-workspace-id';

export type GuestEntityType = 'resume' | 'job' | 'analysis' | 'interview-result';
export type GuestAnalysis =
  | { id: string; kind: 'ats'; resumeId: string; jobId: string; result: AtsAnalysisResult }
  | { id: string; kind: 'content-quality'; resumeId: string; result: ContentQualityAnalysis }
  | { id: string; kind: 'job-match'; resumeId: string; jobId: string; jobProfileId: string; result: JobMatchAnalysis };

export interface GuestEntity<T = unknown> {
  key: string;
  workspaceId: string;
  entityType: GuestEntityType;
  entityId: string;
  schemaVersion: 1;
  updatedAt: string;
  expiresAt: string;
  deleteAfter?: string;
  syncState: 'local' | 'synced';
  payload: T;
}

const fallback = new Map<string, GuestEntity>();

export function getGuestWorkspaceId(): string {
  const stored = localStorage.getItem(GUEST_WORKSPACE_ID_KEY);
  if (stored) return stored;
  const workspaceId = crypto.randomUUID();
  localStorage.setItem(GUEST_WORKSPACE_ID_KEY, workspaceId);
  return workspaceId;
}

const entityKey = (workspaceId: string, entityType: GuestEntityType, entityId: string) =>
  `${workspaceId}:${entityType}:${entityId}`;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('workspaceAndType', ['workspaceId', 'entityType']);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

async function readWorkspaceEntities(workspaceId = getGuestWorkspaceId()): Promise<GuestEntity[]> {
  const database = await openDatabase();
  if (!database) return [...fallback.values()].filter((item) => item.workspaceId === workspaceId);
  const entities = await new Promise<GuestEntity[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as GuestEntity[]).filter((item) => item.workspaceId === workspaceId));
    request.onerror = () => reject(request.error);
  });
  database.close();
  return entities;
}

async function deleteEntityKeys(keys: string[]): Promise<void> {
  keys.forEach((key) => fallback.delete(key));
  if (!keys.length) return;
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    keys.forEach((key) => store.delete(key));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export function selectGuestEntitiesForCleanup(entities: GuestEntity[], now = Date.now()): string[] {
  const expired = entities.filter((entity) => {
    const legacyDeadline = new Date(new Date(entity.updatedAt).getTime() + LOCAL_TTL_MS).toISOString();
    const deadline = entity.syncState === 'synced' && entity.deleteAfter ? entity.deleteAfter : entity.expiresAt || legacyDeadline;
    return new Date(deadline).getTime() <= now;
  });
  const remaining = entities.filter((entity) => !expired.includes(entity));
  let bytes = remaining.reduce((total, entity) => total + JSON.stringify(entity).length * 2, 0);
  let count = remaining.length;
  const overflowCandidates = [...remaining].sort((a, b) => {
    const priority = { 'interview-result': 0, analysis: 1, job: 2, resume: 3 } as const;
    return priority[a.entityType] - priority[b.entityType] || a.updatedAt.localeCompare(b.updatedAt);
  });
  const selected = new Set(expired.map((entity) => entity.key));
  for (const entity of overflowCandidates) {
    if (count <= MAX_ENTITY_COUNT && bytes <= MAX_APPROXIMATE_BYTES) break;
    selected.add(entity.key);
    count -= 1;
    bytes -= JSON.stringify(entity).length * 2;
  }
  return [...selected];
}

export async function putGuestEntity<T>(entityType: GuestEntityType, entityId: string, payload: T): Promise<void> {
  const workspaceId = getGuestWorkspaceId();
  const now = Date.now();
  const entity: GuestEntity<T> = {
    key: entityKey(workspaceId, entityType, entityId), workspaceId, entityType, entityId,
    schemaVersion: 1, updatedAt: new Date(now).toISOString(), expiresAt: new Date(now + LOCAL_TTL_MS).toISOString(), syncState: 'local', payload,
  };
  fallback.set(entity.key, entity);
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(entity);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function listGuestEntities<T>(entityType: GuestEntityType): Promise<T[]> {
  const entities = (await readWorkspaceEntities()).filter((item) => item.entityType === entityType) as GuestEntity<T>[];
  return entities.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item) => item.payload);
}

export async function deleteGuestEntity(entityType: GuestEntityType, entityId: string): Promise<void> {
  const workspaceId = getGuestWorkspaceId();
  const key = entityKey(workspaceId, entityType, entityId);
  fallback.delete(key);
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export async function cleanupGuestWorkspace(): Promise<number> {
  const entities = await readWorkspaceEntities();
  const keys = selectGuestEntitiesForCleanup(entities);
  await deleteEntityKeys(keys);
  return keys.length;
}

export async function clearGuestWorkspace(): Promise<void> {
  const workspaceId = getGuestWorkspaceId();
  const entities = await readWorkspaceEntities(workspaceId);
  await deleteEntityKeys(entities.map((entity) => entity.key));
  fallback.clear();
  localStorage.removeItem(GUEST_WORKSPACE_ID_KEY);
}

export function releaseGuestMemory(): void {
  fallback.clear();
}

export async function createGuestMigrationPayload() {
  const workspaceId = getGuestWorkspaceId();
  const entities = await readWorkspaceEntities(workspaceId);
  return { workspaceId, entities: entities.filter((entity) => entity.syncState === 'local' && !(entity.entityType === 'analysis' && (entity.payload as GuestAnalysis).kind === 'ats')).map(({ entityType, entityId, payload }) => ({ entityType, entityId, payload })) };
}

export async function markGuestEntitiesSynced(mappings: Array<{ entityType: GuestEntityType; guestEntityId: string }>): Promise<void> {
  if (!mappings.length) return;
  const workspaceId = getGuestWorkspaceId();
  const entities = await readWorkspaceEntities(workspaceId);
  const targets = new Set(mappings.map((item) => `${item.entityType}:${item.guestEntityId}`));
  const deleteAfter = new Date(Date.now() + SYNCED_RETENTION_MS).toISOString();
  const updates = entities.filter((entity) => targets.has(`${entity.entityType}:${entity.entityId}`)).map((entity) => ({ ...entity, syncState: 'synced' as const, deleteAfter }));
  updates.forEach((entity) => fallback.set(entity.key, entity));
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    updates.forEach((entity) => store.put(entity));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

export const guestWorkspace = {
  listResumes: () => listGuestEntities<Resume>('resume'),
  saveResume: (resume: Resume) => putGuestEntity('resume', resume.id, resume),
  deleteResume: (id: string) => deleteGuestEntity('resume', id),
  listJobs: () => listGuestEntities<JobDescription>('job'),
  saveJob: (job: JobDescription) => putGuestEntity('job', job.id, job),
  deleteJob: (id: string) => deleteGuestEntity('job', id),
  listAnalyses: () => listGuestEntities<GuestAnalysis>('analysis'),
  saveAnalysis: (analysis: GuestAnalysis) => putGuestEntity('analysis', analysis.id, analysis),
  listInterviewResults: () => listGuestEntities<InterviewResult>('interview-result'),
  saveInterviewResult: (result: InterviewResult) => putGuestEntity('interview-result', result.id, result),
  deleteInterviewResult: (id: string) => deleteGuestEntity('interview-result', id),
  cleanup: cleanupGuestWorkspace,
  clear: clearGuestWorkspace,
  releaseMemory: releaseGuestMemory,
  createMigrationPayload: createGuestMigrationPayload,
  markSynced: markGuestEntitiesSynced,
};
