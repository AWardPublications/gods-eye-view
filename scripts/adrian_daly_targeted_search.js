import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const searchRoots = [
  'C:\\Users\\David\\Desktop',
  'C:\\Users\\David\\Downloads',
  'C:\\Users\\David\\Documents',
  'C:\\Users\\David\\.gemini\\antigravity-cli\\brain',
  'C:\\Users\\David\\gods-eye-view'
];

const found = [];

function scanFile(filePath) {
  try {
    const ext = extname(filePath).toLowerCase();
    const stat = statSync(filePath);
    if (stat.size > 10000000) return; // skip >10MB
    const lowerName = filePath.toLowerCase();

    if (lowerName.includes('adrian') || lowerName.includes('daly')) {
      found.push({ matchType: 'FILE_NAME', path: filePath, snippet: '' });
    }

    if (['.md', '.txt', '.json', '.html', '.csv', '.js', '.mjs', '.ts', '.xml', '.eml', '.py'].includes(ext)) {
      const text = readFileSync(filePath, 'utf-8');
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('adrian') || lines[i].toLowerCase().includes('daly')) {
          found.push({
            matchType: 'CONTENT_MATCH',
            path: filePath,
            lineNum: i + 1,
            snippet: lines[i].trim().slice(0, 150)
          });
          if (found.length > 200) break;
        }
      }
    }
  } catch (e) {}
}

function walkDir(dirPath, depth = 0) {
  if (depth > 4) return;
  try {
    const items = readdirSync(dirPath);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === '.git' || item === '.tempmediaStorage') continue;
      const fullPath = join(dirPath, item);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (item.toLowerCase().includes('adrian') || item.toLowerCase().includes('daly')) {
            found.push({ matchType: 'DIR_NAME', path: fullPath, snippet: '' });
          }
          walkDir(fullPath, depth + 1);
        } else if (stat.isFile()) {
          scanFile(fullPath);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("================================================================================");
console.log("TARGETED SYSTEM SEARCH FOR ADRIAN DALY");
console.log("================================================================================");

for (const root of searchRoots) {
  if (existsSync(root)) {
    console.log(`Scanning root: ${root}...`);
    walkDir(root);
  }
}

console.log(`\nFound ${found.length} Total Matches:\n`);
for (const f of found) {
  console.log(`[${f.matchType}] ${f.path}${f.lineNum ? ' (Line ' + f.lineNum + ')' : ''}`);
  if (f.snippet) {
    console.log(`  └─ Snippet: "${f.snippet}"`);
  }
}
