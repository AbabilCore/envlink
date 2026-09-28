import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { CRYPTO_CONFIG } from "@/constants/crypto";
import { type CryptoPayload, deriveKey } from "./shared";
export type { CryptoPayload } from "./shared";

export const encrypt = async (
  plaintext: string,
  password: string,
): Promise<CryptoPayload> => {
  const salt = randomBytes(CRYPTO_CONFIG.SALT_LENGTH);
  const iv = randomBytes(CRYPTO_CONFIG.IV_LENGTH);
  const key = await deriveKey(password, salt);
  const cipher = createCipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    authTag: authTag.toString("base64"),
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
  const key = await deriveKey(password, salt);

  const decipher = createDecipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (
      msg.includes("Unsupported state") ||
      msg.includes("bad decrypt") ||
      msg.includes("auth") ||
      msg.includes("ERR_CRYPTO")
    ) {
      throw new Error("Invalid password or corrupted data");
    }

    throw err;
  }
};
