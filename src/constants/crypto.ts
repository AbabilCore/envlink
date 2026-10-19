// Cipher & PBKDF2 constants (client-side)
export const CRYPTO_CONFIG = {
  CIPHER_ALGORITHM: "aes-256-gcm",
  HASH_ALGORITHM: "sha256",
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  ITERATIONS: 1000000,
} as const;
