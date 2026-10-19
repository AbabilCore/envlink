import crypto from "crypto";
import util from "util";
import { CRYPTO_CONFIG } from "@/constants";

const deriveKey = async (password: string, salt: Buffer | string) => {
  const pbkdf2 = util.promisify(crypto.pbkdf2);
  return pbkdf2(
    password,
    salt,
    CRYPTO_CONFIG.ITERATIONS,
    CRYPTO_CONFIG.KEY_LENGTH,
    CRYPTO_CONFIG.HASH_ALGORITHM,
  );
};

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
