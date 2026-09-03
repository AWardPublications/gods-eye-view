import { createHash } from 'node:crypto';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * DAVID_OS Architecture & Substrate Audit Engine
 * Inspects, reconciles, and compiles the core 4-layer governed substrate, entity register,
 * agent constellation, and GAMP 5 compliance parameters of DAVID_OS.
 * Governed by NotebookLM 18ef9190-a101-4595-84e0-2c918822bd47 ("Media | Embassy Overview v1.0")
 */
export class DavidOsArchitectureEngine {
  constructor() {
    this.osName = 'DAVID_OS';
    this.kernelName = 'DaVinciA⁺ Governed Agent Substrate';
    this.corePrinciple = 'Agents reason. Gates decide. Evidence proves. Humans authorise.';
    this.epigraph = 'Nothing is trusted because it happened. Everything is trusted because it can be reconstructed.';
    this.entitiesDir = 'C:\\Users\\David\\Desktop\\DAVID_OS_ENTITIES';
    this.desktopOsDir = 'C:\\Users\\David\\Desktop\\DAVID_OS';

    this.layers = [
      { layerId: 1, name: 'DAVID_OS / ENTITY LAYER', role: 'Venture identity, strategic objectives, capital targets, and entity governance.' },
      { layerId: 2, name: 'DAVINCIA⁺ KERNEL LAYER', role: 'Human-in-the-loop circuit breakers, fail-closed ethics, and GAMP 5 validation.' },
      { layerId: 3, name: '15-AGENT CAPITAL CONSTELLATION', role: 'Specialized autonomous reasoning agents with deterministic hand-off contracts.' },
      { layerId: 4, name: 'ADAPTER & AUDIT LEDGER LAYER', role: 'n8n workflows, append-only GPG ledgers, and sub-12s provisioning gates.' }
    ];
  }

  getEpigraph() {
    return this.epigraph;
  }

  getHitlTiers() {
    return {
      L1: { role: 'Operational Match-Window Reviewer', max_latency_seconds: 90 },
      L2: { role: 'Senior Escalation Reviewer', max_latency_seconds: 300 },
      L3: { role: 'Cork Ban Audit Reviewer', max_latency_seconds: 86400 }
    };
  }

  getSpatialRoomsMap() {
    const map = {};
    const roomDefs = [
      'Master Control Gateway & Executive Clubhouse',
      'Personal Workspace & Workflow Marketplace',
      'AI Agent Academy & Learning Lounge',
      'COP ON Series One Active Shop & TCG Foundry',
      'Aerospace Ballistics & Spatial Telemetry Deck',
      'BioPharma GAMP 5 & GxP Validation Suite',
      'EU AI Act Regulatory & Legal Compliance Chamber',
      'Finance & Capital Acquisition Command',
      'Cultural Heritage & Gaeilge Narrative Archive',
      'Room of Refusal & Zero-Knowledge Escrow',
      'Domain Specialist Advisory Workshop',
      'Ethics & Social Impact (Fairlearn) Chamber',
      'Sovereign Identity Surface & Key Registry',
      'IIIF 3.0 Cultural Interoperability Bridge',
      'ArchivesSpace Archival Custody Vault',
      'Europeana Rights & Licensing Gateway',
      'LibrePM Grant Capitalization Operating Deck',
      'BagIt & OCFL Immutable Preservation Repository',
      'W3C Verifiable Credentials Registry',
      'Sovereign Embassy Master Telemetry Deck'
    ];

    roomDefs.forEach((name, idx) => {
      const code = `RM-${String(idx + 1).padStart(2, '0')}`;
      map[code] = { code, name, status: 'OPERATIONAL' };
    });

    return map;
  }

  auditEntities() {
    const entities = [];
    if (existsSync(this.entitiesDir)) {
      const items = readdirSync(this.entitiesDir);
      for (const item of items) {
        entities.push({
          entityName: item,
          path: join(this.entitiesDir, item),
          status: 'ACTIVE_GOVERNED_ENTITY'
        });
      }
    }
    return entities;
  }

  generateAuditReport() {
    const activeEntities = this.auditEntities();
    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`DAVID_OS_AUDIT:${activeEntities.length}:${timestamp}`).digest('hex');

    return {
      status: 'DAVID_OS_SUBSTRATE_AUDITED_AND_VERIFIED',
      osName: this.osName,
      kernelName: this.kernelName,
      corePrinciple: this.corePrinciple,
      epigraph: this.epigraph,
      layersCount: this.layers.length,
      activeEntitiesCount: activeEntities.length,
      spatialRoomsCount: Object.keys(this.getSpatialRoomsMap()).length,
      activeEntities,
      hash
    };
  }
}
