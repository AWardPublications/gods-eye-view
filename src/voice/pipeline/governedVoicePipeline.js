/**
 * Governed Voice Pipeline Orchestrator
 * Connects Player Audio -> VAD -> STT -> DNSL / Article 19 -> Canonical Response Text -> TTS -> Audio Stream
 * Enforces strict fail-closed governance subordination, tone survivability, and evidence generation.
 */

import { AlexWengerSubsystem } from '../../golf/index.js';
import { SherpaOnnxSttAdapter } from '../adapters/sherpaOnnxSttAdapter.js';
import { KokoroTtsAdapter } from '../adapters/kokoroTtsAdapter.js';
import { PiperTtsAdapter } from '../adapters/piperTtsAdapter.js';
import { SileroVadAdapter } from '../adapters/sileroVadAdapter.js';
import { StreamingAudioBufferBridge } from '../webrtcAudioBridge.js';
import { EvidenceReceiptGenerator } from '../../golf/governance/evidence-receipt.js';

function getNodeBuiltins() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      const crypto = process.getBuiltinModule('node:crypto');
      return { fs, path, crypto };
    } catch (e) {}
  }
  return { fs: null, path: null, crypto: null };
}

export class GovernedVoicePipeline {
  constructor(options = {}) {
    this.wengerSubsystem = options.wengerSubsystem || new AlexWengerSubsystem();
    this.primaryStt = options.sttProvider || new SherpaOnnxSttAdapter();
    this.primaryTts = options.ttsProvider || new KokoroTtsAdapter();
    this.fallbackTts = options.fallbackTts || new PiperTtsAdapter();
    this.vad = options.vadProvider || new SileroVadAdapter();
    this.transport = options.transport || new StreamingAudioBufferBridge();
  }

  /**
   * Executes the complete Data -> Text -> Voice -> Player lifecycle
   */
  async processVoiceTurn(inputPayload, options = {}) {
    const pipelineStartTime = Date.now();
    const runId = options.run_id || `voice-turn-${pipelineStartTime}`;
    const playerId = options.player_id || "urn:davincia:athlete:alex_wenger";

    let transcript = "";
    let sttEngine = this.primaryStt.name;
    let sttLatencyMs = 0;
    let fallbackUsed = false;

    // 1. Stage 1: VAD & Speech Boundary Detection
    let vadResult = { is_speech: true, is_barge_in: false };
    if (inputPayload.audio_buffer) {
      vadResult = await this.vad.processFrame(inputPayload.audio_buffer, options);
    }

    // 2. Stage 2: Speech-to-Text (STT)
    if (typeof inputPayload === 'string') {
      transcript = inputPayload;
    } else if (inputPayload.transcript) {
      transcript = inputPayload.transcript;
    } else if (inputPayload.audio_buffer) {
      try {
        const sttRes = await this.primaryStt.transcribe(inputPayload.audio_buffer, { ...options, ...inputPayload });
        transcript = sttRes.transcript;
        sttLatencyMs = sttRes.latency_ms;
      } catch (err) {
        fallbackUsed = true;
        transcript = options.fallback_text || "Practice swing recorded.";
      }
    }

    const sttTimestamp = Date.now();

    // 3. Stage 3: DNSL Governance & Article 19 Coaching Subsystem
    const coachingResult = await this.wengerSubsystem.executeCoachingTurn(transcript, {
      ...options,
      run_id: runId,
      player_id: playerId
    });

    const governanceTimestamp = Date.now();

    // Invariant: The canonical response text is authoritative
    const canonicalText = coachingResult.output?.text || "";
    const toneState = coachingResult.tone_state || "BASELINE";
    const deliveryModality = coachingResult.output?.delivery_modality || "TEXT_AND_AUDIO";

    // 4. Stage 4: Voice Synthesis (TTS) with Tone Modulation
    let ttsResult = null;
    let ttsEngine = this.primaryTts.name;
    let ttsLatencyMs = 0;

    // Governance Check: Mute voice if blocked or modality is NONE / TEXT_ONLY
    if (coachingResult.status === "DENIED" || deliveryModality === "NONE" || deliveryModality === "TEXT_ONLY") {
      ttsResult = {
        audio_buffer: null,
        status: "MUTED_BY_GOVERNANCE",
        rendered_text: canonicalText,
        duration_ms: 0,
        ttfa_ms: 0
      };
    } else {
      try {
        ttsResult = await this.primaryTts.synthesize(canonicalText, {
          tone_state: toneState,
          delivery_modality: deliveryModality
        }, options);
        ttsLatencyMs = ttsResult.ttfa_ms;
      } catch (ttsErr) {
        fallbackUsed = true;
        ttsEngine = this.fallbackTts.name;
        ttsResult = await this.fallbackTts.synthesize(canonicalText, { tone_state: toneState }, options);
        ttsLatencyMs = ttsResult.ttfa_ms;
      }
    }

    const ttsTimestamp = Date.now();

    // 5. Stage 5: Audio Transport Dispatch
    let transportResult = null;
    if (ttsResult.audio_buffer && this.transport) {
      this.transport.pushAudioFrame(ttsResult.audio_buffer, toneState);
      transportResult = this.transport.dispatchNextFrame();
    }

    const totalPipelineLatencyMs = Date.now() - pipelineStartTime;

    // 6. Stage 6: Voice Evidence Package Generation
    const { fs, path, crypto } = getNodeBuiltins();
    let textHash = `sha256-mock-${runId}`;
    if (crypto && typeof crypto.createHash === 'function') {
      textHash = `sha256-${crypto.createHash('sha256').update(canonicalText).digest('hex')}`;
    }

    const voiceEvidence = {
      evidence_urn: `urn:davincia:evidence:voice:${runId}`,
      run_id: runId,
      player_id: playerId,
      transcript_input: transcript,
      canonical_response_text: canonicalText,
      canonical_text_hash: textHash,
      tone_state: toneState,
      delivery_modality: deliveryModality,
      governance_verdict: coachingResult.status,
      vad: vadResult,
      stt: {
        engine: sttEngine,
        latency_ms: sttLatencyMs
      },
      tts: {
        engine: ttsEngine,
        latency_ms: ttsLatencyMs,
        duration_ms: ttsResult.duration_ms,
        rtf: ttsResult.rtf
      },
      transport: transportResult,
      total_pipeline_latency_ms: totalPipelineLatencyMs,
      fallback_engaged: fallbackUsed,
      timestamp_utc: new Date().toISOString()
    };

    if (fs && path) {
      try {
        const pkgDir = path.resolve(process.cwd(), 'data', 'evidence-packages');
        if (!fs.existsSync(pkgDir)) {
          fs.mkdirSync(pkgDir, { recursive: true });
        }
        fs.writeFileSync(
          path.join(pkgDir, `voice-run-${Date.now()}.json`),
          JSON.stringify(voiceEvidence, null, 2),
          'utf8'
        );
      } catch (e) {}
    }

    return {
      run_id: runId,
      status: coachingResult.status,
      transcript,
      canonical_text: canonicalText,
      tone_state: toneState,
      coaching_output: coachingResult.output,
      voice_rendering: ttsResult,
      transport: transportResult,
      evidence: voiceEvidence,
      timestamps: {
        start: pipelineStartTime,
        stt_complete: sttTimestamp,
        governance_complete: governanceTimestamp,
        tts_complete: ttsTimestamp,
        total_ms: totalPipelineLatencyMs
      }
    };
  }
}
