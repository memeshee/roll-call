/**
 * The font files, loaded once.
 *
 * Screen and print outputs get the real files served from the output folder
 * (dist/fonts/), and renderPdf()/renderImage() get the bytes. Archivo Black has
 * one weight, so it is declared at 400 and 700: a Heading asks for bold, and an
 * undeclared weight is a warning in every PDF and image the run writes. An Email can't have either — Gmail strips data: URIs — so emails use
 * the stacks in `theme.ts` and fall back to faces every client already has.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const FONT_DIR = join(here, "..", "fonts");

export const FILES = {
  display: join(FONT_DIR, "ArchivoBlack-Regular.ttf"),
  mono: join(FONT_DIR, "SpaceMono-Regular.ttf"),
  monoBold: join(FONT_DIR, "SpaceMono-Bold.ttf"),
  serif: join(FONT_DIR, "InstrumentSerif-Regular.ttf"),
  serifItalic: join(FONT_DIR, "InstrumentSerif-Italic.ttf"),
} as const;

export type FontBytes = { family: string; src: Uint8Array; weight?: number; style?: "normal" | "italic" }[];

let cache: FontBytes | null = null;

/** Bytes, for renderPdf() and renderImage(). */
export async function fontBytes(): Promise<FontBytes> {
  if (cache) return cache;
  cache = [
    { family: "Archivo Black", src: await readFile(FILES.display), weight: 400 },
    { family: "Archivo Black", src: await readFile(FILES.display), weight: 700 },
    { family: "Space Mono", src: await readFile(FILES.mono), weight: 400 },
    { family: "Space Mono", src: await readFile(FILES.monoBold), weight: 700 },
    { family: "Instrument Serif", src: await readFile(FILES.serif), weight: 400 },
    { family: "Instrument Serif", src: await readFile(FILES.serifItalic), weight: 400, style: "italic" }, 
  ];
  return cache;
}

/** @font-face blocks that point at font files served next to the output —
 *  a Page points at dist/fonts/… so 240 pages don't each carry 200KB of base64. */
export function fontFacesAt(prefix = "../fonts/") {
  return [
    { family: "Archivo Black", src: `${prefix}${basename(FILES.display)}`, format: "truetype" as const, weight: 400 },
    { family: "Archivo Black", src: `${prefix}${basename(FILES.display)}`, format: "truetype" as const, weight: 700 },
    { family: "Space Mono", src: `${prefix}${basename(FILES.mono)}`, format: "truetype" as const, weight: 400 },
    { family: "Space Mono", src: `${prefix}${basename(FILES.monoBold)}`, format: "truetype" as const, weight: 700 },
    { family: "Instrument Serif", src: `${prefix}${basename(FILES.serif)}`, format: "truetype" as const, weight: 400 },
    {
      family: "Instrument Serif",
      src: `${prefix}${basename(FILES.serifItalic)}`,
      format: "truetype" as const,
      weight: 400,
      style: "italic" as const,
    },
  ];
}

/** @font-face blocks with the files inlined, for a document that must travel alone. */
export async function fontFaces() {
  const bytes = await fontBytes();
  return bytes.map((f) => ({
    family: f.family,
    src: `data:font/ttf;base64,${Buffer.from(f.src).toString("base64")}`,
    format: "truetype" as const,
    weight: f.weight,
    style: f.style ?? "normal",
  }));
}
