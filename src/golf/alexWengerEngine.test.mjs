import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AVATARS,
  AVATAR_MANIFESTS,
  SKILL_LEVELS,
  routeAvatarForContext,
  evaluateRulesQuery,
  generate19thHoleBanter,
  formatConversationalResponse,
  createAthleteProfile,
} from './alexWengerEngine.js';

test('routeAvatarForContext correctly selects the avatar based on query intent', () => {
  const swingRes = routeAvatarForContext('My swing backswing wrist plane is off');
  assert.equal(swingRes.id, AVATARS.SWINGSY);

  const rulesRes = routeAvatarForContext('What is the penalty for out of bounds drop?');
  assert.equal(rulesRes.id, AVATARS.JUDGE);

  const zenRes = routeAvatarForContext('I feel nervous and need breathwork focus on the tee');
  assert.equal(zenRes.id, AVATARS.ZENNER);

  const caddyRes = routeAvatarForContext('What club should I hit for 150 yardage into wind?');
  assert.equal(caddyRes.id, AVATARS.CADDY);

  const statsRes = routeAvatarForContext('Calculate my strokes gained approach probability');
  assert.equal(statsRes.id, AVATARS.STATS);
});

test('evaluateRulesQuery accurately detects formal rules queries and outputs rule references', () => {
  const check1 = evaluateRulesQuery('My ball went out of bounds into the hazard, what is the drop penalty?');
  assert.equal(check1.needsFormalRuling, true);
  assert.ok(check1.ruleReferences.some(r => r.includes('Rule 18.2')));

  const check2 = evaluateRulesQuery('Tell me a story about Ballybunion dunes');
  assert.equal(check2.needsFormalRuling, false);
});

test('generate19thHoleBanter incorporates David Ward co-host and course lore', () => {
  const banter = generate19thHoleBanter({
    topic: 'ballybunion windy approach',
    courseId: 'ballybunion_old',
    coHost: 'David Ward',
    athleteName: 'Alex',
  });

  assert.ok(banter.includes('David Ward'));
  assert.ok(banter.includes('Ballybunion Old Course'));
});

test('formatConversationalResponse adapts output to Novice, Club Player, and Tour Pro levels', () => {
  const novice = formatConversationalResponse({
    userPrompt: 'How do I hit driver?',
    skillLevel: SKILL_LEVELS.NOVICE,
  });
  assert.ok(novice.response_text.includes('keep your balance smooth'));

  const pro = formatConversationalResponse({
    userPrompt: 'How do I hit driver into wind?',
    skillLevel: SKILL_LEVELS.TOUR_PRO,
  });
  assert.ok(pro.response_text.includes('Strokes Gained') || pro.response_text.includes('kinematic'));
});

test('createAthleteProfile generates a complete persistent profile object', () => {
  const profile = createAthleteProfile({
    name: 'David Ward',
    handicap: 4.2,
    skill_level: SKILL_LEVELS.TOUR_PRO,
  });

  assert.equal(profile.name, 'David Ward');
  assert.equal(profile.handicap, 4.2);
  assert.equal(profile.skill_level, SKILL_LEVELS.TOUR_PRO);
  assert.ok(Array.isArray(profile.bag_setup));
});
