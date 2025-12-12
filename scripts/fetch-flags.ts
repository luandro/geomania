import path from 'path';
import { updateCountriesData } from './update-countries-data';

// Backwards-compatible wrapper.
// Use `node --import tsx scripts/update-countries-data.ts --download-flags` instead.
updateCountriesData({
  outPath: path.resolve(process.cwd(), 'src', 'data', 'countries.ts'),
  cacheDir: path.resolve(process.cwd(), 'scripts', 'cache'),
  useCache: false,
  downloadFlags: true,
  dryRun: false,
  enrichEconomics: true,
  enrichWikidata: true,
  enrichWikidataSports: false,
  wikidataLanguage: 'en',
  userAgent: process.env.COUNTRY_DATA_USER_AGENT || 'geomania-country-data/1.0 (https://wikidata.org)',
  requestDelayMs: 500,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
