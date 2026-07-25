export function getResumeText(resumeContent: any): string {
  if (!resumeContent) return '';
  
  const content: string[] = [];
  
  if (resumeContent.basicInfo) {
    const basic = resumeContent.basicInfo;
    content.push(`姓名：${basic.name || ''}`);
    content.push(`目标岗位：${basic.targetPosition || ''}`);
    content.push(`联系方式：${basic.phone || ''} ${basic.email || ''}`);
    if (basic.summary) content.push(`个人简介：${basic.summary}`);
  }
  
  if (resumeContent.education && resumeContent.education.length > 0) {
    content.push('\n教育背景：');
    resumeContent.education.forEach((edu: any) => {
      content.push(`${edu.school || ''} ${edu.degree || ''} ${edu.major || ''} ${edu.startDate || ''}-${edu.endDate || ''}`);
      if (edu.description) content.push(`  ${edu.description}`);
    });
  }
  
  if (resumeContent.experience && resumeContent.experience.length > 0) {
    content.push('\n工作经历：');
    resumeContent.experience.forEach((exp: any) => {
      content.push(`${exp.company || ''} ${exp.position || ''} ${exp.startDate || ''}-${exp.endDate || ''}`);
      if (exp.description) content.push(`  ${exp.description}`);
    });
  }
  
  if (resumeContent.projects && resumeContent.projects.length > 0) {
    content.push('\n项目经验：');
    resumeContent.projects.forEach((proj: any) => {
      content.push(`${proj.name || ''} ${proj.role || ''} ${proj.startDate || ''}-${proj.endDate || ''}`);
      content.push(`  技术栈：${proj.techStack || ''}`);
      if (proj.description) content.push(`  项目描述：${proj.description}`);
      if (proj.achievements) content.push(`  项目亮点：${proj.achievements}`);
    });
  }
  
  if (resumeContent.skills) {
    content.push(`\n专业技能：${resumeContent.skills}`);
  }
  
  if (resumeContent.certifications && resumeContent.certifications.length > 0) {
    content.push('\n证书：');
    resumeContent.certifications.forEach((cert: any) => {
      content.push(`${cert.name || ''} ${cert.date || ''}`);
    });
  }
  
  return content.join('\n').trim();
}

export function getRelevantResumeSection(resumeContent: any, topic: string): string {
  if (!resumeContent) return '';
  
  const text = getResumeText(resumeContent);
  
  if (topic.includes('项目') || topic.includes('project')) {
    if (resumeContent.projects && resumeContent.projects.length > 0) {
      const projectsText: string[] = [];
      resumeContent.projects.forEach((proj: any) => {
        projectsText.push(`${proj.name || ''} ${proj.role || ''}`);
        projectsText.push(`  技术栈：${proj.techStack || ''}`);
        if (proj.description) projectsText.push(`  项目描述：${proj.description}`);
        if (proj.achievements) projectsText.push(`  项目亮点：${proj.achievements}`);
      });
      return projectsText.join('\n');
    }
  }
  
  if (topic.includes('技能') || topic.includes('skill') || topic.includes('技术')) {
    return `专业技能：${resumeContent.skills || ''}`;
  }
  
  if (topic.includes('教育') || topic.includes('学历')) {
    if (resumeContent.education && resumeContent.education.length > 0) {
      const eduText: string[] = [];
      resumeContent.education.forEach((edu: any) => {
        eduText.push(`${edu.school || ''} ${edu.degree || ''} ${edu.major || ''}`);
      });
      return eduText.join('\n');
    }
  }
  
  if (topic.includes('工作') || topic.includes('经验') || topic.includes('experience')) {
    if (resumeContent.experience && resumeContent.experience.length > 0) {
      const expText: string[] = [];
      resumeContent.experience.forEach((exp: any) => {
        expText.push(`${exp.company || ''} ${exp.position || ''} ${exp.startDate || ''}-${exp.endDate || ''}`);
        if (exp.description) expText.push(`  ${exp.description}`);
      });
      return expText.join('\n');
    }
  }
  
  return text;
}