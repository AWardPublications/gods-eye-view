import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IiifCulturalBridgeAdapter } from '../adapters/iiifCulturalBridgeAdapter.js';

test('IIIF-CULTURAL-BRIDGE-001: Sandboxed IIIF Adapter transforms raw manifest into governed asset', async () => {
  const adapter = new IiifCulturalBridgeAdapter();
  const rawManifest = {
    label: { en: ['The Book of Kells (MS 58)'] },
    provider: [{ label: { en: ['Trinity College Dublin'] } }],
    rights: 'http://rightsstatements.org/vocab/NoC-NC/1.0/',
    items: [{ id: 'canvas_1', width: 4000, height: 6000 }]
  };

  const res = await adapter.ingestManifest('https://digitalcollections.tcd.ie/manifests/ms58', rawManifest);

  assert.equal(res.status, 'INGESTION_SUCCESSFUL');
  assert.equal(res.culturalObject.title, 'The Book of Kells (MS 58)');
  assert.equal(res.culturalObject.provider, 'Trinity College Dublin');
  assert.equal(res.culturalObject.governance.gpg_authority, '0x80D0ADA1');
  assert.ok(res.assetHash.length === 64);
});
