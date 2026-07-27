import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ResumeDocument,
  ResumeSection,
  ResumeStyle,
  ResumeLayout,
} from '@/types/resume-document';
import { SECTION_TYPE_CONFIGS } from '@/types/resume-document';
import { polishSection, completeSection } from '@/api/document.api';

interface DocumentStore {
  document: ResumeDocument | null;
  activeSectionId: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
  aiLoading: Record<string, boolean>;

  loadDocument: (doc: ResumeDocument) => void;

  updateSectionData: (sectionId: string, data: any) => void;
  updateSectionItem: (sectionId: string, itemId: string, updates: any) => void;
  addSectionItem: (sectionId: string, item: any) => void;
  removeSectionItem: (sectionId: string, itemId: string) => void;

  addSection: (section: ResumeSection, afterId?: string) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, targetIndex: number) => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  toggleSectionVisible: (sectionId: string) => void;

  updateStyle: (style: Partial<ResumeStyle>) => void;
  updateLayout: (layout: Partial<ResumeLayout>) => void;

  setActiveSection: (sectionId: string | null) => void;

  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setAiLoading: (key: string, loading: boolean) => void;

  reset: () => void;

  createEmptyDocument: (title?: string) => ResumeDocument;
  addSectionByType: (type: string, afterId?: string) => void;

  polishField: (
    sectionId: string,
    fieldPath: string,
    content: string
  ) => Promise<string>;
  completeField: (
    sectionId: string,
    fieldPath: string,
    existingContent: string
  ) => Promise<string>;
}

const defaultStyle: ResumeStyle = {
  theme: 'default',
  primaryColor: '#2563eb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
  fontSize: 14,
  lineHeight: 1.6,
  margin: 24,
  sectionSpacing: 24,
  sectionTitleColor: '#1f2937',
  sectionTitleSize: 16,
  lineColor: '#e5e7eb',
  sidebarColor: '#f3f4f6',
  sidebarTextColor: '#374151',
  backgroundColor: '#ffffff',
};

const defaultLayout: ResumeLayout = {
  template: 'classic',
  pageSize: 'A4',
  orientation: 'portrait',
};

