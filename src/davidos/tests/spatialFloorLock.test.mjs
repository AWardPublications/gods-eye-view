import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SpatialFloorLockEngine } from '../spatialFloorLockEngine.mjs';

test('113_Spatial_Floor_Lock_Founder_Vault_Granted: Grants Founder access to Floor 8 directory', () => {
  const engine = new SpatialFloorLockEngine({
    users: {
      usr_david: { role: 'FOUNDER' }
    }
  });

  const res = engine.evaluateDirectoryAccess('usr_david', 8);

  assert.equal(res.status, 'FLOOR_DIRECTORY_ACCESS_GRANTED');
  assert.equal(res.rendered_path, '/embassy/floors/FL-08/');
});

test('114_Spatial_Floor_Lock_Client_Founder_Office_Blocked: Hard-blocks Client attempt to access Floor 6 directory', () => {
  const engine = new SpatialFloorLockEngine({
    users: {
      usr_client: { role: 'CLIENT' }
    }
  });

  const res = engine.evaluateDirectoryAccess('usr_client', 6);

  assert.equal(res.status, 'PHYSICALLY_BLOCKED_UNAUTHORIZED_FLOOR');
  assert.equal(res.rm10_routed, true);
});
