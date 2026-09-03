import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Grant Cover Letters & Master Application Filing Cheat Sheet Engine
 * Generates tailored cover letters for all major grant agencies and exports a master
 * filing cheat sheet directly into C:\Users\David\Desktop\GRANT GEDHI\07_COVER_LETTERS_AND_CHEAT_SHEET.
 */
export class GrantCoverLettersAndCheatSheetEngine {
  constructor() {
    this.desktopTargetSubdir = 'C:\\Users\\David\\Desktop\\GRANT GEDHI\\07_COVER_LETTERS_AND_CHEAT_SHEET';

    this.coverLetters = [
      {
        grantId: 'CH-INNOSUISSE-01',
        agency: 'Innosuisse (Berne / Valais)',
        recipient: 'Innosuisse Innovation Council & HES-SO Valais Academic Committee',
        entity: 'Brehon AI Technologies (Sion, CH)',
        subject: 'Innosuisse Innovation Project Application — WASM Ballistics & POL-002 AST Engine',
        salutation: 'Sehr geehrte Damen und Herren / Chers Membres du Conseil d\'Innovation,',
        keyPoints: ['CHF 5.0M Total Budget request for TRL 5->7 de-risking', 'Academic partnership with HES-SO Valais', '150% Valais R&D Super-Deduction (Art. 25a StAF/TRAF)']
      },
      {
        grantId: 'CH-PRO-HELVETIA-01',
        agency: 'Pro Helvetia (Swiss Arts Council)',
        recipient: 'Pro Helvetia Digital Creation & Interactive Media Jury',
        entity: 'Brehon AI Technologies (Sion, CH)',
        subject: 'Application: Sur les Pas de Lee Side — De l\'Atlantique aux Bisses du Valais',
        salutation: 'Chers Membres du Jury Pro Helvetia,',
        keyPoints: ['CHF 50,000 grant request matched with CHF 45,000 regional/internal equity', 'Zero-4G/5G offline PWA caching protocol on Bisse du Ro trail', 'PER Cycles 2 & 3 Valais pedagogical mediation booklet']
      },
      {
        grantId: 'CH-LOTERIE-ROMANDE-01',
        agency: 'Loterie Romande (Valais Delegation)',
        recipient: 'Commission consultative de répartition, Secrétariat cantonal, Sion',
        entity: 'Brehon AI Technologies (Sion, CH)',
        subject: 'Demande de contribution financière — Domaine Culture & Patrimoine',
        salutation: 'Madame la Présidente, Monsieur le Président, Mesdames et Messieurs les Membres,',
        keyPoints: ['CHF 25,000 request for Bisse du Ro heritage audio trail', 'Signed formal submission letter with 7 mandatory annexes', 'Free public access for Valais school classes']
      },
      {
        grantId: 'IE-EIC-ACCELERATOR-01',
        agency: 'European Innovation Council (EIC)',
        recipient: 'EIC Accelerator Evaluation Jury & EASME Operations',
        entity: 'Brehon AI Solutions Limited (Dublin/Kinsale, IE - CRO 790337)',
        subject: 'EIC Accelerator Full Application Submission — €2.5M Grant / €15M Equity',
        salutation: 'Dear EIC Evaluation Jury,',
        keyPoints: ['POL-002 EU MDR Annex VIII Rule 11 Exemption Firewall', '5-Year Scale-Up ARR to €36.2M with 115 FTEs', 'Patent Family PCT/IE2025/050001 (WO 2026/150385)']
      },
      {
        grantId: 'UK-INNOVATE-SMART-01',
        agency: 'Innovate UK (IFS)',
        recipient: 'Innovate UK Smart Grant Assessment Panel',
        entity: 'Brehon AI Recruitment / BAIR OS (Belfast HQ / St Andrews, UK)',
        subject: 'Innovate UK Smart Grant Submission — Talent Acquisition OS for PGA Pros & CSV Engineers',
        salutation: 'Dear Assessment Panel,',
        keyPoints: ['£2.5M R&D grant request', 'Strict 10-Question IFS structure (400 words per question)', 'Belfast HQ & St Andrews regional talent OS']
      },
      {
        grantId: 'EU-CREATIVE-EUROPE-01',
        agency: 'EACEA / Creative Europe',
        recipient: 'Creative Innovation Lab (CREA-CROSS-2026-INNOVLAB) Selection Committee',
        entity: 'A.Ward Publications (Cork, IE / UK - Nielsen 978-1-918501)',
        subject: 'CREA-CROSS-2026-INNOVLAB Application — CORKONIAN-LAB',
        salutation: 'Dear EACEA Selection Committee,',
        keyPoints: ['€1.0M EU Grant request (80% co-financing on €1.25M Total)', '94 Person-Months across Ireland, Switzerland, and UK', '5 European Tour Nodes (Cork, Sion, Dublin, St Andrews, Brussels)']
      }
    ];

    this.cheatSheetRules = [
      'RULE 1: Verify Entity Match & Registration (Sion CH for Innosuisse/Pro Helvetia; Dublin/Kinsale IE for EIC; Belfast UK for Innovate UK; HoldCo for Creative Europe).',
      'RULE 2: Enforce Word & Character Limits (Innovate UK 400 words/q; Pro Helvetia 5,000 char concept; EIC Part B 50 pages).',
      'RULE 3: Attach All Mandatory Statutory Annexes (QR-IBAN, Commercial Register Extract, FTO Affidavit, Budget Table).',
      'RULE 4: Apply POL-002 AST Scope Gate (Use A.U. arbitrary strain units; avoid clinical diagnostic terms to bypass MDR Rule 11).',
      'RULE 5: Verify Evaluator Rubric Thresholds (Score >= 85/100 across Excellence, Impact, Implementation).'
    ];
  }

