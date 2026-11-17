/** Attendees: one CSV in, one typed list out. */
import { readFile } from "node:fs/promises";

export type Ticket = "Speaker" | "Crew" | "Full pass" | "Student" | "Press";

export type Attendee = {
  name: string;
  email: string;
  role: string;
  org: string;
  ticket: Ticket;
};

/** A small CSV reader: quoted fields, embedded commas, CRLF. Enough for a
 *  registration export, and dependency-free so the repo stays inspectable. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else field += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

export async function loadAttendees(path: string, limit?: number): Promise<Attendee[]> {
  const all = parseCsv(await readFile(path, "utf8"))
    .map((r) => ({
      name: r.name,
      email: r.email,
      role: r.role,
      org: r.org,
      ticket: (r.ticket as Ticket) || "Full pass",
    }))
    .filter((a) => a.name);
  return typeof limit === "number" ? all.slice(0, limit) : all;
}

/** "Ada Lovelace" -> "Ada"; "Grace Brewster Hopper" -> "Grace". The badge
 *  leads with the name called out at the door, which is the first one. */
export function givenName(full: string): string {
  return full.split(/\s+/)[0];
}

export function familyName(full: string): string {
  const parts = full.split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function initials(full: string): string {
  return full
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
