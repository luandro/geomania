import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { countries as sourceCountries } from '@/data/countries';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'flags');
const WIDTH = 80; // target width in px
const QUALITY = 75; // WebP quality

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

async function downloadAndConvert(url: string, outPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).resize({ width: WIDTH }).webp({ quality: QUALITY }).toFile(outPath);
}

async function run() {
  ensureDir(OUTPUT_DIR);

  for (const country of sourceCountries) {
    const slug = slugify(country.name);
    const out = path.join(OUTPUT_DIR, `${slug}.webp`);

    if (fs.existsSync(out)) {
      console.log(`✓ exists ${out}`);
      continue;
    }

    try {
      console.log(`→ fetching ${country.flag_url} -> ${out}`);
      await downloadAndConvert(country.flag_url, out);
    } catch (err) {
      console.error(`✗ failed ${country.name}:`, err);
    }
  }

  // Rewrite dataset to point to local assets
  const newCountries = sourceCountries.map((c) => {
    const slug = slugify(c.name);
    return {
      ...c,
      id: slug,
      flag_url: `/flags/${slug}.webp`,
    };
  });

  const content = `import { Country } from '@/types/quiz';\n\n` +
    `export const countries: Country[] = ${JSON.stringify(newCountries, null, 2)};\n`;

  fs.writeFileSync(path.resolve(process.cwd(), 'src/data/countries.ts'), content);
  console.log('✓ Updated src/data/countries.ts to reference local flag assets');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
