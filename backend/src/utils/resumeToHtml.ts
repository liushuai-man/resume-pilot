export interface ResumeBlock {
  id: string;
  type: string;
  data: any;
}

export interface ResumeContent {
  blocks: ResumeBlock[];
}

export const generateResumeHtml = (
  content: ResumeContent,
  styleConfig?: any
): string => {
  const blocks = content?.blocks || [];

  const styles = {
    primaryColor: styleConfig?.primaryColor || '#3B82F6',
    backgroundColor: styleConfig?.backgroundColor || '#FFFFFF',
    fontFamily:
      styleConfig?.fontFamily || "'Microsoft YaHei', Arial, sans-serif",
    fontSize: styleConfig?.fontSize || 14,
    sectionTitleColor: styleConfig?.sectionTitleColor || '#3B82F6',
    lineColor: styleConfig?.lineColor || '#E5E7EB',
  };

  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${styles.fontFamily}; font-size: ${styles.fontSize}px; line-height: 1.6; color: #333; padding: 40px; background: ${styles.backgroundColor}; width: 100%; }
    .resume-container { width: 100%; background: #fff; padding: 40px; }
    .header { text-align: left; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid ${styles.primaryColor}; }
    .name-title { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .name { font-size: 28px; font-weight: bold; color: #333; }
    .title { font-size: 16px; color: ${styles.sectionTitleColor}; margin-top: 5px; }
    .contact { font-size: 12px; color: #666; margin-top: 8px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: bold; color: ${styles.sectionTitleColor}; margin-bottom: 12px; padding-bottom: 5px; border-bottom: 1px solid ${styles.lineColor}; }
    .item { margin-bottom: 15px; }
    .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .item-title { font-weight: bold; color: #333; }
    .item-subtitle { color: #666; font-size: 13px; }
    .item-date { color: #999; font-size: 12px; }
    .item-desc { font-size: 13px; color: #555; line-height: 1.6; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-tag { background: #f0f0f0; padding: 4px 12px; border-radius: 4px; font-size: 12px; color: #555; }
    .icon { display: inline-block; width: 14px; height: 14px; vertical-align: middle; margin-right: 6px; color: ${styles.sectionTitleColor}; }
    .section-icon { width: 16px; height: 16px; }
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
              <div class="name-title">
                <div>
                  <div class="name">${data.name || '姓名'}</div>
                  <div class="title">${data.title || ''}</div>
                </div>
              </div>
              <div class="contact">
                ${data.phone ? `${data.phone} | ` : ''}
                ${data.email ? `${data.email} | ` : ''}
                ${data.location ? `${data.location}` : ''}
              </div>
              ${data.summary ? `<div style="margin-top: 12px; font-size: 13px; color: #555; line-height: 1.6;">${data.summary}</div>` : ''}
            </div>
          `;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>工作经历</div>`;
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.company}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.position} | ${item.location || ''}</div>
                ${item.description ? `<div class="item-desc">${Array.isArray(item.description) ? item.description.join('<br>') : item.description}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>项目经验</div>`;
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.name}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.role} | ${item.location || ''}</div>
                ${item.description ? `<div class="item-desc">${Array.isArray(item.description) ? item.description.join('<br>') : item.description}</div>` : ''}
                ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'organizations': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>社团和组织经历</div>`;
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.name}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.position} | ${item.location || ''}</div>
                ${item.description ? `<div class="item-desc">${Array.isArray(item.description) ? item.description.join('<br>') : item.description}</div>` : ''}
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
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2zm0 14.76l-3.9-2.08 1-4.27 3.9 2.08-1 4.27z"/></svg>荣誉奖项</div>
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
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.08-.7-1.66-.94l-.38-2.65c-.03-.24-.24-.42-.48-.42h-4c-.24 0-.45.18-.48.42l-.38 2.65c-.58.24-1.14.55-1.66.94l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64l2.11 1.65c-.04.32-.07.64-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.39 1.08.7 1.66.94l.38 2.65c.03.24.24.42.48.42h4c.24 0 .45-.18.48-.42l.38-2.65c.58-.24 1.14-.55 1.66-.94l2.49 1c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-7.43 2.52c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>专业技能</div>
              <div class="skills">
                ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>教育背景</div>`;
        items.forEach((item: any) => {
          html += `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${item.school}</span>
                  <span class="item-date">${item.startDate} - ${item.endDate}</span>
                </div>
                <div class="item-subtitle">${item.major} | ${item.degree}</div>
                ${item.description ? `<div class="item-desc">${Array.isArray(item.description) ? item.description.join('<br>') : item.description}</div>` : ''}
              </div>
            `;
        });
        html += '</div>';
        break;
      }
      case 'certifications': {
        const data = block.data;
        const certifications = data?.certifications || [];
        html += `
            <div class="section">
              <div class="section-title"><svg class="icon section-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>证书荣誉</div>
              <div class="skills">
                ${certifications.map((cert: any) => `<span class="skill-tag">${cert.name} ${cert.date}</span>`).join('')}
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
