#!/usr/bin/env bash
# Regenerate every image in docs/ from scratch.
#
#   npm run shots
#
# Needs google-chrome (or chromium) and poppler's pdftoppm. Order matters: the
# batch run clears dist/, so the client previews and the screenshots come after it.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME=${CHROME:-google-chrome}
mkdir -p docs/clients shots/gif shots/audit shots/fosdem

echo "→ the demo run (240 attendees)"
npx tsx scripts/make.tsx

echo "→ the corrections pass"
npx tsx scripts/corrections.tsx

echo "→ the real roster (FOSDEM 2025 speakers)"
npx tsx scripts/make.tsx --in data/fosdem-2025-speakers.csv --out dist-fosdem

echo "→ email-client previews"
npx tsx scripts/clients.tsx

shot() { # path width,height out
  "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size="$2" --screenshot="$3" "file://$PWD/$1" >/dev/null 2>&1
}

echo "→ pages and sheets"
shot dist/email/grace-vermeulen.html 900,780 docs/email.png
shot dist/pages/grace-vermeulen.html 900,800 docs/badge-page.png
shot dist/clients/outlook.html 1690,2100 docs/clients/outlook.png
shot dist/clients/gmail.html 1690,2100 docs/clients/gmail.png
shot dist/clients/apple-mail.html 860,1700 docs/clients/apple-mail.png
cp dist/cards/grace-vermeulen.png docs/card.png
pdftoppm -png -r 150 -f 1 -l 1 dist/sheets/sheet-01.pdf docs/sheet
mv docs/sheet-1.png docs/sheet.png

echo "→ the four-destination composite (the one image that makes the case)"
pdftoppm -png -r 150 -f 1 -l 1 dist/sheets/sheet-01.pdf shots/sheet150
ffmpeg -y -loglevel error -i shots/sheet150-1.png -vf "crop=502:319:77:63" shots/p-sheet.png
shot dist/email/grace-vermeulen.html 900,780 shots/p-email.png
shot dist/pages/grace-vermeulen.html 900,800 shots/p-page.png
cp dist/cards/grace-vermeulen.png shots/p-card.png
ffmpeg -y -loglevel error -i shots/p-sheet.png -i shots/p-email.png -i shots/p-page.png -i shots/p-card.png \
  -filter_complex "[0]scale=-2:880,pad=iw+40:880:20:0:color=0xEFE7D8[a];[1]scale=-2:880,pad=iw+40:880:20:0:color=0xEFE7D8[b];[2]scale=-2:880,pad=iw+40:880:20:0:color=0xEFE7D8[c];[3]scale=-2:880,pad=iw+40:880:20:0:color=0xEFE7D8[d];[a][b][c][d]hstack=inputs=4" \
  docs/four-destinations.png

echo "→ the redraw proof (same badge, corrected name)"
ffmpeg -y -loglevel error -i dist/cards/grace-vermeulen.png -i dist/corrections/grace-vermeulen-bell.card.png \
  -filter_complex "[0]scale=-2:900,pad=iw+50:900:25:0:color=0xEFE7D8[a];[1]scale=-2:900,pad=iw+50:900:25:0:color=0xEFE7D8[b];[a][b]hstack=inputs=2" \
  docs/redraw.png

echo "→ contact sheets and the gif"
python3 - <<'PY'
import json, shutil, random
man = json.load(open('dist/manifest.json'))
random.seed(7)
for i, p in enumerate(random.sample(man, 24)):
    shutil.copyfile('dist/' + p['files']['card'], f'shots/audit/{i:02d}.png')
for i, p in enumerate([man[j] for j in (0, 7, 19, 33, 58, 74, 96, 121, 148, 172, 199, 233)]):
    shutil.copyfile('dist/' + p['files']['card'], f'shots/gif/{i:02d}.png')
fos = json.load(open('dist-fosdem/manifest.json'))
for i, p in enumerate(fos[:6]):
    shutil.copyfile('dist-fosdem/' + p['files']['card'], f'shots/fosdem/{i:02d}.png')
PY
ffmpeg -y -loglevel error -pattern_type glob -i 'shots/audit/*.png' -filter_complex "scale=300:375,tile=6x4" -frames:v 1 docs/contacts.png
ffmpeg -y -loglevel error -pattern_type glob -i 'shots/fosdem/*.png' -filter_complex "scale=360:450,tile=6x1" -frames:v 1 docs/fosdem-speakers.png
ffmpeg -y -loglevel error -framerate 1/2 -i shots/gif/%02d.png \
  -vf "scale=540:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 docs/weave.gif

echo "→ examples for reviewers who would rather not run anything"
mkdir -p examples
cp docs/card.png examples/card-grace-vermeulen.png
cp dist/pages/grace-vermeulen.html examples/badge-page-grace-vermeulen.html
cp dist/email/grace-vermeulen.html examples/welcome-email-grace-vermeulen.html
cp dist/email/grace-vermeulen.txt examples/welcome-email-grace-vermeulen.txt
cp dist/sheets/sheet-01.pdf examples/sheet-01.pdf
cp dist/checks.json examples/checks.json
cp dist/manifest.json examples/manifest.json
rm -rf examples/corrections && cp -r dist/corrections examples/corrections
echo "done"
