# EnvLink Encryption Workflow

## CRYPTO MODULES

```js
import crypto from "crypto";
import util from "util";
```

## CONSTANTS

```js
// AES-256-GCM & PBKDF2 constants
export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm",
  DIGEST: "sha256",
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  ITERATIONS: 100000,
};
```

## DERIVED KEY GENERATOR

```js
export const deriveKey = async (password, salt) => {
  const pbkdf2 = util.promisify(crypto.pbkdf2);
  return pbkdf2(
    password,
    salt,
    CRYPTO_CONFIG.ITERATIONS,
    CRYPTO_CONFIG.KEY_LENGTH,
    CRYPTO_CONFIG.DIGEST,
  );
};
```

## ENCRYPTOR

```js
export const encrypt = async (plaintext, password) => {
  const salt = crypto.randomBytes(CRYPTO_CONFIG.KEY_LENGTH);
  const key = await deriveKey(password, salt);
  const iv = crypto.randomBytes(CRYPTO_CONFIG.IV_LENGTH);

  const cipher = crypto.createCipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);
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

```js
export const decrypt = async (input, password) => {
  const encryptedData = Buffer.from(input.encryptedData, "base64");
  const iv = Buffer.from(input.iv, "base64");
  const salt = Buffer.from(input.salt, "base64");
  const authTag = Buffer.from(input.authTag, "base64");

  try {
    const key = await deriveKey(password, salt);
    const decipher = crypto.createDecipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv);

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
