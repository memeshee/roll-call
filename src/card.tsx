/**
 * The story card, 1080 × 1350: the thing the attendee actually posts.
 *
 * A different composition from the page and the sheet on purpose — a full-bleed
 * ink band carrying the weave knocked out in paper, the name at 132px, and the
 * attendee's number set as a graphic element. Drawn with Satori and resvg on the
 * server: no browser, no screenshot service, no network, so 240 of them cost 240
 * renders rather than 240 tabs.
 */
import { Canvas, Column, Heading, LineBreak, Row, Span, Text } from "@hyper-elements/react";
import { Stamp, EVENT, Weave, WeaveSpec, Wordmark } from "./components.js";
import { givenName, familyName, type Attendee } from "./data.js";
import { paper } from "./theme.js";
import { code, weave } from "./weave.js";

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
      fonts={fonts}
      lang="en"
      title={`${attendee.name} — ${EVENT.name} ${EVENT.edition}`}
      style={{
        backgroundColor: paper.stock,
        padding: 0,
        justifyContent: "space-between",
        fontFamily: `"Space Mono", monospace`,
      }}
    >
      {/* The band: the weave as a poster, knocked out of the first ink. */}
      <Column style={{ backgroundColor: paper.ink, padding: [46, 56], gap: 18 }}>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Wordmark size={36} color={paper.stock} accent={paper.red} />
          </Column>
          <Column style={{ width: 300 }}>
            <Stamp size={17} color="#B9AE99" align="right">
              No. {no}
            </Stamp>
          </Column>
        </Row>
        <WeaveSpec cells={cells} size={15} color="#B9AE99" inkColor={paper.stock} />
        <Weave cells={cells} cell={31} gap={7} tone="ink" />
      </Column>

      {/* The name, and the number as a graphic. */}
      <Column style={{ padding: [0, 56], gap: 24 }}>
        <Row style={{ gap: 20, alignItems: "end" }}>
          <Column style={{ flex: 1 }}>
            <Heading level={1} style={{ fontSize: 132, lineHeight: 0.82, letterSpacing: -5, color: paper.ink }}>
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
          </Column>
          <Column style={{ width: 200 }}>
            <Text
              style={{
                fontSize: 118,
                lineHeight: 0.76,
                letterSpacing: -6,
                color: paper.redInk,
                textAlign: "right",
              }}
            >
              {String(serial).padStart(3, "0")}
            </Text>
          </Column>
        </Row>
        <Stamp size={21} color={paper.ink}>
          {attendee.role} · {attendee.org}
        </Stamp>
      </Column>

      {/* Three lines and out: no explanatory paragraph — the object is the argument. */}
      <Column style={{ padding: [0, 56, 46], gap: 12 }}>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, color: paper.ink, letterSpacing: 1, lineHeight: 1.35 }}>
              {EVENT.dates} · {EVENT.city}
            </Text>
          </Column>
          <Column style={{ width: 300 }}>
            <Text
              style={{
                fontSize: 30,
                letterSpacing: 7,
                lineHeight: 1.2,
                color: paper.redInk,
                textAlign: "right",
              }}
            >
              {code(attendee.name)}
            </Text>
          </Column>
        </Row>
        <Stamp size={16}>
          {EVENT.name} {EVENT.edition} · {EVENT.site.replace("https://", "")}
        </Stamp>
      </Column>
    </Canvas>
  );
}
