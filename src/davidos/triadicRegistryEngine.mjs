import { createHash } from 'node:crypto';

/**
 * TRIADIC REGISTRY ENGINE (DAVINCIA-TRIADIC-REGISTRY-v1.0)
 * Governs the exact mappings between Characters, Workflows, Agents, and Tools.
 * Invariant: Characters represent persona & domain authority; Workflows represent process; Agents represent execution.
 */
export class TriadicRegistryEngine {
  constructor() {
    this.triadicMappings = [
      {
        character: 'Alex Wenger',
        domain: 'Alpine Golf Resort & Aero Physics',
        workflows: ['Player Intake', 'Swing Analysis', 'Aerodynamics Assessment', 'Training Plan', 'Round Review'],
        agents: ['agent_wenger_ballistics', 'agent_trackman_telemetry'],
        tools: ['tool_rk4_wasm_solver', 'tool_air_density_calc']
      },
      {
        character: 'CorkMan (Aidy O\'Dalaigh)',
        domain: 'Corkonian Culture, TCG & Oral History',
        workflows: ['Oral History Intake', 'Cultural Provenance', 'Translation', 'TCG Card Generation', 'Publication'],
        agents: ['agent_corkman_storyteller', 'agent_iiif_cultural_bridge'],
        tools: ['tool_iiif_manifest_builder', 'tool_vibe_art_generator']
      },
      {
        character: 'Grant GEDHI',
        domain: 'European Funding & Capital OS',
        workflows: ['Opportunity Discovery', 'Eligibility Audit', 'Evidence Collection', 'Grant Proposal Build', 'Sub-12s Submission'],
        agents: ['agent_grant_gedhi_provisioner', 'agent_eic_accelerator'],
        tools: ['tool_libre_pm_adapter', 'tool_alcoa_audit_logger']
      },
      {
        character: 'Nora',
        domain: 'A.Ward Publications & Book Vault',
        workflows: ['Manuscript Assessment', 'ISBN Cataloguing', '3D Shelf Binding', 'Dublin Core Mapping'],
        agents: ['agent_nora_evaluator', 'agent_archives_space'],
        tools: ['tool_archives_space_adapter', 'tool_google_docs_sync']
      }
    ];
  }

  getMappingForCharacter(characterName) {
    return this.triadicMappings.find(m => m.character.toLowerCase().includes(characterName.toLowerCase()));
  }

  validateTriadicBinding(characterName, workflowName, agentId) {
    const mapping = this.getMappingForCharacter(characterName);
    if (!mapping) return { valid: false, reason: 'Character not registered' };

    const hasWorkflow = mapping.workflows.includes(workflowName);
    const hasAgent = mapping.agents.includes(agentId);

    return {
      valid: hasWorkflow && hasAgent,
      character: mapping.character,
      workflow: workflowName,
      agent: agentId,
      bindingHash: createHash('sha256').update(characterName + workflowName + agentId).digest('hex')
    };
  }
}
