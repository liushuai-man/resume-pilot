import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const defaultFlatContent = {
  basicInfo: {
    name: '陈媛媛',
    email: 'abbey@example.com',
    phone: '138-8888-8888',
    location: '北京',
    title: '系统集成工程师',
    bio: '计算机科学与技术专业本科，具备扎实的计算机基础和系统集成实践经验。熟悉Linux、网络协议、虚拟化及云原生技术，能够独立完成服务器部署和系统实施工作。',
  },
  education: [
    {
      id: 'edu-1',
      school: '北京邮电大学',
      major: '计算机科学与技术',
      degree: '本科',
      startDate: '2021-09',
      endDate: '2025-06',
      gpa: '3.7/4.0',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: '神州数码系统集成有限公司',
      position: '系统集成工程师实习生',
      department: '解决方案部',
      startDate: '2024-07',
      endDate: '2024-12',
      location: '北京',
      description: '参与政府智慧园区项目实施，协助完成服务器、交换机及存储设备部署。负责Linux服务器环境初始化配置，包括用户权限管理、服务部署及日志排查。',
      achievements: [
        '参与智慧园区系统集成项目的需求调研和方案设计',
        '负责完成10+台服务器的环境部署和配置工作',
        '协助编写项目实施方案、测试报告和用户手册',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: '智慧园区系统集成项目',
      role: '系统集成工程师',
      startDate: '2024-08',
      endDate: '2024-11',
      location: '北京',
      description: '负责园区视频监控、门禁管理及智能停车系统的集成实施，完成服务器环境部署及网络连通性测试。',
      techStack: ['Linux', 'VMware', 'Docker', 'MySQL'],
      achievements: [
        '完成20+台服务器的环境部署和网络配置',
        '参与系统架构设计和接口联调工作',
        '编写项目实施文档和用户操作手册',
      ],
    },
    {
      id: 'proj-2',
      name: '企业私有云平台建设项目',
      role: '云平台实施工程师',
      startDate: '2024-03',
      endDate: '2024-06',
      location: '北京',
      description: '参与企业私有云平台建设，完成资源规划与环境部署，负责Kubernetes集群安装及基础运维配置。',
      techStack: ['Docker', 'Kubernetes', 'Prometheus', 'Linux'],
      achievements: [
        '完成Kubernetes集群的部署和基础配置',
        '搭建容器镜像仓库和监控平台',
        '参与系统性能测试及故障排查工作',
      ],
    },
  ],
  skills: [
    { id: 'skill-1', name: 'Linux', level: '熟练', category: '运维' },
    { id: 'skill-2', name: 'Docker', level: '熟练', category: '容器化' },
    { id: 'skill-3', name: 'Kubernetes', level: '熟悉', category: '容器编排' },
    { id: 'skill-4', name: 'MySQL', level: '熟练', category: '数据库' },
    { id: 'skill-5', name: 'Python', level: '熟悉', category: '编程语言' },
    { id: 'skill-6', name: 'VMware', level: '熟悉', category: '虚拟化' },
  ],
  careerObjective:
    '希望在系统集成领域发挥专业技能，为企业数字化转型贡献力量。',
  certifications: [
    { id: 'cert-1', name: '华为HCIA-Datacom', issuer: '华为', date: '2024-06' },
    { id: 'cert-2', name: '软考系统集成项目管理工程师', issuer: '工信部', date: '2024-11' },
    { id: 'cert-3', name: '红帽RHCSA', issuer: '红帽', date: '2025-03' },
  ],
  campusExperiences: [
    {
      id: 'campus-1',
      name: '计算机协会',
      role: '技术部部长',
      position: '部长',
      startDate: '2022-09',
      endDate: '2024-06',
      achievements: [
        '组织技术分享活动20余场，覆盖后端开发、云计算等方向',
        '带领协会成员完成校园管理系统开发项目',
      ],
    },
  ],
};

const resumeTemplates = [
  {
    id: 'classic-blue',
    name: '经典蓝调',
    category: '通用',
    layout: 'classic',
    style_config: {
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', Arial, sans-serif",
      backgroundColor: '#FFFFFF',
      sectionTitleColor: '#2563EB',
      sectionTitleSize: 16,
      lineColor: '#E2E8F0',
    },
  },
  {
    id: 'tech-sidebar',
    name: '科技侧边',
    category: '科技',
    layout: 'sidebar',
    style_config: {
      primaryColor: '#06B6D4',
      secondaryColor: '#64748B',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', Arial, sans-serif",
      backgroundColor: '#FFFFFF',
      sectionTitleColor: '#06B6D4',
      sectionTitleSize: 16,
      lineColor: '#E2E8F0',
      sidebarColor: '#0F172A',
      sidebarTextColor: '#F1F5F9',
    },
  },
  {
    id: 'minimal-elegant',
    name: '极简优雅',
    category: '通用',
    layout: 'minimal',
    style_config: {
      primaryColor: '#374151',
      secondaryColor: '#9CA3AF',
      fontSize: 14,
      fontFamily: "'Microsoft YaHei', Arial, sans-serif",
      backgroundColor: '#FFFFFF',
      sectionTitleColor: '#374151',
      sectionTitleSize: 13,
      lineColor: '#E5E7EB',
    },
  },
];

function computeDataHash(obj: any): string {
  return crypto
    .createHash('md5')
    .update(JSON.stringify(obj))
    .digest('hex');
}

async function initTemplates() {
  console.log('开始初始化模板数据...');

  for (const template of resumeTemplates) {
    const schema = {
      defaultContent: defaultFlatContent,
      layout: template.layout,
    };

    const styleConfig = template.style_config;
    const dataHash = computeDataHash({ schema, styleConfig });

    const existing = await prisma.template.findUnique({
      where: { id: template.id },
    });

    if (!existing) {
      await prisma.template.create({
        data: {
          id: template.id,
          name: template.name,
          category: template.category,
          thumbnail: '',
          preview_image: '',
          schema: schema as any,
          style_config: styleConfig as any,
          data_hash: dataHash,
        },
      });
      console.log(`已创建模板: ${template.name}`);
    } else {
      const needsUpdate = existing.data_hash !== dataHash;
      if (needsUpdate) {
        await prisma.template.update({
          where: { id: template.id },
          data: {
            name: template.name,
            category: template.category,
            thumbnail: '',
            preview_image: '',
            schema: schema as any,
            style_config: styleConfig as any,
            data_hash: dataHash,
          },
        });
        console.log(`已更新模板: ${template.name}`);
      } else {
        console.log(`模板未变化，跳过: ${template.name}`);
      }
    }
  }

  console.log('模板数据初始化完成');
}

async function main() {
  try {
    await initTemplates();
    console.log('所有数据初始化完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
