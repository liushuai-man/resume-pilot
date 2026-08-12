import 'dotenv/config';
import { prisma } from '../database/prisma';
import { generateResumeOptimization } from '../services/resume-optimization.service';

async function main() {
  const user = await prisma.user.findFirst({ where: { model_configs: { some: { is_default: true, is_deleted: false, purpose: 'chat' } } }, select: { id: true } });
  if (!user) throw new Error('没有配置默认聊天模型的用户');
  const issue: any = { fieldId: 'basic:root:summary', section: 'basic', itemId: null, field: 'summary', evidence: 'testtest', dimension: 'professionalism', severity: 'error', reason: '个人概述包含占位文本', suggestion: '改为真实的经验、方向和优势', confidence: 1, status: 'confirmed' };
  const facts = '拥有 5 年 Java 后端开发经验，主要负责高并发订单系统与接口性能优化。';
  const startedAt = Date.now();
  const result = await generateResumeOptimization(user.id, issue, facts);
  if (result.mode !== 'suggestion') throw new Error('提供真实事实后仍未生成建议');
  if (!result.usedUserFacts.every((fact) => facts.includes(fact))) throw new Error('模型引用了不存在的事实');
  console.log(JSON.stringify({ passed: true, suggestedText: result.suggestedText, usedUserFacts: result.usedUserFacts, modelName: result.modelName, durationMs: Date.now() - startedAt }));
}
main().catch((cause) => { console.error(cause); process.exitCode = 1; }).finally(() => prisma.$disconnect());
