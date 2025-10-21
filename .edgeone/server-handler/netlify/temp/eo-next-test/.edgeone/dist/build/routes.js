
      var require = await (async () => {
        var { createRequire } = await import("node:module");
        return createRequire(import.meta.url);
      })();
    
import "../esm-chunks/chunk-6BT4RYQJ.js";

// src/build/routes.ts
import * as fs from "fs";
import * as path from "path";
var convertNextRoutePattern = (path2) => {
  if (!path2.includes("[")) {
    return path2;
  }
  let convertedPath = path2;
  const optionalCatchAllMatch = path2.match(/\[\[\.\.\.([^\]]+)\]\]/);
  if (optionalCatchAllMatch) {
    const paramName = optionalCatchAllMatch[1];
    convertedPath = convertedPath.replace(/\[\[\.\.\.([^\]]+)\]\]/g, `:${paramName}*?`);
  }
  const catchAllMatch = path2.match(/\[\.\.\.([^\]]+)\]/);
  if (catchAllMatch) {
    const paramName = catchAllMatch[1];
    convertedPath = convertedPath.replace(/\[\.\.\.([^\]]+)\]/g, `:${paramName}*`);
  }
  const dynamicMatch = path2.match(/\[([^\]]+)\]/);
  if (dynamicMatch) {
    const paramName = dynamicMatch[1];
    convertedPath = convertedPath.replace(/\[([^\]]+)\]/g, `:${paramName}`);
  }
  return convertedPath;
};
var createRouteMeta = async (ctx) => {
  const routeMap = {};
  const manifest = await ctx.getPrerenderManifest();
  if (manifest?.routes) {
    for (const [route, routeInfo] of Object.entries(manifest.routes)) {
      routeMap[route] = {
        // 提取关键信息到routeMap
        isStatic: routeInfo.initialRevalidateSeconds === false,
        initialRevalidateSeconds: routeInfo.initialRevalidateSeconds || void 0,
        srcRoute: routeInfo.srcRoute || void 0,
        dataRoute: routeInfo.dataRoute || void 0
      };
    }
  }
  const pagesManifest = await ctx.getPagesManifest();
  if (pagesManifest) {
    for (const [route, filePath] of Object.entries(pagesManifest)) {
      if (!routeMap[route]) {
        routeMap[route] = {};
      }
      if (filePath.startsWith("pages") && filePath.endsWith(".html")) {
        routeMap[route].isStatic = true;
      }
    }
  }
  const appPathRoutesManifest = await ctx.getAppPathRoutesManifest();
  if (appPathRoutesManifest) {
    for (const [route, actualRoute] of Object.entries(appPathRoutesManifest)) {
      if (!routeMap[actualRoute]) {
        routeMap[actualRoute] = {};
      }
    }
  }
  const routesManifest = await ctx.getRoutesManifest();
  if (routesManifest) {
    const dataRoutes = routesManifest.dataRoutes;
    for (const { page, dataRouteRegex } of dataRoutes) {
      routeMap[dataRouteRegex] = {
        isStatic: routeMap[page]?.isStatic || false
      };
    }
  }
  const imagesManifest = await ctx.getImagesManifest();
  if (imagesManifest) {
    if (imagesManifest.images) {
      const imageConfig = imagesManifest.images;
      routeMap[imageConfig.path] = {};
    }
  }
  const convertedRouteMap = {};
  const pathsToDelete = [];
  for (const [routePath, routeConfig] of Object.entries(routeMap)) {
    const convertedPath = convertNextRoutePattern(routePath);
    if (convertedPath !== routePath) {
      pathsToDelete.push(routePath);
      convertedRouteMap[convertedPath] = routeConfig;
    }
  }
  for (const pathToDelete of pathsToDelete) {
    delete routeMap[pathToDelete];
  }
  Object.assign(routeMap, convertedRouteMap);
  const routesArray = Object.entries(routeMap).map(([path2, config]) => ({
    path: path2,
    ...config
  }));
  const edgeOneDir = path.join(process.cwd(), ".edgeone");
  if (!fs.existsSync(edgeOneDir)) {
    fs.mkdirSync(edgeOneDir, { recursive: true });
  }
  const metaFilePath = path.join(edgeOneDir, "meta.json");
  let existingMetaData = {};
  if (fs.existsSync(metaFilePath)) {
    try {
      const existingContent = fs.readFileSync(metaFilePath, "utf-8");
      existingMetaData = JSON.parse(existingContent);
    } catch (error) {
      console.warn("Failed to parse existing meta.json:", error);
    }
  }
  const mergedMetaData = {
    ...existingMetaData,
    nextRoutes: routesArray
  };
  fs.writeFileSync(
    metaFilePath,
    JSON.stringify(mergedMetaData, null, 2),
    "utf-8"
  );
};
export {
  convertNextRoutePattern,
  createRouteMeta
};
