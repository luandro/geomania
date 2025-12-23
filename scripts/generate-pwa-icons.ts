import { mkdirSync } from "fs";
import path from "path";
import sharp from "sharp";

const inputSvg = path.resolve("public", "kuromi.svg");
const outDir = path.resolve("public", "icons");
mkdirSync(outDir, { recursive: true });

const background = { r: 12, g: 8, b: 18, alpha: 1 };

const makeIcon = async (size: number, filename: string) => {
  await sharp(inputSvg, { density: 512 })
    .resize(size, size, { fit: "contain", background })
    .png()
    .toFile(path.join(outDir, filename));
};

const makeMaskable = async (size: number, filename: string) => {
  const safeSize = Math.round(size * 0.8);
  const icon = await sharp(inputSvg, { density: 512 })
    .resize(safeSize, safeSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(path.join(outDir, filename));
};

const run = async () => {
  await makeIcon(192, "icon-192.png");
  await makeIcon(512, "icon-512.png");
  await makeIcon(180, "apple-touch-icon.png");
  await makeMaskable(512, "maskable-512.png");
  await makeMaskable(192, "maskable-192.png");
  console.log(`Generated PWA icons in ${outDir}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
