import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../../prompts/interview/analyze.prompt';
import { GENERATE_REPORT_PROMPT } from '../../prompts/interview/report.prompt';
import { InterviewDecisionAgent } from './decision.agent';
import { EvaluationAgent } from './evaluation.agent';
import { MemoryAgent } from './memory.agent';
import {
  Question,
  Answer,
  Evaluation,
  LangGraphInterviewState,
  CandidateProfile,
  InterviewPlanItem,
} from '../../types/interview.types';
import { getResumeText } from './utils';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class InterviewSupervisorAgent {
  private decisionAgent: InterviewDecisionAgent;
  private evaluationAgent: EvaluationAgent;
  private memoryAgent: MemoryAgent;

  constructor() {
    this.decisionAgent = new InterviewDecisionAgent();
    this.evaluationAgent = new EvaluationAgent();
    this.memoryAgent = new MemoryAgent();
  }

  async analyzeResume(
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

    const resumeText = getResumeText(resumeContent);

    try {
      const result = await chain.invoke({
        resumeContent: resumeText,
      });
      return JSON.parse(cleanJson(result));
    } catch (error) {
      console.error('简历分析失败:', error);
      return { sections: [], keySkills: [] };
    }
  }

  async generateInterviewPlan(
    resumeContent: any,
    targetPosition: string,
    userId?: string
  ): Promise<InterviewPlanItem[]> {
    return this.decisionAgent.generateInterviewPlan(
      resumeContent,
      targetPosition,
      userId
    );
  }

  async generateNextQuestion(
    state: LangGraphInterviewState
  ): Promise<Question> {
    return this.decisionAgent.generateNextQuestion(state);
  }

  async evaluateAnswer(
    question: Question,
    answer: string,
    resumeText: string,
    targetPosition: string,
    profile: CandidateProfile,
    userId?: string
  ): Promise<{ evaluation: Evaluation; updatedProfile: CandidateProfile }> {
    const evaluation = await this.evaluationAgent.evaluate(
      question,
      answer,
      resumeText,
      targetPosition,
      userId
    );

    const updatedProfile = this.memoryAgent.updateProfile(profile, evaluation);

    return { evaluation, updatedProfile };
  }

  async evaluateInterview(
    questions: Question[], answers: Answer[], resumeText: string,
    targetPosition: string, rubricSnapshot: unknown, userId?: string
  ): Promise<{ evaluations: Evaluation[]; profile: CandidateProfile }> {
    const evaluations = await this.evaluationAgent.evaluateBatch(
      questions, answers, resumeText, targetPosition, rubricSnapshot, userId
    );
    let profile: CandidateProfile = { skills: {}, overallLevel: 0 };
    for (const evaluation of evaluations) profile = this.memoryAgent.updateProfile(profile, evaluation);
    return { evaluations, profile };
  }

  async generateReport(
    resumeText: string,
    questions: Question[],
    answers: Answer[],
    evaluations: Evaluation[],
    targetPosition: string,
    profile: CandidateProfile,
    userId?: string
  ): Promise<any> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 3000,
    });

    const chain = RunnableSequence.from([
      GENERATE_REPORT_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const qaHistory = questions
      .map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const evaluation = evaluations.find((e) => e.questionId === q.id);
        if (q.isIntroduction) return '';
        const strengths = evaluation?.strengths?.join(', ') || '无';
        const weaknesses = evaluation?.weaknesses?.join(', ') || '无';
        return `问题 ${i + 1}: ${q.content}\n回答: ${answer?.content || '未回答'}\n评分: ${evaluation?.score || 0}\n反馈: ${evaluation?.feedback || ''}\n优点: ${strengths}\n不足: ${weaknesses}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const introQuestion = questions.find((q) => q.isIntroduction);
    const introAnswer = introQuestion
      ? answers.find((a) => a.questionId === introQuestion.id)
      : null;
    let introductionSection =
      introQuestion && introAnswer
        ? `自我介绍内容：\n${introAnswer.content}`
        : '候选人选择跳过自我介绍。';

    const profileSection = `\n候选人能力画像：\n${JSON.stringify(profile, null, 2)}`;

    try {
      const result = await chain.invoke({
        targetPosition,
        resumeContent: resumeText,
        qaHistory,
        introductionSection,
        profileSection,
      });

      const report = JSON.parse(cleanJson(result));

      report.overallScore = report.overallScore || 60;
      report.strengths =
        report.strengths && report.strengths.length > 0
          ? report.strengths
          : ['回答问题思路清晰'];
      report.weaknesses =
        report.weaknesses && report.weaknesses.length > 0
          ? report.weaknesses
          : ['部分技术细节需要深入理解'];
      report.suggestions =
        report.suggestions && report.suggestions.length > 0
          ? report.suggestions
          : ['建议加强相关技术领域的学习'];

      report.candidateProfile = profile;
      return report;
    } catch (error) {
      console.error('报告生成失败:', error);
      throw new Error('INTERVIEW_REPORT_GENERATION_FAILED', { cause: error });
    }
  }
}
