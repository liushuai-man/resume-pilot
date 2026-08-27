import { useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { documentToContent } from '@/utils/resume-migration';
import { resumeApi } from '@/api/home.api';
import { useUserStore } from '@/store/useUserStore';
import { guestWorkspace } from '@/services/guest-workspace';
import { useResumeStore } from '@/store/useResumeStore';

export function useAutoSave(resumeId: string) {
  const isGuest = useUserStore((state) => state.isGuest);
  const { document, isSaving, lastSaved, setSaving, setLastSaved } =
    useDocumentStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDocRef = useRef<string>('');

  const save = useCallback(async () => {
    if (!document || isSaving) return;
    if (JSON.stringify(document) === lastSavedDocRef.current) return;

    setSaving(true);
    try {
      if (isGuest) {
        const existing = useResumeStore.getState().resume;
        const timestamp = new Date().toISOString();
        await guestWorkspace.saveResume({
          id: document.id || resumeId,
          user_id: 'guest',
          template_id: existing?.template_id || document.layout.template || 'classic-blue',
          title: document.title,
          content: documentToContent(document),
          created_at: existing?.created_at || timestamp,
          updated_at: timestamp,
          is_deleted: false,
        });
        lastSavedDocRef.current = JSON.stringify(document);
        setLastSaved(new Date());
        return;
      }
      const content = documentToContent(document);
      await resumeApi.updateResume(document.id || resumeId, {
        title: document.title,
        content: content as any,
      });
      lastSavedDocRef.current = JSON.stringify(document);
      setLastSaved(new Date());
    } catch (err) {
      console.error('自动保存失败:', err);
    } finally {
      setSaving(false);
    }
  }, [document, resumeId, isSaving, isGuest, setSaving, setLastSaved]);

  useEffect(() => {
    if (!document) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document, save]);

  const saveNow = useCallback(async () => {
    await save();
  }, [save]);

  return {
    isSaving,
    lastSaved,
    saveNow,
  };
}
