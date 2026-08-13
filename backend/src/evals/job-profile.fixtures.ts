export const jobProfileFixtures = [
  {
    id: 'junior-frontend',
    expectedSeniority: ['初级', '应届', 'junior'],
    expectedTerms: ['React', 'TypeScript'],
    rawText: `初级前端工程师（应届生可投）\n负责公司管理后台的页面开发、组件维护与接口联调。\n要求掌握 JavaScript、TypeScript、React 和基础 CSS。\n了解前端测试或性能优化者优先。`,
  },
  {
    id: 'mid-backend',
    expectedSeniority: ['中级', '3-5年', 'mid'],
    expectedTerms: ['Java', 'Spring Boot', 'PostgreSQL'],
    rawText: `中级 Java 后端工程师（3-5 年）\n负责订单与库存服务的设计、开发、测试和线上故障排查。\n要求熟练使用 Java、Spring Boot、PostgreSQL，具备微服务接口设计经验。\n有 Redis 性能优化经验者优先。`,
  },
  {
    id: 'senior-platform',
    expectedSeniority: ['高级', '5年以上', 'senior'],
    expectedTerms: ['Kubernetes', 'Go'],
    rawText: `高级平台工程师（5 年以上经验）\n负责云原生平台架构设计、技术方案评审和跨团队交付。\n要求精通 Kubernetes 和 Go，具备大规模分布式系统稳定性治理经验。\n有技术团队指导或开源项目维护经验者优先。`,
  },
] as const;
