import fs from 'fs';
import path from 'path';

type Options = {
  dir: string;
};

function printHelp() {
  console.log(`
Verify a flags directory contains only hashed SVG filenames.

Usage:
  tsx scripts/verify-flags-dir.ts [options]

Options:
  --dir <path>   Flags directory (default dist/flags)
  -h, --help     Show help
`);
}

function parseArgs(): Options {
  const argv = process.argv.slice(2);
  let dir = 'dist/flags';

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir' && argv[i + 1]) {
      dir = argv[++i];
    } else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${a}`);
    }
  }

  return { dir };
}

const opts = parseArgs();
const dir = path.isAbsolute(opts.dir) ? opts.dir : path.resolve(process.cwd(), opts.dir);

if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`✗ Flags directory not found: ${dir}`);
  process.exit(1);
}

const entries = fs.readdirSync(dir, { withFileTypes: true });
const svgFiles = entries
  .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.svg'))
  .map((e) => e.name);

const isHashed = (name: string) => /^[0-9a-f]{12}\.svg$/.test(name);
const invalid = svgFiles.filter((n) => !isHashed(n)).sort();

if (invalid.length) {
  console.error(`✗ Found non-hashed SVG filenames in ${dir}:`);
  for (const name of invalid.slice(0, 50)) console.error(`  - ${name}`);
  if (invalid.length > 50) console.error(`  ...and ${invalid.length - 50} more`);
  process.exit(1);
}

console.log(`✓ Verified ${dir}: ${svgFiles.length} SVGs, all hashed`);
