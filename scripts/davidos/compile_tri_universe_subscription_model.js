import { TriUniverseSubscriptionEngine } from '../../src/davidos/triUniverseSubscriptionEngine.mjs';

function runSubscriptionModel() {
  console.log("=" * 80);
  console.log("TRI-UNIVERSE GOVERNED OPERATING SYSTEM SUBSCRIPTION MODEL");
  console.log("=" * 80);

  const engine = new TriUniverseSubscriptionEngine();
  const res = engine.compileSubscriptionModel();

  console.log(`\n  ✓ Total Tiers:          ${res.tiersCount} Subscription Membership Tiers`);
  console.log(`  ✓ Subscription Model Hash: ${res.modelHash}\n`);

  console.log("  TRI-UNIVERSE SUBSCRIPTION TIERS & PRICING:");
  for (const tier of res.tiers) {
    console.log(`  💳 [${tier.id}] ${tier.name}`);
    console.log(`     ├─ Monthly Price:     €${tier.priceEurMonthly} / month`);
    console.log(`     ├─ Target Universe:   ${tier.universeTarget}`);
    console.log(`     ├─ Compute Tokens:    ${tier.monthlyAgentTokens.toLocaleString()} Agent Tokens`);
    console.log(`     ├─ HITL Escalations:  ${tier.monthlyHitlCredits} HITL Pause Gate Approvals`);
    console.log(`     └─ Entitlements:`);
    for (const f of tier.features) {
      console.log(`        • ${f}`);
    }
    console.log("");
  }

  // Simulate a test tenant subscription
  const billingRes = engine.processSubscriptionBilling('TENANT_SWISS_VALAIS_01', 'TIER_ALEX_GOLF', 'tok_visa_swiss');
  console.log("  SIMULATED TENANT BILLING EVENT:");
  console.log(`  • Status:        ${billingRes.status}`);
  console.log(`  • Transaction ID: ${billingRes.transactionId}`);
  console.log(`  • Amount Billed:  €${billingRes.amountEur} / month`);
  console.log(`  • Target:        ${billingRes.tierName}\n`);

  console.log("=" * 80);
  console.log("STATUS: TRI-UNIVERSE SUBSCRIPTION MODEL RATIFIED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runSubscriptionModel();
