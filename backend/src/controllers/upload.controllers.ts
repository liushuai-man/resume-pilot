import { Request, Response } from 'express';
import { OCRService } from '../services/ocr.service';
import { success, error } from '../utils/response';
import { prisma } from '../database/prisma';

export const uploadResumeHandler = async (req: Request, res: Response) => {
  const multer = await import('multer');
  const upload = multer.default({
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
        'text/markdown',
        'text/plain',
        'application/octet-stream',
      ];

      const allowedExtensions = [
        '.pdf',
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.md',
        '.txt',
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
        cb(new Error('不支持的文件类型，仅支持PDF、图片和Markdown格式'));
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
      const ocrResult = await OCRService.processFile(file);
      const resumeContent = await OCRService.extractResumeContent(
        ocrResult.text
      );

      const userId = (req as any).user?.id;

      const newResume = await prisma.resume.create({
        data: {
          user_id: userId,
          title: `导入简历 - ${ocrResult.fileName}`,
          content: resumeContent,
          template_id: 'classic-blue',
        },
      });

      return success(
        res,
        {
          resume: newResume,
          ocrText: ocrResult.text,
          fileInfo: {
            name: ocrResult.fileName,
            type: ocrResult.type,
            pageCount: ocrResult.pageCount,
          },
        },
        '简历导入成功'
      );
    } catch (err) {
      console.error('上传并解析简历失败:', err);
      return error(res, '上传并解析简历失败');
    }
  });
};
