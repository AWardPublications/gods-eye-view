import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NORA SION: Large CBD Codex Master Bilingual Review Portal Engine
 * Generates a 5x expanded, spacious, multi-section interactive HTML review workspace for Nora
 * across both CBD Codex volumes in English and French in Desktop folder `C:\Users\David\Desktop\NORA SION`.
 */
export class NoraSionCbdCodexLargePortalEngine {
  constructor() {
    this.publisher = 'A.Ward Publications (Nielsen Publisher Prefix 978-1-918501)';
    this.targetReviewer = 'Nora';
    this.author = 'David Ward';
    this.desktopTargetDir = 'C:\\Users\\David\\Desktop\\NORA SION';
    this.googleDriveFolderUrl = 'https://drive.google.com/drive/folders/1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5';

    this.cbdBooks = [
      { id: 'CBD-VOL-1', isbn: '978-1-918501-07-0', titleEn: 'The CBD Codex Volume I: Phytocannabinoid Formulations & Health Science', titleFr: 'Le Codex du CBD Volume I: Formulations Phytocannabinoïdes et Science de la Santé' },
      { id: 'CBD-VOL-2', isbn: '978-1-918501-08-7', titleEn: 'The CBD Codex Volume II: Swiss Alpine Extraction & Clinical Therapeutics', titleFr: 'Le Codex du CBD Volume II: Extraction Alpine Suisse et Thérapeutique Clinique' }
    ];
  }

  generateLargePortalHtml() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NORA SION - LARGE CBD CODEX MASTER BILINGUAL REVIEW PORTAL</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');
    
