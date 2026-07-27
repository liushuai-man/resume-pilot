import { useEffect, useState, useRef, useCallback } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { SectionTitleInput } from './editors/EditorCommon';
import { ProfileEditor } from './editors/ProfileEditor';
import { EducationEditor } from './editors/EducationEditor';
import { ExperienceEditor } from './editors/ExperienceEditor';
import { ProjectEditor } from './editors/ProjectEditor';
import { SkillEditor } from './editors/SkillEditor';
import { CertificationEditor } from './editors/CertificationEditor';
import { ObjectiveEditor } from './editors/ObjectiveEditor';
import { CustomEditor } from './editors/CustomEditor';

const EDITOR_MAP: Record<string, React.FC<any>> = {
  profile: ProfileEditor,
  education: EducationEditor,
  experience: ExperienceEditor,
  project: ProjectEditor,
  skill: SkillEditor,
  certification: CertificationEditor,
  objective: ObjectiveEditor,
  custom: CustomEditor,
};

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SectionEditorModal({
  isOpen,
  onClose,
}: SectionEditorModalProps) {
  const {
    document: doc,
    activeSectionId,
    updateSectionData,
    updateSectionTitle,
    removeSection,
  } = useDocumentStore();

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && panelRef.current && !initialized) {
      const panelWidth = 520;
      const panelHeight = Math.min(700, window.innerHeight * 0.85);
      setPosition({
        x: window.innerWidth - panelWidth - 40,
        y: Math.max(80, (window.innerHeight - panelHeight) / 2),
      });
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  useEffect(() => {
    if (isOpen) {
      setInitialized(false);
    }
  }, [activeSectionId, isOpen]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const panelWidth = panelRef.current?.offsetWidth || 520;
      const panelHeight = panelRef.current?.offsetHeight || 700;

      let newX = dragStartRef.current.posX + dx;
      let newY = dragStartRef.current.posY + dy;

      newX = Math.max(0, Math.min(window.innerWidth - panelWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - panelHeight, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !doc || !activeSectionId) return null;

  const section = doc.sections.find((s) => s.id === activeSectionId);
  if (!section) return null;

  const EditorComponent = EDITOR_MAP[section.type];

  const handleDataChange = (data: any) => {
    updateSectionData(section.id, data);
  };

  const handleTitleChange = (title: string) => {
    updateSectionTitle(section.id, title);
  };

  const handleRemove = () => {
    if (confirm(`确定要删除「${section.title}」模块吗？`)) {
      removeSection(section.id);
      onClose();
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '520px',
        maxHeight: 'calc(100vh - 80px)',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          backgroundColor: '#f9fafb',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '15px',
            color: '#111827',
          }}
        >
          ✏️ 编辑 {section.title}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '2px 8px',
            lineHeight: 1,
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          ×
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {section.type !== 'profile' && (
          <div style={{ marginBottom: '20px' }}>
            <SectionTitleInput
              title={section.title}
              onChange={handleTitleChange}
            />
          </div>
        )}

        {EditorComponent ? (
          <EditorComponent
            sectionId={section.id}
            data={section.data}
            onChange={handleDataChange}
          />
        ) : (
          <div
            style={{ color: '#9ca3af', textAlign: 'center', padding: '24px' }}
          >
            不支持的模块类型: {section.type}
          </div>
        )}
      </div>

      {section.type !== 'profile' && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleRemove}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
          >
            删除此模块
          </button>
        </div>
      )}
    </div>
  );
}
