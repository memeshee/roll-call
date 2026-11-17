import { StoryCard } from "../src/card.js";
import { TOTAL, sample } from "./_sample.js";

export default function Card() {
  return <StoryCard attendee={sample(0)} serial={1} total={TOTAL} />;
}
