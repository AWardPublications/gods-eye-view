import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChatGptSitesHotelAppIngestionEngine } from '../../../david_os/chatGptSitesHotelAppIngestionEngine.mjs';

test('1. ChatGptSitesHotelAppIngestionEngine ingests ChatGPT Sites Hotel App and provisions DAVINCIA⁺ 15-folder workspace with €20.0M capital stack', () => {
  const engine = new ChatGptSitesHotelAppIngestionEngine();
  const res = engine.ingestChatGptSiteApp({ siteUrl: 'https://chatgpt.com/g/g-accenture-rival-hotel-app' });

  assert.equal(res.status, 'CHATGPT_SITES_HOTEL_APP_INGESTED_AND_GOVERNED');
  assert.equal(res.totalSubdirsGenerated, 15);
  assert.equal(res.manifestData.governanceRefactoring.controlGatesApplied, 13);
  assert.equal(res.manifestData.capitalStack.rawPipelineEur, 20000000);
  assert.ok(res.hash.length === 64);
});
