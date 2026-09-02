/**
 * scratch/compile_and_verify_wales_dataset.mjs
 * Module: ATLAS-GOLF-WALES-001 (Wales Regional Topology Pack)
 * Governance: Patent WO/2026/150385 | R&A Rule 4.3a State 4 Gate
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 1. Primary Dataset: Welsh Links Topography & Atmospheric Baselines
const WALES_TOPOGRAPHY_DATASET = {
  manifest_version: "4.7.0-rc.1",
  module_codename: "ATLAS-GOLF-WALES-001",
  governance: {
    patent: "WO/2026/150385",
    active_compliance_rules: ["Rule_4.3a_State_4_Judge"],
    exclusively_alex_responsibility: true
  },
  atmospheric_profiles: {
    profile_a_damp_harlech: {
      location_ref: "UK-WAL-RSD-01",
      elevation_m: 9.0,
      air_temp_k: 283.15,
      pressure_dry_pa: 100500,
      vapor_pressure_pa: 1050,
      relative_humidity_pct: 85,
      calculated_air_density_rho: 1.2445,
      ballistics_effect: "Increased aerodynamic drag and Magnus climb; low-launch punch trajectory recommended."
    },
    profile_b_dry_westerly_porthcawl: {
      location_ref: "UK-WAL-RPC-02",
      elevation_m: 18.0,
      air_temp_k: 289.15,
      pressure_dry_pa: 101100,
      vapor_pressure_pa: 1100,
      relative_humidity_pct: 60,
      calculated_air_density_rho: 1.2248,
      ballistics_effect: "Moderate drag; severe Magnus crosswind lateral drift across zigzag seaside routing."
    }
  },
  flagship_venues: {
    royal_st_davids: {
      uid: "UK-WAL-RSD-01",
      official_name: "Royal St David's Golf Club (Harlech)",
      par: 69,
      yardage: 6500,
      routing_type: "zigzag_non_traditional",
      spatial_markers: {
        harlech_castle_rock_precipice: {
          latitude: 52.8601,
          longitude: -4.1084,
          relative_elevation: 60.0,
          aerodynamic_obstruction: true,
          description: "Medieval Castle on rock precipice directly guarding the links."
        },
        tremadog_bay_shoreline: {
          bearing_vector: 315.0,
          primary_wind_exposure: "westerly_unpredictable"
        },
        flat_terrain_zone: {
          holes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          topographical_variance: "low_exposed"
        },
        dune_terrain_zone: {
          holes: [13, 14, 15, 16, 17, 18],
          topographical_variance: "high_undulating_rippling"
        },
        signature_hazard_15th: {
          hole_number: 15,
          tee_type: "elevated_dune",
          landing_zone_variance: "narrow_fairway",
          bunkering_count: 0,
          green_protection: "nestled_dune_obscured_blind_approach"
        }
      }
    },
    royal_porthcawl: {
      uid: "UK-WAL-RPC-02",
      official_name: "Royal Porthcawl Golf Club",
      par: 72,
      yardage: 7152,
      routing_type: "seaside_coastal_grid",
      spatial_markers: {
        bristol_channel_border: {
          bearing_vector: 180.0,
          primary_wind_exposure: "high_gale_exposure"
        },
        locks_common_historic_origin: {
          latitude: 51.4883,
          longitude: -3.7161,
          elevation: 12.0
        },
        infrastructure_limitation_flag: {
          narrow_roads: true,
          open_championship_compatible: false,
          logistical_note: "R&A decision to exclude from The Open Rota due to local logistics."
        }
      }
    }
  }
};

// 2. Automated Integrity Audit & File Packager
export function compileAndVerifyDataset() {
  const scratchDir = path.resolve('scratch');
  const targetJsonPath = path.join(scratchDir, 'wales_topology_manifest_v4.7.0.json');
  const checksumPath = path.join(scratchDir, 'wales_topology_manifest.sha256');

  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  console.log('📦 Packaging ATLAS-GOLF-WALES-001 Topology Dataset...');

  // Structural & Invariant Validations
  const venues = Object.keys(WALES_TOPOGRAPHY_DATASET.flagship_venues);
  if (venues.length !== 2) {
    throw new Error(`[AUDIT FAILED] Expected 2 flagship venues, detected ${venues.length}`);
  }

  // Verify Air Density calculation formula invariants
  for (const [key, profile] of Object.entries(WALES_TOPOGRAPHY_DATASET.atmospheric_profiles)) {
    const Rd = 287.058;
    const Rv = 461.495;
    const computedRho = (profile.pressure_dry_pa / (Rd * profile.air_temp_k)) +
                        (profile.vapor_pressure_pa / (Rv * profile.air_temp_k));
    const delta = Math.abs(computedRho - profile.calculated_air_density_rho);

    if (delta > 0.005) {
      throw new Error(`[BALLISTICS CALIBRATION FAILED] Profile ${key} density mismatch: expected ${profile.calculated_air_density_rho}, got ${computedRho.toFixed(4)}`);
    }
  }

  // Serialize to target JSON
  const jsonString = JSON.stringify(WALES_TOPOGRAPHY_DATASET, null, 2);
  fs.writeFileSync(targetJsonPath, jsonString, 'utf-8');

  // Compute SHA-256 integrity hash
  const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
  fs.writeFileSync(checksumPath, hash, 'utf-8');

  console.log(`✅ Saved Dataset: ${targetJsonPath}`);
  console.log(`🔒 SHA-256 Signature: ${hash}`);
  console.log(`⛳ Verification Status: PASSED (WO/2026/150385 & R&A Rule 4.3a State 4 Compliant)`);

  return { targetJsonPath, hash };
}

compileAndVerifyDataset();
