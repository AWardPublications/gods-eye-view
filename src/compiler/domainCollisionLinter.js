/**
 * AWardPublications Cross-Domain Collision Linter
 * Enforces strict domain isolation and routing boundaries across Corkonian folklore,
 * alpine speedgolf, and legal IP prior to triggering the 7-Step SVG Refinery.
 */

export const DOMAIN_BOUNDARIES = {
  WATER_AND_AQUATIC: {
    canonical_domain: "CorkSwam",
    allowed_owners: ["urn:davincia:identity:organization:brehon_ai"],
    keywords: ["river lee", "corkswam", "swam", "swim", "aquatic", "dock", "channel"]
  },
  FOLKLORE_AND_PLACES: {
    canonical_domain: "Lee Side Legends",
    allowed_owners: ["urn:davincia:identity:organization:brehon_ai"],
    keywords: ["lee side", "shandon", "lough", "blarney", "parish", "cork", "rebel", "bells"]
  },
  DIALECT_AND_VERNACULAR: {
    canonical_domain: "Munster Slang",
    allowed_owners: ["urn:davincia:identity:organization:brehon_ai"],
    keywords: ["slang", "cant", "feck", "cop on", "sound", "lads", "pure", "langers"]
  },
  PARISH_WISDOM: {
    canonical_domain: "Fr Finbarr",
    allowed_owners: ["urn:davincia:identity:organization:brehon_ai"],
    keywords: ["finbarr", "wisdom", "parish", "gaelic", "canon", "proverb"]
  },
  ALPINE_SPEEDGOLF: {
    canonical_domain: "Alex Wenger",
    allowed_owners: ["urn:davincia:identity:organization:swiss_alpine_archive", "urn:davincia:publisher:award_publications"],
    keywords: ["speedgolf", "sion", "valais", "matterhorn", "crans", "swiss", "fairway", "par"]
  }
};

export class DomainCollisionLinter {
  /**
   * Validates product payload for domain integrity and cross-domain keyword collisions
   */
  static lintProductDomain(productPayload) {
    const title = (productPayload.title || productPayload.headline || "").toLowerCase();
    const description = (productPayload.description || productPayload.narrative_text || "").toLowerCase();
    const fullText = `${title} ${description}`;

    const detectedDomains = [];

    for (const [key, boundary] of Object.entries(DOMAIN_BOUNDARIES)) {
      const matchFound = boundary.keywords.some(k => fullText.includes(k.toLowerCase()));
      if (matchFound) {
        detectedDomains.push({ domain_key: key, canonical_name: boundary.canonical_domain });
      }
    }

    // Check for conflicting cross-domain combinations
    const isAlpine = detectedDomains.some(d => d.domain_key === 'ALPINE_SPEEDGOLF');
    const isWater = detectedDomains.some(d => d.domain_key === 'WATER_AND_AQUATIC');
    const isDialect = detectedDomains.some(d => d.domain_key === 'DIALECT_AND_VERNACULAR');

    // Rule: Water/Aquatic assets cannot be assigned to Alpine Speedgolf without explicit hybrid authorization
    if (isAlpine && isWater && !productPayload.allow_hybrid_domain) {
      return {
        compliant: false,
        error: "DOMAIN_COLLISION: Water/Aquatic lore ('CorkSwam') cannot collide with Alpine Speedgolf ('Alex Wenger') without allow_hybrid_domain flag.",
        detected_domains: detectedDomains.map(d => d.canonical_name)
      };
    }

    return {
      compliant: true,
      primary_domain: detectedDomains[0]?.canonical_name || "General Sovereign Mint",
      detected_domains: detectedDomains.map(d => d.canonical_name)
    };
  }
}
