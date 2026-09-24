import { Command } from 'commander';
import * as helper from './helper';

export const init = (command: Command) => {
  command
    .command('init')
    .description('test message')
    .action(() => {
      helper.init();
    });
};
