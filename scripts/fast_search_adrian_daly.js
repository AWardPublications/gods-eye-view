import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const searchDirs = [
  'C:\\Users\\David\\Desktop',
  'C:\\Users\\David\\Downloads',
  'C:\\Users\\David\\Documents',
  'C:\\Users\\David\\.gemini\\antigravity-cli\\brain\\680880c5-c729-450a-86ed-5d4a4ee51afe',
  'C:\\Users\\David\\gods-eye-view'
];

const ignoreFolders = ['node_modules', '.git', '.tempmediaStorage', '.system_generated', 'dist', 'build'];

const matches = [];

function searchDirectory(dirPath, depth = 0) {
  if (depth > 4) return;
  try {
    const items = readdirSync(dirPath);
    for (const item of items) {
      if (item.startsWith('.') || ignoreFolders.includes(item)) continue;
      const fullPath = join(dirPath, item);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (item.toLowerCase().includes('adrian') || item.toLowerCase().includes('daly')) {
            matches.push({ type: 'DIR_NAME', path: fullPath });
          }
          searchDirectory(fullPath, depth + 1);
        } else if (stat.isFile()) {
          const lowerName = item.toLowerCase();
          if (lowerName.includes('adrian') || lowerName.includes('daly')) {
            matches.push({ type: 'FILE_NAME', path: fullPath, size: stat.size });
          }
          const ext = extname(item).toLowerCase();
          if (['.txt', '.md', '.json', '.js', '.mjs', '.ts', '.csv', '.html', '.xml', '.eml'].includes(ext) && stat.size < 2000000) {
            try {
              const content = readFileSync(fullPath, 'utf-8');
              if (content.toLowerCase().includes('adrian') || content.toLowerCase().includes('daly')) {
                matches.push({ type: 'FILE_CONTENT', path: fullPath, size: stat.size });
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("=" * 80);
console.log("FAST SYSTEM SEARCH FOR ADRIAN DALY");
console.log("=" * 80);

for (const d of searchDirs) {
  if (existsSync(d)) {
    console.log(`Scanning: ${d}...`);
    searchDirectory(d);
  }
}

console.log(`\nFound ${matches.length} matches:\n`);
for (const m of matches) {
  console.log(`[${m.type}] ${m.path} (${m.size || 0} bytes)`);
}
