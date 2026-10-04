import crypto from "crypto";
import { deriveKey } from "@/lib/crypto";
import { CRYPTO_CONFIG } from "@/constants/crypto";

export const generateZKProof = async (
  passwordHash: string,
  envlinkId: string,
): Promise<string> => {
  const serverSalt = crypto
    .createHash(CRYPTO_CONFIG.DIGEST)
    .update(`envlink:${envlinkId}`)
    .digest("hex");

  const input = passwordHash + serverSalt;

  const key = await deriveKey(input, serverSalt);

  return key.toString("base64");
};

export const hashPasswordDeterministic = (password: string): string =>
  crypto.createHash(CRYPTO_CONFIG.DIGEST).update(password).digest("hex");
