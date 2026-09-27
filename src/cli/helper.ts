import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import colors from "colors";
import logger from "@/utils/logger";
import apiClient from "@/utils/api-client";
import { discoverEnvFiles, readFileContent } from "@/utils/file-discovery";
import { formatTimeForUser, getErrorMessage } from "@/utils/helpers";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";

export const create = async (
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    const cwd = process.cwd();
    const envFiles = discoverEnvFiles(cwd);

    if (envFiles.length === 0) {
      logger.error("No .env files found in the current directory.", {
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

    let password = options.pass;
    if (!password) {
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
        logger.error("Passwords do not match.", { terminate: true, code: 1 });
        return;
      }

      password = pwd;
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

    logger.log("\nEnvironment files:");
    filesToUpload.forEach((file) => logger.log(`  • ${colors.cyan(file)}`));
    logger.log(`\n${colors.bold("Expiration:")} ${colors.yellow(expiration)}`);
    if (reference) {
      logger.log(`${colors.bold("Reference:")} ${colors.cyan(reference)}`);
    }
    logger.log("");

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Create this EnvLink?",
        default: false,
      },
    ]);

    if (!confirm) {
      logger.warn("Operation cancelled.");
      return;
    }

    logger.start("Uploading environment files...");
    const files: types.IEnvFile[] = filesToUpload.map((filename) => ({
      name: filename,
      content: readFileContent(path.join(cwd, filename)),
    }));

    const response = await apiClient.post<types.ICreateEnvLinkResponse>(
      "/envlinks",
      {
        files,
        expirationDuration: expiration,
        password,
        reference,
      },
    );

    const expiryDate = formatTimeForUser(response.data.expiresAt);

    logger.success("EnvLink created successfully!\n");
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}      ${colors.white(response.data.id)}`,
    );
    logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}   ${colors.white(String(response.data.filesCount))}`,
    );
    logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")} ${colors.yellow(expiryDate)}`,
    );
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
    logger.log(`${ICONS.CLIPBOARD} ${colors.green.bold("Install command:")}\n`);
    logger.log(colors.cyan(`   npx envlink install ${response.data.id}\n`));
  } catch (error: unknown) {
    logger.error(`Failed to create EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};

export const install = async (
  id: string,
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    if (!id) {
      logger.error("EnvLink ID is required", { terminate: true, code: 1 });
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

    logger.start(`Fetching EnvLink ${id}...`);

    const response = await apiClient.post<types.IInstallEnvLinkResponse>(
      "/envlinks/install",
      { id, password },
    );

    const { files } = response.data;

    if (!files || files.length === 0) {
      logger.error("No files found in this EnvLink", {
        terminate: true,
        code: 1,
      });
      return;
    }

    logger.success(`Found ${files.length} file(s)\n`);

    const cwd = process.cwd();
    const conflicts: string[] = [];
    files.forEach((file) => {
      const filePath = path.join(cwd, file.name);
      if (fs.existsSync(filePath)) {
        conflicts.push(file.name);
      }
    });

    let selectedFiles = files;

    if (options.selectFiles || conflicts.length > 0) {
      const choices: Array<{ name: string; value: string; checked: boolean }> =
        files.map((file) => {
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

      selectedFiles = files.filter((f) => selected.includes(f.name));
    }

    logger.log("\nFiles to install:");
    selectedFiles.forEach((file) => {
      const exists = conflicts.includes(file.name);
      logger.log(
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
      logger.warn("Installation cancelled.");
      return;
    }

    logger.start("Installing files...");
    selectedFiles.forEach((file) => {
      const filePath = path.join(cwd, file.name);
      fs.writeFileSync(filePath, file.content, "utf-8");
    });

    logger.success("Installation complete!\n");
    logger.log(
      colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(
      `  ${ICONS.SUCCESS} ${colors.green(`Successfully installed ${selectedFiles.length} file(s)!`)}`,
    );
    logger.log(
      colors.green("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(`\n${ICONS.FILE} ${colors.bold("Installed files:")}`);
    selectedFiles.forEach((file) => {
      logger.log(`   ${ICONS.BULLET} ${colors.cyan(file.name)}`);
    });
    logger.log("");
  } catch (error: unknown) {
    logger.error(`Failed to install EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};

export const info = async (
  id: string,
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    if (!id) {
      logger.error("EnvLink ID is required", { terminate: true, code: 1 });
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

    logger.start(`Fetching EnvLink info...`);
    const response = await apiClient.post<types.IGetEnvLinkResponse>(
      "/envlinks/get-info",
      { id, password },
    );

    const data = response.data;
    const statusEmoji =
      data.status === "active" ? ICONS.GREEN_CIRCLE : ICONS.RED_CIRCLE;
    const expiryDate = formatTimeForUser(data.expiresAt);

    logger.success("EnvLink info retrieved\n");
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}       ${colors.white(data.id)}`,
    );
    logger.log(
      `  ${statusEmoji} ${colors.bold("Status:")}   ${data.status === "active" ? colors.green(data.status.toUpperCase()) : colors.red(data.status.toUpperCase())}`,
    );
    logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}    ${colors.white(String(data.filesCount || 0))}`,
    );
    logger.log(
      `  ${ICONS.INBOX} ${colors.bold("Installs:")} ${colors.magenta(String(data.installCount || 0))}`,
    );

    if (data.reference) {
      logger.log(
        `  ${ICONS.STAR} ${colors.bold("Reference:")} ${colors.cyan(data.reference)}`,
      );
    }

    logger.log(
      `  ${ICONS.CALENDAR} ${colors.bold("Created:")}  ${colors.gray(formatTimeForUser(data.createdAt))}`,
    );
    logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")}  ${colors.yellow(expiryDate)}`,
    );
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );

    if (data.filesCount && data.filesCount > 0) {
      logger.log(`\n${ICONS.BOX} ${colors.bold("File count:")}`);
      logger.log(
        `   ${ICONS.BULLET} ${colors.cyan(`${data.filesCount} file(s) available`)}`,
      );
      logger.log("");
    } else if (data.status === "expired") {
      logger.log(
        `\n${ICONS.WARNING} ${colors.red("This EnvLink has expired and cannot be used")}\n`,
      );
    } else {
      logger.log(
        `\n${ICONS.WARNING} ${colors.yellow("No files found in this EnvLink")}\n`,
      );
    }
  } catch (error: unknown) {
    logger.error(`Failed to fetch EnvLink info: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};

export const expire = async (
  id: string,
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    if (!id) {
      logger.error("EnvLink ID is required", { terminate: true, code: 1 });
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

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to expire EnvLink ${id}?`,
        default: false,
      },
    ]);

    if (!confirm) {
      logger.warn("Operation cancelled.");
      return;
    }

    logger.start("Expiring EnvLink...");
    await apiClient.delete<types.IExpireEnvLinkResponse>("/envlinks/expire", {
      id,
      password,
    });

    logger.success("EnvLink expired successfully!\n");
    logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(
      `  ${ICONS.RED_CIRCLE} ${colors.red(`EnvLink ${colors.bold(id)} has been expired`)}`,
    );
    logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);

    if (errorMessage.includes("Invalid EnvLink ID or expired")) {
      logger.error("EnvLink is already expired or does not exist", {
        terminate: true,
        code: 1,
      });
    } else {
      logger.error(`Failed to expire EnvLink: ${errorMessage}`, {
        terminate: true,
        code: 1,
      });
    }
  }
};

