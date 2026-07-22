export async function generateThumbnailFromHtml(
  _htmlContent: string,
  width: number = 400,
  height: number = 560
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(generateThumbnailFromResume({}));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('简历预览', width / 2, height / 2 - 10);

    ctx.fillStyle = '#999';
    ctx.font = '12px sans-serif';
    ctx.fillText('点击查看详情', width / 2, height / 2 + 15);

    resolve(canvas.toDataURL('image/png', 0.8));
  });
}

interface ThumbnailOptions {
  themeColor?: string;
  layout?: 'classic' | 'sidebar' | 'minimal';
  styleConfig?: any;
}

export function generateThumbnailFromResume(
  resumeContent: any,
  options: string | ThumbnailOptions = {}
): string {
  let themeColor = '#3b82f6';
  let layout: 'classic' | 'sidebar' | 'minimal' = 'classic';
  let styleConfig: any = {};

  if (typeof options === 'string') {
    themeColor = options;
  } else {
    themeColor = options.themeColor || '#3b82f6';
    layout = options.layout || 'classic';
    styleConfig = options.styleConfig || {};
  }

  const primaryColor = styleConfig?.primaryColor || themeColor;
  const sectionTitleColor = styleConfig?.sectionTitleColor || primaryColor;
  const sidebarColor = styleConfig?.sidebarColor || '#0F172A';
  const sidebarTextColor = styleConfig?.sidebarTextColor || '#F1F5F9';

  let name = '姓名';
  let title = '求职意向';
  let email = '';
  let phone = '';
  let location = '';

  let educationItems: any[] = [];
  let experienceItems: any[] = [];
  let projectItems: any[] = [];
  let skills: any[] = [];
  let certifications: any[] = [];

  if (resumeContent.blocks && resumeContent.blocks.length > 0) {
    const basicBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'basic'
    );
    const educationBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'education'
    );
    const experienceBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'experience'
    );
    const projectsBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'projects'
    );
    const skillsBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'skills'
    );
    const certificationsBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'certifications'
    );

    const basicInfo = basicBlock?.data || {};
    name = basicInfo.name || '姓名';
    title = basicInfo.title || '求职意向';
    email = basicInfo.email || '';
    phone = basicInfo.phone || '';
    location = basicInfo.location || '';

    educationItems = educationBlock?.data || [];
    experienceItems = experienceBlock?.data || [];
    projectItems = projectsBlock?.data || [];
    skills = skillsBlock?.data || [];

    if (certificationsBlock?.data) {
      if (Array.isArray(certificationsBlock.data)) {
        certifications = certificationsBlock.data;
      } else if (certificationsBlock.data.certifications) {
        certifications = certificationsBlock.data.certifications;
      }
    }
  } else {
    const {
      basicInfo,
      education,
      experience,
      projects,
      skills: skillsData,
      certifications: certData,
    } = resumeContent;

    if (basicInfo) {
      name = basicInfo.name || '姓名';
      title = basicInfo.title || '求职意向';
      email = basicInfo.email || '';
      phone = basicInfo.phone || '';
      location = basicInfo.location || '';
    }

    educationItems = education || [];
    experienceItems = experience || [];
    projectItems = projects || [];
    skills = skillsData?.map((s: any) => s.name) || [];
    certifications = certData || [];
  }

  if (layout === 'sidebar') {
    return generateSidebarThumbnail({
      name,
      title,
      email,
      phone,
      location,
      educationItems,
      experienceItems,
      projectItems,
      skills,
      certifications,
      primaryColor,
      sidebarColor,
      sidebarTextColor,
    });
  }

  if (layout === 'minimal') {
    return generateMinimalThumbnail({
      name,
      title,
      email,
      phone,
      location,
      educationItems,
      experienceItems,
      projectItems,
      skills,
      certifications,
      primaryColor,
    });
  }

  return generateClassicThumbnail({
    name,
    title,
    email,
    phone,
    location,
    educationItems,
    experienceItems,
    projectItems,
    skills,
    primaryColor,
    sectionTitleColor,
  });
}

