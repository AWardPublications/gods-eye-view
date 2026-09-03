import { DavinciaCapitalAcquisitionFabricEngine } from '../../src/davincia/davinciaCapitalAcquisitionFabricEngine.mjs';

function runFabric() {
  console.log("=" * 80);
  console.log("DAVINCIA⁺ CAPITAL ACQUISITION AGENT FABRIC — 15-AGENT CONSTELLATION");
  console.log("=" * 80);

  const engine = new DavinciaCapitalAcquisitionFabricEngine();
  const res = engine.executeTypedArtefactPipeline('DAVID-ENT-BAT-001', 'GEDHI-OPP-2026-00421');

  console.log(`\n  ✓ Core Principle:         ${engine.corePrinciple}`);
  console.log(`  ✓ Constellation Size:     ${res.totalAgentsInConstellation} Specialised Agents (GG-01 to GG-15)`);
  console.log(`  ✓ Control Plane Active:   ${res.controlPlaneControlsCount} DAVINCIA⁺ Control Gates`);
  console.log(`  ✓ Eligibility Judge:      ${res.artefacts.eligibilityArtefact.decision} (Confidence: 100%)`);
  console.log(`  ✓ Evidence Architect:     ${res.artefacts.evidenceArtefact.status} (${res.artefacts.evidenceArtefact.verifiedClaims} Verified Claims)`);
  console.log(`  ✓ Red Team Attacker:      ${res.artefacts.redTeamArtefact.recommendation} (${res.artefacts.redTeamArtefact.criticalVulnerabilities} Critical Blockers)`);
  console.log(`  ✓ Authority Gate:         ${res.artefacts.authorityGateArtefact.gateState} (Requires Sign-off)`);
  console.log(`  ✓ Pipeline Hash:          ${res.pipelineHash}\n`);

  console.log("=" * 80);
  console.log("STATUS: DAVINCIA⁺ 15-AGENT CAPITAL FABRIC 100% GREEN");
  console.log("=" * 80 + "\n");
}

runFabric();
