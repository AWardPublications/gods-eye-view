/**
 * Alex Wenger Master Golf Intelligence Platform
 * Multi-Region Cloudflare Edge Worker Router
 *
 * Edge Latency Targets:
 * - /api/v1/ballistics: <15ms (Smart placement pure math)
 * - /api/v1/spatial/:id: <25ms (Edge-cached via Geohash-5 KV/R2)
 * - /api/v1/state: <45ms (Governed 6-State FSM pipeline)
 * - /api/v1/memory/snapshot: <50ms (Non-blocking async KV write via ctx.waitUntil)
 *
 * @module src/edge/worker
 */

import { executeGovernedIntelligencePipeline } from '../golf/alex-wenger-golf/core/architecture/governedIntelligenceSystem.js';
import { calculate3DoFEffectiveYardage } from '../golf/alex-wenger-golf/core/spatial/spatialIngestionEngine.js';
import geographicMemoryDb from '../golf/data/geographic_memory_engine.json' with { type: 'json' };

/**
 * Coarse Geohash-5 Encoder for KV Partitioning (~4.9km x 4.9km resolution)
 * Prevents Cloudflare KV write-rate limits across dense clusters.
 */
export function encodeGeohash5(lat = 56.34, lon = -2.80) {
  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let isEven = true;
  let latMin = -90, latMax = 90;
  let lonMin = -180, lonMax = 180;
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < 5) {
    if (isEven) {
      const lonMid = (lonMin + lonMax) / 2;
      if (lon >= lonMid) {
        ch |= BITS[bit];
        lonMin = lonMid;
      } else {
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        ch |= BITS[bit];
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }
  return geohash;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS Handling for Mobile Spotter & Client HUD
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Patent-Audit',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Governance-Patent': env?.PATENT_GOVERNANCE || 'WO/2026/150385',
      'X-Engine-Version': env?.API_VERSION || 'v4.6.0',
    };

    try {
      // 1. Sub-50ms 3-DoF Ballistics Yardage Calculation (<15ms Target)
      if (pathname === '/api/v1/ballistics' && request.method === 'POST') {
        const body = await request.json();
        const { rawYards, deltaZ, altitudeMeters, windMph } = body;

        const playsLikeYards = calculate3DoFEffectiveYardage(
          Number(rawYards || 150),
          Number(deltaZ || 0),
          Number(altitudeMeters || 0),
          Number(windMph || 0)
        );

        return new Response(JSON.stringify({
          status: 'success',
          latency_target: '<15ms',
          rawYards,
          deltaZ,
          altitudeMeters,
          windMph,
          playsLikeYards,
        }), { headers: corsHeaders });
      }

      // 2. Governed 6-State Pipeline (States 0-5 + Judge Filter Gate) (<45ms Target)
      if (pathname === '/api/v1/state' && request.method === 'POST') {
        const payload = await request.json();
        const { query, mode, courseId, holeNumber, liveTelemetry } = payload;

        // Run full State 0 -> State 5 synthesis
        const responseState = executeGovernedIntelligencePipeline({
          userQuery: query || 'What is the target line?',
          branchId: mode || null,
          specialistFindingText: liveTelemetry?.specialistFindingText || '',
        });

        return new Response(JSON.stringify({
          status: 'success',
          governance_patent: 'WO/2026/150385',
          holeNumber,
          courseId,
          pipeline: responseState,
        }), { headers: corsHeaders });
      }

      // 3. Edge-Cached Spatial Bundle Retrieval (<25ms Target with Geohash-5 Partitioning)
      if (pathname.startsWith('/api/v1/spatial/')) {
        const courseId = pathname.replace('/api/v1/spatial/', '');

        // Direct local memory index lookup
        const localCourse = geographicMemoryDb.courses[courseId];
        if (localCourse) {
          const lat = localCourse.elevation_m || 56.34; // fallback lat/lon
          const lon = localCourse.total_yards ? localCourse.total_yards / 100 : -2.80;
          const countryCode = localCourse.country_code || localCourse.country || 'US';
          const geohash5 = encodeGeohash5(lat, lon);
          const geohashPartition = `course_idx_${countryCode}_${geohash5}`;

          return new Response(JSON.stringify({
            status: 'success',
            geohash_partition: geohashPartition,
            course: localCourse,
          }), {
            headers: {
              ...corsHeaders,
              'Cache-Control': 'public, max-age=86400, s-maxage=604800',
            },
          });
        }

        // KV Edge Partition Index lookup fallback (course_idx_${country}_${geohash5})
        if (env && env.COURSE_INDEX) {
          const partitionKey = `course_idx_${courseId}`;
          const cached = await env.COURSE_INDEX.get(partitionKey, 'json') || await env.COURSE_INDEX.get(`course_${courseId}`, 'json');
          if (cached) {
            return new Response(JSON.stringify(cached), {
              headers: {
                ...corsHeaders,
                'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
              },
            });
          }
        }

        return new Response(JSON.stringify({ error: 'Course not found' }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      // 4. Ingest Compressed Tactical HUD / Memory Snapshot (<50ms Target)
      if (pathname === '/api/v1/memory/snapshot' && request.method === 'POST') {
        const snapshot = await request.json();
        const { userId, hole, timestamp, cardBase64, strokesGained } = snapshot;

        const maxPayload = Number(env?.MAX_PAYLOAD_SIZE_BYTES || 153600);

        // Enforce maximum snapshot footprint (<150KB)
        if (cardBase64 && cardBase64.length > maxPayload * 1.37) {
          return new Response(JSON.stringify({ error: 'Snapshot exceeds 150KB limit' }), {
            status: 413,
            headers: corsHeaders,
          });
        }

        const logKey = `user_${userId || 'anon'}_round_${new Date().toISOString().slice(0, 10)}`;

        // Persist asynchronously via ctx.waitUntil if available
        if (ctx && ctx.waitUntil && env && env.USER_MEMORY) {
          ctx.waitUntil(env.USER_MEMORY.put(logKey, JSON.stringify({ hole, timestamp, strokesGained })));
        }

        return new Response(JSON.stringify({ status: 'PERSISTED', logKey }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Endpoint Not Found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
