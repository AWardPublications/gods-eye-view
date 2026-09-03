/**
 * SPATIAL FLOOR LOCK ENGINE (DVA-SPATIAL-2026)
 * Enforces GRAPH.json role metadata access control for physical-digital directory navigation.
 */
export class SpatialFloorLockEngine {
  constructor(graphMetadata = {}) {
    this.graph = graphMetadata;
    this.roleAccessMap = {
      PUBLIC: [1],
      CLIENT: [1, 2],
      CONTRACTOR: [1, 2, 3],
      INVESTOR: [1, 2, 4],
      BOARD_MEMBER: [1, 2, 4, 5],
      FOUNDER: [1, 2, 3, 4, 5, 6, 7, 8]
    };
  }

  evaluateDirectoryAccess(userId, targetFloor) {
    const userNode = this.graph.users?.[userId];
    if (!userNode) {
      return { status: 'BLOCKED_UNKNOWN_USER', user_id: userId, target_floor: targetFloor };
    }

    const role = userNode.role || 'PUBLIC';
    const allowed = this.roleAccessMap[role] || [];

    if (!allowed.includes(targetFloor)) {
      return {
        status: 'PHYSICALLY_BLOCKED_UNAUTHORIZED_FLOOR',
        user_id: userId,
        role,
        target_floor: targetFloor,
        reason: `Role ${role} is not cleared to enter Floor ${targetFloor} directory.`,
        rm10_routed: true
      };
    }

    return {
      status: 'FLOOR_DIRECTORY_ACCESS_GRANTED',
      user_id: userId,
      role,
      target_floor: targetFloor,
      rendered_path: `/embassy/floors/FL-0${targetFloor}/`
    };
  }
}
