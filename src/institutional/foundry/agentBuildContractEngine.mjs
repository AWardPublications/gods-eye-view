import { createHash } from 'node:crypto';

/**
 * AGENT BUILD CONTRACT ENGINE
 * Creates, validates, and enforces Mission Build Contracts for Governed Agent Development Squads.
 */
export class AgentBuildContractEngine {
  createMissionContract(missionId, humanIntent, objective, allowedAgents, allowedWorkspace) {
    const timestamp = new Date().toISOString();

    const contract = {
      contract_id: `contract_${createHash('md5').update(`${missionId}:${timestamp}`).digest('hex').substring(0, 10)}`,
      mission_id: missionId,
      objective,
      human_intent: humanIntent,
      authorized_agents: allowedAgents || ['ARCHITECT', 'RESEARCHER', 'BUILDER', 'TESTER', 'CHALLENGER', 'AUDITOR', 'INTEGRATOR'],
      allowed_workspace: allowedWorkspace || `agent-build-space/missions/${missionId}/`,
      allowed_actions: ['research', 'create', 'modify', 'test', 'document', 'simulate'],
      forbidden_actions: [
        'modify_constitutional_kernel',
        'deploy_production_without_human_approval',
        'alter_human_authority_ceiling',
        'alter_governance_precedence',
        'create_unauthorized_financial_commitments'
      ],
      required_deliverables: ['evidence_package', 'unit_conformance_tests', 'provenance_lineage', 'license_audit_green', 'human_acceptance_signoff'],
      issued_at: timestamp,
      contract_hash: ''
    };

    contract.contract_hash = createHash('sha256').update(JSON.stringify(contract)).digest('hex');

    return {
      status: 'MISSION_CONTRACT_CREATED',
      contract
    };
  }

  validateAction(contract, actionName, targetPath) {
    if (contract.forbidden_actions.includes(actionName)) {
      return {
        status: 'FORBIDDEN_ACTION_BLOCKED',
        allowed: false,
        reason: `Action '${actionName}' is explicitly forbidden by Mission Contract ${contract.mission_id}`
      };
    }

    if (!targetPath.startsWith(contract.allowed_workspace) && !targetPath.includes('agent-build-space/')) {
      return {
        status: 'WORKSPACE_VIOLATION_BLOCKED',
        allowed: false,
        reason: `Target path '${targetPath}' violates isolated sandbox workspace boundary '${contract.allowed_workspace}'`
      };
    }

    return {
      status: 'ACTION_VALIDATED_GREEN',
      allowed: true
    };
  }
}
