import { InterviewDecisionAgent } from './decision.agent';
import { EvaluationAgent } from './evaluation.agent';
import { MemoryAgent } from './memory.agent';
import {
  Question,
  Answer,
  Evaluation,
  LangGraphInterviewState,
  CandidateProfile,
} from '../../types/interview.types';
import { buildInterviewReport } from './report-builder';

export class InterviewSupervisorAgent {
  private decisionAgent: InterviewDecisionAgent;
  private evaluationAgent: EvaluationAgent;
  private memoryAgent: MemoryAgent;

  constructor() {
    this.decisionAgent = new InterviewDecisionAgent();
    this.evaluationAgent = new EvaluationAgent();
    this.memoryAgent = new MemoryAgent();
  }

  async generateNextQuestion(
    state: LangGraphInterviewState
  ): Promise<Question> {
    return this.decisionAgent.generateNextQuestion(state);
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

  updateProfile(profile: CandidateProfile, evaluation: Evaluation): CandidateProfile {
    return this.memoryAgent.updateProfile(profile, evaluation);
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
