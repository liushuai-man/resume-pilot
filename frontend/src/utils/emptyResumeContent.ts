import type { ResumeSection } from '@/types/resume-document';

const createSectionId = (type: string) =>
  `section-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function createEmptyResumeSections(): ResumeSection[] {
  return [
    {
      id: createSectionId('profile'),
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
      id: createSectionId('objective'),
      type: 'objective',
      title: '职业目标',
      visible: true,
      order: 1,
      data: { content: '' },
    },
    {
      id: createSectionId('education'),
      type: 'education',
      title: '教育经历',
      visible: true,
      order: 2,
      data: [],
    },
    {
      id: createSectionId('experience'),
      type: 'experience',
      title: '工作经历',
      visible: true,
      order: 3,
      data: [],
    },
    {
      id: createSectionId('project'),
      type: 'project',
      title: '项目经验',
      visible: true,
      order: 4,
      data: [],
    },
    {
      id: createSectionId('skill'),
      type: 'skill',
      title: '专业技能',
      visible: true,
      order: 5,
      data: [],
    },
    {
      id: createSectionId('certification'),
      type: 'certification',
      title: '证书荣誉',
      visible: true,
      order: 6,
      data: [],
    },
  ];
}

export const emptyResumeContent = {
  blocks: [],
  basicInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: [],
  careerObjective: '',
  certifications: [],
  campusExperiences: [],
  _documentSections: createEmptyResumeSections(),
};
