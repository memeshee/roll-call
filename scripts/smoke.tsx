/** Smoke test: render one email, print diagnostics and the plain text. */
import { formatDiagnostics, outline, validate } from "@hyper-elements/react";
import { loadAttendees } from "../src/data.js";
import BadgeEmail from "../src/badge-email.js";

const [attendee] = await loadAttendees("data/assembly-attendees.csv", 1);
if (!attendee) throw new Error("no attendee in data/assembly-attendees.csv");

const el = (
  <BadgeEmail attendee={attendee} serial={7} total={240} sheet={{ index: 1, of: 27, slot: 7 }} />
);
const report = validate(el);
console.log("valid:", report.valid);
console.log(formatDiagnostics(report.diagnostics));
console.log(outline(el));
