/**
 * The badge page: what the attendee opens at the door.
 *
 * Phone first — this is read standing in a queue in bad light, so the name is
 * 88px, the number is unmissable and nothing needs a tap. The same components
 * as the email, the sheet and the story card.
 */
import { Column, Divider, Grid, Heading, LineBreak, Page, Row, Section, Span, Text } from "@hyper-elements/react";
import { Stamp, EVENT, Weave, WeaveSpec, Wordmark } from "./components.js";
import { givenName, familyName, type Attendee } from "./data.js";
import { assembly, paper } from "./theme.js";
import { code, density, weave } from "./weave.js";

export default function BadgePage({
  attendee,
  serial,
  total,
  fonts,
  sheet,
}: {
  attendee: Attendee;
  serial: number;
  total: number;
  fonts?: any;
  sheet: { index: number; of: number; slot: number };
}) {
  const cells = weave(attendee.name);
  const given = givenName(attendee.name);
  const family = familyName(attendee.name);
  const badge = code(attendee.name);
  const no = `${String(serial).padStart(3, "0")}/${total}`;

  return (
    <Page
      theme={assembly}
      lang="en"
      fonts={fonts}
      width={680}
      title={`${attendee.name} · ${EVENT.name} ${EVENT.edition}`}
      description={`Badge ${no} for ${EVENT.name} ${EVENT.edition}, ${EVENT.dates}, ${EVENT.city}.`}
      style={{ backgroundColor: paper.stock, gap: 0 }}
    >
      <Section style={{ backgroundColor: paper.ink, padding: [16, 24] }}>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Wordmark size={20} color={paper.stock} accent={paper.red} />
          </Column>
          <Column style={{ width: 190 }}>
            <Stamp size={11} color="#B9AE99" align="right">
              {EVENT.dates}
              <LineBreak />
              {EVENT.city}
            </Stamp>
          </Column>
        </Row>
      </Section>

      <Section style={{ padding: [34, 24, 26] }}>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Stamp size={11}>Ticket No. {no}</Stamp>
          </Column>
          <Column style={{ width: 190 }}>
            <Stamp size={11} align="right" color={paper.redInk}>
              {attendee.ticket}
            </Stamp>
          </Column>
        </Row>
      </Section>

      {/* The weave, at the size a wall poster would set it. */}
      <Section style={{ padding: [0, 24], gap: 10 }}>
        <WeaveSpec cells={cells} size={11} />
        <Weave cells={cells} cell={16} gap={5} />
      </Section>

      <Section style={{ padding: [30, 24, 0] }}>
        <Heading level={1} style={{ fontSize: 78, lineHeight: 0.88, letterSpacing: -2.6 }}>
          {given}
          <LineBreak />
          <Span
            style={{
              fontFamily: `"Instrument Serif", Georgia, serif`,
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: -1.5,
            }}
          >
            {family}
          </Span>
        </Heading>
      </Section>

      <Section style={{ padding: [22, 24, 0] }}>
        <Divider />
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Stamp size={11} color={paper.ink}>
              {attendee.role}
              <LineBreak />
              {attendee.org}
            </Stamp>
          </Column>
          <Column style={{ width: 190 }}>
            <Text
              style={{
                fontFamily: `"Space Mono", "Courier New", monospace`,
                fontSize: 14,
                letterSpacing: 5,
                color: paper.ink,
                textAlign: "right",
                lineHeight: 1.6,
              }}
            >
              {badge}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ padding: [26, 24, 32] }}>
        <Grid columns={2} style={{ gap: 18, rowGap: 18 }}>
          <Column style={{ gap: 4 }}>
            <Stamp size={11}>Where</Stamp>
            <Text style={{ fontSize: 13, lineHeight: 1.5 }}>{EVENT.venue}</Text>
          </Column>
          <Column style={{ gap: 4 }}>
            <Stamp size={11}>Doors</Stamp>
            <Text style={{ fontSize: 13, lineHeight: 1.5 }}>
              08:30 Thursday
              <LineBreak />
              09:00 Friday
            </Text>
          </Column>
          <Column style={{ gap: 4 }}>
            <Stamp size={11}>Show this</Stamp>
            <Text style={{ fontSize: 13, lineHeight: 1.5 }}>
              Screenshot or print — either scans. No signal needed.
            </Text>
          </Column>
          <Column style={{ gap: 4 }}>
            <Stamp size={11}>Your weave</Stamp>
            <Text style={{ fontSize: 13, lineHeight: 1.5 }}>
              {density(cells)}% inked, from your name. Printed on sheet {sheet.index} of {sheet.of}, slot{" "}
              {sheet.slot}.
            </Text>
          </Column>
        </Grid>
      </Section>

      <Section style={{ backgroundColor: paper.ink, padding: [16, 24, 18] }}>
        <Stamp size={11} color="#B9AE99">
          {EVENT.name} {EVENT.edition} · {EVENT.site.replace("https://", "")}
          <LineBreak />
          A badged attendee may bring one guest to the Thursday evening session. Ask at the desk.
        </Stamp>
      </Section>
    </Page>
  );
}
