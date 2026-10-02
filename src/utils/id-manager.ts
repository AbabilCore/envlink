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
  if (!fullId || typeof fullId !== "string") {
    throw new Error("EnvLink ID must be a non-empty string");
  }

  const trimmed = fullId.trim();

  if (/^el_[0-9A-Za-z]{32}$/.test(trimmed)) {
    return {
      baseId: trimmed.slice(0, 19),
      accessKey: trimmed.slice(19),
      isOptionalPass: true,
    };
  }

  if (/^el_[0-9A-Za-z]{16}$/.test(trimmed)) {
    return {
      baseId: trimmed,
      isOptionalPass: false,
    };
  }

  throw new Error(
    "Invalid EnvLink ID format. Expected 19-char ID or 35-char extended ID.",
  );
};

export const parseExtendedId = (
  fullId: string,
): { baseId: string; accessKey: string } => {
  const parsed = parseEnvLinkId(fullId);

  if (!parsed.isOptionalPass || !parsed.accessKey) {
    throw new Error(
      "Invalid optional-password EnvLink ID format. Expected format: el_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (35 characters)",
    );
  }

  return {
    baseId: parsed.baseId,
    accessKey: parsed.accessKey,
  };
};
