import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resumeTemplates = [
  {
    id: 'default',
    name: '简约风格',
    category: '通用',
    thumbnail: '',
    preview_image: '',
    schema: {
      blocks: [
        {
          id: 'basic-default',
          type: 'basic',
          data: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
          },
        },
        { id: 'experience-default', type: 'experience', data: [] },
        { id: 'projects-default', type: 'projects', data: [] },
        { id: 'organizations-default', type: 'organizations', data: [] },
        { id: 'awards-default', type: 'awards', data: { awards: [] } },
        { id: 'skills-default', type: 'skills', data: [] },
        { id: 'education-default', type: 'education', data: [] },
      ],
    },
    style_config: {
      primaryColor: '#3B82F6',
      secondaryColor: '#6B7280',
      fontSize: 14,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      backgroundColor: '#FFFFFF',
      sectionTitleColor: '#3B82F6',
      sectionTitleSize: 16,
      lineColor: '#E5E7EB',
    },
  },
  {
    id: 'professional',
    name: '商务专业',
    category: '商务',
    thumbnail: '',
    preview_image: '',
    schema: {
      blocks: [
        {
          id: 'basic-default',
          type: 'basic',
          data: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
          },
        },
        { id: 'experience-default', type: 'experience', data: [] },
        { id: 'projects-default', type: 'projects', data: [] },
        { id: 'education-default', type: 'education', data: [] },
        { id: 'skills-default', type: 'skills', data: [] },
        { id: 'awards-default', type: 'awards', data: { awards: [] } },
      ],
    },
    style_config: {
      primaryColor: '#1A1A2E',
      secondaryColor: '#4A69BD',
      fontSize: 14,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      backgroundColor: '#FFFFFF',
      sectionTitleColor: '#1A1A2E',
      sectionTitleSize: 16,
      lineColor: '#E5E7EB',
    },
  },
  {
    id: 'creative',
    name: '创意设计',
    category: '设计',
    thumbnail: '',
    preview_image: '',
    schema: {
      blocks: [
        {
          id: 'basic-default',
          type: 'basic',
          data: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
          },
        },
        { id: 'experience-default', type: 'experience', data: [] },
        { id: 'projects-default', type: 'projects', data: [] },
        { id: 'education-default', type: 'education', data: [] },
        { id: 'skills-default', type: 'skills', data: [] },
        { id: 'awards-default', type: 'awards', data: { awards: [] } },
      ],
    },
    style_config: {
      primaryColor: '#E74C3C',
      secondaryColor: '#2C3E50',
      fontSize: 14,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      backgroundColor: '#FDF6E3',
      sectionTitleColor: '#E74C3C',
      sectionTitleSize: 16,
      lineColor: '#E5E7EB',
    },
  },
  {
    id: 'modern',
    name: '现代简约',
    category: '科技',
    thumbnail: '',
    preview_image: '',
    schema: {
      blocks: [
        {
          id: 'basic-default',
          type: 'basic',
          data: {
            name: '',
            title: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
          },
        },
        { id: 'experience-default', type: 'experience', data: [] },
        { id: 'projects-default', type: 'projects', data: [] },
        { id: 'education-default', type: 'education', data: [] },
        { id: 'skills-default', type: 'skills', data: [] },
        { id: 'awards-default', type: 'awards', data: { awards: [] } },
      ],
    },
    style_config: {
      primaryColor: '#00D4FF',
      secondaryColor: '#CCCCCC',
      fontSize: 14,
      fontFamily: 'Microsoft YaHei, Arial, sans-serif',
      backgroundColor: '#0F0F23',
      sectionTitleColor: '#00D4FF',
      sectionTitleSize: 16,
      lineColor: '#2A2A4E',
    },
  },
];

