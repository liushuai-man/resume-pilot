export const ATS_SCORER_VERSION = 'ats-rules-v3-additive';

export type AtsIssueSeverity = 'error' | 'warning' | 'suggestion';
export type AtsCategory =
  | 'parseability'
  | 'basic'
  | 'education'
  | 'evidence'
  | 'skills'
  | 'expression';

export interface AtsIssue {
  id: string;
  category: AtsCategory;
  severity: AtsIssueSeverity;
  section: string;
  itemId: string | null;
  field: string;
  title: string;
  message: string;
  availablePoints: number;
}

export interface AtsDimension {
  key: AtsCategory;
  label: string;
  score: number;
  maxScore: number;
}

export interface AtsAnalysisResult {
  score: number;
  maxScore: 100;
  scorerVersion: string;
  analyzedAt: string;
  summary: { errors: number; warnings: number; suggestions: number };
  dimensions: AtsDimension[];
  issues: AtsIssue[];
  limitations: string[];
}

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';
const list = (value: unknown): any[] => (Array.isArray(value) ? value : []);
const compactLength = (value: string) =>
  value.replace(/\s|[，。；：、,.!?！？:;()（）【】\[\]]/g, '').length;

function normalizeContent(input: unknown): any {
  let value = input;
  for (let count = 0; count < 2 && typeof value === 'string'; count += 1) {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === 'object' ? value : {};
}

function itemDescription(item: any): string {
  const description = Array.isArray(item?.description)
    ? item.description.join(' ')
    : text(item?.description);
  return [description, ...list(item?.achievements).map(text)]
    .filter(Boolean)
    .join(' ');
}

function looksLikeNoise(value: unknown): boolean {
  const source = text(value);
  const compact = source.replace(/\s/g, '');
  if (!compact) return false;
  if (/(.)\1{3,}/u.test(compact)) return true;
  if (
    /(asdf|qwer|zxcv|testtest|测试测试|随便写|乱写|不知道|占位)/i.test(compact)
  )
    return true;
  if (compact.length >= 8 && new Set([...compact]).size / compact.length < 0.28)
    return true;
  const meaningful = [...compact].filter((char) =>
    /[\p{Script=Han}a-zA-Z0-9，。；：、,.!?！？:;()（）%％+/#-]/u.test(char)
  ).length;
  return meaningful / compact.length < 0.8;
}

export function analyzeResumeForAts(input: unknown): AtsAnalysisResult {
  const content = normalizeContent(input);
  const blocks = list(content.blocks);
  const byType = (type: string) =>
    blocks.find((block) => block?.type === type)?.data;
  const profile = byType('basic') || content.basicInfo || {};
  const objectiveData = byType('objective');
  const objective = text(
    typeof objectiveData === 'string'
      ? objectiveData
      : objectiveData?.objective ||
          objectiveData?.content ||
          content.careerObjective
  );
  const education = list(byType('education') || content.education);
  const experiences = list(byType('experience') || content.experience);
  const projects = list(
    byType('projects') || byType('project') || content.projects
  );
  const skills = list(byType('skills') || byType('skill') || content.skills);
  const datedItems = [
    ...experiences.map((item) => ({ ...item, section: 'experience' })),
    ...projects.map((item) => ({ ...item, section: 'projects' })),
  ];
  const issues: AtsIssue[] = [];
  const scores: Record<AtsCategory, number> = {
    parseability: 0,
    basic: 0,
    education: 0,
    evidence: 0,
    skills: 0,
    expression: 0,
  };

  const award = (category: AtsCategory, points: number) => {
    scores[category] += points;
  };
  const miss = (issue: Omit<AtsIssue, 'id'>) =>
    issues.push({
      ...issue,
      id: `${issue.section}:${issue.itemId || 'root'}:${issue.field}:${issue.title}`,
    });

  if (blocks.length > 0 || content.basicInfo) award('parseability', 15);
  else
    miss({
      category: 'parseability',
      severity: 'error',
      section: 'resume',
      itemId: null,
      field: 'content',
      title: '简历内容无法结构化解析',
      message: '请使用在线编辑器创建简历，或重新确认导入后的结构化内容。',
      availablePoints: 15,
    });

  if (text(profile.name)) award('basic', 5);
  else
    miss({
      category: 'basic',
      severity: 'error',
      section: 'basic',
      itemId: null,
      field: 'name',
      title: '填写姓名',
      message: 'ATS 需要识别候选人身份。',
      availablePoints: 5,
    });
  if (text(profile.email) || text(profile.phone)) award('basic', 5);
  else
    miss({
      category: 'basic',
      severity: 'error',
      section: 'basic',
      itemId: null,
      field: 'email',
      title: '填写联系方式',
      message: '至少填写邮箱或手机号中的一项。',
      availablePoints: 5,
    });
  const summary = text(profile.summary || profile.bio);
  const summaryLength = compactLength(summary);
  if (looksLikeNoise(summary))
    miss({
      category: 'basic',
      severity: 'error',
      section: 'basic',
      itemId: null,
      field: 'summary',
      title: '个人概述疑似无意义文本',
      message:
        '检测到明显重复、占位词或乱码。请改为连贯的求职信息；结构体检不会把字符数量当作内容质量。',
      availablePoints: 5,
    });
  else if (summaryLength >= 40) award('basic', 5);
  else if (summaryLength >= 15) {
    award('basic', 3);
    miss({
      category: 'basic',
      severity: 'suggestion',
      section: 'basic',
      itemId: null,
      field: 'summary',
      title: '让个人概述更具体',
      message: '补充经验年限、方向和核心优势后可获得剩余分数。',
      availablePoints: 2,
    });
  } else
    miss({
      category: 'basic',
      severity: 'warning',
      section: 'basic',
      itemId: null,
      field: 'summary',
      title: '补充个人概述',
      message: '用 2–4 句话概括经验、方向与核心优势。',
      availablePoints: 5,
    });

  if (education.length > 0) {
    award('education', 4);
    const complete = education.filter(
      (item) =>
        text(item.school) &&
        text(item.major) &&
        text(item.degree) &&
        text(item.startDate) &&
        text(item.endDate) &&
        !looksLikeNoise(item.school) &&
        !looksLikeNoise(item.major)
    ).length;
    const detailPoints = Math.round((6 * complete) / education.length);
    award('education', detailPoints);
    if (detailPoints < 6)
      miss({
        category: 'education',
        severity: 'warning',
        section: 'education',
        itemId: null,
        field: 'data',
        title: '完善教育经历字段',
        message: '补全学校、专业、学历和起止时间。',
        availablePoints: 6 - detailPoints,
      });
    education.forEach((item, index) => {
      if (looksLikeNoise(item.school) || looksLikeNoise(item.major))
        miss({
          category: 'education',
          severity: 'error',
          section: 'education',
          itemId: text(item.id) || String(index),
          field: looksLikeNoise(item.school) ? 'school' : 'major',
          title: '教育信息疑似无意义文本',
          message:
            '学校或专业包含明显重复、占位词或乱码，不能作为有效教育信息。',
          availablePoints: 0,
        });
    });
  } else
    miss({
      category: 'education',
      severity: 'warning',
      section: 'education',
      itemId: null,
      field: 'data',
      title: '补充教育经历',
      message: '填写学校、专业、学历和就读时间。',
      availablePoints: 10,
    });

  if (datedItems.length > 0) {
    award('evidence', 5);
    const completeItems = datedItems.filter((item) => {
      const identity =
        item.section === 'experience'
          ? text(item.company) && text(item.position)
          : text(item.name) && text(item.role);
      return identity && text(item.startDate) && text(item.endDate);
    }).length;
    const structurePoints = Math.round((8 * completeItems) / datedItems.length);
    award('evidence', structurePoints);
    if (structurePoints < 8)
      miss({
        category: 'evidence',
        severity: 'warning',
        section: experiences.length ? 'experience' : 'projects',
        itemId: null,
        field: 'data',
        title: '完善经历基本字段',
        message: '补全组织或项目名称、角色和起止时间。',
        availablePoints: 8 - structurePoints,
      });

    const detailedItems = datedItems.filter(
      (item) => compactLength(itemDescription(item)) >= 50
    ).length;
    const detailPoints = Math.round((12 * detailedItems) / datedItems.length);
    award('evidence', detailPoints);
    if (detailPoints < 12)
      miss({
        category: 'evidence',
        severity: 'warning',
        section: experiences.length ? 'experience' : 'projects',
        itemId: null,
        field: 'description',
        title: '补充经历证据',
        message: '每段经历说明具体任务、采取的行动和产生的结果。',
        availablePoints: 12 - detailPoints,
      });

    const evidenceText = datedItems.map(itemDescription).join(' ');
    const quantified =
      /[0-9０-９]+(?:\.[0-9０-９]+)?\s*(?:%|％|个|人|次|项|万|千|小时|天|周|月|年)/.test(
        evidenceText
      );
    if (quantified) award('evidence', 5);
    else
      miss({
        category: 'evidence',
        severity: 'suggestion',
        section: experiences.length ? 'experience' : 'projects',
        itemId: null,
        field: 'description',
        title: '补充可验证结果',
        message: '在事实允许的前提下补充规模、效率、数量或结果数据。',
        availablePoints: 5,
      });

    const breadth = Math.min(
      5,
      Math.max(0, datedItems.length - 1) * 2 +
        (experiences.length > 0 && projects.length > 0 ? 1 : 0)
    );
    award('evidence', breadth);
    if (breadth < 5)
      miss({
        category: 'evidence',
        severity: 'suggestion',
        section: projects.length ? 'projects' : 'experience',
        itemId: null,
        field: 'data',
        title: '增加经历覆盖面',
        message: '在真实经历范围内补充更多能证明能力的工作或项目案例。',
        availablePoints: 5 - breadth,
      });
  } else
    miss({
      category: 'evidence',
      severity: 'error',
      section: 'experience',
      itemId: null,
      field: 'data',
      title: '补充工作或项目经历',
      message: '有效经历是简历获得分数的主要依据。',
      availablePoints: 35,
    });

  const validSkills = skills.filter(
    (skill) => !looksLikeNoise(typeof skill === 'string' ? skill : skill?.name)
  );
  const skillText = validSkills
    .map((skill) =>
      typeof skill === 'string'
        ? skill
        : [text(skill?.category), text(skill?.name)].filter(Boolean).join(' ')
    )
    .join(' ');
  if (validSkills.length > 0) {
    award('skills', 3);
    const countPoints = Math.min(3, validSkills.length);
    award('skills', countPoints);
    const detailPoints =
      compactLength(skillText) >= 100
        ? 4
        : compactLength(skillText) >= 50
          ? 3
          : compactLength(skillText) >= 20
            ? 2
            : 0;
    award('skills', detailPoints);
    if (countPoints + detailPoints < 7)
      miss({
        category: 'skills',
        severity: 'warning',
        section: 'skills',
        itemId: null,
        field: 'data',
        title: '丰富专业技能证据',
        message: '按类别说明技能、使用场景和实际能力，避免只罗列名词。',
        availablePoints: 7 - countPoints - detailPoints,
      });
  } else
    miss({
      category: 'skills',
      severity: 'warning',
      section: 'skills',
      itemId: null,
      field: 'data',
      title: '补充专业技能',
      message: '按类别填写与求职方向有关的技能描述。',
      availablePoints: 10,
    });
  skills.forEach((skill, index) => {
    if (looksLikeNoise(typeof skill === 'string' ? skill : skill?.name))
      miss({
        category: 'skills',
        severity: 'error',
        section: 'skills',
        itemId: text(skill?.id) || String(index),
        field: 'name',
        title: '专业技能疑似无意义文本',
        message: '检测到明显重复、占位词或乱码，该条技能不参与得分。',
        availablePoints: 0,
      });
  });

  if (objective && looksLikeNoise(objective))
    miss({
      category: 'expression',
      severity: 'error',
      section: 'objective',
      itemId: null,
      field: 'content',
      title: '职业目标疑似无意义文本',
      message:
        '职业目标包含明显重复、占位词或乱码，请改为连贯的岗位方向和发展目标。',
      availablePoints: 0,
    });

  const evidenceText = datedItems.map(itemDescription).join(' ');
  const totalEvidenceLength = compactLength(
    [
      text(profile.summary || profile.bio),
      evidenceText,
      skillText,
      ...education.map((item) => text(item?.description)),
    ].join(' ')
  );
  const densityPoints =
    totalEvidenceLength >= 260
      ? 8
      : totalEvidenceLength >= 160
        ? 6
        : totalEvidenceLength >= 80
          ? 3
          : 0;
  award('expression', densityPoints);
  if (densityPoints < 8)
    miss({
      category: 'expression',
      severity: totalEvidenceLength < 80 ? 'error' : 'warning',
      section: datedItems.length ? datedItems[0].section : 'resume',
      itemId: null,
      field: 'contentDensity',
      title: '提高内容证据密度',
      message: `当前有效求职证据约 ${totalEvidenceLength} 个字符。写出具体任务、行动、结果和技能使用场景后才能获得分数。`,
      availablePoints: 8 - densityPoints,
    });
  const longItems = datedItems.filter(
    (item) => compactLength(itemDescription(item)) >= 30
  ).length;
  const clarityPoints = datedItems.length
    ? Math.round((4 * longItems) / datedItems.length)
    : 0;
  award('expression', clarityPoints);
  if (clarityPoints < 4)
    miss({
      category: 'expression',
      severity: 'warning',
      section: datedItems.length ? datedItems[0].section : 'experience',
      itemId: null,
      field: 'description',
      title: '完善经历表达',
      message: '避免一句话经历，使用清晰、具体、可验证的描述。',
      availablePoints: 4 - clarityPoints,
    });
  const statementCount = datedItems.reduce(
    (sum, item) =>
      sum +
      (Array.isArray(item.description)
        ? item.description.filter((value: unknown) => text(value)).length
        : text(item.description)
          ? 1
          : 0),
    0
  );
  const statementPoints = Math.min(3, statementCount);
  award('expression', statementPoints);
  if (statementPoints < 3)
    miss({
      category: 'expression',
      severity: 'suggestion',
      section: datedItems.length ? datedItems[0].section : 'experience',
      itemId: null,
      field: 'description',
      title: '增加有效成果条目',
      message: '至少使用 3 条独立陈述展示不同任务或成果。',
      availablePoints: 3 - statementPoints,
    });

  const dimensions: AtsDimension[] = [
    {
      key: 'parseability',
      label: '机器可读性',
      score: scores.parseability,
      maxScore: 15,
    },
    { key: 'basic', label: '基本信息', score: scores.basic, maxScore: 15 },
    {
      key: 'education',
      label: '教育字段结构',
      score: scores.education,
      maxScore: 10,
    },
    {
      key: 'evidence',
      label: '经历证据',
      score: scores.evidence,
      maxScore: 35,
    },
    {
      key: 'skills',
      label: '技能字段结构',
      score: scores.skills,
      maxScore: 10,
    },
    {
      key: 'expression',
      label: '表达结构',
      score: scores.expression,
      maxScore: 15,
    },
  ];
  return {
    score: dimensions.reduce((sum, dimension) => sum + dimension.score, 0),
    maxScore: 100,
    scorerVersion: ATS_SCORER_VERSION,
    analyzedAt: new Date().toISOString(),
    summary: {
      errors: issues.filter((issue) => issue.severity === 'error').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
      suggestions: issues.filter((issue) => issue.severity === 'suggestion')
        .length,
    },
    dimensions,
    issues,
    limitations: [
      '当前分数是确定性 ATS 结构初检，不代表简历事实真实或内容优秀。',
      '学校、专业、公司和项目真实性尚未连接权威数据源核验。',
      '自然语言连贯性、语义有效性与 JD 相关性将在内容质量分析和岗位匹配中单独评价。',
    ],
  };
}
