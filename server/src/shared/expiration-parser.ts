export const parseExpirationDuration = (duration: string): number | null => {
  if (duration === "never") {
    return null;
  }

  const match = duration.match(/^(\d+)(m|h|d|M|y)$/);

  if (!match) {
    throw new Error(`Invalid expiration duration: "${duration}". Expected format: 30m, 24h, 5d, 6M, 1y, or "never"`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const MS_PER_MINUTE = 60 * 1000;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;
  const MS_PER_MONTH = 30 * MS_PER_DAY;
  const MS_PER_YEAR = 365 * MS_PER_DAY;

  switch (unit) {
    case "m":
      return value * MS_PER_MINUTE;
    case "h":
      return value * MS_PER_HOUR;
    case "d":
      return value * MS_PER_DAY;
    case "M":
      return value * MS_PER_MONTH;
    case "y":
      return value * MS_PER_YEAR;
    default:
      throw new Error(`Unsupported duration unit: ${unit}`);
  }
};

export const calculateExpirationDate = (duration: string = "24h"): Date | null => {
  const ms = parseExpirationDuration(duration);

  if (ms === null) {
    return null;
  }

  return new Date(Date.now() + ms);
};

export const isExpired = (expiresAt: Date | null): boolean => {
  if (expiresAt === null) {
    return false;
  }

  return new Date() > expiresAt;
};
