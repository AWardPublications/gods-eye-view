/**
 * Alex Wenger Master Golf Ecosystem — Batch Notebook Knowledge Extractor
 * Governance Standard: Patent WO/2026/150385
 *
 * Queries all 10 connected NotebookLM Notebooks and compiles extracted doctrines 
 * into governed ALEX_WENGER_KNOWLEDGE (AWK-v0.3) blocks.
 *
 * @module scripts/extract_notebook_knowledge
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NOTEBOOK_MATRIX = [
  { id: '352d4dca-fa62-4807-8dc1-71ce249d314d', name: 'Strategic Canon 8' },
  { id: 'af92790c-8c73-46bb-85a1-0d31d62286cd', name: 'Strategic Canon 9' },
  { id: 'bb6c5b0f-3c82-4aa1-ba8a-704701883553', name: 'Strategic Canon 10' },
  { id: 'ce9be147-e983-416d-ba84-72173504dfef', name: 'Master Mesh & DAVID_OS' }
];

console.log('================================================================================');
console.log('EXTRACTING KNOWLEDGE FROM CONNECTED NOTEBOOKLM NOTEBOOKS');
console.log('================================================================================\n');

const extractedBlocks = [];

for (const nb of NOTEBOOK_MATRIX) {
  console.log(`[QUERYING NOTEBOOK] ${nb.name} (${nb.id})...`);
  try {
    const query = 'Summarize the core technical rules, ballistics constraints, and coaching principles in 3 bullet points.';
    const cmd = `python -m notebooklm ask --notebook ${nb.id} "${query}"`;
    const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 });

    console.log(`  ✓ Successfully retrieved insights from ${nb.name}:`);
    console.log(`  ------------------------------------------------------------------------`);
    console.log(output.trim().split('\n').map(line => `  | ${line}`).join('\n'));
    console.log(`  ------------------------------------------------------------------------\n`);

    extractedBlocks.push({
      notebook_id: nb.id,
      notebook_name: nb.name,
      extracted_knowledge: output.trim(),
      status: 'EXTRACTED_AND_COMPILED'
    });
  } catch (err) {
    console.warn(`  ⚠️ Could not query notebook ${nb.id}: ${err.message}`);
  }
}

const outputPath = path.join(__dirname, '../scratch/extracted_notebook_knowledge_summary.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedBlocks, null, 2));
console.log(`Saved extracted knowledge blocks into ${outputPath}`);
