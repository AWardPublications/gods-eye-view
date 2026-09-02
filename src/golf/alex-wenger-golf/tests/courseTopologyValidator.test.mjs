import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CourseTopologyValidator } from '../core/spatial/courseTopologyValidator.js';
import { runCourseRegistryAudit } from '../../../../scripts/auditCourseRegistry.js';

test('1. CourseTopologyValidator executes 6-check audit cleanly on valid course GeoJSON', () => {
  const validator = new CourseTopologyValidator();
  const mockGeoJSON = {
    holeCount: 18,
    features: [
      { properties: { subsystem: 'main_green', hole: '11', dual_green_type: 'MAIN_GREEN_A' }, geometry: { coordinates: [[[-2.80, 56.34], [-2.801, 56.341], [-2.80, 56.341], [-2.80, 56.34]]] } },
      { properties: { subsystem: 'sub_green', hole: '11', dual_green_type: 'SUB_GREEN_B' }, geometry: { coordinates: [[[-2.802, 56.342], [-2.803, 56.343], [-2.802, 56.343], [-2.802, 56.342]]] } },
      { properties: { subsystem: 'tee', hole: '11' }, geometry: { coordinates: [[[-2.805, 56.345], [-2.806, 56.346], [-2.805, 56.346], [-2.805, 56.345]]] } }
    ]
  };

  const scorecard = { 11: { yards: 164 } };
  const report = validator.validateCourse('camiral_stadium', mockGeoJSON, scorecard);

  assert.equal(report.valid, true);
  assert.equal(report.holeCount, 18);
  assert.equal(report.criticalErrors.length, 0);
  assert.equal(report.apacDualGreenVerified, true);
});

test('2. CourseTopologyValidator flags unrealistic vector distances as critical errors', () => {
  const validator = new CourseTopologyValidator();
  const invalidGeoJSON = {
    holeCount: 18,
    features: [
      { properties: { subsystem: 'green', hole: '1' }, geometry: { coordinates: [[[10.0, 50.0], [10.1, 50.1], [10.0, 50.1], [10.0, 50.0]]] } },
      { properties: { subsystem: 'tee', hole: '1' }, geometry: { coordinates: [[[-10.0, -50.0], [-10.1, -50.1], [-10.0, -50.1], [-10.0, -50.0]]] } }
    ]
  };

  const report = validator.validateCourse('broken_course', invalidGeoJSON);
  assert.equal(report.valid, false);
  assert.ok(report.criticalErrors.length > 0);
  assert.ok(report.criticalErrors[0].includes('Unrealistic hole distance'));
});

test('3. runCourseRegistryAudit executes CLI topology audit across core database courses', () => {
  const auditRes = runCourseRegistryAudit({ strict: false });
  assert.ok(auditRes.totalAudited >= 27);
  assert.equal(auditRes.errorCount, 0);
  assert.equal(auditRes.passedCount, auditRes.totalAudited);
});
