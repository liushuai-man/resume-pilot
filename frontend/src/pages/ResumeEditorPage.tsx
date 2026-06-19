import { useState } from 'react';
import { useParams } from 'react-router-dom';
import EditorLayout from '@/layouts/EditorLayout';
import EditorToolbar from '@/components/editor/EditorToolbar';
import ResumePreview from '@/components/editor/ResumePreview';
import {
  BasicInfoBlock,
  EducationBlock,
  ExperienceBlock,
  ProjectsBlock,
  SkillsBlock,
  CareerObjectiveBlock,
  CertificationsBlock,
  ClubsBlock,
} from '@/components/editor/editor-blocks';
import AIConversation from '@/components/editor/AIConversation';
import { defaultResumeContent } from '@/utils/defaultResumeContent';
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
import type {
  ResumeContent,
  BasicInfo,
  Education,
  Experience,
  Project,
  Skill,
  Certification,
  Club,
} from '@/types/resume';

export default function ResumeEditorPage() {
  const { id: resumeId } = useParams<{ id: string }>();
  const [activeSection, setActiveSection] = useState('basic');
  const [content, setContent] = useState<ResumeContent>(defaultResumeContent);

  const handleUpdateBasicInfo = (data: BasicInfo) => {
    setContent({ ...content, basicInfo: data });
  };

  const handleUpdateEducation = (data: Education[]) => {
    setContent({ ...content, education: data });
  };

  const handleUpdateExperience = (data: Experience[]) => {
    setContent({ ...content, experience: data });
  };

  const handleUpdateProjects = (data: Project[]) => {
    setContent({ ...content, projects: data });
  };

  const handleUpdateSkills = (data: Skill[]) => {
    setContent({ ...content, skills: data });
  };

  const handleUpdateCareerObjective = (data: string) => {
    setContent({ ...content, careerObjective: data });
  };

  const handleUpdateCertifications = (data: Certification[]) => {
    setContent({ ...content, certifications: data });
  };

  const handleUpdateClubs = (data: Club[]) => {
    setContent({ ...content, clubs: data });
  };

  const handleSave = () => {
    notification.info('正在保存简历...');
    setTimeout(() => {
      notification.success('简历保存成功');
    }, 1000);
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

  const sections = [
    { id: 'basic', label: '基础信息', icon: User, count: undefined },
    {
      id: 'education',
      label: '教育经历',
      icon: GraduationCap,
      count: content.education.length,
    },
    {
      id: 'experience',
      label: '工作经历',
      icon: Briefcase,
      count: content.experience.length,
    },
    {
      id: 'projects',
      label: '项目经验',
      icon: FolderOpen,
      count: content.projects.length,
    },
    {
      id: 'skills',
      label: '专业技能',
      icon: Wrench,
      count: content.skills.length,
    },
    { id: 'objective', label: '职业目标', icon: Target, count: undefined },
    {
      id: 'certifications',
      label: '证书荣誉',
      icon: Award,
      count: content.certifications.length,
    },
    {
      id: 'clubs',
      label: '社团经历',
      icon: Users,
      count: content.clubs.length,
    },
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
      case 'clubs':
        return <ClubsBlock data={content.clubs} onChange={handleUpdateClubs} />;
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

  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          title={resumeId ? `简历-${resumeId}` : '新建简历'}
          onSave={handleSave}
          onExport={handleExport}
        />
      }
      leftPanel={
        <div className="h-full flex flex-col">
          {/* 顶部工具栏 */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                编辑区域
              </span>
              <Button
                variant="ghost"
                size="xs"
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} /> 添加模块
              </Button>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeSection === section.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <section.icon size={16} />
                </div>
                <span className="flex-1 text-left">{section.label}</span>
                {section.count !== undefined && (
                  <Badge variant="outline" size="xs" className="text-gray-400">
                    {section.count}
                  </Badge>
                )}
                <ChevronRight size={14} className="text-gray-400" />
              </button>
            ))}
          </nav>
        </div>
      }
      rightPanel={<AIConversation />}
    >
      {/* 中间预览区 */}
      <div className="resume-preview-container w-full max-w-3xl mx-auto">
        <ResumePreview content={content} />
      </div>
      {/* 左侧编辑区内容 */}
      <div className="fixed left-0 top-14 w-80 h-[calc(100vh-56px)] bg-white border-r border-gray-200 overflow-y-auto hidden lg:block z-20">
        <div className="p-4">{renderSection()}</div>
      </div>
    </EditorLayout>
  );
}
