const { spawn } = require('node:child_process');
const { mkdir, readFile, rm } = require('node:fs/promises');
const path = require('node:path');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();
const layouts = ['modern', 'minimal', 'sidebar'];
const outputDir = path.resolve(__dirname, '../../tmp/pdfs');
const resumeTitle = `CODEX_V2_PDF_ACCEPTANCE_${Date.now()}`;
const templatePrefix = `codex-v2-pdf-${Date.now()}`;

const waitForHealth = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch('http://localhost:4000/health')).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('BACKEND_HEALTH_TIMEOUT');
};

(async () => {
  let server;
  let resume;
  const templateIds = [];
  try {
    await mkdir(outputDir, { recursive: true });
    const user = await prisma.user.findFirst({ where: { is_deleted: false } });
    if (!user) throw new Error('ACCEPTANCE_USER_REQUIRED');
    for (const layout of layouts) {
      const id = `${templatePrefix}-${layout}`;
      templateIds.push(id);
      await prisma.template.create({ data: { id, name: `CODEX_V2_${layout}`, category: 'acceptance-temp', schema: { layout }, style_config: { layout } } });
    }
    resume = await prisma.resume.create({ data: { user_id: user.id, title: resumeTitle, template_id: templateIds[0], content: {
      basicInfo: { name: 'PDF Acceptance', title: 'Software Engineer', email: 'qa@example.com', bio: 'Temporary acceptance fixture.' },
      experience: Array.from({ length: 12 }, (_, index) => ({ id: `exp-${index + 1}`, company: `Company ${index + 1}`, position: `Engineer ${index + 1}`, startDate: '2023-01', endDate: '2024-01', description: `Acceptance item ${index + 1}. Architecture, implementation, testing and measurable delivery evidence.` })),
      projects: [], skills: [{ id: 'skill-1', name: 'TypeScript' }], education: [], certifications: [], campusExperiences: [], careerObjective: '',
    } } });
    server = spawn(process.execPath, ['dist/server.js'], { cwd: path.resolve(__dirname, '..'), stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    server.stderr.on('data', (chunk) => process.stderr.write(chunk));
    await waitForHealth();
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    for (let index = 0; index < layouts.length; index += 1) {
      const layout = layouts[index];
      await prisma.resume.update({ where: { id: resume.id }, data: { template_id: templateIds[index] } });
      const response = await fetch(`http://localhost:4000/api/resume/${resume.id}/export-pdf`, { headers: { cookie: `token=${token}` } });
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!response.ok || bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error(`${layout.toUpperCase()}_PDF_EXPORT_FAILED: ${bytes.toString('utf8')}`);
      const output = path.join(outputDir, `v2-${layout}.pdf`);
      await require('node:fs/promises').writeFile(output, bytes);
      console.log(JSON.stringify({ layout, output, bytes: bytes.length }));
    }
  } finally {
    if (server) server.kill();
    if (resume) await prisma.resume.deleteMany({ where: { id: resume.id, title: resumeTitle } });
    await prisma.template.deleteMany({ where: { id: { in: templateIds }, category: 'acceptance-temp' } });
    await prisma.$disconnect();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