const defaultResumeData = {
  blocks: [
    {
      id: 'basic-default',
      type: 'basic',
      data: {
        name: '刘帅',
        title: 'AI全栈实习生',
        email: '273013247@qq.com',
        phone: '182-2451-0833',
        location: '北京',
        bio: '计算机专业大三学生，热爱技术，具备扎实的编程基础和良好的学习能力。熟悉Python、JavaScript等编程语言，了解机器学习和深度学习基础。',
      },
    },
    {
      id: 'experience-default',
      type: 'experience',
      data: [
        {
          id: 'exp-1',
          company: '超级公司',
          position: '系统集成实习工程师',
          department: '技术部',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '参与公司核心系统集成项目的需求分析、方案设计和实施工作。负责编写系统集成方案、测试计划和用户手册等技术文档。协助完成系统集成过程中的软硬件安装、配置和调试工作。',
        },
      ],
    },
    {
      id: 'projects-default',
      type: 'projects',
      data: [
        {
          id: 'proj-1',
          name: '智慧园区系统集成项目',
          role: '系统集成工程师',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '参与智慧园区系统集成项目的需求调研和分析，了解客户的业务需求和技术要求。参与智慧园区系统集成的整体架构和技术方案。',
          techStack: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
        },
        {
          id: 'proj-2',
          name: '智能制造系统集成项目',
          role: '系统集成工程师',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '参与智能制造系统集成项目的需求分析和方案设计，了解客户的生产流程和自动化需求。',
          techStack: ['Python', 'Django', 'PostgreSQL', 'MQTT'],
        },
      ],
    },
    {
      id: 'organizations-default',
      type: 'organizations',
      data: [
        {
          id: 'org-1',
          name: '计算机协会',
          position: '技术部部长',
          department: '技术部',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '负责组织协会的技术交流活动，邀请行业专家进行技术讲座和分享。组织协会成员参与各类编程比赛和技术竞赛。',
        },
        {
          id: 'org-2',
          name: '学生会',
          position: '宣传部干事',
          department: '宣传部',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '负责学生会各类活动的宣传工作，包括海报设计、文案撰写和线上推广。',
        },
      ],
    },
    {
      id: 'awards-default',
      type: 'awards',
      data: {
        awards: ['国家励志奖学金', '校级三好学生', '优秀学生干部'],
      },
    },
    {
      id: 'skills-default',
      type: 'skills',
      data: [
        'Python',
        'Java',
        'JavaScript',
        'C++',
        'MySQL',
        'Redis',
        'Git',
        'Linux',
      ],
    },
    {
      id: 'education-default',
      type: 'education',
      data: [
        {
          id: 'edu-1',
          school: '某某大学',
          major: '计算机科学与技术',
          degree: '本科',
          startDate: '2023-09',
          endDate: '2027-06',
          description:
            '主修课程：数据结构、算法设计、计算机网络、操作系统、人工智能导论、机器学习等。',
        },
      ],
    },
  ],
};

async function initTemplates() {
  console.log('开始初始化模板数据...');

  for (const template of resumeTemplates) {
    const existing = await prisma.template.findUnique({
      where: { id: template.id },
    });

    if (!existing) {
      await prisma.template.create({
        data: {
          id: template.id,
          name: template.name,
          category: template.category,
          thumbnail: template.thumbnail,
          preview_image: template.preview_image,
          schema: JSON.stringify(template.schema),
          style_config: JSON.stringify(template.style_config),
        },
      });
      console.log(`已创建模板: ${template.name}`);
    } else {
      await prisma.template.update({
        where: { id: template.id },
        data: {
          name: template.name,
          category: template.category,
          thumbnail: template.thumbnail,
          preview_image: template.preview_image,
          schema: JSON.stringify(template.schema),
          style_config: JSON.stringify(template.style_config),
        },
      });
      console.log(`已更新模板: ${template.name}`);
    }
  }

  console.log('模板数据初始化完成');
}

async function initDefaultResume() {
  console.log('开始初始化默认简历数据...');

  const existingDefault = await prisma.resume.findFirst({
    where: { title: '默认简历' },
  });

  if (!existingDefault) {
    const defaultUser = await prisma.user.findFirst();

    if (!defaultUser) {
      console.log('警告：未找到用户，跳过默认简历创建');
      return;
    }

    await prisma.resume.create({
      data: {
        user_id: defaultUser.id,
        template_id: 'default',
        title: '默认简历',
        content: JSON.stringify(defaultResumeData),
      },
    });
    console.log('已创建默认简历');
  } else {
    await prisma.resume.update({
      where: { id: existingDefault.id },
      data: {
        template_id: 'default',
        content: JSON.stringify(defaultResumeData),
      },
    });
    console.log('已更新默认简历');
  }

  console.log('默认简历数据初始化完成');
}

async function main() {
  try {
    await initTemplates();
    await initDefaultResume();
    console.log('所有数据初始化完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
