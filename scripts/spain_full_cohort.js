/**
 * Spain Championship Cohort Registry
 * Schema Version: v4.0.0 (Master Ecosystem Compatible)
 *
 * @module scripts/spain_full_cohort
 */

export const SPANISH_EXPANSION_COHORT = [
  {
    id: "valderrama_golf_club",
    name: "Real Club Valderrama",
    cohort: "Andalusia & Sotogrande",
    location: { lat: 36.2867, lng: -5.3256, region: "Sotogrande, Andalusia, Spain", country: "Spain" },
    bbox: [36.275, -5.340, 36.298, -5.310],
    elevation_m: 45,
    environmental_constants: {
      base_air_density_delta: "0.0%",
      surface_firmness_rating: "Championship Firm (Cork Parkland)",
      prevailing_wind_vectors: ["Levante_E", "Poniente_W"]
    },
    tees: {
      championship: { rating: 76.1, slope: 148, total_yards: 6990, par: 71 },
      white: { rating: 74.0, slope: 142, total_yards: 6560, par: 71 },
      yellow: { rating: 71.8, slope: 136, total_yards: 6115, par: 71 }
    },
    key_holes: [
      {
        hole: 4,
        name: "La Cascada",
        par: 5,
        yardage: 563,
        elevation_delta_m: 3.5,
        directives: {
          caddy: "Approach requires high-trajectory apex over lateral water wall.",
          statty: "Going for green in 2 yields negative EV for handicap > 2."
        }
      },
      {
        hole: 17,
        name: "Los Lirios",
        par: 5,
        yardage: 536,
        elevation_delta_m: -2.0,
        directives: {
          puttser: "Green slopes front-to-back toward water basin; protect against roll-back on front pin placements.",
          tailor: "Dynamic spin management required to hold narrow landing shelf."
        }
      }
    ]
  },
  {
    id: "el_saler_golf",
    name: "Campo de Golf El Saler",
    cohort: "Valencia & Levant Coast",
    location: { lat: 39.3458, lng: -0.3126, region: "Valencia, Spain", country: "Spain" },
    bbox: [39.335, -0.325, 39.358, -0.300],
    elevation_m: 4,
    environmental_constants: {
      base_air_density_delta: "+0.1%",
      surface_firmness_rating: "Very Firm (Coastal Links)",
      prevailing_wind_vectors: ["Mediterranean_E", "Mistral_NW"]
    },
    tees: {
      white: { rating: 74.8, slope: 139, total_yards: 6980, par: 72 },
      yellow: { rating: 72.4, slope: 134, total_yards: 6510, par: 72 }
    },
    key_holes: [
      {
        hole: 8,
        name: "El Saler Coastal",
        par: 4,
        yardage: 435,
        elevation_delta_m: 0.0,
        directives: {
          caddy: "Mediterranean crosswind drives Magnus drift left-to-right toward dunes.",
          judge: "Albufera Nature Park preserves define no-play environmental relief boundaries."
        }
      }
    ]
  },
  {
    id: "finca_cortesin",
    name: "Finca Cortesin Golf Club",
    cohort: "Andalusia & Sotogrande",
    location: { lat: 36.3985, lng: -5.2283, region: "Casares, Andalusia, Spain", country: "Spain" },
    bbox: [36.388, -5.245, 36.410, -5.215],
    elevation_m: 85,
    environmental_constants: {
      base_air_density_delta: "-0.5%",
      surface_firmness_rating: "Bermuda Firm",
      prevailing_wind_vectors: ["Levante_ENE", "Thermal_SW"]
    },
    tees: {
      black: { rating: 76.8, slope: 146, total_yards: 7482, par: 72 },
      white: { rating: 74.5, slope: 140, total_yards: 6945, par: 72 }
    },
    key_holes: [
      {
        hole: 4,
        name: "The Gorge",
        par: 4,
        yardage: 460,
        elevation_delta_m: -12.0,
        directives: {
          caddy: "Plays -14 yards due to steep drop into prevailing thermal headwind.",
          alieve: "Uneven downhill lie setup: stabilize lead hip to reduce lumbar shear."
        }
      }
    ]
  },
  {
    id: "puerta_de_hierro_arriba",
    name: "Real Club de la Puerta de Hierro (Arriba)",
    cohort: "Madrid & Central Plateau",
    location: { lat: 40.4578, lng: -3.7625, region: "Madrid, Spain", country: "Spain" },
    bbox: [40.448, -3.778, 40.468, -3.748],
    elevation_m: 660,
    environmental_constants: {
      base_air_density_delta: "-4.2%",
      surface_firmness_rating: "High-Plateau Parkland",
      prevailing_wind_vectors: ["Guadarrama_N", "Meseta_SW"]
    },
    tees: {
      white: { rating: 74.2, slope: 137, total_yards: 6950, par: 72 },
      yellow: { rating: 71.9, slope: 131, total_yards: 6480, par: 72 }
    },
    key_holes: [
      {
        hole: 12,
        name: "Sierra View",
        par: 3,
        yardage: 215,
        elevation_delta_m: 4.0,
        directives: {
          sticks: "Thin altitude air (+660m) adds +8 yards carry; club down one full iron.",
          caddy: "Northern mountain breeze dampens altitude carry gain."
        }
      }
    ]
  }
];
