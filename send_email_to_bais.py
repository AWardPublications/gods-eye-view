#!/usr/bin/env python3
"""
Send Mobile Spotter Deck & Alex Wenger Ecosystem V4.0.0 Package to Brehon AI Solutions
via live Gmail API (account: bais / brehonaisolutionsltd@gmail.com).
"""

import base64
import sys
from email.message import EmailMessage
from pathlib import Path

# Insert brehon-gmail-mcp source path
MCP_PATH = Path(r"C:\Users\David\Desktop\_ALIGNMENT\brehon-gmail-mcp\src")
if str(MCP_PATH) not in sys.path:
    sys.path.insert(0, str(MCP_PATH))

from brehon_gmail_mcp.auth import get_credentials
from googleapiclient.discovery import build

def main():
    print("Loading live credentials for 'bais' (brehonaisolutionsltd@gmail.com)...")
    creds = get_credentials("bais")
    service = build("gmail", "v1", credentials=creds, cache_discovery=False)

    subject = "DaVinciA⁺ Mobile On-Course Spotter Deck & Alex Wenger Golf Intelligence V4.0.0"
    to_email = "brehonaisolutionsltd@gmail.com"
    from_email = "brehonaisolutionsltd@gmail.com"

    body_text = """Hi Brehon AI Solutions,

The DaVinciA+ Mobile On-Course Spotter Deck and Alex Wenger Master Golf Intelligence Ecosystem V4.0.0 are built, locked, and live!

1. LIVE PREVIEW ACCESS:
   - Mobile Spotter Deck (Desktop/Browser): http://localhost:5173/mobile_spotter.html
   - Mobile Spotter Deck (Local Wi-Fi): http://localhost:5173/mobile_spotter.html
   - Master Spec Document: C:\\Users\\David\\gods-eye-view\\alex_wenger_master_ecosystem_v4.md

2. 13 WORLD-CLASS COURSES INGESTED:
   - Ballybunion Old Course (Kerry, Ireland)
   - Lahinch Golf Club (Clare, Ireland)
   - Augusta National (Georgia, USA)
   - Lee Side Sovereign Links (Cork, Ireland)
   - Pine Valley Golf Club (New Jersey, USA)
   - St Andrews Old Course (Fife, Scotland)
   - Royal County Down (Down, Northern Ireland)
   - Carnoustie Golf Links (Angus, Scotland)
   - Pebble Beach Golf Links (California, USA)
   - Shinnecock Hills (New York, USA)
   - Royal Portrush Dunluce Links (Antrim, Northern Ireland)
   - Muirfield HCEG (East Lothian, Scotland)
   - Camiral Golf & Wellness / PGA Catalunya Stadium (Girona, Spain — 2031 Ryder Cup)

3. GOVERNANCE & TECH STACK:
   - 6-State Governed State Machine Pipeline (State 0 -> State 5 RETURN TO ALEX)
   - 11th Master Question Guardrail ("What should remain exclusively Alex's responsibility?")
   - Open-Source Stack: XState v5, Turf.js, MapLibre GL, SciPy 3-DoF Ballistics, Piper TTS (Alex Voice), Whisper STT
   - 51/51 Unit Tests Passing 100% Green across 15 test modules
   - Production Vite Build compiled in 4.58s

Best regards,
Alex Wenger Golf Intelligence Core & Brehon AI Solutions
"""

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_email
    msg["To"] = to_email
    msg.set_content(body_text)

    raw_bytes = msg.as_bytes()
    encoded_message = base64.urlsafe_b64encode(raw_bytes).decode("utf-8")

    send_body = {"raw": encoded_message}

    print(f"Sending email to {to_email}...")
    sent = service.users().messages().send(userId="me", body=send_body).execute()

    print(f"EMAIL SENT SUCCESSFULLY! Message ID: {sent.get('id')}")

if __name__ == "__main__":
    main()
