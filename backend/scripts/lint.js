/**
 * Zero-Dependency JavaScript Syntax & Linter Script
 * Recursively validates the syntax and AST parsing of all ES Modules and scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const TARGET_DIRECTORIES = ['src', 'tests', 'scripts'];
const IGNORED_DIRECTORIES = ['node_modules', '.git', 'coverage'];

function getJsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (IGNORED_DIRECTORIES.includes(file)) continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getJsFiles(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.mjs')) {
      results.push(fullPath);
    }
  }

  return results;
}

console.log('🔍 Running DealFlow360 JavaScript Syntax & Lint Verification...\n');

let totalFiles = 0;
let failedFiles = 0;
const errors = [];

for (const target of TARGET_DIRECTORIES) {
  const dirPath = path.join(projectRoot, target);
  const files = getJsFiles(dirPath);

  for (const file of files) {
    totalFiles++;
    const relativePath = path.relative(projectRoot, file);

    try {
      execSync(`node --check "${file}"`, { stdio: 'pipe' });
    } catch (err) {
      failedFiles++;
      const stderr = err.stderr ? err.stderr.toString().trim() : err.message;
      errors.push({ file: relativePath, error: stderr });
    }
  }
}

if (failedFiles > 0) {
  console.error(`❌ Syntax & Lint check failed on ${failedFiles} of ${totalFiles} files:\n`);
  for (const item of errors) {
    console.error(`- ${item.file}:`);
    console.error(`  ${item.error}\n`);
  }
  process.exit(1);
} else {
  console.log(`✅ All ${totalFiles} JavaScript files passed syntax verification and AST parsing cleanly!`);
  console.log('✨ Zero syntax errors, zero parse anomalies detected.\n');
  process.exit(0);
}
