import 'dotenv/config';
import OpenAI from 'openai';
import { prisma } from '../database/prisma';
import { getDecryptedApiKey } from '../services/model-config.service';

const timeoutMs = Number(process.argv.find((value) => value.startsWith('--timeout-ms='))?.split('=')[1] || 30_000);

async function main() {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('--timeout-ms 必须是正数');
  const config = await prisma.userModelConfig.findFirst({
    where: { is_default: true, is_deleted: false, purpose: 'chat' },
  });
  if (!config) throw new Error('没有找到默认聊天模型配置');
  const apiKey = await getDecryptedApiKey(config);
  const startedAt = Date.now();
  try {
    const client = new OpenAI({
      apiKey,
      baseURL: config.base_url || undefined,
      timeout: timeoutMs,
      maxRetries: 0,
    });
    const response = await client.chat.completions.create({
      model: config.model_name,
      messages: [{ role: 'user', content: '只回复 OK' }],
      temperature: 0,
      max_tokens: 8,
    });
    console.log(JSON.stringify({
      success: true,
      provider: config.provider,
      model: config.model_name,
      baseUrl: config.base_url,
      durationMs: Date.now() - startedAt,
      reply: response.choices[0]?.message?.content?.slice(0, 20) || '',
    }));
  } catch (error: any) {
    console.log(JSON.stringify({
      success: false,
      provider: config.provider,
      model: config.model_name,
      baseUrl: config.base_url,
      durationMs: Date.now() - startedAt,
      error: error?.name || 'Error',
      status: error?.status,
      message: String(error?.message || error).slice(0, 300),
    }));
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
