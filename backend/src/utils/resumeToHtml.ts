export interface ResumeBlock {
  id: string;
  type: string;
  data: any;
}

export interface ResumeContent {
  blocks?: ResumeBlock[];
  basicInfo?: any;
  education?: any[];
  experience?: any[];
  projects?: any[];
  skills?: any[];
  careerObjective?: string;
  certifications?: any[];
  campusExperiences?: any[];
}

function isFlatStructure(content: ResumeContent): boolean {
  return !!(content.basicInfo || content.education || content.experience);
}

function flatToBlocks(content: ResumeContent): ResumeBlock[] {
  const blocks: ResumeBlock[] = [];

  if (content.basicInfo) {
    blocks.push({
      id: 'basic',
      type: 'basic',
      data: {
        ...content.basicInfo,
        summary: content.basicInfo.bio || content.basicInfo.summary,
      },
    });
  }

  if (content.careerObjective) {
    blocks.push({
      id: 'objective',
      type: 'objective',
      data: { objective: content.careerObjective },
    });
  }

  if (content.education && content.education.length > 0) {
    blocks.push({
      id: 'education',
      type: 'education',
      data: content.education,
    });
  }

  if (content.experience && content.experience.length > 0) {
    blocks.push({
      id: 'experience',
      type: 'experience',
      data: content.experience,
    });
  }

  if (content.projects && content.projects.length > 0) {
    blocks.push({
      id: 'projects',
      type: 'projects',
      data: content.projects,
    });
  }

  if (content.skills && content.skills.length > 0) {
    const skillNames = content.skills.map((s: any) =>
      typeof s === 'string' ? s : s.name
    );
    blocks.push({
      id: 'skills',
      type: 'skills',
      data: skillNames,
    });
  }

  if (content.certifications && content.certifications.length > 0) {
    const certList = content.certifications.map((c: any) => ({
      name: c.name,
      date: c.date || '',
    }));
    blocks.push({
      id: 'certifications',
      type: 'certifications',
      data: { certifications: certList },
    });
  }

  if (content.campusExperiences && content.campusExperiences.length > 0) {
    blocks.push({
      id: 'organizations',
      type: 'organizations',
      data: content.campusExperiences.map((c: any) => ({
        ...c,
        name: c.name,
        role: c.role || c.position,
      })),
    });
  }

  return blocks;
}

export const generateResumeHtml = (
  content: ResumeContent,
  styleConfig?: any
): string => {
  let blocks: ResumeBlock[];

  if (isFlatStructure(content)) {
    blocks = flatToBlocks(content);
  } else {
    blocks = content.blocks || [];
  }

  const layout = styleConfig?.layout || 'classic';

  const styles = {
    primaryColor: styleConfig?.primaryColor || '#3B82F6',
    backgroundColor: styleConfig?.backgroundColor || '#FFFFFF',
    fontFamily:
      styleConfig?.fontFamily || "'Microsoft YaHei', Arial, sans-serif",
    fontSize: styleConfig?.fontSize || 14,
    sectionTitleColor: styleConfig?.sectionTitleColor || '#3B82F6',
    lineColor: styleConfig?.lineColor || '#E5E7EB',
    sidebarColor: styleConfig?.sidebarColor || '#1a1a2e',
    sidebarTextColor: styleConfig?.sidebarTextColor || '#ffffff',
  };

  if (layout === 'sidebar') {
    return generateSidebarLayout(blocks, styles);
  } else if (layout === 'minimal') {
    return generateMinimalLayout(blocks, styles);
  } else {
    return generateClassicLayout(blocks, styles);
  }
};

