import { buildPassport, validatePassportSchema, PassportStates, ParticipantTypes } from '../platform/passport.js';

const _participantDb = new Map();

export function registerExternalParticipant(identityDetails, role = "EXTERNAL_USER") {
  if (!identityDetails || !identityDetails.id || !identityDetails.name) {
    throw new Error("Identity details must include id and name.");
  }

  const participantType = role === "AI_AGENT" ? ParticipantTypes.AI_AGENT : ParticipantTypes.HUMAN;
  const capabilities = role === "AI_AGENT" ? ["READ", "TRANSLATE"] : ["READ"];
  
  const passport = buildPassport(identityDetails, participantType, capabilities, {
    status: PassportStates.AUTHORIZED,
    issuer: "urn:davincia:identity:organization:brehon_ai",
    owner: `urn:davincia:identity:organization:${identityDetails.id.split(':').pop()}`,
    controller: identityDetails.id
  });

  _participantDb.set(passport.passport_id, passport);
  return passport;
}

export function issueExternalPassport(identity, participantType, capabilities = []) {
  const passport = buildPassport(identity, participantType, capabilities, {
    status: PassportStates.AUTHORIZED
  });
  _participantDb.set(passport.passport_id, passport);
  return passport;
}

export function verifyExternalPassport(passport) {
  if (!passport) {
    return { valid: false, error: "Passport is missing." };
  }
  const schemaCheck = validatePassportSchema(passport);
  if (!schemaCheck.valid) {
    return schemaCheck;
  }
  if (passport.status === PassportStates.SUSPENDED) {
    return { valid: false, error: "Passport is suspended." };
  }
  if (new Date(passport.expires_at) < new Date()) {
    return { valid: false, error: "Passport has expired." };
  }
  return { valid: true };
}

export function suspendExternalParticipant(passport) {
  if (!passport || !passport.passport_id) throw new Error("Invalid passport");
  passport.status = PassportStates.SUSPENDED;
  _participantDb.set(passport.passport_id, passport);
  return passport;
}

export function revokeExternalParticipant(passport) {
  if (!passport || !passport.passport_id) throw new Error("Invalid passport");
  passport.status = PassportStates.SUSPENDED; // Wiped from valid active list
  passport.governance = { ...passport.governance, conformance_state: "NON_CONFORMANT" };
  _participantDb.set(passport.passport_id, passport);
  return passport;
}

export function clearRegistrationDatabase() {
  _participantDb.clear();
}
