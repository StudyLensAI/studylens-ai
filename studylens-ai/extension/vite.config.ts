import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import ts from "typescript";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "prepare-extension",
      closeBundle() {
        const out = resolve(__dirname, "dist");
        if (!existsSync(out)) mkdirSync(out, { recursive: true });

        copyFileSync(resolve(__dirname, "manifest.json"), resolve(out, "manifest.json"));

        const source = readFileSync(resolve(__dirname, "src/background.ts"), "utf8");
        const compiled = ts.transpileModule(source, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.None
          }
        }).outputText;

        writeFileSync(resolve(out, "background.js"), compiled);
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/sidepanel/index.html")
    }
  }
});
