import colors from "colors";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

const parseExtendedId = (
  fullId: string,
): { baseId: string; accessKey: string } => {
  const parsed = utils.parseEnvLinkId(fullId);

  if (!parsed.isOptionalPass || !parsed.accessKey) {
    throw new Error(
      "Invalid optional-password EnvLink ID format. Expected format: el_xxxxxxxxxxxxxxxx_yyyyyyyyyyyyyyyy",
    );
  }

  return {
    baseId: parsed.baseId,
    accessKey: parsed.accessKey,
  };
};

export const expire = async (id: string): Promise<void> => {
  try {
    if (!id) {
      utils.logger.error("EnvLink ID is required", {
        terminate: true,
        code: 1,
      });
      return;
    }

    const { baseId } = parseExtendedId(id);

    utils.logger.log(
      `${ICONS.INFO} ${colors.cyan("Processing optional-password EnvLink")}`,
    );

    utils.logger.start(`Expiring EnvLink ${baseId}...`);

    const response = await utils.apiClient.delete<types.IExpireEnvLinkResponse>(
      `/envlinks/${id}`,
      {},
    );

    utils.logger.success(`${response.message}\n`);
    utils.logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.SUCCESS} ${colors.red("EnvLink has been expired!")}`,
    );
    utils.logger.log(
      `  ${ICONS.LOCK} ${colors.cyan("Optional-password EnvLink")}`,
    );
    utils.logger.log(`  ${ICONS.LINK} ${colors.gray("ID: " + id)}`);
    utils.logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `\n${ICONS.WARNING} ${colors.yellow("This EnvLink can no longer be accessed.")}`,
    );
    utils.logger.log("");
  } catch (error: unknown) {
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
