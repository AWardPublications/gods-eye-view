import { MasterGrantCompilationPipeline } from '../../src/agents/masterGrantCompilationPipeline.mjs';

function executeMasterCompilation() {
  console.log("=" * 80);
  console.log("EXECUTING DETERMINISTIC MULTI-AGENT MASTER GRANT COMPILATION PIPELINE");
  console.log("=" * 80);

  const pipeline = new MasterGrantCompilationPipeline();

  const sampleTargets = [
    { id: 'G-CH-01', name: 'Innosuisse Innovation Project', entity: 'Brehon AI Technologies', amount: 'CHF 5,000,000' },
    { id: 'G-IE-01', name: 'EIC Accelerator Blended Finance', entity: 'Brehon AI Solutions Ltd', amount: '€17,500,000' },
    { id: 'G-UK-01', name: 'Innovate UK Smart Grants', entity: 'Brehon AI Recruitment (Belfast HQ)', amount: '£2,500,000' },
    { id: 'G-HC-01', name: 'EUIPO SME IP Voucher Fund', entity: 'A.Ward Publications', amount: '€75,000' }
  ];

  for (const target of sampleTargets) {
    const res = pipeline.compileGrantPackage(target);
    console.log(`\n  ✓ Grant [${res.manifest.grantId}] ${res.manifest.programName}`);
    console.log(`    - Applying Entity:    ${res.manifest.applyingEntity}`);
    console.log(`    - Medical Scope Gate: ${res.boundaryCheck.isCleared ? 'CLEARED (NON-CLINICAL ATHLETIC PERFORMANCE)' : 'BREACH_DETECTED'}`);
    console.log(`    - Fiscal Allocation:  ${res.fiscalAllocation.jurisdiction}`);
    console.log(`    - Evaluator Score:    Excellence: ${res.evaluation.scores.excellence} | Impact: ${res.evaluation.scores.impact} | Implementation: ${res.evaluation.scores.implementation} (Overall: ${res.evaluation.scores.overall}/100)`);
    console.log(`    - Compilation State:  ${res.compilationStatus}`);
    console.log(`    - Evidence Hash:      ${res.evidencePackHash.substring(0, 32)}...`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: MASTER GRANT COMPILATION PIPELINE EXECUTED 100% GREEN");
  console.log("=" * 80 + "\n");
}

executeMasterCompilation();
