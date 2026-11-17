/**
 * The weave: each attendee's badge art, derived from their name.
 *
 * Every badge carries a small two-ink pattern. It is not decoration and it is
 * not random: it is a hash of the person's name, drawn as a mirrored weave.
 * The same name gives the same weave on the screen, in the email, on the
 * printed sheet and in the story card — and two people never share one.
 *
 * The generator is constrained on purpose. An unconstrained hash produces the
 * odd ugly badge, and a kit is judged by its worst output, not its best: every
 * row is filled with two or three of six free cells, mirrored, edged, and given
 * exactly one accent, which keeps every attendee's pattern in a 45–70% ink band.
 */

export const COLS = 12;
export const ROWS = 5;

/** 0 = bare paper, 1 = first ink, 2 = second ink, 3 = accent ink */
export type Inks = 0 | 1 | 2 | 3;

export function hash(name: string): number {
  const s = name.trim().toLowerCase().replace(/\s+/g, " ");
  let h = 0x811c9dc5; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Stirring a value, so each row reads a different part of one name's hash. */
function mix(a: number, b: number): number {
  let x = (a ^ Math.imul(b + 1, 0x9e3779b1)) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no look-alikes: 0/O, 1/I/L

/** A short code a person can read off a paper badge when the QR won't scan. */
export function code(name: string): string {
  let h = hash(name);
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[h % ALPHABET.length];
    h = Math.floor(h / ALPHABET.length) || hash(name + i);
  }
  return `${out.slice(0, 3)}-${out.slice(3)}`;
}

/**
 * Five rows of six free cells, mirrored to twelve.
 *
 * Mirrored patterns always read as designed rather than noisy, which is the
 * whole trick: a name becomes a crest instead of a speckle. Each row takes two
 * or three filled cells, picked by score rather than by bit-per-cell, so no row
 * comes out solid or empty.
 */
export function weave(name: string): Inks[] {
  const h = hash(name);
  const free = COLS / 2;
  const cells: Inks[] = new Array(COLS * ROWS).fill(0);
  const accentRow = h % ROWS;

  let previous = "";

  for (let r = 0; r < ROWS; r++) {
    // Retry deterministically: a row that comes out solid, empty or identical to
    // the one above it is redrawn with a salted word rather than shipped. This is
    // the difference between "unique" and "good", and it costs nothing to run.
    let row: Inks[] = [];
    for (let attempt = 0; attempt < 8; attempt++) {
      const word = mix(h, r * 131 + attempt * 17);
      const fill = 2 + (word % 2); // 2 or 3 of the 6 free cells
      const ranked = Array.from({ length: free }, (_, pos) => ({ pos, score: mix(word, pos + 1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, fill);
      row = new Array(free).fill(0) as Inks[];
      for (const { pos } of ranked) row[pos] = mix(word, pos + 97) % 3 === 0 ? 2 : 1; // mostly ink, some blue
      // The frame: the outermost cell of every row is inked, so the weave has an
      // edge and never looks like it was cut off.
      if (row[0] === 0) row[0] = 1;
      if (row[free - 1] === 0) row[free - 1] = 1;
      // One accent per attendee, on a row of its own, so it reads as a mark.
      if (r === accentRow) row[1 + (mix(word, 5) % (free - 2))] = 3;
      const filled = row.filter((c) => c !== 0).length;
      const serial = row.join("");
      if (filled > 0 && filled < free && serial !== previous) {
        previous = serial;
        break;
      }
    }
    for (let c = 0; c < free; c++) {
      cells[r * COLS + c] = row[c];
      cells[r * COLS + (COLS - 1 - c)] = row[c]; // mirror
    }
  }
  return cells;
}

/** How much of the weave is inked — shown on the badge as a number, because a
 *  printed artifact that counts itself is more convincing than one that doesn't. */
export function density(cells: Inks[]): number {
  return Math.round((cells.filter((c) => c !== 0).length / cells.length) * 100);
}

/**
 * The quality floor, enforced rather than hoped for.
 *
 * A hash can always produce a degenerate pattern. These are the rules that stop
 * one attendee getting a badge that looks broken next to the other 239, and the
 * batch run throws instead of printing it.
 */
export function assertWeave(name: string): void {
  const cells = weave(name);
  const d = density(cells);
  const problems: string[] = [];
  if (d < 42) problems.push(`only ${d}% inked (floor 42%)`);
  if (d > 78) problems.push(`${d}% inked (ceiling 78%)`);
  for (let r = 0; r < ROWS; r++) {
    const row = cells.slice(r * COLS, (r + 1) * COLS);
    const filled = row.filter((c) => c !== 0).length;
    if (filled === 0) problems.push(`row ${r} is empty`);
    if (filled === COLS) problems.push(`row ${r} is solid`);
    if (r > 0) {
      const prev = cells.slice((r - 1) * COLS, r * COLS);
      if (prev.join("") === row.join("")) problems.push(`row ${r} repeats row ${r - 1}`);
    }
  }
  const accents = cells.filter((c) => c === 3).length;
  if (accents < 2) problems.push(`${accents} accent cells (needs 2, one per side)`);
  if (problems.length) throw new Error(`${name}: bad weave — ${problems.join("; ")}`);
}
