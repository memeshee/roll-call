# Working in this repo as an agent

Read this before changing a template, and read
`node_modules/@hyper-elements/react/GUIDE.md` before writing a new one. The
engine ships its own guide and its own diagnostics; they are better than
anything written here.

## The loop

```bash
npm run check      # validate every module in templates/ — exit 1 on an error
npm run make -- --limit 12   # render a small run, then look at dist/
npm run clients    # preview the welcome email in Outlook, Gmail, Apple Mail
```

`npm run check` is the gate. It is cheap, it runs the accessibility plugin and
the email-client models, and it is the only thing that should decide whether a
render is good enough to keep.

## The invariants

These are not style preferences. Each one was a real failure while building
this kit.

1. **Everything a badge is made of must render in an Email.** An `Email` cannot
   hold an `Svg`, so the weave is a `Grid` of `Column`s with a background
   colour — one component tree, four destinations. If you reach for `Svg`, the
   email stops matching the sheet.
2. **No `justifyContent` in email layouts.** Classic Outlook starts every child
   at the left and the engine flags it. Put the right-hand block in a `Column`
   with an explicit `width` and give the left one `flex: 1`.
3. **The weave must stay deterministic.** `weave(name)` is a pure function of
   the name. Never add randomness, a timestamp or an index to it: the whole
   claim of the kit is that one name gives one pattern everywhere, and a
   `--limit` run has to produce byte-identical cards to the full run.
4. **A Document does not flow.** Content taller than its page is cut off with
   `document/overflow`. The sheet is 3×3 on A4 landscape with 8mm gutters and
   room for the footer; if you add a line to a badge, re-run `npm run make` and
   check for overflow rather than assuming it fits.
5. **Fonts: TTF, OTF or WOFF — never WOFF2, never a URL the PDF has to fetch.**
   `renderPdf()` and `renderImage()` take bytes. The Page takes relative URLs
   into `dist/fonts/` so 240 pages don't each carry 200KB of base64.
6. **No glyph the fonts don't have.** `№` rendered as a tofu box in the story
   card. Use `No.` — the engine cannot warn about a missing glyph, because only
   the renderer knows.
7. **Contrast is checked, not eyeballed.** `paper.red` (`#FF4A1C`) is a shape
   colour: it is 2.9:1 on paper and fails body text. Text in the accent uses
   `paper.redInk` (`#BE320F`, 4.9:1). On the dark bands, use `paper.red`.

## Adding a fifth output

Write the template in `src/`, take `{ attendee, serial, total }`, and reuse
`Weave`, `WeaveSpec` and `Wordmark` from `src/components.tsx` so it is the same
badge. Add a module to `templates/` whose default export is a **component** (the
checker skips an element), then wire it into `scripts/make.tsx` behind its own
`--only` flag. Run `npm run check` before you run the full batch.

## Changing the data

`data/assembly-attendees.csv` is a plain registration export:
`name,email,role,org,ticket`. Drop a real one in its place; nothing else has to
change. 240 rows is the demo size, not a limit — the sheet count, the `No.
NNN/total` numbering and the last sheet's short row all follow from the file.
