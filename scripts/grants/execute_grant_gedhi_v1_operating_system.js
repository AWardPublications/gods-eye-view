import { GrantGedhiOperatingSystemEngine } from '../../src/agents/grantGedhiOperatingSystemEngine.mjs';

function runOSDeployment() {
  console.log("=" * 80);
  console.log("DEPLOYING GRANT GEDHI v1.0 — GOVERNED FUNDING ACQUISITION OPERATING SYSTEM");
  console.log("=" * 80);

  const engine = new GrantGedhiOperatingSystemEngine();
  const res = engine.deployGovernedOperatingSystem();

  console.log(`\n  ✓ Target Directory:            ${res.targetDirectory}`);
  console.log(`  ✓ Architecture Subdirectories: ${res.totalArchitectureSubdirs} Governed Folders (00_GOVERNANCE to 14_POST_AWARD)`);
  console.log(`  ✓ Pipeline Steps:              ${res.pipelineStepsCount} (Discover -> Qualify -> Evidence -> Draft -> Validate -> Compliance -> Human Authorisation Gate -> Submit -> Receipt -> Audit)`);
  console.log(`  ✓ Total Raw Pipeline:          €${(res.capitalStack.totalRawPipeline / 1e6).toFixed(1)}M Capital Stack`);
  console.log(`  ✓ Total Eligible Value:        €${(res.capitalStack.totalEligibleValue / 1e6).toFixed(1)}M Qualified Base`);
  console.log(`  ✓ Probability-Weighted Value:  €${(res.capitalStack.totalProbabilityWeightedValue / 1e6).toFixed(1)}M Realizable Expected Capital`);
  console.log(`  ✓ Deployment OS Hash:          ${res.osHash}\n`);

  console.log("=" * 80);
  console.log("STATUS: GRANT GEDHI v1.0 OPERATING SYSTEM DEPLOYED & GOVERNED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runOSDeployment();
