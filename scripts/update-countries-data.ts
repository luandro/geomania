import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { countries as existingCountries } from '@/data/countries';
import type { CountryData, Difficulty } from '@/types/quiz';

type RestCountry = {
  name?: { common?: string; official?: string };
  capital?: string[];
  region?: string;
  population?: number;
  flags?: { png?: string; svg?: string };
  cca2?: string;
  cca3?: string;
  ccn3?: string;
  translations?: Record<string, { common?: string; official?: string }>;
};

type UpdateOptions = {
  outPath: string;
  cacheDir?: string;
  useCache: boolean;
  downloadFlags: boolean;
  dryRun: boolean;
  enrichEconomics: boolean;
  enrichWikidata: boolean;
  enrichWikidataSports: boolean;
  wikidataLanguage: string;
  userAgent: string;
  requestDelayMs: number;
};

const REST_COUNTRIES_URL =
  'https://restcountries.com/v3.1/all?fields=name,capital,region,population,flags,cca2,cca3,ccn3,translations';

const WORLD_BANK_BASE_URL = 'https://api.worldbank.org/v2';
const WORLD_BANK_GDP_INDICATOR = 'NY.GDP.MKTP.CD';
const WORLD_BANK_GDP_PER_CAPITA_INDICATOR = 'NY.GDP.PCAP.CD';

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const DEFAULT_WIKIDATA_USER_AGENT = 'geomania-country-data/1.0 (https://wikidata.org)';

const OUTPUT_FLAGS_DIR = path.resolve(process.cwd(), 'public', 'flags');
const FLAG_WIDTH = 80;
const FLAG_QUALITY = 75;

const ptCapitalOverrides: Record<string, string> = {
  'Rome': 'Roma',
  'London': 'Londres',
  'Vienna': 'Viena',
  'Prague': 'Praga',
  'Warsaw': 'Varsóvia',
  'Brussels': 'Bruxelas',
  'Athens': 'Atenas',
  'Moscow': 'Moscou',
  'Beijing': 'Pequim',
  'Lisbon': 'Lisboa',
  'Berlin': 'Berlim',
  'Bucharest': 'Bucareste',
  'Budapest': 'Budapeste',
  'Copenhagen': 'Copenhague',
  'Stockholm': 'Estocolmo',
  'Helsinki': 'Helsínquia',
  'Belgrade': 'Belgrado',
  'Mexico City': 'Cidade do México',
  'Bangkok': 'Banguecoque',
  'Riyadh': 'Riade',
  'Tehran': 'Teerã',
  'Baghdad': 'Bagdá',
  'Damascus': 'Damasco',
  'Jerusalem': 'Jerusalém',
  'Kuwait City': 'Cidade do Kuwait',
  'Port of Spain': 'Porto de Espanha',
  'Panama City': 'Cidade do Panamá',
  'Guatemala City': 'Cidade da Guatemala',
  'San Jose': 'São José',
  'San José': 'São José',
  'Port-au-Prince': 'Porto Príncipe',
  'New Delhi': 'Nova Deli',
  'Seoul': 'Seul',
  'Pyongyang': 'Pionguiangue',
  'Algiers': 'Argel',
  'Nairobi': 'Nairóbi',
  'Hanoi': 'Hanói',
  'Vientiane': 'Vienciana',
  'Rabat': 'Rabat',
};

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

