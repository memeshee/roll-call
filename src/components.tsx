/**
 * The pieces every output is made of.
 *
 * One rule decides this file: everything here renders in all four roots. That
 * is why the weave is built from Grid columns with a background colour rather
 * than an Svg — an Email cannot hold an Svg, and the whole point of this kit is
 * that the attendee sees the same badge in every place it appears.
 */
import { Column, Grid, Heading, Row, Span, Text } from "@hyper-elements/react";
import { paper } from "./theme.js";
import { COLS, density, type Inks } from "./weave.js";

const inkOf = (v: Inks): string => {
  switch (v) {
    case 1:
      return paper.ink;
    case 2:
      return paper.blue;
    case 3:
      return paper.red;
    default:
      return "transparent";
  }
};

/**
 * The attendee's weave, at whatever size the destination has room for.
 * `cell` is the height of one row of the grid; the width follows the box.
 */
export function Weave({
  cells,
  cell = 12,
  gap = 3,
}: {
  cells: Inks[];
  cell?: number;
  gap?: number;
}) {
  return (
    <Column style={{ gap: 0 }}>
      <Grid columns={COLS} stackOnMobile={false} style={{ gap, rowGap: gap }}>
        {cells.map((v, i) => (
          // An empty cell is deliberate: the engine writes the height onto the
          // table cell itself, so a bare paper cell keeps its size in email and
          // leaves nothing behind in the plain-text version.
          <Column key={i} style={{ backgroundColor: inkOf(v), height: cell }} />
        ))}
      </Grid>
    </Column>
  );
}

/** The event's name, set the way a print shop would set it: one lockup, the
 *  edition riding with the wordmark instead of floating beside it. */
export function Wordmark({
  size = 20,
  color = paper.ink,
  accent = paper.redInk,
}: {
  size?: number;
  color?: string;
  accent?: string;
}) {
  return (
    <Heading
      level={3}
      style={{
        fontFamily: `"Archivo Black", "Arial Black", sans-serif`,
        fontSize: size,
        letterSpacing: size * 0.09,
        textTransform: "uppercase",
        color,
        lineHeight: 1,
      }}
    >
      Assembly
      <Span style={{ color: accent, fontSize: size * 0.62, letterSpacing: 0 }}>{"\u00A0"}3.0</Span>
    </Heading>
  );
}

/** The rules of the weave, written on the thing itself: the pattern stops
 *  being a texture and becomes a stated system. */
export function WeaveSpec({
  cells,
  size = 10,
  color = paper.muted,
  inkColor = paper.ink,
}: {
  cells: Inks[];
  size?: number;
  color?: string;
  inkColor?: string;
}) {
  return (
    <Row style={{ gap: 0 }}>
      <Column style={{ flex: 1 }}>
        <Stamp size={size} color={color}>
          Weave · 12×5 · mirrored
        </Stamp>
      </Column>
      <Column style={{ width: size * 9 }}>
        <Stamp size={size} color={inkColor} align="right">
          {density(cells)}% inked
        </Stamp>
      </Column>
    </Row>
  );
}

/** The technical line under everything: where and when. */
export function Stamp({
  children,
  size = 10,
  color = paper.muted,
  align = "left",
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <Text
      style={{
        fontFamily: `"Space Mono", "Courier New", monospace`,
        fontSize: size,
        letterSpacing: 1.3,
        textTransform: "uppercase",
        color,
        textAlign: align,
        lineHeight: 1.4,
      }}
    >
      {children}
    </Text>
  );
}

export const EVENT = {
  name: "Assembly",
  edition: "3.0",
  dates: "12–13 March 2027",
  city: "Lisbon",
  venue: "Pavilhão do Mar, Cais do Sodré",
  site: "https://assembly.example",
} as const;
