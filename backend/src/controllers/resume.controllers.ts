import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import {
  generateThumbnail,
  ensureThumbnailDirExists,
  getThumbnailPath,
} from '../services/thumbnail.service';
import { success, error } from '../utils/response';

export const createResume = async (req: Request, res: Response) => {
  try {
    const { template_id, title, content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    // Prisma Json 类型会自动处理序列化，不需要手动调用 JSON.stringify
    const resume = await prisma.resume.create({
      data: {
        user_id: userId,
        template_id,
        title,
        content,
      },
    });

    // 生成缩略图时需要确保 content 是对象
    const contentForThumbnail =
      typeof content === 'string' ? JSON.parse(content) : content;
    await generateResumeThumbnail(resume.id, contentForThumbnail);

    return res
      .status(201)
      .json({ code: 200, message: '创建成功', data: resume });
  } catch (err: any) {
    console.error('创建简历失败:', err);
    return error(res, '创建失败');
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return error(res, '简历不存在', 404);
    }

    if (existingResume.user_id !== userId) {
      return error(res, '无权操作', 403);
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title,
        content,
        updated_at: new Date(),
      },
    });

    // 生成缩略图时需要确保 content 是对象
    const contentForThumbnail =
      typeof content === 'string' ? JSON.parse(content) : content;
    await generateResumeThumbnail(id, contentForThumbnail);

    return res.json({ code: 200, message: '更新成功', data: resume });
  } catch (err: any) {
    console.error('更新简历失败:', err);
    return error(res, '更新失败');
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return error(res, '简历不存在', 404);
    }

    if (existingResume.user_id !== userId) {
      return error(res, '无权操作', 403);
    }

    await prisma.resume.update({
      where: { id },
      data: { is_deleted: true, updated_at: new Date() },
    });

    return res.json({ code: 200, message: '删除成功', data: null });
  } catch (err: any) {
    console.error('删除简历失败:', err);
    return error(res, '删除失败');
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const resume = await prisma.resume.findUnique({
      where: { id, is_deleted: false },
    });

    if (!resume) {
      return error(res, '简历不存在', 404);
    }

    if (resume.user_id !== userId) {
      return error(res, '无权查看', 403);
    }

    // Prisma Json 类型会自动解析，不需要手动 JSON.parse
    // 但为了兼容可能存在的旧数据（双重序列化），进行检查
    const content =
      typeof resume.content === 'string'
        ? JSON.parse(resume.content)
        : resume.content;

    return res.json({
      code: 200,
      message: 'Success',
      data: {
        ...resume,
        content: typeof content === 'string' ? JSON.parse(content) : content, // 处理双重序列化
      },
    });
  } catch (err: any) {
    console.error('获取简历失败:', err);
    return error(res, '获取失败');
  }
};

export const getUserResumes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const excludeUploaded = (req.query.excludeUploaded as string) === 'true';

    const where: any = { user_id: userId, is_deleted: false };

    const resumes = await prisma.resume.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });

    const result = resumes
      .filter((r: any) => {
        if (!excludeUploaded) return true;
        const content =
          typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
        return content.isUploadedFile !== true;
      })
      .map((resume: any) => {
        const content =
          typeof resume.content === 'string'
            ? JSON.parse(resume.content)
            : resume.content;
        return {
          ...resume,
          content,
        };
      });

    return res.json({ code: 200, message: 'Success', data: result });
  } catch (err: any) {
    console.error('获取简历列表失败:', err);
    return error(res, '获取失败');
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await import('../services/template.service').then((m) =>
      m.getTemplatesWithImages()
    );
    return res.json({ code: 200, message: 'Success', data: templates });
  } catch (err: any) {
    console.error('获取模板列表失败:', err);
    return error(res, '获取失败');
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id, is_deleted: false },
    });

    if (!template) {
      return error(res, '模板不存在', 404);
    }

    const schema =
      typeof template.schema === 'string'
        ? JSON.parse(template.schema)
        : template.schema;
    const styleConfig =
      typeof template.style_config === 'string'
        ? JSON.parse(template.style_config)
        : template.style_config;

    return res.json({
      code: 200,
      message: 'Success',
      data: {
        ...template,
        schema,
        style_config: styleConfig,
      },
    });
  } catch (err: any) {
    console.error('获取模板失败:', err);
    return error(res, '获取失败');
  }
};

async function generateResumeThumbnail(resumeId: string, content: any) {
  try {
    await ensureThumbnailDirExists();
    const thumbnailPath = getThumbnailPath(resumeId);

    const htmlContent = generateResumeHtml(content);
    await generateThumbnail(htmlContent, thumbnailPath);

    console.log(`缩略图已生成: ${thumbnailPath}`);
  } catch (error) {
    console.error('生成缩略图失败:', error);
  }
}

function generateResumeHtml(content: any): string {
  const blocks = content?.blocks || [];

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 20px; background: #fff; width: 100%; }
        .container { width: 100%; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; }
        .title { color: #666; margin: 5px 0; }
        .contact { font-size: 11px; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 3px; }
        .item { margin-bottom: 10px; }
        .item-header { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #666; }
        .item-date { color: #999; font-size: 10px; }
        .item-desc { font-size: 11px; color: #555; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill-tag { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
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
              ${data.email ? `📧 ${data.email} | ` : ''}
              ${data.phone ? `📱 ${data.phone} | ` : ''}
              ${data.location ? `📍 ${data.location}` : ''}
            </div>
            ${data.bio ? `<div class="item-desc" style="margin-top: 10px;">${data.bio}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'objective': {
        html += `
          <div class="section">
            <div class="section-title">🎯 职业目标</div>
            <div class="item-desc">${block.data?.objective || '暂无职业目标'}</div>
          </div>
        `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">🎓 教育背景</div>`;
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
        html += `</div>`;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">💼 工作经历</div>`;
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
        html += `</div>`;
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">🚀 项目经验</div>`;
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
        html += `</div>`;
        break;
      }
      case 'skills': {
        const skills = Array.isArray(block.data) ? block.data : [];
        html += `
          <div class="section">
            <div class="section-title">🛠️ 专业技能</div>
            <div class="skills">
              ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        `;
        break;
      }
      case 'certifications': {
        const certs = block.data?.certifications || [];
        html += `
          <div class="section">
            <div class="section-title">🏆 证书荣誉</div>
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
}
