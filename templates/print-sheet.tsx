import { Sheet } from "../src/sheet.js";
import { TOTAL, all, faces } from "./_sample.js";

export default function PrintSheet() {
  return <Sheet people={all(9)} sheetIndex={1} sheetCount={Math.ceil(TOTAL / 9)} total={TOTAL} fonts={faces} />;
}
