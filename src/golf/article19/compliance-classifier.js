/**
 * Alex Wenger² Article 19 Compliance Classifier
 * Implements Claim 9 (Task adherence vs. avoidance scoring from natural language)
 */

export class ComplianceClassifierInterface {
  classify(rawText, metadata = {}) {
    throw new Error("NOT_IMPLEMENTED: ComplianceClassifierInterface must be implemented by a concrete class.");
  }
}

export class RuleBasedComplianceClassifier extends ComplianceClassifierInterface {
  constructor() {
    super();
    this.version = "1.0.0";
  }

  classify(rawText, metadata = {}) {
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return {
        score: 0.5,
        confidence: 0.0,
        classification: "AMBIGUOUS",
        classifier_version: this.version,
        evidence_reference: "urn:wenger:compliance:no-input",
        failure_state: "NO_INPUT_TEXT"
      };
    }

    const lower = rawText.toLowerCase().trim();

    // High Adherence Signifiers
    const highAdherencePatterns = [
      /(completed|finished|executed|done all|did all|10 reps|20 reps|followed routine|completed drill)/,
      /(stuck to plan|maintained tempo|practiced for \d+|hit targets|logged reps)/
    ];

    // Avoidance / Non-Compliance Signifiers
    const avoidancePatterns = [
      /(didn't do|did not do|skipped|refused|gave up|too hard|stopped early|quit)/,
      /(hated it|ignored drill|didn't feel like it|didn't finish|abandoned)/
    ];

    // Partial Adherence
    const partialPatterns = [
      /(partially|halfway|did some|only \d+ reps|tired early|modified drill)/
    ];

    let score = 0.8; // Default baseline assumption for ongoing engagement
    let confidence = 0.85;
    let classification = "MODERATE_COMPLIANCE";
    let failureState = null;

    if (avoidancePatterns.some(p => p.test(lower))) {
      score = 0.2;
      confidence = 0.95;
      classification = "NON_COMPLIANT_AVOIDANCE";
    } else if (highAdherencePatterns.some(p => p.test(lower))) {
      score = 1.0;
      confidence = 0.95;
      classification = "HIGH_COMPLIANCE";
    } else if (partialPatterns.some(p => p.test(lower))) {
      score = 0.5;
      confidence = 0.80;
      classification = "MODERATE_COMPLIANCE";
    } else {
      // General statements without explicit adherence cues
      score = 0.75;
      confidence = 0.60;
      classification = "MODERATE_COMPLIANCE";
    }

    return {
      score,
      confidence,
      classification,
      classifier_version: this.version,
      evidence_reference: `urn:wenger:compliance:rule-${Date.now()}`,
      failure_state: failureState
    };
  }
}
