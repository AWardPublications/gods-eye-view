import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * INSTITUTIONAL LICENSE AUDIT TOOL
 * Classifies SPDX licenses for external tools into GREEN, AMBER, RED:
 * GREEN  = Compatible with DaVinciA+ commercial & sovereign terms
 * AMBER  = Legal review required / copyleft obligations apply (e.g. GPL/AGPL)
 * RED    = Do not integrate (hostile, proprietary, or restricted)
 */

const registryPath = resolve(process.cwd(), 'data/institutional-tool-registry.json');

export function runLicenseAudit() {
  const rawData = readFileSync(registryPath, 'utf-8');
  const registry = JSON.parse(rawData);

  console.log("================================================================================");
  console.log("INSTITUTIONAL LICENSE & IP FIREWALL AUDIT ENGINE");
  console.log("================================================================================");

  let greenCount = 0;
  let amberCount = 0;
  let redCount = 0;

  const auditedTools = registry.tools.map((tool) => {
    let status = 'GREEN';
    const lic = tool.license.toUpperCase();

    if (lic.includes('GPL') || lic.includes('AGPL') || lic.includes('ECL')) {
      status = 'AMBER';
      amberCount++;
    } else if (lic.includes('PROPRIETARY') || lic.includes('RESTRICTED')) {
      status = 'RED';
      redCount++;
    } else {
      greenCount++;
    }

    return {
      tool_id: tool.tool_id,
      name: tool.name,
      license: tool.license,
      status
    };
  });

  auditedTools.forEach((t) => {
    const icon = t.status === 'GREEN' ? '🟢' : t.status === 'AMBER' ? '🟡' : '🔴';
    console.log(`  ${icon} [${t.status.padEnd(5)}] ${t.name.padEnd(35)} -> License: ${t.license}`);
  });

  console.log("================================================================================");
  console.log(`AUDIT SUMMARY: GREEN (${greenCount}) | AMBER (${amberCount}) | RED (${redCount})`);
  console.log("================================================================================\n");

  return {
    status: 'LICENSE_AUDIT_SUCCESSFUL',
    totalToolsAudited: registry.tools.length,
    greenCount,
    amberCount,
    redCount,
    auditedTools
  };
}

if (process.argv[1] && process.argv[1].endsWith('institutional-license-audit.js')) {
  runLicenseAudit();
}
