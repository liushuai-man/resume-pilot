import type { InterviewResult } from '@/api/interview.api';
import type { JobDescription } from '@/types/job';
import type { Resume } from '@/types/resume';

const DATABASE_NAME = 'resume-pilot-guest-workspace';
const STORE_NAME = 'entities';
const DATABASE_VERSION = 1;
export const GUEST_WORKSPACE_ID_KEY = 'resume-pilot:guest-workspace-id';

export type GuestEntityType = 'resume' | 'job' | 'interview-result';

export interface GuestEntity<T = unknown> {
  key: string;
  workspaceId: string;
  entityType: GuestEntityType;
  entityId: string;
  schemaVersion: 1;
  updatedAt: string;
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
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('workspaceAndType', ['workspaceId', 'entityType']);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putGuestEntity<T>(entityType: GuestEntityType, entityId: string, payload: T): Promise<void> {
  const workspaceId = getGuestWorkspaceId();
  const entity: GuestEntity<T> = {
    key: entityKey(workspaceId, entityType, entityId), workspaceId, entityType, entityId,
    schemaVersion: 1, updatedAt: new Date().toISOString(), syncState: 'local', payload,
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
  const workspaceId = getGuestWorkspaceId();
  const database = await openDatabase();
  if (!database) {
    return [...fallback.values()].filter((item) => item.workspaceId === workspaceId && item.entityType === entityType).map((item) => item.payload as T);
  }
  const entities = await new Promise<GuestEntity<T>[]>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).index('workspaceAndType').getAll([workspaceId, entityType]);
    request.onsuccess = () => resolve(request.result as GuestEntity<T>[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
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

export const guestWorkspace = {
  listResumes: () => listGuestEntities<Resume>('resume'),
  saveResume: (resume: Resume) => putGuestEntity('resume', resume.id, resume),
  deleteResume: (id: string) => deleteGuestEntity('resume', id),
  listJobs: () => listGuestEntities<JobDescription>('job'),
  saveJob: (job: JobDescription) => putGuestEntity('job', job.id, job),
  deleteJob: (id: string) => deleteGuestEntity('job', id),
  listInterviewResults: () => listGuestEntities<InterviewResult>('interview-result'),
  saveInterviewResult: (result: InterviewResult) => putGuestEntity('interview-result', result.id, result),
  deleteInterviewResult: (id: string) => deleteGuestEntity('interview-result', id),
};
