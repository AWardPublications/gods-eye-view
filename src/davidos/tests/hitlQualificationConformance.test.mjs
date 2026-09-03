import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlQualificationEngine } from '../hitlQualificationEngine.mjs';
import { HitlSimulationExamEngine } from '../hitlSimulationExamEngine.mjs';

test('64_Hitl_7_Layer_Qualification_Evaluation: Evaluates candidate against 7 qualification layers', () => {
  const engine = new HitlQualificationEngine();
  const res = engine.evaluateHitlCandidate('Dr. Sarah Lin', 'dom_04', {
    1: 95, 2: 90, 3: 88, 4: 92, 5: 85, 6: 94, 7: 96
  });

  assert.equal(res.qualification_status, 'QUALIFIED_EMBASSY_HITL');
  assert.equal(res.name, 'Dr. Sarah Lin');
  assert.ok(res.cert_hash.length === 64);
});

test('65_Hitl_Simulation_Exam_Automation_Bias_Test: Candidate catches injected AI errors in simulation exam', () => {
  const sim = new HitlSimulationExamEngine();
  const cases = [
    { caseId: 'c1', containsInjectedError: true, candidateDecision: 'REJECT' },
    { caseId: 'c2', containsInjectedError: true, candidateDecision: 'STOP' },
    { caseId: 'c3', containsInjectedError: false, candidateDecision: 'APPROVE' }
  ];

  const exam = sim.runSimulationExam('hitl_sarah_lin', 'dom_04', cases);

  assert.equal(exam.result, 'PASSED_EMBASSY_HITL_SIMULATION');
  assert.equal(exam.metrics.detectionRatePercent, 100.0);
  assert.equal(exam.metrics.falseAcceptances, 0);
});

test('66_Hitl_4_Panel_Separation_Of_Duties: Panel contains 4 distinct role codes per domain', () => {
  const engine = new HitlQualificationEngine();
  assert.equal(engine.panelRoles.length, 4);
  assert.equal(engine.panelRoles[0].roleCode, 'HITL_A');
  assert.equal(engine.panelRoles[3].roleCode, 'HITL_D'); // Adversarial
});
