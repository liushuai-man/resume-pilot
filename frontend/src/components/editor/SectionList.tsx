import { useState, useRef, useEffect } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { SECTION_TYPE_CONFIGS } from '@/types/resume-document';
import { getIconComponent, ICON_OPTIONS } from '@/utils/section-icons';

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
    updateSection,
  } = useDocumentStore();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [iconPickerSectionId, setIconPickerSectionId] = useState<string | null>(
    null
  );
  const addBtnRef = useRef<HTMLDivElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        showAddMenu &&
        addBtnRef.current &&
        !addBtnRef.current.contains(target)
      ) {
        setShowAddMenu(false);
      }
      if (iconPickerRef.current && !iconPickerRef.current.contains(target)) {
        setIconPickerSectionId(null);
      }
    };

    if (showAddMenu || iconPickerSectionId) {
      window.document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu, iconPickerSectionId]);

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

  const handleIconChange = (sectionId: string, iconName: string | null) => {
    updateSection(sectionId, { icon: iconName } as any);
    setIconPickerSectionId(null);
  };

  const getSectionIcon = (section: (typeof document.sections)[0]) => {
    if (section.icon !== null && section.icon !== undefined) {
      return section.icon;
    }
    const config = SECTION_TYPE_CONFIGS.find((c) => c.type === section.type);
    return config?.icon || null;
  };

  const visibleCount = document.sections.filter((s) => s.visible).length;
  const totalCount = document.sections.length;

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
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        <span>共 {totalCount} 个模块</span>
        <span>显示 {visibleCount} 个</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {document.sections.map((section, index) => {
          const iconName = getSectionIcon(section);
          const IconComponent = iconName ? getIconComponent(iconName) : null;
          const isPickerOpen = iconPickerSectionId === section.id;

          return (
            <div key={section.id}>
              <div
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

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIconPickerSectionId(isPickerOpen ? null : section.id);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.15s',
                      border: '1px solid #e5e7eb',
                    }}
                    title="点击更换图标"
                  >
                    {IconComponent ? (
                      <IconComponent size={14} color="#6b7280" />
                    ) : (
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        +
                      </span>
                    )}
                  </button>
                </div>

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

              {isPickerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'fixed',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: '8px',
                    zIndex: 400,
                    width: '200px',
                  }}
                  ref={(el) => {
                    (iconPickerRef as any).current = el;
                    if (el) {
                      const btn = el.parentElement?.querySelector('button');
                      if (btn) {
                        const rect = btn.getBoundingClientRect();
                        el.style.top = `${rect.bottom + 6}px`;
                        el.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
                      }
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginBottom: '6px',
                    }}
                  >
                    图标
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '4px',
                      maxHeight: '150px',
                      overflowY: 'auto',
                    }}
                  >
                    {ICON_OPTIONS.map((name) => {
                      const Icon = getIconComponent(name);
                      if (!Icon) return null;
                      return (
                        <button
                          key={name}
                          onClick={() => handleIconChange(section.id, name)}
                          style={{
                            width: '26px',
                            height: '26px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor:
                              section.icon === name ? '#eef2ff' : '#ffffff',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title={name}
                        >
                          <Icon size={14} />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleIconChange(section.id, null)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: '#f9fafb',
                      color: '#6b7280',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    移除图标
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ position: 'relative', marginTop: '8px' }} ref={addBtnRef}>
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
                position: 'fixed',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                padding: '4px',
                zIndex: 400,
                width: '200px',
              }}
              ref={(el) => {
                if (el && addBtnRef.current) {
                  const rect = addBtnRef.current.getBoundingClientRect();
                  el.style.top = `${rect.bottom + 6}px`;
                  el.style.left = `${rect.left}px`;
                }
              }}
            >
              {SECTION_TYPE_CONFIGS.map((config) => {
                const ConfigIcon = getIconComponent(config.icon);
                return (
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
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {ConfigIcon && <ConfigIcon size={14} />}
                    {config.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
