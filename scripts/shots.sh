#!/usr/bin/env bash
# Regenerate the images in docs/ from a fresh run.
#
#   npm run shots
#
# Needs google-chrome (or chromium) and poppler's pdftoppm for the sheet. The
# story cards and the PDFs come straight out of the run itself.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME=${CHROME:-google-chrome}
mkdir -p docs/clients shots/gif

echo "→ rendering the full run"
npx tsx scripts/make.tsx

echo "→ client previews"
npx tsx scripts/clients.tsx

shot() { # path width,height out
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size="$2" --screenshot="$3" "file://$PWD/$1" >/dev/null 2>&1
}

shot dist/email/mira-bennani.html 900,760 docs/email.png
shot dist/pages/mira-bennani.html 900,780 docs/badge-page.png
shot dist/wall.html 1400,5400 docs/wall.png
cp dist/cards/mira-bennani.png docs/card.png
pdftoppm -png -r 150 -f 1 -l 1 dist/sheets/sheet-01.pdf docs/sheet
mv docs/sheet-1.png docs/sheet.png

# The client previews are taller than a screenshot of the frame, so shoot them
# at a size that shows the whole email.
for c in outlook gmail; do shot "dist/clients/$c.html" 1690,2100 "docs/clients/$c.png"; done
shot dist/clients/apple-mail.html 860,1700 docs/clients/apple-mail.png

echo "→ the weave gif"
python3 - <<'PY'
import json, shutil, os
man = json.load(open('dist/manifest.json'))
pick = [man[i] for i in (0, 7, 19, 33, 58, 74, 96, 121, 148, 172, 199, 233)]
for i, p in enumerate(pick):
    shutil.copyfile('dist/' + p['files']['card'], f'shots/gif/{i:02d}.png')
PY
ffmpeg -y -loglevel error -framerate 1/2 -i shots/gif/%02d.png \
  -vf "scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 docs/weave.gif

echo "→ examples for reviewers who would rather not run anything"
mkdir -p examples
cp docs/card.png examples/card-mira-bennani.png
cp dist/pages/mira-bennani.html examples/badge-page-mira-bennani.html
cp dist/email/mira-bennani.html examples/welcome-email-mira-bennani.html
cp dist/email/mira-bennani.txt examples/welcome-email-mira-bennani.txt
cp dist/sheets/sheet-01.pdf examples/sheet-01.pdf
cp dist/checks.json examples/checks.json
cp dist/manifest.json examples/manifest.json
echo "done"
