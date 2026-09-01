/**
 * DaVinciA⁺ / Alex Wenger² - Golf Personality, Rules, Storytelling & Avatar Engine
 *
 * Implements Patent WO/2026/150385 Golf Intelligence & Conversational Core.
 *
 * @module golf/alexWengerEngine
 */

import courseData from './data/geographic_memory_engine.json' with { type: 'json' };

/**
 * The 9 Canonical Avatars of Alex Wenger² Ecosystem.
 */
export const AVATARS = Object.freeze({
  SWINGSY: 'SWINGSY',
  JUDGE: 'JUDGE',
  ZENNER: 'ZENNER',
  CADDY: 'CADDY',
  TAILOR: 'TAILOR',
  ARCHITECT: 'ARCHITECT',
  PHYSIO: 'PHYSIO',
  STATS: 'STATS',
  CAPTAIN: 'CAPTAIN',
});

/**
 * Avatar Manifest & Role Registry.
 */
export const AVATAR_MANIFESTS = Object.freeze({
  [AVATARS.SWINGSY]: {
    id: AVATARS.SWINGSY,
    name: 'Swingsy',
    title: 'Technical Swing Mechanic & Kinematic Sequence Specialist',
    tone: 'Analytic, precise, encouraging, biomechanical expert',
    french_flair: 'Ah, regarde! Let us inspect your hip turn and lead arm angle.',
    keywords: ['swing', 'grip', 'stance', 'backswing', 'downswing', 'tempo', 'kinematic', 'plane', 'wrist', 'slice', 'hook', 'shank', 'chunk'],
  },
  [AVATARS.JUDGE]: {
    id: AVATARS.JUDGE,
    name: 'Judge',
    title: 'Rules of Golf & Patent Governance Arbiter (WO/2026/150385)',
    tone: 'Authoritative, immutable, precise, 21 CFR Part 11 compliant',
    french_flair: 'According to Rule 14.3 and Patent WO/2026/150385, here is the exact ruling.',
    keywords: ['rule', 'penalty', 'out of bounds', 'hazard', 'drop', 'unplayable', 'infringement', 'dispute', 'governance', '21 cfr', 'audit'],
  },
  [AVATARS.ZENNER]: {
    id: AVATARS.ZENNER,
    name: 'Zenner',
    title: 'Mental Flow, HRV & Breathwork Calibration Coach',
    tone: 'Calm, grounding, rhythmic, supportive',
    french_flair: 'Breathe in... expire slowly. Forget the last shot, my friend. Focus on this breath.',
    keywords: ['breath', 'mental', 'focus', 'choke', 'nervous', 'pressure', 'flow', 'tempo', 'calm', 'confidence', 'yips'],
  },
  [AVATARS.CADDY]: {
    id: AVATARS.CADDY,
    name: 'Caddy',
    title: 'On-Course Tactical Strategist & Wind Vector Advisor',
    tone: 'Direct, crisp, tactical, sharp, fast-paced',
    french_flair: 'Right then! Wind is 15 knots off the left. Take the 6-iron and aim at the right edge of the dune.',
    keywords: ['yardage', 'wind', 'club', 'target', 'aim', 'layup', 'pin', 'bunker', 'hazard', 'carry', 'play'],
  },
  [AVATARS.TAILOR]: {
    id: AVATARS.TAILOR,
    name: 'Tailor',
    title: 'Master Club Fitter & Equipment Craftsman',
    tone: 'Meticulous, refined, artisan, technical',
    french_flair: 'Ah, magnificent steel! Let us fit the shaft bend profile and swing weight to your tempo.',
    keywords: ['shaft', 'flex', 'loft', 'lie angle', 'fitting', 'driver', 'irons', 'putter', 'grooves', 'moi', 'weight'],
  },
  [AVATARS.ARCHITECT]: {
    id: AVATARS.ARCHITECT,
    name: 'Architect',
    title: 'Course Designer & Spatial Geometry Specialist',
    tone: 'Visionary, spatial, contours-focused, descriptive',
    french_flair: 'Observe how Old Tom Morris carved this fairway between the natural Irish dunes.',
    keywords: ['dunes', 'green', 'contours', 'slope', 'architect', 'ballybunion', 'lahinch', 'augusta', 'designer', 'breeze'],
  },
  [AVATARS.PHYSIO]: {
    id: AVATARS.PHYSIO,
    name: 'Physio',
    title: 'Biomechanical Health & Fatigue Guard Specialist',
    tone: 'Clinical, protective, health-focused, firm',
    french_flair: 'Mon ami, your lower back fatigue is rising. Let us engage Fatigue Guard before the next drive.',
    keywords: ['fatigue', 'back', 'shoulder', 'pain', 'warmup', 'stretch', 'injury', 'stamina', 'recovery', 'load'],
  },
  [AVATARS.STATS]: {
    id: AVATARS.STATS,
    name: 'Stats',
    title: 'Strokes Gained & Probabilistic Data Analyst',
    tone: 'Data-dense, numerical, EV-focused, crisp',
    french_flair: 'The math does not lie: your Strokes Gained Approach rises +0.8 when taking 1 extra club.',
    keywords: ['stats', 'strokes gained', 'dispersion', 'average', 'percentage', 'math', 'odds', 'probability', 'handicap'],
  },
  [AVATARS.CAPTAIN]: {
    id: AVATARS.CAPTAIN,
    name: 'Alex Wenger (Captain & 19th Hole Host)',
    title: 'Master Host, Storyteller & Co-Host with David Ward',
    tone: 'Warm, witty, French charm, conversational, engaging',
    french_flair: 'Mais oui! Welcome to the 19th hole, my friend. Pull up a chair with David Ward and me!',
    keywords: ['story', 'history', 'david ward', '19th hole', 'drink', 'chat', 'co-host', 'lore', 'watson', 'masters'],
  },
});

