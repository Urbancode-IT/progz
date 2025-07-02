const fs = require('fs');
const path = require('path');

const outputFile = 'all_code.txt';
let result = '';

// Folders to ignore
const ignoredDirs = ['node_modules', 'uploads', '.git', 'dist', 'build', 'coverage'];

function readFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!ignoredDirs.includes(file)) {
        readFiles(fullPath);
      }
    } else if (/\.(js|json|env|ts|md|txt|yml|yaml|html|css)$/.test(file)) {
      result += `\n\n// ===== File: ${fullPath} =====\n`;
      result += fs.readFileSync(fullPath, 'utf8');
    }
  }
}

// Start from current working directory
readFiles(process.cwd());

fs.writeFileSync(outputFile, result);
console.log(`✅ All code (excluding ignored folders) written to ${outputFile}`);
