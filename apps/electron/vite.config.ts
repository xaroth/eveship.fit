import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const node = (input: string, format: "es" | "cjs", ext: string) => ({
  consumer: "server" as const,
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "node24",
    rolldownOptions: {
      input,
      output: { format, entryFileNames: `[name].${ext}` },
    },
  },
});

export default defineConfig({
  base: "./",
  builder: {},
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    {
      // In dev, React Refresh needs an inline script and Vite injects CSS as inline styles.
      name: "esf:dev-csp",
      apply: "serve",
      transformIndexHtml: (html) =>
        html.replace("script-src 'self'", "style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"),
    },
  ],
  environments: {
    client: { build: { outDir: "dist/renderer", target: "es2024" } },
    main: node("src/main/main.ts", "es", "mjs"),
  },
});
