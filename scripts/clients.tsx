/**
 * The other half of the proof: what the email looks like in the clients that
 * break emails.
 *
 *   npx tsx scripts/clients.tsx
 *
 * Previews one attendee's welcome email as classic Outlook, Gmail and Apple
 * Mail draw it, writes them to dist/clients/ and prints every check the client
 * models raise. Nothing is sent and nothing is uploaded.
 *
 * The template is passed as a template, not as rendered HTML: the client models
 * are measured on Hyper Elements output, so passing the element is the accurate
 * path (97–99%) rather than the approximate one for hand-written HTML.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { renderInEmailClients } from "@hyper-elements/email-clients";

import BadgeEmail from "../src/badge-email.js";
import { loadAttendees } from "../src/data.js";

const all = await loadAttendees("data/assembly-attendees.csv");
const total = all.length;
const element = <BadgeEmail attendee={all[0]} serial={1} total={total} sheet={{ index: 1, of: Math.ceil(total / 9), slot: 1 }} />;

const { previews, diagnostics, skipped } = await renderInEmailClients(element as any, {
  emailClients: ["outlook", "gmail", "apple-mail"],
} as any);

await mkdir("dist/clients", { recursive: true });
for (const preview of previews as any[]) {
  await writeFile(`dist/clients/${preview.filename}`, preview.html);
  console.log(`  wrote dist/clients/${preview.filename}`);
}

const byCode = new Map<string, { severity: string; count: number; message: string }>();
for (const d of diagnostics as any[]) {
  const hit = byCode.get(d.code);
  if (hit) hit.count++;
  else byCode.set(d.code, { severity: d.severity, count: 1, message: d.message });
}
console.log(`\n${previews.length} client previews, ${skipped?.length ?? 0} skipped`);
for (const [code, v] of byCode) console.log(`  [${v.severity}] ${code} x${v.count} — ${v.message.slice(0, 130)}`);
if (!byCode.size) console.log("  no client degradations found");
