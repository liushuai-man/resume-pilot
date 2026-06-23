import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EditorLayout from '@/layouts/EditorLayout';
import EditorToolbar from '@/components/editor/EditorToolbar';
import FormatToolbar from '@/components/editor/FormatToolbar';
import ResumePreview from '@/components/editor/ResumePreview';
import AddModuleModal from '@/components/editor/AddModuleModal';
import {
  BasicInfoBlock,
  EducationBlock,
  ExperienceBlock,
  ProjectsBlock,
  SkillsBlock,
  CareerObjectiveBlock,
  CertificationsBlock,
  CampusExperienceBlock,
} from '@/components/editor/editor-blocks';
import AIConversation from '@/components/editor/AIConversation';
import { exportToPdf } from '@/utils/pdfExport';
import { notification } from '@/components/common/Notification';
import { Button, Card, Badge } from '@mantine/core';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderOpen,
  Wrench,
  Award,
  Target,
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import type {
  BasicInfo,
  Education,
  Experience,
  Project,
  Skill,
  Certification,
  CampusExperience,
} from '@/types/resume';

export default function ResumeEditorPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState('basic');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const {
    resume,
    content,
    isSaving,
    lastSaved,
    updateContent,
    updateTitle,
    saveResume,
    loadResume,
    createResume,
    initStore,
    reset,
  } = useResumeStore();

  useEffect(() => {
    // 如果有 resumeId，总是从服务器加载最新数据
    // 覆盖 localStorage 中的缓存数据
    if (resumeId) {
      // 先清除 localStorage，确保不会读取到旧数据
      localStorage.removeItem('resume-storage');
    }

    // 初始化 store（persist middleware 会自动从 localStorage 恢复状态）
    initStore();

    // 如果有 resumeId，从服务器加载数据
    if (resumeId) {
      console.log('开始加载简历:', resumeId);
      loadResume(resumeId)
        .then(() => {
          const currentResume = useResumeStore.getState().resume;
          console.log('简历加载完成:', currentResume);
        })
        .catch((error) => {
          console.error('简历加载失败:', error);
        });
    }
  }, [resumeId, loadResume, initStore]);

  // 页面卸载时（包括刷新）保存数据到本地存储
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 页面刷新时数据会自动通过 Zustand persist 保存到 localStorage
      // 不需要额外操作
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 组件卸载时（导航离开）自动保存到服务器
  useEffect(() => {
    let isUnmounted = false;

    const handleUnmount = async () => {
      if (isUnmounted) return;
      isUnmounted = true;

      const currentResume = useResumeStore.getState().resume;
      if (currentResume && currentResume.id) {
        try {
          await saveResume(currentResume.id);
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }
      // 不需要清除 localStorage，Zustand persist 会自动处理
      // 保留 localStorage 可以在页面刷新时快速恢复状态
    };

    return () => {
      handleUnmount();
    };
  }, [saveResume]);

  const handleUpdateBasicInfo = (data: BasicInfo) => {
    updateContent({ basicInfo: data });
  };

  const handleUpdateEducation = (data: Education[]) => {
    updateContent({ education: data });
  };

  const handleUpdateExperience = (data: Experience[]) => {
    updateContent({ experience: data });
  };

  const handleUpdateProjects = (data: Project[]) => {
    updateContent({ projects: data });
  };

  const handleUpdateSkills = (data: Skill[]) => {
    updateContent({ skills: data });
  };

  const handleUpdateCareerObjective = (data: string) => {
    updateContent({ careerObjective: data });
  };

  const handleUpdateCertifications = (data: Certification[]) => {
    updateContent({ certifications: data });
  };

  const handleUpdateCampusExperiences = (data: CampusExperience[]) => {
    updateContent({ campusExperiences: data });
  };

  const handleSave = async () => {
    if (resumeId) {
      // 如果 URL 中有 resumeId，说明是编辑现有简历
      // 获取当前标题（优先从 resume，然后从编辑器输入）
      const currentTitle =
        resume?.title || content?.basicInfo?.title || '我的简历';
      await saveResume(resumeId, currentTitle);
    } else {
      // 如果没有 resumeId，说明是新建简历
      // 使用 store 中的标题（用户在顶部导航栏修改的标题）
      // 如果没有设置，使用默认值 '我的简历'
      const currentTitle =
        resume?.title || content?.basicInfo?.title || '我的简历';
      await createResume(currentTitle);
    }
  };

  const handleExport = () => {
    notification.info('正在生成PDF简历...');
    const resumeElement = document.querySelector(
      '.resume-preview-container'
    ) as HTMLElement;
    if (resumeElement) {
      exportToPdf(resumeElement, content.basicInfo.name || '我的简历')
        .then(() => {
          notification.success('PDF简历导出成功');
        })
        .catch(() => {
          notification.error('PDF导出失败');
        });
    }
  };

  const handleTitleChange = (title: string) => {
    updateTitle(title);
  };

  const sections = [
    { id: 'basic', label: '基础信息', icon: User, count: undefined },
    {
      id: 'education',
      label: '教育经历',
      icon: GraduationCap,
      count: content.education?.length ?? 0,
    },
    {
      id: 'experience',
      label: '工作经历',
      icon: Briefcase,
      count: content.experience?.length ?? 0,
    },
    {
      id: 'projects',
      label: '项目经验',
      icon: FolderOpen,
      count: content.projects?.length ?? 0,
    },
    {
      id: 'skills',
      label: '专业技能',
      icon: Wrench,
      count: content.skills?.length ?? 0,
    },
    {
      id: 'certifications',
      label: '证书荣誉',
      icon: Award,
      count: content.certifications?.length ?? 0,
    },
    {
      id: 'campus',
      label: '校园经历',
      icon: Users,
      count: content.campusExperiences?.length ?? 0,
    },
    { id: 'objective', label: '职业目标', icon: Target, count: undefined },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <BasicInfoBlock
            data={content.basicInfo}
            onChange={handleUpdateBasicInfo}
          />
        );
      case 'education':
        return (
          <EducationBlock
            data={content.education}
            onChange={handleUpdateEducation}
          />
        );
      case 'experience':
        return (
          <ExperienceBlock
            data={content.experience}
            onChange={handleUpdateExperience}
          />
        );
      case 'projects':
        return (
          <ProjectsBlock
            data={content.projects}
            onChange={handleUpdateProjects}
          />
        );
      case 'skills':
        return (
          <SkillsBlock data={content.skills} onChange={handleUpdateSkills} />
        );
      case 'objective':
        return (
          <CareerObjectiveBlock
            data={content.careerObjective}
            onChange={handleUpdateCareerObjective}
          />
        );
      case 'certifications':
        return (
          <CertificationsBlock
            data={content.certifications}
            onChange={handleUpdateCertifications}
          />
        );
      case 'campus':
        return (
          <CampusExperienceBlock
            data={content.campusExperiences}
            onChange={handleUpdateCampusExperiences}
          />
        );
      default:
        return (
          <Card className="border-none shadow-sm">
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                {(() => {
                  const section = sections.find((s) => s.id === activeSection);
                  if (section) {
                    const Icon = section.icon;
                    return <Icon size={24} />;
                  }
                  return null;
                })()}
              </div>
              <p>即将开发</p>
            </div>
          </Card>
        );
    }
  };

  const formatLastSaved = (date: Date | null | string) => {
    if (!date) return '';

    // 确保 date 是 Date 对象
    const lastSavedDate = typeof date === 'string' ? new Date(date) : date;

    const now = new Date();
    const diff = now.getTime() - lastSavedDate.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return lastSavedDate.toLocaleDateString();
  };

  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          title={resume?.title || content?.basicInfo?.title || '新建简历'}
          onSave={handleSave}
          onExport={handleExport}
          lastModified={formatLastSaved(lastSaved)}
          isSaving={isSaving}
          onTitleChange={handleTitleChange}
        />
      }
      formatToolbar={<FormatToolbar />}
      leftPanel={
        <div className="h-full flex flex-col overflow-hidden">
          {/* 顶部工具栏 */}
          <div className="p-3 border-b-2 border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                编辑区域
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="text-blue-400 bg-white hover:bg-blue-50 hover:border-blue-400 hover:text-blue-500"
                onClick={() => setShowAddModuleModal(true)}
              >
                <Plus size={14} /> 添加模块
              </Button>
            </div>
          </div>

          {/* 导航菜单与编辑内容 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {sections.map((section) => (
              <div key={section.id} className="rounded-lg overflow-hidden">
                {/* 导航项 */}
                <button
                  onClick={() =>
                    setActiveSection(
                      activeSection === section.id ? '' : section.id
                    )
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <section.icon size={16} />
                  </div>
                  <span className="flex-1 text-left truncate">
                    {section.label}
                  </span>
                  {section.count !== undefined && (
                    <Badge
                      variant="outline"
                      size="xs"
                      className="text-gray-400 flex-shrink-0"
                    >
                      {section.count}
                    </Badge>
                  )}
                  <ChevronRight
                    size={14}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* 编辑内容区域 - 在对应导航项下方展开 */}
                {activeSection === section.id && (
                  <div className="border-t border-gray-100 bg-white">
                    {renderSection()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      }
      rightPanel={<AIConversation />}
    >
      {/* 中间预览区 */}
      <div className="resume-preview-container w-full h-full">
        <ResumePreview content={content} />
      </div>
      {/* 添加模块模态框 */}
      <AddModuleModal
        isOpen={showAddModuleModal}
        onClose={() => setShowAddModuleModal(false)}
        onSelect={(moduleId) => {
          setActiveSection(moduleId);
        }}
      />
    </EditorLayout>
  );
}
