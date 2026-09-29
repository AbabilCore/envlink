import inquirer from "inquirer";
import path from "path";
import colors from "colors";
import { hashPasswordDeterministic } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

interface IUpdateEnvLinkPayload extends Record<string, unknown> {
  encryptedData?: string;
  expirationDuration?: string;
  passwordHash?: string;
  reference?: string;
}

export const update = async (
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

    const hasUpdates =
      options.files || options.exp || options.pass !== undefined;

    if (!hasUpdates) {
      utils.logger.error(
        "No update options provided. Use --files, --exp, or --pass",
        { terminate: true, code: 1 },
      );
      return;
    }

    utils.logger.start(`Fetching EnvLink ${id}...`);
    let currentPassword = options.currentPass;
    if (!currentPassword) {
      utils.logger.error(
        "Current password is required for updates.\nUse: --current-pass <password>",
        {
          terminate: true,
          code: 1,
        },
      );
      return;
    }

    if (
      typeof currentPassword !== "string" ||
      currentPassword.trim().length === 0
    ) {
      utils.logger.error(
        "Invalid password provided. Password cannot be empty.",
        {
          terminate: true,
          code: 1,
        },
      );
      return;
    }

    const passwordHash = hashPasswordDeterministic(currentPassword);
    const infoResponse =
      await utils.apiClient.authenticated<types.IGetEnvLinkResponse>(
        "POST",
        `/envlinks/${id}/info`,
        id,
        passwordHash,
      );

    if (infoResponse.data.status === "expired") {
      utils.logger.error("Cannot update expired EnvLink", {
        terminate: true,
        code: 1,
      });
      return;
    }

    utils.logger.success("EnvLink found\n");

    const updateData: IUpdateEnvLinkPayload = {};

    if (options.files) {
      const cwd = process.cwd();
      const envFiles = utils.discoverEnvFiles(cwd);

      if (envFiles.length === 0) {
        utils.logger.error("No .env files found in the current directory.", {
          terminate: true,
          code: 1,
        });
        return;
      }

      const choices: Array<{ name: string; value: string }> = [
        ...envFiles.map((file) => ({ name: file, value: file })),
        { name: `${ICONS.CHECK_MARK} Select all`, value: "__SELECT_ALL__" },
      ];

      const { selectedFiles } = await inquirer.prompt<{
        selectedFiles: string[];
      }>([
        {
          type: "checkbox",
          name: "selectedFiles",
          message: "Select environment files to update:",
          choices,
          validate: (answer: string[]) => {
            if (answer.length === 0) {
              return "You must select at least one file.";
            }
            return true;
          },
        },
      ]);

      let filesToUpdate = selectedFiles;
      if (selectedFiles.includes("__SELECT_ALL__")) {
        filesToUpdate = envFiles;
      }

      const files: types.IEnvFile[] = filesToUpdate.map((filename) => ({
        name: filename,
        content: utils.readFileContent(path.join(cwd, filename)),
      }));

      const encryptionPassword = options.pass || currentPassword;

      updateData.encryptedData = JSON.stringify(
        await encrypt(JSON.stringify(files), encryptionPassword),
      );

      utils.logger.log("\nFiles to update:");
      filesToUpdate.forEach((file) =>
        utils.logger.log(`  ${ICONS.BULLET} ${colors.cyan(file)}`),
      );
    }

    if (options.exp) {
      updateData.expirationDuration = options.exp;
      utils.logger.log(
        `\n${colors.bold("New expiration:")} ${colors.yellow(options.exp)}`,
      );
    }

    if (options.pass !== undefined) {
      if (options.pass) {
        updateData.passwordHash = hashPasswordDeterministic(options.pass);
        utils.logger.log(
          `\n${colors.bold("New password:")} ${colors.green("Updated")}`,
        );
      } else {
        const { confirmRemove } = await inquirer.prompt<{
          confirmRemove: boolean;
        }>([
          {
            type: "confirm",
            name: "confirmRemove",
            message: "Remove password protection?",
            default: false,
          },
        ]);

        if (confirmRemove) {
          updateData.passwordHash = "";
          utils.logger.log(
            `\n${colors.bold("Password:")} ${colors.red("Removed")}`,
          );
        }
      }
    }

    if (options.ref) {
      updateData.reference = options.ref;
      utils.logger.log(
        `\n${colors.bold("Reference:")} ${colors.cyan(options.ref)}`,
      );
    }

    utils.logger.log("");

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Proceed with update?",
        default: false,
      },
    ]);

    if (!confirm) {
      utils.logger.warn("Update cancelled.");
      return;
    }

    utils.logger.start("Updating EnvLink...");

    const response =
      await utils.apiClient.authenticated<types.IUpdateEnvLinkResponse>(
        "PUT",
        `/envlinks/${id}`,
        id,
        passwordHash,
        updateData,
      );

    const expiryDate = utils.formatTimeForUser(response.data.expiresAt);

    utils.logger.success("EnvLink updated successfully!\n");
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}      ${colors.white(response.data.id)}`,
    );
    if (response.data.filesCount) {
      utils.logger.log(
        `  ${ICONS.FILE} ${colors.bold("Files:")}   ${colors.white(String(response.data.filesCount))}`,
      );
    }
    utils.logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")} ${colors.yellow(expiryDate)}`,
    );
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
  } catch (error: unknown) {
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
