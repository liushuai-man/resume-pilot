/**
 * AI 配置测试脚本
 * 用于测试 AI Provider、API Key 和 Base URL 是否可用
 */

import { OpenAI } from 'openai';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
config({ path: join(__dirname, '..', '.env') });

interface TestResult {
  provider: string;
  apiKey: string;
  baseURL?: string;
  model: string;
  status: 'success' | 'failed';
  message: string;
  responseTime?: number;
  error?: string;
}

// 规范化 provider 名称
const normalizeProvider = (provider: string) => {
  const p = provider.toLowerCase().trim();
  if (p.includes('mimo') || p.includes('xiaomi')) return 'mimo';
  if (p.includes('deepseek')) return 'deepseek';
  return 'openai';
};

// 获取配置
const getAIConfig = () => {
  const provider = process.env.AI_PROVIDER || 'openai';
  const normalizedProvider = normalizeProvider(provider);

  const configs = {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: undefined,
      model: 'gpt-4o',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
    },
    mimo: {
      apiKey: process.env.MIMO_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: process.env.MIMO_API_BASE_URL || 'https://api.xiaomimimo.com/v1',
      model: 'mimo-v2.5',
    },
  };

  return {
    provider: normalizedProvider,
    originalProvider: provider,
    config: configs[normalizedProvider as keyof typeof configs],
  };
};

// 测试 AI 连接
async function testAIConnection(): Promise<TestResult> {
  const { provider, originalProvider, config } = getAIConfig();

  console.log(`\n=== 开始测试 AI 配置 ===`);
  console.log(`Provider: ${originalProvider} (规范化: ${provider})`);
  console.log(`API Key: ${config.apiKey ? '已配置' : '未配置'}`);
  console.log(`Base URL: ${config.baseURL || '默认 (OpenAI)'}`);
  console.log(`Model: ${config.model}`);
  console.log(`========================\n`);

  // 检查 API Key 是否配置
  if (!config.apiKey) {
    return {
      provider,
      apiKey: '未配置',
      baseURL: config.baseURL,
      model: config.model,
      status: 'failed',
      message: 'API Key 未配置',
      error: '请在 .env 文件中配置相应的 API Key',
    };
  }

  // 隐藏 API Key 的敏感部分
  const maskedKey = config.apiKey.slice(0, 8) + '...' + config.apiKey.slice(-4);
  const startTime = Date.now();

  try {
    // 创建 OpenAI 客户端
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: 30000, // 30秒超时
    });

    // 发送测试请求
    console.log('正在发送测试请求...');
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手。',
        },
        {
          role: 'user',
          content: '请回复"测试成功"，不要包含其他内容。',
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const responseTime = Date.now() - startTime;
    const reply = response.choices[0]?.message?.content?.trim() || '';

    console.log(`✓ 请求成功 (耗时: ${responseTime}ms)`);
    console.log(`✓ AI 回复: "${reply}"`);

    return {
      provider,
      apiKey: maskedKey,
      baseURL: config.baseURL,
      model: config.model,
      status: 'success',
      message: 'AI 配置测试成功',
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    console.error(`✗ 请求失败 (耗时: ${responseTime}ms)`);

    let errorMessage = '未知错误';
    if (error.message) {
      if (error.message.includes('401')) {
        errorMessage = 'API Key 无效或已过期';
      } else if (error.message.includes('404')) {
        errorMessage = '模型不存在或 Base URL 错误';
      } else if (
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('timeout')
      ) {
        errorMessage = '连接超时，请检查网络或 Base URL';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '连接被拒绝，请检查 Base URL';
      } else if (error.message.includes('429')) {
        errorMessage = '请求过于频繁，已达到速率限制';
      } else {
        errorMessage = error.message;
      }
    }

    console.error(`✗ 错误: ${errorMessage}`);

    return {
      provider,
      apiKey: maskedKey,
      baseURL: config.baseURL,
      model: config.model,
      status: 'failed',
      message: 'AI 配置测试失败',
      error: errorMessage,
    };
  }
}

