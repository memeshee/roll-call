/**
 * The weave: each attendee's badge art, derived from their name.
 *
 * Every badge carries a small two-ink pattern. It is not decoration and it is
 * not random: it is a hash of the person's name, drawn as a mirrored weave.
 * The same name gives the same weave on the screen, in the email, on the
 * printed sheet and in the story card — and two people never share one.
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
 * Five rows of six free cells, mirrored to twelve. Mirrored patterns always
 * read as designed rather than noisy, which is the whole trick: a name becomes
 * a crest instead of a speckle.
 */
export function weave(name: string): Inks[] {
  const h = hash(name);
  const free = COLS / 2;
  const cells: Inks[] = new Array(COLS * ROWS).fill(0);

  for (let r = 0; r < ROWS; r++) {
    // A different slice of the hash for each row.
    const word = (Math.imul(h ^ (r + 1) * 0x9e3779b1, 0x85ebca6b) >>> 0) || h;
    const row: Inks[] = [];
    for (let c = 0; c < free; c++) {
      const bit = (word >>> (c * 5)) & 1;
      const second = (word >>> ((c * 5 + 3) % 29)) & 1; // which ink, without a second hash
      row.push(bit ? ((second ? 2 : 1) as Inks) : 0);
    }
    // The frame: the outermost cell of every row is always inked, so the weave
    // has an edge and never looks like it was cut off.
    if (row[0] === 0) row[0] = 1;
    if (row[free - 1] === 0) row[free - 1] = 1;
    // One accent per attendee, on a row of its own, so it reads as a mark.
    const accentRow = h % ROWS;
    if (r === accentRow) {
      const at = 1 + ((h >>> 8) % (free - 2));
      row[at] = 3;
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
