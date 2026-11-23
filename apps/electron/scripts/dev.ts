import { spawn } from "node:child_process";
import path from "node:path";

import electron from "electron";
import { createBuilder, createServer } from "vite";

const root = path.join(import.meta.dirname, "..");

// Created before the build: a build sets NODE_ENV to production, which turns off React Refresh.
const server = await createServer({ root });
// Before warming: the dependency optimizer starts with the server, and transforms wait on it.
await server.listen();

const client = server.environments.client;
const warmed = new Set<string>();

/** Transforms `url` and all it imports up front, so the window's first load doesn't wait on each module. */
async function warm(url: string): Promise<void> {
  // Dependencies are prebundled and fast already; the dogma engine's WebAssembly glue fails outside the page.
  if (warmed.has(url) || url.includes("/node_modules/")) return;
  warmed.add(url);
  await client.transformRequest(url);
  const module = await client.moduleGraph.getModuleByUrl(url);
  await Promise.all([...(module?.importedModules ?? [])].map((imported) => warm(imported.url)));
}

const builder = await createBuilder({ root });
await Promise.all([
  warm("/src/renderer/main.tsx"),
  ...Object.values(builder.environments)
    .filter((environment) => environment.name !== "client")
    .map((environment) => builder.build(environment)),
]);

server.printUrls();

// Editors built on Electron, like VS Code, set this for their terminals; it would start Electron as Node.
const { ELECTRON_RUN_AS_NODE: _, ...env } = process.env;
const app = spawn(electron as unknown as string, [root], {
  stdio: "inherit",
  env: { ...env, ESF_DEV_SERVER_URL: server.resolvedUrls!.local[0] },
});
app.on("exit", (code) => {
  void server.close().then(() => process.exit(code ?? 0));
});
