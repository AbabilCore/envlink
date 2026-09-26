import { Command, CommanderError } from "commander";
import logger from "./logger";
import { ICONS } from "@/constants/icons";

const handleCmdErr = (cmd: Command, commandName?: string): void => {
  cmd.configureOutput({
    writeErr: () => {},
    writeOut: (str: string) => process.stdout.write(str),
  });

  cmd.exitOverride(
    (err) =>
      (err: CommanderError, commandName?: string): void => {
        if (err.code === "commander.unknownOption") {
          const option =
            err.message.match(/unknown option '([^']+)'/)?.[1] || "option";
          const context = commandName ? ` for ${commandName} command` : "";
          logger.error(
            `Unknown option '${option}'${context}\n${ICONS.INFO} Try envlink ${commandName ? `${commandName} ` : ""}--help for valid options.`,
            {
              terminate: true,
              code: 1,
            },
          );
          return;
        }

        if (
          err.code === "commander.help" ||
          err.code === "commander.version" ||
          err.code === "commander.helpDisplayed"
        ) {
          process.exit(0);
        }

        if (err.code && err.code.startsWith("commander.")) {
          logger.error(`Command error: ${err.message}`, {
            terminate: true,
            code: 1,
          });
          return;
        }

        throw err;
      },
  );
};

export default handleCmdErr;
