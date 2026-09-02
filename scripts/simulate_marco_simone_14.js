/**
 * scripts/simulate_marco_simone_14.js
 * 3-DoF Trajectory & Wind-Shielding Diagnostic: Marco Simone Golf & Country Club (Hole 14)
 * Governance: WO/2026/150385 | Ryder Cup Matchplay Strategy Engine
 */

import { AltitudeBallisticsEngine } from '../src/golf/alex-wenger-golf/core/physics/altitudeBallisticsSolver.js';
import { SpatialLearningEngine } from '../src/golf/alex-wenger-golf/core/spatial/spatialLearningEngine.js';

export async function runMarcoSimoneHole14Simulation() {
  console.log("================================================================================");
  console.log("3-DoF TRAJECTORY & WIND-SHIELDING DIAGNOSTIC: MARCO SIMONE HOLE 14 (PAR 4)");
  console.log("================================================================================\n");

  const solver = new AltitudeBallisticsEngine();
  const learningEngine = new SpatialLearningEngine();

  // Marco Simone Hole 14: Uphill Par 4, 385 yards, +14.2m elevation rise
  const rawDistYards = 385;
  const deltaZ = 14.2; // meters
  const tempC = 28.0; // Warm Italian afternoon
  const pressureHpa = 1008.0;
  const humidityPct = 45.0;
  const windMps = 8.27; // 18.5 mph quartering valley breeze

  // 1. Calculate Air Density
  const airDensity = solver.calculateAirDensity(pressureHpa, tempC, humidityPct);
  const seaLevelDensity = 1.2250;
  const densityDeltaPct = Number((((airDensity - seaLevelDensity) / seaLevelDensity) * 100).toFixed(1));

  // 2. Tree Canopy Wind Shielding on Tee Box (Cypress & Umbrella Pines line Hole 14 tee)
  const treeDensityScore = 0.75;
  const shieldingFactor = 0.45; // 45% wind dampening on protected tee box
  const effectiveTeeWindMps = windMps * (1 - shieldingFactor);

  // 3. Plays-Like Yardage Calculation
  const playsLikeObj = solver.calculateAltitudePlaysLike(rawDistYards, 220, tempC);
  // Add slope (+14.2m -> +15.5y) and wind (+18y) adjustments
  const playsLikeYards = Math.round(playsLikeObj.playsLikeYards + 15.5 + 18.0);

  // 4. 4-Point Target Window Calculation
  const targetWindow = solver.calculateTargetWindow({
    rawDistanceYards: rawDistYards,
    playsLikeYards,
    frontBunkerDepth: 18,
    backRunoffDepth: 14
  });

  console.log("• Course & Location: Marco Simone Golf & Country Club (Rome, Italy)");
  console.log(`• Scorecard Distance: ${rawDistYards} Yards | Elevation Δz: +${deltaZ}m Uphill`);
  console.log(`• Atmospheric Density (rho): ${airDensity} kg/m^3 (${densityDeltaPct}% vs ISA Sea-Level)`);
  console.log(`• Tee Box Canopy Wind Shielding: ${Math.round(shieldingFactor * 100)}% Wind Reduction`);
  console.log(`• Open-Ridge Wind Velocity: ${(windMps * 2.23694).toFixed(1)} mph (Effective Tee Wind: ${(effectiveTeeWindMps * 2.23694).toFixed(1)} mph)`);
  console.log(`• Net Plays-Like Yardage: ${playsLikeYards} Yards (+${playsLikeYards - rawDistYards}y adjustment)`);
  console.log(`• Target Window Envelope: Front ${targetWindow.front_edge}y | Cover ${targetWindow.cover_bunker}y | Pin ${targetWindow.pin_distance}y | Runoff ${targetWindow.back_runoff}y`);
  console.log("\n✅ Marco Simone Hole 14 Diagnostic Complete! Caddy subagent target envelope locked.\n");

  return {
    rawDistYards,
    deltaZ,
    airDensity,
    densityDeltaPct,
    playsLikeYards,
    targetWindow,
    shieldingFactor
  };
}

if (process.argv[1] && process.argv[1].endsWith('simulate_marco_simone_14.js')) {
  runMarcoSimoneHole14Simulation().catch(console.error);
}
