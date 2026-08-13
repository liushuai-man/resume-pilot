import { useEffect, useState } from 'react';
import type { InterviewWorkspacePanel } from '@/components/interview/InterviewWorkspaceRail';

const PREFERENCES_KEY = 'resume-pilot:interview-workspace-preferences';
const NOTES_KEY_PREFIX = 'resume-pilot:interview-notes:';
export const INTERVIEW_NOTES_MAX_LENGTH = 5000;

interface WorkspacePreferences {
  activePanel: InterviewWorkspacePanel;
  collapsed: boolean;
}

const isWorkspacePanel = (value: unknown): value is InterviewWorkspacePanel =>
  value === 'resume' || value === 'job' || value === 'transcript' || value === 'notes';

const readPreferences = (): WorkspacePreferences => {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    return {
      activePanel: isWorkspacePanel(stored.activePanel) ? stored.activePanel : 'resume',
      collapsed: Boolean(stored.collapsed),
    };
  } catch {
    return { activePanel: 'resume', collapsed: false };
  }
};

export function useInterviewWorkspace(sessionId: string | null) {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(readPreferences);
  const [notes, setNotesState] = useState('');

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!sessionId) {
      setNotesState('');
      return;
    }
    setNotesState(localStorage.getItem(`${NOTES_KEY_PREFIX}${sessionId}`) || '');
  }, [sessionId]);

  const selectPanel = (activePanel: InterviewWorkspacePanel) =>
    setPreferences((current) => ({ ...current, activePanel, collapsed: false }));

  const toggleCollapsed = () =>
    setPreferences((current) => ({ ...current, collapsed: !current.collapsed }));

  const setNotes = (value: string) => {
    if (!sessionId) return;
    const nextValue = value.slice(0, INTERVIEW_NOTES_MAX_LENGTH);
    setNotesState(nextValue);
    localStorage.setItem(`${NOTES_KEY_PREFIX}${sessionId}`, nextValue);
  };

  return {
    activePanel: preferences.activePanel,
    collapsed: preferences.collapsed,
    notes,
    selectPanel,
    toggleCollapsed,
    setNotes,
  };
}
