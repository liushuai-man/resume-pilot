export const defaultResume = {
  blocks: [
    {
      id: 'basic',
      type: 'basic' as const,
      data: {
        name: '陈媛媛 Abbey',
        email: 'abbey@example.com',
        phone: '138-8888-8888',
        location: '北京',
        title: '系统集成工程师',
        avatar: '',
        summary:
          '计算机科学与技术专业本科毕业生，具备扎实的计算机基础知识和系统集成实践经验。熟悉 Linux 操作系统、TCP/IP 网络协议、虚拟化技术及云原生平台，能够独立完成服务器部署、网络配置和系统实施工作。曾参与智慧园区、企业私有云等项目建设，具备良好的沟通协调能力和团队协作意识，期待从事系统集成、解决方案或云计算相关岗位。',
      },
    },

    {
      id: 'experience',
      type: 'experience' as const,
      data: [
        {
          id: 'exp-1',
          company: '神州数码系统集成服务有限公司',
          position: '系统集成工程师实习生',
          department: '解决方案交付部',
          startDate: '2024年07月',
          endDate: '2024年12月',
          location: '北京',
          description: [
            '参与政府智慧园区项目实施，协助完成服务器、交换机及存储设备部署。',
            '负责 Linux 服务器环境初始化配置，包括用户权限管理、服务部署及日志排查。',
            '协助完成 VMware 虚拟化平台搭建及资源规划。',
            '参与项目实施方案、验收文档及运维手册编写。',
            '配合客户完成系统联调测试，保障项目按计划交付。',
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
          startDate: '2024年08月',
          endDate: '2024年11月',
          location: '北京',
          description: [
            '负责园区视频监控、门禁管理及智能停车系统的集成实施。',
            '完成服务器环境部署及网络连通性测试。',
            '参与系统架构设计及接口联调工作。',
            '编写项目实施文档、测试报告及用户操作手册。',
            '配合客户完成试运行及项目验收工作。',
          ],
          techStack: ['Linux', 'VMware', 'Docker', 'MySQL'],
        },
        {
          id: 'proj-2',
          name: '企业私有云平台建设项目',
          role: '云平台实施工程师',
          startDate: '2024年03月',
          endDate: '2024年06月',
          location: '北京',
          description: [
            '参与企业私有云平台建设，完成资源规划与环境部署。',
            '负责 Kubernetes 集群安装及基础运维配置。',
            '完成容器镜像仓库和监控平台搭建。',
            '参与系统性能测试及故障排查工作。',
            '协助编写项目交付文档和技术培训资料。',
          ],
          techStack: ['Docker', 'Kubernetes', 'Prometheus', 'Linux'],
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
          startDate: '2022年09月',
          endDate: '2024年06月',
          location: '北京',
          description: [
            '组织开展技术分享活动20余场，覆盖后端开发、云计算及网络安全等方向。',
            '带领协会成员完成校园管理系统开发项目。',
            '组织 ACM 程序设计竞赛培训活动，提高成员算法与编程能力。',
            '维护协会服务器及技术资源平台，保障日常稳定运行。',
          ],
        },
      ],
    },

    {
      id: 'education',
      type: 'education' as const,
      data: [
        {
          id: 'edu-1',
          school: '北京邮电大学',
          major: '计算机科学与技术',
          degree: '本科',
          startDate: '2021年09月',
          endDate: '2025年06月',
          description:
            '主修数据结构、操作系统、计算机网络、数据库原理、软件工程、云计算技术等课程，GPA 3.7/4.0。',
        },
      ],
    },

    {
      id: 'skills',
      type: 'skills' as const,
      data: [
        '熟悉 Linux 操作系统及常用 Shell 命令，具备服务器部署与运维能力',
        '熟悉 TCP/IP、路由交换、VPN 等网络技术，具备基础网络规划与故障排查能力',
        '掌握 VMware、Docker、Kubernetes 等虚拟化与容器化技术',
        '熟悉 MySQL 数据库管理、备份恢复及性能优化',
        '掌握 Java、Python 编程语言，具备脚本开发与自动化运维能力',
      ],
    },

    {
      id: 'certifications',
      type: 'certifications' as const,
      data: {
        certifications: [
          {
            name: '华为 HCIA-Datacom',
            date: '2024年06月',
          },
          {
            name: '软考系统集成项目管理工程师',
            date: '2024年11月',
          },
          {
            name: '红帽 RHCSA',
            date: '2025年03月',
          },
        ],
      },
    },

    {
      id: 'awards',
      type: 'awards' as const,
      data: {
        awards: [
          '国家励志奖学金（2023）',
          '全国大学生信息安全竞赛省级二等奖',
          '校级优秀学生干部',
          '校级三好学生',
        ],
      },
    },
  ],
};
