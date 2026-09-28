import inquirer from "inquirer";
import colors from "colors";
import { hashPasswordDeterministic } from "@/lib/auth";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

export const info = async (
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

    utils.logger.start(`Fetching EnvLink info...`);
    const passwordHash = hashPasswordDeterministic(password);
    const response =
      await utils.apiClient.authenticated<types.IGetEnvLinkResponse>(
        "POST",
        `/envlinks/${id}/info`,
        id,
        passwordHash,
      );

    const data = response.data;
    const statusEmoji =
      data.status === "active" ? ICONS.GREEN_CIRCLE : ICONS.RED_CIRCLE;
    const expiryDate = utils.formatTimeForUser(data.expiresAt);

    utils.logger.success("EnvLink info retrieved\n");
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}       ${colors.white(data.id)}`,
    );
    utils.logger.log(
      `  ${statusEmoji} ${colors.bold("Status:")}   ${data.status === "active" ? colors.green(data.status.toUpperCase()) : colors.red(data.status.toUpperCase())}`,
    );
    utils.logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}    ${colors.white(String(data.filesCount || 0))}`,
    );
    utils.logger.log(
      `  ${ICONS.INBOX} ${colors.bold("Installs:")} ${colors.magenta(String(data.installCount || 0))}`,
    );

    if (data.reference) {
      utils.logger.log(
        `  ${ICONS.STAR} ${colors.bold("Reference:")} ${colors.cyan(data.reference)}`,
      );
    }

    utils.logger.log(
      `  ${ICONS.CALENDAR} ${colors.bold("Created:")}  ${colors.gray(utils.formatTimeForUser(data.createdAt))}`,
    );
    utils.logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")}  ${colors.yellow(expiryDate)}`,
    );
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );

    if (data.filesCount && data.filesCount > 0) {
      utils.logger.log(`\n${ICONS.BOX} ${colors.bold("File count:")}`);
      utils.logger.log(
        `   ${ICONS.BULLET} ${colors.cyan(`${data.filesCount} file(s) available`)}`,
      );
      utils.logger.log("");
    } else if (data.status === "expired") {
      utils.logger.log(
        `\n${ICONS.WARNING} ${colors.red("This EnvLink has expired and cannot be used")}\n`,
      );
    } else {
      utils.logger.log(
        `\n${ICONS.WARNING} ${colors.yellow("No files found in this EnvLink")}\n`,
      );
    }
  } catch (error: unknown) {
    utils.logger.error(
      `Failed to fetch EnvLink info: ${utils.getErrorMessage(error)}`,
      {
        terminate: true,
        code: 1,
      },
    );
  }
};
