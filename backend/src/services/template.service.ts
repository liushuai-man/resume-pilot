import { prisma } from '../database/prisma';
import { generateResumeHtml } from '../utils/resumeToHtml';
import {
  generatePreviewImage,
  generateThumbnailFromPreview,
  ensureTemplateDirExists,
} from './thumbnail.service';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface TemplateWithImages {
  id: string;
  name: string;
  category: string;
  thumbnail: string | null;
  preview_image: string | null;
  schema: any;
  style_config: any;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
}

function getDefaultContent(schema: any): any {
  if (schema?.defaultContent) {
    return schema.defaultContent;
  }
  if (schema?.blocks) {
    return schema;
  }
  return {
    basicInfo: {},
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    campusExperiences: [],
    careerObjective: '',
  };
}

function getLayout(styleConfig: any, schema: any): string {
  return styleConfig?.layout || schema?.layout || 'classic';
}

export async function getTemplatesWithImages(): Promise<TemplateWithImages[]> {
  const templates = await prisma.template.findMany({
    where: { is_deleted: false },
    orderBy: { created_at: 'desc' },
  });

  const result: TemplateWithImages[] = [];

  for (const template of templates) {
    const schema =
      typeof template.schema === 'string'
        ? JSON.parse(template.schema)
        : template.schema;
    const styleConfig =
      typeof template.style_config === 'string'
        ? JSON.parse(template.style_config)
        : template.style_config;

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
      !thumbnailExists ||
      !previewExists;

    if (needsRegeneration) {
      console.log(`正在为模板 ${template.name} 生成缩略图和预览图...`);

      try {
        await ensureTemplateDirExists(template.id);

        const defaultContent = getDefaultContent(schema);
        const layout = getLayout(styleConfig, schema);
        const html = generateResumeHtml(defaultContent, {
          ...styleConfig,
          layout,
        });

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
          .resize({ width: 1200, height: 1697, fit: 'cover', position: 'top' })
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

  const schema =
    typeof template.schema === 'string'
      ? JSON.parse(template.schema)
      : template.schema;
  const styleConfig =
    typeof template.style_config === 'string'
      ? JSON.parse(template.style_config)
      : template.style_config;

  await ensureTemplateDirExists(templateId);

  const defaultContent = getDefaultContent(schema);
  const layout = getLayout(styleConfig, schema);
  const html = generateResumeHtml(defaultContent, {
    ...styleConfig,
    layout,
  });

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

  const sharp = (await import('sharp')).default;
  await sharp(previewTempPath)
    .resize({ width: 1200, height: 1697, fit: 'cover', position: 'top' })
    .webp({ quality: 90 })
    .toFile(previewOutputPath);

  const thumbnailUrl = `/uploads/templates/${templateId}/thumbnail.webp`;
  const previewUrl = `/uploads/templates/${templateId}/preview.webp`;

  await prisma.template.update({
    where: { id: templateId },
    data: {
      thumbnail: thumbnailUrl,
      preview_image: previewUrl,
    },
  });

  await fs.unlink(previewTempPath).catch(() => {});

  return { thumbnail: thumbnailUrl, preview_image: previewUrl };
}