/**
 * Athlete Skill Levels for Adaptive Explanation.
 */
export const SKILL_LEVELS = Object.freeze({
  NOVICE: 'NOVICE',           // Beginner: Simple analogies, no jargon, warm encouragement
  CLUB_PLAYER: 'CLUB_PLAYER',   // Mid-handicapper: Practical strategy, club yardages, swing cues
  TOUR_PRO: 'TOUR_PRO',       // Low-handicapper / Pro: Strokes gained, wind shear, kinematic sequence
});

/**
 * Route a user query to the most appropriate Alex Wenger Avatar.
 * @param {string} userPrompt
 * @param {object} [context]
 * @returns {object} Avatar manifest
 */
export function routeAvatarForContext(userPrompt = '', context = {}) {
  const text = String(userPrompt).toLowerCase();

  // Explicit override in context
  if (context.requestedAvatar && AVATAR_MANIFESTS[context.requestedAvatar]) {
    return AVATAR_MANIFESTS[context.requestedAvatar];
  }

  // Keyword scoring
  let bestAvatar = AVATAR_MANIFESTS[AVATARS.CAPTAIN];
  let maxScore = 0;

  for (const [avatarId, manifest] of Object.entries(AVATAR_MANIFESTS)) {
    let score = 0;
    for (const kw of manifest.keywords) {
      if (text.includes(kw)) score += 2;
    }
    if (score > maxScore) {
      maxScore = score;
      bestAvatar = manifest;
    }
  }

  return bestAvatar;
}

/**
 * Determine if a user query requires formal Rules of Golf precision.
 * @param {string} userQuery
 * @returns {{needsFormalRuling: boolean, ruleReferences: string[]}}
 */
export function evaluateRulesQuery(userQuery = '') {
  const text = String(userQuery).toLowerCase();
  const ruleKeywords = ['rule', 'penalty', 'out of bounds', 'hazard', 'unplayable', 'drop point', 'provisional', 'advice', 'concede'];
  
  const needsFormalRuling = ruleKeywords.some(kw => text.includes(kw));
  const ruleReferences = [];

  if (text.includes('out of bounds') || text.includes('ob')) ruleReferences.push('Rule 18.2 (Out of Bounds & Lost Ball)');
  if (text.includes('hazard') || text.includes('penalty area') || text.includes('water')) ruleReferences.push('Rule 17 (Penalty Areas)');
  if (text.includes('unplayable')) ruleReferences.push('Rule 19 (Unplayable Ball)');
  if (text.includes('drop')) ruleReferences.push('Rule 14.3 (Dropping Ball in Relief Area)');

  return {
    needsFormalRuling,
    ruleReferences: ruleReferences.length ? ruleReferences : ['Rules of Golf (R&A / USGA Canonical Framework)'],
  };
}

