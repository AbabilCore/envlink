import crypto from "crypto";
import util from "util";
import { CRYPTO_CONFIG } from "@/constants/crypto";

export interface CryptoPayload {
  encryptedData: string;
  iv: string;
  salt: string;
  authTag: string;
}

export const deriveKey = async (password: string, salt: Buffer | string) => {
  const pbkdf2 = util.promisify(crypto.pbkdf2);
  return pbkdf2(
    password,
    salt,
    CRYPTO_CONFIG.ITERATIONS,
    CRYPTO_CONFIG.KEY_LENGTH,
    CRYPTO_CONFIG.DIGEST,
  );
};

export const encrypt = async (
  plaintext: string,
  password: string,
): Promise<CryptoPayload> => {
  const salt = crypto.randomBytes(CRYPTO_CONFIG.KEY_LENGTH);
  const key = await deriveKey(password, salt);
  const iv = crypto.randomBytes(CRYPTO_CONFIG.IV_LENGTH);

  const cipher = crypto.createCipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
};

export const decrypt = async (
  input: CryptoPayload,
  password: string,
): Promise<string> => {
  const encryptedData = Buffer.from(input.encryptedData, "base64");
  const iv = Buffer.from(input.iv, "base64");
  const salt = Buffer.from(input.salt, "base64");
  const authTag = Buffer.from(input.authTag, "base64");

  try {
    const key = await deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Invalid password or corrupted data");
  }
};
