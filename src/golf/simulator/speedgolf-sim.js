/**
 * Alpine Speedgolf 18-Hole Telemetry & Athlete Stream Simulator
 * Simulates Alex Wenger playing the Sion Alpine Course (Switzerland)
 * and feeding live natural-language & telemetry frames into the Article 19 Subsystem.
 */

import { AlexWengerSubsystem } from '../index.js';

export const SION_ALPINES_COURSE = [
  { hole: 1, par: 4, yards: 380, lat: 46.2285, lon: 7.3610, elevationM: 510, name: "Rhone Valley Opener" },
  { hole: 2, par: 3, yards: 165, lat: 46.2292, lon: 7.3625, elevationM: 512, name: "Tourbillon Vista" },
  { hole: 3, par: 5, yards: 510, lat: 46.2305, lon: 7.3640, elevationM: 515, name: "Valere Castle Ridge" },
  { hole: 4, par: 4, yards: 405, lat: 46.2318, lon: 7.3655, elevationM: 518, name: "Alpine Meadow" },
  { hole: 5, par: 4, yards: 390, lat: 46.2325, lon: 7.3670, elevationM: 520, name: "Pine Corridor" },
  { hole: 6, par: 3, yards: 180, lat: 46.2332, lon: 7.3685, elevationM: 522, name: "Glacier Breeze" },
  { hole: 7, par: 5, yards: 535, lat: 46.2340, lon: 7.3700, elevationM: 525, name: "Matterhorn Approach" },
  { hole: 8, par: 4, yards: 415, lat: 46.2348, lon: 7.3715, elevationM: 528, name: "Granite Standoff" },
  { hole: 9, par: 4, yards: 375, lat: 46.2355, lon: 7.3730, elevationM: 530, name: "Halfway Chalet Turn" },
  { hole: 10, par: 4, yards: 420, lat: 46.2360, lon: 7.3745, elevationM: 532, name: "High Slopes" },
  { hole: 11, par: 3, yards: 155, lat: 46.2365, lon: 7.3760, elevationM: 535, name: "Canyon Edge" },
  { hole: 12, par: 5, yards: 545, lat: 46.2370, lon: 7.3775, elevationM: 538, name: "Alpine Crest" },
  { hole: 13, par: 4, yards: 395, lat: 46.2375, lon: 7.3790, elevationM: 540, name: "Wildflower Run" },
  { hole: 14, par: 4, yards: 410, lat: 46.2380, lon: 7.3805, elevationM: 542, name: "Torrent Crossing" },
  { hole: 15, par: 3, yards: 170, lat: 46.2385, lon: 7.3820, elevationM: 545, name: "Sion Peak Drop" },
  { hole: 16, par: 4, yards: 430, lat: 46.2390, lon: 7.3835, elevationM: 548, name: "The Gauntlet" },
  { hole: 17, par: 5, yards: 520, lat: 46.2395, lon: 7.3850, elevationM: 550, name: "Penultimate Sprint" },
  { hole: 18, par: 4, yards: 440, lat: 46.2400, lon: 7.3865, elevationM: 552, name: "Clubhouse Grand Finale" }
];

export class SpeedgolfTelemetrySimulator {
  constructor(options = {}) {
    this.subsystem = options.subsystem || new AlexWengerSubsystem();
    this.currentHoleIndex = 0;
    this.totalRunningTimeSec = 0;
    this.totalStrokes = 0;
    this.history = [];
  }

  getCurrentHole() {
    return SION_ALPINES_COURSE[this.currentHoleIndex % SION_ALPINES_COURSE.length];
  }

  /**
   * Simulates playing a single hole with realistic Speedgolf athlete inputs & telemetry
   */
  async playHole(scenario = "NORMAL") {
    const hole = this.getCurrentHole();
    let athleteUtterance = "";
    let heartRate = 160;
    let strokes = hole.par;
    let runTimeSec = 210; // ~3.5 min run time for the hole

    if (scenario === "FRUSTRATION_DIVERGENCE") {
      strokes = hole.par + 2;
      heartRate = 178;
      runTimeSec = 260;
      athleteUtterance = `Hooked drive into rough on hole ${hole.hole}, missed two putts. Felt rushed and lost rhythm.`;
    } else if (scenario === "RECOVERY_PROGRESS") {
      strokes = hole.par - 1; // Birdie
      heartRate = 158;
      runTimeSec = 195;
      athleteUtterance = `Regained tempo on hole ${hole.hole}, smooth 3:1 swing on fairway, sank 12-footer.`;
    } else {
      athleteUtterance = `Solid drive down center on hole ${hole.hole}, steady green in regulation, two-putt par.`;
    }

    this.totalStrokes += strokes;
    this.totalRunningTimeSec += runTimeSec;

    const coachingResult = await this.subsystem.executeCoachingTurn(athleteUtterance, {
      mode: "COMPETE",
      athlete_consent: true,
      human_supervision: true,
      career_opt_in: true,
      run_id: `speedgolf-hole-${hole.hole}-${Date.now()}`
    });

    const frame = {
      hole_number: hole.hole,
      hole_name: hole.name,
      par: hole.par,
      coordinates: { latitude: hole.lat, longitude: hole.lon, elevationM: hole.elevationM },
      telemetry: {
        heart_rate_bpm: heartRate,
        hole_time_sec: runTimeSec,
        strokes,
        running_pace: `${Math.floor(runTimeSec / 60)}:${(runTimeSec % 60).toString().padStart(2, '0')}`
      },
      cumulative: {
        total_strokes: this.totalStrokes,
        total_time_min: (this.totalRunningTimeSec / 60).toFixed(1),
        speedgolf_score: this.totalStrokes + Math.round(this.totalRunningTimeSec / 60)
      },
      athlete_input: athleteUtterance,
      coaching_output: coachingResult.output,
      tone_state: coachingResult.tone_state,
      evidence_hash: coachingResult.evidence?.evidence_hash
    };

    this.history.push(frame);
    this.currentHoleIndex++;
    return frame;
  }

  /**
   * Simulates full 18-hole Speedgolf Championship round
   */
  async simulateFullRound() {
    this.currentHoleIndex = 0;
    this.totalRunningTimeSec = 0;
    this.totalStrokes = 0;
    this.history = [];

    const frames = [];
    for (let i = 0; i < 18; i++) {
      let scenario = "NORMAL";
      if (i === 6) scenario = "FRUSTRATION_DIVERGENCE"; // Hole 7 bunker frustration
      if (i === 8) scenario = "RECOVERY_PROGRESS";      // Hole 9 recovery birdie
      const frame = await this.playHole(scenario);
      frames.push(frame);
    }

    return {
      round_completed: true,
      course: "Golf Club de Sion (Matterhorn Alpine Speedgolf)",
      holes_played: 18,
      total_strokes: this.totalStrokes,
      total_time_min: (this.totalRunningTimeSec / 60).toFixed(1),
      final_speedgolf_score: this.totalStrokes + Math.round(this.totalRunningTimeSec / 60),
      frames
    };
  }
}
