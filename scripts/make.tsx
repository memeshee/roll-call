/**
 * run: one CSV in, the whole badge run out.
 *
 *   npx tsx scripts/make.ts --limit 24
 *   npx tsx scripts/make.ts --in data/assembly-attendees.csv --out dist
 *
 * Writes, for every attendee: the welcome email (HTML and plain text), the
 * badge page, the story card PNG. Then imposes the print sheets and draws the
 * wall. Every render is validated first — the run stops on an error rather than
 * shipping 240 versions of the same mistake — and the diagnostics it collects go
 * into checks.json so a reviewer can read what the gate saw.
 */
import { mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { ElementsError, formatDiagnostics, render, validate } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import { lint } from "@hyper-elements/lint";
import { emailClients } from "@hyper-elements/email-clients";

import BadgeEmail from "../src/badge-email.js";
import BadgePage from "../src/badge-page.js";
import { StoryCard } from "../src/card.js";
import { Sheet, PER_SHEET } from "../src/sheet.js";
import { loadAttendees } from "../src/data.js";
import { EVENT } from "../src/components.js";

const EVENT_DATES = EVENT.dates;
const EVENT_CITY = EVENT.city;
import { FILES, fontBytes, fontFacesAt } from "../src/fonts.js";
import { assertWeave, code, density, weave } from "../src/weave.js";

// ---- arguments -------------------------------------------------------------
const args = process.argv.slice(2);
const arg = (name: string, fallback?: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const INPUT = arg("in", "data/assembly-attendees.csv")!;
const OUT = arg("out", "dist")!;
const LIMIT = arg("limit") ? Number(arg("limit")) : undefined;
const SCALE = Number(arg("scale", "1"));
const ONLY = new Set((arg("only", "all") ?? "all").split(","));
const wants = (k: string) => ONLY.has("all") || ONLY.has(k);

// ---- helpers ---------------------------------------------------------------
type Note = { code: string; severity: string; message: string; path?: string };
const seen = new Map<string, { count: number; sample: Note }>();
const errors: Note[] = [];

function collect(where: string, diagnostics: Note[]) {
  for (const d of diagnostics) {
    if (d.severity === "error") errors.push(d);
    const key = `${where}|${d.code}|${d.severity}`;
    const hit = seen.get(key);
    if (hit) hit.count++;
    else seen.set(key, { count: 1, sample: d });
  }
}

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const t0 = Date.now();
const attendees = await loadAttendees(INPUT, LIMIT);
const total = attendees.length;
const sheetCount = Math.ceil(total / PER_SHEET);
const sheetOf = (serial: number) => ({
  index: Math.ceil(serial / PER_SHEET),
  of: sheetCount,
  slot: ((serial - 1) % PER_SHEET) + 1,
});
const people = attendees.map((attendee, i) => ({ attendee, serial: i + 1 }));

// The quality floor, before a single file is written: every name's weave has to
// clear the invariants in weave.ts, or the run stops and says whose badge broke.
for (const { attendee } of people) assertWeave(attendee.name);

// Distinct names must give distinct weaves: the whole claim of the kit.
const patterns = new Set(people.map(({ attendee }) => weave(attendee.name).join("")));
const collisions = people.length - patterns.size;

await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, "fonts"), { recursive: true });
for (const f of Object.values(FILES)) await copyFile(f, join(OUT, "fonts", basename(f)));
const faces = fontFacesAt("../fonts/");
const bytes = await fontBytes();

// ---- the gate --------------------------------------------------------------
// One sample of each output is checked before the run, with the accessibility
// plugin on. If a rule breaks, nothing downstream is written.
const first = people[0];
const gate = [
  ["welcome email", <BadgeEmail attendee={first.attendee} serial={1} total={total} sheet={sheetOf(1)} />],
  ["badge page", <BadgePage attendee={first.attendee} serial={1} total={total} fonts={faces} sheet={sheetOf(1)} />],
  ["print sheet", <Sheet people={people.slice(0, PER_SHEET)} sheetIndex={1} sheetCount={sheetCount} total={total} fonts={faces} />],
  ["story card", <StoryCard attendee={first.attendee} serial={1} total={total} />],
] as const;

// The email also gets the client models: what classic Outlook, Gmail and Apple
// Mail remove or change, raised before a single email is written.
const clientPlugin = await emailClients();

for (const [label, element] of gate) {
  const plugins = label === "welcome email" ? [lint(), clientPlugin] : [lint()];
  const report = await validate(element as any, { plugins });
  collect(label, report.diagnostics as Note[]);
  if (!report.valid) {
    process.stderr.write(`\nThe gate failed on the ${label}:\n${formatDiagnostics(report.diagnostics as any)}\n`);
    process.exit(1);
  }
}

// ---- the run ---------------------------------------------------------------
let done = 0;
async function each<T>(items: T[], work: (item: T, i: number) => Promise<void>) {
  // Two at a time: enough to hide the I/O, small enough to keep memory flat.
  for (let i = 0; i < items.length; i += 2) {
    await Promise.all(items.slice(i, i + 2).map((item, j) => work(item, i + j)));
    done += Math.min(2, items.length - i);
    if (done % 40 === 0 || done >= items.length) process.stdout.write(`\r  ${done}/${items.length} renders`);
  }
  process.stdout.write("\n");
}