  generateCoverLettersAndCheatSheet() {
    if (!existsSync(this.desktopTargetSubdir)) {
      mkdirSync(this.desktopTargetSubdir, { recursive: true });
    }

    let generatedCount = 0;

    // 1. Export tailored cover letters
    for (const letter of this.coverLetters) {
      const fileName = `COVER_LETTER_${letter.grantId}.md`;
      const filePath = join(this.desktopTargetSubdir, fileName);

      const content = `# 📜 COVER LETTER: ${letter.agency.toUpperCase()}
**Grant Reference:** ${letter.grantId}  
**Applicant Entity:** ${letter.entity}  
**Recipient:** ${letter.recipient}  

---

**SUBJECT:** ${letter.subject}

${letter.salutation}

On behalf of ${letter.entity}, I am pleased to formally submit our application for the **${letter.subject}**.

### Key Strategic & Governance Highlights:
${letter.keyPoints.map(p => `- ${p}`).join('\n')}

We remain at your disposal for any technical or diligence queries.

Sincerely,

*(Signed)*

**David Ward**  
Founder & Managing Director  
Brehon AI Group  
`;

      writeFileSync(filePath, content, 'utf-8');
      generatedCount++;
    }

    // 2. Export Master Filing Cheat Sheet
    const cheatSheetPath = join(this.desktopTargetSubdir, 'MASTER_GRANT_APPLICATION_FILING_CHEAT_SHEET.md');
    const cheatSheetContent = `# 📜 MASTER GRANT APPLICATION FILING CHEAT SHEET

**Executive Reference:** CHEAT-SHEET-2026-GRANT-FILING-01  
**Target Portfolio:** €75,000,000+ Non-Dilutive Grant Pipeline across 4 Corporate Entities  

---

## 🏛️ **MASTER FILING CHEAT SHEET (5 GOLDEN RULES)**

${this.cheatSheetRules.map((r, idx) => `### **${idx + 1}. ${r}**`).join('\n\n')}

---

## 📑 **ENTITY-TO-PORTAL SUBMISSION CHEAT SHEET**

| Entity | Target Grant | Portal | Mandatory Key Annex |
| --- | --- | --- | --- |
| **BAIT (Sion, CH)** | Innosuisse Innovation | Innoprocess Portal | HES-SO Valais Academic MoU |
| **BAIT (Sion, CH)** | Pro Helvetia Digital | myprohelvetia.ch | Valais PER Pedagogical Booklet |
| **BAIT (Sion, CH)** | Loterie Romande Valais | Secrétariat Cantonal Sion | Signed Letter + 7 Statutory Annexes |
| **BAIS (Dublin/Kinsale, IE)** | EIC Accelerator | EU Funding & Tenders Portal | Part B Sec 1-3 & FTO Affidavit |
| **BAIR (Belfast, UK)** | Innovate UK Smart | IFS UK Portal | 10-Question IFS Form (400 words/q) |
| **AWP (HoldCo, IE/UK)** | Creative Europe INNOVLAB | EU Funding & Tenders Portal | Nielsen 978-1-918501 Bulkhead |
`;

    writeFileSync(cheatSheetPath, cheatSheetContent, 'utf-8');
    generatedCount++;

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`${generatedCount}:${timestamp}`).digest('hex');

    return {
      status: 'COVER_LETTERS_AND_CHEAT_SHEET_GENERATED',
      targetDirectory: this.desktopTargetSubdir,
      totalFilesGenerated: generatedCount,
      coverLettersCount: this.coverLetters.length,
      hash
    };
  }
}
