/**
 * The welcome email: 600px, no images, no web fonts.
 *
 * The badge in the email is drawn with the same components as the one on the
 * printed sheet — tables and cells, not a picture. A reader whose client blocks
 * remote images still sees their own weave and their own name, which is the
 * point: this email has nothing to break.
 *
 * Two email rules hold throughout: nothing depends on `justifyContent`
 * (classic Outlook starts every child at the left, and the engine flags it),
 * and every right-hand block has an explicit width.
 */
import { Button, Column, Email, Heading, LineBreak, Row, Section, Span, Text } from "@hyper-elements/react";
import { Stamp, EVENT, Weave, WeaveSpec, Wordmark } from "./components.js";
import { givenName, familyName, type Attendee } from "./data.js";
import { assembly, paper } from "./theme.js";
import { code, density, weave } from "./weave.js";

export default function BadgeEmail({
  attendee,
  serial,
  total,
  sheet,
}: {
  attendee: Attendee;
  serial: number;
  total: number;
  sheet: { index: number; of: number; slot: number };
}) {
  const cells = weave(attendee.name);
  const given = givenName(attendee.name);
  const family = familyName(attendee.name);
  const badge = code(attendee.name);
  const no = `${String(serial).padStart(3, "0")}/${total}`;

  return (
    <Email
      theme={assembly}
      lang="en"
      width={600}
      title={`Your badge · ${EVENT.name} ${EVENT.edition}`}
      previewText={`You're in, ${given}. Your badge is below — and already on sheet ${sheet.index} of ${sheet.of}.`}
      style={{ backgroundColor: paper.stock, gap: 0 }}
    >
      <Section style={{ backgroundColor: paper.ink, padding: [15, 26] }}>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Wordmark size={18} color={paper.stock} accent={paper.red} />
          </Column>
          <Column style={{ width: 150 }}>
            <Stamp size={11} color="#B9AE99" align="right">
              {EVENT.dates}
              <LineBreak />
              {EVENT.city}
            </Stamp>
          </Column>
        </Row>
      </Section>

      <Section style={{ padding: [26, 26, 0] }}>
        <Heading level={2} style={{ fontSize: 30, lineHeight: 1, letterSpacing: -0.6 }}>
          You&apos;re in, {given}.
        </Heading>
        <Text style={{ color: paper.muted }}>
          Badge <Span style={{ color: paper.ink, fontWeight: 700 }}>{no}</Span> is yours, and it is already imposed on
          sheet {sheet.index} of {sheet.of}, slot {sheet.slot}. Nothing else to do: the sheets go to the printer on 5
          March. Show the badge below at the door — from this email, or from your page.
        </Text>
      </Section>

      {/* The badge itself, drawn rather than photographed. */}
      <Section style={{ padding: [16, 26, 0] }}>
        <Column style={{ apply: ["badge"], gap: 11, padding: 20 }}>
          <Row style={{ gap: 0 }}>
            <Column style={{ flex: 1 }}>
              <Wordmark size={13} />
            </Column>
            <Column style={{ width: 92 }}>
              <Stamp size={11} align="right">
                No. {no}
              </Stamp>
            </Column>
          </Row>

          <WeaveSpec cells={cells} size={11} />
          <Weave cells={cells} cell={10} gap={3} />

          <Heading level={1} style={{ fontSize: 40, lineHeight: 0.9, letterSpacing: -1.2 }}>
            {given}
            <LineBreak />
            <Span
              style={{
                fontFamily: `"Instrument Serif", Georgia, serif`,
                fontWeight: 400,
                fontStyle: "italic",
                letterSpacing: -0.5,
              }}
            >
              {family}
            </Span>
          </Heading>

          <Row style={{ gap: 0 }}>
            <Column style={{ flex: 1 }}>
              <Stamp size={11}>{attendee.role}</Stamp>
              <Stamp size={11} color={paper.ink}>
                {attendee.org}
              </Stamp>
            </Column>
            <Column style={{ width: 92 }}>
              <Stamp size={11} color={paper.redInk} align="right">
                {attendee.ticket}
              </Stamp>
            </Column>
          </Row>

          <Text
            style={{
              fontFamily: `"Space Mono", "Courier New", monospace`,
              fontSize: 14,
              letterSpacing: 4,
              color: paper.ink,
              lineHeight: 1,
            }}
          >
            {badge}
          </Text>
        </Column>
      </Section>

      <Section style={{ padding: [20, 26, 0] }}>
        <Text style={{ color: paper.muted, fontSize: 13 }}>
          Your weave is a hash of your name — 12×5 cells, mirrored, {density(cells)}% inked. Nobody else at{" "}
          {EVENT.name} has it, and it is the same on the screen, on paper and in your story card.
        </Text>
      </Section>

      <Section style={{ padding: [20, 26, 24] }}>
        <Button href={`${EVENT.site}/badge/${badge.toLowerCase()}`}>Open your badge page</Button>
      </Section>

      <Section style={{ backgroundColor: paper.ink, padding: [15, 26, 17] }}>
        <Stamp size={11} color="#B9AE99">
          {EVENT.name} {EVENT.edition} · {EVENT.venue} · {EVENT.dates}
          <LineBreak />
          You are receiving this because you registered. Reply to change the name on your badge.
        </Stamp>
      </Section>
    </Email>
  );
}
