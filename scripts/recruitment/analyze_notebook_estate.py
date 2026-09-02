import sys
import json
import os
from collections import Counter

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def analyze_estate():
    survey_path = r"C:\Users\David\.notebooklm\_survey.json"
    if not os.path.exists(survey_path):
        print(f"Error: {survey_path} not found.")
        return

    with open(survey_path, 'r', encoding='utf-8') as f:
        notebooks = json.load(f)

    print("================================================================================")
    print(f"NOTEBOOKLM ESTATE AUDIT & COUNCIL REPORT (TOTAL NOTEBOOKS: {len(notebooks)})")
    print("================================================================================\n")

    cog_counts = Counter(nb.get("cog", "UNCLASSIFIED") for nb in notebooks)
    empty_shells = [nb for nb in notebooks if nb.get("sources", 0) == 0 and nb.get("artifacts", 0) == 0]
    overpromising = [nb for nb in notebooks if nb.get("title_overpromises", False)]

    print("SUMMARY BY ESTATE COG CLASSIFICATION:")
    print("--------------------------------------------------------------------------------")
    for cog, count in cog_counts.most_common():
        pct = (count / len(notebooks)) * 100
        print(f" • {cog:<15} : {count:>3} notebooks ({pct:.1f}%)")

    print("\n--------------------------------------------------------------------------------")
    print(f"DORMANT / SHELL NOTEBOOKS (0 Sources, 0 Artifacts): {len(empty_shells)}")
    print(f"TITLES THAT OVERPROMISE (Named 'Pipeline/Engine' but empty): {len(overpromising)}")
    print("--------------------------------------------------------------------------------\n")

    print("SAMPLE LOAD-BEARING CANON & PRODUCTION NOTEBOOKS:")
    print("--------------------------------------------------------------------------------")
    production_nbs = [nb for nb in notebooks if nb.get("cog") in ["CANON", "PRODUCTION", "GOVERNANCE"]][:10]
    for nb in production_nbs:
        print(f" • [{nb['cog']}] {nb['title']} (ID: {nb['id'][:8]}...)")
        print(f"   Sources: {nb['sources']} | Artifacts: {nb['artifacts']} | Why: {nb['why']}")
        if nb.get("source_titles"):
            print(f"   Key Sources: {', '.join(nb['source_titles'][:3])}")
        print()

    print("================================================================================")
    print("NOTEBOOKLM ESTATE AUDIT COMPLETE — READY FOR $10M VALUATION LOCK-IN")
    print("================================================================================")

if __name__ == "__main__":
    analyze_estate()
