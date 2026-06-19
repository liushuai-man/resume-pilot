import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  console.log('=== 更新模板样式配置 ===');

  // 深色技术 - 侧边栏布局
  await prisma.template.update({
    where: { id: 'template-tech' },
    data: {
      style_config: JSON.stringify({
        primaryColor: '#00D4FF',
        secondaryColor: '#CCCCCC',
        fontSize: 13,
        fontFamily: "'Roboto', 'Microsoft YaHei', sans-serif",
        backgroundColor: '#1a1a2e',
        sectionTitleColor: '#00D4FF',
        lineColor: '#2A2A4E',
        layout: 'sidebar',
        sidebarColor: '#0F0F23',
        sidebarTextColor: '#ffffff',
      }),
    },
  });
  console.log('✅ 更新模板: 深色技术 (侧边栏布局)');

  // 经典商务 - 经典布局
  await prisma.template.update({
    where: { id: 'template-business' },
    data: {
      style_config: JSON.stringify({
        primaryColor: '#1A1A2E',
        secondaryColor: '#4A69BD',
        fontSize: 12,
        fontFamily: "'Times New Roman', 'Microsoft YaHei', serif",
        backgroundColor: '#FFFFFF',
        sectionTitleColor: '#1A1A2E',
        lineColor: '#E5E7EB',
        layout: 'classic',
      }),
    },
  });
  console.log('✅ 更新模板: 经典商务 (经典布局)');

  // 简约风格 - 极简布局
  await prisma.template.update({
    where: { id: 'template-minimal' },
    data: {
      style_config: JSON.stringify({
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        fontSize: 13,
        fontFamily: "'Helvetica Neue', 'Microsoft YaHei', sans-serif",
        backgroundColor: '#FFFFFF',
        sectionTitleColor: '#3B82F6',
        lineColor: '#E5E7EB',
        layout: 'minimal',
      }),
    },
  });
  console.log('✅ 更新模板: 简约风格 (极简布局)');

  console.log('\n=== 模板更新完成 ===');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
