import AdmZip from "adm-zip";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const themeDir = join(__dirname, "../../scripts/wordpress-theme/matiyane-gas");
const outFile = join(__dirname, "../../matiyane-gas-wordpress-theme.zip");

const zip = new AdmZip();

function addDir(dir, zipBase) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const zipPath = join(zipBase, entry);
    if (statSync(full).isDirectory()) {
      addDir(full, zipPath);
    } else {
      zip.addLocalFile(full, zipPath.replace(/[^/]+$/, "").replace(/\/$/, "") || "");
    }
  }
}

addDir(themeDir, "matiyane-gas");
zip.writeZip(outFile);
console.log("Created:", outFile);
