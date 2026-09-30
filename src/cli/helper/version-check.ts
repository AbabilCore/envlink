import colors from "colors";
import https from "https";
import { ICONS } from "@/constants/icons";
import pkg from "@/constants/pkg";
import * as utils from "@/utils";

interface INpmPackageInfo {
  "dist-tags": {
    latest: string;
  };
}

async function fetchLatestVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      "https://registry.npmjs.org/envlink",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "envlink-cli",
        },
        timeout: 10000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const npmData: INpmPackageInfo = JSON.parse(data);
            resolve(npmData["dist-tags"].latest);
          } catch (error) {
            reject(new Error("Failed to parse NPM response"));
          }
        });
      },
    );

    req.on("error", (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

export async function checkForUpdates(force = false): Promise<void> {
  try {
    const currentVersion = pkg.version;

    const latestVersion = await fetchLatestVersion();

    const hasUpdate = compareVersions(currentVersion, latestVersion);

    if (hasUpdate) {
      showUpdateMessage(currentVersion, latestVersion);
    } else if (force) {
      utils.logger.log("");
      utils.logger.log(
        colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
      );
      utils.logger.log(
        `  ${ICONS.SUCCESS} ${colors.green.bold("You're up to date!")}`,
      );
      utils.logger.log(
        `  ${colors.gray("Current version:")} ${colors.cyan(currentVersion)}`,
      );
      utils.logger.log(
        colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
      );
      utils.logger.log("");
    }
  } catch (error) {
    if (force) {
      utils.logger.error(
        `Version check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          terminate: false,
          code: 0,
        },
      );
    }
  }
}

function showUpdateMessage(current: string, latest: string): void {
  utils.logger.log("");
  utils.logger.log(
    colors.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
  );
  utils.logger.log(
    `  ${ICONS.WARNING} ${colors.yellow.bold("Update Available!")}`,
  );
  utils.logger.log(
    `  ${colors.gray("Current:")} ${colors.red(current)} ${colors.gray("→")} ${colors.gray("Latest:")} ${colors.green(latest)}`,
  );
  utils.logger.log(
    `  ${colors.cyan("Run:")} ${colors.white.bold("npm install -g envlink@latest")}`,
  );
  utils.logger.log(
    colors.yellow("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
  );
  utils.logger.log("");
}

export function compareVersions(current: string, latest: string): boolean {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;

    if (currentPart < latestPart) return true;
    if (currentPart > latestPart) return false;
  }

  return false;
}

export const versionCheck = async (): Promise<void> => {
  try {
    utils.logger.log("Starting version check...");
    await checkForUpdates(true);
    utils.logger.log("Version check completed");
  } catch (error: unknown) {
    utils.logger.error(
      `Version check failed: ${utils.getErrorMessage(error)}`,
      {
        terminate: true,
        code: 1,
      },
    );
  }
};
