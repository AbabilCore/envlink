import { Command } from "commander";
import * as commands from "@/cli/commands";
import pkg from "@/constants/pkg";
import logger from "@/utils/logger";
import { ICONS } from "@/constants/icons";
import handleCmdErr from "@/utils/command-error-handler";

const command = new Command();

handleCmdErr(command);

const args = process.argv;
if (
  args.includes("-v") &&
  !args.includes("--version") &&
  !args.includes("-V")
) {
  const vIndex = args.indexOf("-v");
  args[vIndex] = "-V";
}

command
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version, "-V, --version", "output the version number")
  .helpOption("-h, --help", "display help for command");

commands.create(command);
commands.install(command);
commands.update(command);
commands.info(command);
commands.expire(command);

command.on("command:*", ([cmd]: [string]) => {
  logger.error(
    `Invalid command: ${cmd}\n${ICONS.INFO} Try envlink --help for a list of available commands.`,
    {
      terminate: true,
      code: 1,
    },
  );
});

if (!process.argv.slice(2).length) {
  command.outputHelp();
  logger.log("");
  logger.error(
    `No command provided! Try envlink --help to see available commands.`,
    {
      terminate: true,
      code: 1,
    },
  );
}

command.parse(process.argv);
