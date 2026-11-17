/**
 * The wall: every badge in the run, as one page.
 *
 * This is the artifact that makes the mechanic legible in one glance — 240
 * names, 240 weaves, no two alike, all from one CSV.
 */
import { Column, Grid, Heading, LineBreak, Page, Row, Section, Span, Text } from "@hyper-elements/react";
import { Stamp, EVENT, Weave } from "./components.js";
import type { Attendee } from "./data.js";
import { assembly, paper } from "./theme.js";
import { code, density, weave } from "./weave.js";

export default function Wall({
  people,
  fonts,
}: {
  people: { attendee: Attendee; serial: number }[];
  fonts?: any;
}) {
  return (
    <Page
      theme={assembly}
      lang="en"
      fonts={fonts}
      width={1280}
      title={`${EVENT.name} ${EVENT.edition} — all ${people.length} badges`}
      description={`Every badge for ${EVENT.name} ${EVENT.edition}, one weave per attendee.`}
      style={{ backgroundColor: paper.stock, gap: 0 }}
    >
      <Section style={{ padding: [40, 32, 0] }}>
        <Heading level={2} style={{ fontSize: 46, lineHeight: 0.94, letterSpacing: -1.4 }}>
          {people.length} attendees.
          <LineBreak />
          <Span style={{ fontFamily: `"Instrument Serif", Georgia, serif`, fontWeight: 400, fontStyle: "italic" }}>
            {people.length} weaves.
          </Span>
        </Heading>
        <Text style={{ color: paper.muted, fontSize: 13, maxWidth: 620 }}>
          Each pattern is a 12×5 mirrored hash of one name, printed in two inks. Same name, same weave — on the sheet,
          in the inbox, on the phone at the door. Take one field out of the CSV and the whole wall redraws.
        </Text>
      </Section>

      <Section style={{ padding: [28, 32, 40] }}>
        <Grid columns={5} style={{ gap: 16, rowGap: 20 }}>
          {people.map(({ attendee, serial }) => {
            const cells = weave(attendee.name);
            return (
              <Column
                key={attendee.name}
                style={{
                  gap: 7,
                  padding: 10,
                  border: { width: 1, style: "solid", color: paper.rule },
                  backgroundColor: "#FBF7EF",
                }}
              >
                <Weave cells={cells} cell={7} gap={1.5} />
                <Text style={{ fontFamily: `"Archivo Black", sans-serif`, fontSize: 15, lineHeight: 1, letterSpacing: -0.2 }}>
                  {attendee.name}
                </Text>
                <Row style={{ gap: 0 }}>
                  <Column style={{ flex: 1 }}>
                    <Stamp size={9}>
                      {String(serial).padStart(3, "0")} · {density(cells)}%
                    </Stamp>
                  </Column>
                  <Column style={{ width: 54 }}>
                    <Stamp size={9} align="right" color={paper.redInk}>
                      {code(attendee.name)}
                    </Stamp>
                  </Column>
                </Row>
              </Column>
            );
          })}
        </Grid>
      </Section>
    </Page>
  );
}
