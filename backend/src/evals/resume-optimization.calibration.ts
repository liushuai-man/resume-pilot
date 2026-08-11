import 'dotenv/config';
import { prisma } from '../database/prisma';
import { generateResumeOptimization } from '../services/resume-optimization.service';

async function main() {
  const user = await prisma.user.findFirst({ where: { model_configs: { some: { is_default: true, is_deleted: false, purpose: 'chat' } } }, select: { id: true } });
  if (!user) throw new Error('没有配置默认聊天模型的用户');
  const issue: any = { fieldId: 'experience:e1:description', section: 'experience', itemId: 'e1', field: 'description', evidence: '负责订单接口优化。', dimension: 'evidenceSpecificity', severity: 'warning', reason: '缺少具体行动与结果', suggestion: '补充技术行动和可确认结果', confidence: .9, status: 'confirmed' };
  const startedAt = Date.now();
  const result = await generateResumeOptimization(user.id, issue, '使用 Redis 缓存热点数据，将接口 P95 延迟从 420ms 降至 180ms。');
  if (result.mode !== 'suggestion') throw new Error('提供事实后仍未生成建议');
  console.log(JSON.stringify({ passed: true, mode: result.mode, suggestedText: result.suggestedText, usedUserFacts: result.usedUserFacts, modelName: result.modelName, durationMs: Date.now() - startedAt }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
