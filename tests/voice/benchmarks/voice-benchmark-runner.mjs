import test from 'node:test';
import assert from 'node:assert/strict';
import { GovernedVoicePipeline } from '../../../src/voice/pipeline/governedVoicePipeline.js';
import corpus from '../corpus/wenger-voice-corpus.json' with { type: 'json' };

test('Voice Benchmark Runner: Comprehensive End-to-End Latency & RTF Benchmark', async () => {
  const pipeline = new GovernedVoicePipeline();
  const latencies = [];
  const ttfaList = [];
  const rtfList = [];

  for (const item of corpus.utterances) {
    const res = await pipeline.processVoiceTurn({
      audio_buffer: new Uint8Array(16000),
      expected_text: item.text
    }, {
      mode: "COMPETE",
      athlete_consent: true,
      human_supervision: true,
      career_opt_in: true
    });

    latencies.push(res.timestamps.total_ms);
    if (res.voice_rendering?.ttfa_ms) {
      ttfaList.push(res.voice_rendering.ttfa_ms);
    }
    if (res.voice_rendering?.rtf) {
      rtfList.push(res.voice_rendering.rtf);
    }
  }

  latencies.sort((a, b) => a - b);
  const median = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1];
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || latencies[latencies.length - 1];
  const max = latencies[latencies.length - 1];

  console.log("\n============================================================");
  console.log("       ALEX WENGER² VOICE PIPELINE BENCHMARK REPORT         ");
  console.log("============================================================");
  console.log(`• Total Utterances Benchmarked: ${latencies.length}`);
  console.log(`• Median End-to-End Latency:   ${median} ms`);
  console.log(`• p95 End-to-End Latency:      ${p95} ms`);
  console.log(`• p99 End-to-End Latency:      ${p99} ms`);
  console.log(`• Max End-to-End Latency:      ${max} ms`);
  console.log(`• Average TTFA:                ${(ttfaList.reduce((a,b)=>a+b,0)/ttfaList.length).toFixed(2)} ms`);
  console.log(`• Average RTF:                 ${(rtfList.reduce((a,b)=>a+b,0)/rtfList.length).toFixed(4)}`);
  console.log("============================================================\n");

  assert.ok(median < 150, `Median latency ${median}ms exceeded 150ms bound.`);
  assert.ok(max < 250, `Max latency ${max}ms exceeded 250ms bound.`);
});
