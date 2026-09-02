#!/usr/bin/env python3
"""Stage a deploy copy with cache-busted asset URLs.

Usage: python scripts/stage_deploy.py <staging-dir>

Copies the committed tree (git checkout-index) into <staging-dir>, then stamps
the current git short-sha as ?v= on:
  - every local .css/.js reference in HTML
  - every relative import specifier inside JS modules
Old cached assets become unreachable after each deploy — no stale-JS bugs.
Source files stay clean; only the staged copy is rewritten.
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def main(stage):
    stage = Path(stage)
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir(parents=True)
    subprocess.run(["git", "checkout-index", "-a", f"--prefix={stage.as_posix()}/"],
                   cwd=ROOT, check=True)
    shutil.rmtree(stage / "workers", ignore_errors=True)

    v = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT,
                       capture_output=True, text=True, check=True).stdout.strip()

    n_html = n_js = 0
    for f in stage.rglob("*.html"):
        s = f.read_text(encoding="utf-8")
        s2 = re.sub(r'((?:href|src)=")([^"]+\.(?:css|js))(")',
                    lambda m: m.group(1) + m.group(2) + f"?v={v}" + m.group(3)
                    if not m.group(2).startswith("http") else m.group(0), s)
        if s2 != s:
            f.write_text(s2, encoding="utf-8", newline="\n"); n_html += 1
    for f in (stage / "assets" / "js").rglob("*.js"):
        s = f.read_text(encoding="utf-8")
        s2 = re.sub(r'(from\s+["\'])(\.{1,2}/[^"\']+\.js)(["\'])',
                    rf"\g<1>\g<2>?v={v}\g<3>", s)
        if s2 != s:
            f.write_text(s2, encoding="utf-8", newline="\n"); n_js += 1
    print(f"staged {stage} @ v={v}  (stamped {n_html} html, {n_js} js)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
