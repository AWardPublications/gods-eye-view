import { createHash } from 'node:crypto';
import { HitlConstitutionEngine } from './hitlConstitutionEngine.mjs';

/**
 * HITL ROUTER ENGINE (DAVINCIA-HITL-ROUTER-v1.0)
 * Operates under Vice / HITL Master Adrian Daly to route agent actions to the correct human domain & expert panel.
 */
export class HitlRouterEngine {
  constructor() {
    this.constitution = new HitlConstitutionEngine();
  }

  routeAgentAction(agentId, actionName, riskTier = 'MEDIUM', financialAmountEur = 0) {
    const timestamp = new Date().toISOString();
    const routeId = `route_${createHash('md5').update(`${agentId}:${actionName}:${timestamp}`).digest('hex').substring(0, 10)}`;

    let targetDomainId = 'dom_01'; // Default AI Governance
    let requiredAuthorityLevel = 'LEVEL_3_EXPERT_PANEL';
    let assignedReviewer = 'Adrian Daly (HITL Master)';

    // Domain Mapping Logic
    if (financialAmountEur > 5000 || actionName.includes('GRANT') || actionName.includes('CAPITAL')) {
      targetDomainId = 'dom_07'; // Finance / Capital
    } else if (actionName.includes('LEGAL') || actionName.includes('LICENSE') || actionName.includes('GDPR')) {
      targetDomainId = 'dom_06'; // Legal / Regulatory
    } else if (actionName.includes('SECURITY') || actionName.includes('ACCESS')) {
      targetDomainId = 'dom_04'; // Cybersecurity
    } else if (actionName.includes('CULTURE') || actionName.includes('HERITAGE') || actionName.includes('BOOK')) {
      targetDomainId = 'dom_09'; // Cultural / Heritage
    } else if (actionName.includes('GOLF') || actionName.includes('AERO') || actionName.includes('BALLISTICS')) {
      targetDomainId = 'dom_11'; // Professional Domain Practice
    }

    // High Risk or Large Capital Escalation to David Ward (Sovereign Level 0)
    if (riskTier === 'CRITICAL' || financialAmountEur >= 50000) {
      requiredAuthorityLevel = 'LEVEL_0_SOVEREIGN';
      assignedReviewer = 'David Ward (Founder / Sovereign Ambassador)';
    } else if (riskTier === 'HIGH' || financialAmountEur >= 10000) {
      requiredAuthorityLevel = 'LEVEL_1_EXECUTIVE';
      assignedReviewer = 'Adrian Daly (Vice / HITL Master)';
    }

    const domainInfo = this.constitution.getDomain(targetDomainId);

    const routingRecord = {
      route_id: routeId,
      agent_id: agentId,
      action_name: actionName,
      risk_tier: riskTier,
      financial_amount_eur: financialAmountEur,
      assigned_domain: {
        id: domainInfo.id,
        name: domainInfo.name,
        chair: domainInfo.chair,
        availableSeats: domainInfo.seats
      },
      required_authority_level: requiredAuthorityLevel,
      assigned_human_reviewer: assignedReviewer,
      approval_status: 'PENDING_HUMAN_SIGNATURE',
      timestamp,
      route_hash: createHash('sha256').update(agentId + actionName + riskTier).digest('hex')
    };

    return routingRecord;
  }
}
