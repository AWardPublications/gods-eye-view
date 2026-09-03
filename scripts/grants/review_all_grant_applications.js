import { GrantReviewControlCenterEngine } from '../../src/agents/grantReviewControlCenterEngine.mjs';

function runReview() {
  console.log("=" * 80);
  console.log("GRANT & INVESTOR APPLICATION REVIEW CONTROL CENTER (DAVID WARD)");
  console.log("=" * 80);

  const engine = new GrantReviewControlCenterEngine();
  const res = engine.generateReviewIndex();

  console.log(`\n  ✓ Total Categories: ${res.totalCategories}`);
  console.log(`  ✓ Total Files:      ${res.totalFilesCount} Key Dossiers & Templates Ready for Review`);
  console.log(`  ✓ Review Hash:      ${res.indexHash}\n`);

  for (const cat of res.categories) {
    console.log(`--- ${cat.category.toUpperCase()} ---`);
    for (const f of cat.files) {
      console.log(`  • [${f.status}] ${f.name.padEnd(38)} -> file:///${f.path}`);
    }
    console.log('');
  }

  console.log("=" * 80);
  console.log("STATUS: REVIEW CONTROL CENTER 100% ACTIVE");
  console.log("=" * 80 + "\n");
}

runReview();
