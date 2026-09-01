/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Cloudflare Worker Edge Server
 *
 * Provides sub-50ms global API routing for:
 * 1. GET /api/courses — List all ingested courses from Geographic Memory Engine.
 * 2. GET /api/courses/:id — Retrieve complete 18-hole dataset for specific course.
 * 3. POST /api/pipeline/execute — Run 6-state governed pipeline with Alex synthesis.
 * 4. POST /api/ballistics/3dof — Compute real-time plays-like yardage.
 *
 * @module src/worker
 */

import { executeGovernedIntelligencePipeline } from './golf/alex-wenger-golf/core/architecture/governedIntelligenceSystem.js';
import { calculate3DoFEffectiveYardage } from './golf/alex-wenger-golf/core/spatial/spatialIngestionEngine.js';
import geographicMemoryDb from './golf/data/geographic_memory_engine.json' with { type: 'json' };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET /api/courses — List ingested courses
      if (path === '/api/courses' && request.method === 'GET') {
        const coursesSummary = Object.values(geographicMemoryDb.courses).map(c => ({
          id: c.course_id,
          name: c.name,
          cohort: c.cohort,
          par: c.par,
          total_yards: c.total_yards,
          elevation_m: c.elevation_m,
          location: c.location,
        }));

        return new Response(JSON.stringify({
          status: 'success',
          version: env.ENGINE_VERSION || 'v4.3.0',
          count: coursesSummary.length,
          courses: coursesSummary,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. GET /api/courses/:id — Get course details
      if (path.startsWith('/api/courses/') && request.method === 'GET') {
        const courseId = path.replace('/api/courses/', '');
        const courseData = geographicMemoryDb.courses[courseId];

        if (!courseData) {
          return new Response(JSON.stringify({ status: 'error', message: `Course ${courseId} not found` }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ status: 'success', course: courseData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. POST /api/pipeline/execute — Execute 6-State Pipeline
      if (path === '/api/pipeline/execute' && request.method === 'POST') {
        const body = await request.json();
        const pipelineResult = executeGovernedIntelligencePipeline({
          userQuery: body.query || 'What is the target line?',
          branchId: body.branchId || null,
          specialistFindingText: body.specialistFindingText || '',
        });

        return new Response(JSON.stringify({ status: 'success', pipeline: pipelineResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. POST /api/ballistics/3dof — Compute 3-DoF Effective Yardage
      if (path === '/api/ballistics/3dof' && request.method === 'POST') {
        const body = await request.json();
        const rawYards = body.rawYards || 150;
        const deltaZ = body.deltaZ || 0;
        const altitudeMeters = body.altitudeMeters || 0;
        const windMph = body.windMph || 0;

        const playsLikeYards = calculate3DoFEffectiveYardage(rawYards, deltaZ, altitudeMeters, windMph);

        return new Response(JSON.stringify({
          status: 'success',
          rawYards,
          deltaZ,
          altitudeMeters,
          windMph,
          playsLikeYards,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Default fallback to static assets or 404
      if (env && env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response('Alex Wenger Golf Engine Edge Server Active', {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });

    } catch (error) {
      return new Response(JSON.stringify({ status: 'error', error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
