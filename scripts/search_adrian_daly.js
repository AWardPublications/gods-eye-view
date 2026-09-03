import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const searchDirs = [
  'C:\\Users\\David\\Desktop',
  'C:\\Users\\David\\Downloads',
  'C:\\Users\\David\\Documents',
  'C:\\Users\\David\\.gemini\\antigravity-cli\\brain',
  'C:\\Users\\David\\gods-eye-view'
];

const matches = [];

function searchDirectory(dirPath, depth = 0) {
  if (depth > 6) return;
  try {
    const items = readdirSync(dirPath);
    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules' || item === '.git') continue;
      const fullPath = join(dirPath, item);
      try {
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          if (item.toLowerCase().includes('adrian') || item.toLowerCase().includes('daly')) {
            matches.push({ type: 'DIRECTORY_NAME', path: fullPath });
          }
          searchDirectory(fullPath, depth + 1);
        } else if (stat.isFile()) {
          if (item.toLowerCase().includes('adrian') || item.toLowerCase().includes('daly')) {
            matches.push({ type: 'FILE_NAME', path: fullPath, size: stat.size });
          }
          // Also search content of text/md/json files
          const ext = extname(item).toLowerCase();
          if (['.txt', '.md', '.json', '.js', '.mjs', '.ts', '.csv', '.html', '.xml'].includes(ext) && stat.size < 5000000) {
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
console.log("SEARCHING SYSTEM FOR ADRIAN DALY REFERENCES...");
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
