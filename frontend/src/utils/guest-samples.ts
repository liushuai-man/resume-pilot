import type { Answer, InterviewResult, Question } from '@/api/interview.api';
import type { AtsAnalysisResult, JobDescription, JobMatchAnalysis, JobProfile } from '@/types/job';
import type { ContentQualityAnalysis } from '@/types/content-quality';
import type { Resume } from '@/types/resume';
import { defaultResumeContent } from './defaultResumeContent';

const now = '2026-08-26T08:00:00.000Z';

export const guestSampleResume: Resume = {
  id: 'guest-sample-resume', user_id: 'guest', template_id: 'classic-blue', title: '示例 · 系统集成工程师简历',
  content: defaultResumeContent, created_at: now, updated_at: now, is_deleted: false,
};

export const guestSampleProfile: JobProfile = {
  id: 'guest-sample-profile', jobDescriptionId: 'guest-sample-job', version: 1, status: 'confirmed',
  jobTitle: '系统集成工程师', seniority: '1–3 年', industry: '企业数字化',
  responsibilities: [
    { name: '参与系统集成方案设计与实施', evidence: '负责企业信息系统的部署、集成和交付', confidence: 0.96 },
    { name: '输出技术方案与交付文档', evidence: '编写实施方案、测试报告和用户手册', confidence: 0.94 },
  ],
  requiredSkills: [
    { name: 'Linux 与网络基础', evidence: '熟悉 Linux、TCP/IP 及常见网络排障', confidence: 0.97 },
    { name: 'Docker 容器化', evidence: '能够使用 Docker 完成应用部署', confidence: 0.95 },
  ],
  preferredSkills: [{ name: 'Kubernetes', evidence: '了解 Kubernetes 基础资源及运维', confidence: 0.9 }],
  keywords: ['Linux', 'Docker', '系统集成', '网络排障', '技术文档'], confidence: 0.95,
  parserVersion: 'guest-sample-v1', promptVersion: 'guest-sample-v1', modelName: '示例分析', confirmedAt: now,
  createdAt: now, updatedAt: now,
};

export const guestSampleJob: JobDescription = {
  id: 'guest-sample-job', title: '系统集成工程师', company: '云帆数字科技',
  rawText: '负责企业信息系统的部署、集成和交付；参与系统集成方案设计，编写实施方案、测试报告和用户手册；熟悉 Linux、TCP/IP、Docker 及常见网络排障，了解 Kubernetes 者优先。',
  createdAt: now, updatedAt: now, latestProfile: guestSampleProfile,
};

export const guestInterviewQuestions: Question[] = [
  { id: 'guest-q1', content: '请用两分钟介绍你自己，并说明为什么想从事系统集成工作。', section: '基本信息', sectionKey: 'basicInfo', isIntroduction: true, dimensionKeys: ['communication'] },
  { id: 'guest-q2', content: '请选择一个你参与过的系统集成项目，说明目标、你的职责以及最终结果。', section: '项目经历', sectionKey: 'projects', dimensionKeys: ['project', 'problem_solving'] },
  { id: 'guest-q3', content: '如果部署后服务无法访问，你会按照什么顺序定位网络和应用问题？', section: '专业技能', sectionKey: 'skills', dimensionKeys: ['technical', 'problem_solving'] },
];

export function createGuestAtsResult(resume: Resume, jobId: string): AtsAnalysisResult {
  return {
    jobDescriptionId: jobId, resumeId: resume.id, resumeTitle: resume.title, resumeUpdatedAt: resume.updated_at,
    score: 82, maxScore: 100, scorerVersion: 'guest-local-rules-v1', analyzedAt: new Date().toISOString(),
    summary: { errors: 0, warnings: 1, suggestions: 1 },
    dimensions: [
      { key: 'parseability', label: '机器可读性', score: 20, maxScore: 20 },
      { key: 'basic', label: '基本信息', score: 18, maxScore: 20 },
      { key: 'evidence', label: '成果证据', score: 24, maxScore: 35 },
      { key: 'skills', label: '技能结构', score: 20, maxScore: 25 },
    ],
    issues: [
      { id: 'guest-ats-1', category: 'evidence', severity: 'warning', section: 'projects', itemId: resume.content.projects[0]?.id || null, field: 'achievements', title: '项目结果缺少量化证据', message: '补充规模、效率或质量变化，能让贡献更容易验证。', availablePoints: 8 },
      { id: 'guest-ats-2', category: 'expression', severity: 'suggestion', section: 'basic', itemId: null, field: 'bio', title: '个人总结可以更聚焦目标岗位', message: '优先展示与系统集成、部署和排障相关的证据。', availablePoints: 4 },
    ],
    limitations: ['这是本地确定性体验结果，不代表招聘平台官方通过率。', '内容事实仍需由用户确认。'],
  };
}

