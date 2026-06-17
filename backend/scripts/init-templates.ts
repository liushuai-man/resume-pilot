import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== 初始化简历模板数据 ===');

  // 创建两个对比明显的简历模板
  const templates = [
    {
      id: 'template-minimal',
      name: '简约风格',
      category: '通用',
      thumbnail: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=minimalist%20resume%20template%20clean%20white%20background&image_size=square',
      preview_image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=minimalist%20professional%20resume%20preview&image_size=landscape_4_3',
      schema: {
        blocks: [
          { id: 'basic', type: 'basic', data: {} },
          { id: 'objective', type: 'objective', data: { objective: '' } },
          { id: 'experience', type: 'experience', data: [] },
          { id: 'education', type: 'education', data: [] },
          { id: 'skills', type: 'skills', data: [] },
        ],
      },
      style_config: {
        primaryColor: '#333333',
        secondaryColor: '#666666',
        fontSize: 14,
        fontFamily: 'Arial',
        backgroundColor: '#ffffff',
      },
    },
    {
      id: 'template-creative',
      name: '创意设计',
      category: '设计',
      thumbnail: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=creative%20colorful%20resume%20template%20modern&image_size=square',
      preview_image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=creative%20designer%20resume%20colorful%20preview&image_size=landscape_4_3',
      schema: {
        blocks: [
          { id: 'basic', type: 'basic', data: {} },
          { id: 'portfolio', type: 'projects', data: [] },
          { id: 'experience', type: 'experience', data: [] },
          { id: 'skills', type: 'skills', data: [] },
          { id: 'certifications', type: 'certifications', data: { certifications: [] } },
        ],
      },
      style_config: {
        primaryColor: '#e91e63',
        secondaryColor: '#9c27b0',
        fontSize: 14,
        fontFamily: 'Montserrat',
        backgroundColor: '#fafafa',
      },
    },
    {
      id: 'template-business',
      name: '经典商务',
      category: '商务',
      thumbnail: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=professional%20business%20resume%20template%20navy%20blue&image_size=square',
      preview_image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=corporate%20business%20resume%20professional%20preview&image_size=landscape_4_3',
      schema: {
        blocks: [
          { id: 'basic', type: 'basic', data: {} },
          { id: 'objective', type: 'objective', data: { objective: '' } },
          { id: 'experience', type: 'experience', data: [] },
          { id: 'education', type: 'education', data: [] },
          { id: 'certifications', type: 'certifications', data: { certifications: [] } },
        ],
      },
      style_config: {
        primaryColor: '#1a73e8',
        secondaryColor: '#5f6368',
        fontSize: 12,
        fontFamily: 'Times New Roman',
        backgroundColor: '#ffffff',
      },
    },
    {
      id: 'template-tech',
      name: '深色技术',
      category: '技术',
      thumbnail: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=dark%20theme%20tech%20resume%20template%20blue&image_size=square',
      preview_image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=dark%20technology%20resume%20developer%20preview&image_size=landscape_4_3',
      schema: {
        blocks: [
          { id: 'basic', type: 'basic', data: {} },
          { id: 'experience', type: 'experience', data: [] },
          { id: 'projects', type: 'projects', data: [] },
          { id: 'skills', type: 'skills', data: [] },
        ],
      },
      style_config: {
        primaryColor: '#667eea',
        secondaryColor: '#e7e9ea',
        fontSize: 13,
        fontFamily: 'Roboto',
        backgroundColor: '#1a1a2e',
      },
    },
  ];

  // 批量创建模板
  for (const template of templates) {
    const existing = await prisma.template.findUnique({ where: { id: template.id } });
    if (!existing) {
      await prisma.template.create({
        data: {
          ...template,
          schema: JSON.stringify(template.schema),
          style_config: JSON.stringify(template.style_config),
        },
      });
      console.log(`✅ 创建模板: ${template.name}`);
    } else {
      console.log(`⏭️ 跳过已存在的模板: ${template.name}`);
    }
  }

  console.log('\n=== 模板初始化完成 ===');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });