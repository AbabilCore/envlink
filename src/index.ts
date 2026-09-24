import { Command } from 'commander';
import * as commands from '@/cli/commands';
import pkg from '@/constants/pkg';
import logger from '@/utils/logger';

const command = new Command();

command.name(pkg.name).description(pkg.description).version(pkg.version);

commands.init(command);

command.on('command:*', ([cmd]) => {
  logger.error(
    `Invalid command: ${cmd}\nTry envlink --help for a list of available commands.`,
    {
      terminate: true,
      code: 1,
    }
  );
});

command.exitOverride((err) => {
  if (err.code === 'commander.unknownOption') {
    logger.error(`Invalid option! Try envlink --help for valid options.`, {
      terminate: true,
      code: 1,
    });
  }
});

command.parse(process.argv);

if (!process.argv.slice(2).length) {
  logger.error(
    'No command provided! Try envlink --help to see available commands.',
    {
      terminate: true,
      code: 1,
    }
  );
}
