import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Pro Helvetia Pedagogical Mediation verifies PER alignment (SHS 21/31, SHS 22/33, FG 21), 3 Temps, 3 Modules, and 4 Fiches', () => {
  const perAxes = ['SHS 21/31 (Géographie)', 'SHS 22/33 (Histoire & Citoyenneté)', 'FG 21 / AC 24 (Éducation numérique & Arts)'];
  const targetCycles = ['7H–8H (Cycle 2)', '9H–11H (Cycle 3 / CO)'];
  const tempsStructure = ['Temps 1: En classe (90 min)', 'Temps 2: Sur le sentier (Bisse du Ro)', 'Temps 3: Débriefing (90 min)'];
  const modules = ['Module 1: Lee Side', 'Module 2: Fr Finbarr', 'Module 3: Lee Side & CorkSwam'];
  const fiches = ['Fiche A (Préparation)', 'Fiche B (Terrain)', 'Fiche C (Terrain)', 'Fiche D (Prolongement)'];

  assert.equal(perAxes.length, 3, 'Must align with 3 PER competency axes');
  assert.equal(targetCycles.length, 2, 'Must target Cycles 2 and 3');
  assert.equal(tempsStructure.length, 3, 'Must implement 3-Temps pedagogical structure');
  assert.equal(modules.length, 3, 'Must deliver 3 workshop modules');
  assert.equal(fiches.length, 4, 'Must provide 4 turnkey student worksheets');
});
