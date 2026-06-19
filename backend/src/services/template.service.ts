import { PrismaClient } from '@prisma/client';
import { generateResumeHtml } from '../utils/resumeToHtml';
import { defaultResume } from '../utils/defaultResume';
import {
  generatePreviewImage,
  generateThumbnailFromPreview,
  ensureTemplateDirExists,
} from './thumbnail.service';
import * as crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

export interface TemplateWithImages {
  id: string;
  name: string;
  category: string;
  thumbnail: string | null;
  preview_image: string | null;
  schema: object;
  style_config: object;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

function generateDataHash(schema: object, styleConfig: object): string {
  const data = JSON.stringify({ schema, styleConfig });
  return crypto.createHash('md5').update(data).digest('hex');
}

export async function getTemplatesWithImages(): Promise<TemplateWithImages[]> {
  const templates = await prisma.template.findMany({
    where: { is_deleted: false },
    orderBy: { created_at: 'desc' },
  });

  const result: TemplateWithImages[] = [];

  for (const template of templates) {
    const schema = template.schema as object;
    const styleConfig = template.style_config as object;
    const currentHash = generateDataHash(schema, styleConfig);

    // 检查文件是否存在
    const thumbnailPath = path.join(
      __dirname,
      '../uploads/templates',
      template.id,
      'thumbnail.webp'
    );
    const previewPath = path.join(
      __dirname,
      '../uploads/templates',
      template.id,
      'preview.webp'
    );
    const thumbnailExists = await fs
      .access(thumbnailPath)
      .then(() => true)
      .catch(() => false);
    const previewExists = await fs
      .access(previewPath)
      .then(() => true)
      .catch(() => false);

    const needsRegeneration =
      !template.thumbnail ||
      !template.preview_image ||
      template.data_hash !== currentHash ||
      !thumbnailExists ||
      !previewExists;

    if (needsRegeneration) {
      console.log(`正在为模板 ${template.name} 生成缩略图和预览图...`);

      try {
        await ensureTemplateDirExists(template.id);

        const html = generateResumeHtml(defaultResume, styleConfig);

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
        const thumbnailOutputPath = path.join(
          __dirname,
          '../uploads/templates',
          template.id,
          'thumbnail.webp'
        );

        console.log(`Generating preview image: ${previewTempPath}`);
        await generatePreviewImage(html, previewTempPath);
        console.log(`Preview image generated successfully`);

        console.log(`Converting to webp: ${previewOutputPath}`);
        const sharp = (await import('sharp')).default;

        await sharp(previewTempPath)
          .resize({ width: 1200, height: 1697, fit: 'cover' })
          .webp({ quality: 90 })
          .toFile(previewOutputPath);
        console.log(`Preview webp generated successfully`);

        console.log(`Generating thumbnail: ${thumbnailOutputPath}`);
        await generateThumbnailFromPreview(
          previewTempPath,
          thumbnailOutputPath
        );
        console.log(`Thumbnail generated successfully`);

        const thumbnailUrl = `/uploads/templates/${template.id}/thumbnail.webp`;
        const previewUrl = `/uploads/templates/${template.id}/preview.webp`;

        await prisma.template.update({
          where: { id: template.id },
          data: {
            thumbnail: thumbnailUrl,
            preview_image: previewUrl,
            data_hash: currentHash,
          },
        });

        result.push({
          ...template,
          thumbnail: thumbnailUrl,
          preview_image: previewUrl,
          schema,
          style_config: styleConfig,
        });

        await fs.unlink(previewTempPath).catch(() => {});
        console.log(`模板 ${template.name} 的缩略图和预览图生成完成`);
      } catch (error) {
        console.error(`生成模板 ${template.name} 的缩略图失败:`, error);
        result.push({
          ...template,
          thumbnail: template.thumbnail || '',
          preview_image: template.preview_image || '',
          schema,
          style_config: styleConfig,
        });
      }
    } else {
      result.push({
        ...template,
        schema,
        style_config: styleConfig,
      });
    }
  }

  return result;
}

export async function generateTemplateImages(
  templateId: string
): Promise<{ thumbnail: string; preview_image: string }> {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error('模板不存在');
  }

  const schema = template.schema as object;
  const styleConfig = template.style_config as object;

  await ensureTemplateDirExists(templateId);

  const html = generateResumeHtml(defaultResume, styleConfig);

  const previewTempPath = path.join(
    __dirname,
    '../uploads/templates',
    templateId,
    'preview.png'
  );
  const previewOutputPath = path.join(
    __dirname,
    '../uploads/templates',
    templateId,
    'preview.webp'
  );
  const thumbnailOutputPath = path.join(
    __dirname,
    '../uploads/templates',
    templateId,
    'thumbnail.webp'
  );

  await generatePreviewImage(html, previewTempPath);
  await generateThumbnailFromPreview(previewTempPath, thumbnailOutputPath);

  const thumbnailUrl = `/uploads/templates/${templateId}/thumbnail.webp`;
  const previewUrl = `/uploads/templates/${templateId}/preview.webp`;

  const currentHash = generateDataHash(schema, styleConfig);

  await prisma.template.update({
    where: { id: templateId },
    data: {
      thumbnail: thumbnailUrl,
      preview_image: previewUrl,
      data_hash: currentHash,
    },
  });

  await fs.unlink(previewTempPath).catch(() => {});

  return { thumbnail: thumbnailUrl, preview_image: previewUrl };
}
