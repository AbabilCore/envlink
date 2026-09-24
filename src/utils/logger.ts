import colors from 'colors';
import { createSpinner, type Spinner } from 'nanospinner';
import { ICONS } from '@/constants/icons';

type TMethod = (
  message: string,
  config?: { terminate: boolean; code: 1 | 0 }
) => void;

class Logger {
  private spinner: Spinner;

  constructor() {
    this.spinner = createSpinner();
  }

  start: TMethod = (message, config) => {
    this.spinner.start(message).start();
    if (config?.terminate) process.exit(config.code);
  };

  info: TMethod = (message, config) => {
    this.spinner.info({
      mark: ICONS.INFO,
      text: ` ${message}`,
    });
    if (config?.terminate) process.exit(config.code);
  };

  success: TMethod = (message, config) => {
    this.spinner.success({
      mark: ICONS.SUCCESS,
      text: message,
    });
    if (config?.terminate) process.exit(config.code);
  };

  warn: TMethod = (message, config) => {
    this.spinner.warn({
      mark: ICONS.WARNING,
      text: ` ${message}`,
    });
    if (config?.terminate) process.exit(config.code);
  };

  error: TMethod = (message, config) => {
    this.spinner.error({
      mark: ICONS.ERROR,
      text: message,
    });
    if (config?.terminate) process.exit(config.code);
  };
}

export default new Logger();