function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      document: null,
      activeSectionId: null,
      isSaving: false,
      lastSaved: null,
      aiLoading: {},

      createEmptyDocument: (title = '我的简历'): ResumeDocument => {
        const now = new Date().toISOString();
        return {
          id: generateId('doc'),
          title,
          sections: [
            {
              id: generateId('section'),
              type: 'profile',
              title: '个人信息',
              visible: true,
              order: 0,
              data: {
                name: '',
                title: '',
                email: '',
                phone: '',
                location: '',
                summary: '',
              },
            },
            {
              id: generateId('section'),
              type: 'education',
              title: '教育经历',
              visible: true,
              order: 1,
              data: [],
            },
            {
              id: generateId('section'),
              type: 'experience',
              title: '工作经历',
              visible: true,
              order: 2,
              data: [],
            },
            {
              id: generateId('section'),
              type: 'project',
              title: '项目经验',
              visible: true,
              order: 3,
              data: [],
            },
            {
              id: generateId('section'),
              type: 'skill',
              title: '专业技能',
              visible: true,
              order: 4,
              data: [],
            },
          ],
          style: { ...defaultStyle },
          layout: { ...defaultLayout },
          createdAt: now,
          updatedAt: now,
        };
      },

      loadDocument: (doc) => {
        set({ document: doc, activeSectionId: null });
      },

      updateSectionData: (sectionId, data) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) => {
            if (s.id !== sectionId) return s;
            if (Array.isArray(data)) {
              return { ...s, data };
            }
            return { ...s, data: { ...s.data, ...data } };
          }) as ResumeSection[];
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateSectionItem: (sectionId, itemId, updates) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) => {
            if (s.id !== sectionId) return s;
            if (!Array.isArray(s.data)) return s;
            const newData = s.data.map((item: any) =>
              item.id === itemId ? { ...item, ...updates } : item
            );
            return { ...s, data: newData };
          }) as ResumeSection[];
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addSectionItem: (sectionId, item) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) => {
            if (s.id !== sectionId) return s;
            if (!Array.isArray(s.data)) return s;
            return { ...s, data: [...s.data, item] };
          }) as ResumeSection[];
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeSectionItem: (sectionId, itemId) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) => {
            if (s.id !== sectionId) return s;
            if (!Array.isArray(s.data)) return s;
            return {
              ...s,
              data: s.data.filter((item: any) => item.id !== itemId),
            };
          }) as ResumeSection[];
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addSection: (section, afterId) => {
        set((state) => {
          if (!state.document) return state;
          let sections = [...state.document.sections];
          if (afterId) {
            const index = sections.findIndex((s) => s.id === afterId);
            sections.splice(index + 1, 0, section);
          } else {
            sections.push(section);
          }
          sections = sections.map((s, i) => ({ ...s, order: i }));
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addSectionByType: (type, afterId) => {
        const config = SECTION_TYPE_CONFIGS.find((c) => c.type === type);
        if (!config) return;

        const newSection: ResumeSection = {
          id: generateId('section'),
          type: config.type as any,
          title: config.defaultTitle,
          visible: true,
          order: 0,
          data: config.isList ? [] : {},
        } as ResumeSection;

        get().addSection(newSection, afterId);
      },

      removeSection: (sectionId) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections
            .filter((s) => s.id !== sectionId)
            .map((s, i) => ({ ...s, order: i }));
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
            activeSectionId:
              state.activeSectionId === sectionId
                ? null
                : state.activeSectionId,
          };
        });
      },

      moveSection: (sectionId, targetIndex) => {
        set((state) => {
          if (!state.document) return state;
          const sections = [...state.document.sections];
          const currentIndex = sections.findIndex((s) => s.id === sectionId);
          if (currentIndex === -1) return state;
          const [section] = sections.splice(currentIndex, 1);
          sections.splice(targetIndex, 0, section);
          const reordered = sections.map((s, i) => ({ ...s, order: i }));
          return {
            document: {
              ...state.document,
              sections: reordered,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateSectionTitle: (sectionId, title) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) =>
            s.id === sectionId ? { ...s, title } : s
          );
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      toggleSectionVisible: (sectionId) => {
        set((state) => {
          if (!state.document) return state;
          const sections = state.document.sections.map((s) =>
            s.id === sectionId ? { ...s, visible: !s.visible } : s
          );
          return {
            document: {
              ...state.document,
              sections,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateStyle: (style) => {
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              style: { ...state.document.style, ...style },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      updateLayout: (layout) => {
        set((state) => {
          if (!state.document) return state;
          return {
            document: {
              ...state.document,
              layout: { ...state.document.layout, ...layout },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      setActiveSection: (sectionId) => {
        set({ activeSectionId: sectionId });
      },

      setSaving: (saving) => {
        set({ isSaving: saving });
      },

      setLastSaved: (date) => {
        set({ lastSaved: date });
      },

      setAiLoading: (key, loading) => {
        set((state) => ({
          aiLoading: { ...state.aiLoading, [key]: loading },
        }));
      },

      reset: () => {
        set({
          document: null,
          activeSectionId: null,
          isSaving: false,
          lastSaved: null,
          aiLoading: {},
        });
      },

      polishField: async (sectionId, fieldPath, content) => {
        const state = get();
        if (!state.document) throw new Error('没有简历数据');
        const section = state.document.sections.find((s) => s.id === sectionId);
        if (!section) throw new Error('模块不存在');

        const loadingKey = `polish-${sectionId}-${fieldPath}`;
        set((s) => ({ aiLoading: { ...s.aiLoading, [loadingKey]: true } }));

        try {
          const result = await polishSection({
            resumeId: state.document.id,
            sectionType: section.type,
            sectionTitle: section.title,
            content,
            targetField: fieldPath,
          });
          return result.result;
        } finally {
          set((s) => ({ aiLoading: { ...s.aiLoading, [loadingKey]: false } }));
        }
      },

      completeField: async (sectionId, fieldPath, existingContent) => {
        const state = get();
        if (!state.document) throw new Error('没有简历数据');
        const section = state.document.sections.find((s) => s.id === sectionId);
        if (!section) throw new Error('模块不存在');

        const loadingKey = `complete-${sectionId}-${fieldPath}`;
        set((s) => ({ aiLoading: { ...s.aiLoading, [loadingKey]: true } }));

        try {
          const result = await completeSection({
            resumeId: state.document.id,
            sectionType: section.type,
            sectionTitle: section.title,
            existingContent,
          });
          return result.result;
        } finally {
          set((s) => ({ aiLoading: { ...s.aiLoading, [loadingKey]: false } }));
        }
      },
    }),
    {
      name: 'document-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        document: state.document,
        activeSectionId: state.activeSectionId,
      }),
    }
  )
);
