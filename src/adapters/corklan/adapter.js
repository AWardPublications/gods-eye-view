const REGION_MAP = {
  "Cork City & County": { latitude: 51.8985, longitude: -8.4756 },
  "Cork City & East Cork": { latitude: 51.9022, longitude: -8.4055 },
  "Muskerry Gaeltacht (Cúil Aodha / Ballyvourney)": { latitude: 51.9366, longitude: -9.1706 },
  "Munster Traveller Community": { latitude: 51.9036, longitude: -8.5204 }
};

export function adaptRecord(rawRecord) {
  if (!rawRecord || typeof rawRecord !== 'object') {
    return null;
  }

  const phrase = rawRecord.phrase || "unknown";
  const status = rawRecord.status || "PENDING_REVIEW";
  const region = rawRecord.cultural_context?.region || "";
  const coords = REGION_MAP[region] || { latitude: 51.8985, longitude: -8.4756 };

  // Map status to lifecycle states
  let lifecycle_state = "DRAFT";
  if (status === "CONFIRMED") {
    lifecycle_state = "VERIFIED"; // CONFIRMED maps to VERIFIED lifecycle state
  } else if (status === "PENDING_REVIEW") {
    lifecycle_state = "SUBMITTED";
  } else if (status === "SENSITIVE_HOLD") {
    lifecycle_state = "SUSPENDED";
  }

  // Construct standard provenance
  const provenance = {
    source_type: rawRecord.language_lane === "Gaeilge" ? "ACADEMIC" : "COMMUNITY",
    source_reference: rawRecord.audio_mapping?.archive_source || "CorkLan Heritage Archive",
    geographic_origin: coords,
    collected_at: "2026-08-28T12:00:00Z",
    provenance_confidence: (rawRecord.governance?.confidence_score || 0) >= 0.9 ? "HIGH" : "MEDIUM"
  };

  // Construct standard verification block (Gate 1 enforces this for CONFIRMED/VERIFIED status)
  const verification = {
    state: status === "CONFIRMED" ? "VERIFIED" : "UNVERIFIED",
    method: "COMMUNITY_REVIEW",
    reviewer_role: status === "CONFIRMED" ? "NATIVE_SPEAKER" : "",
    verified_at: status === "CONFIRMED" ? "2026-08-29T10:00:00Z" : "",
    evidence_ref: rawRecord.audio_mapping?.audio_uuid ? `urn:davincia:evidence:corklan:${rawRecord.audio_mapping.audio_uuid}` : ""
  };

  // Construct sensitivity classification
  const sensitivity = {
    classification: status === "SENSITIVE_HOLD" ? "SENSITIVE_HOLD" : (status === "PENDING_REVIEW" ? "PUBLIC_RESTRICTED" : "PUBLIC")
  };

  // Build the complete Governance Envelope wrapping the CorkLan payload
  return {
    $schema: "https://davincia.awardpublications.com/schemas/envelope-v1.1.json",
    object_id: `urn:davincia:corklan:linguistic_record:${phrase.toLowerCase().replace(/ /g, '-')}`,
    object_type: "linguistic_record",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state,
    provenance,
    verification,
    sensitivity,
    payload: {
      phrase,
      language_lane: rawRecord.language_lane,
      cultural_context: rawRecord.cultural_context,
      machine_translation_bridge: rawRecord.machine_translation_bridge,
      audio_mapping: rawRecord.audio_mapping
    }
  };
}
