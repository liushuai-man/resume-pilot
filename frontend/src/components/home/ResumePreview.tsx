import { Paper, Text, Divider, Avatar } from '@mantine/core';
import type {
  ResumeContent,
  BasicInfo,
  EducationItem,
  ExperienceItem,
  ProjectItem,
} from '@/types/resume';
import {
  Mail,
  Phone,
  MapPin,
  Target,
  GraduationCap,
  Briefcase,
  FolderOpen,
  Settings,
  Award,
} from 'lucide-react';

interface ResumePreviewProps {
  content: ResumeContent;
}

export default function ResumePreview({ content }: ResumePreviewProps) {
  const renderBlock = (block: ResumeContent['blocks'][0]) => {
    const { type, data } = block;

    switch (type) {
      case 'basic': {
        const info = data as BasicInfo;
        return (
          <div key={block.id} className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              {info.avatar ? (
                <Avatar src={info.avatar} size="xl" />
              ) : (
                <Avatar size="xl" className="bg-gray-200 text-gray-500">
                  {info.name?.charAt(0)}
                </Avatar>
              )}
              <div className="flex-1">
                <Text size="2xl" fw="bold" className="text-gray-800 mb-1">
                  {info.name || '姓名'}
                </Text>
                {info.title && (
                  <Text size="sm" className="text-blue-600 mb-2">
                    {info.title}
                  </Text>
                )}
                <div className="space-y-1">
                  {info.email && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Mail size={14} />
                      {info.email}
                    </div>
                  )}
                  {info.phone && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Phone size={14} />
                      {info.phone}
                    </div>
                  )}
                  {info.location && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={14} />
                      {info.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {info.bio && (
              <Text size="sm" className="text-gray-600 mt-4 leading-relaxed">
                {info.bio}
              </Text>
            )}
          </div>
        );
      }

      case 'objective': {
        const objective = (data as { objective: string }).objective;
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-3 flex items-center gap-2"
            >
              <Target size={18} /> 职业目标
            </Text>
            <Text size="sm" className="text-gray-600 leading-relaxed">
              {objective || '暂无职业目标'}
            </Text>
          </div>
        );
      }

      case 'education': {
        const items = data as EducationItem[];
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-4 flex items-center gap-2"
            >
              <GraduationCap size={18} /> 教育背景
            </Text>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-16 text-sm text-gray-400">
                      {item.startDate} - {item.endDate}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Text fw="medium" className="text-gray-800">
                          {item.school}
                        </Text>
                        <Text size="sm" className="text-gray-500">
                          {item.degree}
                        </Text>
                      </div>
                      <Text size="sm" className="text-blue-600">
                        {item.major}
                      </Text>
                      {item.description && (
                        <Text size="sm" className="text-gray-600 mt-1">
                          {item.description}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                暂无教育经历
              </Text>
            )}
          </div>
        );
      }

      case 'experience': {
        const items = data as ExperienceItem[];
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-4 flex items-center gap-2"
            >
              <Briefcase size={18} /> 工作经历
            </Text>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-16 text-sm text-gray-400">
                      {item.startDate} - {item.endDate}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Text fw="medium" className="text-gray-800">
                          {item.company}
                        </Text>
                      </div>
                      <Text size="sm" className="text-blue-600">
                        {item.position}
                      </Text>
                      {item.description && (
                        <Text size="sm" className="text-gray-600 mt-1">
                          {item.description}
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                暂无工作经历
              </Text>
            )}
          </div>
        );
      }

      case 'projects': {
        const items = data as ProjectItem[];
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-4 flex items-center gap-2"
            >
              <FolderOpen size={18} /> 项目经验
            </Text>
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-16 text-sm text-gray-400">
                      {item.startDate} - {item.endDate}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Text fw="medium" className="text-gray-800">
                          {item.name}
                        </Text>
                        <Text size="sm" className="text-gray-500">
                          {item.role}
                        </Text>
                      </div>
                      {item.description && (
                        <Text size="sm" className="text-gray-600 mt-1">
                          {item.description}
                        </Text>
                      )}
                      {item.techStack && item.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.techStack.map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                暂无项目经验
              </Text>
            )}
          </div>
        );
      }

      case 'skills': {
        const skills = data as string[];
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-4 flex items-center gap-2"
            >
              <Settings size={18} /> 专业技能
            </Text>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                暂无技能信息
              </Text>
            )}
          </div>
        );
      }

      case 'certifications': {
        const certifications = (
          data as {
            certifications: (string | { name: string; date?: string })[];
          }
        ).certifications;
        return (
          <div key={block.id} className="mb-6">
            <Text
              size="lg"
              fw="bold"
              className="text-gray-800 mb-4 flex items-center gap-2"
            >
              <Award size={18} /> 证书荣誉
            </Text>
            {certifications && certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, index) => {
                  const certText =
                    typeof cert === 'string'
                      ? cert
                      : `${cert.name}${cert.date ? ` (${cert.date})` : ''}`;
                  return (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full"
                    >
                      {certText}
                    </span>
                  );
                })}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                暂无证书荣誉
              </Text>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <Paper className="p-8 max-w-[800px] mx-auto bg-white shadow-lg">
      <div className="prose prose-sm max-w-none">
        {content.blocks?.map(renderBlock)}
      </div>
      <Divider className="my-6" />
      <Text size="xs" className="text-gray-400 text-center">
        ResumePilot - 智能简历助手
      </Text>
    </Paper>
  );
}