function generateClassicThumbnail(data: any): string {
  const {
    name,
    title,
    email,
    phone,
    location,
    educationItems,
    experienceItems,
    projectItems,
    skills,
    primaryColor,
    sectionTitleColor,
  } = data;

  const contactInfo = [];
  if (email) contactInfo.push(email);
  if (phone) contactInfo.push(phone);
  if (location) contactInfo.push(location);
  const contactText =
    contactInfo.length > 0 ? contactInfo.join(' | ') : '邮箱 | 电话 | 地址';

  const educationCount = educationItems.length;
  const experienceCount = experienceItems.length;
  const projectCount = projectItems.length;
  const skillsCount = skills.length;

  const displaySkills = skills.slice(0, 4);

  let y = 170;
  const sections: string[] = [];

  if (educationCount > 0) {
    sections.push(`
      <text x="60" y="${y}" font-family="sans-serif" font-size="13" fill="${sectionTitleColor}" font-weight="bold">教育背景</text>
      <rect fill="${sectionTitleColor}" x="50" y="${y - 12}" width="3" height="16" rx="1"/>
      <line x1="50" y1="${y + 6}" x2="350" y2="${y + 6}" stroke="${sectionTitleColor}" stroke-width="1"/>
      <text x="60" y="${y + 28}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(educationItems[0].school || '学校名称')}</text>
      <text x="60" y="${y + 44}" font-family="sans-serif" font-size="10" fill="#666">${escapeHtml(educationItems[0].major || '')} · ${educationItems[0].degree || ''}</text>
      <text x="300" y="${y + 28}" font-family="sans-serif" font-size="10" fill="#999" text-anchor="end">${educationItems[0].startDate ? educationItems[0].startDate.slice(0, 4) : ''}.${educationItems[0].endDate ? educationItems[0].endDate.slice(5, 7) : ''}</text>
    `);
    y += 68;
  }

  if (experienceCount > 0) {
    sections.push(`
      <text x="60" y="${y}" font-family="sans-serif" font-size="13" fill="${sectionTitleColor}" font-weight="bold">工作经历</text>
      <rect fill="${sectionTitleColor}" x="50" y="${y - 12}" width="3" height="16" rx="1"/>
      <line x1="50" y1="${y + 6}" x2="350" y2="${y + 6}" stroke="${sectionTitleColor}" stroke-width="1"/>
      <text x="60" y="${y + 28}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(experienceItems[0].company || '公司名称')}</text>
      <text x="60" y="${y + 44}" font-family="sans-serif" font-size="10" fill="#666">${escapeHtml(experienceItems[0].position || '')}</text>
      <text x="300" y="${y + 28}" font-family="sans-serif" font-size="10" fill="#999" text-anchor="end">${experienceItems[0].startDate || ''}-${experienceItems[0].endDate || '至今'}</text>
    `);
    y += 68;
  }

  if (projectCount > 0) {
    sections.push(`
      <text x="60" y="${y}" font-family="sans-serif" font-size="13" fill="${sectionTitleColor}" font-weight="bold">项目经验</text>
      <rect fill="${sectionTitleColor}" x="50" y="${y - 12}" width="3" height="16" rx="1"/>
      <line x1="50" y1="${y + 6}" x2="350" y2="${y + 6}" stroke="${sectionTitleColor}" stroke-width="1"/>
      <text x="60" y="${y + 28}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(projectItems[0].name || '项目名称')}</text>
      <text x="60" y="${y + 44}" font-family="sans-serif" font-size="10" fill="#666">${escapeHtml(projectItems[0].role || '')}</text>
    `);
    y += 68;
  }

  if (skillsCount > 0) {
    sections.push(`
      <text x="60" y="${y}" font-family="sans-serif" font-size="13" fill="${sectionTitleColor}" font-weight="bold">专业技能</text>
      <rect fill="${sectionTitleColor}" x="50" y="${y - 12}" width="3" height="16" rx="1"/>
      <line x1="50" y1="${y + 6}" x2="350" y2="${y + 6}" stroke="${sectionTitleColor}" stroke-width="1"/>
    `);
    const skillY = y + 20;
    displaySkills.forEach((skill: string, index: number) => {
      const skillX = 60 + (index % 4) * 72;
      const row = Math.floor(index / 4);
      const skillRowY = skillY + row * 26;
      sections.push(`
        <rect fill="${primaryColor}15" x="${skillX}" y="${skillRowY}" width="65" height="20" rx="10"/>
        <text x="${skillX + 32.5}" y="${skillRowY + 14}" font-family="sans-serif" font-size="9" fill="${primaryColor}" text-anchor="middle">${escapeHtml(String(skill).slice(0, 8))}</text>
      `);
    });
    y += 70;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <rect fill="#ffffff" width="400" height="560"/>
      <rect fill="#fafafa" x="20" y="20" width="360" height="520" rx="8"/>
      <rect fill="#ffffff" x="30" y="30" width="340" height="500" rx="4"/>
      <text x="200" y="80" font-family="sans-serif" font-size="24" fill="${primaryColor}" text-anchor="middle" font-weight="bold">${escapeHtml(name)}</text>
      <text x="200" y="105" font-family="sans-serif" font-size="13" fill="#666" text-anchor="middle">${escapeHtml(title)}</text>
      <text x="200" y="128" font-family="sans-serif" font-size="10" fill="#999" text-anchor="middle">${escapeHtml(contactText)}</text>
      <rect fill="${primaryColor}" x="50" y="145" width="300" height="3" rx="1"/>
      ${sections.join('')}
      <text x="200" y="545" font-family="sans-serif" font-size="9" fill="#d1d5db" text-anchor="middle">ResumePilot</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
}

function generateSidebarThumbnail(data: any): string {
  const {
    name,
    title,
    email,
    phone,
    location,
    educationItems,
    experienceItems,
    projectItems,
    skills,
    certifications,
    primaryColor,
    sidebarColor,
    sidebarTextColor,
  } = data;

  const displaySkills = skills.slice(0, 6);

  const sidebarWidth = 140;
  const contentStartX = sidebarWidth + 30;
  const contentWidth = 400 - sidebarWidth - 50;

  let leftY = 90;
  let rightY = 60;
  const leftSections: string[] = [];
  const rightSections: string[] = [];

  leftSections.push(`
    <text x="25" y="${leftY}" font-family="sans-serif" font-size="18" fill="${sidebarTextColor}" font-weight="bold">${escapeHtml(name)}</text>
    <text x="25" y="${leftY + 18}" font-family="sans-serif" font-size="10" fill="${sidebarTextColor}cc">${escapeHtml(title)}</text>
  `);
  leftY += 50;

  if (email || phone || location) {
    leftSections.push(`
      <text x="25" y="${leftY}" font-family="sans-serif" font-size="9" fill="${sidebarTextColor}dd">📧 ${escapeHtml(email || 'email')}</text>
      <text x="25" y="${leftY + 14}" font-family="sans-serif" font-size="9" fill="${sidebarTextColor}dd">📱 ${escapeHtml(phone || 'phone')}</text>
      <text x="25" y="${leftY + 28}" font-family="sans-serif" font-size="9" fill="${sidebarTextColor}dd">📍 ${escapeHtml(location || 'location')}</text>
    `);
    leftY += 48;
  }

  if (skills.length > 0) {
    leftSections.push(`
      <text x="25" y="${leftY}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold">专业技能</text>
      <rect fill="${primaryColor}40" x="25" y="${leftY + 4}" width="100" height="1" rx="0.5"/>
    `);
    leftY += 20;
    displaySkills.forEach((skill: string, index: number) => {
      const skillY = leftY + index * 18;
      leftSections.push(`
        <rect fill="${primaryColor}30" x="25" y="${skillY}" width="100" height="14" rx="3"/>
        <text x="30" y="${skillY + 10}" font-family="sans-serif" font-size="8" fill="${sidebarTextColor}">${escapeHtml(String(skill).slice(0, 10))}</text>
      `);
    });
    leftY += displaySkills.length * 18 + 10;
  }

  if (educationItems.length > 0) {
    leftSections.push(`
      <text x="25" y="${leftY}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold">教育背景</text>
      <rect fill="${primaryColor}40" x="25" y="${leftY + 4}" width="100" height="1" rx="0.5"/>
      <text x="25" y="${leftY + 20}" font-family="sans-serif" font-size="9" fill="${sidebarTextColor}" font-weight="600">${escapeHtml(educationItems[0].school || '学校')}</text>
      <text x="25" y="${leftY + 33}" font-family="sans-serif" font-size="8" fill="${sidebarTextColor}aa">${escapeHtml(educationItems[0].major || '')}</text>
    `);
    leftY += 50;
  }

  if (experienceItems.length > 0) {
    rightSections.push(`
      <text x="${contentStartX}" y="${rightY}" font-family="sans-serif" font-size="12" fill="${primaryColor}" font-weight="bold">工作经历</text>
      <rect fill="${primaryColor}" x="${contentStartX - 8}" y="${rightY - 10}" width="3" height="14" rx="1"/>
      <line x1="${contentStartX - 8}" y1="${rightY + 4}" x2="${contentStartX + contentWidth}" y2="${rightY + 4}" stroke="#e5e7eb" stroke-width="1"/>
      <text x="${contentStartX}" y="${rightY + 26}" font-family="sans-serif" font-size="10" fill="#333" font-weight="600">${escapeHtml(experienceItems[0].company || '公司名称')}</text>
      <text x="${contentStartX}" y="${rightY + 42}" font-family="sans-serif" font-size="9" fill="#666">${escapeHtml(experienceItems[0].position || '')}</text>
      <text x="${contentStartX + contentWidth}" y="${rightY + 26}" font-family="sans-serif" font-size="8" fill="#999" text-anchor="end">${experienceItems[0].startDate || ''}-${experienceItems[0].endDate || '至今'}</text>
    `);
    rightY += 62;
  }

  if (projectItems.length > 0) {
    rightSections.push(`
      <text x="${contentStartX}" y="${rightY}" font-family="sans-serif" font-size="12" fill="${primaryColor}" font-weight="bold">项目经验</text>
      <rect fill="${primaryColor}" x="${contentStartX - 8}" y="${rightY - 10}" width="3" height="14" rx="1"/>
      <line x1="${contentStartX - 8}" y1="${rightY + 4}" x2="${contentStartX + contentWidth}" y2="${rightY + 4}" stroke="#e5e7eb" stroke-width="1"/>
      <text x="${contentStartX}" y="${rightY + 26}" font-family="sans-serif" font-size="10" fill="#333" font-weight="600">${escapeHtml(projectItems[0].name || '项目名称')}</text>
      <text x="${contentStartX}" y="${rightY + 42}" font-family="sans-serif" font-size="9" fill="#666">${escapeHtml(projectItems[0].role || '')}</text>
    `);
    rightY += 62;
  }

  if (certifications.length > 0) {
    rightSections.push(`
      <text x="${contentStartX}" y="${rightY}" font-family="sans-serif" font-size="12" fill="${primaryColor}" font-weight="bold">证书荣誉</text>
      <rect fill="${primaryColor}" x="${contentStartX - 8}" y="${rightY - 10}" width="3" height="14" rx="1"/>
      <line x1="${contentStartX - 8}" y1="${rightY + 4}" x2="${contentStartX + contentWidth}" y2="${rightY + 4}" stroke="#e5e7eb" stroke-width="1"/>
      <text x="${contentStartX}" y="${rightY + 26}" font-family="sans-serif" font-size="9" fill="#555">• ${escapeHtml(typeof certifications[0] === 'string' ? certifications[0] : certifications[0]?.name || '证书').slice(0, 18)}</text>
    `);
    rightY += 52;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <rect fill="#ffffff" width="400" height="560"/>
      <rect fill="#fafafa" x="20" y="20" width="360" height="520" rx="8"/>
      <rect fill="#ffffff" x="30" y="30" width="340" height="500" rx="4"/>
      <rect fill="${sidebarColor}" x="30" y="30" width="${sidebarWidth}" height="500" rx="4 0 0 4"/>
      ${leftSections.join('')}
      ${rightSections.join('')}
      <text x="200" y="545" font-family="sans-serif" font-size="9" fill="#d1d5db" text-anchor="middle">ResumePilot</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
}

function generateMinimalThumbnail(data: any): string {
  const {
    name,
    title,
    email,
    phone,
    location,
    educationItems,
    experienceItems,
    projectItems,
    skills,
    primaryColor,
  } = data;

  const contactInfo = [];
  if (email) contactInfo.push(email);
  if (phone) contactInfo.push(phone);
  if (location) contactInfo.push(location);
  const contactText =
    contactInfo.length > 0
      ? contactInfo.join(' · ')
      : 'email · phone · location';

  const educationCount = educationItems.length;
  const experienceCount = experienceItems.length;
  const projectCount = projectItems.length;
  const skillsCount = skills.length;

  const displaySkills = skills.slice(0, 5);

  let y = 180;
  const sections: string[] = [];

  if (experienceCount > 0) {
    sections.push(`
      <text x="50" y="${y}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold" letter-spacing="2">WORK EXPERIENCE</text>
      <text x="50" y="${y + 25}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(experienceItems[0].company || '公司名称')}</text>
      <text x="280" y="${y + 25}" font-family="sans-serif" font-size="9" fill="#aaa" text-anchor="end">${experienceItems[0].startDate || ''} - ${experienceItems[0].endDate || '至今'}</text>
      <text x="50" y="${y + 42}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(experienceItems[0].position || '')}</text>
    `);
    y += 65;
  }

  if (educationCount > 0) {
    sections.push(`
      <text x="50" y="${y}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold" letter-spacing="2">EDUCATION</text>
      <text x="50" y="${y + 25}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(educationItems[0].school || '学校名称')}</text>
      <text x="280" y="${y + 25}" font-family="sans-serif" font-size="9" fill="#aaa" text-anchor="end">${educationItems[0].startDate ? educationItems[0].startDate.slice(0, 4) : ''} - ${educationItems[0].endDate ? educationItems[0].endDate.slice(0, 4) : ''}</text>
      <text x="50" y="${y + 42}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(educationItems[0].major || '')} · ${educationItems[0].degree || ''}</text>
    `);
    y += 65;
  }

  if (projectCount > 0) {
    sections.push(`
      <text x="50" y="${y}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold" letter-spacing="2">PROJECTS</text>
      <text x="50" y="${y + 25}" font-family="sans-serif" font-size="11" fill="#333" font-weight="600">${escapeHtml(projectItems[0].name || '项目名称')}</text>
      <text x="50" y="${y + 42}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(projectItems[0].role || '')}</text>
    `);
    y += 65;
  }

  if (skillsCount > 0) {
    sections.push(`
      <text x="50" y="${y}" font-family="sans-serif" font-size="11" fill="${primaryColor}" font-weight="bold" letter-spacing="2">SKILLS</text>
    `);
    const skillY = y + 22;
    displaySkills.forEach((skill: string, index: number) => {
      const skillX = 50 + index * 62;
      sections.push(`
        <text x="${skillX}" y="${skillY + 10}" font-family="sans-serif" font-size="9" fill="#888">${escapeHtml(String(skill).slice(0, 8))}</text>
        <rect fill="${primaryColor}40" x="${skillX}" y="${skillY + 14}" width="55" height="1" rx="0.5"/>
      `);
    });
    y += 55;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <rect fill="#ffffff" width="400" height="560"/>
      <rect fill="#fafafa" x="20" y="20" width="360" height="520" rx="8"/>
      <rect fill="#ffffff" x="30" y="30" width="340" height="500" rx="4"/>
      <text x="50" y="100" font-family="sans-serif" font-size="32" fill="#222" font-weight="300" letter-spacing="2">${escapeHtml(name)}</text>
      <text x="50" y="128" font-family="sans-serif" font-size="13" fill="#999" letter-spacing="1">${escapeHtml(title)}</text>
      <text x="50" y="152" font-family="sans-serif" font-size="10" fill="#aaa">${escapeHtml(contactText)}</text>
      ${sections.join('')}
      <text x="200" y="545" font-family="sans-serif" font-size="9" fill="#d1d5db" text-anchor="middle">ResumePilot</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