export function createGuestQualityResult(resume: Resume): ContentQualityAnalysis {
  return {
    id: 'guest-quality-1', resumeId: resume.id, resumeUpdatedAt: resume.updated_at, score: 78, overallConfidence: 0.86,
    modelName: '游客本地示例评价', promptVersion: 'guest-v1', evaluatorVersion: 'guest-v1', createdAt: new Date().toISOString(), stale: false,
    dimensions: [
      { key: 'coherence', score: 17, maxScore: 20, confidence: 0.9, reason: '整体结构连贯。' },
      { key: 'informationValue', score: 15, maxScore: 20, confidence: 0.86, reason: '包含职责信息，结果信息仍可增加。' },
      { key: 'evidenceSpecificity', score: 12, maxScore: 20, confidence: 0.84, reason: '部分描述缺少规模和结果。' },
      { key: 'consistency', score: 17, maxScore: 20, confidence: 0.88, reason: '时间与岗位方向基本一致。' },
      { key: 'professionalism', score: 17, maxScore: 20, confidence: 0.9, reason: '用语专业，少量表达可进一步压缩。' },
    ],
    issues: [{ fieldId: 'projects.0.achievements', section: 'projects', itemId: resume.content.projects[0]?.id || null, field: 'achievements', evidence: resume.content.projects[0]?.achievements?.[0] || '参与项目实施', dimension: 'evidenceSpecificity', severity: 'warning', reason: '描述了行动，但没有说明影响。', suggestion: '补充项目规模、交付周期和你带来的具体变化。', confidence: 0.88, status: 'confirmed' }],
  };
}

export function createGuestMatchResult(resume: Resume, job: JobDescription, profile: JobProfile): JobMatchAnalysis {
  return {
    id: 'guest-match-1', jobDescriptionId: job.id, jobProfileId: profile.id, jobProfileVersion: profile.version,
    resumeId: resume.id, resumeUpdatedAt: resume.updated_at, score: 76, overallConfidence: 0.87,
    modelName: '游客本地示例评价', promptVersion: 'guest-v1', evaluatorVersion: 'guest-v1', createdAt: new Date().toISOString(), stale: false,
    dimensions: [
      { key: 'requiredSkills', score: 30, maxScore: 40, confidence: 0.9, reason: 'Docker 与系统集成能力有明确证据。' },
      { key: 'responsibilities', score: 27, maxScore: 35, confidence: 0.86, reason: '项目职责相关，但交付结果可更具体。' },
      { key: 'preferredSkills', score: 19, maxScore: 25, confidence: 0.84, reason: '包含 Kubernetes 基础经验。' },
    ],
    requirements: profile.requiredSkills.map((requirement, index) => ({
      requirementId: `guest-requirement-${index}`, category: 'required_skill', requirementName: requirement.name,
      jdEvidence: requirement.evidence, status: index === 0 ? 'matched' : 'insufficient_evidence',
      resumeFieldId: index === 0 ? 'skills.0.name' : 'projects.0.achievements',
      resumeEvidence: index === 0 ? resume.content.skills[0]?.name || null : resume.content.projects[0]?.achievements?.[0] || null,
      reason: index === 0 ? '简历中存在直接技能证据。' : '提到了相关技术，但缺少实际使用场景和结果。', confidence: 0.88,
      section: index === 0 ? 'skills' : 'projects', itemId: index === 0 ? resume.content.skills[0]?.id || null : resume.content.projects[0]?.id || null,
      field: index === 0 ? 'name' : 'achievements',
    })),
  };
}

export function createGuestInterviewReport(sessionId: string, resumeId: string, position: string, questions: Question[], answers: Answer[]): InterviewResult {
  const answered = answers.filter((answer) => answer.content.trim().length > 0);
  const averageLength = answered.length ? answered.reduce((total, answer) => total + answer.content.trim().length, 0) / answered.length : 0;
  const completeness = Math.min(100, Math.round((answered.length / Math.max(1, questions.length)) * 100));
  const depth = Math.min(90, 55 + Math.round(averageLength / 8));
  const overallScore = Math.round(completeness * 0.55 + depth * 0.45);
  const timestamp = new Date().toISOString();
  return {
    id: `guest-result-${sessionId}`, user_id: 'guest', resume_id: resumeId, position, score: overallScore,
    status: 'completed', created_at: timestamp, updated_at: timestamp, completed_at: timestamp,
    report: {
      overallScore,
      introductionEvaluation: '能够围绕目标岗位组织信息；继续补充具体结果会更有说服力。',
      strengths: ['回答结构清楚，能够围绕问题展开', '具备基本的项目与排障意识'],
      weaknesses: averageLength < 80 ? ['案例细节和量化结果仍可补充'] : ['可以进一步突出个人决策与复盘'],
      suggestions: ['使用“背景—行动—结果—复盘”组织项目回答', '为关键成果补充时间、规模或效率数据'],
      dimensionScores: [
        { key: 'technical', label: '技术深度', score: depth, weight: 0.3, questionCount: answered.length },
        { key: 'project', label: '项目阐述', score: completeness, weight: 0.3, questionCount: answered.length },
        { key: 'communication', label: '表达沟通', score: Math.min(92, 62 + Math.round(averageLength / 10)), weight: 0.2, questionCount: answered.length },
        { key: 'problem_solving', label: '问题解决', score: depth, weight: 0.2, questionCount: answered.length },
      ],
      questionEvaluations: questions.map((question) => ({
        questionId: question.id, score: answers.some((answer) => answer.questionId === question.id) ? overallScore : 0,
        feedback: '已记录本次回答，可继续用更具体的情境和结果完善。', strengths: ['回答切题'],
        weaknesses: ['建议补充可验证细节'], followUpSuggestion: '补充你采取该行动的原因和最终影响。',
      })),
      reportVersion: 'guest-local-v1', rubricVersion: 'guest-general-v1',
    },
  };
}
