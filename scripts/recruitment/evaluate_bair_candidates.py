import sys
import os
import json

sys.path.append(os.path.abspath('C:/Users/David/brehon-ai-recruitment-os'))

from services.matching.matching_engine import BAIRMatchingEngine
from services.matching.schemas import CandidateProfile, RoleRequisition

def evaluate_candidates():
    print("================================================================================")
    print("BAIR CANDIDATE MATCHING & QUALIFICATION RUNTIME (ST ANDREWS / SION)")
    print("================================================================================\n")

    engine = BAIRMatchingEngine()

    role = RoleRequisition(
        req_id="BAIR-REQ-2026-01",
        role_title="Senior WASM / Rust Systems Engineer",
        day_rate_gbp=750.0,
        required_skills=["Rust", "WebAssembly", "RK4 Solver", "Sub-15ms Latency", "GPG Signing"],
        clearance_tier="TIER_1_DEFENSE_GRC"
    )

    candidates = [
        CandidateProfile("CAND-001", "Alastair MacLeod", "alastair@edinburgh-wasm.io", ["Rust", "WebAssembly", "RK4 Solver", "Sub-15ms Latency", "GPG Signing"], 8.5, "GPG-77A1-B902", True),
        CandidateProfile("CAND-002", "Elena Rossi", "elena@zurich-systems.ch", ["Rust", "WebAssembly", "RK4 Solver", "C++"], 7.0, "GPG-88F3-C119", True),
        CandidateProfile("CAND-003", "Niall O'Connor", "niall@dublin-mesh.ie", ["Rust", "WebAssembly", "Sub-15ms Latency", "Python"], 6.0, "GPG-33E2-A441", False),
        CandidateProfile("CAND-004", "Sophie Weber", "sophie@basel-biopharma.ch", ["Rust", "WebAssembly", "RK4 Solver", "GAMP 5", "GPG Signing"], 9.0, "GPG-99D4-E882", True),
        CandidateProfile("CAND-005", "Marcus Vance", "marcus@london-edge.uk", ["Rust", "C++", "WebGL 2.0", "Three.js"], 5.5, "GPG-11B5-F663", False)
    ]

    matched_candidates = []
    for cand in candidates:
        res = engine.match_candidate_to_role(cand.skills, role.required_skills)
        matched_candidates.append({
            "candidate_id": cand.candidate_id,
            "name": cand.name,
            "email": cand.email,
            "match_score": res["match_score"],
            "match_percentage": res["match_percentage"],
            "matched_skills": res["matched_skills"],
            "missing_skills": res["missing_skills"],
            "gpg_signed": cand.gpg_key_id is not None,
            "unit_test_conformance": cand.unit_test_conformance
        })

    # Sort by match score descending
    matched_candidates.sort(key=lambda x: x["match_score"], reverse=True)

    print(f"Role: {role.role_title} (Req: {role.req_id}) @ £{role.day_rate_gbp:.0f}/day")
    print(f"Required Skills: {', '.join(role.required_skills)}\n")
    print("MATCHED CANDIDATE RANKINGS:")
    print("--------------------------------------------------------------------------------")

    for i, c in enumerate(matched_candidates, 1):
        print(f" [{i}] {c['name']} ({c['candidate_id']}) — Match: {c['match_percentage']} (Score: {c['match_score']:.2f})")
        print(f"     Email: {c['email']} | GPG Key: {c['gpg_signed']} | Conformance: {c['unit_test_conformance']}")
        print(f"     Matched: {', '.join(c['matched_skills'])}")
        if c['missing_skills']:
            print(f"     Missing: {', '.join(c['missing_skills'])}")
        print()

    print("================================================================================")
    print("TOP 2 CANDIDATES QUALIFIED FOR BAIR-ENG-CHALLENGE-2026-01 (WASM BALLISTICS)")
    print("================================================================================")

if __name__ == "__main__":
    evaluate_candidates()
