import { createPassport, verifyPassport as verifyLocalPassport } from './passport.js';

export function issuePassport(identity, capabilities, provenance, verificationState) {
  return createPassport(identity, capabilities, provenance, verificationState);
}

export async function verifyPassport(passport, action, actor) {
  return await verifyLocalPassport(passport, action, actor);
}
