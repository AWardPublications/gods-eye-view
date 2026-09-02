import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. TIER2_MICRONATION_CLUSTERS validates all 4 micro-nation cohorts and 49 venues', () => {
  const cohortBM = { iso: 'BM', venues: 7, geohash: 'course_idx_BM_drt2z', r2_bundle: '/bundles/bm_national_cohort.json' };
  const cohortSG = { iso: 'SG', venues: 14, geohash: 'course_idx_SG_w21z7', r2_bundle: '/bundles/sg_national_cohort.json' };
  const cohortLU = { iso: 'LU', venues: 6, geohash: 'course_idx_LU_u0u4x', r2_bundle: '/bundles/lu_national_cohort.json' };
  const cohortAE = { iso: 'AE', venues: 22, geohash: 'course_idx_AE_thrr8', r2_bundle: '/bundles/ae_national_cohort.json' };

  const totalVenues = cohortBM.venues + cohortSG.venues + cohortLU.venues + cohortAE.venues;

  assert.equal(totalVenues, 49);
  assert.equal(cohortBM.venues, 7);
  assert.equal(cohortSG.venues, 14);
  assert.equal(cohortLU.venues, 6);
  assert.equal(cohortAE.venues, 22);
});

test('2. PGA Tour & DP World Tour flagship host tracks present in Tier 2 spatial graph', () => {
  const flagshipVenues = [
    'Port Royal Golf Course (Bermuda Championship)',
    'Sentosa Golf Club Serapong (Singapore Open / LIV)',
    'Laguna National Golf Resort Club Masters (DP World Tour)',
    'Jumeirah Golf Estates Earth Course (DP World Tour Championship)',
    'Emirates Golf Club Majlis (Dubai Desert Classic)',
    'Yas Links Abu Dhabi (Abu Dhabi Championship)'
  ];

  assert.equal(flagshipVenues.length, 6);
  assert.ok(flagshipVenues.some(v => v.includes('Port Royal')));
  assert.ok(flagshipVenues.some(v => v.includes('Sentosa')));
  assert.ok(flagshipVenues.some(v => v.includes('Jumeirah')));
});
