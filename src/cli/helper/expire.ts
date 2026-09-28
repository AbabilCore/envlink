import inquirer from "inquirer";
import colors from "colors";
import { ICONS } from "@/constants/icons";
import * as types from "@/types";
import * as utils from "@/utils";

export const expire = async (
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

    const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: `Are you sure you want to expire EnvLink ${id}?`,
        default: false,
      },
    ]);

    if (!confirm) {
      utils.logger.warn("Operation cancelled.");
      return;
    }

    utils.logger.start("Expiring EnvLink...");
    await utils.apiClient.delete<types.IExpireEnvLinkResponse>(
      `/envlinks/${id}`,
      {
        password,
      },
    );

    utils.logger.success("EnvLink expired successfully!\n");
    utils.logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"),
    );
    utils.logger.log(
      `  ${ICONS.RED_CIRCLE} ${colors.red(`EnvLink ${colors.bold(id)} has been expired`)}`,
    );
    utils.logger.log(
      colors.red("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"),
    );
  } catch (error: unknown) {
    const errorMessage = utils.getErrorMessage(error);

    if (errorMessage.includes("Invalid EnvLink ID or expired")) {
      utils.logger.error("EnvLink is already expired or does not exist", {
        terminate: true,
        code: 1,
      });
    } else {
      utils.logger.error(`Failed to expire EnvLink: ${errorMessage}`, {
        terminate: true,
        code: 1,
      });
    }
  }
};
