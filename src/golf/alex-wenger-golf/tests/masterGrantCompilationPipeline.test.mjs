import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MasterGrantCompilationPipeline } from '../../../agents/masterGrantCompilationPipeline.mjs';

test('1. MasterGrantCompilationPipeline compiles submission-ready dossiers passing evaluator rubrics and medical scope gates', () => {
  const pipeline = new MasterGrantCompilationPipeline();
  const sampleTarget = { id: 'G-IE-01', name: 'EIC Accelerator Blended Finance', entity: 'Brehon AI Solutions Ltd', amount: '€17,500,000' };

  const res = pipeline.compileGrantPackage(sampleTarget);

  assert.equal(res.compilationStatus, 'PASSED_100_PERCENT_GREEN', 'Package must achieve 100% green compilation status');
  assert.equal(res.boundaryCheck.isCleared, true, 'Medical scope gate must intercept clinical claims and clear non-medical athletic framing');
  assert.ok(res.evaluation.scores.overall >= 85, 'Evaluator persona swarm score must exceed 85/100 threshold');
  assert.equal(res.fiscalAllocation.jurisdiction, 'Dublin / Kinsale, Ireland (CRO 790337)');
});
