export const defaultResumeContent = {
  blocks: [
    {
      id: 'basic',
      type: 'basic' as const,
      data: {
        name: '陈媛媛 Abbey',
        email: 'abbey@wondercc.com',
        phone: '138-8888-8888',
        location: '北京',
        title: '系统集成工程师',
        avatar: '',
        summary:
          '扎实的计算机基础知识，熟悉操作系统、网络协议和数据库原理；具备良好的编程能力，熟练掌握Java、Python等常用编程语言；熟悉系统集成流程，具备一定的项目管理经验和团队协作能力；对新技术充满热情，乐于学习和探索。',
      },
    },
    {
      id: 'experience',
      type: 'experience' as const,
      data: [
        {
          id: 'exp-1',
          company: '超级公司',
          position: '系统集成实习工程师',
          department: '技术部',
          startDate: '2025年01月',
          endDate: '2025年12月',
          location: '北京',
          description: [
            '参与公司核心系统集成项目的需求分析、方案设计和实施工作。',
            '负责编写系统集成方案、项目计划和用户手册等技术文档。',
            '负责完成系统集成过程中的软硬件安装、配置和调试工作。',
            '参与解决系统集成过程中遇到的技术问题，并提出改进建议。',
            '与团队成员密切合作，共同完成项目目标。',
          ],
        },
      ],
    },
    {
      id: 'projects',
      type: 'projects' as const,
      data: [
        {
          id: 'proj-1',
          name: '智慧园区系统集成项目',
          role: '系统集成工程师',
          startDate: '2025年01月',
          endDate: '2025年12月',
          location: '北京',
          description: [
            '参与智慧园区系统集成项目的需求调研和分析，了解客户的业务需求和技术要求。',
            '参与智慧园区系统的软硬件安装、配置和调试工作，包括服务器、智能交通、智能安防等子系统。',
            '协助设计智慧园区系统的整体架构和技术方案。',
            '与客户进行沟通和协调，及时解决项目实施过程中遇到的问题。',
          ],
          techStack: ['VMware', 'Docker', 'Kubernetes'],
        },
        {
          id: 'proj-2',
          name: '智能制造系统集成项目',
          role: '系统集成工程师',
          startDate: '2025年01月',
          endDate: '2025年12月',
          location: '北京',
          description: [
            '参与智能制造系统集成项目的需求分析和方案设计。',
            '协助设计智能制造系统的整体架构，包括MES、ERP等子系统。',
            '负责编写技术文档，确保系统与现有设备的兼容性。',
            '与客户沟通协调，解决项目实施过程中遇到的问题。',
          ],
          techStack: ['Java', 'Python', 'SQL'],
        },
      ],
    },
    {
      id: 'organizations',
      type: 'organizations' as const,
      data: [
        {
          id: 'org-1',
          name: '计算机协会',
          role: '技术部部长',
          department: '技术部',
          startDate: '2025年01月',
          endDate: '2025年12月',
          location: '北京',
          description:
            '负责组织协会的技术交流活动，邀请行业专家进行技术讲座和分享；组织协会成员参与各类编程比赛和技术竞赛，提高大家的编程水平和实践能力。',
        },
        {
          id: 'org-2',
          name: '学生会',
          role: '宣传部干事',
          department: '宣传部',
          startDate: '2025年01月',
          endDate: '2025年12月',
          location: '北京',
          description:
            '负责学生会各类活动的宣传工作，包括海报设计、文案撰写和线上推广；协助组织学生会各类活动的策划和执行，提高活动的参与度和影响力。',
        },
      ],
    },
    {
      id: 'education',
      type: 'education' as const,
      data: [
        {
          id: 'edu-1',
          school: '计算机学院',
          major: '计算机科学与技术',
          degree: '本科',
          startDate: '2021年09月',
          endDate: '2025年06月',
          description:
            '主修数据结构、操作系统、计算机网络、数据库原理、软件工程等专业课程。',
        },
      ],
    },
    {
      id: 'skills',
      type: 'skills' as const,
      data: [
        '编程语言：Java、Python、C++、Linux、MySQL',
        '框架技术：Spring Boot、Vue.js、Docker、Kubernetes',
        '数据库：MySQL、SQL Server、Oracle',
        '网络技术：TCP/IP、路由交换、VPN',
        '虚拟化：VMware、Docker、K8s',
      ],
    },
    {
      id: 'certifications',
      type: 'certifications' as const,
      data: {
        certifications: [
          { name: '华为HCIA', date: '2024年06月' },
          { name: '软考系统集成项目管理师', date: '2024年11月' },
          { name: 'CISCO CCNA', date: '2025年03月' },
        ],
      },
    },
    {
      id: 'awards',
      type: 'awards' as const,
      data: {
        awards: ['国家励志奖学金', '校级三好学生', '优秀学生干部'],
      },
    },
  ],
};
