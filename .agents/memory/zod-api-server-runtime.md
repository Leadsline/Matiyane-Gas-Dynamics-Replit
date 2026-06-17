---
name: Zod runtime resolution in api-server
description: Why zod must be declared in api-server package.json even when externalized in esbuild
---

When esbuild externalizes a package (e.g. `"zod"`, `"zod/v4"`), Node.js ESM must resolve it at runtime relative to the output file (`dist/index.mjs`). If the package is only installed at the workspace root but NOT declared in `artifacts/api-server/package.json` dependencies, Node throws `ERR_MODULE_NOT_FOUND`.

**Why:** ESM resolution in pnpm workspaces is strict — packages must be listed in the consuming package's own `package.json` to be accessible from its dist folder.

**How to apply:** Any package that is externalized in `build.mjs` must also appear in `artifacts/api-server/package.json` dependencies. `zod: "catalog:"` is the correct entry.
