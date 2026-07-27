import { useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';

interface AIFieldActionsProps {
  sectionId: string;
  fieldPath: string;
  content: string;
  onPolish: (result: string) => void;
  onComplete: (result: string) => void;
}

export function AIFieldActions({
  sectionId,
  fieldPath,
  content,
  onPolish,
  onComplete,
}: AIFieldActionsProps) {
  const { polishField, completeField, aiLoading } = useDocumentStore();
  const [showMenu, setShowMenu] = useState(false);

  const polishKey = `polish-${sectionId}-${fieldPath}`;
  const completeKey = `complete-${sectionId}-${fieldPath}`;
  const isPolishing = aiLoading[polishKey];
  const isCompleting = aiLoading[completeKey];

  const handlePolish = async () => {
    if (!content || isPolishing) return;
    setShowMenu(false);
    try {
      const result = await polishField(sectionId, fieldPath, content);
      onPolish(result);
    } catch (err) {
      console.error('AI润色失败:', err);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    setShowMenu(false);
    try {
      const result = await completeField(sectionId, fieldPath, content);
      onComplete(result);
    } catch (err) {
      console.error('AI补全失败:', err);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        disabled={isPolishing || isCompleting}
        onMouseEnter={(e) => {
          if (!isPolishing && !isCompleting) {
            e.currentTarget.style.backgroundColor = '#eef2ff';
            e.currentTarget.style.borderColor = '#c7d2fe';
            e.currentTarget.style.color = '#4338ca';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.color = '#6b7280';
        }}
        style={{
          padding: '4px 8px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          backgroundColor: '#ffffff',
          color: '#6b7280',
          fontSize: '12px',
          cursor: isPolishing || isCompleting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.15s',
        }}
      >
        {isPolishing || isCompleting ? (
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              border: '2px solid #e5e7eb',
              borderTopColor: '#4f46e5',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        ) : (
          <span>✨</span>
        )}
        AI
      </button>

      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              minWidth: '120px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={handlePolish}
              disabled={!content || isPolishing}
              onMouseEnter={(e) => {
                if (content && !isPolishing) {
                  e.currentTarget.style.backgroundColor = '#eef2ff';
                  e.currentTarget.style.color = '#4338ca';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                color: '#374151',
                cursor: !content || isPolishing ? 'not-allowed' : 'pointer',
                opacity: !content || isPolishing ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              ✨ AI 润色
            </button>
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              onMouseEnter={(e) => {
                if (!isCompleting) {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.color = '#15803d';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#374151';
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                fontSize: '13px',
                color: '#374151',
                cursor: isCompleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              💡 AI 补全
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
