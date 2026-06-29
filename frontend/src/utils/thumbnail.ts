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

export function generateThumbnailFromResume(resumeContent: any): string {
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
  let campusExperiences: any[] = [];
  let careerObjective = '';

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
    const campusBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'campus'
    );
    const objectiveBlock = resumeContent.blocks.find(
      (block: any) => block.type === 'objective'
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

    campusExperiences = campusBlock?.data || [];
    careerObjective = objectiveBlock?.data?.objective || '';
  } else {
    const {
      basicInfo,
      education,
      experience,
      projects,
      skills: skillsData,
      certifications: certData,
      campusExperiences: campusData,
      careerObjective: objective,
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
    campusExperiences = campusData || [];
    careerObjective = objective || '';
  }

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
  const certCount = certifications.length;
  const campusCount = campusExperiences.length;
  const hasObjective = !!careerObjective;

  const displaySkills = skills.slice(0, 4);

  let y = 180;

  const sections: string[] = [];

  if (hasObjective) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">职业目标</text>
      <rect fill="#f8fafc" x="80" y="${y + 35}" width="240" height="35" rx="4"/>
    `);
    y += 80;
  }

  if (educationCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">教育背景</text>
      <rect fill="#f8fafc" x="80" y="${y + 35}" width="240" height="45" rx="4"/>
      <text x="95" y="${y + 55}" font-family="sans-serif" font-size="11" fill="#555">${escapeHtml(educationItems[0].school || '学校名称')}</text>
      <text x="95" y="${y + 70}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(educationItems[0].major || '')} ${educationItems[0].startDate ? educationItems[0].startDate.slice(0, 4) : ''}-${educationItems[0].endDate ? educationItems[0].endDate.slice(0, 4) : ''}</text>
    `);
    y += 90;
  }

  if (experienceCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">工作经历</text>
      <rect fill="#f8fafc" x="80" y="${y + 35}" width="240" height="45" rx="4"/>
      <text x="95" y="${y + 55}" font-family="sans-serif" font-size="11" fill="#555">${escapeHtml(experienceItems[0].company || '公司名称')}</text>
      <text x="95" y="${y + 70}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(experienceItems[0].position || '')} ${experienceItems[0].startDate || ''}-${experienceItems[0].endDate || '至今'}</text>
    `);
    y += 90;
  }

  if (projectCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">项目经验</text>
      <rect fill="#f8fafc" x="80" y="${y + 35}" width="240" height="45" rx="4"/>
      <text x="95" y="${y + 55}" font-family="sans-serif" font-size="11" fill="#555">${escapeHtml(projectItems[0].name || '项目名称')}</text>
      <text x="95" y="${y + 70}" font-family="sans-serif" font-size="10" fill="#888">${escapeHtml(projectItems[0].role || '')}</text>
    `);
    y += 90;
  }

  if (skillsCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">专业技能</text>
    `);
    const skillY = y + 35;
    displaySkills.forEach((skill: string, index: number) => {
      const skillX = 80 + (index % 4) * 65;
      const row = Math.floor(index / 4);
      const skillRowY = skillY + row * 28;
      sections.push(`
        <rect fill="#e0f2fe" x="${skillX}" y="${skillRowY}" width="60" height="22" rx="11"/>
        <text x="${skillX + 30}" y="${skillRowY + 15}" font-family="sans-serif" font-size="10" fill="#0369a1" text-anchor="middle">${escapeHtml(String(skill).slice(0, 6))}</text>
      `);
    });
    y += 90;
  }

  if (certCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">证书荣誉</text>
      <rect fill="#fef9c3" x="80" y="${y + 35}" width="240" height="30" rx="4"/>
      <text x="95" y="${y + 55}" font-family="sans-serif" font-size="11" fill="#a16207">${escapeHtml(typeof certifications[0] === 'string' ? certifications[0] : certifications[0].name || '证书名称').slice(0, 15)}</text>
    `);
    y += 75;
  }

  if (campusCount > 0) {
    sections.push(`
      <text x="80" y="${y + 25}" font-family="sans-serif" font-size="14" fill="#333" font-weight="bold">校园经历</text>
      <rect fill="#f0fdf4" x="80" y="${y + 35}" width="240" height="35" rx="4"/>
      <text x="95" y="${y + 55}" font-family="sans-serif" font-size="11" fill="#166534">${escapeHtml(campusExperiences[0].name || '经历名称').slice(0, 15)}</text>
    `);
    y += 80;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <rect fill="#ffffff" width="400" height="560"/>
      <rect fill="#fafafa" x="20" y="20" width="360" height="520" rx="8"/>
      <rect fill="#ffffff" x="40" y="40" width="320" height="480" rx="4"/>
      <rect fill="#3b82f6" x="40" y="40" width="4" height="40" rx="2"/>
      <text x="200" y="90" font-family="sans-serif" font-size="22" fill="#1f2937" text-anchor="middle" font-weight="bold">${escapeHtml(name)}</text>
      <text x="200" y="115" font-family="sans-serif" font-size="13" fill="#3b82f6" text-anchor="middle">${escapeHtml(title)}</text>
      <text x="200" y="140" font-family="sans-serif" font-size="10" fill="#9ca3af" text-anchor="middle">${escapeHtml(contactText)}</text>
      <line x1="60" y1="160" x2="340" y2="160" stroke="#e5e7eb" stroke-width="1"/>
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
