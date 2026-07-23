import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../prompts/interview/analyze.prompt';
import { GENERATE_QUESTIONS_PROMPT } from '../prompts/interview/generate.prompt';
import { EVALUATE_ANSWER_PROMPT } from '../prompts/interview/evaluate.prompt';
import { GENERATE_REPORT_PROMPT } from '../prompts/interview/report.prompt';
import {
  InterviewState,
  Question,
  Answer,
  Evaluation,
} from '../types/interview.types';

export class InterviewAgent {
  /**
   * 清理AI返回的JSON字符串，移除markdown代码块标记
   */
  private cleanJsonString(str: string): string {
    if (!str) return '';

    // 移除markdown代码块标记
    let cleaned = str.trim();

    // 尝试提取JSON数组
    const jsonArrayMatch = cleaned.match(/\[[\s\S]*?\]/);
    if (jsonArrayMatch) {
      try {
        JSON.parse(jsonArrayMatch[0]);
        return jsonArrayMatch[0];
      } catch {
        // 数组不完整，继续尝试其他方法
      }
    }

    // 尝试提取JSON对象
    const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch {
        // 对象不完整，继续尝试其他方法
      }
    }

    // 移除代码块标记
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    cleaned = cleaned.trim();

    // 尝试修复常见JSON格式问题
    // 1. 修复截断的JSON - 找到最后一个完整的位置并截断
    const lastCompleteObject = this.findLastCompleteJson(cleaned);
    if (lastCompleteObject) {
      return lastCompleteObject;
    }

