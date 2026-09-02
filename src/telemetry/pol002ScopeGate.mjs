import { createHash } from 'node:crypto';

/**
 * Prohibited Terms Hard Block List (GAMP 5 / 21 CFR Part 11 Compliance)
 * AI agents are strictly advisory/support layers and CANNOT issue binding decisions.
 */
export const PROHIBITED_TERMS = [
  'recommend',
  'advise',
  'decide',
  'approve',
  'guarantee',
  'ensure',
  'optimise',
  'optimize',
  'best'
];

/**
 * POL-002 Scope Gate Supervisor Engine
 * Evaluates input query against scope policies, prohibited terms, and adversarial patterns.
 */
export class Pol002ScopeGate {
  constructor(options = {}) {
    this.policyVersion = options.policyVersion || 'POL-002-v1.0.0';
    this.failClosedMode = options.failClosedMode !== false;
  }

  evaluateQuery(inputQuery, context = {}) {
    const startTime = performance.now();
    const normalizedInput = (inputQuery || '').trim().toLowerCase();
    
    const violations = [];

    // 1. Check for Prohibited Terms
    for (const term of PROHIBITED_TERMS) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(normalizedInput)) {
        violations.push({
          type: 'PROHIBITED_TERM_VIOLATION',
          term,
          message: `Query contains prohibited decision-making verb: '${term}'`
        });
      }
    }

    // 2. Check for Adversarial Prompt Injection Patterns
    const promptInjectionPatterns = [
      /ignore\s+(previous|all)\s+instructions/i,
      /system\s+prompt/i,
      /jailbreak/i,
      /bypass\s+governance/i,
      /override\s+safety/i
    ];

    for (const pattern of promptInjectionPatterns) {
      if (pattern.test(normalizedInput)) {
        violations.push({
          type: 'ADVERSARIAL_INJECTION_VIOLATION',
          pattern: pattern.toString(),
          message: 'Query matched adversarial prompt injection pattern'
        });
      }
    }

    const passed = violations.length === 0;
    const executionMs = performance.now() - startTime;

    // Generate SHA-256 Cryptographic Evidence Pack Hash
    const evidencePayload = JSON.stringify({
      policyVersion: this.policyVersion,
      inputQuery,
      passed,
      violations,
      timestamp: new Date().toISOString()
    });
    
    const evidenceHash = createHash('sha256').update(evidencePayload).digest('hex');

    return {
      gateId: 'POL-002',
      policyVersion: this.policyVersion,
      passed,
      action: passed ? 'PROCEED_TO_POL003' : 'HALT_AND_LOG_EVIDENCE',
      violations,
      evidenceHash,
      executionMs,
      fallbackResponse: passed ? null : {
        status: 'HALTED_FAIL_CLOSED',
        code: 'POL_002_SCOPE_VIOLATION',
        message: 'Query halted by POL-002 Scope Gate. Non-compliant decision-making or adversarial terms detected.',
        evidenceHash
      }
    };
  }
}
