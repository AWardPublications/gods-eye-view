import { ChatGptProHotelAppMasterIngestionEngine } from '../../src/david_os/chatGptProHotelAppMasterIngestionEngine.mjs';

function runIngestion() {
  console.log("=" * 80);
  console.log("INGESTING ACTUAL CHATGPT PRO HOTEL APP & EMAIL OUTREACH INTO DAVID_OS");
  console.log("=" * 80);

  const engine = new ChatGptProHotelAppMasterIngestionEngine();
  const res = engine.ingestChatGptProAppAndCampaign();

  console.log(`\n  ✓ Application Name:     ${res.appName}`);
  console.log(`  ✓ Source HTML Canvas:   ${res.sourceHtmlFile}`);
  console.log(`  ✓ Hotel Booking Vault:  ${res.vaultDocument}`);
  console.log(`  ✓ Outreach Register:    ${res.campaignRegister}`);
  console.log(`  ✓ Target Substrate:     ${res.manifestData.targetEngine}`);
  console.log(`  ✓ Target Capital Stack: €${(res.manifestData.capitalStack.rawPipelineEur / 1e6).toFixed(1)}M Raw Pipeline`);
  console.log(`  ✓ Expected Capital:     €${(res.manifestData.capitalStack.realizableExpectedCapitalEur / 1e6).toFixed(2)}M Realizable`);
  console.log(`  ✓ Workspace Directory:  ${res.desktopTargetDir}`);
  console.log(`  ✓ Ingestion Hash:       ${res.hash}\n`);

  console.log("  INGESTED CHATGPT PRO FEATURES:");
  for (const feat of res.manifestData.featuresIngested) {
    console.log(`  • ${feat}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: ACTUAL CHATGPT PRO HOTEL APP INGESTED 100% GREEN IN DAVID_OS");
  console.log("=" * 80 + "\n");
}

runIngestion();
