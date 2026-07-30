import { Request, Response } from 'express';
import { OCRService } from '../services/ocr.service';
import { success, error } from '../utils/response';
import { prisma } from '../database/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

async function createPdfPreview(filePath: string, fileName: string, pageNumber = 1): Promise<string> {
  const previewName = `${path.basename(fileName, path.extname(fileName))}-preview-${pageNumber}`;
  const previewPath = path.join(uploadsDir, `${previewName}.png`);
  if (fs.existsSync(previewPath)) {
    return previewPath;
  }

  const [{ getDocument }, { createCanvas }] = await Promise.all([
    import('pdfjs-dist/legacy/build/pdf.mjs'),
    import('@napi-rs/canvas'),
  ]);
  const document = await getDocument({
    data: new Uint8Array(await fs.promises.readFile(filePath)),
    disableWorker: true,
  } as any).promise;
  try {
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > document.numPages) {
      throw new Error('PDF page does not exist');
    }
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
    await fs.promises.writeFile(previewPath, canvas.toBuffer('image/png'));
  } finally {
    await document.destroy();
  }
  return previewPath;
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const uploadResumeHandler = async (req: Request, res: Response) => {
  const multerModule = await import('multer');
  const multer = (multerModule as any).default || multerModule;
  const upload = multer({
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      const allowedExtensions = [
        '.pdf',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
      ];
      const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf('.'));

      if (
        allowedTypes.includes(file.mimetype) ||
        allowedExtensions.includes(fileExtension)
      ) {
        cb(null, true);
      } else {
        cb(new Error('不支持的文件类型，仅支持PDF和图片格式'));
      }
    },
  });

  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return error(res, err.message, 400);
    }

    const file = (req as any).file;
    if (!file) {
      return error(res, '请选择要上传的文件', 400);
    }

    try {
      let decodedOriginalName = file.originalname;
      try {
        decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString(
          'utf8'
        );
      } catch (e) {
        console.warn('文件名解码失败:', e);
      }

      const fileExtension = decodedOriginalName
        .toLowerCase()
        .substring(decodedOriginalName.lastIndexOf('.'));
      const storedFileName = `${Date.now()}${fileExtension}`;
      const storedFilePath = path.join(uploadsDir, storedFileName);

      fs.writeFileSync(storedFilePath, file.buffer);

      const fileUrl = `/uploads/${storedFileName}`;
      const fileType = fileExtension === '.pdf' ? 'pdf' : 'image';
      let previewUrl: string | undefined;

      if (fileType === 'pdf') {
        try {
          const previewPath = await createPdfPreview(storedFilePath, storedFileName);
          previewUrl = `/uploads/${path.basename(previewPath)}`;
        } catch (previewError) {
          console.warn('PDF preview generation failed:', previewError);
        }
      }

      const resumeTitle =
        decodedOriginalName.replace(fileExtension, '') || '导入简历';
      const fileDisplayName = decodedOriginalName;

      let ocrText = '';
      let pageCount = 1;
      try {
        const ocrResult = await OCRService.processFile(file);
        ocrText = ocrResult.text;
        pageCount = ocrResult.pageCount || 1;
      } catch (ocrError) {
        console.warn('OCR识别失败，使用空文本:', ocrError);
      }

      const resumeContent = {
        isUploadedFile: true,
        fileUrl,
        previewUrl,
        fileType,
        fileName: fileDisplayName,
        ocrText,
        pageCount,
        basicInfo: {},
        education: [],
        experience: [],
        projects: [],
        skills: [],
        certifications: [],
        campusExperiences: [],
        careerObjective: '',
      };

      const userId = (req as any).user?.id;

      const newResume = await prisma.resume.create({
        data: {
          user_id: userId,
          title: resumeTitle,
          content: resumeContent,
          template_id: 'classic-blue',
        },
      });

      return success(
        res,
        {
          resume: newResume,
          ocrText,
          fileInfo: {
            name: file.originalname,
            type: fileType,
            pageCount,
            fileUrl,
            previewUrl,
          },
        },
        '简历导入成功'
      );
    } catch (err) {
      console.error('上传并解析简历失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      return error(res, `上传并解析简历失败: ${errorMessage}`);
    }
  });
};

export const getResumePreviewHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({ where: { id, user_id: userId, is_deleted: false } });
    const content = resume?.content as any;
    if (!resume || !content?.isUploadedFile || content.fileType !== 'pdf') {
      return error(res, '未找到 PDF 简历', 404);
    }
    const storedFileName = path.basename(content.fileUrl);
    const page = Number.parseInt(String(req.query.page ?? '1'), 10);
    const previewPath = await createPdfPreview(
      path.join(uploadsDir, storedFileName),
      storedFileName,
      page
    );
    return res.type('png').sendFile(previewPath);
  } catch (err) {
    console.error('生成 PDF 预览失败:', err);
    return error(res, '生成 PDF 预览失败');
  }
};

export const getResumeFileHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, user_id: userId, is_deleted: false },
    });
    const content = resume?.content as any;
    if (!resume || !content?.isUploadedFile || !content.fileUrl) {
      return error(res, '未找到导入的简历文件', 404);
    }
    const filename = path.basename(content.fileUrl);
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) return error(res, '简历文件不存在', 404);
    return res.sendFile(filePath);
  } catch (err) {
    console.error('读取导入简历失败:', err);
    return error(res, '读取导入简历失败');
  }
};
