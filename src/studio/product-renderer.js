/**
 * AWardPublications Visual Product Layout Renderer (SVG / Vector Engine)
 * Generates print-ready SVG vector layouts and interactive previews for all 4 product formats:
 * 1. Phygital TCG Card (AWP-CRD-001-TCG) - 2.5x3.5" (Poker Standard) with foil accents and QR hash
 * 2. Narrative Storybook (AWP-BOK-001-STORY) - 8.5x11" with Celtic typography and watercolor frame
 * 3. Coloring Book (AWP-BOK-002-COLOR) - 8.5x11" with clean black/white vector outlines
 * 4. Fine Art Poster (AWP-PST-001-ART) - Archival giclée matte with gold DVA seal
 */

export class ProductLayoutRenderer {
  /**
   * Generates SVG string based on compiled product artifact
   */
  static renderSvg(artifact) {
    const format = artifact.product_type || 'tcg_playing_card';
    switch (format) {
      case 'tcg_playing_card':
        return this.renderTcgCardSvg(artifact);
      case 'narrative_storybook':
        return this.renderStorybookSvg(artifact);
      case 'coloring_book':
        return this.renderColoringBookSvg(artifact);
      case 'fine_art_poster':
        return this.renderPosterSvg(artifact);
      default:
        return this.renderTcgCardSvg(artifact);
    }
  }

  static renderTcgCardSvg(artifact) {
    const name = artifact.character_name || artifact.headline || "CorkMan";
    const stats = artifact.stats || { sound: 6, cop_on: 6, neck: 6, rebel: 6 };
    const code = artifact.product_code || "AWP-CRD-001-TCG";
    const seal = artifact.stamps?.visual_overlay?.regulatory_seal || "COP-ON-GENUINE-CARD-v1";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 490" width="100%" height="100%" style="border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <defs>
          <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#161b22"/>
            <stop offset="50%" stop-color="#0d1117"/>
            <stop offset="100%" stop-color="#1f242c"/>
          </linearGradient>
          <linearGradient id="foilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00ffff" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#ff00ff" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#ffff00" stop-opacity="0.8"/>
          </linearGradient>
          <radialGradient id="artGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#d31d36" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Outer Foil Border -->
        <rect x="4" y="4" width="342" height="482" rx="14" fill="none" stroke="url(#foilGrad)" stroke-width="3"/>
        <rect x="8" y="8" width="334" height="474" rx="12" fill="url(#cardBg)"/>

        <!-- Header -->
        <rect x="16" y="16" width="318" height="36" rx="6" fill="#21262d" stroke="#30363d" stroke-width="1"/>
        <text x="26" y="39" fill="#ffffff" font-size="14" font-weight="bold" letter-spacing="0.5">${name}</text>
        <text x="320" y="39" text-anchor="end" fill="#f0883e" font-size="12" font-weight="bold">PWR 24</text>

        <!-- Art Box -->
        <rect x="16" y="60" width="318" height="200" rx="6" fill="#04070a" stroke="#30363d" stroke-width="1"/>
        <circle cx="175" cy="160" r="80" fill="url(#artGlow)"/>
        <text x="175" y="150" text-anchor="middle" fill="#58a6ff" font-size="28">🃏</text>
        <text x="175" y="180" text-anchor="middle" fill="#8b949e" font-size="11" font-style="italic">Alpine Speedgolf Legend</text>

        <!-- Attributes Grid -->
        <g transform="translate(16, 270)">
          <!-- Sound -->
          <rect x="0" y="0" width="75" height="46" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1"/>
          <text x="37" y="18" text-anchor="middle" fill="#8b949e" font-size="9">SOUND</text>
          <text x="37" y="38" text-anchor="middle" fill="#7ee787" font-size="16" font-weight="bold">${stats.sound}</text>

          <!-- Cop On -->
          <rect x="81" y="0" width="75" height="46" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1"/>
          <text x="118" y="18" text-anchor="middle" fill="#8b949e" font-size="9">COP ON</text>
          <text x="118" y="38" text-anchor="middle" fill="#58a6ff" font-size="16" font-weight="bold">${stats.cop_on}</text>

          <!-- Neck -->
          <rect x="162" y="0" width="75" height="46" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1"/>
          <text x="199" y="18" text-anchor="middle" fill="#8b949e" font-size="9">NECK</text>
          <text x="199" y="38" text-anchor="middle" fill="#f0883e" font-size="16" font-weight="bold">${stats.neck}</text>

          <!-- Rebel -->
          <rect x="243" y="0" width="75" height="46" rx="4" fill="#161b22" stroke="#30363d" stroke-width="1"/>
          <text x="280" y="18" text-anchor="middle" fill="#8b949e" font-size="9">REBEL</text>
          <text x="280" y="38" text-anchor="middle" fill="#ff7b72" font-size="16" font-weight="bold">${stats.rebel}</text>
        </g>

        <!-- Ability / Lore Box -->
        <rect x="16" y="326" width="318" height="96" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1"/>
        <text x="26" y="348" fill="#d29922" font-size="10" font-weight="bold">PHYGITAL INVARIANT ABILITY:</text>
        <text x="26" y="368" fill="#c9d1d9" font-size="10">When executed through the DNSL Spine, gains +2</text>
        <text x="26" y="384" fill="#c9d1d9" font-size="10">tempo recovery on any modulated swing event.</text>
        <text x="26" y="408" fill="#8b949e" font-size="9" font-style="italic">"Keep your head down and your cop on."</text>

        <!-- Footer & Seal -->
        <line x1="16" y1="432" x2="334" y2="432" stroke="#30363d" stroke-width="1"/>
        <text x="16" y="448" fill="#8b949e" font-size="8">${code} • 600 DPI POKER</text>
        <text x="16" y="460" fill="#8b949e" font-size="8">AWardPublications Sovereign Mint</text>

        <rect x="220" y="440" width="114" height="24" rx="4" fill="rgba(46, 160, 67, 0.2)" stroke="#2ea043" stroke-width="1"/>
        <text x="277" y="456" text-anchor="middle" fill="#7ee787" font-size="8" font-weight="bold">● ${seal}</text>
      </svg>
    `;
  }

  static renderStorybookSvg(artifact) {
    const title = artifact.headline || "The Chronicles of Tuath";
    const text = artifact.narrative_text || "Across the high alpine ridge, the mist unveiled the legendary swing of Alex Wenger.";
    const code = artifact.product_code || "AWP-BOK-001-STORY";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%" style="font-family: Georgia, serif;">
        <rect x="0" y="0" width="400" height="520" fill="#fcf9f2" stroke="#dcd6c8" stroke-width="2"/>
        <rect x="16" y="16" width="368" height="488" fill="none" stroke="#8a7356" stroke-width="1.5" stroke-dasharray="6,2"/>

        <text x="200" y="60" text-anchor="middle" font-size="18" font-weight="bold" fill="#2d241e" font-family="'Cinzel', serif">${title}</text>
        <line x1="100" y1="75" x2="300" y2="75" stroke="#b39d7b" stroke-width="1.5"/>

        <!-- Watercolor Frame Box -->
        <rect x="40" y="95" width="320" height="180" rx="4" fill="#e8dfce" stroke="#8a7356" stroke-width="1"/>
        <text x="200" y="190" text-anchor="middle" font-size="32" fill="#5a4738">📖</text>
        <text x="200" y="215" text-anchor="middle" font-size="10" fill="#7a6758" font-style="italic">High-Detail Celtic Watercolor Spread</text>

        <!-- Story Text -->
        <text x="50" y="315" font-size="12" fill="#332a24" font-style="italic">
          <tspan x="50" dy="0">${text.substring(0, 48)}</tspan>
          <tspan x="50" dy="20">${text.substring(48, 96)}</tspan>
          <tspan x="50" dy="20">${text.substring(96, 144)}</tspan>
        </text>

        <!-- Footer -->
        <text x="200" y="470" text-anchor="middle" font-size="9" fill="#8a7356">~ 8.5 x 11" Editorial Spread • 0.125in Bleed ~</text>
        <text x="200" y="485" text-anchor="middle" font-size="8" fill="#a8957e">${code} • AWardPublications</text>
      </svg>
    `;
  }

