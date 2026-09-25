import { Command, CommanderError } from "commander";
import * as commands from "@/cli/commands";
import pkg from "@/constants/pkg";
import logger from "@/utils/logger";

const command = new Command();

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

commands.init(command);

command.on("command:*", ([cmd]: [string]) => {
  logger.error(
    `Invalid command: ${cmd}\nTry envlink --help for a list of available commands.`,
    {
      terminate: true,
      code: 1,
    }
  );
});

command.exitOverride((err: CommanderError) => {
  if (err.code === "commander.unknownOption") {
    logger.error(`Invalid option! Try envlink --help for valid options.`, {
      terminate: true,
      code: 1,
    });
  }

  if (
    err.code === "commander.help" ||
    err.code === "commander.version" ||
    err.code === "commander.helpDisplayed"
  ) {
    process.exit(0);
  }

  if (err.code && err.code.startsWith("commander.")) {
    process.exit(err.exitCode || 1);
  }

  throw err;
});

if (!process.argv.slice(2).length) {
  command.outputHelp();
  console.log();
  logger.error(
    "No command provided! Try envlink --help to see available commands.",
    {
      terminate: true,
      code: 1,
    }
  );
}

command.parse(process.argv);
