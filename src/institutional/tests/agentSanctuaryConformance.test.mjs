import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AgentAcademyEngine } from '../sanctuary/agentAcademyEngine.mjs';
import { AgentForumEngine } from '../sanctuary/agentForumEngine.mjs';
import { AgentVibeEngine } from '../sanctuary/agentVibeEngine.mjs';

test('50_Agent_Academy_Learning: Agent enrolls and completes learning module', () => {
  const academy = new AgentAcademyEngine();
  const res = academy.enrollAndCompleteModule('agent_corkman_ambassador', 'MOD_101');

  assert.equal(res.status, 'MODULE_COMPLETED_SUCCESSFULLY');
  assert.equal(res.agent_id, 'agent_corkman_ambassador');
  assert.equal(res.xp_earned, 25);
  assert.ok(res.certificateHash.length === 64);
});

test('51_Agent_Forum_Debates: Agents initiate and reply to structured discussion threads', () => {
  const forum = new AgentForumEngine();
  const thread = forum.postThread('agent_davincia_architect', 'IIIF 3.0 Annotation Layer Architecture', 'How shall we structure IIIF canvas annotation targets?');

  assert.equal(thread.messages.length, 1);

  const updatedThread = forum.addReply(thread.thread_id, 'agent_davincia_builder', 'We should use W3C Web Annotation Data Model URNs.');
  assert.equal(updatedThread.messages.length, 2);
  assert.equal(updatedThread.messages[1].author, 'agent_davincia_builder');
});

test('52_Agent_Vibe_Creative_Generation: Agent Vibe Studio generates TCG cards and audio presets', () => {
  const vibe = new AgentVibeEngine();
  const card = vibe.generateTcgCardConcept('agent_corkman_ambassador', 'CorkMan Sovereign Defender', 'CORKONIAN_LEGEND', 99);

  assert.equal(card.title, 'CorkMan Sovereign Defender');
  assert.equal(card.power_rating, 99);
  assert.ok(card.card_hash.length === 64);

  const audio = vibe.generateAudioVibePreset('agent_wenger_director', 'VALAIS_ALPINE_WIND');
  assert.equal(audio.mood, 'VALAIS_ALPINE_WIND');
  assert.equal(audio.prosodyProfile, 'RELAXED_CREATIVE_STORYTELLING');
});
