import test from 'node:test';
import assert from 'node:assert/strict';
import { StreamingAudioBufferBridge } from '../../src/voice/webrtcAudioBridge.js';

test('WebRTC Audio Bridge: Channel Initialization & Opus Stream Negotiation', () => {
  const bridge = new StreamingAudioBufferBridge({ targetLatencyMs: 120 });
  assert.equal(bridge.isConnected, false);

  const initResult = bridge.connectChannel({ id: "webrtc-stream-wenger-01" });
  assert.equal(initResult.connected, true);
  assert.equal(initResult.codec, "opus");
  assert.equal(initResult.sample_rate_hz, 48000);
  assert.equal(bridge.isConnected, true);
});

test('WebRTC Audio Bridge: Streaming PCM Buffer Queue & <200ms Latency Bounds', async () => {
  const bridge = new StreamingAudioBufferBridge();
  bridge.connectChannel();

  const toneStates = ["BASELINE", "MODULATED", "DECAYED", "RECOVERING"];

  for (let i = 0; i < 20; i++) {
    const tone = toneStates[i % toneStates.length];
    const mockPcmFrame = new Uint8Array(960); // 20ms chunk
    bridge.pushAudioFrame(mockPcmFrame, tone);

    // Simulate minor network transport interval (< 10ms)
    await new Promise(r => setTimeout(r, 5));

    const dispatched = bridge.dispatchNextFrame();
    assert.ok(dispatched);
    assert.equal(dispatched.tone_state, tone);
    assert.equal(dispatched.within_latency_bound, true);
    assert.ok(dispatched.latency_ms < 200, `Latency was ${dispatched.latency_ms}ms, exceeding 200ms bound.`);
  }

  const telemetry = bridge.getTelemetry();
  assert.equal(telemetry.metrics.frames_streamed, 20);
  assert.equal(telemetry.metrics.underruns, 0);
  assert.ok(telemetry.metrics.avg_latency_ms < 200);
});
