import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CulturalTranslationEngine } from '../culturalTranslation/culturalTranslationEngine.mjs';
import { IiifAdapter } from '../adapters/iiifAdapter.js';
import { ArchivesSpaceAdapter } from '../adapters/archivesSpaceAdapter.js';
import { EuropeanaAdapter } from '../adapters/europeanaAdapter.js';
import { LibrePmAdapter } from '../adapters/librePmAdapter.js';
import { runLicenseAudit } from '../../../tools/institutional-license-audit.js';
import { runInstitutionalDiscovery } from '../../../tools/institutional-discovery-engine.mjs';

test('22_Institutional_Interoperability: IIIF, ArchivesSpace & Europeana Adapters conform to contract', async () => {
  const iiif = new IiifAdapter();
  const disc = await iiif.discover('https://iiif.io/api/presentation/3.0/manifest.json');
  assert.equal(disc.status, 'SUPPORTED');

  const res = await iiif.transform({ label: { en: ['Book of Kells'] }, type: 'Manifest' });
  assert.equal(res.status, 'SUPPORTED');
  assert.equal(res.culturalAsset.title, 'Book of Kells');

  const ev = await iiif.evidence(res.culturalAsset);
  assert.equal(ev.status, 'SUPPORTED');
  assert.ok(ev.evidenceRecord.evidenceHash.length === 64);
});

test('23_External_Schema_Mapping: CulturalTranslationEngine maps external schema into DaVinciA+ Cultural Object', () => {
  const engine = new CulturalTranslationEngine();
  const res = engine.translate('ArchivesSpace', { title: 'Sovereign Records Collection', creator: 'A.Ward Publications' }, 'corkonian');

  assert.equal(res.status, 'CULTURAL_TRANSLATION_SUCCESSFUL');
  assert.equal(res.culturalObject.domainPack, 'corkonian');
  assert.equal(res.culturalObject.title, 'Sovereign Records Collection');
  assert.equal(res.culturalObject.authority.gpgKey, '0x80D0ADA1');
  assert.ok(res.assetHash.length === 64);
});

test('24_Cultural_Provenance: ArchivesSpace adapter tracks EAD3 archival custody and extent', async () => {
  const as = new ArchivesSpaceAdapter();
  const res = await as.transform({ title: 'Cork Archival Vaults', ead_id: 'ead_cork_01', extents: [{ number: 10, extent_type: 'boxes' }] });

  assert.equal(res.status, 'SUPPORTED');
  assert.equal(res.culturalAsset.extent, '10 boxes');
});

test('25_Rights_And_Licensing: Europeana adapter enforces EDM rights and licenses', async () => {
  const europeana = new EuropeanaAdapter();
  const res = await europeana.transform({ title: 'Valais Alpine Heritage Photo', rights: ['http://creativecommons.org/licenses/by/4.0/'] });

  assert.equal(res.status, 'SUPPORTED');
  assert.equal(res.culturalAsset.rights, 'http://creativecommons.org/licenses/by/4.0/');
});

test('28_Grant_Lifecycle: LibrePmAdapter maps grant lifecycle to GRANT GEDHI Capital OS', async () => {
  const libre = new LibrePmAdapter();
  const res = await libre.transformGrantLifecycle({ id: 'EIC_2026_50M', title: 'Governed AI Capital Grant', amountEur: 25000000 });

  assert.equal(res.status, 'SUPPORTED');
  assert.equal(res.gedhiGrantObject.requestedCapitalEur, 25000000);
  assert.equal(res.gedhiGrantObject.hitlApprovalRequired, true);
});

test('31_Supply_Chain: License Audit and Discovery Engines classify 25 institutional candidates', () => {
  const audit = runLicenseAudit();
  assert.equal(audit.status, 'LICENSE_AUDIT_SUCCESSFUL');
  assert.equal(audit.totalToolsAudited, 25);

  const discovery = runInstitutionalDiscovery();
  assert.equal(discovery.status, 'INSTITUTIONAL_DISCOVERY_SUCCESSFUL');
  assert.equal(discovery.toolsEvaluated, 25);
});
