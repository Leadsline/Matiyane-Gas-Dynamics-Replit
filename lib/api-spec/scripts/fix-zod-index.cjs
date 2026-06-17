#!/usr/bin/env node
// Post-processes the generated api-zod index.ts to ensure a clean single export.
const fs = require("fs");
const path = require("path");

const indexPath = path.resolve(__dirname, "../../../lib/api-zod/src/index.ts");
const correct = `export * from "./generated/api/api";\n`;
fs.writeFileSync(indexPath, correct, "utf8");
console.log("Patched api-zod/src/index.ts → export from ./generated/api/api");
