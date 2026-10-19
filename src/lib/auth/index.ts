import crypto from "crypto";
import { deriveKey } from "@/lib/crypto";
import { CRYPTO_CONFIG } from "@/constants/crypto";

export const generateZKProof = async (
  passwordHash: string,
  envlinkId: string,
): Promise<string> => {
  const serverSalt = crypto
    .createHash(CRYPTO_CONFIG.HASH_ALGORITHM)
    .update(`envlink:${envlinkId}`)
    .digest("hex");

  const input = passwordHash + serverSalt;

  const key = await deriveKey(input, serverSalt);

  return key.toString("base64");
};

export const hashPasswordDeterministic = async (password: string) => {
  const authSalt = crypto
    .createHash(CRYPTO_CONFIG.HASH_ALGORITHM)
    .digest("hex");
  const key = await deriveKey(password, authSalt);
  return key.toString("hex");
};
