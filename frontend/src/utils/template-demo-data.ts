import type { ResumeContent, StyleConfig } from '@/types/resume';

export interface LayoutTemplate {
  id: string;
  name: string;
  layout: 'classic' | 'modern' | 'sidebar' | 'minimal';
  description: string;
  styleConfig: StyleConfig;
  demoContent: ResumeContent;
}

function createDemoContent(): ResumeContent {
  return {
    blocks: [
      {
        id: 'basic',
        type: 'basic',
        data: {
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '138-0000-0000',
          location: '北京',
          title: '高级前端工程师',
          summary: '5年前端开发经验，精通 React/Vue/TypeScript。',
        },
      },
      {
        id: 'experience',
        type: 'experience',
        data: [
          {
            id: 'exp1',
            company: 'ABC科技有限公司',
            position: '高级前端工程师',
            startDate: '2022-03',
            endDate: '至今',
            description: '负责核心产品前端架构设计与开发。',
          },
          {
            id: 'exp2',
            company: 'XYZ互联网公司',
            position: '前端开发工程师',
            startDate: '2020-07',
            endDate: '2022-02',
            description: '参与多个产品线的前端开发工作。',
          },
        ],
      },
      {
        id: 'education',
        type: 'education',
        data: [
          {
            id: 'edu1',
            school: '清华大学',
            major: '计算机科学与技术',
            degree: '本科',
            startDate: '2016-09',
            endDate: '2020-06',
          },
        ],
      },
      {
        id: 'skills',
        type: 'skills',
        data: ['React', 'TypeScript', 'Vue3', 'Node.js', 'TailwindCSS', 'Git'],
      },
      {
        id: 'projects',
        type: 'projects',
        data: [
          {
            id: 'proj1',
            name: 'ResumePilot',
            role: '全栈开发',
            startDate: '2025-01',
            endDate: '至今',
            description: '智能简历生成与管理系统。',
            techStack: ['React', 'TypeScript', 'Node.js'],
          },
        ],
      },
    ],
    basicInfo: {
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '138-0000-0000',
      location: '北京',
      title: '高级前端工程师',
      summary: '5年前端开发经验，精通 React/Vue/TypeScript。',
    },
    education: [
      {
        id: 'edu1',
        school: '清华大学',
        major: '计算机科学与技术',
        degree: '本科',
        startDate: '2016-09',
        endDate: '2020-06',
      },
    ],
    experience: [
      {
        id: 'exp1',
        company: 'ABC科技有限公司',
        position: '高级前端工程师',
        startDate: '2022-03',
        endDate: '至今',
        description: '负责核心产品前端架构设计与开发。',
      },
      {
        id: 'exp2',
        company: 'XYZ互联网公司',
        position: '前端开发工程师',
        startDate: '2020-07',
        endDate: '2022-02',
        description: '参与多个产品线的前端开发工作。',
      },
    ],
    projects: [
      {
        id: 'proj1',
        name: 'ResumePilot',
        role: '全栈开发',
        startDate: '2025-01',
        endDate: '至今',
        description: '智能简历生成与管理系统。',
        techStack: ['React', 'TypeScript', 'Node.js'],
      },
    ],
    skills: [
      { id: 's1', name: 'React' },
      { id: 's2', name: 'TypeScript' },
      { id: 's3', name: 'Vue3' },
      { id: 's4', name: 'Node.js' },
      { id: 's5', name: 'TailwindCSS' },
      { id: 's6', name: 'Git' },
    ] as any[],
    careerObjective: '',
    certifications: [],
    campusExperiences: [],
  };
}

const demoContent = createDemoContent();

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'classic',
    name: '经典模板',
    layout: 'classic',
    description: '传统单栏布局，适合各类求职场景',
    styleConfig: {
      primaryColor: '#2563eb',
      secondaryColor: '#1d4ed8',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      backgroundColor: '#ffffff',
      sectionTitleColor: '#2563eb',
      sectionTitleSize: 16,
      lineColor: '#e5e7eb',
    },
    demoContent,
  },
  {
    id: 'modern',
    name: '现代模板',
    layout: 'modern',
    description: '时尚设计风格，突出个人品牌',
    styleConfig: {
      primaryColor: '#7c3aed',
      secondaryColor: '#6d28d9',
      fontSize: 14,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      backgroundColor: '#ffffff',
      sectionTitleColor: '#7c3aed',
      sectionTitleSize: 16,
      lineColor: '#e5e7eb',
    },
    demoContent,
  },
  {
    id: 'sidebar',
    name: '侧边栏模板',
    layout: 'sidebar',
    description: '左侧深色侧边栏，信息层次分明',
    styleConfig: {
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      backgroundColor: '#ffffff',
      sectionTitleColor: '#0f172a',
      sectionTitleSize: 16,
      lineColor: '#e5e7eb',
      sidebarColor: '#0f172a',
      sidebarTextColor: '#f1f5f9',
    },
    demoContent,
  },
  {
    id: 'minimal',
    name: '简约模板',
    layout: 'minimal',
    description: '极简风格，专注于内容本身',
    styleConfig: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      backgroundColor: '#ffffff',
      sectionTitleColor: '#059669',
      sectionTitleSize: 16,
      lineColor: '#e5e7eb',
    },
    demoContent,
  },
];
