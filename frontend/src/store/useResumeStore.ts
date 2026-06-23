import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Resume, ResumeContent } from '@/types/resume';
import { emptyResumeContent } from '@/utils/emptyResumeContent';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';

interface ResumeState {
  resume: Resume | null;
  content: ResumeContent;
  isSaving: boolean;
  lastSaved: Date | null;
  initialized: boolean;

  initStore: () => void;
  setResume: (resume: Resume) => void;
  setContent: (content: ResumeContent) => void;
  updateContent: (content: Partial<ResumeContent>) => void;
  updateTitle: (title: string) => void;
  saveResume: (resumeId?: string, title?: string) => Promise<void>;
  loadResume: (id: string) => Promise<void>;
  createResume: (title: string) => Promise<void>;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resume: null,
      content: emptyResumeContent,
      isSaving: false,
      lastSaved: null,
      initialized: false,

      // 初始化时修复 localStorage 数据格式
      initStore: () => {
        const storage = localStorage.getItem('resume-storage');
        if (storage) {
          try {
            const parsed = JSON.parse(storage);

            // 如果 lastSaved 是字符串，转换为 Date 对象
            if (parsed.lastSaved && typeof parsed.lastSaved === 'string') {
              set({ lastSaved: new Date(parsed.lastSaved) });
            }

            // 检查 content 是否有效
            const hasValidContent =
              parsed.content &&
              typeof parsed.content === 'object' &&
              parsed.content.basicInfo &&
              typeof parsed.content.basicInfo === 'object' &&
              parsed.content.education !== undefined &&
              parsed.content.experience !== undefined;

            // 只有当 resume 和 content 都有效时才恢复状态
            // 否则清除 localStorage 并使用空内容重新开始
            if (
              parsed.resume &&
              typeof parsed.resume === 'object' &&
              hasValidContent
            ) {
              set({
                resume: parsed.resume as Resume,
                content: parsed.content,
                initialized: true,
              });
            } else {
              // 数据不完整或无效，清除并重新开始
              localStorage.removeItem('resume-storage');
              set({
                content: emptyResumeContent,
                initialized: false,
              });
            }
          } catch (e) {
            console.error('Failed to parse resume storage:', e);
            localStorage.removeItem('resume-storage');
            set({ content: emptyResumeContent });
            set({ initialized: false });
          }
        } else {
          // 没有存储的数据，使用空内容
          set({ content: emptyResumeContent });
          set({ initialized: false });
        }
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
          // 如果 resume 不存在，创建一个临时的 resume 对象来保存标题
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
        if (isSaving) return;

        // 优先使用传入的 resumeId，否则使用 store 中的 resume.id
        const targetId = resumeId || resume?.id;
        if (!targetId) {
          console.warn('无法保存：没有简历数据', { resumeId, resume });
          return;
        }

        // 优先使用传入的标题，然后是 store 中的标题，最后是默认值
        const currentTitle = title || resume?.title || '我的简历';

        console.log('准备保存简历:', {
          targetId,
          currentTitle,
          contentLength: JSON.stringify(content).length,
        });

        set({ isSaving: true });

        try {
          // 更新现有简历
          const response = await resumeApi.updateResume(targetId, {
            title: currentTitle,
            content,
          });
          if (response.code === 200) {
            set({
              resume: response.data,
              content: response.data.content, // 确保 content 也从响应中更新
              lastSaved: new Date(),
            });
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
            set({
              resume: response.data,
              content: response.data.content,
              lastSaved: new Date(),
              initialized: true,
            });
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

      createResume: async (title) => {
        set({ isSaving: true });
        try {
          const response = await resumeApi.createResume({
            template_id: 'default',
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
        });
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resume: state.resume,
        content: state.content,
        lastSaved: state.lastSaved,
        initialized: state.initialized,
      }),
    }
  )
);
