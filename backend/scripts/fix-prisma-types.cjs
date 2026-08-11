const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const standardClientDir = path.join(projectRoot, 'node_modules', '.prisma', 'client');
const pnpmDir = path.join(projectRoot, 'node_modules', '.pnpm');

// Prisma's normal hoisted layout already resolves
// @prisma/client -> node_modules/.prisma/client. No compatibility copy is
// needed in that case. The fallback below only supports older pnpm layouts
// that placed the generated client beside @prisma/client in .pnpm.
if (fs.existsSync(path.join(standardClientDir, 'default.d.ts'))) {
  console.log(`Prisma Client uses the standard generated directory:\n  ${standardClientDir}`);
  process.exit(0);
}

if (!fs.existsSync(pnpmDir)) {
  console.error('Error: Could not find node_modules/.pnpm directory');
  process.exit(1);
}

const prismaClientDirs = fs.readdirSync(pnpmDir).filter(dir => dir.startsWith('@prisma+client'));

if (prismaClientDirs.length === 0) {
  console.error('Error: Could not find @prisma+client directory');
  process.exit(1);
}

const prismaClientDir = prismaClientDirs[0];
const srcDir = path.join(pnpmDir, prismaClientDir, 'node_modules', '.prisma', 'client');
const dstDir = path.join(pnpmDir, prismaClientDir, 'node_modules', '@prisma', 'client', '.prisma', 'client', 'default');

if (!fs.existsSync(srcDir)) {
  console.error(`Error: Source directory not found: ${srcDir}`);
  process.exit(1);
}

fs.mkdirSync(dstDir, { recursive: true });

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const dstPath = path.join(dstDir, file);
  fs.copyFileSync(srcPath, dstPath);
});

console.log(`Successfully copied ${files.length} files from\n  ${srcDir}\nto\n  ${dstDir}`);
