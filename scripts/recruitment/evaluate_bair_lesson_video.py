import sys
import json

def evaluate_lesson_video(candidate_name, pga_id, video_url, scores, notes):
    """
    Evaluates a 30-minute studio lesson video against BAIR-EVAL-VIDEO-2026-01.
    """
    print("================================================================================")
    print("BAIR PRACTICAL COACHING AUDIT & LESSON VIDEO EVALUATOR (ST ANDREWS / SION)")
    print("================================================================================\n")

    diag_pts = min(max(scores.get("diagnostic_pts", 0), 0), 25)
    trans_pts = min(max(scores.get("translation_pts", 0), 0), 25)
    drill_pts = min(max(scores.get("drill_pts", 0), 0), 20)
    data_pts = min(max(scores.get("data_pts", 0), 0), 15)
    gov_pts = min(max(scores.get("governance_pts", 0), 0), 15)

    total_score = diag_pts + trans_pts + drill_pts + data_pts + gov_pts

    if total_score >= 90:
        verdict = "Elite Pro (Platinum)"
        status = "APPROVED_DIRECT_SHORTLIST"
    elif total_score >= 80:
        verdict = "Recommended (Gold)"
        status = "APPROVED_PLACEMENT"
    elif total_score >= 70:
        verdict = "Conditional (Silver)"
        status = "SECONDARY_REVIEW_REQUIRED"
    else:
        verdict = "Rejected"
        status = "REJECTED_DEVELOPMENTAL_FEEDBACK"

    print(f"Candidate Name: {candidate_name} | PGA ID: {pga_id}")
    print(f"Video URL: {video_url}\n")
    print("AUDIT DIMENSION SCORES:")
    print("--------------------------------------------------------------------------------")
    print(f" 1. Diagnostic Competency & Root Cause Isolation: {diag_pts} / 25 Pts")
    print(f" 2. Technical Translation & Pedagogical Economy:  {trans_pts} / 25 Pts")
    print(f" 3. Prescriptive Intervention & Drill Selection:  {drill_pts} / 20 Pts")
    print(f" 4. Measurable Data & Flight Verification:        {data_pts} / 15 Pts")
    print(f" 5. Interpersonal Presence & Session Governance:  {gov_pts} / 15 Pts")
    print("--------------------------------------------------------------------------------")
    print(f" TOTAL AUDIT SCORE: {total_score} / 100 Pts")
    print(f" VERDICT CLASSIFICATION: {verdict}")
    print(f" AUDIT ACTION STATUS: {status}\n")

    print("AUDITOR EVIDENCE NOTES:")
    for category, note in notes.items():
        print(f" • {category}: {note}")

    print("\n================================================================================")

    return {
        "candidate_name": candidate_name,
        "pga_id": pga_id,
        "total_score": total_score,
        "verdict": verdict,
        "status": status
    }

if __name__ == "__main__":
    sample_scores = {
        "diagnostic_pts": 24,
        "translation_pts": 23,
        "drill_pts": 18,
        "data_pts": 14,
        "governance_pts": 14
    }
    sample_notes = {
        "Diagnostic": "Isolated pelvic deceleration as primary cause of +7° push hook at 04:12 timestamp.",
        "Translation": "Clear 2-sentence explanation of spin loft vs path. Kept student focused on feel vs real.",
        "Intervention": "Implemented Smart2Move ground anchor step-drill reducing path to +2.1°.",
        "Verification": "Showed TrackMan screen before/after comparison showing 65% dispersion improvement.",
        "Governance": "Impeccable PGA attire, punctual 30-min structure with summary recap."
    }
    evaluate_lesson_video("Callum Montgomery", "PGA-GB-948201", "https://vimeo.com/unlisted/bair-lesson-948201", sample_scores, sample_notes)
