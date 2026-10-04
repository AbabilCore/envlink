// AES-256-GCM & PBKDF2  constants
export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm",
  DIGEST: "sha256",
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  ITERATIONS: 100000,
} as const;
