/**
 * Alex Wenger Adaptive Coaching Engine
 * Implements Claims 1–9 of PCT/IE2025/050001 (Article 19 Amendments)
 * 
 * Title: System and Method for Performance-Adaptive Coaching and Content Generation
 * Applicant / Inventor: David Ward (A. Ward Publications / Brehon AI Solutions Ltd.)
 * Signed: 23 April 2026, Sion, Switzerland
 */

export class InputProcessingModule {
  /**
   * Extract semantic features, intent, and linguistic markers from natural language input.
   * Operates without reliance on invasive biometric or wearable sensors (Claim 1, Claim 9).
   */
  processInput(rawText, domain = "golf") {
    if (!rawText || typeof rawText !== "string") {
      throw new Error("INVALID_INPUT: Natural language input must be a non-empty string.");
    }

    const trimmed = rawText.trim();
    const lower = trimmed.toLowerCase();

    // 1. Semantic Feature & Topic Extraction
    const topics = [];
    if (/(swing|tempo|takeaway|follow-through|grip|stance|release)/.test(lower)) topics.push("biomechanics_linguistic");
    if (/(putt|green|read|lag|stroke)/.test(lower)) topics.push("putting");
    if (/(drive|tee|fairway|distance)/.test(lower)) topics.push("driving");
    if (/(course|hole|hazard|wind|strategy|layup)/.test(lower)) topics.push("course_management");
    if (/(speed|pace|run|heart rate|breath|fatigue|exhausted)/.test(lower)) topics.push("pacing_telemetry");
    if (/(frustrated|angry|annoyed|missed|terrible|struggling|bad)/.test(lower)) topics.push("negative_sentiment");
    if (/(great|flushed|pure|confident|solid|improved|ready)/.test(lower)) topics.push("positive_sentiment");

    // 2. Intent Classification
    let intent = "GENERAL_INQUIRY";
    if (/(drill|practice|reps|exercise|routine)/.test(lower)) intent = "REQUEST_DRILL";
    else if (/(plan|target|strategy|approach|scout)/.test(lower)) intent = "TACTICAL_PLANNING";
    else if (/(ready|start|go|next shot|execute)/.test(lower)) intent = "COMPETITION_EXECUTION";
    else if (/(review|stats|analyze|feedback|recap)/.test(lower)) intent = "POST_ROUND_REVIEW";
    else if (/(career|progression|trend|history|long term)/.test(lower)) intent = "CAREER_PROJECTION";

    // 3. Sentiment Polarity Calculation (-1.0 to +1.0)
    let sentimentScore = 0.0;
    const positiveWords = ["great", "good", "flushed", "pure", "solid", "confident", "ready", "fine", "happy", "yes"];
    const negativeWords = ["bad", "missed", "terrible", "frustrated", "tired", "struggling", "hook", "slice", "angry", "no"];
    
    const words = lower.split(/\s+/);
    let posCount = 0;
    let negCount = 0;
    words.forEach(w => {
      if (positiveWords.includes(w)) posCount++;
      if (negativeWords.includes(w)) negCount++;
    });

    if (posCount + negCount > 0) {
      sentimentScore = (posCount - negCount) / (posCount + negCount);
    }

    // 4. Compliance Indicator (Claim 9: Task Adherence vs Avoidance)
    let taskAdherenceScore = 0.8; // Baseline default
    if (/(done|completed|finished|executed|hit 10 reps|did the drill)/.test(lower)) {
      taskAdherenceScore = 1.0;
    } else if (/(didn't do|skipped|hated it|refused|gave up|too hard)/.test(lower)) {
      taskAdherenceScore = 0.2;
    } else if (/(partially|half|tired|stopped early)/.test(lower)) {
      taskAdherenceScore = 0.5;
    }

    return {
      raw_text: trimmed,
      domain,
      intent,
      topics,
      sentiment_polarity: Math.max(-1.0, Math.min(1.0, sentimentScore)),
      compliance_score: Math.max(0.0, Math.min(1.0, taskAdherenceScore)),
      word_count: words.length,
      processed_at: new Date().toISOString()
    };
  }
}

export class PersistentMemoryArchitecture {
  /**
   * Stores session records indexed contextually and temporally (Claim 1, Claim 3).
   */
  constructor() {
    this.sessionRecords = [];
  }

