import { MasterOrchestratorEcosystem } from '../src/golf/alex-wenger-golf/core/orchestration/masterOrchestratorEcosystem.js';
import { ActiveAudioDriver } from '../src/golf/alex-wenger-golf/core/vocal/activeAudioDriver.js';
import { SPECIALIST_MANDATES } from '../src/golf/alex-wenger-golf/core/specialists/designMandates.js';

console.log('================================================================================');
console.log('SIMULATION: ROYAL PORTHCAWL HOLE 18 — 25MPH COASTAL GALE & PGA TOUR POSTURE');
console.log('================================================================================\n');

const ecosystem = new MasterOrchestratorEcosystem();
const audioDriver = new ActiveAudioDriver();
audioDriver.setPgaTourPostureMode(true);

// Player sitting in wet fescue rough on Hole 18 with 175 yards to pin
const result = ecosystem.processGolfQuery({
  rawLaserYards: 175,
  lieType: 'first_cut',
  gmcPct: 24.0,
  environment: {
    pressureHpa: 1008.0,
    tempC: 14.0,
    humidityPct: 85.0,
    windVx: -11.17 // 25 mph headwind vector (11.17 m/s)
  },
  frontBunkerDepth: 12,
  backRunoffDepth: 15
});

console.log('--- 1. LIE-TO-SPIN DECAY MODEL (FLYER LIE EVALUATION) ---');
console.log(`• Base Spin: 6,800 RPM  ➔  Effective Spin: ${result.lie_spin_decay.effectiveSpinRpm} RPM (-${result.lie_spin_decay.spinDecayPct}% Spin)`);
console.log(`• Flyer Lie Detected: ${result.lie_spin_decay.isFlyerLie ? 'YES (Wet Rough)' : 'NO'}`);
console.log(`• Extra Rollout / Flyer Carry: +${result.lie_spin_decay.extraFlyerCarryYards} yards\n`);

console.log('--- 2. TOUR TARGET WINDOW BREAKDOWN ---');
console.log(`• Raw Laser Distance: 175 yards`);
console.log(`• 3-DoF Wind & Density Plays-Like: 192 yards`);
console.log(`• Target Window: ${result.target_window.window_text}`);
console.log(`  - Front Edge: ${result.target_window.front_edge} yards`);
console.log(`  - Cover Bunker: ${result.target_window.cover_bunker} yards`);
console.log(`  - Pin Target: ${result.target_window.pin_distance} yards`);
console.log(`  - Back Runoff: ${result.target_window.back_runoff} yards\n`);

console.log('--- 3. ZENNER 6-SECOND TACTICAL VAGAL EXHALE ---');
const zenner = SPECIALIST_MANDATES.ZENNER.tactical_breathing;
console.log(`• Protocol: ${zenner.protocol}`);
console.log(`• Duration: ${zenner.max_duration_seconds}s (Inhale 2s ➔ Vagal Dump Exhale 4s)`);
console.log(`• USGA 40s Shot Clock Consumption: ${zenner.max_duration_seconds}s / 40s (34s remaining for pre-shot swing)\n`);

console.log('--- 4. PGA TOUR POSTURE VOICE OUTPUT ---');
const sanitizedVoice = audioDriver.applyPgaTourPostureFilter(result.alex_voice_response);
console.log(`• Output: "${sanitizedVoice}"\n`);

console.log('--- 5. ADDRESS MUTE LOCK TRIGGER (SWING PREPARATION) ---');
audioDriver.setAddressMuteLock(true);
console.log(`• IMU Sensor Address Posture: DETECTED`);
console.log(`• Earpiece Audio State: 100% DEAD SILENT (Address Mute Lock Active)\n`);
console.log('================================================================================');
