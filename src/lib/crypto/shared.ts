import { pbkdf2 } from "node:crypto";
import { PBKDF2_CONFIG } from "@/constants/crypto";

export interface CryptoPayload {
  encryptedData: string;
  iv: string;
  salt: string;
  authTag: string;
}

export const deriveKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    pbkdf2(
      password,
      salt,
      PBKDF2_CONFIG.ITERATIONS,
      PBKDF2_CONFIG.KEY_LENGTH,
      PBKDF2_CONFIG.DIGEST,
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      },
    );
  });
