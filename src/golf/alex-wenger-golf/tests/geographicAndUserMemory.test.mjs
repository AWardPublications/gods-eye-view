import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createUserGolfMemory, updateUserGolfMemory } from '../core/memory/userMemory.js';
import { generateGolfOverpassQuery, parseOsmToGeoJson } from '../core/data/overpassGolfIngestor.js';

test('geographic_memory_engine.json includes Spanish Regional Cohorts including Valderrama, El Saler, Puerta de Hierro', () => {
  const filePath = join(process.cwd(), 'src/golf/data/geographic_memory_engine.json');
  const rawData = readFileSync(filePath, 'utf-8');
  const db = JSON.parse(rawData);

  const spanishCourses = [
    'valderrama_golf_club',
    'el_saler_golf',
    'finca_cortesin',
    'puerta_de_hierro_arriba',
    'el_prat_pink',
    'pga_catalunya_stadium',
  ];

  spanishCourses.forEach(id => {
    assert.ok(db.courses[id], `Spanish course ${id} should exist in geographic memory`);
  });

  // Verify Real Club Valderrama
  const valderrama = db.courses.valderrama_golf_club;
  assert.equal(valderrama.name, 'Real Club Valderrama');
  assert.equal(valderrama.cohort, 'Andalusia & Sotogrande');
  assert.ok(valderrama.subagent_directives.tailor.includes('cork oak'));

  // Verify Puerta de Hierro (Thin-air +3% carry)
  const puerta = db.courses.puerta_de_hierro_arriba;
  assert.equal(puerta.elevation_m, 660);
  assert.equal(puerta.environmental_constants.base_air_density_delta, '-4.2%');
  assert.ok(puerta.subagent_directives.sticks.includes('+3% carry'));
});
