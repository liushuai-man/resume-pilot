import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let browser: Browser | null = null;

// 预览图尺寸 (A4比例: 210:297)
const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 1697;

// 缩略图尺寸
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 424;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export async function generatePreviewImage(
  htmlContent: string,
  outputPath: string
): Promise<string> {
  const browser = await initBrowser();
  const page: Page = await browser.newPage();

  try {
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.setViewport({ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT });
    await delay(1000);

    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: true,
    });

    return outputPath;
  } finally {
    await page.close();
  }
}

export async function generatePreviewImageFromUrl(
  url: string,
  outputPath: string
): Promise<string> {
  const browser = await initBrowser();
  const page: Page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.setViewport({ width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT });
    await delay(1000);

    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: true,
    });

    return outputPath;
  } finally {
    await page.close();
  }
}

export async function generateThumbnailFromPreview(
  previewPath: string,
  outputPath: string
): Promise<string> {
  const sharp = (await import('sharp')).default;
  await sharp(previewPath)
    .resize({
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      fit: 'cover',
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}

export async function generateThumbnail(
  htmlContent: string,
  outputPath: string
): Promise<string> {
  const browser = await initBrowser();
  const page: Page = await browser.newPage();

  try {
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.setViewport({
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
    });
    await delay(1000);

    await page.screenshot({
      path: outputPath,
      type: 'png',
      fullPage: true,
      quality: 80,
    });

    return outputPath;
  } finally {
    await page.close();
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function getPreviewPath(templateId: string): string {
  const uploadsDir = path.join(__dirname, '../uploads/templates');
  return path.join(uploadsDir, `${templateId}/preview.webp`);
}

export function getThumbnailPath(templateId: string): string {
  const uploadsDir = path.join(__dirname, '../uploads/templates');
  return path.join(uploadsDir, `${templateId}/thumbnail.webp`);
}

export async function ensureTemplateDirExists(
  templateId: string
): Promise<void> {
  const templateDir = path.join(__dirname, '../uploads/templates', templateId);
  await fs.mkdir(templateDir, { recursive: true });
}

export async function ensureThumbnailDirExists(): Promise<void> {
  const uploadsDir = path.join(__dirname, '../uploads/thumbnails');
  await fs.mkdir(uploadsDir, { recursive: true });
}
