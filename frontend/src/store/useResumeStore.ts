import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Resume,
  ResumeContent,
  Template,
  StyleConfig,
} from '@/types/resume';
import { emptyResumeContent } from '@/utils/emptyResumeContent';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';

interface ResumeState {
  resume: Resume | null;
  content: ResumeContent;
  isSaving: boolean;
  lastSaved: Date | null;
  initialized: boolean;
  template: Template | null;
  templateStyle: StyleConfig | null;
  templateLayout: string;
  formatConfig: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    margin: string;
    textAlign: 'left' | 'center' | 'right';
  };

  initStore: () => void;
  setResume: (resume: Resume) => void;
  setContent: (content: ResumeContent) => void;
  updateContent: (content: Partial<ResumeContent>) => void;
  updateTitle: (title: string) => void;
  saveResume: (resumeId?: string, title?: string) => Promise<void>;
  loadResume: (id: string) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;
  createResume: (title: string) => Promise<void>;
  reset: () => void;
  updateFormatConfig: (config: Partial<ResumeState['formatConfig']>) => void;
}

const defaultTemplateStyle: StyleConfig = {
  primaryColor: '#2563EB',
  secondaryColor: '#64748B',
  fontSize: 14,
  fontFamily: "'Microsoft YaHei', Arial, sans-serif",
  backgroundColor: '#FFFFFF',
  sectionTitleColor: '#2563EB',
  sectionTitleSize: 16,
  lineColor: '#E2E8F0',
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resume: null,
      content: emptyResumeContent,
      isSaving: false,
      lastSaved: null,
      initialized: false,
      template: null,
      templateStyle: defaultTemplateStyle,
      templateLayout: 'classic',
      formatConfig: {
        fontFamily: '微软雅黑',
        fontSize: '16',
        lineHeight: '1.5',
        margin: '20',
        textAlign: 'left',
      },

      initStore: () => {
        set({ initialized: true });
      },

      setResume: (resume) => {
        set({ resume });
      },

      setContent: (content) => {
        set({ content });
      },

      updateContent: (partialContent) => {
        set((state) => ({
          content: { ...state.content, ...partialContent },
        }));
      },

      updateTitle: (title) => {
        set((state) => {
          if (state.resume) {
            return {
              resume: { ...state.resume, title },
            };
          }
          return {
            resume: {
              id: '',
              user_id: '',
              template_id: 'default',
              title,
              content: state.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_deleted: false,
            },
          };
        });
      },

      saveResume: async (resumeId?: string, title?: string) => {
        const { resume, content, isSaving } = get();
        console.log('saveResume 被调用:', {
          resumeId,
          title,
          resume,
          contentLength: JSON.stringify(content).length,
        });

        if (isSaving) return;

        const targetId = resumeId || resume?.id;
        if (!targetId) {
          console.warn('无法保存：没有简历数据', { resumeId, resume });
          return;
        }

        const currentTitle = title || resume?.title || '我的简历';

        console.log('准备保存简历:', {
          targetId,
          currentTitle,
          contentLength: JSON.stringify(content).length,
        });

        set({ isSaving: true });

        try {
          const response = await resumeApi.updateResume(targetId, {
            title: currentTitle,
            content,
          });
          console.log('API 响应:', response);
          if (response.code === 200) {
            set({
              resume: response.data,
              content: response.data.content,
              lastSaved: new Date(),
            });
            setTimeout(() => {
              const storage = localStorage.getItem('resume-storage');
              console.log('保存后 localStorage:', storage);
            }, 100);
            notification.success('简历保存成功');
            console.log('简历保存成功:', response.data);
          } else {
            notification.error(response.message || '保存失败');
          }
        } catch (error) {
          console.error('保存简历失败:', error);
          notification.error('保存失败，请稍后重试');
        } finally {
          set({ isSaving: false });
        }
      },

      loadResume: async (id) => {
        set({ isSaving: true });
        try {
          const response = await resumeApi.getResumeById(id);
          if (response.code === 200 && response.data) {
            console.log('准备设置状态:', {
              resume: response.data,
              content: response.data.content,
            });
            set({
              resume: response.data,
              content: response.data.content,
              lastSaved: new Date(),
              initialized: true,
            });

            if (response.data.template_id) {
              await get().loadTemplate(response.data.template_id);
            }
          } else {
            notification.error(response.message || '加载简历失败');
          }
        } catch (error) {
          console.error('加载简历失败:', error);
          notification.error('加载失败，请稍后重试');
        } finally {
          set({ isSaving: false });
        }
      },

      loadTemplate: async (templateId) => {
        try {
          const response = await resumeApi.getTemplateById(templateId);
          if (response.code === 200 && response.data) {
            const template = response.data;
            const styleConfig = template.style_config || defaultTemplateStyle;
            const layout =
              template.schema?.layout || styleConfig.layout || 'classic';
            set({
              template,
              templateStyle: styleConfig,
              templateLayout: layout,
            });
            console.log('模板加载成功:', { templateId, styleConfig, layout });
          }
        } catch (error) {
          console.error('加载模板失败:', error);
        }
      },

      createResume: async (title) => {
        set({ isSaving: true });
        try {
          const response = await resumeApi.createResume({
            template_id: 'classic-blue',
            title,
            content: emptyResumeContent,
          });
          if (response.code === 200 && response.data) {
            set({
              resume: response.data,
              content: response.data.content,
              lastSaved: new Date(),
              initialized: true,
            });

            if (response.data.template_id) {
              await get().loadTemplate(response.data.template_id);
            }

            notification.success('简历创建成功');
          } else {
            notification.error('创建失败');
          }
        } catch (error) {
          console.error('创建简历失败:', error);
          notification.error('创建失败，请稍后重试');
        } finally {
          set({ isSaving: false });
        }
      },

      reset: () => {
        set({
          resume: null,
          content: emptyResumeContent,
          isSaving: false,
          lastSaved: null,
          initialized: false,
          template: null,
          templateStyle: defaultTemplateStyle,
          templateLayout: 'classic',
          formatConfig: {
            fontFamily: '微软雅黑',
            fontSize: '16',
            lineHeight: '1.5',
            margin: '20',
            textAlign: 'left',
          },
        });
      },

      updateFormatConfig: (config) => {
        set((state) => ({
          formatConfig: { ...state.formatConfig, ...config },
        }));
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          delete persistedState.templateStyle;
          delete persistedState.templateLayout;
        }
        return persistedState;
      },
      partialize: (state) => ({
        resume: state.resume,
        content: state.content,
        lastSaved: state.lastSaved,
        initialized: state.initialized,
      }),
    }
  )
);
