import { createHash } from 'node:crypto';

/**
 * GOVERNANCE EXECUTION STACK (GXS): DAVINCIA-HITL-ROUTER-v1.0
 * Programmatic Asynchronous Escalation Engine.
 * Enforces the Spatial Separation Doctrine: When confidence < 0.85 or risk gate triggers,
 * halts execution, packages a static escalation bundle, and awaits asynchronous HITL sign-off,
 * producing hitl_decision.json and hitl_rationale.md.
 */
export class HitlRouterEngine {
  constructor() {
    this.confidenceFloor = 0.85;
  }

  routeAgentAction(agentId, actionName, riskTier = 'MEDIUM', financialAmountEur = 0) {
    if (financialAmountEur > 50000 || riskTier === 'CRITICAL') {
      return {
        assigned_domain: { id: 'dom_07', name: 'Finance / Capital / Commercial' },
        required_authority_level: 'LEVEL_0_SOVEREIGN',
        assigned_human_reviewer: 'David Ward (Founder / Sovereign Ambassador)'
      };
    }
    return {
      assigned_domain: { id: 'dom_01', name: 'AI Governance & Agent Authority' },
      required_authority_level: 'LEVEL_1_VICE_MASTER',
      assigned_human_reviewer: 'Adrian Daly (Vice / HITL Master)'
    };
  }

  evaluateExecutionForEscalation(agentId, workflowStep, confidenceScore, riskClass = 'MEDIUM', normalizedInputs = {}) {
    const timestamp = new Date().toISOString();
    const isConfidenceBreach = confidenceScore < this.confidenceFloor;
    const isHighRiskBreach = (riskClass === 'HIGH' || riskClass === 'CRITICAL');
    const requiresEscalation = isConfidenceBreach || isHighRiskBreach;

    if (!requiresEscalation) {
      return {
        status: 'GOVERNED_EXECUTION_PERMITTED',
        requires_escalation: false,
        confidence_score: confidenceScore,
        risk_class: riskClass
      };
    }

    // Programmatic System Halt & Static Package Assembly
    const escalationId = `esc_${createHash('md5').update(`${agentId}:${workflowStep}:${timestamp}`).digest('hex').substring(0, 10)}`;

    const staticEscalationPackage = {
      escalation_id: escalationId,
      agent_id: agentId,
      workflow_step: workflowStep,
      confidence_score: confidenceScore,
      risk_class: riskClass,
      halt_reason: isConfidenceBreach ? 'CONFIDENCE_BELOW_0.85_FLOOR' : 'HIGH_RISK_CLASS_TRIGGER',
      normalized_inputs: normalizedInputs,
      timestamp,
      package_hash: createHash('sha256').update(agentId + workflowStep + confidenceScore).digest('hex')
    };

    return {
      status: 'SYSTEM_HALTED_AWAITING_ASYNC_HITL',
      requires_escalation: true,
      escalation_id: escalationId,
      static_package: staticEscalationPackage
    };
  }

  processAsyncHitlSignoff(escalationPackage, hitlSeatId, approved, rationaleText, gpgSignature = '0x80D0ADA1') {
    const timestamp = new Date().toISOString();

    const hitlDecisionJson = {
      escalation_id: escalationPackage.escalation_id,
      hitl_seat_id: hitlSeatId,
      decision: approved ? 'APPROVED_BY_HUMAN_AUTHORITY' : 'REJECTED_BY_HUMAN_AUTHORITY',
      confidence_override: true,
      gpg_signature: gpgSignature,
      timestamp,
      decision_hash: createHash('sha256').update(escalationPackage.escalation_id + hitlSeatId + approved).digest('hex')
    };

    const hitlRationaleMd = `# EMBASSY HITL GOVERNED DECISION RATIONALE
**Escalation ID:** \`${escalationPackage.escalation_id}\`  
**HITL Seat:** \`${hitlSeatId}\`  
**Decision:** \`${hitlDecisionJson.decision}\`  
**Timestamp:** \`${timestamp}\`  
**GPG Signature:** \`${gpgSignature}\`  

---

### **1. Executive Summary & Rationale**
${rationaleText}

### **2. Evidence & Risk Boundaries**
- Agent ID: \`${escalationPackage.agent_id}\`
- Workflow Step: \`${escalationPackage.workflow_step}\`
- Confidence Score: \`${escalationPackage.confidence_score}\` (Floor: 0.85)
- Risk Class: \`${escalationPackage.risk_class}\`

### **3. Audit Attributability**
- Immutable Hash: \`${hitlDecisionJson.decision_hash}\`
`;

    return {
      status: approved ? 'GOVERNED_EXECUTION_RESUMED' : 'EXECUTION_REJECTED_HALTED',
      hitl_decision: hitlDecisionJson,
      hitl_rationale: hitlRationaleMd
    };
  }
}
