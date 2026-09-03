import json
import os
from typing import Dict, Any

class SpatialFloorLockSimulator:
    """
    Embassy Spatial Floor Lock Simulator (DVA-SPATIAL-2026)
    Inspects GRAPH.json role metadata and physically blocks rendering or entry
    into unauthorized floor directories.
    """

    ROLE_FLOOR_ACCESS = {
        "PUBLIC": [1],
        "CLIENT": [1, 2],
        "CONTRACTOR": [1, 2, 3],
        "INVESTOR": [1, 2, 4],
        "BOARD_MEMBER": [1, 2, 4, 5],
        "FOUNDER": [1, 2, 3, 4, 5, 6, 7, 8]
    }

    def __init__(self, graph_metadata: Dict[str, Any]):
        self.graph = graph_metadata

    def attempt_floor_entry(self, user_id: str, floor_id: int) -> Dict[str, Any]:
        user_node = self.graph.get("users", {}).get(user_id)
        if not user_node:
            return {"status": "BLOCKED_UNKNOWN_USER", "user_id": user_id, "floor": floor_id}

        role = user_node.get("role", "PUBLIC")
        allowed_floors = self.ROLE_FLOOR_ACCESS.get(role, [])

        if floor_id not in allowed_floors:
            return {
                "status": "PHYSICALLY_BLOCKED_UNAUTHORIZED_FLOOR",
                "user_id": user_id,
                "role": role,
                "target_floor": floor_id,
                "reason": f"Role '{role}' is not cleared to enter Floor {floor_id} directory.",
                "rm10_routed": True
            }

        return {
          "status": "FLOOR_DIRECTORY_ACCESS_GRANTED",
          "user_id": user_id,
          "role": role,
          "target_floor": floor_id,
          "rendered_path": f"/embassy/floors/FL-0{floor_id}/"
        }

def main():
    print("=" * 80)
    print("EMBASSY SPATIAL FLOOR LOCK & GRAPH.JSON METADATA SIMULATOR")
    print("=" * 80)

    # Mock GRAPH.json metadata
    graph_json = {
        "users": {
            "usr_david_001": {"name": "David Ward", "role": "FOUNDER"},
            "usr_client_88": {"name": "Leon Marks", "role": "CLIENT"},
            "usr_contractor_12": {"name": "Alex Wenger", "role": "CONTRACTOR"}
        }
    }

    simulator = SpatialFloorLockSimulator(graph_json)

    # Test 1: Founder attempts Floor 8 (Vault)
    res1 = simulator.attempt_floor_entry("usr_david_001", 8)
    print(f"Test 1 (Founder -> Floor 8): {res1['status']} -> {res1.get('rendered_path')}")

    # Test 2: Client attempts Floor 2 (Client Lounge)
    res2 = simulator.attempt_floor_entry("usr_client_88", 2)
    print(f"Test 2 (Client -> Floor 2): {res2['status']} -> {res2.get('rendered_path')}")

    # Test 3: Client attempts Floor 6 (Founder's Office - SHOULD BLOCK)
    res3 = simulator.attempt_floor_entry("usr_client_88", 6)
    print(f"Test 3 (Client -> Floor 6): {res3['status']} -> {res3.get('reason')}")

    print("=" * 80)

if __name__ == "__main__":
    main()
