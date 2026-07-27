import { useEffect, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { documentToContent } from '@/utils/resume-migration';
import { resumeApi } from '@/api/home.api';

export function useAutoSave(resumeId: string) {
  const { document, isSaving, lastSaved, setSaving, setLastSaved } =
    useDocumentStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDocRef = useRef<string>('');

  const save = useCallback(async () => {
    if (!document || isSaving) return;
    if (JSON.stringify(document) === lastSavedDocRef.current) return;

    setSaving(true);
    try {
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
  }, [document, resumeId, isSaving, setSaving, setLastSaved]);

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
