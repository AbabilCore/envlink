# EnvLink Encryption Workflow

> **Note:** All encryption and decryption operations are performed on the client machine. The server only stores encrypted data and never has access to plaintext content or encryption keys.

## CRYPTO MODULES

Required Node.js modules for cryptographic operations.

```js
import crypto from "crypto";
import util from "util";
```

## CONSTANTS

Client-side constants for AES-256-GCM encryption and PBKDF2 key derivation.

- **IV_LENGTH**: 12 bytes (NIST recommended size for GCM mode)
- **ITERATIONS**: 700,000 (exceeds OWASP minimum of 600,000 for PBKDF2-SHA256)

```js
export const CRYPTO_CONFIG = {
  CIPHER_ALGORITHM: "aes-256-gcm",
  HASH_ALGORITHM: "sha256",
  KEY_LENGTH: 32,
  IV_LENGTH: 12,
  ITERATIONS: 700000,
};
```

## DERIVED KEY GENERATOR

Generates encryption key from password using PBKDF2 with 700,000 iterations.

```js
export const deriveKey = async (password, salt) => {
  const pbkdf2 = util.promisify(crypto.pbkdf2);
  return pbkdf2(
    password,
    salt,
    CRYPTO_CONFIG.ITERATIONS,
    CRYPTO_CONFIG.KEY_LENGTH,
    CRYPTO_CONFIG.HASH_ALGORITHM,
  );
};
```

## ENCRYPTOR

Encrypts plaintext using AES-256-GCM with random salt and IV.

```js
export const encrypt = async (plaintext, password) => {
  const salt = crypto.randomBytes(CRYPTO_CONFIG.KEY_LENGTH);
  const key = await deriveKey(password, salt);
  const iv = crypto.randomBytes(CRYPTO_CONFIG.IV_LENGTH);

  const cipher = crypto.createCipheriv(CRYPTO_CONFIG.CIPHER_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedData: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
};
```

## DECRYPTOR

Decrypts ciphertext using password. Verifies authentication tag for data integrity.

```js
export const decrypt = async (input, password) => {
  const encryptedData = Buffer.from(input.encryptedData, "base64");
  const iv = Buffer.from(input.iv, "base64");
  const salt = Buffer.from(input.salt, "base64");
  const authTag = Buffer.from(input.authTag, "base64");

  try {
    const key = await deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(
      CRYPTO_CONFIG.CIPHER_ALGORITHM,
      key,
      iv,
    );

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("Invalid password or corrupted data");
  }
};
```
