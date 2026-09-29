import crypto from "crypto";

const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const ID_LENGTH = 16;

const generateBase62String = (length: number): string => {
  const randomBytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    const byte = randomBytes[i];
    if (byte !== undefined) {
      result += BASE62_CHARS[byte % BASE62_CHARS.length];
    }
  }

  return result;
};

export const generateAccessKey = () => generateBase62String(ID_LENGTH);

export const parseEnvLinkId = (
  fullId: string,
): {
  baseId: string;
  accessKey?: string;
  isOptionalPass: boolean;
} => {
  const match = fullId.match(/^(el_[0-9A-Za-z]{16})(?:_([0-9A-Za-z]+))?$/);

  if (!match) {
    throw new Error("Invalid EnvLink ID format");
  }

  const [, baseId, accessKey] = match;

  if (!baseId) {
    throw new Error("Invalid EnvLink ID format - missing base ID");
  }

  const result: {
    baseId: string;
    accessKey?: string;
    isOptionalPass: boolean;
  } = {
    baseId,
    isOptionalPass: !!accessKey,
  };

  if (accessKey) {
    result.accessKey = accessKey;
  }

  return result;
};
