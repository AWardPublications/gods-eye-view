import { evaluatePolicy } from './evaluate.js';

export async function compileDecisionLog(envelope, actions = ["READ", "TRANSLATE", "PUBLISH"], actor = null) {
  const log = {};
  for (const action of actions) {
    log[action.toLowerCase()] = await evaluatePolicy(envelope, action, actor);
  }
  return log;
}
