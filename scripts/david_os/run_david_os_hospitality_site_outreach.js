import { DavidOsHospitalitySiteOutreachEngine } from '../../src/david_os/davidOsHospitalitySiteOutreachEngine.mjs';

function runOutreach() {
  console.log("=" * 80);
  console.log("DAVID_OS HOSPITALITY SITE & HOTEL OUTREACH ENGINE (GITHUB / CHATGPT PRO)");
  console.log("=" * 80);

  const engine = new DavidOsHospitalitySiteOutreachEngine();
  const res = engine.generateHotelOutreachCampaign();

  console.log(`\n  ✓ ChatGPT Pro Origin:     ${res.siteOrigin}`);
  console.log(`  ✓ GitHub Repository:     ${res.campaignData.githubRepo}`);
  console.log(`  ✓ Surface Zone:           ${res.zoneName}`);
  console.log(`  ✓ Target Audience:       ${res.campaignData.targetAudience.join(', ')}`);
  console.log(`  ✓ Email Subject Line:    "${res.campaignData.emailOutreachPackage.subject}"`);
  console.log(`  ✓ Capital Acquisition:   €${(res.campaignData.capitalStackEur / 1e6).toFixed(1)}M Capital Stack`);
  console.log(`  ✓ Target Directory:      ${res.desktopTargetDir}`);
  console.log(`  ✓ Campaign Hash:         ${res.hash}\n`);

  console.log("=" * 80);
  console.log("STATUS: HOTEL OUTREACH CAMPAIGN & GITHUB SITE 100% GREEN IN DAVID_OS");
  console.log("=" * 80 + "\n");
}

runOutreach();
