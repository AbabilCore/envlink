import crypto from "crypto";
import { promisify } from "util";
import { PBKDF2_CONFIG } from "@/constants/crypto";

const pbkdf2 = promisify(crypto.pbkdf2);

export const generateZKProof = async (
  passwordHash: string,
  envlinkId: string,
): Promise<string> => {
  const serverSalt = crypto
    .createHash(PBKDF2_CONFIG.DIGEST)
    .update(`envlink:${envlinkId}`)
    .digest("hex");

  const input = passwordHash + serverSalt;

  const key = await pbkdf2(
    input,
    serverSalt,
    PBKDF2_CONFIG.ITERATIONS,
    PBKDF2_CONFIG.KEY_LENGTH,
    PBKDF2_CONFIG.DIGEST,
  );

  return key.toString("base64");
};

export const hashPasswordDeterministic = (password: string): string =>
  crypto.createHash(PBKDF2_CONFIG.DIGEST).update(password).digest("hex");
