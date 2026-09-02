/**
 * src/golf/alex-wenger-golf/core/media/socialCopyGenerator.js
 * Automated Social Media Copy Template Engine: Phase 6 Media Engine
 * Governance: BREHON Standard v1.0 | Patent WO/2026/150385
 */

/**
 * Generates automated Twitter/X and LinkedIn social copy for a course recap reel.
 * @param {object} params Snapshot & ballistics data
 * @returns {object} Social media copy object
 */
export function generateSocialCopyTemplates(params = {}) {
  const courseName = params.courseName || "Royal Porthcawl Golf Club";
  const hole = params.hole || 18;
  const par = params.par || 4;
  const rawDist = params.rawDistanceYards || 442;
  const playsLike = params.playsLikeYards || 482;
  const windDetail = params.windDetail || "25.4 mph Bristol Channel Gale";

  const shortUrlBuffer = params.shortUrl ? 24 : 0; // Account for 23-char t.co short link + space
  const carryDistanceYards = params.carryYards || 242;

  let twitterCopy = `⛳ ${courseName} Hole ${hole} (Par ${par}, ${rawDist}y).
💨 Wind: ${windDetail}
📐 3-DoF Physics Result: Plays ${playsLike}y (+${playsLike - rawDist}y wind drag). Carried ${carryDistanceYards}y into the gale.

#AlexWengerGolf #GolfPhysics #BrehonOS #WO2026150385`;

  if (params.shortUrl) {
    twitterCopy += ` ${params.shortUrl}`;
  }

  const linkedinCopy = `🏛️ INDUSTRIALIZING GTM MEDIA: 3-DoF BALLISTICS & ZERO-COST RECAP AUTOMATION

At Royal Porthcawl's 18th hole, facing a 25.4 mph headwind gale off the Bristol Channel, a 442-yard par 4 expands to a 482-yard plays-like challenge.

Traditional golf apps output static yardage numbers. The Alex Wenger Specialist Intelligence Mesh (Patent WO/2026/150385) executes a 3-DoF Runge-Kutta aerodynamic integration in <3ms, serving 4-point spatial target windows to the player's Flight Deck.

AUTOMATED POST-ROUND MEDIA PIPELINE (PHASE 6):
1. Headless Playwright 60 FPS 9:16 vertical render (MapLibre vector + Copernicus DEM 3D flyover).
2. DaVinci Resolve Fairlight -12dB side-chain audio ducking over wind noise.
3. WARD STONE — BREHON GOVERNED watermark & SHA-256 evidence sealing.

Marginal post-production cost per user reel: $0.00.

#GolfTech #AIEngineering #SportsAnalytics #BREHON #PatentWO2026150385`;

  return {
    twitter: {
      platform: "Twitter / X",
      maxLength: 280,
      charCount: twitterCopy.length,
      isCompliant: twitterCopy.length <= 280,
      text: twitterCopy
    },
    linkedin: {
      platform: "LinkedIn",
      targetAudience: "Institutional / Sports Tech / B2B Academies",
      text: linkedinCopy
    },
    metadata: {
      courseName,
      hole,
      playsLikeDiffYards: playsLike - rawDist,
      governance: "BREHON v1.0",
      patent: "WO/2026/150385"
    }
  };
}
