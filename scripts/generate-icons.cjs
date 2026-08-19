const sharp = require("sharp");
const path = require("path");

const root = process.cwd();
const src = path.join(root, "public", "icons", "icon.svg");
const outDir = path.join(root, "public", "icons");

async function main() {
  await sharp(src).resize(192, 192).png().toFile(path.join(outDir, "icon-192.png"));
  await sharp(src).resize(512, 512).png().toFile(path.join(outDir, "icon-512.png"));

  const maskable = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#181d26"/>
  <path transform="translate(56 56) scale(0.78)" d="M256 96c-16 32-24 56-32 80-28 82-88 128-88 192 0 66 54 120 120 120s120-54 120-120c0-64-60-110-88-192-8-24-16-48-32-80z" fill="#ffffff"/>
</svg>`);
  await sharp(maskable).resize(512, 512).png().toFile(path.join(outDir, "icon-maskable-512.png"));

  console.log("Icons generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});