// 测试所有可用的配置
async function testAllProviders() {
  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║           AI 配置测试工具                                    ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  const providers = ['openai', 'deepseek', 'mimo'];
  const results: TestResult[] = [];

  for (const provider of providers) {
    // 临时设置环境变量
    const originalProvider = process.env.AI_PROVIDER;
    process.env.AI_PROVIDER = provider;

    console.log(`\n--- 测试 Provider: ${provider.toUpperCase()} ---`);
    const result = await testAIConnection();
    results.push(result);

    // 恢复原始配置
    process.env.AI_PROVIDER = originalProvider;

    // 等待一下，避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 打印汇总
  console.log(
    '\n╔════════════════════════════════════════════════════════════╗'
  );
  console.log(
    '║                      测试结果汇总                              ║'
  );
  console.log(
    '╚════════════════════════════════════════════════════════════╝\n'
  );

  results.forEach((result, index) => {
    const statusIcon = result.status === 'success' ? '✓' : '✗';
    const statusColor = result.status === 'success' ? '绿色' : '红色';

    console.log(`${index + 1}. ${result.provider.toUpperCase()}`);
    console.log(`   状态: ${statusIcon} ${result.status} (${statusColor})`);
    console.log(`   API Key: ${result.apiKey}`);
    console.log(`   Base URL: ${result.baseURL || '默认'}`);
    console.log(`   Model: ${result.model}`);
    if (result.responseTime) {
      console.log(`   响应时间: ${result.responseTime}ms`);
    }
    if (result.error) {
      console.log(`   错误: ${result.error}`);
    }
    console.log('');
  });

  // 推荐可用的配置
  const successProviders = results.filter((r) => r.status === 'success');
  if (successProviders.length > 0) {
    console.log('✓ 推荐配置（测试通过）:');
    successProviders.forEach((r) => {
      console.log(`  - ${r.provider.toUpperCase()}: ${r.baseURL || '默认'}`);
    });
  } else {
    console.log('✗ 所有配置测试失败，请检查：');
    console.log('  1. API Key 是否正确');
    console.log('  2. Base URL 是否可访问');
    console.log('  3. 网络连接是否正常');
    console.log('  4. 是否需要配置代理');
  }
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);
    const testAll = args.includes('--all') || args.includes('-a');

    if (testAll) {
      await testAllProviders();
    } else {
      const result = await testAIConnection();

      console.log(
        '\n╔════════════════════════════════════════════════════════════╗'
      );
      console.log(
        '║                      测试结果                                ║'
      );
      console.log(
        '╚════════════════════════════════════════════════════════════╝\n'
      );

      const statusIcon = result.status === 'success' ? '✓' : '✗';
      const statusColor = result.status === 'success' ? '绿色' : '红色';

      console.log(`Provider: ${result.provider}`);
      console.log(`状态: ${statusIcon} ${result.status} (${statusColor})`);
      console.log(`API Key: ${result.apiKey}`);
      console.log(`Base URL: ${result.baseURL || '默认'}`);
      console.log(`Model: ${result.model}`);
      if (result.responseTime) {
        console.log(`响应时间: ${result.responseTime}ms`);
      }
      if (result.error) {
        console.log(`错误: ${result.error}`);
      }

      if (result.status === 'success') {
        console.log('\n✓ 配置测试通过，可以正常使用！');
      } else {
        console.log('\n✗ 配置测试失败，请检查配置。');
        console.log('\n提示：');
        console.log('  - 如果在中国大陆，建议使用 MIMO 或 DeepSeek');
        console.log('  - 确保网络可以访问 Base URL');
        console.log('  - 检查 API Key 是否正确且未过期');
      }
    }
  } catch (error) {
    console.error('测试脚本执行失败:', error);
    process.exit(1);
  }
}

// 运行测试
main();
