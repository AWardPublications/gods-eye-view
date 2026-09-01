import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AL_ALEX_BASELINE } from '../core/alInterviewAlexBaseline.js';
import { CAPABILITY_VS_EXPRESSION, formatExpressiveResponse } from '../core/vocalGuidance.js';
import { resolveConversationalHandoff } from '../core/handoffEngine.js';

test('AL_ALEX_BASELINE validates baseline interview and 5-bucket output schema', () => {
  assert.equal(AL_ALEX_BASELINE.interviewer, 'Al (Host/Producer)');
  assert.equal(AL_ALEX_BASELINE.interviewee, 'Alex Wenger (Anchor & Golf Intelligence)');
  assert.ok(AL_ALEX_BASELINE.baseline_qa.length >= 3);

  const buckets = AL_ALEX_BASELINE.baseline_buckets;
  assert.ok(Array.isArray(buckets.KEEP));
  assert.ok(Array.isArray(buckets.ADD));
  assert.ok(Array.isArray(buckets.DELEGATE));
  assert.ok(Array.isArray(buckets.PROTECT));
  assert.ok(Array.isArray(buckets.AVOID));
});

test('formatExpressiveResponse applies Capability vs Expression and vocal cadence profiles', () => {
  const judgeFormatted = formatExpressiveResponse('Judge', 'Rule 18.2 requires stroke-and-distance relief.');
  assert.equal(judgeFormatted.speaker, 'Judge');
  assert.equal(judgeFormatted.vocal_cadence, 'MEASURED_PRECISE');

  const caddyFormatted = formatExpressiveResponse('Caddy', 'Wind is 15 mph into our face.');
  assert.equal(caddyFormatted.speaker, 'Caddy');
  assert.equal(caddyFormatted.vocal_cadence, 'CRISP_RAPID');
});

test('resolveConversationalHandoff produces natural Alex lead-ins and specialist entries', () => {
  const puttHandoff = resolveConversationalHandoff('I keep leaving putts short');
  assert.equal(puttHandoff.hasHandoff, true);
  assert.ok(puttHandoff.alex_lead_in.includes('PUTTSER'));
  assert.equal(puttHandoff.specialist_response.speaker, 'PUTTSER');
  assert.ok(puttHandoff.specialist_response.formatted_speech.includes('talking'));

  const rulesHandoff = resolveConversationalHandoff('What is the rule for an out of bounds drop?');
  assert.equal(rulesHandoff.hasHandoff, true);
  assert.ok(rulesHandoff.alex_lead_in.includes('Judge'));
  assert.equal(rulesHandoff.specialist_response.speaker, 'Judge');
});