    return cleaned;
  }

  /**
   * 查找最后一个完整的JSON结构
   */
  private findLastCompleteJson(str: string): string | null {
    // 尝试找到最后一个完整的对象或数组
    let braceCount = 0;
    let bracketCount = 0;
    let lastValidEnd = -1;
    let inString = false;
    let escape = false;

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (ch === '{') braceCount++;
      if (ch === '}') {
        braceCount--;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidEnd = i;
        }
      }
      if (ch === '[') bracketCount++;
      if (ch === ']') {
        bracketCount--;
        if (braceCount === 0 && bracketCount === 0) {
          lastValidEnd = i;
        }
      }
    }

    if (lastValidEnd > 0) {
      const candidate = str.substring(0, lastValidEnd + 1);
      try {
        JSON.parse(candidate);
        return candidate;
      } catch {
        // 不是有效JSON
      }
    }

    // 尝试修复截断的JSON：逐步截断到最近的完整元素
    for (let i = str.length - 1; i > 0; i--) {
      const ch = str[i];
      if (ch === ',' || ch === '}' || ch === ']') {
        let candidate = str.substring(0, i + 1);
        // 补全缺失的闭合符号
        const openBraces =
          (candidate.match(/\{/g) || []).length -
          (candidate.match(/\}/g) || []).length;
        const openBrackets =
          (candidate.match(/\[/g) || []).length -
          (candidate.match(/\]/g) || []).length;
        // 去掉末尾可能的截断字符串
        candidate = candidate.replace(/,\s*$/, '');
        for (let j = 0; j < openBrackets; j++) candidate += ']';
        for (let j = 0; j < openBraces; j++) candidate += '}';
        try {
          JSON.parse(candidate);
          return candidate;
        } catch {
          // 继续尝试
        }
      }
    }

    return null;
  }

  /**
   * 分析简历内容
   */
  private async analyzeResume(
    resumeContent: any,
    userId?: string
  ): Promise<{
    sections: { key: string; name: string; description: string }[];
    keySkills: string[];
  }> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 2000,
    });
    const chain = RunnableSequence.from([
      ANALYZE_RESUME_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: JSON.stringify(resumeContent, null, 2),
      });
      console.log('AI返回的简历分析结果:', result);
      const cleanedResult = this.cleanJsonString(result);
      console.log('清理后的JSON:', cleanedResult);

      if (!cleanedResult) {
        console.warn('AI返回了空内容');
        return {
          sections: [],
          keySkills: [],
        };
      }

      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error('简历分析失败:', error);
      return {
        sections: [],
        keySkills: [],
      };
    }
  }

  /**
   * 生成面试问题
   */
  private async generateQuestions(
    resumeContent: any,
    targetPosition: string = '通用岗位',
    count: number = 1,
    qaHistory: { question: string; answer: string; feedback?: string }[] = [],
    userId?: string
  ): Promise<Question[]> {
    const resumeStr = JSON.stringify(resumeContent, null, 2);

    // 格式化问答历史
    let qaHistorySection = '';
    if (qaHistory.length > 0) {
      qaHistorySection =
        '之前的问答历史：\n' +
        qaHistory
          .map(
            (qa, i) =>
              `问题${i + 1}: ${qa.question}\n回答: ${qa.answer}\n${qa.feedback ? `反馈: ${qa.feedback}` : ''}`
          )
          .join('\n\n');
    } else {
      qaHistorySection = '这是面试的开始，还没有问答历史。';
    }

    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 2000,
    });
    const chain = RunnableSequence.from([
      GENERATE_QUESTIONS_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: resumeStr,
        targetPosition,
        count: count.toString(),
        qaHistorySection,
      });

      const cleanedResult = this.cleanJsonString(result);
      console.log('生成问题的AI返回:', cleanedResult);

      const parsed = JSON.parse(cleanedResult);
      const questionsList = Array.isArray(parsed)
        ? parsed
        : parsed.questions || [];
      return questionsList.map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        content: q.content,
        section: 'general',
        sectionKey: 'general',
      }));
    } catch (error) {
      console.error('问题生成失败:', error);
      return [];
    }
  }

  /**
   * 评估回答
   */
  private async evaluateAnswer(
    question: Question,
    answer: string,
    resumeContent: any,
    userId?: string
  ): Promise<Evaluation> {
    const resumeSectionContent = JSON.stringify(
      resumeContent[question.sectionKey] || {},
      null,
      2
    );

    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 1000,
    });
    const chain = RunnableSequence.from([
      EVALUATE_ANSWER_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        question: question.content,
        answer,
        resumeSectionContent,
      });
      const parsed = JSON.parse(this.cleanJsonString(result));
      return {
        questionId: question.id,
        score: parsed.score,
        feedback: parsed.feedback,
      };
    } catch (error) {
      console.error('回答评估失败:', error);
      return {
        questionId: question.id,
        score: 5,
        feedback: '需要改进',
      };
    }
  }

  /**
   * 生成最终报告
   */
  private async generateFinalReport(
    resumeContent: any,
    questions: Question[],
    answers: Answer[],
    evaluations: Evaluation[],
    targetPosition: string = '通用岗位',
    userId?: string
  ): Promise<any> {
    // 找到自我介绍相关的问题和回答
    const introQuestion = questions.find((q) => q.isIntroduction);
    const introAnswer = introQuestion
      ? answers.find((a) => a.questionId === introQuestion.id)
      : null;
    const introEvaluation = introQuestion
      ? evaluations.find((e) => e.questionId === introQuestion.id)
      : null;

    // 构建自我介绍评估部分
    let introductionSection = '';
    if (introQuestion) {
      if (introAnswer && introAnswer.content.trim() !== '跳过') {
        introductionSection = `自我介绍内容：
${introAnswer.content}`;
      } else {
        introductionSection = '候选人选择跳过自我介绍。';
      }
    }

    const qaHistory = questions
      .map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const evaluation = evaluations.find((e) => e.questionId === q.id);
        // 跳过自我介绍，因为已经在introductionSection中处理
        if (q.isIntroduction) return '';
        return `
问题 ${i + 1}: ${q.content}
回答: ${answer?.content || '未回答'}
评分: ${evaluation?.score || 0}
反馈: ${evaluation?.feedback || ''}
`;
      })
      .filter(Boolean)
      .join('\n');

    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 3000,
    });
    const chain = RunnableSequence.from([
      GENERATE_REPORT_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        targetPosition,
        resumeContent: JSON.stringify(resumeContent, null, 2),
        qaHistory,
        introductionSection,
      });
      return JSON.parse(this.cleanJsonString(result));
    } catch (error) {
      console.error('报告生成失败:', error);
      return {
        overallScore: 60,
        introductionEvaluation: '无法生成自我介绍评估',
        strengths: [],
        weaknesses: [],
        suggestions: [],
      };
    }
  }

  /**
   * 开始面试
   */
  async startInterview(
    resumeId: string,
    resumeContent: any,
    targetPosition?: string,
    questionCount?: number,
    userId?: string
  ): Promise<{
    sessionData: InterviewState;
    firstQuestion: Question;
  }> {
    console.log('=== 初始化面试 ===');
    const maxQuestions = questionCount || 5;
    const analysis = await this.analyzeResume(resumeContent, userId);

    // 第一个问题：自我介绍（可跳过）
    const firstQuestion: Question = {
      id: `q-${Date.now()}-intro`,
      content:
        '请简单介绍一下你自己，包括你的教育背景、技术栈和项目经验。（如果不想自我介绍，可以直接说"跳过"）',
      section: 'introduction',
      sectionKey: 'introduction',
      isIntroduction: true,
    };

    const questions = [firstQuestion];

    const sessionData: InterviewState = {
      resumeId,
      resumeContent,
      targetPosition: targetPosition || '通用岗位',
      maxQuestions,
      currentSection: 'introduction',
      questions,
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      isFinished: false,
      userId,
    };

    return {
      sessionData,
      firstQuestion,
    };
  }

  /**
   * 提交回答并获取下一步
   */
  async submitAnswer(
    state: InterviewState,
    answer: string
  ): Promise<{
    feedback: string;
    nextQuestion: Question | null;
    isFinished: boolean;
    report?: any;
  }> {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      content: answer,
    };

    // 处理自我介绍（跳过）
    const isSkipIntro =
      currentQuestion.isIntroduction &&
      (answer.trim() === '跳过' || answer.trim().toLowerCase() === 'skip');

    let evaluateResult: Evaluation;
    if (isSkipIntro) {
      evaluateResult = {
        questionId: currentQuestion.id,
        score: 0,
        feedback: '候选人选择跳过自我介绍',
      };
    } else {
      // 评估回答
      evaluateResult = await this.evaluateAnswer(
        currentQuestion,
        answer,
        state.resumeContent,
        state.userId
      );
    }

    const newEvaluations = [...state.evaluations, evaluateResult];
    // 自我介绍不计入面试题数量
    const newIndex = currentQuestion.isIntroduction
      ? state.currentQuestionIndex
      : state.currentQuestionIndex + 1;
    const isFinished = newIndex >= state.maxQuestions;

    let nextQuestion: Question | null = null;
    let finalReport = null;

    // 构建问答历史（排除跳过的自我介绍）
    const qaHistory = [
      ...state.answers.map((a, i) => ({
        question: state.questions[i]?.content || '',
        answer: a.content,
        feedback: state.evaluations[i]?.feedback,
      })),
      ...(isSkipIntro
        ? []
        : [
            {
              question: currentQuestion.content,
              answer: answer,
              feedback: evaluateResult.feedback,
            },
          ]),
    ];

    if (isFinished) {
      // 生成报告
      finalReport = await this.generateFinalReport(
        state.resumeContent,
        [...state.questions],
        [...state.answers, newAnswer],
        newEvaluations,
        state.targetPosition,
        state.userId
      );
    } else {
      // 基于问答历史生成下一个问题
      const newQuestions = await this.generateQuestions(
        state.resumeContent,
        state.targetPosition,
        1,
        qaHistory,
        state.userId
      );

      if (newQuestions.length > 0) {
        nextQuestion = newQuestions[0];
      } else {
        // 如果没有生成问题，使用默认问题
        nextQuestion = {
          id: `q-${Date.now()}-default`,
          content: '请谈谈你在项目中遇到的最大技术挑战以及你是如何解决的。',
          section: 'general',
          sectionKey: 'general',
        };
      }
    }

    return {
      feedback: evaluateResult.feedback,
      nextQuestion,
      isFinished,
      report: finalReport,
    };
  }
}

export const interviewAgent = new InterviewAgent();
