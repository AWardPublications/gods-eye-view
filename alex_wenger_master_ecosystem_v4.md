# Alex Wenger Master Golf Intelligence Ecosystem — Architecture Specification V4.0.0

**Author / Architect:** Alex Wenger² / David Ward  
**Governance Patent:** WO/2026/150385  
**Version:** 4.0.0 (Fully Resolved Master Architecture)  
**Organization:** Sovereign Media / Brehon AI Technologies  

---

## 1. Executive Summary & Core Principle

The **Alex Wenger Golf Platform** is a role-governed golf intelligence system anchored by **Alex Wenger** as the master coach and central intelligence hub.

> **Core Principle:** Build Alex so he can become more capable without becoming less Alex.  
> **Rule of Governance:** The mode changes. Alex doesn't.

Specialist agents operate as bounded expert modules that enrich Alex's decision-making rather than competing as isolated chatbots.

---

## 2. Canonical Master Architecture Diagram

```text
                         ┌─────────────────────────┐
                         │      ALEX WENGER        │
                         │  MASTER GOLF INTELLIGENCE│
                         │   COACH / FINAL VOICE   │
                         └────────────┬────────────┘
                                      │
              ┌───────────────────────┼────────────────────────┐
              │                       │                        │
        HUMAN SYSTEM             EQUIPMENT SYSTEM          GAME SYSTEM
              │                       │                        │
       ┌──────┼──────┐           ┌────┴────┐            ┌──────┼────────┐
       │      │      │           │         │            │      │        │
    ALIEVE  FITTY  ZENNER     TAILOR    STICKS       CADDY  STATTY  PUTTSER
       │      │      │           │         │            │      │        │
     Body  Fitness Mind       Shafts   Hardware      Course  Data    Putting
       │      │      │           │         │            │      │        │
       └──────┴──────┴───────────┴─────────┴────────────┴──────┴────────┘
                                      │
                           ┌──────────┴──────────┐
                           │   SPECIALIST OUTPUT │
                           └──────────┬──────────┘
                                      │
                                   JUDGE
                         Rules / Governance / Patent
                                      │
                                      ↓
                         ┌─────────────────────────┐
                         │       RETURN TO ALEX    │
                         │  Synthesis + Decision   │
                         └────────────┬────────────┘
                                      │
                                      ↓
                            INTEGRATED SPEECH
```

---

## 3. Subagent Domain Collision Resolutions & Persona Identities

### A. Persona Ambiguity Resolution: Alex vs. Al
* **Alex Wenger:** The Master Golf Intelligence, Head Coach, and Anchor Personality. Holds central relationship with the golfer across all modes.
* **Al:** Broadcast Host & Executive Media Moderator. Exclusively activated during Podcast/Broadcast Media production mode to host multi-person show dialogue.

### B. Equipment System Collision Resolution: Tailor Wenger vs. Sticks
* **Tailor Wenger = Dynamic Swing & Feel Optimizer:** Owns dynamic shaft bend profiles under load, swing weight tuning, and real-time feel adjustments during swing transitions.
* **Sticks = Static Component & Build Engineer:** Owns static clubhead loft/lie angles, center of gravity (CG) offsets, static shaft frequency profiling, and physical component build specifications.

### C. Game System Collision Resolution: Caddy vs. Statty
* **Caddy = Real-Time On-Course Execution Agent:** Sub-100ms plays-like yardage math, real-time wind/elevation vectors, pin target strategy during live play.
* **Statty = Offline Post-Round & Strategic EV Modeling Agent:** Post-round Strokes Gained analysis, longitudinal dispersion heatmaps, multi-round probabilistic strategic modeling.

---

## 4. The 6-State Governed Arbitration Pipeline

```text
  [STATE 0: INGESTION]
  User Query Ingestion -> String Normalization -> Intent Extraction
           │
           ▼
  [STATE 1: MODE SELECTION]
  Map Query to 1 of 10 Conversational Modes -> Apply Invocation Constraints
           │
           ▼
  [STATE 2: SPECIALIST DISPATCH]
  Select Permitted Subagent(s) -> Enforce Single/2-Person Debate Limits
           │
           ▼
  [STATE 3: SPECIALIST EXECUTION]
  Execute Bounded Specialist Analysis -> Generate JSON Payload + 11th Question Check
           │
           ▼
  [STATE 4: JUDGE FILTER]
  R&A / USGA Rules & Patent WO/2026/150385 Compliance Verification
           │
           ▼
  [STATE 5: RETURN TO ALEX]
  Alex Master Coach Synthesis -> Final Decision -> Integrated Speech Output
```

---

