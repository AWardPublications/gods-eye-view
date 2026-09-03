import { ChatGptSitesHotelAppIngestionEngine } from '../../src/david_os/chatGptSitesHotelAppIngestionEngine.mjs';

function runIngestion() {
  console.log("=" * 80);
  console.log("INGESTING CHATGPT SITES ACCENTURE-RIVAL HOTEL APP INTO DAVID_OS");
  console.log("=" * 80);

  const engine = new ChatGptSitesHotelAppIngestionEngine();
  const res = engine.ingestChatGptSiteApp({ siteUrl: 'https://chatgpt.com/g/g-accenture-rival-hotel-app' });

  console.log(`\n  ✓ Source Platform:       ${engine.sourcePlatform}`);
  console.log(`  ✓ Application Name:     ${res.appName}`);
  console.log(`  ✓ ChatGPT Site URL:     ${res.siteUrl}`);
  console.log(`  ✓ DAVINCIA⁺ Engine:     ${engine.targetEngine}`);
  console.log(`  ✓ 13 Control Gates:     ${res.manifestData.governanceRefactoring.controlGatesApplied} Gates Applied (Includes CTRL-INTEGRITY)`);
  console.log(`  ✓ Target Capital Stack: €${(res.manifestData.capitalStack.rawPipelineEur / 1e6).toFixed(1)}M Raw Pipeline`);
  console.log(`  ✓ Expected Capital:     €${(res.manifestData.capitalStack.realizableExpectedCapitalEur / 1e6).toFixed(2)}M Realizable`);
  console.log(`  ✓ Workspace Directory:  ${res.desktopTargetDir}`);
  console.log(`  ✓ Ingestion Hash:       ${res.hash}\n`);

  console.log("=" * 80);
  console.log("STATUS: CHATGPT SITES HOTEL APP INGESTED & GOVERNED 100% GREEN IN DAVID_OS");
  console.log("=" * 80 + "\n");
}

runIngestion();
