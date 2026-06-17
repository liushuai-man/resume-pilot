export async function generateThumbnailFromHtml(
  htmlContent: string,
  width: number = 400,
  height: number = 560
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(generateThumbnailFromResume({ blocks: [] }));
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

export async function generateThumbnailFromResume(
  resumeContent: any
): Promise<string> {
  const basicBlock = resumeContent.blocks?.find(
    (block: any) => block.type === 'basic'
  );
  const educationBlock = resumeContent.blocks?.find(
    (block: any) => block.type === 'education'
  );
  const experienceBlock = resumeContent.blocks?.find(
    (block: any) => block.type === 'experience'
  );
  const skillsBlock = resumeContent.blocks?.find(
    (block: any) => block.type === 'skills'
  );

  const name = basicBlock?.data?.name || '姓名';
  const title = basicBlock?.data?.title || '求职意向';
  const educationCount = educationBlock?.data?.length || 0;
  const experienceCount = experienceBlock?.data?.length || 0;
  const skills = skillsBlock?.data?.slice(0, 3) || [];

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
      <rect fill="#ffffff" width="400" height="560"/>
      <rect fill="#f5f5f5" x="40" y="40" width="320" height="480" rx="4"/>
      <text x="200" y="100" font-family="sans-serif" font-size="24" fill="#333" text-anchor="middle" font-weight="bold">${escapeHtml(name)}</text>
      <text x="200" y="130" font-family="sans-serif" font-size="14" fill="#666" text-anchor="middle">${escapeHtml(title)}</text>
      <text x="200" y="160" font-family="sans-serif" font-size="12" fill="#999" text-anchor="middle">邮箱 | 电话 | 地址</text>
      <line x1="80" y1="190" x2="320" y2="190" stroke="#ddd" stroke-width="1"/>
      <text x="100" y="230" font-family="sans-serif" font-size="16" fill="#333" font-weight="bold">教育背景</text>
      <rect fill="#f0f0f0" x="100" y="250" width="200" height="${educationCount > 0 ? 60 : 40}" rx="4"/>
      ${educationCount > 0 ? `<text x="115" y="270" font-family="sans-serif" font-size="12" fill="#555">${escapeHtml(educationBlock.data[0].school || '学校名称')}</text>` : ''}
      <text x="100" y="${educationCount > 0 ? 330 : 310}" font-family="sans-serif" font-size="16" fill="#333" font-weight="bold">工作经历</text>
      <rect fill="#f0f0f0" x="100" y="${educationCount > 0 ? 350 : 330}" width="200" height="${experienceCount > 0 ? 80 : 40}" rx="4"/>
      ${experienceCount > 0 ? `<text x="115" y="${educationCount > 0 ? 370 : 350}" font-family="sans-serif" font-size="12" fill="#555">${escapeHtml(experienceBlock.data[0].company || '公司名称')}</text>` : ''}
      <text x="100" y="${educationCount > 0 ? (experienceCount > 0 ? 450 : 410) : experienceCount > 0 ? 430 : 390}" font-family="sans-serif" font-size="16" fill="#333" font-weight="bold">专业技能</text>
      ${skills
        .map(
          (skill: string, index: number) => `
        <rect fill="#e0e0e0" x="${100 + index * 70}" y="${educationCount > 0 ? (experienceCount > 0 ? 470 : 430) : experienceCount > 0 ? 450 : 410}" width="60" height="24" rx="12"/>
      `
        )
        .join('')}
      <text x="200" y="530" font-family="sans-serif" font-size="10" fill="#ccc" text-anchor="middle">ResumePilot</text>
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
