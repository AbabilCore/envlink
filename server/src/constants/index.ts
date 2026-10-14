import ENV from "@/config";
export { default as HTTP_CODE } from "http-status-codes";

export const SITE_URL =
  ENV.NODE_ENV === "development" || ENV.NODE_ENV === "preview"
    ? `http://localhost:${ENV.PORT}`
    : ENV.PROD_SITE_URL;

// AES-256-GCM & PBKDF2 constants
export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm",
  DIGEST: "sha256",
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  ITERATIONS: 100000,
} as const;

export const ENVLINK_CONSTANTS = {
  DEFAULT_EXPIRATION: "1d",
  MAX_FILE_SIZE: 100 * 1024,
  MAX_ENCRYPTED_PAYLOAD_SIZE: 1024 * 1024 * 2,
  MAX_FILES_PER_ENVLINK: 10,
  MAX_TOTAL_PAYLOAD: 500 * 1024,
  ENCRYPTION_ALGORITHM: "aes-256-gcm",
  ID_PREFIX: "el_",
} as const;
