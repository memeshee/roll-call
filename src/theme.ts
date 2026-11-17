/**
 * The brand, written once.
 *
 * Assembly is a two-day gathering. Its identity is a riso print shop: warm
 * paper stock, two inks that never quite line up, technical mono captions and
 * one heavy display face. Every root — Email, Page, Document, Canvas — takes
 * this theme, so all four destinations are the same brand by construction.
 */
import { defineTheme } from "@hyper-elements/react";

export const paper = {
  stock: "#F3EDE2", // the paper
  ink: "#17150F", // the first ink: everything that must be read
  red: "#FF4A1C", // the second ink: the accent, for shapes
  redInk: "#BE320F", // the same ink darkened for text: 4.9:1 on paper, so
  // captions in the accent survive a contrast check instead of flunking one
  blue: "#1F3FA8", // the third ink: the second colour of the weave
  rule: "#C9BFA9", // hairlines on paper
  muted: "#6F6656", // captions
};

/** Email can't load a font file it isn't given a URL for, so it degrades to
 *  the closest faces the clients already ship. The screen and print outputs
 *  get the real files (see `src/fonts.ts`). */
export const displayStack = `"Archivo Black", "Arial Black", "Helvetica Neue", Arial, sans-serif`;
export const monoStack = `"Space Mono", "Courier New", Courier, monospace`;
export const serifStack = `"Instrument Serif", Georgia, "Times New Roman", serif`;

export const assembly = defineTheme({
  colors: {
    background: paper.stock,
    foreground: paper.ink,
    primary: paper.ink,
    primaryForeground: paper.stock,
    muted: paper.muted,
    border: paper.rule,
  },
  fonts: {
    body: monoStack,
    heading: displayStack,
  },
  fontSizes: { body: 13 },
  lineHeights: { body: 1.55 },
  spacing: { unit: 8 },
  elements: {
    Heading: {
      fontFamily: displayStack,
      color: paper.ink,
      by: {
        level: {
          1: { fontSize: 44, lineHeight: 0.94, letterSpacing: -1 },
          2: { fontSize: 26, lineHeight: 1, letterSpacing: -0.4 },
          3: { fontSize: 16, lineHeight: 1.1, letterSpacing: 0 },
        },
      },
    },
    Text: { color: paper.ink },
    Link: { color: paper.blue },
    Divider: { borderTop: { width: 1, style: "solid", color: paper.rule } },
    Button: {
      backgroundColor: paper.ink,
      color: paper.stock,
      fontFamily: monoStack,
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      borderRadius: 0,
      padding: [14, 22],
      hover: { backgroundColor: paper.blue },
    },
  },
  styles: {
    /** A badge card: a box on paper with a hairline around it. */
    badge: {
      backgroundColor: paper.stock,
      border: { width: 1, style: "solid", color: paper.rule },
      padding: 18,
      gap: 10,
    },
    /** The technical caption under everything. */
    stamp: {
      fontFamily: monoStack,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: paper.muted,
    },
  },
});

declare module "@hyper-elements/react" {
  interface Register {
    theme: typeof assembly;
  }
}
