// Materializes src-tauri/icons/icon.ico from its committed base64 text form.
//
// Why this exists: this repo's icon assets are binary files. They're stored
// here as plain base64 text (safe to commit through any text-only channel)
// and decoded back to real binary on `npm install` via the "postinstall"
// script in package.json. This is a no-op if the icon is already present
// and up to date.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "src-tauri", "icons");
const base64Path = join(iconsDir, "icon.ico.base64");
const icoPath = join(iconsDir, "icon.ico");

const base64 = readFileSync(base64Path, "utf8").trim();
const bytes = Buffer.from(base64, "base64");

if (existsSync(icoPath) && Buffer.compare(readFileSync(icoPath), bytes) === 0) {
  process.exit(0);
}

writeFileSync(icoPath, bytes);
console.log("Generated src-tauri/icons/icon.ico");
