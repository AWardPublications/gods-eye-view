import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTINENTAL_EUROPE_COURSES } from '../../../../scripts/ingest_eu_continental_cluster.js';
import { calculate3DoFBallistics } from '../core/architecture/openSourceStack.js';
import geographicMemoryDb from '../../data/geographic_memory_engine.json' with { type: 'json' };

test('1. CONTINENTAL_EUROPE_COURSES registry contains 20 European championship tracks', () => {
  assert.equal(CONTINENTAL_EUROPE_COURSES.length, 20);
  assert.equal(CONTINENTAL_EUROPE_COURSES[0].course_id, 'marco_simone');
  assert.equal(CONTINENTAL_EUROPE_COURSES[18].course_id, 'crans_sur_sierre');
});

test('2. geographic_memory_engine.json includes Marco Simone, Crans-sur-Sierre, and Bro Hof Slott', () => {
  assert.ok(geographicMemoryDb.courses.marco_simone !== undefined);
  assert.equal(geographicMemoryDb.courses.marco_simone.country_code, 'IT');
  assert.equal(geographicMemoryDb.courses.marco_simone.par, 72);

  assert.ok(geographicMemoryDb.courses.crans_sur_sierre !== undefined);
  assert.equal(geographicMemoryDb.courses.crans_sur_sierre.location.elevation_m, 1500);

  assert.ok(geographicMemoryDb.courses.bro_hof_slott !== undefined);
  assert.equal(geographicMemoryDb.courses.bro_hof_slott.country_code, 'SE');
});

test('3. Crans-sur-Sierre 1500m Alpine thin-air calculates reduced aerodynamic drag', () => {
  const ballistics = calculate3DoFBallistics({
    distanceYards: 160,
    headwindMph: 0,
    crosswindMph: 0,
    altitudeFt: 4921 // 1500m in feet
  });

  // At 1500m elevation, ball carries ~7.5% farther in thin mountain air
  assert.ok(ballistics.plays_like_yds < 160, 'Alpine elevation should reduce effective plays-like yardage');
  assert.ok(ballistics.plays_like_yds <= 152.0, '1500m altitude should reduce 160y shot to <= 152y');
});
