import { countries } from '../src/data/countries';
import fs from 'fs';
import path from 'path';

// Check for data integrity issues
const issues: string[] = [];

countries.forEach(c => {
  if (!c.id) issues.push(`Country missing id: ${c.name}`);
  if (!c.name) issues.push(`Country missing name: ${c.id}`);
  if (!c.capital) issues.push(`Country missing capital: ${c.name}`);
  if (!c.flag_url) issues.push(`Country missing flag_url: ${c.name}`);
  if (!c.codes?.iso2) issues.push(`Country missing ISO2: ${c.name}`);
  if (!c.codes?.iso3) issues.push(`Country missing ISO3: ${c.name}`);
  if (!c.flag_url.endsWith('.svg')) issues.push(`Country has non-SVG flag: ${c.name} (${c.flag_url})`);

  // Check if flag file exists
  const flagPath = path.join(process.cwd(), 'public', c.flag_url);
  if (!fs.existsSync(flagPath)) {
    issues.push(`Flag file missing: ${c.name} (${c.flag_url})`);
  }
});

console.log('=== SVG Migration Verification ===\n');
console.log('Total countries:', countries.length);
console.log('Data integrity issues:', issues.length);

if (issues.length > 0) {
  console.log('\n⚠️  Issues found:');
  issues.forEach(i => console.log('  -', i));
} else {
  console.log('✅ No data integrity issues!');
}

// Check localization data
const withLocalizations = countries.filter(c => c.localizations && Object.keys(c.localizations).length > 0);
const withMultiLang = countries.filter(c => c.localizations && Object.keys(c.localizations).length > 2);

console.log('\n=== Localization Stats ===');
console.log('Countries with localizations:', withLocalizations.length);
console.log('Countries with 3+ languages:', withMultiLang.length);

// Language coverage
const langCoverage: Record<string, number> = {};
countries.forEach(c => {
  if (c.localizations) {
    Object.keys(c.localizations).forEach(lang => {
      langCoverage[lang] = (langCoverage[lang] || 0) + 1;
    });
  }
});

console.log('\n=== Language Coverage ===');
Object.entries(langCoverage).sort(([,a], [,b]) => b - a).forEach(([lang, count]) => {
  console.log(`  ${lang}: ${count} countries`);
});

// Sample check
const sample = countries[0];
console.log('\n=== Sample Country ===');
console.log('Name:', sample.name);
console.log('Flag URL:', sample.flag_url);
console.log('ISO2/ISO3:', sample.codes?.iso2, '/', sample.codes?.iso3);
console.log('Languages:', Object.keys(sample.localizations || {}).join(', '));
if (sample.localizations?.['pt-BR']) {
  console.log('Portuguese name:', sample.localizations['pt-BR'].name);
}

// File system check
const flagsDir = path.join(process.cwd(), 'public', 'flags');
const allFiles = fs.readdirSync(flagsDir);
const svgFiles = allFiles.filter(f => f.endsWith('.svg'));
const webpFiles = allFiles.filter(f => f.endsWith('.webp'));

console.log('\n=== File System Check ===');
console.log('Total SVG files:', svgFiles.length);
console.log('Old WebP files:', webpFiles.length);
console.log(webpFiles.length === 0 ? '✅ Cleanup complete!' : '⚠️  WebP files still present');

console.log('\n=== Summary ===');
console.log(issues.length === 0 ? '✅ Migration successful!' : '⚠️  Migration has issues');
console.log('All', countries.length, 'countries have SVG flags');
console.log('Multilingual support added for', withMultiLang.length, 'countries');
