// PBKDF2 and crypto configuration
export const PBKDF2_CONFIG = {
  ITERATIONS: 100000,
  KEY_LENGTH: 32,
  DIGEST: "sha256",
} as const;

// AES-256-GCM encryption constants
export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm",
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  SALT_LENGTH: 32,
} as const;
