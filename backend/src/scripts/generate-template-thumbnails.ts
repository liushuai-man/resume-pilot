import { prisma } from '../database/prisma';
import { generateResumeHtml } from '../utils/resumeToHtml';
import {
  generatePreviewImage,
  generateThumbnailFromPreview,
  ensureTemplateDirExists,
  closeBrowser,
} from '../services/thumbnail.service';
import { defaultResume } from '../utils/defaultResume';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateTemplateThumbnails() {
  console.log('开始为模板生成预览图和缩略图...');

  const templates = await prisma.template.findMany();

  for (const template of templates) {
    console.log(`正在处理模板: ${template.name}`);

    try {
      const styleConfig = (template.style_config as object) || {};

      const html = generateResumeHtml(defaultResume, styleConfig);

      await ensureTemplateDirExists(template.id);

      // 生成预览图 (1200 × 1697, A4比例)
      const previewTempPath = path.join(
        __dirname,
        '../uploads/templates',
        template.id,
        'preview.png'
      );
      const previewOutputPath = path.join(
        __dirname,
        '../uploads/templates',
        template.id,
        'preview.webp'
      );

      console.log('  生成预览图...');
      await generatePreviewImage(html, previewTempPath);

      // 生成缩略图 (300 × 424, 从预览图压缩)
      const thumbnailOutputPath = path.join(
        __dirname,
        '../uploads/templates',
        template.id,
        'thumbnail.webp'
      );

      console.log('  生成缩略图...');
      await generateThumbnailFromPreview(previewTempPath, thumbnailOutputPath);

      const thumbnailUrl = `/uploads/templates/${template.id}/thumbnail.webp`;
      const previewUrl = `/uploads/templates/${template.id}/preview.webp`;

      await prisma.template.update({
        where: { id: template.id },
        data: {
          thumbnail: thumbnailUrl,
          preview_image: previewUrl,
        },
      });

      console.log(`  已更新数据库记录`);
      console.log(`  预览图: ${previewUrl}`);
      console.log(`  缩略图: ${thumbnailUrl}`);
    } catch (error) {
      console.error(`  处理模板 ${template.name} 失败:`, error);
    }
  }

  console.log('模板预览图和缩略图生成完成');
}

async function main() {
  try {
    await generateTemplateThumbnails();
  } catch (error) {
    console.error('生成预览图和缩略图失败:', error);
    process.exit(1);
  } finally {
    await closeBrowser();
    await prisma.$disconnect();
  }
}

main();
