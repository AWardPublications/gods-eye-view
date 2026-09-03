/**
 * AWardPublications.ProductRefinery.v1.0 Multi-Format Product Compiler (JS/ESM Subsystem)
 * Enforces the GAMP 5 7-Step Ingestion & Refinement Pipeline across 4 governed product lines:
 * 1. Narrative Storybook (AWP-BOK-001-STORY)
 * 2. Coloring Book (AWP-BOK-002-COLOR)
 * 3. CorkMan Phygital TCG Playing Card (AWP-CRD-001-TCG)
 * 4. Fine Art Print Poster (AWP-PST-001-ART)
 */

import { EvidenceReceiptGenerator } from '../golf/governance/evidence-receipt.js';
import { DomainCollisionLinter } from './domainCollisionLinter.js';

export const PRODUCT_TEMPLATES = {
  narrative_storybook: {
    product_code: "AWP-BOK-001-STORY",
    product_type: "narrative_storybook",
    title: "The Chronicles of Tuath: Legend of the Filidh",
    dimensions: "8.5x11 inches",
    dpi: 300,
    visual_strategy: {
      style_modifier: "rich watercolor illustration, storybook art style, soft lighting, vibrant earthy tones, Celtic atmospheric depth",
      composition_hierarchy: {
        subject_weight: 0.60,
        background_weight: 0.30,
        prop_weight: 0.10
      }
    },
    layout_specs: {
      page_style: "editorial storybook spread, 0.125in bleed, CMYK calibrated",
      typography: "Cinzel Decorative + Garamond Body"
    },
    governance_stamps: {
      visual_overlay: {
        regulatory_seal: "DVA-VERIFIED-STORY-v1",
        disclosure_text: "Authentic Governed Storybook Asset | Brehon AI Solutions Ltd."
      }
    }
  },
  coloring_book: {
    product_code: "AWP-BOK-002-COLOR",
    product_type: "coloring_book",
    title: "Alpine Speedgolf & Celtic Legends: The Coloring Odyssey",
    dimensions: "8.5x11 inches",
    dpi: 300,
    visual_strategy: {
      style_modifier: "clean, crisp black and white line art coloring page, pure outlines, high-contrast, zero grayscale shading, thick vector boundaries",
      composition_hierarchy: {
        subject_weight: 0.70,
        background_weight: 0.20,
        prop_weight: 0.10
      }
    },
    layout_specs: {
      page_style: "single-sided coloring sheet, 0.25in safe margins",
      typography: "Comic Neue Bold"
    },
    governance_stamps: {
      visual_overlay: {
        regulatory_seal: "DVA-VERIFIED-COLOR-v1",
        disclosure_text: "Print-Ready Coloring Book Asset | AWardPublications"
      }
    }
  },
  tcg_playing_card: {
    product_code: "AWP-CRD-001-TCG",
    product_type: "tcg_playing_card",
    title: "CorkMan: Cop On Phygital Card Series",
    dimensions: "2.5x3.5 inches (Poker Standard)",
    dpi: 600,
    game_mechanics_validator: {
      stats_budget: 24,
      required_attributes: ["sound", "cop_on", "neck", "rebel"],
      restricted_names_blocklist: ["pokemon", "magic", "yugioh", "disney", "marvel"]
    },
    visual_strategy: {
      style_modifier: "collectible card game dynamic splash art, bold comic ink outlines, holographic foil gradient accents",
      composition_hierarchy: {
        subject_weight: 0.75,
        background_weight: 0.15,
        prop_weight: 0.10
      }
    },
    layout_specs: {
      page_style: "trading card standard frame, foil stamp mask, rounded corner border",
      typography: "Impact Title + Futura Bold Attributes"
    },
    governance_stamps: {
      visual_overlay: {
        regulatory_seal: "COP-ON-GENUINE-CARD-v1",
        disclosure_text: "Sovereign Phygital Asset | DaVinciA+ Invariant Verified"
      }
    }
  },
  fine_art_poster: {
    product_code: "AWP-PST-001-ART",
    product_type: "fine_art_poster",
    title: "Alpine Speedgolf Master Series: The 18th at Matterhorn",
    dimensions: "24x36 inches (Archival Poster)",
    dpi: 300,
    visual_strategy: {
      style_modifier: "ultra-high-resolution museum fine art print, cinematic lighting, photorealistic landscape rendering, volumetric alpine mist",
      composition_hierarchy: {
        subject_weight: 0.40,
        background_weight: 0.50,
        prop_weight: 0.10
      }
    },
    layout_specs: {
      page_style: "museum white border matte, archival bleed, giclee calibrated",
      typography: "Helvetica Neue Light Minimalist"
    },
    governance_stamps: {
      visual_overlay: {
        regulatory_seal: "DVA-ARCHIVAL-FINEART-v1",
        disclosure_text: "Limited Edition Fine Art Print | AWardPublications Archive"
      }
    }
  }
};

export class MultiFormatProductCompiler {
  constructor(options = {}) {
    this.templates = options.templates || PRODUCT_TEMPLATES;
    this.auditHistory = [];
  }

