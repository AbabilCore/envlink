import inquirer from "inquirer";
import path from "path";
import colors from "colors";
import { encrypt } from "@/lib/crypto";
import { hashPasswordDeterministic } from "@/lib/auth";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

interface ICreateEnvLinkPayload extends Record<string, unknown> {
  encryptedData: string;
  passwordHash: string;
  expirationDuration: string;
  reference?: string;
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

    let expiration = options.exp;

    if (!expiration) {
      const answer = await inquirer.prompt<{ expiration: string }>([
        {
          type: "input",
          name: "expiration",
          message: "Expiration duration (30m, 24h, 5d, 6M, 1y, never):",
          default: "1d",
        },
      ]);
      expiration = answer.expiration;
    }

    let password: string;

    if (options.pass === true) {
      const { pwd, confirmPwd } = await inquirer.prompt<{
        pwd: string;
        confirmPwd: string;
      }>([
        {
          type: "password",
          name: "pwd",
          message: "Enter password (required for encryption):",
          mask: "*",
          validate: (input: string) => {
            if (!input || input.length === 0) {
              return "Password is required";
            }
            return true;
          },
        },
        {
          type: "password",
          name: "confirmPwd",
          message: "Confirm password:",
          mask: "*",
        },
      ]);

      if (pwd !== confirmPwd) {
        utils.logger.error("Passwords do not match.", {
          terminate: true,
          code: 1,
        });
        return;
      }

      password = pwd;
    } else {
      password = options.pass as string;
    }

    let reference = options.ref;

    if (!reference) {
      const answer = await inquirer.prompt<{ ref: string }>([
        {
          type: "input",
          name: "ref",
          message: "Reference label (optional, e.g., 'prod-api-keys'):",
        },
      ]);
      reference = answer.ref || undefined;
    }

    utils.logger.log("\nEnvironment files:");
    filesToUpload.forEach((file) =>
      utils.logger.log(`  • ${colors.cyan(file)}`),
    );
    utils.logger.log(
      `\n${colors.bold("Expiration:")} ${colors.yellow(expiration)}`,
    );
    if (reference) {
      utils.logger.log(
        `${colors.bold("Reference:")} ${colors.cyan(reference)}`,
      );
    }
    utils.logger.log("");

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Create this EnvLink?",
        default: false,
      },
    ]);

    if (!confirm) {
      utils.logger.warn("Operation cancelled.");
      return;
    }

    utils.logger.start("Encrypting and uploading environment files...");
    const files: types.IEnvFile[] = filesToUpload.map((filename) => ({
      name: filename,
      content: utils.readFileContent(path.join(cwd, filename)),
    }));

    const encryptedData = JSON.stringify(
      await encrypt(JSON.stringify(files), password),
    );

    const passwordHash = hashPasswordDeterministic(password);

    const requestPayload: ICreateEnvLinkPayload = {
      encryptedData,
      passwordHash,
      expirationDuration: expiration,
      filesCount: filesToUpload.length,
    };

    if (reference && reference.trim() !== "") {
      requestPayload.reference = reference;
    }

    const response = await utils.apiClient.post<types.ICreateEnvLinkResponse>(
      "/envlinks",
      requestPayload,
    );

    const expiryDate = utils.formatTimeForUser(response.data.expiresAt);

    utils.logger.success("EnvLink created successfully!\n");
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}      ${colors.white(response.data.id)}`,
    );
    utils.logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}   ${colors.white(String(filesToUpload.length))}`,
    );
    utils.logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")} ${colors.yellow(expiryDate)}`,
    );
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
    utils.logger.log(
      `${ICONS.CLIPBOARD} ${colors.green.bold("Install command:")}\n`,
    );
    utils.logger.log(
      colors.cyan(`   npx envlink install ${response.data.id}\n`),
    );
  } catch (error: unknown) {
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