const parseArgs = (): UpdateOptions => {
  const argv = process.argv.slice(2);
  const opts: UpdateOptions = {
    outPath: path.resolve(process.cwd(), 'src', 'data', 'countries.ts'),
    cacheDir: path.resolve(process.cwd(), 'scripts', 'cache'),
    useCache: false,
    downloadFlags: false,
    dryRun: false,
    enrichEconomics: true,
    enrichWikidata: true,
    enrichWikidataSports: false,
    wikidataLanguage: 'en',
    userAgent: process.env.COUNTRY_DATA_USER_AGENT || DEFAULT_WIKIDATA_USER_AGENT,
    requestDelayMs: 500,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' && argv[i + 1]) {
      opts.outPath = path.resolve(process.cwd(), argv[++i]);
    } else if (a === '--cache-dir' && argv[i + 1]) {
      opts.cacheDir = path.resolve(process.cwd(), argv[++i]);
    } else if (a === '--use-cache') {
      opts.useCache = true;
    } else if (a === '--download-flags') {
      opts.downloadFlags = true;
    } else if (a === '--dry-run') {
      opts.dryRun = true;
    } else if (a === '--skip-economics') {
      opts.enrichEconomics = false;
    } else if (a === '--skip-wikidata') {
      opts.enrichWikidata = false;
    } else if (a === '--include-sports') {
      opts.enrichWikidataSports = true;
    } else if (a === '--skip-sports') {
      opts.enrichWikidataSports = false;
    } else if (a === '--wikidata-lang' && argv[i + 1]) {
      opts.wikidataLanguage = argv[++i];
    } else if (a === '--user-agent' && argv[i + 1]) {
      opts.userAgent = argv[++i];
    } else if (a === '--delay-ms' && argv[i + 1]) {
      opts.requestDelayMs = Number(argv[++i]) || opts.requestDelayMs;
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  return opts;
};

const printHelp = () => {
   
  console.log(`
Update country dataset and localizations.

Usage:
  tsx scripts/update-countries-data.ts [options]

Options:
  --out <path>           Output TS file (default src/data/countries.ts)
  --cache-dir <path>     Directory for raw API caches (default scripts/cache)
  --use-cache            Use cached raw data instead of fetching
  --download-flags       Download flags to public/flags and rewrite flag_url
  --skip-economics       Skip World Bank economics enrichment
  --skip-wikidata        Skip Wikidata enrichment (politics/culture)
  --include-sports       Try to enrich sports via Wikidata (can be slow)
  --skip-sports          Do not enrich sports via Wikidata (default)
  --wikidata-lang <lang> Label language for Wikidata (default en)
  --user-agent <ua>      Override User-Agent (or COUNTRY_DATA_USER_AGENT)
  --delay-ms <ms>        Delay between remote requests (default 500)
  --dry-run              Build data but do not write output
  -h, --help             Show help
`);
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const hashText = (value: string) => createHash('sha256').update(value).digest('hex').slice(0, 12);

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: UpdateOptions,
  label: string
): Promise<Response> {
  const maxAttempts = 3;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, init);
    if (res.ok) return res;

    lastStatus = res.status;
    const shouldRetry = [429, 500, 502, 503, 504].includes(res.status);
    if (!shouldRetry || attempt === maxAttempts) {
      return res;
    }

    const retryAfterHeader = res.headers.get('retry-after');
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    const backoffMs = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : opts.requestDelayMs * Math.pow(2, attempt - 1);

     
    console.warn(`↻ retry ${label} (status ${res.status}) in ${Math.round(backoffMs)}ms`);
    await sleep(backoffMs);
  }

  throw new Error(`Failed to fetch ${label} (last status: ${lastStatus})`);
}

