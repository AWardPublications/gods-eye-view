import { createHash } from 'node:crypto';

/**
 * EMBASSY HITL QUALIFICATION ENGINE (DAVINCIA-HITL-QUALIFICATION-v1.0)
 * Implements EU AI Act Art. 14 & NIST AI RMF compliant 7-Layer Qualification Standard for Human Oversight.
 */
export class HitlQualificationEngine {
  constructor() {
    this.qualificationLayers = [
      { layer: 1, code: 'DOMAIN_QUALIFICATION', title: 'Genuine Domain Professional Expertise' },
      { layer: 2, code: 'AI_SYSTEM_LITERACY', title: 'AI System Capabilities & Limitations Literacy' },
      { layer: 3, code: 'GOVERNANCE_COMPETENCE', title: 'DaVinciA+ Governance & Fail-Closed Protocols' },
      { layer: 4, code: 'REVIEW_CHALLENGE_SKILL', title: 'Machine Challenge & Automation Bias Resistance' },
      { layer: 5, code: 'DELEGATED_AUTHORITY', title: 'Delegated Scope, Override & Emergency Stop Power' },
      { layer: 6, code: 'EVIDENCE_AUDIT_COMPETENCE', title: 'Defensible Audit Trail & Rationale Documentation' },
      { layer: 7, code: 'HUMAN_JUDGEMENT', title: 'Ethical Reasoning & Courageous Interruption' }
    ];

    this.panelRoles = [
      { roleCode: 'HITL_A', name: 'Domain Authority', focus: 'Subject-matter correctness and domain safety' },
      { roleCode: 'HITL_B', name: 'AI / Systems Reviewer', focus: 'AI model behavior, context window, and RAG verification' },
      { roleCode: 'HITL_C', name: 'Risk / Governance Reviewer', focus: 'Authority ceiling, legal risk, and systemic compliance' },
      { roleCode: 'HITL_D', name: 'Adversarial / Independent Reviewer', focus: 'Red-teaming assumptions and challenging consensus' }
    ];
  }

  evaluateHitlCandidate(candidateName, domainId, layerScores) {
    // layerScores is an object mapping layer 1-7 to score out of 100
    const scoreValues = Object.values(layerScores);
    const avgScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

    const isQualified = scoreValues.every(s => s >= 80); // All 7 layers must be >= 80%

    const timestamp = new Date().toISOString();
    const candidateId = `hitl_${createHash('md5').update(`${candidateName}:${domainId}:${timestamp}`).digest('hex').substring(0, 10)}`;

    return {
      candidate_id: candidateId,
      name: candidateName,
      domain_id: domainId,
      layer_scores: layerScores,
      average_score: avgScore,
      qualification_status: isQualified ? 'QUALIFIED_EMBASSY_HITL' : 'REJECTED_INSUFFICIENT_COMPETENCE',
      certified_at: isQualified ? timestamp : null,
      cert_hash: isQualified ? createHash('sha256').update(candidateName + domainId + avgScore).digest('hex') : null
    };
  }
}