    body {
      font-family: 'Outfit', sans-serif;
      line-height: 1.7;
      color: #0f172a;
      background: linear-gradient(180deg, #e0f2fe 0%, #ffffff 15%, #ffffff 88%, #fef3c7 100%);
      padding: 40px 20px;
      margin: 0;
      min-height: 100vh;
    }

    .master-container {
      max-width: 1100px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(2, 132, 199, 0.12), 0 4px 12px rgba(0,0,0,0.05);
      overflow: hidden;
      border: 3px solid #16a34a;
    }

    /* TOP HEADER: SKY BLUE */
    .sky-header {
      background: linear-gradient(135deg, #0284c7 0%, #15803d 50%, #22c55e 100%);
      color: #ffffff;
      padding: 45px 50px;
      text-align: center;
      position: relative;
    }
    .sky-header::after {
      content: "🌿 🌸 NORA SION · MASTER BILINGUAL EDITORIAL & SCIENTIFIC REVIEW PORTAL 🌸 🌿";
      display: block;
      font-size: 15px;
      margin-top: 15px;
      letter-spacing: 3px;
      font-weight: 700;
      color: #fef3c7;
    }
    .publisher-tag {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-weight: 700;
      color: #e0f2fe;
    }
    .sky-header h1 {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      margin: 12px 0 6px;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .subtitle {
      font-style: italic;
      color: #f0f9ff;
      font-size: 18px;
    }

    .portal-body {
      padding: 50px;
    }

    .meta-banner {
      background: #f0fdf4;
      border-left: 6px solid #16a34a;
      border-radius: 12px;
      padding: 20px 25px;
      margin-bottom: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 15px;
    }
    .meta-item { color: #166534; }
    .meta-item strong { color: #14532d; }

    /* HEADINGS: FLOWER PINK */
    h2 {
      font-family: 'Playfair Display', serif;
      color: #db2777;
      font-size: 22px;
      margin-top: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 2px solid #fbcfe8;
      padding-bottom: 8px;
    }
    h2::before {
      content: "🌸";
      font-size: 20px;
    }

    /* EXPANDED VINE GREEN REVIEW BOXES (5X LARGER) */
    .review-section {
      background: #ffffff;
      border: 2px solid #86efac;
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.05);
    }

    .bilingual-tag {
      display: inline-block;
      background: #fce7f3;
      color: #be185d;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .prompt-desc {
      font-size: 14px;
      color: #475569;
      margin-bottom: 10px;
    }

    .fill-box-large {
      border: 2px dashed #4ade80;
      background-color: #f0fdf4;
      border-radius: 12px;
      padding: 24px;
      min-height: 220px; /* 5x LARGER HEIGHT FOR EXTENSIVE COMMENTS */
      margin-top: 15px;
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      color: #15803d;
      outline: none;
      white-space: pre-wrap;
    }
    .fill-box-large:focus {
      background-color: #ffffff;
      border-color: #16a34a;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15);
    }

    /* FOOTER: EARTH BROWN */
    .earth-footer {
      background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
      color: #fef3c7;
      padding: 35px 50px;
      text-align: center;
      font-size: 14px;
    }
    .earth-footer strong { color: #ffffff; font-size: 16px; }
  </style>
</head>
<body>
  <div class="master-container">
    <div class="sky-header">
      <div class="publisher-tag">${this.publisher}</div>
      <h1>NORA SION: THE CBD CODEX MASTER REVIEW PORTAL</h1>
      <div class="subtitle">Le Codex du CBD: Portail d'Évaluation Éditoriale & Scientifique (Édition Bilingue EN / FR)</div>
    </div>

    <div class="portal-body">
      <div class="meta-banner">
        <div class="meta-item"><strong>Target Reviewer / Relectrice:</strong> <strong>Nora</strong></div>
        <div class="meta-item"><strong>Author / Auteur:</strong> ${this.author}</div>
        <div class="meta-item"><strong>Volume I ISBN:</strong> 978-1-918501-07-0</div>
        <div class="meta-item"><strong>Volume II ISBN:</strong> 978-1-918501-08-7</div>
        <div class="meta-item"><strong>Google Drive Folder ID:</strong> <code>1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</code></div>
        <div class="meta-item"><strong>Desktop Folder:</strong> <code>C:\\Users\\David\\Desktop\\NORA SION</code></div>
      </div>

      <!-- SECTION 1 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>1. Executive Summary & Both Books Overview / Synthèse Exécutive & Examen des Deux Livres</h2>
        <div class="prompt-desc">Nora, please give your high-level overview of Volume I and Volume II together / Nora, donnez votre appréciation globale des deux volumes :</div>
        <div class="fill-box-large" contenteditable="true">[ Click to type extensive executive notes & ratings for Books 1 & 2 / Cliquez ici pour saisir vos commentaires généraux sur les Livres 1 & 2 ]</div>
      </div>

      <!-- SECTION 2 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>2. Phytocannabinoid Science & Terpene Formulations / Science des Phytocannabinoïdes & Terpènes</h2>
        <div class="prompt-desc">Review the scientific accuracy of CBD, CBG, CBN, and terpene profile descriptions / Évaluez la précision scientifique des formulations :</div>
        <div class="fill-box-large" contenteditable="true">[ Type detailed comments on cannabinoid science & formulations / Vos remarques sur la science des cannabinoïdes ]</div>
      </div>

      <!-- SECTION 3 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>3. Swiss Alpine Extraction & Sion Valais Purity Controls / Extraction Alpine Suisse & Contrôle de Pureté (Sion)</h2>
        <div class="prompt-desc">Review the Swiss Valais lab extraction methodologies and purity standards / Évaluez les méthodes d'extraction alpines valaisannes :</div>
        <div class="fill-box-large" contenteditable="true">[ Type comments on Swiss extraction & purity standards / Vos remarques sur l'extraction suisse ]</div>
      </div>

      <!-- SECTION 4 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>4. Clinical & Therapeutic Applications / Applications Cliniques & Thérapeutiques</h2>
        <div class="prompt-desc">Feedback on pain recovery, anti-inflammation, sleep, and well-being protocols / Avis sur les applications thérapeutiques :</div>
        <div class="fill-box-large" contenteditable="true">[ Type comments on clinical & therapeutic applications / Vos commentaires sur les applications cliniques ]</div>
      </div>

      <!-- SECTION 5 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>5. European & Swiss Regulatory Compliance / Conformité Réglementaire Européenne et Suisse</h2>
        <div class="prompt-desc">Review Novel Food compliance, Swiss FADP, Irish HPRA, and legal frameworks / Examen des cadres réglementaires :</div>
        <div class="fill-box-large" contenteditable="true">[ Type regulatory & legal feedback / Vos remarques sur les aspects réglementaires ]</div>
      </div>

      <!-- SECTION 6 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>6. Literary Style, Tone & Reader Engagement / Style Littéraire, Ton & Engagement</h2>
        <div class="prompt-desc">How well does the book balance deep health science with narrative warmth for English & French readers? / Appréciation du style littéraire :</div>
        <div class="fill-box-large" contenteditable="true">[ Type notes on literary style & tone / Vos réflexions sur le style et le ton ]</div>
      </div>

      <!-- SECTION 7 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>7. Chapter-by-Chapter Detailed Feedback Surface / Remarques Détaillées Chapitre par Chapitre</h2>
        <div class="prompt-desc">Use this 5x expanded workspace to leave chapter-specific notes / Espace étendu pour vos notes détaillées par chapitre :</div>
        <div class="fill-box-large" contenteditable="true">[ Type detailed chapter-by-chapter comments here / Saisissez vos notes détaillées chapitre par chapitre ]</div>
      </div>

      <!-- SECTION 8 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>8. Botanical Visuals, Chemical Diagrams & Design / Visuels Botaniques & Schémas Chimiques</h2>
        <div class="prompt-desc">Feedback on chemical structure diagrams, infographics, and book layout / Avis sur la mise en page et les visuels :</div>
        <div class="fill-box-large" contenteditable="true">[ Type notes on visual design & diagrams / Vos remarques sur les schémas et la mise en page ]</div>
      </div>

      <!-- SECTION 9 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>9. Commercial Positioning & Market Readiness / Positionnement Commercial</h2>
        <div class="prompt-desc">Feedback on market positioning, pricing, target readers, and global launch / Avis sur le positionnement commercial :</div>
        <div class="fill-box-large" contenteditable="true">[ Type commercial positioning thoughts / Vos idées sur le positionnement commercial ]</div>
      </div>

      <!-- SECTION 10 -->
      <div class="review-section">
        <span class="bilingual-tag">English & Français</span>
        <h2>10. Final Editorial Sign-Off & Formal Approval / Signature et Approbation Finale de Nora</h2>
        <div class="prompt-desc">Nora's formal approval signature and final publication recommendation / Recommandation finale et signature de Nora :</div>
        <div class="fill-box-large" contenteditable="true">[ Nora's final approval & sign-off statement / Declaration finale et signature de Nora ]</div>
      </div>
    </div>

    <div class="earth-footer">
      <strong>A.Ward Publications · NORA SION Master Review Vault</strong><br>
      Grounded in Earth & Bound for Sky · Dedicated Google Drive Folder ID: <code>1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</code>
    </div>
  </div>
</body>
</html>`;
  }

  buildAndExportLargePortal() {
    if (!existsSync(this.desktopTargetDir)) {
      mkdirSync(this.desktopTargetDir, { recursive: true });
    }

    const htmlContent = this.generateLargePortalHtml();
    const portalFilePath = join(this.desktopTargetDir, 'LARGE_CBD_CODEX_MASTER_BILINGUAL_REVIEW_PORTAL_FOR_NORA.html');

    try {
      writeFileSync(portalFilePath, htmlContent, 'utf-8');
    } catch (e) {
      if (e.code === 'EBUSY') {
        const altPath = join(this.desktopTargetDir, 'LARGE_CBD_CODEX_MASTER_BILINGUAL_REVIEW_PORTAL_FOR_NORA_RUN.html');
        writeFileSync(altPath, htmlContent, 'utf-8');
      } else {
        throw e;
      }
    }

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`NORA_SION_LARGE_PORTAL:${portalFilePath}:${timestamp}`).digest('hex');

    return {
      status: 'NORA_SION_LARGE_CBD_CODEX_PORTAL_BUILT_AND_EXPORTED',
      reviewer: this.targetReviewer,
      desktopTargetDir: this.desktopTargetDir,
      portalFilePath,
      hash
    };
  }
}
