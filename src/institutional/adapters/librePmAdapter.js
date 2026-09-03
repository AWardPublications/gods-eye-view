import { createHash } from 'node:crypto';

/**
 * LIBREPM / GRANT GEDHI SECOND WAVE ADAPTER
 * Maps European funding project lifecycles (Call -> Eligibility -> Review -> Decision -> Award -> Milestones -> Audit -> Closeout)
 * into GRANT GEDHI Capital OS governed execution flows.
 */
export class LibrePmAdapter {
  constructor() {
    this.tool_id = 'tool_libre_pm';
    this.name = 'GRANT GEDHI LibrePM Lifecycle Adapter';
  }

  async transformGrantLifecycle(grantApplication) {
    const rawString = JSON.stringify(grantApplication || {});
    const grantId = grantApplication.id || 'EU_GRANT_2026_01';

    const gedhiGrantObject = {
      id: `gedhi_${grantId}`,
      title: grantApplication.title || 'European Governed Capital Grant Application',
      fundingBody: grantApplication.fundingBody || 'EIC Accelerator / Horizon Europe',
      requestedCapitalEur: grantApplication.amountEur || 2500000,
      lifecycleStage: grantApplication.stage || 'REVIEW_PENDING',
      workPackagesCount: grantApplication.workPackages?.length || 5,
      hitlApprovalRequired: grantApplication.amountEur >= 50000,
      governanceStatus: 'GOVERNED_BY_DAVINCIA'
    };

    const hash = createHash('sha256').update(JSON.stringify(gedhiGrantObject)).digest('hex');

    return {
      status: 'SUPPORTED',
      gedhiGrantObject,
      hash
    };
  }
}
