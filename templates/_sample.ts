/**
 * A fixed sample of the roster, read synchronously so a single template module
 * (and `npx hyper-elements check`) can render without a build step.
 */
import { readFileSync } from "node:fs";
import { parseCsv, type Attendee } from "../src/data.js";
import { fontFacesAt } from "../src/fonts.js";

const rows = parseCsv(readFileSync("data/assembly-attendees.csv", "utf8")).filter((r) => r.name);
export const TOTAL = rows.length;

export function sample(index = 0): Attendee {
  const r = rows[index] ?? rows[0];
  return { name: r.name, email: r.email, role: r.role, org: r.org, ticket: (r.ticket as any) ?? "Full pass" };
}

export const all = (limit = 9) => rows.slice(0, limit).map((r, i) => ({
  attendee: { name: r.name, email: r.email, role: r.role, org: r.org, ticket: (r.ticket as any) ?? "Full pass" },
  serial: i + 1,
}));

export const faces = fontFacesAt("../fonts/");
export const sheets = Math.ceil(TOTAL / 9);
export const sheetOf = (serial: number) => ({
  index: Math.ceil(serial / 9),
  of: sheets,
  slot: ((serial - 1) % 9) + 1,
});
