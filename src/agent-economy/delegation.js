import { validatePassportSchema, PassportStates } from '../platform/passport.js';

/** Generate a human-to-agent delegation token */
export function issueDelegationToken(humanPassport, agentPassport, scopes = [], durationSecs = 3600) {
  const schemaCheck = validatePassportSchema(humanPassport);
  if (!schemaCheck.valid) {
    throw new Error(`Invalid delegator human passport: ${schemaCheck.error}`);
  }

  const agentCheck = validatePassportSchema(agentPassport);
  if (!agentCheck.valid) {
    throw new Error(`Invalid receiver agent passport: ${agentCheck.error}`);
  }

  if (humanPassport.participant_type !== "HUMAN") {
    throw new Error("Delegator must be of participant_type HUMAN.");
  }

  if (agentPassport.participant_type !== "AI_AGENT") {
    throw new Error("Receiver must be of participant_type AI_AGENT.");
  }

  const timestamp = new Date();
  const expires = new Date(timestamp.getTime() + durationSecs * 1000);

  const tokenId = `urn:davincia:delegation:token:${Math.random().toString(36).substring(2, 10)}`;

  return {
    token_id: tokenId,
    token_version: "1.0.0",
    delegator_id: humanPassport.passport_id,
    receiver_id: agentPassport.passport_id,
    permitted_scopes: scopes,
    issued_at: timestamp.toISOString(),
    expires_at: expires.toISOString(),
    status: "ACTIVE",
    signature: `DEVELOPMENT_DELEGATION_SIGNATURE-sig-${tokenId.split(':').pop()}`
  };
}

/** Verify a delegation token against action requirements */
export function verifyDelegationToken(token, action, agentPassport, humanPassport) {
  if (!token || token.status !== "ACTIVE") {
    return { valid: false, error: "Delegation token is missing or inactive." };
  }

  if (new Date(token.expires_at) < new Date()) {
    return { valid: false, error: "Delegation token has expired." };
  }

  if (token.receiver_id !== agentPassport.passport_id) {
    return { valid: false, error: "Delegation token was not issued to this AI agent." };
  }

  if (!token.permitted_scopes.includes(action)) {
    return { valid: false, error: `Action '${action}' is outside the delegated scopes.` };
  }

  // Ensure human passport remains conformant and active
  if (humanPassport) {
    if (humanPassport.status === PassportStates.SUSPENDED) {
      return { valid: false, error: "Delegator human passport is suspended." };
    }
    if (new Date(humanPassport.expires_at) < new Date()) {
      return { valid: false, error: "Delegator human passport has expired." };
    }
  }

  return { valid: true };
}