/**
 * Generate 19th Hole Storytelling & Co-Host Banter.
 * @param {object} params
 * @returns {string} Story / Banter text
 */
export function generate19thHoleBanter({
  topic = 'club selection',
  courseId = 'ballybunion_old',
  coHost = 'David Ward',
  athleteName = 'Golfer',
  shotNotes = '',
} = {}) {
  const course = courseData.courses[courseId] || courseData.courses.ballybunion_old;
  
  const banterTemplates = [
    `Ah, mais oui, ${athleteName}! Sitting here at the 19th hole with ${coHost}, looking out over ${course.name}... ${coHost} and I were just talking about your approach on that hole. ${course.lore.watson_quote || ''} Tell me, why did you pick that club into the wind?`,
    `Welcome to the lounge, ${athleteName}! ${coHost} and I were discussing the history of ${course.name}. Established in ${course.established}, those Atlantic dunes test even the best. How did that swing feel out there?`,
    `Mais oui! ${coHost} always says that at ${course.name}, the wind tells you everything. You recorded a shot right from the ${shotNotes || 'fairway'}. ${coHost}, what do you think of that line?`,
  ];

  const index = Math.floor(Math.abs(topic.length + courseId.length) % banterTemplates.length);
  return banterTemplates[index];
}

/**
 * Format dynamic conversational response based on skill level and avatar.
 * @param {object} params
 * @returns {object} Formatted response package
 */
export function formatConversationalResponse({
  userPrompt = '',
  skillLevel = SKILL_LEVELS.CLUB_PLAYER,
  avatarId = null,
  courseId = 'ballybunion_old',
  athleteName = 'Alex',
} = {}) {
  const avatar = avatarId && AVATAR_MANIFESTS[avatarId] ? AVATAR_MANIFESTS[avatarId] : routeAvatarForContext(userPrompt);
  const rules = evaluateRulesQuery(userPrompt);
  const course = courseData.courses[courseId] || courseData.courses.ballybunion_old;

  let responseBody = '';

  if (rules.needsFormalRuling) {
    responseBody = `${AVATAR_MANIFESTS[AVATARS.JUDGE].french_flair}\n\nFor your situation: under ${rules.ruleReferences.join(', ')}, you proceed with 1 penalty stroke. Ensure your drop stays within 1 club-length of the relief point.`;
  } else if (avatar.id === AVATARS.CAPTAIN) {
    responseBody = generate19thHoleBanter({ topic: userPrompt, courseId, athleteName });
  } else {
    if (skillLevel === SKILL_LEVELS.NOVICE) {
      responseBody = `${avatar.french_flair}\n\nHere is the simple trick: keep your balance smooth, aim for the center of the fairway, and let the club do the work!`;
    } else if (skillLevel === SKILL_LEVELS.TOUR_PRO) {
      responseBody = `${avatar.french_flair}\n\nAnalyzing strokes gained & kinematic sequence: under ${course.prevailing_winds.primary_cardinal} wind at ${course.prevailing_winds.avg_speed_mph} mph, adjust carry target by +8 yards and play a 2-yard draw.`;
    } else {
      responseBody = `${avatar.french_flair}\n\nLet us look at your shot from ${course.name}. Take 1 extra club for the breeze, stay smooth in your transition, and trust your target.`;
    }
  }

  return {
    avatar: avatar.name,
    avatar_id: avatar.id,
    skill_level: skillLevel,
    rules_applied: rules.needsFormalRuling,
    rule_references: rules.ruleReferences,
    course_name: course.name,
    response_text: responseBody,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Persistent Athlete Profile Manager.
 * @param {object} params
 * @returns {object} Athlete Profile
 */
export function createAthleteProfile({
  athlete_id = 'AW2-ATHLETE-001',
  name = 'Alex Wenger',
  handicap = 8.4,
  skill_level = SKILL_LEVELS.CLUB_PLAYER,
  favorite_course = 'ballybunion_old',
  home_club = 'Lee Side Sovereign Links',
  bag_setup = ['1W', '3W', '4I', '5I', '6I', '7I', '8I', '9I', 'PW', 'GW', 'SW', 'LW', 'PUTTER'],
} = {}) {
  return {
    athlete_id,
    name,
    handicap: Number(handicap),
    skill_level,
    favorite_course,
    home_club,
    bag_setup,
    session_history: [],
    created_at: new Date().toISOString(),
  };
}
