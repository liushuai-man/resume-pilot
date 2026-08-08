import type { ResumeContent } from '@/types/resume';

function renderSkillGroups(skills: any[]): string {
  const grouped = new Map<string, string[]>();
  for (const skill of skills) {
    const name = (typeof skill === 'string' ? skill : skill?.name || '').trim();
    if (!name) continue;
    const category = (
      typeof skill === 'string' ? '' : skill?.category || ''
    ).trim();
    grouped.set(category, [...(grouped.get(category) || []), name]);
  }

  return Array.from(grouped.entries())
    .map(
      ([category, lines]) => `
        <div style="margin-bottom: 8px; font-size: 13px; line-height: 1.7; break-inside: avoid;">
          ${category ? `<strong style="display: block; margin-bottom: 2px;">${category}</strong>` : ''}
          ${lines.map((line) => `<div>${line}</div>`).join('')}
        </div>`
    )
    .join('');
}

export const generateResumeHtml = (
  content: ResumeContent,
  title: string
): string => {
  const blocks = content?.blocks || [];

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; padding: 40px; background: #fff; }
    .resume-container { max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
    .name { font-size: 32px; font-weight: bold; color: #333; }
    .title { font-size: 16px; color: #666; margin: 8px 0; }
    .contact { font-size: 12px; color: #666; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid #eee; }
    .item { margin-bottom: 15px; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .item-title { font-weight: bold; color: #333; }
    .item-subtitle { color: #666; font-size: 13px; }
    .item-date { color: #999; font-size: 12px; }
    .item-desc { font-size: 13px; color: #555; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: #f0f0f0; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #555; }
    .icon { display: inline-block; width: 16px; height: 16px; vertical-align: middle; margin-right: 6px; }
    .section-icon { width: 18px; height: 18px; }
  </style>
</head>
<body>
  <div class="resume-container">
`;

  for (const block of blocks) {
    switch (block.type) {
      case 'basic': {
        const data = block.data as any;
        html += `
            <div class="header">
              <div class="name">${data.name || '姓名'}</div>
              <div class="title">${data.title || ''}</div>
              <div class="contact">
                ${data.email ? `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>${data.email} | ` : ''}
                ${data.phone ? `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${data.phone} | ` : ''}
                ${data.location ? `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${data.location}` : ''}
              </div>
              ${data.bio ? `<div style="margin-top: 10px; font-size: 14px; color: #555;">${data.bio}</div>` : ''}
            </div>
          `;
        break;
      }
      case 'objective': {
        const data = block.data as any;
        html += `
            <div class="section">
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>职业目标</div>
              <div class="item-desc">${data?.objective || '暂无职业目标'}</div>
            </div>
          `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html +=
          '<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>教育背景</div>';
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.school}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.major} | ${item.degree}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html +=
          '<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>工作经历</div>';
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.company}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.position}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html +=
          '<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>项目经验</div>';
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.name}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.role}</div>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
                ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'skills': {
        const skills = Array.isArray(block.data) ? block.data : [];
        html += `
            <div class="section">
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.08-.7-1.66-.94l-.38-2.65c-.03-.24-.24-.42-.48-.42h-4c-.24 0-.45.18-.48.42l-.38 2.65c-.58.24-1.14.55-1.66.94l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.08.7 1.66.94l.38 2.65c.03.24.24.42.48.42h4c.24 0 .45-.18.48-.42l.38-2.65c.58-.24 1.14-.55 1.66-.94l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-7.43 2.52c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>专业技能</div>
              <div>${renderSkillGroups(skills)}</div>
            </div>
          `;
        break;
      }
      case 'certifications': {
        const data = block.data as any;
        const certs = data?.certifications || [];
        html += `
            <div class="section">
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 14.76l-3.9-2.08 1-4.27 3.9 2.08-1 4.27z"/></svg>证书荣誉</div>
              <div class="skills">
                ${certs.map((cert: string) => `<span class="skill-tag">${cert}</span>`).join('')}
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
};
