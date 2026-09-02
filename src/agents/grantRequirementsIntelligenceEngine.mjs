import { createHash } from 'node:crypto';

/**
 * Grant Requirements Intelligence Engine
 * Maps exact submission schemas, required annexes, evaluation rubrics,
 * portal constraints, and mandatory evidence artifacts for every target grant.
 */
export class GrantRequirementsIntelligenceEngine {
  constructor() {
    this.entityRequirements = {
      'Brehon AI Technologies (Sion, CH)': [
        {
          grantId: 'CH-INNOSUISSE-01',
          name: 'Innosuisse Innovation Project',
          maxAward: 'CHF 5,000,000',
          portal: 'Innosuisse Innoprocess Portal',
          mandatoryAnnexes: ['Implementation Plan (Part B)', 'Budget & Financial Model (XLSX)', 'Implementation Risk Matrix', 'Academic Partner MoU (HES-SO Valais)'],
          characterLimits: { executiveSummary: 2000, projectObjectives: 4000, innovationDegree: 6000 },
          evaluatorCriteria: ['Degree of Innovation (33%)', 'Market Potential & Commercialization (33%)', 'Implementation & Team Capability (34%)'],
          regulatoryGate: 'POL-002 AST Scope Gate & 150% Valais R&D Super-Deduction (Art. 25a TRAF)'
        },
        {
          grantId: 'CH-PRO-HELVETIA-01',
          name: 'Pro Helvetia Digital Creation',
          maxAward: 'CHF 50,000',
          portal: 'myprohelvetia.ch',
          mandatoryAnnexes: ['Artistic Concept Dossier', 'Detailed Budget & Co-Financing Plan', 'Pedagogical Mediation Booklet (PER Cycles 2 & 3)', 'Bilingual Script Sample'],
          characterLimits: { projectDescription: 5000, artisticVision: 3000, mediationPlan: 4000 },
          evaluatorCriteria: ['Artistic Quality & Innovation (40%)', 'Feasibility & Budget Realism (30%)', 'Cultural Mediation & Access (30%)'],
          regulatoryGate: 'Zero-4G/5G Offline PWA Caching Protocol'
        },
        {
          grantId: 'CH-LOTERIE-ROMANDE-01',
          name: 'Loterie Romande Valais',
          maxAward: 'CHF 25,000',
          portal: 'Secrétariat Cantonal Sion (Postal & PDF)',
          mandatoryAnnexes: ['Formulaire Officiel Signé', 'Note de Synthèse Patrimoniale', 'Budget & Plan de Financement', 'Extrait Registre du Commerce (Sion)', 'QR-IBAN Suisse'],
          characterLimits: { projectSummary: 2500, regionalImpact: 3500 },
          evaluatorCriteria: ['Valais Regional Heritage Value (50%)', 'Public Accessibility & Free Entry (30%)', 'Financial Co-Funding Realism (20%)'],
          regulatoryGate: 'Consortage & Bisse du Ro Historical Fidelity'
        }
      ],
      'Brehon AI Solutions Ltd (Dublin/Kinsale, IE)': [
        {
          grantId: 'IE-EIC-ACCELERATOR-01',
          name: 'EIC Accelerator Blended Finance',
          maxAward: '€17,500,000 (€2.5M Grant + €15M Equity)',
          portal: 'EU Funding & Tenders Portal (e-Grant)',
          mandatoryAnnexes: ['Part B Section 1 (Excellence)', 'Part B Section 2 (Impact)', 'Part B Section 3 (Implementation)', 'Financial Deck & FTO Affidavit (WO 2026/150385)', 'Data Management Plan'],
          characterLimits: { pitchDeckPages: 10, videoPitchMinutes: 3, fullProposalPages: 50 },
          evaluatorCriteria: ['Excellence & Radical Innovation (33%)', 'Scale-up Impact & Market Dynamics (33%)', 'Risk & Implementation Quality (34%)'],
          regulatoryGate: 'POL-002 EU MDR Annex VIII Rule 11 Exemption Firewall'
        },
        {
          grantId: 'IE-EUROSTARS-01',
          name: 'Eurostars-3 Co-Funded Call',
          maxAward: '€2,500,000',
          portal: 'Eureka Eureka Smart Simple Portal',
          mandatoryAnnexes: ['Eurostars Application Form', 'Consortium Agreement', 'SME Financial Viability Test', 'Work Package Breakdown (WPs 1-5)'],
          characterLimits: { innovationSection: 5000, marketAccess: 5000 },
          evaluatorCriteria: ['Quality and Efficiency of Implementation (30%)', 'Impact & Market Opportunity (40%)', 'Excellence & Technological Leap (30%)'],
          regulatoryGate: 'Cross-Border R&D Consortium Balance (IE/CH/UK)'
        }
      ],
      'Brehon AI Recruitment / BAIR OS (Belfast HQ, UK)': [
        {
          grantId: 'UK-INNOVATE-SMART-01',
          name: 'Innovate UK Smart Grant',
          maxAward: '£2,500,000',
          portal: 'Innovation Funding Service (IFS UK)',
          mandatoryAnnexes: ['10-Question Structured Proposal', 'Project Plan & Gantt Chart', 'Risk Register & Mitigation Matrix', 'Financial Appendix (CapEx/OpEx)'],
          characterLimits: { question1To10: '400 words per question' },
          evaluatorCriteria: ['Business Opportunity & Market Need (20%)', 'Innovation & Technical Approach (20%)', 'Project Management & Team (20%)', 'Value for Money & Return on Investment (20%)', 'Risk Assessment (20%)'],
          regulatoryGate: 'Belfast HQ / St Andrews Regional Talent Acquisition Framework'
        }
      ],
      'A.Ward Publications (Master IP HoldCo, IE/UK)': [
        {
          grantId: 'EU-CREATIVE-EUROPE-01',
          name: 'Creative Europe INNOVLAB',
          maxAward: '€1,000,000 (80% Co-financing on €1.25M Total)',
          portal: 'EU Funding & Tenders Portal (CREA-CROSS-2026-INNOVLAB)',
          mandatoryAnnexes: ['Detailed Budget Table (Part B)', 'Consortium IP & Licensing Agreement', 'Multilingual Tour Routing Matrix', 'Open Cultural Engine SDK Plan'],
          characterLimits: { relevanceSection: 10000, qualitySection: 15000, impactSection: 10000 },
          evaluatorCriteria: ['Relevance to Policy Objectives (30%)', 'Quality of Content & Methodology (30%)', 'Consortium Management & Budget Balance (20%)', 'Dissemination & European Added Value (20%)'],
          regulatoryGate: 'Nielsen Publisher Prefix 978-1-918501 & Patent Family PCT/IE2025/050001'
        }
      ]
    };
  }

  analyzeRequirements() {
    let totalTargetedGrants = 0;
    const requirementsSummary = [];

    for (const [entity, grants] of Object.entries(this.entityRequirements)) {
      totalTargetedGrants += grants.length;
      for (const grant of grants) {
        const payload = `${grant.grantId}:${grant.portal}:${grant.maxAward}`;
        const hash = createHash('sha256').update(payload).digest('hex');

        requirementsSummary.push({
          entity,
          grantId: grant.grantId,
          name: grant.name,
          maxAward: grant.maxAward,
          portal: grant.portal,
          mandatoryAnnexesCount: grant.mandatoryAnnexes.length,
          regulatoryGate: grant.regulatoryGate,
          verificationHash: hash
        });
      }
    }

    return {
      status: 'REQUIREMENTS_INTELLIGENCE_LOCKED',
      totalEntitiesMapped: Object.keys(this.entityRequirements).length,
      totalGrantsAnalyzed: totalTargetedGrants,
      grants: requirementsSummary
    };
  }
}
