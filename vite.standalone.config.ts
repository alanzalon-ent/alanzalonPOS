// Standalone build config — no Lovable packages. Used by `build:node` / `start`.
// The default vite.config.ts (Lovable wrapper) stays in place for the Lovable preview/publish.
// Plugin order mirrors @lovable.dev/vite-tanstack-config 2.27.2.
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({ server: { entry: "server" } }),
    nitro({ preset: "node-server" }),
    viteReact(),
  ],
});
