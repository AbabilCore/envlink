import { Command } from "commander";
import * as helper from "./helper";
import type { ICommandOptions } from "@/types";

export const init = (command: Command): void => {
  command
    .command("create")
    .description("Create a new EnvLink from local .env files")
    .option("--exp <duration>", "Set expiration (e.g., 5d, 30m, 1y, never)")
    .option("--exp-pass <password>", "Set expiration password")
    .action((options: ICommandOptions) => {
      helper.create(options);
    });

  command
    .command("install [id]")
    .description("Install environment files from an EnvLink")
    .option("-s, --select-files", "Manually select files to install")
    .action((id: string, options: ICommandOptions) => {
      helper.install(id, options);
    });

  command
    .command("info [id]")
    .description("Show EnvLink information (files, expiry, install count)")
    .action((id: string) => {
      helper.info(id);
    });

  command
    .command("expire [id]")
    .description("Manually expire an EnvLink")
    .option(
      "--exp-pass <password>",
      "Expiration password (if set during creation)",
    )
    .action((id: string, options: ICommandOptions) => {
      helper.expire(id, options);
    });

  command
    .command("update [id]")
    .description("Update an existing EnvLink")
    .option("--exp <duration>", "Update expiration (e.g., 5d, 30m, 1y, never)")
    .option("--exp-pass <password>", "Update expiration password")
    .option(
      "--current-pass <password>",
      "Current password (required for protected EnvLinks)",
    )
    .option("-f, --files", "Update files from current directory")
    .action((id: string, options: ICommandOptions) => {
      helper.update(id, options);
    });
};
