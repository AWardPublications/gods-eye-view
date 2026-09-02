import { createHash } from 'node:crypto';

/**
 * Swiss Valais 150% R&D Super-Deduction Tax Optimization Engine
 * Implements Art. 25a StAF/TRAF tax formulas for Brehon AI Technologies (Sion, Valais, CH).
 */
export class SwissValaisRdSuperDeductionEngine {
  constructor() {
    this.jurisdiction = 'Sion, Canton of Valais, Switzerland';
    this.governingArticle = 'Article 25a StAF / TRAF (Federal Tax Harmonisation Act)';
    this.surchargeOverheadRate = 0.35; // 35% flat surcharge
    this.superDeductionMultiplier = 1.50; // 150% total write-off
    this.cantonalReliefCap = 0.70; // Max 70% reduction on taxable profit
    this.sionCommunalMultiplier = 1.25; // Sion cantonal & municipal coefficient
  }

  calculateSuperDeduction(directPersonnelSpendChf, taxableProfitChf) {
    if (typeof directPersonnelSpendChf !== 'number' || directPersonnelSpendChf <= 0) {
      throw new Error('Direct personnel spend must be a positive number');
    }

    // 1. Calculate Qualifying Expense Base (Direct + 35% Surcharge)
    const qualifyingExpenseBaseChf = directPersonnelSpendChf * (1 + this.surchargeOverheadRate);

    // 2. Calculate Total Tax Deduction Base (Qualifying Base * 150%)
    const taxDeductionBaseChf = qualifyingExpenseBaseChf * this.superDeductionMultiplier;

    // 3. Extra Super-Deduction Benefit (Tax Deduction Base minus Actual Cash Spend)
    const extraSuperDeductionBenefitChf = taxDeductionBaseChf - directPersonnelSpendChf;

    // 4. Calculate Cantonal Relief Cap (Max 70% of Taxable Profit)
    const maxPermissibleDeductionCapChf = taxableProfitChf ? taxableProfitChf * this.cantonalReliefCap : Infinity;
    const effectiveDeductionChf = Math.min(taxDeductionBaseChf, maxPermissibleDeductionCapChf);

    const timestamp = new Date().toISOString();
    const payloadStr = `${directPersonnelSpendChf}:${taxableProfitChf}:${effectiveDeductionChf}:${timestamp}`;
    const auditHash = createHash('sha256').update(payloadStr).digest('hex');

    return {
      jurisdiction: this.jurisdiction,
      governingArticle: this.governingArticle,
      directPersonnelSpendChf,
      qualifyingExpenseBaseChf,
      taxDeductionBaseChf,
      extraSuperDeductionBenefitChf,
      effectiveDeductionChf,
      cantonalReliefCapApplied: taxableProfitChf ? (taxDeductionBaseChf > maxPermissibleDeductionCapChf) : false,
      auditHash
    };
  }
}
