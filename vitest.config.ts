import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  // Unit tests never touch CSS — bypass the Tailwind PostCSS config
  // (its v4 string-plugin format trips the Vite version bundled with Vitest).
  css: { postcss: { plugins: [] } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
