/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Course Bundle Importer Script
 *
 * Imports JSON course manifests into geographic_memory_engine.json and generates Overpass API query payloads.
 *
 * Usage: node scripts/ingest_course_bundle.js [manifest_path]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateGolfOverpassQuery } from '../src/golf/alex-wenger-golf/core/data/overpassGolfIngestor.js';

const dbPath = join(process.cwd(), 'src/golf/data/geographic_memory_engine.json');

/**
 * Ingest a single course profile object into geographic_memory_engine.json
 * @param {object} item - Course manifest item
 * @returns {object} Updated course record
 */
export function ingestCourseBundle(item) {
  const db = JSON.parse(readFileSync(dbPath, 'utf-8'));
  const courseId = item.id;
  const bboxObj = item.bbox ? {
    minLat: item.bbox[0],
    minLon: item.bbox[1],
    maxLat: item.bbox[2],
    maxLon: item.bbox[3],
  } : { minLat: 36.275, minLon: -5.34, maxLat: 36.298, maxLon: -5.31 };

  const overpassQuery = generateGolfOverpassQuery(bboxObj);

  const existing = db.courses[courseId] || {};

  db.courses[courseId] = {
    ...existing,
    course_id: courseId,
    name: item.name,
    cohort: item.cohort || existing.cohort || "Spain Championship Expansion",
    established: item.established || existing.established || 1990,
    par: item.tees?.white?.par || item.tees?.championship?.par || existing.par || 72,
    total_yards: item.tees?.championship?.total_yards || item.tees?.white?.total_yards || existing.total_yards || 7000,
    elevation_m: item.elevation_m !== undefined ? item.elevation_m : existing.elevation_m || 45,
    location: item.location || existing.location,
    tees: item.tees || existing.tees || {},
    prevailing_winds: {
      primary_cardinal: item.environmental_constants?.prevailing_wind_vectors?.[0] || existing.prevailing_winds?.primary_cardinal || "N",
      avg_speed_mph: existing.prevailing_winds?.avg_speed_mph || 14,
      gust_max_mph: existing.prevailing_winds?.gust_max_mph || 28,
    },
    environmental_constants: item.environmental_constants || existing.environmental_constants || {
      base_air_density_delta: "0.0%",
      surface_firmness_rating: "High (Championship Turf)",
      prevailing_wind_vectors: ["Default_Wind"],
    },
    lore: item.signature_hazards || existing.lore || {},
    subagent_directives: item.directives || existing.subagent_directives || {},
    holes: existing.holes || {
      "1": { number: 1, name: "Opening Drive", par: 4, yards: 420, handicap: 7 },
      "18": { number: 18, name: "Clubhouse Finish", par: 4, yards: 465, handicap: 2 },
    },
    hole_count: existing.hole_count || 18,
    hole_registry: item.key_holes || existing.hole_registry || [],
    overpass_query_snippet: overpassQuery.slice(0, 120) + "...",
  };

  db.last_updated = new Date().toISOString();
  db.schema_version = "4.2.0";

  writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`Ingested course '${item.name}' (${courseId}) into Geographic Memory Engine.`);
  return db.courses[courseId];
}

// If executed directly via CLI
if (process.argv[1] && process.argv[1].includes('ingest_course_bundle.js')) {
  const manifestPath = process.argv[2] || join(process.cwd(), 'scripts/ingest_spanish_courses.json');
  console.log(`Reading course bundle manifest from: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.forEach(ingestCourseBundle);
  console.log(`SUCCESSFULLY INGESTED ${manifest.length} COURSES!`);
}
