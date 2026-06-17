import { PrismaClient } from '@prisma/client';
import { generateResumeHtml } from '../utils/resumeToHtml';
import {
  generateThumbnail,
  ensureThumbnailDirExists,
  closeBrowser,
} from '../services/thumbnail.service';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

const defaultResumeContent = {
  blocks: [
    {
      id: 'basic-default',
      type: 'basic',
      data: {
        name: '刘帅',
        title: 'AI全栈实习生',
        email: '273013247@qq.com',
        phone: '182-2451-0833',
        location: '北京',
        bio: '计算机专业大三学生，热爱技术，具备扎实的编程基础和良好的学习能力。',
      },
    },
    {
      id: 'experience-default',
      type: 'experience',
      data: [
        {
          id: 'exp-1',
          company: '超级公司',
          position: '系统集成实习工程师',
          department: '技术部',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description:
            '参与公司核心系统集成项目的需求分析、方案设计和实施工作。',
        },
      ],
    },
    {
      id: 'projects-default',
      type: 'projects',
      data: [
        {
          id: 'proj-1',
          name: '智慧园区系统集成项目',
          role: '系统集成工程师',
          startDate: '2025-01',
          endDate: '2025-12',
          location: '北京',
          description: '参与智慧园区系统集成项目的需求调研和分析。',
          techStack: ['Java', 'Spring Boot', 'MySQL'],
        },
      ],
    },
    {
      id: 'skills-default',
      type: 'skills',
      data: ['Python', 'Java', 'JavaScript', 'C++', 'MySQL'],
    },
    {
      id: 'education-default',
      type: 'education',
      data: [
        {
          id: 'edu-1',
          school: '某某大学',
          major: '计算机科学与技术',
          degree: '本科',
          startDate: '2023-09',
          endDate: '2027-06',
          description: '主修课程：数据结构、算法设计、计算机网络等。',
        },
      ],
    },
    {
      id: 'awards-default',
      type: 'awards',
      data: {
        awards: ['国家励志奖学金', '校级三好学生', '优秀学生干部'],
      },
    },
  ],
};

async function generateTemplateThumbnails() {
  console.log('开始为模板生成缩略图...');

  await ensureThumbnailDirExists();

  const templates = await prisma.template.findMany();

  for (const template of templates) {
    console.log(`正在处理模板: ${template.name}`);

    try {
      const styleConfig = (template.style_config as object) || {};

      const html = generateResumeHtml(defaultResumeContent, styleConfig);

      const thumbnailPath = path.join(
        __dirname,
        '../uploads/thumbnails',
        `template-${template.id}-small.png`
      );
      const previewPath = path.join(
        __dirname,
        '../uploads/thumbnails',
        `template-${template.id}-large.png`
      );

      await generateThumbnail(html, thumbnailPath);
      console.log(`  已生成缩略图: ${thumbnailPath}`);

      await generateThumbnail(html, previewPath);
      console.log(`  已生成预览图: ${previewPath}`);

      const thumbnailUrl = `/uploads/thumbnails/template-${template.id}-small.png`;
      const previewUrl = `/uploads/thumbnails/template-${template.id}-large.png`;

      await prisma.template.update({
        where: { id: template.id },
        data: {
          thumbnail: thumbnailUrl,
          preview_image: previewUrl,
        },
      });

      console.log(`  已更新数据库记录`);
    } catch (error) {
      console.error(`  处理模板 ${template.name} 失败:`, error);
    }
  }

  console.log('模板缩略图生成完成');
}

async function main() {
  try {
    await generateTemplateThumbnails();
  } catch (error) {
    console.error('生成缩略图失败:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
    await prisma.$disconnect();
  }
}

main();
