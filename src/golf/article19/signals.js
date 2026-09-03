/**
 * Alex Wenger² Article 19 Signal Extraction Module
 * Implements Claim 1 (Semantic features, intent, linguistic state)
 */

export class SignalExtractor {
  extractSignals(rawText, domain = "golf") {
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return {
        valid: false,
        error: "NO_NATURAL_LANGUAGE_INPUT",
        raw_text: rawText || "",
        topics: [],
        intent: "UNKNOWN",
        sentiment_polarity: 0.0,
        word_count: 0,
        timestamp: Date.now()
      };
    }

    const trimmed = rawText.trim();
    const lower = trimmed.toLowerCase();

    // 1. Topic Extraction
    const topics = [];
    if (/(swing|tempo|takeaway|follow-through|grip|stance|release|hip|rotation)/.test(lower)) topics.push("biomechanics_linguistic");
    if (/(putt|green|read|lag|stroke|line|pace)/.test(lower)) topics.push("putting");
    if (/(drive|tee|fairway|distance|launch)/.test(lower)) topics.push("driving");
    if (/(course|hole|hazard|bunker|wind|strategy|layup|pin)/.test(lower)) topics.push("course_management");
    if (/(speed|pace|run|heart|breath|fatigue|exhausted|sprint)/.test(lower)) topics.push("pacing_telemetry");
    if (/(frustrated|angry|annoyed|missed|terrible|struggling|bad|hook|slice)/.test(lower)) topics.push("negative_sentiment");
    if (/(great|flushed|pure|confident|solid|improved|ready|smooth)/.test(lower)) topics.push("positive_sentiment");

    // 2. Intent Extraction
    let intent = "GENERAL_INQUIRY";
    if (/(drill|practice|reps|exercise|routine|station)/.test(lower)) intent = "REQUEST_DRILL";
    else if (/(plan|target|strategy|approach|scout|yardage)/.test(lower)) intent = "TACTICAL_PLANNING";
    else if (/(ready|start|go|next shot|execute|tee off)/.test(lower)) intent = "COMPETITION_EXECUTION";
    else if (/(review|stats|analyze|feedback|recap|summary)/.test(lower)) intent = "POST_ROUND_REVIEW";
    else if (/(career|progression|trend|history|long term|season)/.test(lower)) intent = "CAREER_PROJECTION";

    // 3. Sentiment Polarity Calculation (-1.0 to +1.0)
    const positiveWords = ["great", "good", "flushed", "pure", "solid", "confident", "ready", "fine", "happy", "smooth", "dialed", "yes"];
    const negativeWords = ["bad", "missed", "terrible", "frustrated", "tired", "struggling", "hook", "slice", "angry", "chunked", "no"];
    
    const words = lower.split(/\s+/);
    let posCount = 0;
    let negCount = 0;
    words.forEach(w => {
      if (positiveWords.includes(w)) posCount++;
      if (negativeWords.includes(w)) negCount++;
    });

    let sentimentScore = 0.0;
    if (posCount + negCount > 0) {
      sentimentScore = (posCount - negCount) / (posCount + negCount);
    }

    return {
      valid: true,
      raw_text: trimmed,
      domain,
      intent,
      topics,
      sentiment_polarity: Math.max(-1.0, Math.min(1.0, sentimentScore)),
      word_count: words.length,
      timestamp: Date.now()
    };
  }
}
