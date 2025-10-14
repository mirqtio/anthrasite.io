#!/usr/bin/env node
import fs from "node:fs";

// Usage: node scripts/ci-select-from-csv.mjs path/to/results.csv > playwright-selection.json
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/ci-select-from-csv.mjs <csvFile>");
  process.exit(2);
}

const raw = fs.readFileSync(csvPath, "utf8");

// Simple CSV parser that respects the quotes in your sample
function parseCSV(str) {
  const lines = str.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  const cols = header
    .replace(/^"|"$/g, "")
    .split('","')
    .map((s) => s.trim());

  return lines.map((line) => {
    const cells = line
      .replace(/^"|"$/g, "")
      .split('","')
      .map((s) => s.trim());
    const row = {};
    cols.forEach((k, i) => (row[k] = cells[i] ?? ""));
    return row;
  });
}

const rows = parseCSV(raw);

// We will run EXACTLY rows where Test Status === "passed" or "pending" (to match baseline)
const passed = rows.filter((r) => {
  const status = r["Test Status"];
  return status === "passed" || status === "pending";
});

// We'll key by GroupId (Playwright project) + Spec
const byProjectSpec = new Map();
/*
 Shape:
  key = `${project}:::${spec}`
  value = { project, spec, titles: Set<string> }
*/

for (const r of passed) {
  const project = r["GroupId"];      // e.g. chromium-desktop
  const spec = r["Spec"];            // e.g. homepage.spec.ts
  const titleCSV = r["Title"];       // e.g. "Homepage Rendering,should render features section"
  // The CSV "Title" combines suite and test title with a comma. We'll use the right-most part as the test title
  // and also keep the whole string so we can match robustly.
  const parts = titleCSV.split(",");
  const testTitle = parts[parts.length - 1].trim();

  // We'll try to match either the exact test title OR the whole "suite,test" fragment, to be robust
  const candidates = new Set([testTitle, titleCSV]);

  const key = `${project}:::${spec}`;
  if (!byProjectSpec.has(key)) {
    byProjectSpec.set(key, { project, spec, titles: new Set() });
  }
  const bucket = byProjectSpec.get(key);

  for (const c of candidates) {
    bucket.titles.add(c);
  }
}

// Escape a string for use in a JS regex
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build a matrix consumable by GitHub Actions
const matrix = [];
for (const { project, spec, titles } of byProjectSpec.values()) {
  // We create a single big OR regex for --grep; Playwright matches the full title path.
  // We'll match if either the exact test name OR the "suite, test" fragment appears in the full title line.
  const ors = Array.from(titles).map((t) => escapeRegex(t));
  // Guard against empty edge cases
  if (!ors.length) continue;

  // We wrap in a non-capturing group so anchors don't mess up alternations.
  const grep = `(?:${ors.join("|")})`;

  matrix.push({
    project,
    spec,                 // allow "**/subdir/spec.ts" if your CSV includes that
    grep,                 // to be passed to --grep
  });
}

process.stdout.write(JSON.stringify({ include: matrix }, null, 2));
