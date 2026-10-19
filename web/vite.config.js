import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { THUMBS } from "./src/data.js";

/* After the build, write sw.js with the list of files the app needs to start offline. */
function serviceWorker() {
  let outDir;
  return {
    name: "edge-service-worker",
    apply: "build",
    configResolved(c) { outDir = c.build.outDir; },
    closeBundle() {
      const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : [p];
      });
      const files = walk(outDir)
        .map(f => path.relative(outDir, f).split(path.sep).join("/"))
        .filter(f => !f.startsWith("s/") && !f.startsWith("download/") && f !== "sw.js" && !f.endsWith(".map"));
      const precache = ["./", ...files.map(f => "./" + f), ...THUMBS.map(t => "./" + t), "./s/hero.jpg"];
      const version = Date.now().toString(36);
      const tpl = fs.readFileSync(path.resolve("src/sw-template.js"), "utf8");
      fs.writeFileSync(path.join(outDir, "sw.js"),
        tpl.replace("__VERSION__", version).replace("__PRECACHE__", JSON.stringify(precache, null, 1)));
      console.log(`sw.js: ${precache.length} files precached, version ${version}`);
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), serviceWorker()],
  build: { outDir: "dist", assetsDir: "app", emptyOutDir: true }
});
