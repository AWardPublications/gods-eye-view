import sys
import os
import json

sys.path.append(os.path.abspath('C:/Users/David/brehon-ai-recruitment-os'))

from services.matching.matching_engine import BAIRMatchingEngine

def evaluate_golf_pros():
    print("================================================================================")
    print("BAIR GOLF PROFESSIONAL PLACEMENT ENGINE (ST ANDREWS / SION CORRIDOR)")
    print("================================================================================\n")

    engine = BAIRMatchingEngine()

    role = {
        "req_id": "BAIR-GOLF-2026-01",
        "role_title": "Director of High Performance & TrackMan Academy",
        "venue": "Crans-sur-Sierre / Sion Indoor Performance Center (Switzerland)",
        "annual_salary_chf": 140000.0,
        "commission_rate": 0.20
    }

    candidates = [
        {
            "id": "PRO-001",
            "name": "Callum Montgomery, PGA Master Professional",
            "location": "St Andrews, Scotland",
            "pga_accreditation_tier": 1.0,
            "technology_competency": 0.95,
            "coaching_pedigree": 0.90,
            "commercial_retail_acumen": 0.85,
            "geographic_mobility": 1.0,
            "cultural_alignment": 0.95
        },
        {
            "id": "PRO-002",
            "name": "Jean-Luc Blanc, PGA Fellow Professional",
            "location": "Geneva, Switzerland",
            "pga_accreditation_tier": 0.90,
            "technology_competency": 0.85,
            "coaching_pedigree": 0.80,
            "commercial_retail_acumen": 0.90,
            "geographic_mobility": 0.80,
            "cultural_alignment": 1.0
        },
        {
            "id": "PRO-003",
            "name": "David O'Reilly, PGA Class A Professional",
            "location": "Dublin, Ireland",
            "pga_accreditation_tier": 0.80,
            "technology_competency": 0.90,
            "coaching_pedigree": 0.85,
            "commercial_retail_acumen": 0.75,
            "geographic_mobility": 0.90,
            "cultural_alignment": 0.85
        }
    ]

    print(f"Role: {role['role_title']} ({role['req_id']})")
    print(f"Venue: {role['venue']}")
    print(f"Annual Salary: CHF {role['annual_salary_chf']:,.2f} | BAIR Fee (20%): CHF {role['annual_salary_chf']*0.20:,.2f}\n")
    print("MATCHED GOLF PROFESSIONAL RANKINGS:")
    print("--------------------------------------------------------------------------------")

    for c in candidates:
        res = engine.match_golf_professional(c, role)
        print(f" • {c['name']} ({c['location']})")
        print(f"   Composite Match Score: {res['match_percentage']} (Score: {res['composite_match_score']:.4f})")
        print(f"   Estimated Placement Fee: CHF {res['estimated_placement_fee_chf']:,.2f}")
        print(f"   Governance Status: {res['governance_status']}")
        print()

    print("================================================================================")
    print("BAIR GOLF PROFESSIONAL PLACEMENT PIPELINE ACTIVE")
    print("================================================================================")

if __name__ == "__main__":
    evaluate_golf_pros()
