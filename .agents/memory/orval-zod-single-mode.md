---
name: Orval zod codegen single-mode output path
description: Where orval places the generated zod file when mode is "single"
---

When the orval zod config uses `mode: "single"` and `target: "generated/api"` (with workspace `lib/api-zod/src`), orval generates the file at:
  `lib/api-zod/src/generated/api/api.ts`

NOT at `lib/api-zod/src/generated/api.ts`.

**Why:** Orval treats the target as a directory name when mode is "single", creating `<target>/<target>.ts`.

**How to apply:** The `fix-zod-index.cjs` post-processing script must write:
  `export * from "./generated/api/api";`
in `lib/api-zod/src/index.ts` — not `./generated/api`.
