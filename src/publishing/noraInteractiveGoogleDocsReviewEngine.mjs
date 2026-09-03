import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * NORA Interactive Google Docs Review Engine (Bilingual EN / FR)
 * Generates personalized, beautifully styled interactive Google Docs review templates
 * for Nora to fill in across David's 7 Flagship Volumes in Google Drive folder:
 * https://drive.google.com/drive/folders/1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5
 */
export class NoraInteractiveGoogleDocsReviewEngine {
  constructor() {
    this.publisher = 'A.Ward Publications (Nielsen Publisher Prefix 978-1-918501)';
    this.targetReviewer = 'Nora';
    this.author = 'David Ward';
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
  <title>NORA BOOK REVIEW DOC - VOL ${vol.id} - ${vol.titleEn}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #111827; background-color: #f9fafb; padding: 40px; max-width: 900px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px double #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
    .publisher { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #1e3a8a; font-weight: bold; }
    h1 { color: #0f172a; font-size: 26px; margin: 10px 0 5px; }
    .subtitle { font-style: italic; color: #475569; font-size: 16px; margin-bottom: 10px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
    .meta-table td { padding: 8px 12px; border: 1px solid #cbd5e1; }
    .meta-label { font-weight: bold; background-color: #e2e8f0; width: 30%; }
    .section-box { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h2 { color: #1e3a8a; font-size: 18px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 0; }
    .fill-box { border: 2px dashed #94a3b8; background-color: #f8fafc; border-radius: 6px; padding: 15px; min-height: 80px; margin-top: 10px; font-family: 'Helvetica Neue', sans-serif; font-size: 14px; color: #64748b; }
    .bilingual-tag { font-size: 12px; font-weight: bold; color: #2563eb; text-transform: uppercase; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="publisher">${this.publisher}</div>
    <h1>VOLUME ${vol.id}: ${vol.titleEn}</h1>
    <div class="subtitle">${vol.titleFr}</div>
    <div style="font-size: 13px; color: #64748b;">Nora's Personal Editorial & Review Document · Synced for Google Drive ID: 1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5</div>
  </div>

  <table class="meta-table">
    <tr><td class="meta-label">Author / Auteur</td><td>${this.author}</td></tr>
    <tr><td class="meta-label">Reviewer / Relectrice</td><td><strong>Nora</strong></td></tr>
    <tr><td class="meta-label">ISBN / Identifiant</td><td>${vol.isbn}</td></tr>
    <tr><td class="meta-label">Theme / Thème</td><td>${vol.theme}</td></tr>
  </table>

  <div class="section-box">
    <h2>1. Overall Narrative Resonance & Emotional Rating (1 - 10) / Note d'Évaluation Narrative</h2>
    <div class="bilingual-tag">English & Français</div>
    <p style="font-size: 13px; color: #475569;">Nora, please rate the narrative strength and write your overall impression below / Nora, donnez votre note et vos impressions ci-dessous :</p>
    <div class="fill-box" contenteditable="true">[ Click to type your rating and thoughts here / Cliquez ici pour écrire vos remarques ]</div>
  </div>

  <div class="section-box">
    <h2>2. Favorite Passages & Chapter Highlights / Passages Préférés et Points Forts</h2>
    <div class="bilingual-tag">English & Français</div>
    <p style="font-size: 13px; color: #475569;">Which chapters or ideas resonated most strongly with you? / Quels chapitres ou idées vous ont le plus marquée ?</p>
    <div class="fill-box" contenteditable="true">[ Click to type favorite passages here / Cliquez ici pour noter vos passages préférés ]</div>
  </div>

  <div class="section-box">
    <h2>3. Suggested Revisions or Editorial Polish / Suggestions de Révision et Remarques</h2>
    <div class="bilingual-tag">English & Français</div>
    <p style="font-size: 13px; color: #475569;">Any areas you would streamline, clarify, or expand? / Des passages à clarifier ou développer ?</p>
    <div class="fill-box" contenteditable="true">[ Click to type editorial notes here / Cliquez ici pour vos conseils éditoriaux ]</div>
  </div>

  <div class="section-box">
    <h2>4. Final Guidance & Publication Recommendation / Recommandation Finale pour Publication</h2>
    <div class="bilingual-tag">English & Français</div>
    <div class="fill-box" contenteditable="true">[ Final opinion & sign-off by Nora / Avis final et signature de Nora ]</div>
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
      const filename = `VOL_${vol.id}_NORA_REVIEW_DOC_${vol.titleEn.split(':')[0].replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}.html`;

      const path1 = join(this.desktopExportDir, filename);
      const path2 = join(this.grantGedhiExportDir, filename);

      writeFileSync(path1, htmlContent, 'utf-8');
      writeFileSync(path2, htmlContent, 'utf-8');

      generatedFiles.push(path1);
    }

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`NORA_DOCS:${generatedFiles.length}:${timestamp}`).digest('hex');

    return {
      status: 'NORA_INTERACTIVE_GOOGLE_DOCS_GENERATED_AND_EXPORTED',
      reviewer: this.targetReviewer,
      totalDocsGenerated: generatedFiles.length,
      desktopExportDir: this.desktopExportDir,
      grantGedhiExportDir: this.grantGedhiExportDir,
      generatedFiles,
      hash
    };
  }
}
