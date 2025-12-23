import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { countries } from "../src/data/countries";

const outDir = path.resolve("public", "data");
mkdirSync(outDir, { recursive: true });

const countriesJson = JSON.stringify(countries);
const countriesPath = path.join(outDir, "countries.json");
writeFileSync(countriesPath, countriesJson);

const hash = createHash("sha256").update(countriesJson).digest("hex");
const versionPayload = {
  version: new Date().toISOString(),
  countriesHash: hash,
  count: countries.length,
};
const versionPath = path.join(outDir, "data-version.json");
writeFileSync(versionPath, JSON.stringify(versionPayload, null, 2));

console.log(`Wrote ${countries.length} countries to ${countriesPath}`);
console.log(`Wrote version metadata to ${versionPath}`);