function generateClassicLayout(blocks: ResumeBlock[], styles: any): string {
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${styles.fontFamily}; font-size: ${styles.fontSize}px; line-height: 1.6; color: #333; padding: 40px; background: ${styles.backgroundColor}; width: 100%; }
    .resume-container { width: 100%; background: #fff; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${styles.primaryColor}; }
    .name { font-size: 32px; font-weight: bold; color: ${styles.primaryColor}; margin-bottom: 8px; }
    .title { font-size: 16px; color: #666; margin-bottom: 10px; }
    .contact { font-size: 12px; color: #888; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: ${styles.primaryColor}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid ${styles.primaryColor}; }
    .item { margin-bottom: 15px; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .item-title { font-weight: bold; color: #333; font-size: 15px; }
    .item-subtitle { color: #666; font-size: 13px; margin-bottom: 5px; }
    .item-date { color: #999; font-size: 12px; }
    .item-desc { font-size: 13px; color: #555; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: ${styles.primaryColor}20; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: ${styles.primaryColor}; border: 1px solid ${styles.primaryColor}40; }
    .awards-list { list-style: none; padding-left: 0; }
    .awards-list li { padding: 4px 0; font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <div class="resume-container">
`;

  for (const block of blocks) {
    switch (block.type) {
      case 'basic': {
        const data = block.data;
        html += `
          <div class="header">
            <div class="name">${data.name || '姓名'}</div>
            <div class="title">${data.title || ''}</div>
            <div class="contact">
              ${data.phone ? `${data.phone} | ` : ''}
              ${data.email ? `${data.email} | ` : ''}
              ${data.location ? `${data.location}` : ''}
            </div>
            ${data.summary || data.bio ? `<div style="margin-top: 15px; font-size: 13px; color: #555; line-height: 1.6; text-align: left;">${data.summary || data.bio}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'objective': {
        html += `
          <div class="section">
            <div class="section-title">职业目标</div>
            <div class="item-desc">${block.data?.objective || ''}</div>
          </div>
        `;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">工作经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.company}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.position}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">项目经验</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
              ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'organizations': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">社团和组织经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role || item.position}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'awards': {
        const data = block.data;
        const awards = data?.awards || [];
        html += `
          <div class="section">
            <div class="section-title">荣誉奖项</div>
            <ul class="awards-list">
              ${awards.map((award: string) => `<li>• ${award}</li>`).join('')}
            </ul>
          </div>
        `;
        break;
      }
      case 'skills': {
        const skills = Array.isArray(block.data) ? block.data : [];
        html += `
          <div class="section">
            <div class="section-title">专业技能</div>
            <div class="skills">
              ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">教育背景</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.school}</span>
                <span class="item-date">${item.startDate} - ${item.endDate}</span>
              </div>
              <div class="item-subtitle">${item.major} | ${item.degree}</div>
              ${item.gpa ? `<div class="item-desc">GPA: ${item.gpa}</div>` : ''}
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'certifications': {
        const data = block.data;
        const certifications = data?.certifications || data || [];
        const certList = Array.isArray(certifications) ? certifications : [];
        html += `
          <div class="section">
            <div class="section-title">证书荣誉</div>
            <div class="skills">
              ${certList
                .map((cert: any) => {
                  const name = typeof cert === 'string' ? cert : cert.name;
                  const date = typeof cert === 'string' ? '' : cert.date || '';
                  return `<span class="skill-tag">${name} ${date}</span>`;
                })
                .join('')}
            </div>
          </div>
        `;
        break;
      }
    }
  }

  html += `
  </div>
</body>
</html>
`;
  return html;
}

function generateSidebarLayout(blocks: ResumeBlock[], styles: any): string {
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${styles.fontFamily}; font-size: ${styles.fontSize}px; line-height: 1.6; padding: 0; background: ${styles.backgroundColor}; width: 100%; }
    .resume-container { display: flex; width: 100%; min-height: 100%; }
    .sidebar { width: 35%; background: ${styles.sidebarColor}; color: ${styles.sidebarTextColor}; padding: 40px 25px; }
    .main-content { width: 65%; background: #fff; padding: 40px 30px; color: #333; }
    .sidebar .name { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .sidebar .title { font-size: 13px; color: ${styles.sidebarTextColor}cc; margin-bottom: 20px; }
    .sidebar .contact-item { font-size: 11px; margin-bottom: 6px; color: ${styles.sidebarTextColor}dd; }
    .sidebar-section { margin-bottom: 25px; }
    .sidebar-section-title { font-size: 14px; font-weight: bold; color: ${styles.primaryColor}; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid ${styles.primaryColor}60; }
    .sidebar-item { font-size: 11px; margin-bottom: 8px; color: ${styles.sidebarTextColor}cc; }
    .sidebar-skill-tag { display: inline-block; background: ${styles.primaryColor}30; padding: 3px 8px; border-radius: 3px; font-size: 10px; margin: 2px; color: ${styles.sidebarTextColor}; }
    .main-content .section { margin-bottom: 25px; }
    .main-content .section-title { font-size: 16px; font-weight: bold; color: ${styles.primaryColor}; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 2px solid ${styles.primaryColor}; }
    .main-content .item { margin-bottom: 15px; }
    .main-content .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .main-content .item-title { font-weight: bold; color: #333; font-size: 14px; }
    .main-content .item-subtitle { color: #666; font-size: 12px; margin-bottom: 5px; }
    .main-content .item-date { color: #999; font-size: 11px; }
    .main-content .item-desc { font-size: 12px; color: #555; line-height: 1.6; }
    .main-content .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .main-content .skill-tag { background: ${styles.primaryColor}15; padding: 3px 10px; border-radius: 3px; font-size: 11px; color: ${styles.primaryColor}; }
    .main-content .awards-list { list-style: none; padding-left: 0; }
    .main-content .awards-list li { padding: 4px 0; font-size: 12px; color: #555; }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="sidebar">
`;

  const basicBlock = blocks.find((b) => b.type === 'basic');
  const skillsBlock = blocks.find((b) => b.type === 'skills');
  const certsBlock = blocks.find((b) => b.type === 'certifications');
  const awardsBlock = blocks.find((b) => b.type === 'awards');
  const educationBlock = blocks.find((b) => b.type === 'education');

  if (basicBlock) {
    const data = basicBlock.data;
    html += `
      <div class="name">${data.name || '姓名'}</div>
      <div class="title">${data.title || ''}</div>
      <div style="margin-top: 20px;">
        ${data.phone ? `<div class="contact-item">📱 ${data.phone}</div>` : ''}
        ${data.email ? `<div class="contact-item">📧 ${data.email}</div>` : ''}
        ${data.location ? `<div class="contact-item">📍 ${data.location}</div>` : ''}
      </div>
    `;
  }

  if (skillsBlock) {
    const skills = Array.isArray(skillsBlock.data) ? skillsBlock.data : [];
    html += `
      <div class="sidebar-section">
        <div class="sidebar-section-title">专业技能</div>
        <div>
          ${skills.map((skill: string) => `<span class="sidebar-skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
  }

  if (educationBlock) {
    const items = Array.isArray(educationBlock.data) ? educationBlock.data : [];
    html += `
      <div class="sidebar-section">
        <div class="sidebar-section-title">教育背景</div>
        ${items
          .map(
            (item: any) => `
          <div class="sidebar-item">
            <div style="font-weight: bold; color: ${styles.sidebarTextColor};">${item.school}</div>
            <div>${item.major} · ${item.degree}</div>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  if (certsBlock) {
    const data = certsBlock.data;
    const certifications = data?.certifications || data || [];
    const certList = Array.isArray(certifications) ? certifications : [];
    html += `
      <div class="sidebar-section">
        <div class="sidebar-section-title">证书荣誉</div>
        ${certList
          .map((cert: any) => {
            const name = typeof cert === 'string' ? cert : cert.name;
            return `<div class="sidebar-item">• ${name}</div>`;
          })
          .join('')}
      </div>
    `;
  }

  if (awardsBlock) {
    const data = awardsBlock.data;
    const awards = data?.awards || [];
    html += `
      <div class="sidebar-section">
        <div class="sidebar-section-title">荣誉奖项</div>
        ${awards.map((award: string) => `<div class="sidebar-item">• ${award}</div>`).join('')}
      </div>
    `;
  }

  html += `
    </div>
    <div class="main-content">
`;

  const mainBlocks = blocks.filter(
    (b) =>
      b.type === 'objective' ||
      b.type === 'experience' ||
      b.type === 'projects' ||
      b.type === 'organizations'
  );

  for (const block of mainBlocks) {
    switch (block.type) {
      case 'objective': {
        html += `
          <div class="section">
            <div class="section-title">职业目标</div>
            <div class="item-desc">${block.data?.objective || ''}</div>
          </div>
        `;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">工作经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.company}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.position}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">项目经验</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
              ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'organizations': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">社团和组织经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role || item.position}${item.location ? ` | ${item.location}` : ''}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
    }
  }

  if (basicBlock?.data?.summary || basicBlock?.data?.bio) {
    html = html.replace(
      '<div class="main-content">',
      `<div class="main-content">
        <div class="section">
          <div class="section-title">个人总结</div>
          <div class="item-desc">${basicBlock.data.summary || basicBlock.data.bio}</div>
        </div>
      `
    );
  }

  html += `
    </div>
  </div>
</body>
</html>
`;
  return html;
}

function generateMinimalLayout(blocks: ResumeBlock[], styles: any): string {
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${styles.fontFamily}; font-size: ${styles.fontSize}px; line-height: 1.8; color: #333; padding: 50px 40px; background: ${styles.backgroundColor}; width: 100%; }
    .resume-container { width: 100%; }
    .header { margin-bottom: 40px; }
    .name { font-size: 36px; font-weight: 300; color: #222; letter-spacing: 2px; margin-bottom: 5px; }
    .title { font-size: 14px; color: #999; letter-spacing: 1px; margin-bottom: 15px; }
    .contact { font-size: 12px; color: #aaa; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 13px; font-weight: bold; color: ${styles.primaryColor}; margin-bottom: 15px; letter-spacing: 3px; text-transform: uppercase; }
    .item { margin-bottom: 20px; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .item-title { font-weight: 600; color: #333; font-size: 14px; }
    .item-subtitle { color: #888; font-size: 12px; margin-bottom: 5px; }
    .item-date { color: #bbb; font-size: 11px; }
    .item-desc { font-size: 12px; color: #666; line-height: 1.8; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill-tag { font-size: 11px; color: #888; padding: 2px 0; border-bottom: 1px solid ${styles.primaryColor}40; }
    .awards-list { list-style: none; padding-left: 0; }
    .awards-list li { padding: 3px 0; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="resume-container">
`;

  for (const block of blocks) {
    switch (block.type) {
      case 'basic': {
        const data = block.data;
        html += `
          <div class="header">
            <div class="name">${data.name || '姓名'}</div>
            <div class="title">${data.title || ''}</div>
            <div class="contact">
              ${data.phone ? `${data.phone} · ` : ''}
              ${data.email ? `${data.email} · ` : ''}
              ${data.location ? `${data.location}` : ''}
            </div>
            ${data.summary || data.bio ? `<div style="margin-top: 20px; font-size: 12px; color: #777; line-height: 1.8; max-width: 80%;">${data.summary || data.bio}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'objective': {
        html += `
          <div class="section">
            <div class="section-title">职业目标</div>
            <div class="item-desc">${block.data?.objective || ''}</div>
          </div>
        `;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">工作经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.company}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.position}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">项目经验</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
              ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'organizations': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">社团和组织经历</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate || '至今'}</span>
              </div>
              <div class="item-subtitle">${item.role || item.position}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'awards': {
        const data = block.data;
        const awards = data?.awards || [];
        html += `
          <div class="section">
            <div class="section-title">荣誉奖项</div>
            <ul class="awards-list">
              ${awards.map((award: string) => `<li>${award}</li>`).join('')}
            </ul>
          </div>
        `;
        break;
      }
      case 'skills': {
        const skills = Array.isArray(block.data) ? block.data : [];
        html += `
          <div class="section">
            <div class="section-title">专业技能</div>
            <div class="skills">
              ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">教育背景</div>`;
        items.forEach((item: any) => {
          const desc = Array.isArray(item.description)
            ? item.description.join('<br>')
            : item.description || '';
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.school}</span>
                <span class="item-date">${item.startDate} - ${item.endDate}</span>
              </div>
              <div class="item-subtitle">${item.major} | ${item.degree}</div>
              ${desc ? `<div class="item-desc">${desc}</div>` : ''}
            </div>
          `;
        });
        html += '</div>';
        break;
      }
      case 'certifications': {
        const data = block.data;
        const certifications = data?.certifications || data || [];
        const certList = Array.isArray(certifications) ? certifications : [];
        html += `
          <div class="section">
            <div class="section-title">证书荣誉</div>
            <div class="skills">
              ${certList
                .map((cert: any) => {
                  const name = typeof cert === 'string' ? cert : cert.name;
                  const date = typeof cert === 'string' ? '' : cert.date || '';
                  return `<span class="skill-tag">${name} ${date}</span>`;
                })
                .join('')}
            </div>
          </div>
        `;
        break;
      }
    }
  }

  html += `
  </div>
</body>
</html>
`;
  return html;
}
