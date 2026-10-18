import path from "node:path";

export const BASE_DIR = path.resolve(__dirname, "../..");
export const CLI_PATH = path.resolve(BASE_DIR, "src/index.ts");
export const TSCONFIG_PATH = path.resolve(BASE_DIR, "tsconfig.json");

export const TSCONFIG_PATHS_REGISTER =
  require.resolve("tsconfig-paths/register");

export const TSX_CLI_PATH = path.resolve(
  BASE_DIR,
  "node_modules/tsx/dist/cli.mjs",
);