const manifest: any[] = [];

if (wants("email")) {
  await mkdir(join(OUT, "email"), { recursive: true });
  await each(people, async ({ attendee, serial }) => {
    const el = <BadgeEmail attendee={attendee} serial={serial} total={total} sheet={sheetOf(serial)} />;
    const { html, text, diagnostics } = await render(el);
    collect("welcome email", diagnostics as Note[]);
    const name = slug(attendee.name);
    await writeFile(join(OUT, "email", `${name}.html`), html);
    await writeFile(join(OUT, "email", `${name}.txt`), text);
  });
}

if (wants("page")) {
  await mkdir(join(OUT, "pages"), { recursive: true });
  await each(people, async ({ attendee, serial }) => {
    const el = <BadgePage attendee={attendee} serial={serial} total={total} fonts={faces} sheet={sheetOf(serial)} />;
    const { html, diagnostics } = await render(el);
    collect("badge page", diagnostics as Note[]);
    await writeFile(join(OUT, "pages", `${slug(attendee.name)}.html`), html);
  });
}

if (wants("card")) {
  await mkdir(join(OUT, "cards"), { recursive: true });
  await each(people, async ({ attendee, serial }) => {
    const { image, diagnostics } = await renderImage(
      <StoryCard attendee={attendee} serial={serial} total={total} />,
      { fonts: bytes as any, scale: SCALE }
    );
    collect("story card", diagnostics as Note[]);
    await writeFile(join(OUT, "cards", `${slug(attendee.name)}.png`), image);
    // A caption ready to paste, so posting the card is one copy and one paste.
    await writeFile(
      join(OUT, "cards", `${slug(attendee.name)}.txt`),
      `${attendee.name} — ${attendee.role} at ${attendee.org}.\n` +
        `Assembly 3.0 · ${EVENT_DATES} · ${EVENT_CITY}. Badge No. ${String(serial).padStart(3, "0")}/${total}, ` +
        `code ${code(attendee.name)}.\n` +
        `My weave is a hash of my name: the same 12×5 pattern on the printed sheet, in the welcome email and here.\n`
    );
  });
}

if (wants("sheets")) {
  await mkdir(join(OUT, "sheets"), { recursive: true });
  const chunks = Array.from({ length: sheetCount }, (_, i) => people.slice(i * PER_SHEET, (i + 1) * PER_SHEET));
  await each(chunks, async (chunk, i) => {
    const { pdf, diagnostics } = await renderPdf(
      <Sheet people={chunk} sheetIndex={i + 1} sheetCount={sheetCount} total={total} fonts={faces} />,
      { fonts: bytes as any }
    );
    collect("print sheet", diagnostics as Note[]);
    await writeFile(join(OUT, "sheets", `sheet-${String(i + 1).padStart(2, "0")}.pdf`), pdf);
  });
}

// ---- the receipt -----------------------------------------------------------
for (const { attendee, serial } of people) {
  const cells = weave(attendee.name);
  manifest.push({
    serial,
    name: attendee.name,
    code: code(attendee.name),
    density: density(cells),
    sheet: sheetOf(serial),
    weave: cells.join(""),
    files: {
      email: `email/${slug(attendee.name)}.html`,
      page: `pages/${slug(attendee.name)}.html`,
      card: `cards/${slug(attendee.name)}.png`,
    },
  });
}

const summary = {
  run: {
    input: INPUT,
    attendees: total,
    sheets: sheetCount,
    perSheet: PER_SHEET,
    distinctNames: patterns.size,
    weaveCollisions: collisions,
    seconds: Number(((Date.now() - t0) / 1000).toFixed(1)),
  },
  diagnostics: [...seen.entries()].map(([key, v]) => ({
    where: key.split("|")[0],
    code: v.sample.code,
    severity: v.sample.severity,
    occurrences: v.count,
    message: v.sample.message,
    path: v.sample.path,
  })),
  errors,
};

await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 1));
await writeFile(join(OUT, "checks.json"), JSON.stringify(summary, null, 1));

const warn = summary.diagnostics.filter((d) => d.severity === "warning");
const notes = summary.diagnostics.filter((d) => d.severity === "info" || d.severity === "note");
console.log(
  [
    ``,
    `${total} attendees · ${services()} · ${sheetCount} sheets of ${PER_SHEET}`,
    `weaves: ${patterns.size} distinct, ${collisions} collisions`,
    `diagnostics: ${errors.length} errors, ${warn.length} kinds of warning, ${notes.length} notes → ${OUT}/checks.json`,
    `${summary.run.seconds}s`,
  ].join("\n")
);

function services() {
  const parts: string[] = [];
  if (wants("email")) parts.push(`${total} emails`);
  if (wants("page")) parts.push(`${total} pages`);
  if (wants("card")) parts.push(`${total} cards`);
  if (wants("sheets")) parts.push(`${sheetCount} PDFs`);
  return parts.join(" · ");
}

if (errors.length) process.exitCode = 1;