  static renderColoringBookSvg(artifact) {
    const title = artifact.headline || "Alpine Speedgolf Coloring Odyssey";
    const code = artifact.product_code || "AWP-BOK-002-COLOR";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%" style="font-family: sans-serif;">
        <rect x="0" y="0" width="400" height="520" fill="#ffffff" stroke="#000000" stroke-width="3"/>
        <rect x="12" y="12" width="376" height="496" fill="none" stroke="#000000" stroke-width="1.5"/>

        <text x="200" y="50" text-anchor="middle" font-size="15" font-weight="900" fill="#000000" letter-spacing="1">${title.toUpperCase()}</text>

        <!-- Coloring Outline Art Shapes -->
        <rect x="40" y="80" width="320" height="340" fill="none" stroke="#000000" stroke-width="2.5"/>
        <path d="M 60 380 L 160 200 L 240 320 L 340 160" fill="none" stroke="#000000" stroke-width="4"/>
        <circle cx="200" cy="180" r="35" fill="none" stroke="#000000" stroke-width="3"/>
        <polygon points="120,380 200,260 280,380" fill="none" stroke="#000000" stroke-width="3"/>

        <!-- Color Me Caption -->
        <text x="200" y="460" text-anchor="middle" font-size="11" font-weight="bold" fill="#000000">PURE BLACK &amp; WHITE OUTLINE • ZERO GRAYSCALE</text>
        <text x="200" y="480" text-anchor="middle" font-size="9" fill="#555555">${code} • Single-Sided Coloring Page</text>
      </svg>
    `;
  }

  static renderPosterSvg(artifact) {
    const title = artifact.headline || "Alpine Speedgolf Master Series";
    const code = artifact.product_code || "AWP-PST-001-ART";

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="100%" height="100%" style="font-family: -apple-system, sans-serif;">
        <rect x="0" y="0" width="400" height="560" fill="#0c0e12" stroke="#d4af37" stroke-width="3"/>
        <rect x="18" y="18" width="364" height="524" fill="none" stroke="#d4af37" stroke-width="1"/>

        <!-- Gold Header -->
        <text x="200" y="60" text-anchor="middle" font-size="14" font-weight="300" fill="#d4af37" letter-spacing="3">LIMITED EDITION ARCHIVAL PRINT</text>
        <text x="200" y="90" text-anchor="middle" font-size="18" font-weight="bold" fill="#ffffff">${title}</text>

        <!-- Museum Art Mat -->
        <rect x="36" y="115" width="328" height="320" fill="#05070a" stroke="#222834" stroke-width="2"/>
        <text x="200" y="270" text-anchor="middle" font-size="42" fill="#58a6ff">🏔️</text>
        <text x="200" y="310" text-anchor="middle" font-size="11" fill="#8b949e">24 x 36" Archival Museum Giclée</text>

        <!-- Gold Regulatory Seal -->
        <circle cx="200" cy="480" r="24" fill="none" stroke="#d4af37" stroke-width="2"/>
        <text x="200" y="484" text-anchor="middle" font-size="8" font-weight="bold" fill="#d4af37">DVA</text>
        <text x="200" y="520" text-anchor="middle" font-size="8" fill="#8b949e">${code} • Swiss Alpine Archive</text>
      </svg>
    `;
  }
}
