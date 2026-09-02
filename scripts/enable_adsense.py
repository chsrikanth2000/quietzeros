#!/usr/bin/env python3
"""Flip the site from placeholder ad slots to live AdSense — one command.

Usage:
    python scripts/enable_adsense.py ca-pub-XXXXXXXXXXXXXXXX AD_SLOT_ID

Where AD_SLOT_ID is the numeric "data-ad-slot" of one responsive display
unit created in AdSense (Ads > By ad unit > Display ads). One unit can
serve every slot on the site.

What it does (idempotent — safe to re-run):
  1. ads.txt          — writes the authorized-seller line for your pub ID.
  2. Every *.html     — adds the async AdSense loader to <head>, widens the
                        CSP meta tag to admit Google's ad/consent domains,
                        and replaces each placeholder .ad-slot body with a
                        responsive <ins class="adsbygoogle"> unit.
  3. _headers + staticwebapp.config.json — same CSP change for the hosts.
  4. assets/js/ads.js — external activation script (CSP-clean: the classic
                        inline `adsbygoogle.push` would be blocked).

After running: rebuild nothing, just deploy. Then enable the consent
message in AdSense > Privacy & messaging (required for EEA/UK traffic).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CSP_OLD = ("default-src 'none'; script-src 'self'; style-src 'self'; "
           "img-src 'self' data:; font-src 'self'; base-uri 'none'; form-action 'none'")
CSP_ADS = ("default-src 'none'; "
           "script-src 'self' https://pagead2.googlesyndication.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com https://www.googletagservices.com; "
           "style-src 'self' 'unsafe-inline'; "
           "img-src 'self' data: https:; "
           "font-src 'self'; "
           "connect-src https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://csi.gstatic.com https://fundingchoicesmessages.google.com; "
           "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com https://fundingchoicesmessages.google.com; "
           "base-uri 'none'; form-action 'none'")
CSP_HEADERS_OLD = CSP_OLD + "; frame-ancestors 'none'; upgrade-insecure-requests"
CSP_HEADERS_ADS = CSP_ADS + "; frame-ancestors 'none'; upgrade-insecure-requests"

AD_BODY_RE = re.compile(
    r'(<aside class="ad-slot" aria-label="Advertisement">\s*'
    r'<span class="ad-tag">Advertisement</span>).*?(</aside>)', re.S)

ADS_JS = """/* Activates every AdSense unit on the page. External on purpose:
   the conventional inline push() script would violate our CSP. */
"use strict";
window.adsbygoogle = window.adsbygoogle || [];
for (const ins of document.querySelectorAll("ins.adsbygoogle")) {
  window.adsbygoogle.push({});
}
"""


def main(pub, slot):
    if not re.fullmatch(r"ca-pub-\d{16}", pub):
        sys.exit(f"'{pub}' does not look like a ca-pub-XXXXXXXXXXXXXXXX id")
    if not re.fullmatch(r"\d{6,12}", slot):
        sys.exit(f"'{slot}' does not look like a numeric ad-slot id")

    (ROOT / "ads.txt").write_text(
        f"google.com, {pub[3:]}, DIRECT, f08c47fec0942fa0\n", encoding="utf-8", newline="\n")
    print("ads.txt written")

    loader = (f'<script async src="https://pagead2.googlesyndication.com/pagead/js/'
              f'adsbygoogle.js?client={pub}" crossorigin="anonymous"></script>')

    for f in sorted(ROOT.rglob("*.html")):
        s = f.read_text(encoding="utf-8")
        rel = "../" if f.parent.name == "tools" else ""
        s = s.replace(CSP_OLD, CSP_ADS)
        if loader not in s:
            s = s.replace("</head>", f"  {loader}\n</head>")
        unit = (r'\1' + f'\n      <ins class="adsbygoogle" data-ad-format="auto" '
                f'data-full-width-responsive="true" data-ad-client="{pub}" '
                f'data-ad-slot="{slot}"></ins>\n    ' + r'\2')
        s = AD_BODY_RE.sub(unit, s)
        if f'src="{rel}assets/js/ads.js"' not in s:
            s = s.replace("</body>", f'  <script src="{rel}assets/js/ads.js" defer></script>\n</body>')
        f.write_text(s, encoding="utf-8", newline="\n")
    print("HTML pages updated (CSP, loader, units)")

    h = ROOT / "_headers"
    h.write_text(h.read_text(encoding="utf-8").replace(CSP_HEADERS_OLD, CSP_HEADERS_ADS),
                 encoding="utf-8", newline="\n")
    sw = ROOT / "staticwebapp.config.json"
    cfg = json.loads(sw.read_text(encoding="utf-8"))
    cfg["globalHeaders"]["Content-Security-Policy"] = CSP_HEADERS_ADS
    sw.write_text(json.dumps(cfg, indent=2) + "\n", encoding="utf-8", newline="\n")
    print("_headers + staticwebapp.config.json updated")

    (ROOT / "assets/js/ads.js").write_text(ADS_JS, encoding="utf-8", newline="\n")
    print("assets/js/ads.js written")
    print("\nDone. Deploy, then enable the EEA consent message in AdSense > Privacy & messaging.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
