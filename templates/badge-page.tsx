import BadgePage from "../src/badge-page.js";
import { TOTAL, faces, sample, sheetOf } from "./_sample.js";

export default function BadgePageTemplate() {
  return <BadgePage attendee={sample(0)} serial={1} total={TOTAL} fonts={faces} sheet={sheetOf(1)} />;
}
