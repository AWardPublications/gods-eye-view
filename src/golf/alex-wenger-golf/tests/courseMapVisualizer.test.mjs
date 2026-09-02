import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('1. course_map_visualizer.html exists and adheres to BREHON Group Branding Standard v1.0', () => {
  const htmlPath = path.resolve('public/course_map_visualizer.html');
  assert.ok(fs.existsSync(htmlPath), 'course_map_visualizer.html must exist in public/');

  const content = fs.readFileSync(htmlPath, 'utf8');

  // Verify BREHON v1.0 Brand Colors & Elements
  assert.ok(content.includes('#051009'), 'Must contain Dark Fairway background #051009');
  assert.ok(content.includes('#44d37e'), 'Must contain Kinetic Green accent #44d37e');
  assert.ok(content.includes('#22c55e'), 'Must contain Rich Fairway Green #22c55e');
  assert.ok(content.includes('WARD STONE — BREHON GOVERNED'), 'Must contain Ward Stone hallmark watermark');
  assert.ok(content.includes('RULE 4.3a TOURNAMENT LOCKOUT'), 'Must contain Rule 4.3a Tournament Lockout Banner');
  assert.ok(content.includes('St Andrews Links'), 'Must contain St Andrews Links Old Course');
  assert.ok(content.includes('Marco Simone'), 'Must contain Marco Simone Golf & Country Club');
});

test('2. course_map_visualizer.html incorporates multi-layer onion skinning architecture', () => {
  const htmlPath = path.resolve('public/course_map_visualizer.html');
  const content = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(content.includes('layerSatellite'), 'Must contain Satellite skin layer toggle');
  assert.ok(content.includes('layerVector'), 'Must contain Vector topography layer toggle');
  assert.ok(content.includes('layerContours'), 'Must contain 0.5m LiDAR slope contours layer toggle');
  assert.ok(content.includes('layerWindParticles'), 'Must contain Live wind particle vectors layer toggle');
  assert.ok(content.includes('layerDoppler'), 'Must contain Doppler rain radar heatmap layer toggle');
  assert.ok(content.includes('layerAgronomic'), 'Must contain Soil moisture VWC% heatmap layer toggle');
  assert.ok(content.includes('layerTrajectory'), 'Must contain 3-DoF Trajectory layer toggle');
});
