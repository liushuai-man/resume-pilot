import { useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { SECTION_TYPE_CONFIGS } from '@/types/resume-document';

interface SectionListProps {
  onSectionClick?: (sectionId: string) => void;
}

export function SectionList({ onSectionClick }: SectionListProps) {
  const {
    document,
    activeSectionId,
    setActiveSection,
    addSectionByType,
    moveSection,
    toggleSectionVisible,
  } = useDocumentStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  if (!document) return null;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const sectionId = document.sections[dragIndex].id;
    moveSection(sectionId, index);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleAddSection = (type: string) => {
    addSectionByType(type);
    setShowAddMenu(false);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>
          内容模块
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {document.sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onClick={() => {
              setActiveSection(section.id);
              onSectionClick?.(section.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              marginBottom: '4px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor:
                activeSectionId === section.id ? '#e0e7ff' : 'transparent',
              color: activeSectionId === section.id ? '#4338ca' : '#374151',
              transition: 'background-color 0.15s',
              gap: '8px',
            }}
          >
            <span
              style={{ fontSize: '12px', color: '#9ca3af', cursor: 'grab' }}
            >
              ⋮⋮
            </span>
            <span style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>
              {section.title}
            </span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              {Array.isArray(section.data) ? section.data.length : ''}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSectionVisible(section.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                opacity: section.visible ? 1 : 0.4,
                padding: '2px',
              }}
              title={section.visible ? '点击隐藏' : '点击显示'}
            >
              {section.visible ? '👁' : '👁‍🗨'}
            </button>
          </div>
        ))}

        <div style={{ position: 'relative', marginTop: '8px' }}>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            + 添加模块
          </button>

          {showAddMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                padding: '4px',
                zIndex: 100,
              }}
            >
              {SECTION_TYPE_CONFIGS.map((config) => (
                <button
                  key={config.type}
                  onClick={() => handleAddSection(config.type)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#374151',
                  }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
