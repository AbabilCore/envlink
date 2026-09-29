import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import colors from "colors";
import { hashPasswordDeterministic } from "@/lib/auth";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

export const install = async (
  id: string,
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    if (!id) {
      utils.logger.error("EnvLink ID is required", {
        terminate: true,
        code: 1,
      });
      return;
    }

    let password = options.pass;
    if (!password) {
      const { pwd } = await inquirer.prompt<{ pwd: string }>([
        {
          type: "password",
          name: "pwd",
          message: "Enter password:",
          mask: "*",
          validate: (input: string) => {
            if (!input || input.length === 0) {
              return "Password is required";
            }
            return true;
          },
        },
      ]);
      password = pwd;
    }

    utils.logger.start(`Fetching EnvLink ${id}...`);
    const passwordHash = hashPasswordDeterministic(password);
    const response =
      await utils.apiClient.authenticated<types.IInstallEnvLinkResponse>(
        "POST",
        `/envlinks/${id}/install`,
        id,
        passwordHash,
      );

    const { encryptedData } = response.data;

    if (!encryptedData) {
      utils.logger.error("No encrypted payload found in this EnvLink", {
        terminate: true,
        code: 1,
      });
      return;
    }

    const { decrypt } = await import("@/lib/crypto");
    const files: types.IEnvFile[] = JSON.parse(
      await decrypt(JSON.parse(encryptedData), password),
    );

    if (!files || files.length === 0) {
      utils.logger.error("No files found in this EnvLink", {
        terminate: true,
        code: 1,
      });
      return;
    }

    utils.logger.success(`Found ${files.length} file(s)\n`);

    const cwd = process.cwd();
    const conflicts: string[] = [];
    files.forEach((file: types.IEnvFile) => {
      const filePath = path.join(cwd, file.name);
      if (fs.existsSync(filePath)) {
        conflicts.push(file.name);
      }
    });

    let selectedFiles = files;

    if (options.selectFiles || conflicts.length > 0) {
      const choices: Array<{ name: string; value: string; checked: boolean }> =
        files.map((file: types.IEnvFile) => {
          const hasConflict = conflicts.includes(file.name);
          return {
            name: hasConflict
              ? `${file.name} (exists - will overwrite)`
              : file.name,
            value: file.name,
            checked: true,
          };
        });

      const { selected } = await inquirer.prompt<{ selected: string[] }>([
        {
          type: "checkbox",
          name: "selected",
          message: "Select files to install:",
          choices,
          validate: (answer: string[]) => {
            if (answer.length === 0) {
              return "You must select at least one file.";
            }
            return true;
          },
        },
      ]);

      selectedFiles = files.filter((f: types.IEnvFile) =>
        selected.includes(f.name),
      );
    }

    utils.logger.log("\nFiles to install:");
    selectedFiles.forEach((file: types.IEnvFile) => {
      const exists = conflicts.includes(file.name);
      utils.logger.log(
        `  ${exists ? ICONS.WARNING : ICONS.CHECK_MARK} ${exists ? colors.yellow(file.name) : colors.cyan(file.name)}${exists ? colors.yellow(" (will overwrite)") : ""}`,
      );
    });

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "\nProceed with installation?",
        default: true,
      },
    ]);

    if (!confirm) {
      utils.logger.warn("Installation cancelled.");
      return;
    }

    utils.logger.start("Installing files...");
    selectedFiles.forEach((file: types.IEnvFile) => {
      const filePath = path.join(cwd, file.name);
      fs.writeFileSync(filePath, file.content, "utf-8");
    });

    utils.logger.success("Installation complete!\n");
    utils.logger.log(
      colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.SUCCESS} ${colors.green(`Successfully installed ${selectedFiles.length} file(s)!`)}`,
    );
    utils.logger.log(
      colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(`\n${ICONS.FILE} ${colors.bold("Installed files:")}`);
    selectedFiles.forEach((file: types.IEnvFile) => {
      utils.logger.log(`   ${ICONS.BULLET} ${colors.cyan(file.name)}`);
    });
    utils.logger.log("");
  } catch (error: unknown) {
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
