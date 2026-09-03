import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NORA Interactive Google Docs Review Engine (Natural Botanical Theme)
 * Implements David's poetic nature aesthetic for Nora:
 * - Top Header: Sky Blue (#e0f2fe / #0284c7)
 * - Headings: Flower Blossom Pink (#ec4899 / #db2777)
 * - Text Boxes & Borders: Lush Vine Green (#16a34a / #f0fdf4)
 * - Footer: Earth Ground Brown (#78350f / #fef3c7)
 */
export class NoraInteractiveGoogleDocsReviewEngine {
  constructor() {
    this.publisher = 'A.Ward Publications (Nielsen Publisher Prefix 978-1-918501)';
    this.targetReviewer = 'Nora';
    this.author = 'David Ward';
    this.themeName = 'Natural Botanical (Sky Blue, Flower Pink, Vine Green, Earth Brown)';
    this.desktopExportDir = 'C:\\Users\\David\\Desktop\\NORA_BOOK_REVIEW_COMMUNICATIONS_VAULT\\04_GOOGLE_DRIVE_SYNC_READY';
    this.grantGedhiExportDir = 'C:\\Users\\David\\Desktop\\GRANT GEDHI\\06 Google Docs Export';

    this.volumes = [
      { id: 1, titleEn: 'The Atlas Golf Code: Aerodynamics, Ballistics & Turf Science', titleFr: 'Le Code Atlas Golf: Aérodynamique, Balistique et Science du Gazon', isbn: '978-1-918501-00-1', theme: 'Sports Science & Ballistics' },
      { id: 2, titleEn: 'Sur les Pas de Lee Side: Alpine-Atlantic Hydrology & Valais Lore', titleFr: 'Sur les Pas de Lee Side: Hydrologie Alpine-Atlantique et Traditions du Valais', isbn: '978-1-918501-01-8', theme: 'Alpine Hydrology & Valais Heritage' },
      { id: 3, titleEn: 'COP ON: The Sovereign Record & Governance Manual', titleFr: 'COP ON: Le Registre Souverain et Manuel de Gouvernance', isbn: '978-1-918501-02-5', theme: 'Sovereignty & Governance Doctrine' },
      { id: 4, titleEn: 'The CEO Cookbook: High-Performance Leadership Protocols', titleFr: 'Le Livre de Cuisine du CEO: Leadership à Haute Performance', isbn: '978-1-918501-03-2', theme: 'Executive Leadership & Execution' },
      { id: 5, titleEn: 'The Corkonian Canon: Multilingual Civic Intelligence', titleFr: 'Le Canon Corkonian: Intelligence Civique Multilingue', isbn: '978-1-918501-04-9', theme: 'Civic Lore & Multilingual Literature' },
      { id: 6, titleEn: 'DaVinciA⁺: Governed Agent Substrates & Human-in-the-Loop AI', titleFr: 'DaVinciA⁺: Substrats d\'Agents et IA à Validation Humaine', isbn: '978-1-918501-05-6', theme: 'AI Safety & Human Authority' },
      { id: 7, titleEn: 'GRANT GEDHI: The Capital Acquisition Operating System', titleFr: 'GRANT GEDHI: Système d\'Exploitation d\'Acquisition de Capital', isbn: '978-1-918501-06-3', theme: 'Venture Capitalization & Grants' }
    ];
  }

  generateInteractiveHtmlDoc(vol) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NORA NATURAL BOTANICAL REVIEW DOC - VOL ${vol.id} - ${vol.titleEn}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
    
    body {
      font-family: 'Outfit', sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: linear-gradient(180deg, #e0f2fe 0%, #ffffff 25%, #ffffff 85%, #fef3c7 100%);
      padding: 0;
      margin: 0;
      min-height: 100vh;
    }

    .container {
      max-width: 920px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0,0,0,0.05);
      overflow: hidden;
      border: 1px solid #bae6fd;
    }

    /* TOP HEADER: SKY BLUE */
    .sky-header {
      background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
      color: #ffffff;
      padding: 35px 40px;
      text-align: center;
      position: relative;
    }
    .sky-header::after {
      content: "🌸 🌿 🌸 🌿 🌸";
      display: block;
      font-size: 16px;
      margin-top: 10px;
      letter-spacing: 6px;
      opacity: 0.9;
    }
    .publisher-tag {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 3px;
      font-weight: 700;
      color: #e0f2fe;
    }
    .sky-header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      margin: 10px 0 5px;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .subtitle {
      font-style: italic;
      color: #f0f9ff;
      font-size: 16px;
    }

    .content-body {
      padding: 40px;
    }

    .meta-card {
      background-color: #f0fdf4;
      border-left: 5px solid #16a34a;
      border-radius: 8px;
      padding: 15px 20px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 14px;
    }
    .meta-item { color: #166534; }
    .meta-item strong { color: #14532d; }

    /* HEADINGS: FLOWER PINK */
    h2 {
      font-family: 'Playfair Display', serif;
      color: #db2777;
      font-size: 20px;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h2::before {
      content: "🌸";
      font-size: 18px;
    }

    /* VINE GREEN TEXT BOXES */
    .section-box {
      background: #ffffff;
      border: 2px solid #86efac;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.04);
      transition: border-color 0.2s ease;
    }
    .section-box:hover {
      border-color: #22c55e;
    }

    .bilingual-pill {
      display: inline-block;
      background: #fce7f3;
      color: #be185d;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .fill-box-vine {
      border: 2px dashed #4ade80;
      background-color: #f0fdf4;
      border-radius: 8px;
      padding: 18px;
      min-height: 90px;
      margin-top: 12px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      color: #15803d;
      outline: none;
    }
    .fill-box-vine:focus {
      background-color: #ffffff;
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
    }

    /* FOOTER: EARTH BROWN */
    .earth-footer {
      background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
      color: #fef3c7;
      padding: 25px 40px;
      text-align: center;
      font-size: 13px;
    }
    .earth-footer strong { color: #ffffff; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sky-header">
      <div class="publisher-tag">${this.publisher}</div>
      <h1>VOLUME ${vol.id}: ${vol.titleEn}</h1>
      <div class="subtitle">${vol.titleFr}</div>
    </div>

    <div class="content-body">
      <div class="meta-card">
        <div class="meta-item"><strong>Author / Auteur:</strong> ${this.author}</div>
        <div class="meta-item"><strong>Reviewer / Relectrice:</strong> Nora</div>
        <div class="meta-item"><strong>ISBN:</strong> ${vol.isbn}</div>
        <div class="meta-item"><strong>Theme / Thème:</strong> ${vol.theme}</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>1. Overall Narrative Rating (1 - 10) / Note Narrative Globale</h2>
        <p style="font-size: 13px; color: #475569; margin-bottom: 5px;">Nora, give your emotional rating & general impression / Donnez votre note et vos impressions globales :</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type your rating & thoughts here / Cliquez ici pour écrire vos remarques ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>2. Favorite Passages & Chapter Highlights / Passages Préférés</h2>
        <p style="font-size: 13px; color: #475569; margin-bottom: 5px;">Which moments, stories, or ideas bloomed for you? / Quels passages ou idées vous ont marquée ?</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type favorite moments / Cliquez ici pour vos passages préférés ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>3. Editorial Polish & Suggestions / Remarques et Conseils Éditoriaux</h2>
        <p style="font-size: 13px; color: #475569; margin-bottom: 5px;">Where can we polish or deepen the narrative? / Des passages à clarifier ou approfondir ?</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type editorial notes / Cliquez ici pour vos conseils ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>4. Final Guidance & Sign-Off / Avis Final et Recommandation</h2>
        <div class="fill-box-vine" contenteditable="true">[ Final guidance and publication recommendation by Nora / Avis final et signature de Nora ]</div>
      </div>
    </div>

    <div class="earth-footer">
      <strong>A.Ward Publications Master Review Vault</strong> · Grounded in Earth & Bound for Sky<br>
      Synced for Google Drive Folder ID: <code>1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</code>
    </div>
  </div>
</body>
</html>`;
  }

  generateAllNoraReviewDocs() {
    if (!existsSync(this.desktopExportDir)) {
      mkdirSync(this.desktopExportDir, { recursive: true });
    }
    if (!existsSync(this.grantGedhiExportDir)) {
      mkdirSync(this.grantGedhiExportDir, { recursive: true });
    }

    const generatedFiles = [];

    for (const vol of this.volumes) {
      const htmlContent = this.generateInteractiveHtmlDoc(vol);
      const filename = `VOL_${vol.id}_NORA_BOTANICAL_REVIEW_DOC_${vol.titleEn.split(':')[0].replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.html`;

      const path1 = join(this.desktopExportDir, filename);
      const path2 = join(this.grantGedhiExportDir, filename);

      writeFileSync(path1, htmlContent, 'utf-8');
      writeFileSync(path2, htmlContent, 'utf-8');

      generatedFiles.push(path1);
    }

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`NORA_BOTANICAL_DOCS:${generatedFiles.length}:${timestamp}`).digest('hex');

    return {
      status: 'NORA_NATURAL_BOTANICAL_REVIEW_DOCS_GENERATED_AND_EXPORTED',
      reviewer: this.targetReviewer,
      themeName: this.themeName,
      totalDocsGenerated: generatedFiles.length,
      desktopExportDir: this.desktopExportDir,
      grantGedhiExportDir: this.grantGedhiExportDir,
      generatedFiles,
      hash
    };
  }
}
