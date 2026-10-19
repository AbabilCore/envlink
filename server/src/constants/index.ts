import ENV from "@/config";
export { default as HTTP_CODE } from "http-status-codes";

export const SITE_URL =
  ENV.NODE_ENV === "development" || ENV.NODE_ENV === "preview"
    ? `http://localhost:${ENV.PORT}`
    : ENV.PROD_SITE_URL;

// PBKDF2 & hashing constants (server-side)
export const CRYPTO_CONFIG = {
  HASH_ALGORITHM: "sha256",
  KEY_LENGTH: 32,
  ITERATIONS: 1000000,
} as const;

export const ENVLINK_CONSTANTS = {
  DEFAULT_EXPIRATION: "1d",
  MAX_FILE_SIZE: 100 * 1024,
  MAX_ENCRYPTED_PAYLOAD_SIZE: 1024 * 1024 * 2,
  MAX_FILES_PER_ENVLINK: 10,
  MAX_TOTAL_PAYLOAD: 500 * 1024,
  ID_PREFIX: "el_",
} as const;
