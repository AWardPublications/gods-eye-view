# Cesium 3D Globe & God's Eye View Reality Audit

**PURPOSE**: System Proof Pack — Transparency Matrix on Live vs. Simulated Visualizer Data  
**DATE**: 01 September 2026  
**STATUS**: FORENSICALLY AUDITED  

---

## 1. Geospatial Data Source Classification Matrix

To prevent misleading claims, every visual layer rendered on the Cesium 3D globe is explicitly labeled:

| Visual Layer | Underlying Source | Classification | Forensic Description |
|---|---|---|---|
| **Sovereign Embassy Nodes** | `src/data/embassyTradeCorridors.js` | `DERIVED_GOVERNED_STATE` | Real geographical coordinates (Sion, Cork, SF, Geneva, Tokyo) rendered with 3D pin entities. |
| **Trade Corridor Geodesic Arcs** | `src/data/embassyTradeCorridors.js` | `SIMULATED_GOVERNED_DATA` | Great-circle 3D polyline glowing cyan curves connecting diplomatic nodes. Volume flows represent governed clearing throughput. |
| **Speedgolf Sion Course Topology** | `src/golf/simulator/speedgolf-sim.js` | `DERIVED_TOPOGRAPHIC_DATA` | Actual Swiss elevation data (510m–552m) for Golf Club de Sion. Athlete trajectory and stroke timing are simulated. |
| **Subsea Cables & Landing Points** | `public/assets/cable-geo-*.json` | `FIXTURE_OSINT_DATA` | Static geographical dataset of real global submarine telecommunications cables. |
| **Live Aircraft (ADS-B)** | OpenSky Network REST API | `EXTERNAL_LIVE_TELEMETRY` | Live transponder data ingested via OpenSky when enabled. |
| **Satellites (TLE)** | Celestrak / Space-Track | `EXTERNAL_ORBITAL_TELEMETRY` | Real-time orbital propagation using `satellite.js` SGP4 model. |

---

## 2. Invariant Rule

The God's Eye View HUD must always display an explicit telemetry source indicator (`SIMULATED`, `LIVE_ADS_B`, or `GOVERNED_CORRIDOR`) to prevent users or auditors from mistaking simulated trade flows for live physical shipments.
