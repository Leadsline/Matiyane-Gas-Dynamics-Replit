import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "node:fs/promises";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "../..");

const sharedExternals = [
  "*.node",
  "sharp",
  "better-sqlite3",
  "sqlite3",
  "canvas",
  "bcrypt",
  "argon2",
  "fsevents",
  "re2",
  "farmhash",
  "xxhash-addon",
  "bufferutil",
  "utf-8-validate",
  "ssh2",
  "cpu-features",
  "dtrace-provider",
  "isolated-vm",
  "lightningcss",
  "oracledb",
  "mongodb-client-encryption",
  "handlebars",
  "knex",
  "typeorm",
  "protobufjs",
  "onnxruntime-node",
  "@tensorflow/*",
  "@prisma/client",
  "@mikro-orm/*",
  "@grpc/*",
  "@swc/*",
  "@aws-sdk/*",
  "@azure/*",
  "@opentelemetry/*",
  "@google-cloud/*",
  "@google/*",
  "googleapis",
  "firebase-admin",
  "@parcel/watcher",
  "@sentry/profiling-node",
  "@tree-sitter/*",
  "aws-sdk",
  "classic-level",
  "dd-trace",
  "ffi-napi",
  "grpc",
  "hiredis",
  "kerberos",
  "leveldown",
  "miniflare",
  "mysql2",
  "newrelic",
  "odbc",
  "piscina",
  "realm",
  "ref-napi",
  "rocksdb",
  "sass-embedded",
  "sequelize",
  "serialport",
  "snappy",
  "tinypool",
  "usb",
  "workerd",
  "wrangler",
  "zeromq",
  "zeromq-prebuilt",
  "playwright",
  "puppeteer",
  "puppeteer-core",
  "electron",
  "zod",
  "zod/v4",
];

const nodeBanner = {
  js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
};

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  // Build 1: Node.js server (local dev + standalone deployment)
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [...sharedExternals, "nodemailer", "pg-native"],
    sourcemap: "linked",
    banner: { js: nodeBanner.js },
  });

  // Build 2: Vercel Node.js serverless function
  const vercelOutDir = path.resolve(repoRoot, "api");
  await mkdir(vercelOutDir, { recursive: true });
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/vercel.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: path.resolve(vercelOutDir, "index.mjs"),
    logLevel: "info",
    external: [...sharedExternals, "nodemailer", "pg-native"],
    sourcemap: false,
    banner: { js: nodeBanner.js },
  });

  // Build 3: Cloudflare Pages Function
  const cfFunctionsDir = path.resolve(repoRoot, "artifacts/matiyane-gas/functions/api");
  await mkdir(cfFunctionsDir, { recursive: true });
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/worker.ts")],
    platform: "browser",
    conditions: ["worker", "browser"],
    bundle: true,
    format: "esm",
    outfile: path.resolve(cfFunctionsDir, "[[route]].js"),
    logLevel: "info",
    external: [
      "nodemailer",
      "pg",
      "pg-native",
      "pg-cloudflare",
      "zod",
      "zod/v4",
    ],
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env": "{}",
    },
    sourcemap: false,
  });

  console.log("✓ All builds complete");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
