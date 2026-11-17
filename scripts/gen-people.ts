/**
 * The roster, generated once and committed as data/assembly-attendees.csv.
 *
 * Assembly 3.0 is a fictional conference; these are fictional attendees. The
 * file is a normal registration export — that is what the kit is for: drop in
 * your own export and the whole run comes out of it.
 */
import { writeFile, mkdir } from "node:fs/promises";

const first = [
  "Ada", "Grace", "Émile", "Yusuf", "Noor", "Ines", "Kaito", "Mira", "Tomás", "Lena",
  "Amara", "Ravi", "Sofia", "Jonas", "Priya", "Hugo", "Aylin", "Mateo", "Zara", "Oskar",
  "Chiara", "Nikolai", "Halima", "Felix", "Anouk", "Diego", "Saoirse", "Kwame", "Elin", "Rasheed",
  "Beatrix", "Jun", "Marta", "Olamide", "Theo", "Ilse", "Renata", "Bilal", "Sinead", "Arjun",
];
const last = [
  "Lovelace", "Hopper", "Zola", "Demir", "Haddad", "Costa", "Mori", "Petrova", "Almeida", "Fischer",
  "Okafor", "Nair", "Bauer", "Lindqvist", "Raman", "Duarte", "Yilmaz", "Vargas", "Bennani", "Novak",
  "Ferraresi", "Sokolov", "Idrissi", "Brandt", "de Vries", "Castillo", "O'Shea", "Mensah", "Halvorsen", "Karim",
  "Vogel", "Watanabe", "Esposito", "Adeyemi", "Brandt", "Vermeulen", "Kowalska", "Rahman", "Gallagher", "Mehra",
];
const roles = [
  "Staff engineer", "Design lead", "Type designer", "Founder", "Devrel", "Platform engineer",
  "Product designer", "Independent", "Eng manager", "Riso printer", "Build tooling", "Researcher",
  "Frontend engineer", "Editor", "Illustrator", "Data engineer", "Support lead", "CTO",
];
const orgs = [
  "Analytical Engines", "Tidepool", "Kestrel & Co", "Grain Press", "Loopwork", "Nine Volt",
  "Golden Hour", "Fieldnote", "Orrery", "Half Title", "Marble Arch", "Signalfire",
  "Wren Labs", "Copperplate", "Northbound", "Studio Marrow", "Paper Union", "Broadleaf",
];
const tickets = ["Full pass", "Full pass", "Full pass", "Speaker", "Crew", "Student", "Press"];

// Deterministic: same file every run, so the screenshots in the README are reproducible.
let seed = 20270312;
const rnd = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
};
const pick = <T,>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)];

const rows = new Set<string>();
const people: string[][] = [];
while (people.length < 240) {
  const name = `${pick(first)} ${pick(last)}`;
  if (rows.has(name)) continue;
  rows.add(name);
  const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
  people.push([name, `${handle}@example.com`, pick(roles), pick(orgs), pick(tickets)]);
}

const csv = [
  "name,email,role,org,ticket",
  ...people.map((r) => r.map((f) => (/[",\n]/.test(f) ? `"${f.replace(/"/g, '""')}"` : f)).join(",")),
].join("\n");

await mkdir("data", { recursive: true });
await writeFile("data/assembly-attendees.csv", csv + "\n");
console.log(`wrote data/assembly-attendees.csv — ${people.length} attendees`);
