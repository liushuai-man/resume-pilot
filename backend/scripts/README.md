# AI 配置测试工具

用于测试 AI Provider、API Key 和 Base URL 是否可用。

## 功能特性

- ✅ 测试单个 Provider 配置
- ✅ 测试所有 Provider 配置
- ✅ 自动检测常见错误（401、404、超时等）
- ✅ 显示响应时间
- ✅ 隐藏 API Key 敏感信息
- ✅ 提供详细的错误提示和解决方案

## 支持的 Provider

- **OpenAI**: 官方 OpenAI API
- **DeepSeek**: DeepSeek API
- **MIMO**: 小米 MIMO API

## 使用方法

### 方法 1: 使用 npm/pnpm 命令（推荐）

```bash
# 测试当前配置的 Provider
pnpm run test:ai

# 测试所有 Provider
pnpm run test:ai:all
```

### 方法 2: 直接运行 TypeScript 脚本

```bash
# 测试当前配置
npx tsx scripts/test-ai-config.ts

# 测试所有配置
npx tsx scripts/test-ai-config.ts --all
```

### 方法 3: 使用 Shell 脚本（Linux/Mac）

```bash
# 赋予执行权限
chmod +x scripts/test-ai-config.sh

# 测试当前配置
./scripts/test-ai-config.sh

# 测试所有配置
./scripts/test-ai-config.sh --all
```

## 配置说明

在 `.env` 文件中配置以下环境变量：

```bash
# 选择 Provider (openai/deepseek/mimo)
AI_PROVIDER=mimo

# OpenAI 配置
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# DeepSeek 配置
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# MIMO 配置
MIMO_API_KEY=sk-xxxxxxxxxxxxxxxx
MIMO_API_BASE_URL=https://api.xiaomimimo.com/v1
```

## 测试结果示例

### 成功示例

```
╔════════════════════════════════════════════════════════════╗
║                      测试结果                                ║
╚════════════════════════════════════════════════════════════╝

Provider: mimo
状态: ✓ success (绿色)
API Key: sk-xxxx...xxxx
Base URL: https://api.xiaomimimo.com/v1
Model: mimo-v2.5
响应时间: 1234ms

✓ 配置测试通过，可以正常使用！
```

### 失败示例

```
╔════════════════════════════════════════════════════════════╗
║                      测试结果                                ║
╚════════════════════════════════════════════════════════════╝

Provider: openai
状态: ✗ failed (红色)
API Key: sk-xxxx...xxxx
Base URL: 默认
Model: gpt-4o
错误: 连接超时，请检查网络或 Base URL

✗ 配置测试失败，请检查配置。

提示：
  - 如果在中国大陆，建议使用 MIMO 或 DeepSeek
  - 确保网络可以访问 Base URL
  - 检查 API Key 是否正确且未过期
```

## 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| API Key 无效或已过期 | API Key 错误或已过期 | 检查 `.env` 文件中的 API Key 是否正确 |
| 模型不存在或 Base URL 错误 | Base URL 配置错误或模型名称错误 | 检查 `MIMO_API_BASE_URL` 是否正确 |
| 连接超时 | 网络无法访问 API | 检查网络连接，或配置代理 |
| 连接被拒绝 | Base URL 错误 | 检查 Base URL 是否正确 |
| 请求过于频繁 | 达到速率限制 | 等待一段时间后重试，或升级套餐 |

## 推荐配置（中国大陆）

```bash
# 使用 MIMO API（推荐）
AI_PROVIDER=mimo
MIMO_API_KEY=你的_MIMO_API_KEY
MIMO_API_BASE_URL=https://api.xiaomimimo.com/v1

# 或使用 DeepSeek
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的_DeepSeek_API_KEY
```

## 注意事项

1. **API Key 安全**：测试脚本会自动隐藏 API Key 的敏感部分
2. **网络环境**：确保服务器可以访问配置的 Base URL
3. **超时设置**：默认超时时间为 30 秒
4. **速率限制**：测试所有 Provider 时会间隔 1 秒，避免请求过快

## 故障排查

如果测试失败，请按以下步骤排查：

1. **检查网络连接**
   ```bash
   # 测试是否能访问 Base URL
   curl https://api.xiaomimimo.com/v1
   ```

2. **检查 API Key**
   - 确认 API Key 是否正确
   - 确认 API Key 是否已激活
   - 确认 API Key 是否有余额

3. **检查配置**
   - 确认 `.env` 文件位置正确
   - 确认环境变量名称拼写正确
   - 确认没有多余的空格或引号

4. **查看详细日志**
   ```bash
   # 启用详细日志
   DEBUG=* pnpm run test:ai
   ```

## 技术细节

- 使用 OpenAI SDK 进行测试
- 发送简单的测试请求（"请回复'测试成功'"）
- 超时时间：30 秒
- 最大 tokens：10
- Temperature：0（确定性输出）

## 更新日志

- **v1.0.0** (2024-06-24)
  - 初始版本
  - 支持测试单个和所有 Provider
  - 自动错误检测和提示