import colors from "colors";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

export const info = async (id: string): Promise<void> => {
  try {
    if (!id) {
      utils.logger.error("EnvLink ID is required", {
        terminate: true,
        code: 1,
      });
      return;
    }

    const { baseId } = utils.parseExtendedId(id);

    utils.logger.log(
      `${ICONS.INFO} ${colors.cyan("Processing optional-password EnvLink")}`,
    );

    utils.logger.start(`Fetching EnvLink info...`);

    const response = await utils.apiClient.post<types.IGetEnvLinkResponse>(
      `/envlinks/${baseId}/info`,
    );

    const data = response.data;
    const statusEmoji =
      data.status === "active" ? ICONS.GREEN_CIRCLE : ICONS.RED_CIRCLE;
    const expiryDate = utils.formatTimeForUser(data.expiresAt);

    utils.logger.success("Optional-password EnvLink info retrieved\n");
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.LINK} ${colors.bold("ID:")}       ${colors.white(id)} ${colors.gray("(extended ID)")}`,
    );
    utils.logger.log(
      `  ${ICONS.DATABASE} ${colors.bold("Base ID:")}  ${colors.gray(baseId)}`,
    );
    utils.logger.log(
      `  ${statusEmoji} ${colors.bold("Status:")}   ${"ACTIVE"}`,
    );
    utils.logger.log(
      `  ${ICONS.LOCK} ${colors.bold("Type:")}     ${colors.green("Optional-password")}`,
    );
    utils.logger.log(
      `  ${ICONS.FILE} ${colors.bold("Files:")}    ${colors.white(String(data.filesCount || 0))}`,
    );
    utils.logger.log(
      `  ${ICONS.INBOX} ${colors.bold("Installs:")} ${colors.magenta(String(data.installCount || 0))}`,
    );
    utils.logger.log(
      `  ${ICONS.CALENDAR} ${colors.bold("Created:")}  ${colors.gray(utils.formatTimeForUser(data.createdAt))}`,
    );
    utils.logger.log(
      `  ${ICONS.CLOCK} ${colors.bold("Expires:")}  ${colors.yellow(expiryDate)} ${colors.gray("(fixed 1h)")}`,
    );
    utils.logger.log(
      colors.cyan("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );

    utils.logger.log(
      `\n${ICONS.SETTINGS} ${colors.bold("Supported Operations:")}`,
    );
    utils.logger.log(
      `   ${ICONS.BULLET} ${colors.green("info")} - View EnvLink information`,
    );
    utils.logger.log(
      `   ${ICONS.BULLET} ${colors.green("install")} - Download and install environment files`,
    );
    utils.logger.log(
      `   ${ICONS.BULLET} ${colors.green("expire")} - Manually expire this EnvLink`,
    );
    utils.logger.log(
      `   ${ICONS.BULLET} ${colors.red("update")} - Not supported for optional-password EnvLinks`,
    );

    if (data.filesCount && data.filesCount > 0) {
      utils.logger.log(`\n${ICONS.BOX} ${colors.bold("File Information:")}`);
      utils.logger.log(
        `   ${ICONS.BULLET} ${colors.cyan(`${data.filesCount} file(s) available for installation`)}`,
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
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