  recordSessionEntry(structuredInput, metadata = {}) {
    const entry = {
      entry_id: `urn:wenger:session:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      iso_time: new Date().toISOString(),
      structured_input: structuredInput,
      metadata: {
        mode: metadata.mode || "TRAIN",
        athlete_id: metadata.athlete_id || "urn:davincia:athlete:alex_wenger_001",
        tone_state: metadata.tone_state || "BASELINE",
        ...metadata
      }
    };
    this.sessionRecords.push(entry);
    return entry;
  }

  getRecentSessions(count = 10, domain = null) {
    let list = [...this.sessionRecords];
    if (domain) {
      list = list.filter(e => e.structured_input.domain === domain);
    }
    return list.slice(-count);
  }

  clear() {
    this.sessionRecords = [];
  }
}

export class EvaluationModule {
  /**
   * Longitudinal evaluation determining behavioural deviation metrics (Claim 1, Claim 2, Claim 5).
   */
  constructor(memory) {
    this.memory = memory;
  }

  evaluateDeviation(currentProcessedInput, windowSize = 5) {
    const recent = this.memory.getRecentSessions(windowSize);
    const isCurrentDeviating = (currentProcessedInput.sentiment_polarity < 0 || currentProcessedInput.compliance_score < 0.6);
    
    if (recent.length === 0) {
      return {
        baseline_sentiment: currentProcessedInput.sentiment_polarity,
        rolling_compliance: currentProcessedInput.compliance_score,
        sentiment_drop: isCurrentDeviating,
        compliance_drop: currentProcessedInput.compliance_score < 0.6,
        engagement_drift: false,
        sustained_deviation: false,
        is_current_deviating: isCurrentDeviating,
        deviation_count: isCurrentDeviating ? 1 : 0
      };
    }

    const sentiments = recent.map(r => r.structured_input.sentiment_polarity);
    const compliances = recent.map(r => r.structured_input.compliance_score);

    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const avgCompliance = compliances.reduce((a, b) => a + b, 0) / compliances.length;

    // Detect negative deviation (> 0.4 drop below baseline or negative)
    const sentimentDrop = currentProcessedInput.sentiment_polarity < (avgSentiment - 0.4) || currentProcessedInput.sentiment_polarity < 0;
    const complianceDrop = currentProcessedInput.compliance_score < 0.6;

    // Sustained deviation counter
    let deviationCount = 0;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (recent[i].structured_input.sentiment_polarity < 0 || recent[i].structured_input.compliance_score < 0.6) {
        deviationCount++;
      } else {
        break;
      }
    }
    if (isCurrentDeviating) {
      deviationCount++;
    } else {
      deviationCount = 0;
    }

    const sustainedDeviation = deviationCount >= 3;
    const engagementDrift = (avgCompliance < 0.5) || sustainedDeviation;

    return {
      baseline_sentiment: avgSentiment,
      rolling_compliance: avgCompliance,
      sentiment_drop: sentimentDrop,
      compliance_drop: complianceDrop,
      sustained_deviation: sustainedDeviation,
      engagement_drift: engagementDrift,
      is_current_deviating: isCurrentDeviating,
      deviation_count: deviationCount
    };
  }
}

export class OutputControlModule {
  /**
   * Modifies output format, tone, and pacing based on Article 19 Tone Modulation rules (Claims 4, 6, 7, 8).
   */
  constructor() {
    this.currentToneState = "BASELINE"; // BASELINE | MODULATED | RECOVERING | DECAYED
    this.consecutiveDeviations = 0;
  }

  determineToneState(evalMetrics) {
    if (evalMetrics.is_current_deviating) {
      this.consecutiveDeviations++;
      
      // Claim 8: Tone decay enforced if deviation persists across interactions (> 3 sessions)
      if (this.consecutiveDeviations >= 3) {
        this.currentToneState = "DECAYED"; // Transitions to neutral state
      } else {
        this.currentToneState = "MODULATED"; // Supportive, simplified framing
      }
    } else {
      // Claim 8: Tone recovery triggered when sentiment returns within baseline range
      if (this.currentToneState === "MODULATED" || this.currentToneState === "DECAYED") {
        this.currentToneState = "RECOVERING";
      } else {
        this.currentToneState = "BASELINE";
      }
      this.consecutiveDeviations = 0;
    }

    return this.currentToneState;
  }

  formatCoachingResponse(content, toneState, mode = "TRAIN") {
    // Claim 4 & Claim 6: Reduce feedback length, default to audio summary, shift tone
    let formattedText = content;
    let deliveryModality = "TEXT_AND_AUDIO";
    let complexity = "DETAILED";
    let toneFraming = "DIRECT_PROFESSIONAL";

    switch (toneState) {
      case "MODULATED":
        toneFraming = "SUPPORTIVE_CONCISE";
        complexity = "SIMPLIFIED";
        deliveryModality = "AUDIO_PRIMARY_SUMMARY";
        formattedText = `[Supportive Pacing] Focus on tempo today. ${content.split('.')[0]}. Keep it simple and smooth.`;
        break;

      case "DECAYED":
        toneFraming = "NEUTRAL_OBJECTIVE";
        complexity = "MINIMAL";
        deliveryModality = "AUDIO_ONLY_SUMMARY";
        formattedText = `[Neutral Log] Baseline observation recorded. Drill targets paused until next session.`;
        break;

      case "RECOVERING":
        toneFraming = "ENCOURAGING_PROGRESSIVE";
        complexity = "MODERATE";
        deliveryModality = "TEXT_AND_AUDIO";
        formattedText = `[Rebuilding Rhythm] Solid alignment returning. ${content}`;
        break;

      case "BASELINE":
      default:
        toneFraming = "DIRECT_PROFESSIONAL";
        complexity = "DETAILED";
        deliveryModality = "TEXT_AND_AUDIO";
        break;
    }

    return {
      text: formattedText,
      tone_state: toneState,
      tone_framing: toneFraming,
      complexity,
      delivery_modality: deliveryModality,
      mode,
      generated_at: new Date().toISOString()
    };
  }
}

export class AlexWengerCoachingEngine {
  /**
   * Unified Article 19 Adaptive Coaching System Pipeline
   */
  constructor() {
    this.inputProcessor = new InputProcessingModule();
    this.memory = new PersistentMemoryArchitecture();
    this.evaluator = new EvaluationModule(this.memory);
    this.outputControl = new OutputControlModule();
  }

  processInteraction(rawInputText, context = {}) {
    // Step 1: Semantic feature & intent extraction
    const structuredInput = this.inputProcessor.processInput(rawInputText, context.domain || "golf");

    // Step 2: Multi-session longitudinal evaluation
    const evalMetrics = this.evaluator.evaluateDeviation(structuredInput);

    // Step 3: Determine Tone State (Baseline, Modulated, Recovering, Decayed)
    const toneState = this.outputControl.determineToneState(evalMetrics);

    // Step 4: Record in Persistent Memory Architecture
    this.memory.recordSessionEntry(structuredInput, {
      mode: context.mode || "TRAIN",
      athlete_id: context.athlete_id,
      tone_state: toneState
    });

    // Step 5: Format adaptive coaching response
    const rawResponseTemplate = context.template_content || `Maintain 3:1 backswing to downswing ratio. Focus on stable pelvis rotation.`;
    const response = this.outputControl.formatCoachingResponse(rawResponseTemplate, toneState, context.mode || "TRAIN");

    return {
      structured_input: structuredInput,
      evaluation_metrics: evalMetrics,
      tone_state: toneState,
      coaching_output: response
    };
  }
}
