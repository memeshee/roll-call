/**
 * The corrections round.
 *
 *   npx tsx scripts/corrections.tsx
 *
 * Every badge run has a corrections pass after the first proof: someone's name is
 * spelled wrong, someone switches to a speaker ticket, someone drops out. That is
 * not a re-run — 240 badges were already printed, and reprinting the lot wastes a
 * stack of card stock. This renders only what changed, plus the one sheet each
 * changed badge sits on, and prints a diff of what it touched.
 *
 * Edit `corrections.json` to try your own:
 *
 *   [{ "from": "Grace Vermeulen", "to": "Grace Vermeulen-Bell", "reason": "name" },
 *    { "to": "Ada Lovelace", "role": "Keynote", "org": "Analytical Engines", "reason": "added" }]
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { formatDiagnostics, render, validate } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";

import BadgeEmail from "../src/badge-email.js";
import BadgePage from "../src/badge-page.js";
import { StoryCard } from "../src/card.js";
import { Sheet, PER_SHEET } from "../src/sheet.js";
import { loadAttendees, type Attendee } from "../src/data.js";
import { fontBytes, fontFacesAt } from "../src/fonts.js";
import { code } from "../src/weave.js";

type Correction = { from?: string; to: string; role?: string; org?: string; ticket?: string; reason?: string };

const CSV = "data/assembly-attendees.csv";
const OUT = "dist";

const slug = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const corrections: Correction[] = JSON.parse(await readFile("data/corrections.json", "utf8"));
const roster = await loadAttendees(CSV);
const total = roster.length;
const sheetCount = Math.ceil(total / PER_SHEET);
const faces = fontFacesAt("../fonts/");
const bytes = await fontBytes();

// Apply the corrections to the roster in memory; the CSV on disk is left alone so
// the original order (and every unchanged badge number) is preserved.
const after: Attendee[] = roster.map((a) => ({ ...a }));
const touched: { index: number; before: Attendee | null; after: Attendee }[] = [];

for (const c of corrections) {
  const i = c.from ? after.findIndex((a) => a.name === c.from) : -1;
  const next: Attendee = {
    name: c.to,
    email: after[i]?.email ?? "",
    role: c.role ?? after[i]?.role ?? "Attendee",
    org: c.org ?? after[i]?.org ?? "",
    ticket: (c.ticket as any) ?? after[i]?.ticket ?? "Full pass",
  };
  if (i >= 0) {
    touched.push({ index: i, before: after[i], after: next });
    after[i] = next;
  } else {
    touched.push({ index: after.length, before: null, after: next });
  }
}

const people = after.map((attendee, i) => ({ attendee, serial: i + 1 }));
const sheetOf = (serial: number) => ({
  index: Math.ceil(serial / PER_SHEET),
  of: sheetCount,
  slot: ((serial - 1) % PER_SHEET) + 1,
});

await mkdir(`${OUT}/corrections`, { recursive: true });

// One sample through the gate before anything is written, as in the batch run.
const sample = touched[0];
if (sample) {
  const el = (
    <BadgeEmail attendee={sample.after} serial={sample.index + 1} total={total} sheet={sheetOf(sample.index + 1)} />
  );
  const report = validate(el);
  if (!report.valid) {
    process.stderr.write(`The gate failed on the corrected badge:\n${formatDiagnostics(report.diagnostics)}\n`);
    process.exit(1);
  }
}

console.log(`applying ${touched.length} corrections to ${total} attendees\n`);

for (const { index, before, after: attendee } of touched) {
  const serial = index + 1;
  const sheet = sheetOf(serial);

  const email = await render(
    <BadgeEmail attendee={attendee} serial={serial} total={total} sheet={sheet} />
  );
  await writeFile(`${OUT}/corrections/${slug(attendee.name)}.email.html`, email.html);

  const page = await render(
    <BadgePage attendee={attendee} serial={serial} total={total} fonts={faces} sheet={sheet} />
  );
  await writeFile(`${OUT}/corrections/${slug(attendee.name)}.page.html`, page.html);

  const { image } = await renderImage(<StoryCard attendee={attendee} serial={serial} total={total} />, {
    fonts: bytes as any,
  });
  await writeFile(`${OUT}/corrections/${slug(attendee.name)}.card.png`, image);

  const verb = before ? `${before.name} → ${attendee.name}` : `added ${attendee.name}`;
  console.log(`  No. ${String(serial).padStart(3, "0")}  ${verb}`);
  console.log(`          code ${code(before?.name ?? attendee.name)} → ${code(attendee.name)}, sheet ${sheet.index} slot ${sheet.slot}`);
  if (before && before.name !== attendee.name) {
    const stale = `${OUT}/cards/${slug(before.name)}.png`;
    try {
      await readdir(OUT);
      console.log(`          old card ${basename(stale)} is now stale — delete it or keep it as the audit trail`);
    } catch {}
  }
}

// Only the sheets that hold a corrected badge are reprinted.
const sheetNumbers = [...new Set(touched.map(({ index }) => sheetOf(index + 1).index))].sort((a, b) => a - b);
await mkdir(`${OUT}/corrections/sheets`, { recursive: true });
for (const n of sheetNumbers) {
  const chunk = people.slice((n - 1) * PER_SHEET, n * PER_SHEET);
  const { pdf } = await renderPdf(
    <Sheet people={chunk} sheetIndex={n} sheetCount={sheetCount} total={total} fonts={faces} />,
    { fonts: bytes as any }
  );
  await writeFile(`${OUT}/corrections/sheets/sheet-${String(n).padStart(2, "0")}.pdf`, pdf);
}

console.log(
  `\n${touched.length} badges rebuilt, ${sheetNumbers.length} sheet${sheetNumbers.length === 1 ? "" : "s"} reprinted (${sheetNumbers
    .map((n) => String(n).padStart(2, "0"))
    .join(", ")}) out of ${sheetCount}. Everything else stays as printed.`
);
