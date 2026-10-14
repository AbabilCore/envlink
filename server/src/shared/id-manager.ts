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

export const generateEnvLinkId = () => `el_${generateBase62String(ID_LENGTH)}`;

export const isValidEnvLinkId = (id: string): boolean => {
  return /^el_[0-9A-Za-z]{16}$/.test(id);
};
