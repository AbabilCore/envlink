import { Command } from "commander";
import * as helper from "./helper";
import type { ICommandOptions } from "@/types";
import handleCmdErr from "@/utils/command-error-handler";

export const create = (command: Command): void => {
  handleCmdErr(
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
  handleCmdErr(
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
  handleCmdErr(
    command
      .command("update [id]")
      .description("Update an existing EnvLink")
      .option(
        "--exp <duration>",
        "Update expiration (e.g., 30m, 24h, 5d, 6M, 1y, never)",
      )
      .option("--pass <password>", "New password")
      .option(
        "--current-pass <password>",
        "Current password (required for all updates)",
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
  handleCmdErr(
    command
      .command("info [id]")
      .description("Show EnvLink information (files, expiry, install count)")
      .action((id: string) => {
        helper.info(id);
      }),
    "info",
  );
};

export const expire = (command: Command) => {
  handleCmdErr(
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
