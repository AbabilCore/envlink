import inquirer from "inquirer";
import path from "path";
import colors from "colors";
import { encrypt } from "@/lib/crypto";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

interface ICreateOptionalPassPayload extends Record<string, unknown> {
  encryptedData: string;
  filesCount: number;
}

export const create = async (
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    const cwd = process.cwd();
    const envFiles = utils.discoverEnvFiles(cwd);

    if (envFiles.length === 0) {
      utils.logger.error("No .env files found in the current directory.", {
        terminate: true,
        code: 1,
      });
      return;
    }

    if (options.ref) {
      utils.logger.error(
        "References are not supported for optional-password EnvLinks.",
        {
          terminate: true,
          code: 1,
        },
      );
      return;
    }

    if (options.exp && options.exp !== "1h") {
      utils.logger.warn(
        "Expiration duration ignored: Optional-password EnvLinks have a fixed 1-hour expiration.",
      );
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
        message: "Select environment files:",
        choices,
        validate: (answer: string[]) => {
          if (answer.length === 0) {
            return "You must select at least one file.";
          }
          return true;
        },
      },
    ]);

    let filesToUpload = selectedFiles;

    if (selectedFiles.includes("__SELECT_ALL__")) {
      filesToUpload = envFiles;
    }

    utils.logger.log("\nEnvironment files:");
    filesToUpload.forEach((file) =>
      utils.logger.log(`  • ${colors.cyan(file)}`),
    );
    utils.logger.log(
      `\n${colors.bold("Expiration:")} ${colors.yellow("1h")} ${colors.gray("(fixed for optional-password EnvLinks)")}`,
    );
    utils.logger.log(
      `${colors.bold("Security:")} ${colors.yellow("Access key authentication")} ${colors.gray("(no password required)")}`,
    );
    utils.logger.log(
      `${colors.bold("Operations:")} ${colors.cyan("info, install, expire")} ${colors.gray("(update not supported)")}`,
    );
    utils.logger.log("");

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Create this optional-password EnvLink?",
        default: false,
      },
    ]);

    if (!confirm) {
      utils.logger.warn("Operation cancelled.");
      return;
    }

    utils.logger.start("Encrypting and uploading environment files...");

    const accessKey = utils.generateAccessKey();

    const files: types.IEnvFile[] = filesToUpload.map((filename) => ({
      name: filename,
      content: utils.readFileContent(path.join(cwd, filename)),
    }));

    const encryptedData = JSON.stringify(
      await encrypt(JSON.stringify(files), accessKey),
    );

    const requestPayload: ICreateOptionalPassPayload = {
      encryptedData,
      filesCount: filesToUpload.length,
    };

    const response = await utils.apiClient.post<types.ICreateEnvLinkResponse>(
      "/envlinks",
      requestPayload,
    );

    const extendedId = `${response.data.id}${accessKey}`;
    const expiryDate = utils.formatTimeForUser(response.data.expiresAt);

    utils.logger.success("Optional-password EnvLink created successfully!\n");
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}      ${colors.white(extendedId)}`,
    );
    utils.logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}   ${colors.white(String(filesToUpload.length))}`,
    );
    utils.logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")} ${colors.yellow(expiryDate)}`,
    );
    utils.logger.log(
      `  ${ICONS.LOCK} ${colors.bold("Type:")}    ${colors.green("Optional-password (access key)")}`,
    );
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
    utils.logger.log(
      `${ICONS.CLIPBOARD} ${colors.green.bold("Install command:")}\n`,
    );
    utils.logger.log(colors.cyan(`   npx envlink install ${extendedId}\n`));
    utils.logger.log(
      `${ICONS.INFO} ${colors.yellow.bold("Note:")} This EnvLink has a fixed 1-hour expiration and supports info, install & expire operations.`,
    );
  } catch (error: unknown) {
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
