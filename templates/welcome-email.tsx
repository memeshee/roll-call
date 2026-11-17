/**
 * The welcome email as a module the CLI can check:
 *   npx hyper-elements check templates/
 *
 * A template module exports a component (not an element): that is what the
 * checker, `hyper-elements render` and any agent loop expect.
 */
import BadgeEmail from "../src/badge-email.js";
import { TOTAL, sample, sheetOf } from "./_sample.js";

export default function WelcomeEmail() {
  return <BadgeEmail attendee={sample(0)} serial={1} total={TOTAL} sheet={sheetOf(1)} />;
}
