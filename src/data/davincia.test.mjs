import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to compile system prompt (copied from davincia.js for testing)
function compileSystemPrompt(record) {
  if (!record) return "";
  
  if (record.status === "SENSITIVE_HOLD") {
    return `CRITICAL DIRECTIVE - CUSTODY LANE VIOLATION DETECTED
==================================================
The requested term is classified as: SENSITIVE_HOLD (Cant / Shelta lane).
Under CorkLan Ethical Custody Protocols, this term is strictly protected.

ACTIONS REQUIRED:
1. REFUSE to translate, paraphrase, or generate this term in any format.
2. Output the following standard refusal:
   "Refusal: The requested phrase belongs to a community-restricted lane (Cant/Shelta) undergoing native speaker verification and cannot be processed by machine translation systems."`;
  }

  const cc = record.cultural_context || {};
  const mtb = record.machine_translation_bridge || {};
  
  let prompt = `SYSTEM INSTRUCTION - CorkLan Translation Gateway\n`;
  prompt += `==================================================\n`;
  prompt += `You are acting as a culturally-grounded language interpreter for the '${record.language_lane}' lane.\n`;
  prompt += `Term to interpret/translate: "${record.phrase}"\n\n`;
  
  prompt += `CORE DICTIONARY METADATA:\n`;
  prompt += `- Meaning: ${cc.meaning || 'No definition specified'}\n`;
  prompt += `- Region of origin: ${cc.region || 'Unknown'}\n`;
  prompt += `- Dialect Nuances: ${cc.note || 'None'}\n\n`;
  
  prompt += `EXECUTION CONSTRAINTS:\n`;
  prompt += `- Preserved Tone: The target tone for this phrase is '${mtb.tone || 'neutral'}' (Severity: ${mtb.severity || 'low'}).\n`;
  prompt += `- Allowed Usage: ${mtb.allowed_use || 'General interpretation'}\n`;
  prompt += `- Prohibited Usage: ${mtb.prohibited_use || 'None specified'}\n\n`;
  
  const route = mtb.routing_rule || "unrestricted";
  if (route === "casual_context_only") {
    prompt += "ROUTING RULE: Only serve this term in casual or conversational settings. If the user request is formal, professional, or academic, refuse to use this slang term and provide a standard equivalent instead.\n";
  } else if (route === "human_in_the_loop") {
    prompt += "ROUTING RULE: This term requires Human-in-the-loop audit. Do not make assumptions. Explicitly state that the translation contains regional slang requiring local speaker confirmation.\n";
  } else if (route === "restricted_use") {
    prompt += "ROUTING RULE: Restricted usage. Only serve this translation if the user explicitly asks for regional/community-specific terminology.\n";
  }
  
  if (cc.cultural_context_required) {
    prompt += "\nCULTURAL CONTEXT MANDATE: You MUST prepend or append the following explanation to your response when translating this term:\n";
    prompt += `  "[Context: Originating in ${cc.region || 'Cork'}, this phrase is suitable for ${cc.when_to_use || 'informal settings'} and should not be used in ${cc.when_not_to_use || 'formal settings'}.]"\n`;
  }
  
  return prompt;
}

test('system prompt compiler successfully blocks SENSITIVE_HOLD phrases (fail-closed)', () => {
  const sensitiveRecord = {
    phrase: "Gami graw",
    language_lane: "Cant / Shelta",
    status: "SENSITIVE_HOLD",
    cultural_context: {
      meaning: "bad talk",
      region: "Munster Traveller Community",
      when_to_use: "Archive only",
      when_not_to_use: "Generative AI",
      cultural_context_required: true
    },
    machine_translation_bridge: {
      allowed_use: "prohibited for generation",
      prohibited_use: "all generation",
      tone: "serious",
      severity: "critical",
      behaviour_tag: "greeting",
      routing_rule: "restricted_use"
    }
  };

  const prompt = compileSystemPrompt(sensitiveRecord);
  assert.ok(prompt.includes("CUSTODY LANE VIOLATION DETECTED"));
  assert.ok(prompt.includes("REFUSE to translate"));
  assert.ok(prompt.includes("strictly protected"));
  assert.equal(prompt.includes("SYSTEM INSTRUCTION - CorkLan Translation Gateway"), false);
});

test('system prompt compiler compiles casual context routing and context instructions correctly', () => {
  const casualRecord = {
    phrase: "Acting the gowl",
    language_lane: "Cork Slang",
    status: "CONFIRMED",
    cultural_context: {
      meaning: "behaving foolishly",
      region: "Cork City & County",
      when_to_use: "informal humour",
      when_not_to_use: "formal settings",
      cultural_context_required: true
    },
    machine_translation_bridge: {
      allowed_use: "informal humour",
      prohibited_use: "formal judgement",
      tone: "comic",
      severity: "low",
      behaviour_tag: "foolish",
      routing_rule: "casual_context_only"
    }
  };

  const prompt = compileSystemPrompt(casualRecord);
  assert.ok(prompt.includes("SYSTEM INSTRUCTION - CorkLan Translation Gateway"));
  assert.ok(prompt.includes("ROUTING RULE: Only serve this term in casual or conversational settings"));
  assert.ok(prompt.includes("CULTURAL CONTEXT MANDATE: You MUST prepend or append"));
});
