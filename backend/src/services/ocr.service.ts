import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

export interface OCRResult {
  text: string;
  type: 'pdf' | 'image' | 'text';
  fileName: string;
  pageCount?: number;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class OCRService {
  private static tempDir = path.join(__dirname, '../../tmp');

  private static ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public static async extractTextFromPDF(filePath: string): Promise<OCRResult> {
    const dataBuffer = fs.readFileSync(filePath);
    const { PDFParse } = await import('pdf-parse');

    const pdfParser = new PDFParse({ data: dataBuffer });
    const textResult = await pdfParser.getText();

    return {
      text: textResult.text || '',
      type: 'pdf',
      fileName: path.basename(filePath),
      pageCount: textResult.total,
    };
  }

  public static async extractTextFromImage(
    filePath: string
  ): Promise<OCRResult> {
    const tesseract = await import('tesseract.js');
    const worker = await tesseract.createWorker('chi_sim+eng');

    try {
      const {
        data: { text },
      } = await worker.recognize(filePath);

      return {
        text,
        type: 'image',
        fileName: path.basename(filePath),
      };
    } finally {
      await worker.terminate();
    }
  }

  public static async processFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }): Promise<OCRResult> {
    this.ensureTempDir();

    const tempFilePath = path.join(
      this.tempDir,
      `${Date.now()}_${file.originalname}`
    );
    fs.writeFileSync(tempFilePath, file.buffer);

    try {
      const mimeType = file.mimetype.toLowerCase();
      const fileName = file.originalname.toLowerCase();

      if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
        return await this.extractTextFromPDF(tempFilePath);
      } else if (
        mimeType.includes('image') ||
        fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)
      ) {
        return await this.extractTextFromImage(tempFilePath);
      } else if (
        mimeType.includes('markdown') ||
        fileName.endsWith('.md') ||
        mimeType.includes('text') ||
        fileName.endsWith('.txt')
      ) {
        const text = fs.readFileSync(tempFilePath, 'utf-8');
        return {
          text,
          type: 'text',
          fileName: file.originalname,
        };
      } else {
        const text = fs.readFileSync(tempFilePath, 'utf-8');
        return {
          text,
          type: 'text',
          fileName: file.originalname,
        };
      }
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }

  public static async extractResumeContent(text: string): Promise<any> {
    const resumeContent: any = {
      basicInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        bio: '',
      },
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      campusExperiences: [],
      careerObjective: '',
    };

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(?:\+86)?1[3-9]\d{9}/;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);

    if (emailMatch) resumeContent.basicInfo.email = emailMatch[0];
    if (phoneMatch) resumeContent.basicInfo.phone = phoneMatch[0];

    const lines = text.split('\n').filter((line) => line.trim());

    let currentSection: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      if (line.match(/^(教育背景|学历|毕业院校)/i)) {
        currentSection = 'education';
        continue;
      } else if (line.match(/^(工作经历|工作经验|从业经验)/i)) {
        currentSection = 'experience';
        continue;
      } else if (line.match(/^(项目经验|项目经历|项目)/i)) {
        currentSection = 'projects';
        continue;
      } else if (line.match(/^(技能|专业技能|技术栈)/i)) {
        currentSection = 'skills';
        continue;
      } else if (line.match(/^(证书|认证|资质)/i)) {
        currentSection = 'certifications';
        continue;
      } else if (line.match(/^(校园经历|实习经历)/i)) {
        currentSection = 'campusExperiences';
        continue;
      } else if (line.match(/^(职业目标|求职意向)/i)) {
        currentSection = 'careerObjective';
        continue;
      }

      if (
        !resumeContent.basicInfo.name &&
        line.length > 0 &&
        line.length < 20 &&
        !line.includes('@') &&
        !line.match(/^\d/)
      ) {
        resumeContent.basicInfo.name = line;
        if (
          i + 1 < lines.length &&
          lines[i + 1].trim().length > 0 &&
          lines[i + 1].trim().length < 30
        ) {
          resumeContent.basicInfo.title = lines[i + 1].trim();
          i++;
        }
      } else if (currentSection === 'skills') {
        resumeContent.skills.push(line);
      } else if (currentSection === 'careerObjective') {
        resumeContent.careerObjective += line + ' ';
      }
    }

    resumeContent.basicInfo.bio = text.substring(0, Math.min(500, text.length));

    return resumeContent;
  }
}
