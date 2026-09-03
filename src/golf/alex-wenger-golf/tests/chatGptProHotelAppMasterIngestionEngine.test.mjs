import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChatGptProHotelAppMasterIngestionEngine } from '../../../david_os/chatGptProHotelAppMasterIngestionEngine.mjs';

test('1. ChatGptProHotelAppMasterIngestionEngine locates actual ChatGPT Pro HTML Canvas, Vault document, and Outreach register, ingesting them with €20.0M capital stack', () => {
  const engine = new ChatGptProHotelAppMasterIngestionEngine();
  const res = engine.ingestChatGptProAppAndCampaign();

  assert.equal(res.status, 'CHATGPT_PRO_HOTEL_APP_AND_CAMPAIGN_SUCCESSFULLY_INGESTED');
  assert.equal(res.totalSubdirsGenerated, 15);
  assert.equal(res.manifestData.featuresIngested.length, 4);
  assert.equal(res.manifestData.capitalStack.rawPipelineEur, 20000000);
  assert.ok(res.hash.length === 64);
});
