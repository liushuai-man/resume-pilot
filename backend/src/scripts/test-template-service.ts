import { getTemplatesWithImages } from '../services/template.service';

async function test() {
  console.log('Testing template service...');

  try {
    const templates = await getTemplatesWithImages();
    console.log('\nTemplates found:', templates.length);

    templates.forEach((template) => {
      console.log(`\nTemplate: ${template.name}`);
      console.log(`  ID: ${template.id}`);
      console.log(`  Thumbnail: ${template.thumbnail}`);
      console.log(`  Preview: ${template.preview_image}`);
    });

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

test();
