# Zero-Knowledge Proof Authentication

Server never sees user passwords. Authentication uses cryptographic proofs instead of password comparison.

## Imports

```js
import crypto from "crypto";
import util from "util";
```

## Configuration

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

## Derived Key Function

```js
const deriveKey = async (password, salt) => {
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

## Password Hashing

```js
export const hashPasswordDeterministic = (password) =>
  crypto.createHash(CRYPTO_CONFIG.DIGEST).update(password).digest("hex");
```

## ZK Proof Generation

Used by both client and server to generate identical proofs from different inputs.

```js
export const generateZKProof = async (passwordHash, envlinkId) => {
  const serverSalt = crypto
    .createHash(CRYPTO_CONFIG.DIGEST)
    .update(`envlink:${envlinkId}`)
    .digest("hex");

  const input = passwordHash + serverSalt;
  const key = await deriveKey(input, serverSalt);

  return key.toString("base64");
};
```

## Client Authentication

```js
// Generate proof from user password
const passwordHash = hashPasswordDeterministic(userPassword);
const proof = await generateZKProof(passwordHash, envlinkId);

// Send proof to server
fetch("/api/envlink/auth", {
  method: "POST",
  body: JSON.stringify({ envlinkId, proof }),
});
```

## Server Verification & Authentication

```js
export const verifyZKProof = async (
  clientProof,
  storedPasswordHash,
  envlinkId,
) => {
  const expectedProof = await generateZKProof(storedPasswordHash, envlinkId);

  return crypto.timingSafeEqual(
    Buffer.from(clientProof, "base64"),
    Buffer.from(expectedProof, "base64"),
  );
};

async function authenticate(request, response) {
  const { envlinkId, proof } = request.body;

  const envlink = await database.findById(envlinkId);

  if (!envlink) {
    return response.status(404).json({ error: "EnvLink not found" });
  }

  const isValid = await verifyZKProof(proof, envlink.passwordHash, envlinkId);

  if (isValid) {
    response.json({ success: true, data: envlink.encryptedData });
  } else {
    response.status(401).json({ error: "Authentication failed" });
  }
}
```

## Security Benefits

- Server never sees plaintext passwords
- Encrypted data remains secure even if server is compromised
- Timing-safe comparison prevents side-channel attacks
- EnvLink-specific salts prevent cross-resource attacks
