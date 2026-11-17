
import { weave, density, assertWeave, code } from "../src/weave.js";
const names = (await import("node:fs")).readFileSync("data/assembly-attendees.csv","utf8").split("\n").slice(1).filter(Boolean).map(l=>l.split(",")[0]);
const ds = names.map(n => density(weave(n)));
const pats = new Set(names.map(n => weave(n).join("")));
const bad = [];
for (const n of names) { try { assertWeave(n) } catch (e) { bad.push(String(e.message)) } }
const hist = {};
for (const d of ds) { const b = Math.floor(d/5)*5; hist[b] = (hist[b]||0)+1 }
console.log("names", names.length, "distinct", pats.size, "min", Math.min(...ds), "max", Math.max(...ds), "mean", (ds.reduce((a,b)=>a+b,0)/ds.length).toFixed(1));
console.log("histogram by 5%:", JSON.stringify(hist));
console.log("invariant failures:", bad.length, bad.slice(0,3));
