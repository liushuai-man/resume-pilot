import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../../prompts/interview/analyze.prompt';
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
import { buildInterviewReport } from './report-builder';

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
    questions: Question[],
    answers: Answer[],
    evaluations: Evaluation[],
    profile: CandidateProfile,
    rubricSnapshot: LangGraphInterviewState['rubricSnapshot']
  ): Promise<any> {
    return buildInterviewReport(questions, answers, evaluations, rubricSnapshot, profile);
  }
}
