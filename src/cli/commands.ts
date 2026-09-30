import { Command } from "commander";
import type { ICommandOptions } from "@/types";
import * as utils from "@/utils";
import * as helper from "./helper";

export const create = (command: Command): void => {
  utils.handleCmdErr(
    command
      .command("create")
      .description("Create a new EnvLink from local .env files")
      .option(
        "--exp <duration>",
        "Set expiration (e.g., 30m, 24h, 5d, 6M, 1y, never)",
      )
      .option("--pass <password>", "Set password (required for encryption)")
      .option(
        "--ref <reference>",
        "Set reference label (e.g., 'prod-api-keys')",
      )
      .option(
        "--optional-pass",
        "Create optional-password EnvLink (1h expiration, info+install only)",
      )
      .action((options: ICommandOptions) => {
        if (options.optionalPass) {
          helper.optionalPass.create(options);
        } else {
          helper.create(options);
        }
      }),
    "create",
  );
};

export const install = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("install [id]")
      .description("Install environment files from an EnvLink")
      .option("-s, --select-files", "Manually select files to install")
      .option(
        "--pass <password>",
        "Password for decryption (optional for optional-password EnvLinks)",
      )
      .action((id: string, options: ICommandOptions) => {
        const parsed = utils.parseEnvLinkId(id);

        if (parsed.isOptionalPass) {
          helper.optionalPass.install(id, options);
        } else {
          helper.install(id, options);
        }
      }),
    "install",
  );
};

export const update = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("update [id]")
      .description("Update an existing EnvLink")
      .option(
        "--exp <duration>",
        "Update expiration (e.g., 30m, 24h, 5d, 6M, 1y, never)",
      )
      .option("--pass <password>", "New password")
      .requiredOption(
        "--current-pass <password>",
        "Current password (required for authentication)",
      )
      .option("--ref <reference>", "Update reference label")
      .option("-f, --files", "Update files from current directory")
      .action((id: string, options: ICommandOptions) => {
        helper.update(id, options);
      }),
    "update",
  );
};

export const info = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("info [id]")
      .description("Show EnvLink information (files, expiry, install count)")
      .option(
        "--pass <password>",
        "Password for decryption (optional for optional-password EnvLinks)",
      )
      .action((id: string, options: ICommandOptions) => {
        const parsed = utils.parseEnvLinkId(id);

        if (parsed.isOptionalPass) {
          helper.optionalPass.info(id);
        } else {
          helper.info(id, options);
        }
      }),
    "info",
  );
};

export const expire = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("expire [id]")
      .description("Manually expire an EnvLink")
      .option(
        "--pass <password>",
        "Password (optional for optional-password EnvLinks)",
      )
      .action((id: string, options: ICommandOptions) => {
        const parsed = utils.parseEnvLinkId(id);

        if (parsed.isOptionalPass) {
          helper.optionalPass.expire(id);
        } else {
          helper.expire(id, options);
        }
      }),
    "expire",
  );
};

export const versionCheck = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("version-check")
      .alias("check-update")
      .description("Check for available updates")
      .action(() => {
        helper.versionCheck();
      }),
    "version-check",
  );
};
