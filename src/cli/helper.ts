import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import colors from "colors";
import logger from "@/utils/logger";
import apiClient from "@/utils/api-client";
import { discoverEnvFiles, readFileContent } from "@/utils/file-discovery";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";

const isErrorWithMessage = (
  error: unknown,
): error is types.IErrorWithMessage => {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
};

const getErrorMessage = (error: unknown): string => {
  if (isErrorWithMessage(error)) return error.message;
  return String(error);
};

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
          message: "Expiration duration (30m, 24M, 5d, 1y, never):",
          default: "1d",
        },
      ]);
      expiration = answer.expiration;
    }

    let expirationPassword = options.expPass;
    if (!expirationPassword) {
      const { needsPassword } = await inquirer.prompt<{
        needsPassword: boolean;
      }>([
        {
          type: "confirm",
          name: "needsPassword",
          message: "Set expiration password?",
          default: false,
        },
      ]);

      if (needsPassword) {
        const { password, confirmPassword } = await inquirer.prompt<{
          password: string;
          confirmPassword: string;
        }>([
          {
            type: "password",
            name: "password",
            message: "Enter expiration password:",
            mask: "*",
          },
          {
            type: "password",
            name: "confirmPassword",
            message: "Confirm expiration password:",
            mask: "*",
          },
        ]);

        if (password !== confirmPassword) {
          logger.error("Passwords do not match.", { terminate: true, code: 1 });
          return;
        }

        expirationPassword = password;
      }
    }

    logger.log("\nEnvironment files:");
    filesToUpload.forEach((file) => logger.log(`  • ${file}`));
    logger.log(`\nExpiration: ${expiration}`);
    logger.log(
      `Expiration password: ${expirationPassword ? "Enabled" : "Disabled"}\n`,
    );

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
        expirationPassword,
      },
    );

    const expiryDate = response.data.expiresAt
      ? new Date(response.data.expiresAt).toLocaleString()
      : "Never";

    logger.success("EnvLink created successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ${ICONS.LINK} ID:      ${response.data.id}`);
    console.log(`  ${ICONS.FILE} Files:   ${response.data.filesCount}`);
    console.log(`  ${ICONS.CLOCK} Expires: ${expiryDate}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log(`${ICONS.CLIPBOARD} Install command:\n`);
    console.log(`   npx envlink install ${response.data.id}\n`);
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

    logger.start(`Fetching EnvLink ${id}...`);

    const getResponse = await apiClient.post<types.IGetEnvLinkResponse>(
      "/envlinks/get-info",
      { id },
    );

    const { files, status } = getResponse.data;

    if (status === "expired") {
      logger.error("This EnvLink has expired", {
        terminate: true,
        code: 1,
      });
      return;
    }

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
        `  ${exists ? ICONS.WARNING : ICONS.CHECK_MARK} ${file.name}${exists ? " (will overwrite)" : ""}`,
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

    await apiClient.post("/envlinks/install", { id });

    logger.success("Installation complete!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(
      `  ${ICONS.SUCCESS} Successfully installed ${selectedFiles.length} file(s)!`,
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\n${ICONS.FILE} Installed files:`);
    selectedFiles.forEach((file) => {
      console.log(`   ${ICONS.BULLET} ${file.name}`);
    });
    console.log("");
  } catch (error: unknown) {
    logger.error(`Failed to install EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};

export const info = async (id: string): Promise<void> => {
  try {
    if (!id) {
      logger.error("EnvLink ID is required", { terminate: true, code: 1 });
      return;
    }

    logger.start(`Fetching EnvLink info...`);
    const response = await apiClient.post<types.IGetEnvLinkResponse>(
      "/envlinks/get-info",
      { id },
    );

    const data = response.data;
    const statusEmoji =
      data.status === "active" ? ICONS.GREEN_CIRCLE : ICONS.RED_CIRCLE;
    const expiryDate = data.expiresAt
      ? new Date(data.expiresAt).toLocaleString()
      : "Never";

    logger.success("EnvLink info retrieved\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ${ICONS.LINK} ID:       ${data.id}`);
    console.log(`  ${statusEmoji} Status:   ${data.status.toUpperCase()}`);
    console.log(`  ${ICONS.FILE} Files:    ${data.filesCount}`);
    console.log(`  ${ICONS.INBOX} Installs: ${data.installCount || 0}`);
    console.log(
      `  ${ICONS.CALENDAR} Created:  ${new Date(data.createdAt).toLocaleString()}`,
    );
    console.log(`  ${ICONS.CLOCK} Expires:  ${expiryDate}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (data.files && data.files.length > 0) {
      console.log(`\n${ICONS.BOX} Environment files:`);
      data.files.forEach((file) => {
        console.log(`   ${ICONS.BULLET} ${file.name}`);
      });
      console.log("");
    } else {
      console.log(
        `\n${ICONS.WARNING} File details not available (link may be expired)\n`,
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

    let password = options.expPass;
    if (!password && options.expPass !== undefined) {
      const { pwd } = await inquirer.prompt<{ pwd: string }>([
        {
          type: "password",
          name: "pwd",
          message: "Enter expiration password:",
          mask: "*",
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
    await apiClient.post<types.IExpireEnvLinkResponse>("/envlinks/expire", {
      id,
      password,
    });

    logger.success("EnvLink expired successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ${ICONS.RED_CIRCLE} EnvLink ${id} has been expired`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error: unknown) {
    logger.error(`Failed to expire EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
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
      options.files || options.exp || options.expPass !== undefined;

    if (!hasUpdates) {
      logger.error(
        "No update options provided. Use --files, --exp, or --exp-pass",
        { terminate: true, code: 1 },
      );
      return;
    }

    logger.start(`Fetching EnvLink ${id}...`);

    const infoResponse = await apiClient.post<types.IGetEnvLinkResponse>(
      "/envlinks/get-info",
      { id },
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
      expirationPassword?: string;
      currentPassword?: string;
    } = {};

    let currentPassword = options.currentPass;
    if (!currentPassword) {
      const { needsPassword } = await inquirer.prompt<{
        needsPassword: boolean;
      }>([
        {
          type: "confirm",
          name: "needsPassword",
          message: "Is this EnvLink password protected?",
          default: false,
        },
      ]);

      if (needsPassword) {
        const { pwd } = await inquirer.prompt<{ pwd: string }>([
          {
            type: "password",
            name: "pwd",
            message: "Enter current password:",
            mask: "*",
          },
        ]);
        currentPassword = pwd;
      }
    }

    if (currentPassword) {
      updateData.currentPassword = currentPassword;
    }

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
      filesToUpdate.forEach((file) => logger.log(`  ${ICONS.BULLET} ${file}`));
    }

    if (options.exp) {
      updateData.expirationDuration = options.exp;
      logger.log(`\nNew expiration: ${options.exp}`);
    }

    if (options.expPass !== undefined) {
      if (options.expPass) {
        updateData.expirationPassword = options.expPass;
        logger.log("\nExpiration password: Updated");
      } else {
        const { confirmRemove } = await inquirer.prompt<{
          confirmRemove: boolean;
        }>([
          {
            type: "confirm",
            name: "confirmRemove",
            message: "Remove expiration password protection?",
            default: false,
          },
        ]);

        if (confirmRemove) {
          updateData.expirationPassword = "";
          logger.log("\nExpiration password: Removed");
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

    const response = await apiClient.post<types.IUpdateEnvLinkResponse>(
      "/envlinks/update",
      {
        id,
        ...updateData,
      },
    );

    const expiryDate = response.data.expiresAt
      ? new Date(response.data.expiresAt).toLocaleString()
      : "Never";

    logger.success("EnvLink updated successfully!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  ${ICONS.LINK} ID:      ${response.data.id}`);
    if (response.data.filesCount) {
      console.log(`  ${ICONS.FILE} Files:   ${response.data.filesCount}`);
    }
    console.log(`  ${ICONS.CLOCK} Expires: ${expiryDate}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error: unknown) {
    logger.error(`Failed to update EnvLink: ${getErrorMessage(error)}`, {
      terminate: true,
      code: 1,
    });
  }
};