export const update = async (
  id: string,
  options: types.ICommandOptions = {},
): Promise<void> => {
  try {
    if (!id) {
      logger.error("EnvLink ID is required", { terminate: true, code: 1 });
      return;
    }

    const hasUpdates =
      options.files || options.exp || options.pass !== undefined;

    if (!hasUpdates) {
      logger.error(
        "No update options provided. Use --files, --exp, or --pass",
        { terminate: true, code: 1 },
      );
      return;
    }

    logger.start(`Fetching EnvLink ${id}...`);
    let currentPassword = options.currentPass;
    if (!currentPassword) {
      logger.error(
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
      logger.error("Invalid password provided. Password cannot be empty.", {
        terminate: true,
        code: 1,
      });
      return;
    }

    const infoResponse = await apiClient.post<types.IGetEnvLinkResponse>(
      "/envlinks/get-info",
      { id, password: currentPassword },
    );

    if (infoResponse.data.status === "expired") {
      logger.error("Cannot update expired EnvLink", {
        terminate: true,
        code: 1,
      });
      return;
    }

    logger.success("EnvLink found\n");

    const updateData: {
      files?: types.IEnvFile[];
      expirationDuration?: string;
      password?: string;
      currentPassword: string;
      reference?: string;
    } = {
      currentPassword,
    };

    if (options.files) {
      const cwd = process.cwd();
      const envFiles = discoverEnvFiles(cwd);

      if (envFiles.length === 0) {
        logger.error("No .env files found in the current directory.", {
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

      updateData.files = filesToUpdate.map((filename) => ({
        name: filename,
        content: readFileContent(path.join(cwd, filename)),
      }));

      logger.log("\nFiles to update:");
      filesToUpdate.forEach((file) =>
        logger.log(`  ${ICONS.BULLET} ${colors.cyan(file)}`),
      );
    }

    if (options.exp) {
      updateData.expirationDuration = options.exp;
      logger.log(
        `\n${colors.bold("New expiration:")} ${colors.yellow(options.exp)}`,
      );
    }

    if (options.pass !== undefined) {
      if (options.pass) {
        updateData.password = options.pass;
        logger.log(
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
          updateData.password = "";
          logger.log(`\n${colors.bold("Password:")} ${colors.red("Removed")}`);
        }
      }
    }

    logger.log("");

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Proceed with update?",
        default: false,
      },
    ]);

    if (!confirm) {
      logger.warn("Update cancelled.");
      return;
    }

    logger.start("Updating EnvLink...");

    const response = await apiClient.put<types.IUpdateEnvLinkResponse>(
      "/envlinks/update",
      {
        id,
        ...updateData,
      },
    );

    const expiryDate = formatTimeForUser(response.data.expiresAt);

    logger.success("EnvLink updated successfully!\n");
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}      ${colors.white(response.data.id)}`,
    );
    if (response.data.filesCount) {
      logger.log(
        `  ${ICONS.FILE} ${colors.bold("Files:")}   ${colors.white(String(response.data.filesCount))}`,
      );
    }
    logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")} ${colors.yellow(expiryDate)}`,
    );
    logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
  } catch (error: unknown) {
    logger.error(`Failed to update EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};
