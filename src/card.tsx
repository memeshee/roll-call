/**
 * The story card, 1080 × 1350: the thing the attendee actually posts.
 *
 * Drawn with Satori and resvg on the server — no browser, no screenshot
 * service, no network — so 240 of them cost 240 renders rather than 240 tabs.
 */
import { Canvas, Column, Heading, LineBreak, Row, Span, Text } from "@hyper-elements/react";
import { Stamp, EVENT, Weave, WeaveSpec, Wordmark } from "./components.js";
import { givenName, familyName, type Attendee } from "./data.js";
import { paper } from "./theme.js";
import { code, density, weave } from "./weave.js";

export function StoryCard({
  attendee,
  serial,
  total,
  fonts,
}: {
  attendee: Attendee;
  serial: number;
  total: number;
  fonts?: any;
}) {
  const cells = weave(attendee.name);
  const no = `${String(serial).padStart(3, "0")}/${total}`;

  return (
    <Canvas
      width={1080}
      height={1350}
      lang="en"
      fonts={fonts}
      title={`${attendee.name} — ${EVENT.name} ${EVENT.edition}`}
      style={{
        backgroundColor: paper.stock,
        padding: 68,
        gap: 34,
        justifyContent: "space-between",
        fontFamily: `"Space Mono", monospace`,
      }}
    >
      <Row style={{ gap: 0 }}>
        <Column style={{ flex: 1 }}>
          <Wordmark size={40} />
        </Column>
        <Column style={{ width: 220 }}>
          <Stamp size={18} align="right">
            Ticket No. {no}
          </Stamp>
        </Column>
      </Row>

      <Column style={{ gap: 44 }}>
        <Column style={{ gap: 12 }}>
          <WeaveSpec cells={cells} size={20} />
          <Weave cells={cells} cell={26} gap={6} />
        </Column>
        <Heading level={1} style={{ fontSize: 126, lineHeight: 0.82, letterSpacing: -5, color: paper.ink }}>
          {givenName(attendee.name)}
          <LineBreak />
          <Span
            style={{
              fontFamily: `"Instrument Serif", Georgia, serif`,
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: -2,
            }}
          >
            {familyName(attendee.name)}
          </Span>
        </Heading>
        <Stamp size={20} color={paper.ink}>
          {attendee.role} · {attendee.org}
        </Stamp>
      </Column>

      <Column style={{ gap: 14 }}>
        <Text style={{ fontSize: 22, color: paper.muted, letterSpacing: 0.5, lineHeight: 1.4 }}>
          {density(cells)}% inked, 12×5, mirrored. My weave, from my name — the same one on my badge, in my inbox and
          on sheet {Math.ceil(serial / 9)} of 27.
        </Text>
        <Row style={{ gap: 0, alignItems: "end" }}>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontSize: 26, color: paper.ink, letterSpacing: 1, lineHeight: 1.3 }}>
              {EVENT.dates}
              <LineBreak />
              {EVENT.city}
            </Text>
          </Column>
          <Column style={{ width: 260 }}>
            <Text
              style={{
                fontSize: 30,
                letterSpacing: 7,
                color: paper.redInk,
                textAlign: "right",
                lineHeight: 1.2,
              }}
            >
              {code(attendee.name)}
            </Text>
          </Column>
        </Row>
      </Column>
    </Canvas>
  );
}
