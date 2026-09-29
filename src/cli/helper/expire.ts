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

    const { hashPasswordDeterministic } = await import("@/lib/auth");
    const passwordHash = hashPasswordDeterministic(password);

    await utils.apiClient.authenticated<types.IExpireEnvLinkResponse>(
      "DELETE",
      `/envlinks/${id}`,
      id,
      passwordHash,
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
    utils.logger.error(utils.getErrorMessage(error), {
      terminate: true,
      code: 1,
    });
  }
};
