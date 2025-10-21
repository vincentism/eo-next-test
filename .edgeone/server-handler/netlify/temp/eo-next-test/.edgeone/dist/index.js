
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "./esm-chunks/chunk-6BT4RYQJ.js";

// src/index.ts
import { rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { copyPrerenderedContent } from "./build/content/prerendered.js";
import {
  copyStaticAssets,
  copyStaticContent,
  copyStaticExport
} from "./build/content/static.js";
import { createServerHandler } from "./build/functions/server.js";
import { PluginContext } from "./build/plugin-context.js";
import { createRouteMeta } from "./build/routes.js";
var onPreBuild = async (options) => {
  process.env.NEXT_PRIVATE_STANDALONE = "true";
};
var onBuild = async (options) => {
  const ctx = new PluginContext(options);
  await rm(ctx.staticDir, { recursive: true, force: true });
  if (existsSync(ctx.serverHandlerDir)) {
    await rm(ctx.serverHandlerDir, { recursive: true, force: true });
  }
  if (ctx.buildConfig.output === "export") {
    return Promise.all([copyStaticExport(ctx)]);
  }
  await copyStaticAssets(ctx);
  await Promise.all([
    // copyStaticAssets(ctx),
    copyStaticContent(ctx),
    copyPrerenderedContent(ctx),
    createServerHandler(ctx)
  ]);
  createRouteMeta(ctx);
};
var onPostBuild = async (options) => {
  console.log("onPostBuild");
  const ctx = new PluginContext(options);
};
export {
  onBuild,
  onPostBuild,
  onPreBuild
};
