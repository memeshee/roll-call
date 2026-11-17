/**
 * The print sheet: nine 85×54mm badges imposed on A4, landscape.
 *
 * This is the output nothing else in the kit could be: an actual print job.
 * Nine credit-card badges per sheet with 8mm gutters and a dashed cut line
 * around each, a footer saying which sheet of how many this is, and a last
 * sheet that is deliberately short instead of padded with a ninth badge that
 * belongs to nobody.
 */
import {
  Column,
  Document,
  Grid,
  Heading,
  LineBreak,
  PageFooter,
  PageNumber,
  Row,
  Span,
  Text,
} from "@hyper-elements/react";
import { Stamp, EVENT, Weave, Wordmark } from "./components.js";
import { givenName, familyName, type Attendee } from "./data.js";
import { assembly, paper } from "./theme.js";
import { code, weave } from "./weave.js";

/** Millimetres to px at 96 to the inch, which is what a Document lays out in. */
export const mm = (v: number) => (v / 25.4) * 96;

export const BADGE = { w: mm(85), h: mm(54) };
export const GUTTER = mm(8);
export const PER_SHEET = 9;

/** A4 landscape: 297 × 210mm. The margin leaves 3 badges and 2 gutters across. */
const PAGE_W = mm(297);
const PAGE_H = mm(210);
const MARGIN_H = (PAGE_W - (BADGE.w * 3 + GUTTER * 2)) / 2;
const MARGIN_V = 40;

export function Sheet({
  people,
  sheetIndex,
  sheetCount,
  fonts,
}: {
  people: { attendee: Attendee; serial: number }[];
  sheetIndex: number;
  sheetCount: number;
  fonts?: any;
}) {
  const total = people.length ? undefined : undefined;
  return (
    <Document
      theme={assembly}
      lang="en"
      size="A4"
      orientation="landscape"
      margin={[MARGIN_V, MARGIN_H]}
      fonts={fonts}
      title={`${EVENT.name} ${EVENT.edition} — badges, sheet ${sheetIndex} of ${sheetCount}`}
      style={{ backgroundColor: "#FFFFFF", gap: GUTTER }}
    >
      <Grid columns={3} stackOnMobile={false} style={{ gap: GUTTER, rowGap: GUTTER }}>
        {people.map(({ attendee, serial }) => {
          const cells = weave(attendee.name);
          return (
            <Column
              key={attendee.name}
              style={{
                width: BADGE.w,
                height: BADGE.h,
                padding: 13,
                gap: 6,
                backgroundColor: paper.stock,
                border: { width: 1, style: "dashed", color: "#BCB3A0" },
              }}
            >
              <Row style={{ gap: 0 }}>
                <Column style={{ flex: 1 }}>
                  <Wordmark size={10} />
                </Column>
                <Column style={{ width: 74 }}>
                  <Stamp size={9} align="right">
                    No. {String(serial).padStart(3, "0")}/240
                  </Stamp>
                </Column>
              </Row>

              <Weave cells={cells} cell={7} gap={2} />

              <Heading level={1} style={{ fontSize: 29, lineHeight: 0.86, letterSpacing: -1 }}>
                {givenName(attendee.name)}
                <LineBreak />
                <Span
                  style={{
                    fontFamily: `"Instrument Serif", Georgia, serif`,
                    fontWeight: 400,
                    fontStyle: "italic",
                    letterSpacing: -0.5,
                  }}
                >
                  {familyName(attendee.name)}
                </Span>
              </Heading>

              <Row style={{ gap: 0 }}>
                <Column style={{ flex: 1 }}>
                  <Stamp size={9} color={paper.ink}>
                    {attendee.role}
                  </Stamp>
                  <Stamp size={9}>{attendee.org}</Stamp>
                </Column>
                <Column style={{ width: 74 }}>
                  <Stamp size={9} color={paper.redInk} align="right">
                    {attendee.ticket}
                  </Stamp>
                </Column>
              </Row>

              <Text
                style={{
                  fontFamily: `"Space Mono", "Courier New", monospace`,
                  fontSize: 10,
                  letterSpacing: 3,
                  color: paper.ink,
                  lineHeight: 1,
                }}
              >
                {code(attendee.name)}
              </Text>
            </Column>
          );
        })}
      </Grid>

      <PageFooter>
        <Row style={{ gap: 0 }}>
          <Column style={{ flex: 1 }}>
            <Stamp size={8}>
              {EVENT.name} {EVENT.edition} · attendee badges · 85×54mm · cut on the dashed lines
            </Stamp>
          </Column>
          <Column style={{ width: 150 }}>
            <Stamp size={9} align="right">
              Sheet <PageNumber /> of <PageNumber total />
            </Stamp>
          </Column>
        </Row>
      </PageFooter>
    </Document>
  );
}