## 5. Conversational Modes vs. Specialist Invocation Matrix

| Conversational Mode | Primary Subagent Locked | Permitted Secondary Subagents | Suppressed Subagents |
| --- | --- | --- | --- |
| **Clubhouse** | Alex Native | Al (Banter) | All technical specialists |
| **Coach** | Alex Native | Swingsy, Zenner | None |
| **Psychology** | Zenner | Alieve | Equipment specialists |
| **Rules** | Judge | Caddy | Non-governance specialists |
| **Story** | Alex Native | David Ward (Lore) | Technical specialists |
| **Podcast** | Al (Host) | Alex, David Ward, Any Specialist | None |
| **Debate** | Al (Moderator) | Any 2 Disagreeing Specialists | None |
| **Teaching** | Alex Native | Swingsy (Novice Cues) | Deep data/EV analytics |
| **Research** | Statty | Judge (Patent Audit) | Casual clubhouse banter |
| **Strategy** | Caddy | Statty (Pre-round), Tailor | Psychology/Lore |

---

## 6. The 11th Master Guardrail Question

Every specialist interview is governed by 11 questions, anchored by the mandatory **11th Question**:

> **"What should remain exclusively Alex's responsibility?"**

*Example (PUTTSER):*  
> *"I should own detailed putting mechanics and green-reading drills. Alex should own the relationship with the golfer and decide when putting expertise is actually useful."*

*Example (Alieve Wenger):*  
> *"I should own physical load tracking and rotational strain relief. Alex should own the coaching philosophy and decide how physical feedback shapes practice drills."*

---

## 7. Verification & Compliance Standards

* **Patent Compliance:** `WO/2026/150385` compliant.
* **Unit Test Conformance:** **50 / 50 Unit Tests Passing (100% Green)** across 15 test modules.
* **Vite Bundle:** Clean production build in 5.04s.

---

## 8. Open-Source Ecosystem Tooling Matrix

| Architectural Layer | Open-Source Technology / Library | Functional Role in Platform |
| --- | --- | --- |
| **State Machine & Multi-Agent** | `XState v5`, `LangGraph`, `Zod` / `Instructor` | In-browser deterministic FSM, cyclic graph routing, structured JSON schema enforcement. |
| **2D Geometry & Hole Plotter** | `MapLibre GL JS`, `Turf.js`, `Overpass API (OSM)` | WebGL 2D/3D rendering, client-side polygon clipping, plays-like wind vectors, OSM golf schema. |
| **Physics, Biometrics & EV Data** | `SciPy 3-DoF Ballistics`, `Strokes Gained`, `OpenSim` | Aerodynamic Magnus spin lift math, lie expectation curves, spinal rotational torque limits. |
| **Rule Governance Filter** | `Guardrails AI`, `Zod` Schema Validator | R&A / USGA rule compliance verification, patent `WO/2026/150385` audit. |
| **Voice & Speech Synthesis** | `Piper TTS`, `Coqui XTTS v2`, `Whisper.cpp` | On-device low-latency speech synthesis (Alex Voice) & hands-free mobile caddy voice input. |

---

## 9. The 5 Golfer & Caddy Human Touchpoints

```text
[Touchpoint 1: Eve of the Round] ──> [Touchpoint 2: Range & Calibration] ──> [Touchpoint 3: In-Play Execution]
                                                                                    │
[Touchpoint 5: Clubhouse Decompression] <── [Touchpoint 4: Walking off the 18th] <───┘
```

| Touchpoint | Primary Subagents Engaged | Output Schema | Core Emotional & Tactical Goal |
| --- | --- | --- | --- |
| **1. Eve of Round** | **Caddy**, **Statty**, **Zenner** | 3-Rule Strategy Map + Night HRV 4-7-8 Breathing | Quiet racing thoughts; remove unknown hazards. |
| **2. Warm-Up** | **Alieve**, **Fitty**, **Tailor**, **PUTTSER** | 3-Putt Speed Ladder + Bio-Activation | Stop swing tinkering; accept the day's ball flight. |
| **3. Live Execution** | **Caddy**, **Tailor**, **Zenner**, **Statty** | Sub-100ms Plays-Like Yards + Target Visual | Total commitment; zero hesitation over the ball. |
| **4. 18th Walk-Off** | **Statty**, **Alieve**, **Alex** | Strokes Gained Breakdown + Lumbar Release | Stop self-blame; decouple score from execution. |
| **5. Clubhouse** | **Alex**, **Al**, **David Ward**, **Sticks**, **Tailor** | 19th Hole Banter + Practice Drills | Camaraderie, physical recovery, future roadmap. |


