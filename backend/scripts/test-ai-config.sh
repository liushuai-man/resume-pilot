#!/bin/bash

# AI 配置测试脚本 (Shell 版本)
# 用于快速测试 AI Provider、API Key 和 Base URL 是否可用

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           AI 配置测试工具                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "✗ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "✗ 错误: 未找到 pnpm，请先安装 pnpm"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "✗ 错误: 未找到 .env 文件"
    echo "  请先创建 .env 文件并配置 AI 相关的环境变量"
    exit 1
fi

echo "✓ 环境检查通过"
echo ""

# 运行 TypeScript 测试脚本
if [ "$1" = "--all" ] || [ "$1" = "-a" ]; then
    echo "开始测试所有 Provider..."
    pnpm tsx scripts/test-ai-config.ts --all
else
    echo "开始测试当前配置..."
    pnpm tsx scripts/test-ai-config.ts
fi

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✓ 测试完成"
else
    echo ""
    echo "✗ 测试失败"
fi

exit $exit_code