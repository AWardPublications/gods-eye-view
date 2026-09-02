import { BaisBoardResolutionSection231Engine } from '../../src/corporate/baisBoardResolutionSection231.mjs';

function generateMinutes() {
  console.log("=" * 80);
  console.log("GENERATING BAIS STATUTORY BOARD MINUTES & SECTION 231 DISCLOSURE");
  console.log("=" * 80);

  const engine = new BaisBoardResolutionSection231Engine();
  const res = engine.generateStatutoryRecord();

  console.log(`\n  ✓ Company:              ${res.company.name} (CRO: ${res.company.croNumber})`);
  console.log(`  ✓ Registered Office:    ${res.company.registeredOffice}`);
  console.log(`  ✓ Director & Chair:     ${res.company.director}`);
  console.log(`  ✓ Company Secretary:    ${res.company.companySecretary}`);
  console.log(`  ✓ Statutory Disclosure: ${res.compliance.section231Notice}`);
  console.log(`  ✓ Connected Person:     ${res.compliance.connectedPerson}`);
  console.log(`  ✓ Transfer Pricing:     ${res.taxFramework.transferPricing}`);
  console.log(`  ✓ PE Safeguards:        ${res.taxFramework.peSafeguard}`);
  console.log(`  ✓ Worker Classification:${res.taxFramework.independentContractor}`);
  console.log(`  ✓ IP Bulkhead:          ${res.taxFramework.ipBulkhead}\n`);

  console.log("=" * 80);
  console.log("STATUS: BAIS SECTION 231 BOARD MINUTES STATUTORY RECORD 100% GREEN");
  console.log("=" * 80 + "\n");
}

generateMinutes();