async function fetchRestCountries(opts: UpdateOptions): Promise<RestCountry[]> {
  const cacheFile = opts.cacheDir ? path.join(opts.cacheDir, 'restcountries.json') : undefined;

  if (opts.useCache) {
    if (!cacheFile || !fs.existsSync(cacheFile)) {
      throw new Error(`Cache file not found at ${cacheFile}`);
    }
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as RestCountry[];
  }

  const res = await fetchWithRetry(REST_COUNTRIES_URL, {}, opts, 'restcountries');
  if (!res.ok) {
    throw new Error(`REST Countries fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as RestCountry[];

  if (cacheFile) {
    ensureDir(path.dirname(cacheFile));
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
  }

  return data;
}

type WorldBankMeta = {
  page: number;
  pages: number;
  per_page: string;
  total: number;
};

type WorldBankPoint = {
  countryiso3code: string;
  date: string;
  value: number | null;
};

async function fetchWorldBankIndicatorAll(indicator: string, opts: UpdateOptions): Promise<WorldBankPoint[]> {
  const cacheFile = opts.cacheDir
    ? path.join(opts.cacheDir, `worldbank-${indicator}.json`)
    : undefined;

  if (opts.useCache) {
    if (!cacheFile || !fs.existsSync(cacheFile)) {
      throw new Error(`Cache file not found at ${cacheFile}`);
    }
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as WorldBankPoint[];
  }

  const points: WorldBankPoint[] = [];
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const url =
      `${WORLD_BANK_BASE_URL}/country/all/indicator/${indicator}` +
      `?format=json&per_page=20000&page=${page}`;
    const res = await fetchWithRetry(url, {}, opts, `worldbank:${indicator}:page:${page}`);
    if (!res.ok) {
      throw new Error(`World Bank fetch failed (${indicator}): ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as [WorldBankMeta, WorldBankPoint[]];
    const meta = json?.[0];
    const data = json?.[1] || [];
    if (!meta || !Array.isArray(data)) break;

    pages = meta.pages || 1;
    points.push(...data);
    page += 1;

    if (page <= pages) {
      await sleep(opts.requestDelayMs);
    }
  }

  if (cacheFile) {
    ensureDir(path.dirname(cacheFile));
    fs.writeFileSync(cacheFile, JSON.stringify(points, null, 2));
  }

  return points;
}

type LatestNumber = { value: number; year: number };

function latestByIso3(points: WorldBankPoint[], wantedIso3: Set<string>): Map<string, LatestNumber> {
  const out = new Map<string, LatestNumber>();

  for (const p of points) {
    const iso3 = p.countryiso3code;
    if (!iso3 || iso3.length !== 3) continue;
    if (!wantedIso3.has(iso3)) continue;
    if (p.value === null || typeof p.value !== 'number') continue;

    const year = Number(p.date);
    if (!Number.isFinite(year)) continue;

    const prev = out.get(iso3);
    if (!prev || year > prev.year) {
      out.set(iso3, { value: p.value, year });
    }
  }

  return out;
}

type WikidataSparqlJson = {
  results?: { bindings?: Array<Record<string, { type: string; value: string }>> };
};

async function fetchWikidataSparql(query: string, opts: UpdateOptions): Promise<WikidataSparqlJson> {
  const cacheFile = opts.cacheDir
    ? path.join(opts.cacheDir, `wikidata-${hashText(query)}.json`)
    : undefined;

  if (opts.useCache) {
    if (!cacheFile || !fs.existsSync(cacheFile)) {
      throw new Error(`Cache file not found at ${cacheFile}`);
    }
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as WikidataSparqlJson;
  }

  const res = await fetchWithRetry(
    WIKIDATA_SPARQL_URL,
    {
      method: 'POST',
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/sparql-query; charset=utf-8',
        'User-Agent': opts.userAgent,
      },
      body: query,
    },
    opts,
    'wikidata-sparql'
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Wikidata SPARQL failed: ${res.status} ${res.statusText}\n${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as WikidataSparqlJson;
  if (cacheFile) {
    ensureDir(path.dirname(cacheFile));
    fs.writeFileSync(cacheFile, JSON.stringify(json, null, 2));
  }
  return json;
}

async function downloadFlag(pngUrl: string, outPath: string, opts: UpdateOptions) {
  const res = await fetchWithRetry(pngUrl, {}, opts, 'flag');
  if (!res.ok) throw new Error(`Failed to fetch ${pngUrl}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).resize({ width: FLAG_WIDTH }).webp({ quality: FLAG_QUALITY }).toFile(outPath);
}

function buildCountries(restData: RestCountry[], opts: UpdateOptions) {
  const difficultyById = new Map<string, Difficulty>(
    existingCountries.map((c) => [c.id, c.difficulty])
  );

  const byId = new Map<string, CountryData>();
  const now = new Date().toISOString();

  for (const rc of restData) {
    const name = rc.name?.common;
    if (!name) continue;
    const id = slugify(name);

    const capital = rc.capital?.[0] || '';
    const ptName =
      rc.translations?.por?.common ||
      rc.translations?.por?.official ||
      name;
    const ptCapital = ptCapitalOverrides[capital] || capital;

    const existing = existingCountries.find((c) => c.id === id);

    const flagRemote = rc.flags?.png || rc.flags?.svg || existing?.flag_url || '';
    const flagHash = hashText(id);
    const flagLocal = `/flags/${flagHash}.webp`;

    byId.set(id, {
      id,
      name,
      capital,
      region: rc.region || existing?.region || 'Other',
      population: rc.population ?? existing?.population ?? 0,
      difficulty: difficultyById.get(id) || existing?.difficulty || 'medium',
      flag_url: opts.downloadFlags ? flagLocal : (existing?.flag_url || flagRemote || flagLocal),
      codes: {
        iso2: rc.cca2,
        iso3: rc.cca3,
        numeric: rc.ccn3,
      },
      meta: {
        lastUpdated: {
          base: now,
          pt: now,
        },
        sources: {
          base: 'restcountries.com',
          ptName: 'restcountries.com',
          ptCapital: 'manual+restcountries.com',
        },
      },
      localizations: {
        'pt-BR': { name: ptName, capital: ptCapital },
      },
    });
  }

  // Preserve existing order where possible.
  const ordered: CountryData[] = [];
  for (const existing of existingCountries) {
    const next = byId.get(existing.id);
    if (next) {
      ordered.push(next);
      byId.delete(existing.id);
    }
  }
  // Append new countries (if any), sorted by id.
  for (const remaining of Array.from(byId.values()).sort((a, b) => a.id.localeCompare(b.id))) {
    ordered.push(remaining);
  }

  return { ordered, restById: restData };
}

function buildPortugueseMaps(countries: CountryData[]) {
  const ptCountryNames: Record<string, string> = {};
  const ptCapitalNames: Record<string, string> = {};
  countries.forEach((c) => {
    ptCountryNames[c.id] = c.localizations?.['pt-BR']?.name || c.name;
    ptCapitalNames[c.id] = c.localizations?.['pt-BR']?.capital || c.capital;
  });
  return { ptCountryNames, ptCapitalNames };
}

function formatCountriesTs(
  countries: CountryData[],
  ptCountryNames: Record<string, string>,
  ptCapitalNames: Record<string, string>
) {
  return (
    `import { CountryData } from '@/types/quiz';\n\n` +
    `export const countries: CountryData[] = ${JSON.stringify(countries, null, 2)};\n\n` +
    `// Portuguese localizations for country names and capitals.\n` +
    `// Sourced from REST Countries translations + manual capital exonyms.\n` +
    `// Kept here so all country-related data lives in one file.\n\n` +
    `export const ptCountryNames: Record<string, string> = ${JSON.stringify(ptCountryNames, null, 2)} as const;\n\n` +
    `export const ptCapitalNames: Record<string, string> = ${JSON.stringify(ptCapitalNames, null, 2)} as const;\n`
  );
}

async function enrichEconomicsFromWorldBank(countries: CountryData[], opts: UpdateOptions) {
  if (!opts.enrichEconomics) return countries;

  const wantedIso3 = new Set(
    countries
      .map((c) => c.codes?.iso3)
      .filter((iso3): iso3 is string => typeof iso3 === 'string' && iso3.length === 3)
  );

  const [gdpPoints, perCapitaPoints] = await Promise.all([
    fetchWorldBankIndicatorAll(WORLD_BANK_GDP_INDICATOR, opts),
    fetchWorldBankIndicatorAll(WORLD_BANK_GDP_PER_CAPITA_INDICATOR, opts),
  ]);

  const gdpByIso3 = latestByIso3(gdpPoints, wantedIso3);
  const gdpPerCapitaByIso3 = latestByIso3(perCapitaPoints, wantedIso3);
  const now = new Date().toISOString();

  return countries.map((c) => {
    const iso3 = c.codes?.iso3;
    if (!iso3) return c;

    const gdp = gdpByIso3.get(iso3);
    const gdpPerCapita = gdpPerCapitaByIso3.get(iso3);
    if (!gdp && !gdpPerCapita) return c;

    const year = gdp?.year ?? gdpPerCapita?.year;

    return {
      ...c,
      economics: {
        ...(c.economics || {}),
        gdpUsd: gdp?.value ?? c.economics?.gdpUsd,
        gdpPerCapitaUsd: gdpPerCapita?.value ?? c.economics?.gdpPerCapitaUsd,
        year: year ?? c.economics?.year,
      },
      meta: {
        ...(c.meta || {}),
        lastUpdated: {
          ...(c.meta?.lastUpdated || {}),
          economics: now,
        },
        sources: {
          ...(c.meta?.sources || {}),
          'economics.gdpUsd': 'api.worldbank.org',
          'economics.gdpPerCapitaUsd': 'api.worldbank.org',
        },
      },
    };
  });
}

type WikidataAccum = {
  headOfState?: string;
  headOfGovernment?: string;
  governmentTypes: Set<string>;
  officialReligions: Set<string>;
  religions: Set<string>;
  sports: Set<string>;
};

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function buildValuesIso3(iso3s: string[]) {
  return iso3s.map((v) => `"${v.replace(/"/g, '')}"`).join(' ');
}

async function enrichFromWikidata(countries: CountryData[], opts: UpdateOptions) {
  if (!opts.enrichWikidata) return countries;

  const iso3s = countries
    .map((c) => c.codes?.iso3)
    .filter((iso3): iso3 is string => typeof iso3 === 'string' && iso3.length === 3);
  const uniqueIso3s = Array.from(new Set(iso3s)).sort();

  const byIso3 = new Map<string, WikidataAccum>();
  const ensure = (iso3: string) => {
    const existing = byIso3.get(iso3);
    if (existing) return existing;
    const next: WikidataAccum = {
      governmentTypes: new Set<string>(),
      officialReligions: new Set<string>(),
      religions: new Set<string>(),
      sports: new Set<string>(),
    };
    byIso3.set(iso3, next);
    return next;
  };

  // Politics + religions (country -> ISO3 P298; head of state P35; head of government P6; government type P122; official religion P3075; religion P140)
  for (const batch of chunk(uniqueIso3s, 50)) {
    const query = `
SELECT ?iso3 ?headOfStateLabel ?headOfGovernmentLabel ?governmentLabel ?officialReligionLabel ?religionLabel WHERE {
  VALUES ?iso3 { ${buildValuesIso3(batch)} }
  ?country wdt:P298 ?iso3 .
  OPTIONAL { ?country wdt:P35 ?headOfState . }
  OPTIONAL { ?country wdt:P6 ?headOfGovernment . }
  OPTIONAL { ?country wdt:P122 ?government . }
  OPTIONAL { ?country wdt:P3075 ?officialReligion . }
  OPTIONAL { ?country wdt:P140 ?religion . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${opts.wikidataLanguage}" . }
}`.trim();

    const json = await fetchWikidataSparql(query, opts);
    const bindings = json.results?.bindings || [];

    for (const row of bindings) {
      const iso3 = row.iso3?.value;
      if (!iso3) continue;
      const acc = ensure(iso3);

      const headOfState = row.headOfStateLabel?.value;
      const headOfGovernment = row.headOfGovernmentLabel?.value;
      const government = row.governmentLabel?.value;
      const officialReligion = row.officialReligionLabel?.value;
      const religion = row.religionLabel?.value;

      if (headOfState) acc.headOfState = headOfState;
      if (headOfGovernment) acc.headOfGovernment = headOfGovernment;
      if (government) acc.governmentTypes.add(government);
      if (officialReligion) acc.officialReligions.add(officialReligion);
      if (religion) acc.religions.add(religion);
    }

    await sleep(opts.requestDelayMs);
  }

  if (opts.enrichWikidataSports) {
    // Sports (best-effort). Wikidata doesn't have a universal "major sport" field for countries,
    // so we approximate from "sport in a geographic region" topics and their parts.
    for (const batch of chunk(uniqueIso3s, 25)) {
      const query = `
SELECT ?iso3 ?sportItemLabel WHERE {
  VALUES ?iso3 { ${buildValuesIso3(batch)} }
  ?country wdt:P298 ?iso3 .
  OPTIONAL {
    ?sportsTopic wdt:P31 wd:Q29791211 ;
                wdt:P17 ?country ;
                wdt:P527 ?part .
    OPTIONAL { ?part wdt:P641 ?sport . }
    BIND(IF(BOUND(?sport), ?sport, ?part) AS ?sportItem)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${opts.wikidataLanguage}" . }
}`.trim();

      const json = await fetchWikidataSparql(query, opts);
      const bindings = json.results?.bindings || [];

      for (const row of bindings) {
        const iso3 = row.iso3?.value;
        const sport = row.sportItemLabel?.value;
        if (!iso3 || !sport) continue;
        ensure(iso3).sports.add(sport);
      }

      await sleep(opts.requestDelayMs);
    }
  }

  const now = new Date().toISOString();

  return countries.map((c) => {
    const iso3 = c.codes?.iso3;
    if (!iso3) return c;
    const acc = byIso3.get(iso3);
    if (!acc) return c;

    const governmentTypes = Array.from(acc.governmentTypes).sort();
    const religions = (acc.officialReligions.size ? acc.officialReligions : acc.religions);
    const religionNames = Array.from(religions).sort();
    const sports = opts.enrichWikidataSports ? Array.from(acc.sports).sort().slice(0, 12) : [];

    const nextPolitics =
      acc.headOfState || acc.headOfGovernment || governmentTypes.length
        ? {
            ...(c.politics || {}),
            headOfState: acc.headOfState ?? c.politics?.headOfState,
            headOfGovernment: acc.headOfGovernment ?? c.politics?.headOfGovernment,
            governmentType: governmentTypes.length ? governmentTypes.join('; ') : c.politics?.governmentType,
            updatedAt: now,
          }
        : c.politics;

    const nextCulture =
      religionNames.length || (opts.enrichWikidataSports && sports.length)
        ? {
            ...(c.culture || {}),
            religions: religionNames.length
              ? religionNames.map((name) => ({ name }))
              : c.culture?.religions,
            majorSports: (opts.enrichWikidataSports && sports.length) ? sports : c.culture?.majorSports,
            updatedAt: now,
          }
        : c.culture;

    if (!nextPolitics && !nextCulture) return c;

    return {
      ...c,
      politics: nextPolitics,
      culture: nextCulture,
      meta: {
        ...(c.meta || {}),
        lastUpdated: {
          ...(c.meta?.lastUpdated || {}),
          politics: nextPolitics ? now : c.meta?.lastUpdated?.politics,
          culture: nextCulture ? now : c.meta?.lastUpdated?.culture,
        },
        sources: {
          ...(c.meta?.sources || {}),
          ...(nextPolitics
            ? {
                'politics.headOfState': 'wikidata.org',
                'politics.headOfGovernment': 'wikidata.org',
                'politics.governmentType': 'wikidata.org',
              }
            : {}),
          ...(nextCulture
            ? {
                'culture.religions': acc.officialReligions.size ? 'wikidata.org (P3075)' : 'wikidata.org (P140)',
                ...(opts.enrichWikidataSports ? { 'culture.majorSports': 'wikidata.org' } : {}),
              }
            : {}),
        },
      },
    };
  });
}

function printEnrichmentSummary(countries: CountryData[]) {
  const total = countries.length;
  const withIso3 = countries.filter((c) => c.codes?.iso3 && c.codes.iso3.length === 3);
  const iso3ToNames = new Map<string, string[]>();
  withIso3.forEach((c) => {
    const iso3 = c.codes!.iso3!;
    const list = iso3ToNames.get(iso3) || [];
    list.push(c.name);
    iso3ToNames.set(iso3, list);
  });
  const duplicateIso3 = Array.from(iso3ToNames.entries())
    .filter(([, names]) => names.length > 1)
    .slice(0, 5)
    .map(([iso3, names]) => `${iso3}=[${names.join(', ')}]`);

  const gdpCount = countries.filter((c) => typeof c.economics?.gdpUsd === 'number').length;
  const gdpPerCapitaCount = countries.filter((c) => typeof c.economics?.gdpPerCapitaUsd === 'number').length;

  const headOfStateCount = countries.filter((c) => !!c.politics?.headOfState).length;
  const headOfGovernmentCount = countries.filter((c) => !!c.politics?.headOfGovernment).length;
  const governmentTypeCount = countries.filter((c) => !!c.politics?.governmentType).length;

  const religionsCount = countries.filter((c) => (c.culture?.religions || []).length > 0).length;
  const sportsCount = countries.filter((c) => (c.culture?.majorSports || []).length > 0).length;

  const missingIso3 = countries
    .filter((c) => !c.codes?.iso3)
    .map((c) => c.name)
    .slice(0, 10);

   
  console.log(
    [
      `Countries: ${total} (${withIso3.length} with ISO3)`,
      `Economics: GDP=${gdpCount}, GDP/capita=${gdpPerCapitaCount}`,
      `Politics: HoS=${headOfStateCount}, HoG=${headOfGovernmentCount}, govtType=${governmentTypeCount}`,
      `Culture: religions=${religionsCount}, sports=${sportsCount}`,
      missingIso3.length ? `Missing ISO3 (sample): ${missingIso3.join(', ')}` : undefined,
      duplicateIso3.length ? `Duplicate ISO3 (sample): ${duplicateIso3.join(' | ')}` : undefined,
    ]
      .filter(Boolean)
      .join(' | ')
  );
}

async function maybeDownloadFlags(countries: CountryData[], restData: RestCountry[], opts: UpdateOptions) {
  if (!opts.downloadFlags) return;

  ensureDir(OUTPUT_FLAGS_DIR);

  const restMap = new Map(restData.map((rc) => [slugify(rc.name?.common || ''), rc]));

  for (const c of countries) {
    const rc = restMap.get(c.id);
    const pngUrl = rc?.flags?.png;
    if (!pngUrl) continue;
    const flagHash = hashText(c.id);
    const out = path.join(OUTPUT_FLAGS_DIR, `${flagHash}.webp`);
    if (fs.existsSync(out)) continue;
     
    console.log(`→ fetching ${pngUrl} -> ${out}`);
    try {
      await downloadFlag(pngUrl, out, opts);
    } catch (err) {
       
      console.error(`✗ failed ${c.name}:`, err);
    }
  }
}

export async function updateCountriesData(opts: UpdateOptions) {
  const restData = await fetchRestCountries(opts);
  const { ordered, restById } = buildCountries(restData, opts);

  let enriched = ordered;
  enriched = await enrichEconomicsFromWorldBank(enriched, opts);
  enriched = await enrichFromWikidata(enriched, opts);

  await maybeDownloadFlags(enriched, restById, opts);

  const { ptCountryNames, ptCapitalNames } = buildPortugueseMaps(enriched);
  printEnrichmentSummary(enriched);

  const content = formatCountriesTs(enriched, ptCountryNames, ptCapitalNames);
  if (!opts.dryRun) {
    fs.writeFileSync(opts.outPath, content);
     
    console.log(`✓ Updated ${opts.outPath}`);
  }
}

const isMain =
  typeof process.argv[1] === 'string' &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const opts = parseArgs();
  updateCountriesData(opts).catch((err) => {
     
    console.error(err);
    process.exit(1);
  });
}
