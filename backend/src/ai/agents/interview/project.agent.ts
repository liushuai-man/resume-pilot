import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { PROJECT_QUESTION_PROMPT } from '../../prompts/interview/project.prompt';
import { Question } from '../../types/interview.types';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

function getResumeText(resumeContent: any): string {
  if (resumeContent.isUploadedFile && resumeContent.ocrText) {
    return `这是通过文件上传的简历，以下是OCR识别的文本内容：\n\n${resumeContent.ocrText}`;
  }
  return JSON.stringify(resumeContent, null, 2);
}

export class ProjectAgent {
  async generateQuestion(
    resumeContent: any,
    targetPosition: string,
    topic: string,
    difficulty: string,
    askedQuestions: string[],
    userId?: string
  ): Promise<Question | null> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      PROJECT_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: getResumeText(resumeContent),
        targetPosition,
        topic,
        difficulty,
        count: '1',
        askedQuestions: askedQuestions.join('\n') || '无',
      });

      const parsed = JSON.parse(cleanJson(result));
      const questions = parsed.questions || [];

      if (questions.length > 0) {
        return {
          id: `q-${Date.now()}-project`,
          content: questions[0].content,
          section: 'projects',
          sectionKey: 'projects',
          type: 'project',
          topic: questions[0].topic || topic,
          difficulty: questions[0].difficulty || difficulty,
          projectName: questions[0].projectName,
        };
      }
      return null;
    } catch (error) {
      console.error('Project Agent 生成问题失败:', error);
      return null;
    }
  }
}
