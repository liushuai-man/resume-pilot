import { Request, Response } from 'express';
import { OCRService } from '../services/ocr.service';
import { success, error } from '../utils/response';
import { prisma } from '../database/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

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
        fileType,
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
          title: decodedOriginalName,
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
