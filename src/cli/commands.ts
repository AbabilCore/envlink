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
      .action((options: ICommandOptions) => {
        helper.create(options);
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
      .option("--pass <password>", "Password for decryption (required)")
      .action((id: string, options: ICommandOptions) => {
        helper.install(id, options);
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
      .option("--pass <password>", "Password for decryption (required)")
      .action((id: string, options: ICommandOptions) => {
        helper.info(id, options);
      }),
    "info",
  );
};

export const expire = (command: Command) => {
  utils.handleCmdErr(
    command
      .command("expire [id]")
      .description("Manually expire an EnvLink")
      .option("--pass <password>", "Password (required)")
      .action((id: string, options: ICommandOptions) => {
        helper.expire(id, options);
      }),
    "expire",
  );
};
