# Zero-Knowledge Proof Authentication

Server never sees user passwords. Authentication uses cryptographic proofs instead of password comparison.

## Imports

Required Node.js modules for cryptographic operations.

```js
import crypto from "crypto";
import util from "util";
```

## Configuration

Server-side constants for PBKDF2-SHA256 hashing.

- **ITERATIONS**: 700,000 (exceeds OWASP minimum of 600,000 for PBKDF2-SHA256)

```js
export const CRYPTO_CONFIG = {
  HASH_ALGORITHM: "sha256",
  KEY_LENGTH: 32,
  ITERATIONS: 700000,
};
```

## Derived Key Function

Generates cryptographic key using PBKDF2 with configurable iterations.

```js
const deriveKey = async (password, salt) => {
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

## Password Hashing

Deterministic password hashing for authentication. Always produces same hash for same password.

```js
const hashPasswordDeterministic = async (password) => {
  const authSalt = crypto
    .createHash(CRYPTO_CONFIG.HASH_ALGORITHM)
    .digest("hex");
  const key = await deriveKey(password, authSalt);
  return key.toString("hex");
};
```

## ZK Proof Generation

Generates zero-knowledge proof from password hash and EnvLink ID. Used by both client and server.

```js
export const generateZKProof = async (passwordHash, envlinkId) => {
  const serverSalt = crypto
    .createHash(CRYPTO_CONFIG.HASH_ALGORITHM)
    .update(`envlink:${envlinkId}`)
    .digest("hex");

  const input = passwordHash + serverSalt;
  const key = await deriveKey(input, serverSalt);

  return key.toString("base64");
};
```

## Client Authentication

Client generates proof and sends to server for verification.

```js
const passwordHash = await hashPasswordDeterministic(userPassword);
const passwordProof = await generateZKProof(passwordHash, envlinkId);

fetch("/api/envlink/auth", {
  method: "POST",
  body: JSON.stringify({ envlinkId, passwordProof }),
});
```

## Server Verification & Authentication

Middleware verifies zero-knowledge proof using timing-safe comparison.

```js
export const verifyEnvLinkPassword = catchAsync(async (req, res, next) => {
  const { passwordProof } = req.body || {};
  const envlinkId = req.params.id;

  if (!isValidEnvLinkId(envlinkId)) {
    throw new AppError(HTTP_CODE.BAD_REQUEST, "Invalid EnvLink ID format");
  }

  const envLink = await EnvLinkModel.findOne({ id: envlinkId });

  if (!envLink || isExpired(envLink.expiresAt)) {
    throw new AppError(
      HTTP_CODE.NOT_FOUND,
      "EnvLink not found or access denied",
    );
  }

  if (!envLink.passwordHash) {
    return next();
  }

  if (!passwordProof) {
    throw new AppError(HTTP_CODE.BAD_REQUEST, "Password proof is required");
  }

  const storedProof = await generateZKProof(envLink.passwordHash, envlinkId);

  let isProved = false;
  try {
    const passwordProofBuffer = Buffer.from(passwordProof, "utf8");
    const storedPasswordProofBuffer = Buffer.from(storedProof, "utf8");

    if (passwordProofBuffer.length === storedPasswordProofBuffer.length) {
      isProved = timingSafeEqual(
        passwordProofBuffer,
        storedPasswordProofBuffer,
      );
    }
  } catch {
    isProved = false;
  }

  if (!isProved) {
    throw new AppError(
      HTTP_CODE.UNAUTHORIZED,
      "EnvLink not found or access denied",
    );
  }

  return next();
});
```

## Security Benefits

- Server never sees plaintext passwords
- Encrypted data remains secure even if server is compromised
- Timing-safe comparison prevents side-channel attacks
- EnvLink-specific salts prevent cross-resource attacks
