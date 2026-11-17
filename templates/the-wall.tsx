import Wall from "../src/wall.js";
import { all, faces } from "./_sample.js";

export default function TheWall() {
  return <Wall people={all(9)} fonts={faces} />;
}
