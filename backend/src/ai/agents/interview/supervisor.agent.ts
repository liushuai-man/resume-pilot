import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../../prompts/interview/analyze.prompt';
import { GENERATE_REPORT_PROMPT } from '../../prompts/interview/report.prompt';
import { NEXT_QUESTION_PROMPT } from '../../prompts/interview/next-question.prompt';
import { StrategyAgent } from './strategy.agent';
import { QuestionPlannerAgent } from './question-planner.agent';
import { TechnicalAgent } from './technical.agent';
import { ProjectAgent } from './project.agent';
import { FollowUpAgent } from './followup.agent';
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
import { getResumeText, getRelevantResumeSection } from './utils';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class InterviewSupervisorAgent {
  private strategyAgent: StrategyAgent;
  private questionPlannerAgent: QuestionPlannerAgent;
  private technicalAgent: TechnicalAgent;
  private projectAgent: ProjectAgent;
  private followUpAgent: FollowUpAgent;
  private evaluationAgent: EvaluationAgent;
  private memoryAgent: MemoryAgent;

  constructor() {
    this.strategyAgent = new StrategyAgent();
    this.questionPlannerAgent = new QuestionPlannerAgent();
    this.technicalAgent = new TechnicalAgent();
    this.projectAgent = new ProjectAgent();
    this.followUpAgent = new FollowUpAgent();
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
    return this.strategyAgent.generatePlan(
      resumeContent,
      targetPosition,
      userId
    );
  }

  async generateNextQuestion(
    state: LangGraphInterviewState
  ): Promise<Question> {
    const llm = await createUserLLM(state.userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      NEXT_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const qaHistory = state.questions
      .map((q, i) => {
        const answer = state.answers[i];
        const evaluation = state.evaluations[i];
        if (!answer) return '';
        const score = evaluation?.score || 0;
        return `问题${i + 1}: ${q.content}\n回答: ${answer.content}\n评分: ${score}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const currentProgress = Math.round(
      (state.currentQuestionIndex / state.maxQuestions) * 100
    );

    try {
      const result = await chain.invoke({
        targetPosition: state.targetPosition,
        resumeContent: state.resumeText,
        currentProgress: currentProgress.toString(),
        candidateProfile: JSON.stringify(state.profile, null, 2),
        interviewPlan: JSON.stringify(state.interviewPlan, null, 2),
        qaHistory: qaHistory || '暂无问答记录',
      });

      const parsed = JSON.parse(cleanJson(result));

      return {
        id: `q-${Date.now()}-${parsed.type || 'technical'}`,
        content: parsed.question,
        section:
          parsed.type === 'project'
            ? 'projects'
            : parsed.type === 'followup'
              ? state.questions[state.questions.length - 1]?.section ||
                'general'
              : 'skills',
        sectionKey:
          parsed.type === 'project'
            ? 'projects'
            : parsed.type === 'followup'
              ? state.questions[state.questions.length - 1]?.sectionKey ||
                'general'
              : 'skills',
        type: parsed.type || 'technical',
        topic: parsed.topic || '综合技术',
        difficulty: parsed.difficulty || 'medium',
        projectName: parsed.projectName || '',
      };
    } catch (error) {
      console.error('生成下一题失败:', error);
      return {
        id: `q-${Date.now()}-default`,
        content: '请谈谈你在工作中遇到的最大技术挑战以及你是如何解决的。',
        section: 'general',
        sectionKey: 'general',
        type: 'technical',
        topic: '综合技术',
        difficulty: 'medium',
      };
    }
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
      return {
        overallScore: 60,
        introductionEvaluation: '无法生成自我介绍评估',
        strengths: ['完成了面试流程'],
        weaknesses: ['部分问题回答需要改进'],
        suggestions: ['建议回顾面试中的问题，加强薄弱环节'],
        candidateProfile: profile,
      };
    }
  }
}
