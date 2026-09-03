import corePolicy from './davincia-core.policy.json' with { type: 'json' };
import corklanPolicy from './corklan.policy.json' with { type: 'json' };
import ariosPolicy from './arios.policy.json' with { type: 'json' };
import alexWengerPolicy from './alex-wenger.policy.json' with { type: 'json' };
import davidOsPolicy from './david-os.policy.json' with { type: 'json' };
import fixtureOsPolicy from './fixture-os.policy.json' with { type: 'json' };

export class PolicyResolver {
  async resolvePolicy(policyId) {
    throw new Error('Not implemented');
  }
  async resolveDomainPolicies(domain) {
    throw new Error('Not implemented');
  }
}

export class LocalPolicyResolver extends PolicyResolver {
  constructor() {
    super();
    this._policies = new Map([
      [corePolicy.policy_id, corePolicy],
      [corklanPolicy.policy_id, corklanPolicy],
      [ariosPolicy.policy_id, ariosPolicy],
      [alexWengerPolicy.policy_id, alexWengerPolicy],
      [davidOsPolicy.policy_id, davidOsPolicy],
      [fixtureOsPolicy.policy_id, fixtureOsPolicy]
    ]);
  }

  async resolvePolicy(policyId) {
    return this._policies.get(policyId) || null;
  }

  async resolveDomainPolicies(domain) {
    const list = [];
    // Core policies always apply to everything
    list.push(corePolicy);
    for (const policy of this._policies.values()) {
      if (policy.domain === domain) {
        list.push(policy);
      }
    }
    return list;
  }
}

const defaultResolver = new LocalPolicyResolver();
export default defaultResolver;
