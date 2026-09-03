import os

findings = [
    {
        "source": "C:\\Users\\David\\Downloads\\kinsale-vs-seahaven-report.md",
        "title": "REPORT FROM THE MESSENGER'S CONSOLE — Sovereign Scriptorium, A.Ward Publications",
        "author": "Adrian Daly (L1 Messenger, PR-002)",
        "gpg_key": "0x80D0ADA1",
        "role": "L1 Messenger, Postman's Social Eye, Sovereign Scribe",
        "signature": "AD DALE (PR-002) — L1 Messenger (GPG Verified: 0x80D0ADA1)",
        "summary": "Formal report authored by Adrian Daly analyzing Kinsale vs Seahaven, GAMP 5 biopharmaceutical validation inversion, 5 Un-Computable Questions, and human GPG veto authority over machine outputs."
    },
    {
        "source": "C:\\Users\\David\\Downloads\\DAVID_OS_OPERATIONAL_UNBLOCKERS_2026-07-29.md",
        "title": "DAVID_OS Five-Phone Pilot Roster & Operational Unblockers",
        "pilot_name": "Adrian Daly",
        "account": "brehonaisolutionsltd@gmail.com",
        "device": "Android (Samsung / Android Pilot Allocation)",
        "summary": "Nominated pilot on the DAVID_OS 5-phone roster alongside David Ward, Mark Ward, David McCarthy, and Anna Ward."
    },
    {
        "source": "C:\\Users\\David\\Downloads\\founder-brief-corkonian.md",
        "title": "DAVID_OS Founder Brief & Workspace Specification",
        "principal_id": "adrian-fcs-001",
        "summary": "Primary Steward / Principal ID adrian-fcs-001 for Corkonian Media Engine under DAVID_OS Embassy Layer."
    },
    {
        "source": "C:\\Users\\David\\Desktop\\NAME_REGISTER.local.json",
        "title": "A.Ward Publications Canonical Name Register",
        "aliases": ["Aidy O'Dalaigh", "Aidy O'Dálaigh", "Aidy Ó Dálaigh", "Adrian O'Dalaigh", "Adrian Ó Dálaigh"],
        "seat": "The Messenger Seat",
        "summary": "Registered under 'The Messenger Seat' in the official Name Guard Privacy Register."
    }
]

print("================================================================================")
print("ADRIAN DALY MASTER ESTATE & DOSSIER RECONSTRUCTION")
print("================================================================================")

for idx, f in enumerate(findings, 1):
    print(f"\n[{idx}] {f['title']}")
    print(f"    Source File:  {f['source']}")
    if 'author' in f: print(f"    Author/Identity: {f['author']}")
    if 'gpg_key' in f: print(f"    GPG Key:      {f['gpg_key']}")
    if 'seat' in f: print(f"    Seat/Alias:   {f['seat']} ({', '.join(f['aliases'])})")
    if 'account' in f: print(f"    Email/Account: {f['account']}")
    print(f"    Summary:      {f['summary']}")

print("\n================================================================================")
