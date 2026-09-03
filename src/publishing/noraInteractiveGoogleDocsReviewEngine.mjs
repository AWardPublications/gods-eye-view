import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NORA Interactive Google Docs Review Engine (CBD CODEX & Botanical Theme Edition)
 * Highlights THE CBD CODEX (Cannabis, Botanical & Science Review / Le Codex du CBD) for Nora's review in Google Drive folder:
 * https://drive.google.com/drive/folders/1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5 (Folder: CBD.Review.Hy5)
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
      {
        id: 0,
        isSpotlight: true,
        titleEn: 'THE CBD CODEX: Cannabis, Botanical & Science Review',
        titleFr: 'LE CODEX DU CBD: Examen du Cannabis, Botanique et Science',
        isbn: '978-1-918501-07-0',
        theme: 'CBD Health Science, Botanical Formulations & Cannabinoid Research',
        driveFolderId: '1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5'
      },
      { id: 1, isSpotlight: false, titleEn: 'The Atlas Golf Code: Aerodynamics, Ballistics & Turf Science', titleFr: 'Le Code Atlas Golf: Aérodynamique, Balistique et Science du Gazon', isbn: '978-1-918501-00-1', theme: 'Sports Science & Ballistics' },
      { id: 2, isSpotlight: false, titleEn: 'Sur les Pas de Lee Side: Alpine-Atlantic Hydrology & Valais Lore', titleFr: 'Sur les Pas de Lee Side: Hydrologie Alpine-Atlantique et Traditions du Valais', isbn: '978-1-918501-01-8', theme: 'Alpine Hydrology & Valais Heritage' },
      { id: 3, isSpotlight: false, titleEn: 'COP ON: The Sovereign Record & Governance Manual', titleFr: 'COP ON: Le Registre Souverain et Manuel de Gouvernance', isbn: '978-1-918501-02-5', theme: 'Sovereignty & Governance Doctrine' },
      { id: 4, isSpotlight: false, titleEn: 'The CEO Cookbook: High-Performance Leadership Protocols', titleFr: 'Le Livre de Cuisine du CEO: Leadership à Haute Performance', isbn: '978-1-918501-03-2', theme: 'Executive Leadership & Execution' },
      { id: 5, isSpotlight: false, titleEn: 'The Corkonian Canon: Multilingual Civic Intelligence', titleFr: 'Le Canon Corkonian: Intelligence Civique Multilingue', isbn: '978-1-918501-04-9', theme: 'Civic Lore & Multilingual Literature' },
      { id: 6, isSpotlight: false, titleEn: 'DaVinciA⁺: Governed Agent Substrates & Human-in-the-Loop AI', titleFr: 'DaVinciA⁺: Substrats d\'Agents et IA à Validation Humaine', isbn: '978-1-918501-05-6', theme: 'AI Safety & Human Authority' },
      { id: 7, isSpotlight: false, titleEn: 'GRANT GEDHI: The Capital Acquisition Operating System', titleFr: 'GRANT GEDHI: Système d\'Exploitation d\'Acquisition de Capital', isbn: '978-1-918501-06-3', theme: 'Venture Capitalization & Grants' }
    ];
  }

  generateInteractiveHtmlDoc(vol) {
    const isCbd = vol.id === 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NORA BOTANICAL REVIEW DOC - ${isCbd ? 'CBD CODEX SPOTLIGHT' : 'VOL ' + vol.id} - ${vol.titleEn}</title>
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
      border: 2px solid ${isCbd ? '#16a34a' : '#bae6fd'};
    }

    /* TOP HEADER: SKY BLUE */
    .sky-header {
      background: linear-gradient(135deg, ${isCbd ? '#15803d' : '#0284c7'} 0%, ${isCbd ? '#22c55e' : '#38bdf8'} 100%);
      color: #ffffff;
      padding: 35px 40px;
      text-align: center;
      position: relative;
    }
    .sky-header::after {
      content: "${isCbd ? '🌿 🌿 THE CBD CODEX REVIEW FOR NORA 🌿 🌿' : '🌸 🌿 🌸 🌿 🌸'}";
      display: block;
      font-size: 14px;
      margin-top: 10px;
      letter-spacing: 4px;
      opacity: 0.95;
      font-weight: bold;
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

    /* HEADINGS: FLOWER PINK / VINE GREEN */
    h2 {
      font-family: 'Playfair Display', serif;
      color: ${isCbd ? '#15803d' : '#db2777'};
      font-size: 20px;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h2::before {
      content: "${isCbd ? '🌿' : '🌸'}";
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
      <h1>${isCbd ? '🌿 THE CBD CODEX' : 'VOLUME ' + vol.id + ': ' + vol.titleEn}</h1>
      <div class="subtitle">${vol.titleFr}</div>
    </div>

    <div class="content-body">
      <div class="meta-card">
        <div class="meta-item"><strong>Author / Auteur:</strong> ${this.author}</div>
        <div class="meta-item"><strong>Reviewer / Relectrice:</strong> <strong>Nora</strong></div>
        <div class="meta-item"><strong>ISBN:</strong> ${vol.isbn}</div>
        <div class="meta-item"><strong>Google Drive Vault:</strong> <code>1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</code></div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>1. Overall CBD Codex Rating (1 - 10) / Note du Codex du CBD</h2>
        <p style="font-size: 13px; color: #475569;">Nora, give your overall scientific & narrative rating on the CBD Codex / Donnez votre note et vos impressions sur le Codex du CBD :</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type your rating & thoughts on The CBD Codex / Cliquez ici pour vos remarques ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>2. Botanical Formulations & Chapter Review / Examen des Formulations Botaniques</h2>
        <p style="font-size: 13px; color: #475569;">Which botanical sections or CBD formulations stood out to you? / Quelles formulations botaniques du CBD vous ont marquée ?</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type notes on CBD formulations & chapters / Cliquez ici pour vos conseils sur le CBD ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>3. Editorial Polish & Health Science Clarity / Clarté Scientifique et Éditoriale</h2>
        <p style="font-size: 13px; color: #475569;">Where can we deepen the health science and readability for Nora's audience? / Des améliorations à apporter ?</p>
        <div class="fill-box-vine" contenteditable="true">[ Click to type editorial notes for The CBD Codex / Cliquez ici pour vos réflexions ]</div>
      </div>

      <div class="section-box">
        <span class="bilingual-pill">English & Français</span>
        <h2>4. Final Guidance & Sign-Off for The CBD Codex / Recommandation Finale pour le Codex du CBD</h2>
        <div class="fill-box-vine" contenteditable="true">[ Final opinion and sign-off by Nora for The CBD Codex / Avis final et signature de Nora ]</div>
      </div>
    </div>

    <div class="earth-footer">
      <strong>A.Ward Publications Master Review Vault</strong> · Grounded in Earth & Bound for Sky<br>
      Synced for Dedicated Google Drive Folder ID: <code>1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</code>
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
      const prefix = vol.id === 0 ? 'SPOTLIGHT_CBD_CODEX' : `VOL_${vol.id}`;
      const filename = `${prefix}_NORA_REVIEW_DOC_${vol.titleEn.split(':')[0].replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.html`;

      const path1 = join(this.desktopExportDir, filename);
      const path2 = join(this.grantGedhiExportDir, filename);

      writeFileSync(path1, htmlContent, 'utf-8');
      writeFileSync(path2, htmlContent, 'utf-8');

      generatedFiles.push(path1);
    }

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`NORA_CBD_CODEX:${generatedFiles.length}:${timestamp}`).digest('hex');

    return {
      status: 'NORA_CBD_CODEX_REVIEW_DOCS_GENERATED_AND_EXPORTED',
      reviewer: this.targetReviewer,
      themeName: this.themeName,
      spotlightCodex: 'THE CBD CODEX: Cannabis, Botanical & Science Review',
      totalDocsGenerated: generatedFiles.length,
      desktopExportDir: this.desktopExportDir,
      grantGedhiExportDir: this.grantGedhiExportDir,
      generatedFiles,
      hash
    };
  }
}
