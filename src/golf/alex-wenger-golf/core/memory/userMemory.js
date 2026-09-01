/**
 * Alex Wenger Golf Platform - Persistent User Memory Layer
 *
 * Manages user golf profiles, player dispersion baselines, and explicitly user-controlled memory state.
 *
 * @module alex-wenger-golf/core/memory/userMemory
 */

/**
 * Factory for creating a canonical Alex Wenger Golf User Memory Schema.
 */
export function createUserGolfMemory({
  handicap = null,
  skill_level = 'beginner',
  favorite_players = [],
  home_course = null,
  strengths = [],
  weaknesses = [],
  goals = [],
  playing_style = [],
  conversation_preferences = [],
  dispersion_baselines = null,
} = {}) {
  return {
    handicap,
    skill_level,
    favorite_players: Array.isArray(favorite_players) ? favorite_players : [],
    home_course,
    strengths: Array.isArray(strengths) ? strengths : [],
    weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
    goals: Array.isArray(goals) ? goals : [],
    playing_style: Array.isArray(playing_style) ? playing_style : [],
    conversation_preferences: Array.isArray(conversation_preferences) ? conversation_preferences : [],
    dispersion_baselines: dispersion_baselines || {
      driver_lateral_spread_yds: 28,
      iron_landing_angle_deg: 47,
      putting_6ft_make_pct: 68.5,
    },
    last_updated: new Date().toISOString(),
  };
}

/**
 * Update memory fields explicitly controlled by the user.
 * @param {object} currentMemory
 * @param {object} updates
 * @returns {object} Updated memory schema
 */
export function updateUserGolfMemory(currentMemory, updates = {}) {
  const memory = currentMemory || createUserGolfMemory();

  if ('handicap' in updates) memory.handicap = updates.handicap !== null ? Number(updates.handicap) : null;
  if ('skill_level' in updates) memory.skill_level = String(updates.skill_level);
  if ('home_course' in updates) memory.home_course = updates.home_course;

  if (Array.isArray(updates.strengths)) memory.strengths = [...new Set([...memory.strengths, ...updates.strengths])];
  if (Array.isArray(updates.weaknesses)) memory.weaknesses = [...new Set([...memory.weaknesses, ...updates.weaknesses])];
  if (Array.isArray(updates.goals)) memory.goals = [...new Set([...memory.goals, ...updates.goals])];

  if (updates.dispersion_baselines && typeof updates.dispersion_baselines === 'object') {
    memory.dispersion_baselines = {
      ...memory.dispersion_baselines,
      ...updates.dispersion_baselines,
    };
  }

  memory.last_updated = new Date().toISOString();
  return memory;
}