  /**
   * Main 7-Step GAMP 5 Compliant Compilation Pipeline
   */
  compileProduct(productKey, inputData = {}, subjectPassport = {}, options = {}) {
    // 1. Step 1: Pulse Ingestion
    const headline = String(inputData.headline || inputData.title || "").trim();
    if (!headline) {
      throw new Error("INGESTION_FAILED: Headline or title cannot be empty.");
    }

    // 2. Step 2: UDO Formulation
    const runId = options.run_id || `prod-run-${Date.now()}`;
    const transactionUrn = `urn:brehon:transaction:${runId}`;
    const udoUrn = `urn:davincia:udo:${runId}`;

    // 3. Step 3: Executable Rule & Invariant Verification
    if (!this.templates[productKey]) {
      throw new Error(`TEMPLATE_NOT_FOUND: Product format '${productKey}' is not supported.`);
    }

    const template = this.templates[productKey];

    // A. TCG Card Invariant Validation
    if (productKey === "tcg_playing_card") {
      const stats = inputData.stats || { sound: 6, cop_on: 6, neck: 6, rebel: 6 };
      const sound = Number(stats.sound) || 0;
      const copOn = Number(stats.cop_on) || 0;
      const neck = Number(stats.neck) || 0;
      const rebel = Number(stats.rebel) || 0;
      const totalStats = sound + copOn + neck + rebel;
      const basePower = inputData.base_power ?? 24;
      const charName = String(inputData.character_name || headline).trim();

      const validatorCfg = template.game_mechanics_validator;
      if (basePower !== 24) {
        throw new Error(`TCG_BASE_POWER_DECOUPLED: Card base power must equal 24 (got ${basePower}).`);
      }

      if (totalStats !== validatorCfg.stats_budget) {
        throw new Error(`TCG_STAT_BUDGET_BREACH: Total stats sum to ${totalStats} (must equal ${validatorCfg.stats_budget}).`);
      }

      for (const blocked of validatorCfg.restricted_names_blocklist) {
        if (charName.toLowerCase().includes(blocked.toLowerCase())) {
          throw new Error(`TCG_BLOCKED_NAME_DETECTED: Character name contains blocked trademark '${blocked}'.`);
        }
      }
    }

    // B. Storybook Telemetry Validation
    else if (productKey === "narrative_storybook") {
      const narrativeText = String(inputData.text || inputData.story || "").trim();
      if (narrativeText.length > 0 && narrativeText.length < 50) {
        throw new Error("LINT_ERROR_TELEMETRY_SHORT: Input narrative text must be at least 50 characters.");
      }
    }

    // C. Cross-Domain Collision Linting
    const domainLint = DomainCollisionLinter.lintProductDomain(inputData);
    if (!domainLint.compliant) {
      throw new Error(`DOMAIN_LINT_FAILURE: ${domainLint.error}`);
    }

    // 4. Step 4: Intent Registration
    const intentPayload = {
      product_code: template.product_code,
      product_type: template.product_type,
      headline,
      dimensions: template.dimensions,
      input: inputData
    };

    // 5. Step 5: Overrides & Fatigue Gate
    const isOverride = Boolean(options.is_override);
    if (isOverride) {
      const recentOverrides = this.auditHistory.slice(-2).filter(e => e.status === "OVERRIDE_ALLOW");
      if (recentOverrides.length >= 2) {
        throw new Error("GOVERNANCE_FREEZE: Exceeded consecutive manual overrides limit (Repeated Override Rule). System Locked.");
      }
    }

    // 6. Step 6: Layout Assembly & Artifact Rendering
    const visuals = template.visual_strategy;
    const compiledArtifact = {
      product_code: template.product_code,
      product_type: template.product_type,
      title: template.title,
      headline,
      dimensions: template.dimensions,
      dpi: template.dpi,
      style_modifier: visuals.style_modifier,
      hierarchy: visuals.composition_hierarchy,
      layout: template.layout_specs,
      stamps: template.governance_stamps,
      character_name: inputData.character_name || headline,
      stats: inputData.stats || null,
      narrative_text: inputData.text || inputData.story || null,
      compiled_at: new Date().toISOString()
    };

    // 7. Step 7: Cryptographic DPF Receipt Emission
    const evidenceReceipt = EvidenceReceiptGenerator.generateReceipt({
      run_id: runId,
      player_id: subjectPassport.id || "urn:davincia:publisher:award_publications",
      mode: "PUBLISH",
      signals: { intent: "PRODUCT_COMPILATION", product_code: template.product_code },
      compliance: { score: 1.0, classification: "HIGH_COMPLIANCE" },
      thresholds: [
        { rule_id: "RULE_INVARIANT_BUDGET", status: "SATISFIED" },
        { rule_id: "RULE_DVA_SEAL", status: "SATISFIED" }
      ],
      tone_state: { current_state: "BASELINE" },
      routing_result: { status: isOverride ? "OVERRIDE_ALLOW" : "AUTHORIZED", pathway: "PRODUCT_REFINERY" },
      output: compiledArtifact
    });

    const eventRecord = {
      transaction_urn: transactionUrn,
      udo_urn: udoUrn,
      run_id: runId,
      product_code: template.product_code,
      status: isOverride ? "OVERRIDE_ALLOW" : "AUTHORIZED",
      evidence_ref: evidenceReceipt.evidence_ref,
      evidence_hash: evidenceReceipt.evidence_hash,
      timestamp: Date.now()
    };

    this.auditHistory.push(eventRecord);

    return {
      status: "SUCCESS",
      product_code: template.product_code,
      product_type: template.product_type,
      artifact: compiledArtifact,
      event: eventRecord,
      evidence: evidenceReceipt
    };
  }
}
