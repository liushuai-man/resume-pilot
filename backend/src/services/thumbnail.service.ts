import puppeteer, { Browser, Page } from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let browser: Browser | null = null;

export async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

export async function generateThumbnail(
  htmlContent: string,
  outputPath: string
): Promise<string> {
  const browser = await initBrowser();
  const page: Page = await browser.newPage();

  try {
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.setViewport({ width: 800, height: 1067 });

    const screenshot = await page.screenshot({
      path: outputPath,
      type: 'png',
      quality: 80,
    });

    return outputPath;
  } finally {
    await page.close();
  }
}

export async function generateThumbnailFromUrl(
  url: string,
  outputPath: string
): Promise<string> {
  const browser = await initBrowser();
  const page: Page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.setViewport({ width: 800, height: 1067 });

    const screenshot = await page.screenshot({
      path: outputPath,
      type: 'png',
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

export function getThumbnailPath(resumeId: string): string {
  const uploadsDir = path.join(__dirname, '../uploads/thumbnails');
  return path.join(uploadsDir, `${resumeId}.png`);
}

export async function ensureThumbnailDirExists(): Promise<void> {
  const uploadsDir = path.join(__dirname, '../uploads/thumbnails');
  await fs.mkdir(uploadsDir, { recursive: true });
}
