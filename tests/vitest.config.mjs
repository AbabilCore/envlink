import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    fileParallelism: false,
    setupFiles: [path.resolve(testsDir, "setup.ts")],
    include: [path.resolve(testsDir, "test/**/*.test.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["../src/**/*.ts"],
      exclude: ["../src/**/*.d.ts", "../src/types/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(testsDir),
    },
  },
});
