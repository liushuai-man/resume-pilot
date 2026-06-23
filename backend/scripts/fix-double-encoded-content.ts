import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 开始修复双重编码的简历内容 ===\n');

  try {
    // 获取所有简历
    const resumes = await prisma.resume.findMany({
      where: { is_deleted: false },
      select: { id: true, content: true },
    });

    console.log(`找到 ${resumes.length} 份简历`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const resume of resumes) {
      const { id, content } = resume;

      // 检查是否是双重编码
      if (typeof content === 'string') {
        try {
          // 尝试解析一次
          const parsedOnce = JSON.parse(content);

          // 如果解析后还是字符串，说明是双重编码
          if (typeof parsedOnce === 'string') {
            // 尝试再次解析
            const parsedTwice = JSON.parse(parsedOnce);

            // 更新数据库
            await prisma.resume.update({
              where: { id },
              data: { content: parsedOnce }, // 保存只编码一次的版本
            });

            console.log(`✅ 修复简历 ${id} 的双重编码问题`);
            fixedCount++;
          } else {
            // 已经是正确的对象，无需修复
            skippedCount++;
          }
        } catch (e) {
          // 不是有效的 JSON，跳过
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log('\n=== 修复完成 ===');
    console.log(`修复成功: ${fixedCount} 份简历`);
    console.log(`无需修复: ${skippedCount} 份简历`);
  } catch (error) {
    console.error('❌ 修复过程出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
