import { Command } from "commander";
import pkg from "@/constants/pkg";
import { ICONS } from "@/constants/icons";
import * as commands from "@/cli/commands";
import * as utils from "@/utils";

const command = new Command();

utils.handleCmdErr(command);

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
commands.versionCheck(command);

command.on("command:*", ([cmd]: [string]) => {
  utils.logger.error(
    `Invalid command: ${cmd}\n${ICONS.INFO} Try envlink --help for a list of available commands.`,
    {
      terminate: true,
      code: 1,
    },
  );
});

if (!process.argv.slice(2).length) {
  command.outputHelp();
  utils.logger.log("");
  utils.logger.error(
    `No command provided! Try envlink --help to see available commands.`,
    {
      terminate: true,
      code: 1,
    },
  );
}

command.parse(process.argv);
