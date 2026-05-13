#!/usr/bin/env python3
"""
fix-geneva-cta.py  (v2 — full sweep)
------------------------------------
Sweep naturalisationgeneve.ch HTML files and remove every mention of
"fiches thématiques". Covers 7 distinct patterns found across the
article set:

  1. Top CTA standard          (16 files)
  2. Top CTA OCPM variant      (test-de-naturalisation-geneve)
  3. Bottom CTA standard       (19 files)
  4. Bottom CTA 2026 variant   (entretien-naturalisation-geneve-2026)
  5. <li> bullet items         (decouvrez-la-culture / decouvrez-traditions)
  6. Prose in entretien        (entretien-naturalisation-geneve)
  7. Prose in test page        (test-de-naturalisation-geneve)

Default: dry-run — shows unified diffs, writes nothing.
Pass --apply to write changes.

Usage:
  cd /path/to/naturalisationgeneve.ch
  python3 fix-geneva-cta.py              # dry-run
  python3 fix-geneva-cta.py --apply      # write changes
"""

import argparse
import difflib
import re
import sys
from pathlib import Path

# ---- Replacement patterns (applied in order) -----------------------
REPLACEMENTS = [
    (
        "1. top-cta-standard",
        re.compile(
            r"<p>Accédez à des tests complets, à des fiches thématiques "
            r"et à plus de 800 questions ciblées\.</p>"
        ),
        "<p>Accédez à des tests complets et à plus de 800 questions ciblées.</p>",
    ),
    (
        "2. top-cta-ocpm-variant",
        re.compile(
            r"<p>Accédez à des tests interactifs, fiches thématiques "
            r"et simulations conformes au contenu de l['\u2019]OCPM\.</p>"
        ),
        "<p>Accédez à des tests interactifs et à des simulations conformes au contenu de l'OCPM.</p>",
    ),
    (
        "3. bottom-cta-standard",
        re.compile(
            r"<p>\s*Accédez à la préparation complète\s*[:\u00a0\s]+\s*"
            r"tests cantonaux,\s*fiches thématiques\s+et\s+"
            r"statistiques de progression\.\s*</p>"
        ),
        "<p>Accédez à toute la préparation : simulations d'examen, "
        "questions par thèmes et suivi de votre progression.</p>",
    ),
    (
        "4. bottom-cta-2026-variant",
        re.compile(
            r"<p>Accédez à la préparation complète : tests cantonaux, "
            r"simulations, fiches thématiques et suivi de progression\.</p>"
        ),
        "<p>Accédez à la préparation complète : tests cantonaux, "
        "simulations et suivi de progression.</p>",
    ),
    (
        # Delete the whole <li> line, including indentation + trailing newline.
        "5. list-item-removal",
        re.compile(r"[ \t]*<li>[^<]*fiches\s+thématiques[^<]*</li>\r?\n"),
        "",
    ),
    (
        "6. prose-entretien",
        re.compile(r"questions-types, fiches thématiques et simulations"),
        "questions-types et des simulations",
    ),
    (
        "7. prose-test-page",
        re.compile(r"des fiches thématiques et des quiz"),
        "des quiz",
    ),
]

STRAGGLER = re.compile(r"fiches?\s+thématiques?", re.IGNORECASE)


def process_file(path: Path, apply: bool, counts: dict) -> tuple[bool, bool]:
    """Apply all replacements to one file. Returns (changed, has_straggler)."""
    original = path.read_text(encoding="utf-8")
    new_content = original
    for label, pattern, replacement in REPLACEMENTS:
        new_content, n = pattern.subn(replacement, new_content)
        if n:
            counts[label] = counts.get(label, 0) + n

    changed = new_content != original
    has_straggler = bool(STRAGGLER.search(new_content))

    if changed:
        print(f"\n{'=' * 70}\nFILE: {path}\n{'=' * 70}")
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=str(path),
            tofile=str(path) + " (proposed)",
            n=2,
        )
        sys.stdout.writelines(diff)
        if apply:
            path.write_text(new_content, encoding="utf-8")
            print(f"\n✓ WRITTEN: {path}")

    return changed, has_straggler


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true",
                    help="Write changes (default: dry-run)")
    ap.add_argument("--root", default=".", help="Root directory to scan")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    html_files = sorted(root.rglob("*.html"))

    print(f"Scanning {len(html_files)} HTML files under {root}")
    print(f"Mode: {'APPLY' if args.apply else 'DRY-RUN'}\n")

    changed_count = 0
    straggler_files = []
    pattern_counts = {}

    for f in html_files:
        changed, straggler = process_file(f, args.apply, pattern_counts)
        if changed:
            changed_count += 1
        if straggler:
            straggler_files.append(f)

    print(f"\n{'=' * 70}\nSummary\n{'=' * 70}")
    print(f"  Files {'changed' if args.apply else 'that would change'}: {changed_count}")
    print(f"\n  Per-pattern hit counts (expected in parentheses):")
    expected = {
        "1. top-cta-standard": 16,
        "2. top-cta-ocpm-variant": 1,
        "3. bottom-cta-standard": 19,
        "4. bottom-cta-2026-variant": 1,
        "5. list-item-removal": 2,
        "6. prose-entretien": 1,
        "7. prose-test-page": 1,
    }
    for label, _, _ in REPLACEMENTS:
        got = pattern_counts.get(label, 0)
        exp = expected.get(label, "?")
        flag = " " if got == exp else " ⚠"
        print(f"   {flag} {label:30s} {got}   (expected {exp})")

    if straggler_files:
        print(f"\n  ⚠  {len(straggler_files)} file(s) still mention 'fiches thématiques':")
        for f in straggler_files:
            print(f"     - {f}")
    else:
        print(f"\n  ✓ No remaining 'fiches thématiques' references.")

    if not args.apply and changed_count > 0:
        print(f"\n  Re-run with --apply to write changes.")


if __name__ == "__main__":
    main()
