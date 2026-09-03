// Price per 1M tokens
export const ModelRates = {
  STANDARD: {
    input: 15.00, // $15.00 USD per 1M tokens
    output: 60.00 // $60.00 USD per 1M tokens
  },
  MINI: {
    input: 0.15, // $0.15 USD per 1M tokens
    output: 0.60  // $0.60 USD per 1M tokens
  }
};

const _requestRegistry = new Map();

/** Calculate token cost */
export function calculateTokenCost(inputTokens, outputTokens, modelTier = "STANDARD") {
  const rates = ModelRates[modelTier.toUpperCase()] || ModelRates.STANDARD;
  const cost = ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000000;
  return Number(cost.toFixed(6));
}

/** Track rate limits (throttle check) */
export function enforceRateLimit(agentId, maxRequestsPerMin = 10) {
  const now = Date.now();
  if (!_requestRegistry.has(agentId)) {
    _requestRegistry.set(agentId, []);
  }

  const timestamps = _requestRegistry.get(agentId);
  // Clear timestamps older than 1 minute
  const oneMinAgo = now - 60000;
  const activeTimestamps = timestamps.filter(t => t > oneMinAgo);
  
  if (activeTimestamps.length >= maxRequestsPerMin) {
    return { permitted: false, error: "Rate limit exceeded (Too many requests per minute)." };
  }

  activeTimestamps.push(now);
  _requestRegistry.set(agentId, activeTimestamps);

  return { permitted: true };
}

/** Clear limits (useful for testing resets) */
export function clearRateLimits() {
  _requestRegistry.clear();
}
