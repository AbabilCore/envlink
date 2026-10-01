# EnvLink FAQ

## Expiration

<details>
<summary>What expiration formats are supported?</summary>

**Password-Protected EnvLinks:** Support flexible expiration - minutes (m), hours (h), days (d), months (M), years (y), or 'never'. Examples: `30m` for 30 minutes, `24h` for 24 hours, `5d` for 5 days, `6M` for 6 months, `1y` for 1 year, or `never` for permanent links.

**Optional-Password EnvLinks:** Fixed 1-hour expiration for security and convenience.

</details>

<details>
<summary>What is the default expiration time?</summary>

**Password-Protected:** 1 day if not specified during creation  
**Optional-Password:** Fixed 1 hour (cannot be changed)

</details>

<details>
<summary>Can I create an EnvLink that never expires?</summary>

Yes, use `--exp never` when creating or updating an EnvLink to make it permanent.

</details>

<details>
<summary>What happens to expired EnvLinks?</summary>

When manually expired or cleaned up by automatic maintenance, the EnvLink is permanently deleted from the server.

</details>

## Security

<details>
<summary>Is password protection required?</summary>

No, password protection is optional. EnvLink supports two types:

**Password-Protected EnvLinks:** Use `envlink create --pass <password>` for enhanced security with explicit password protection.

**Optional-Password EnvLinks:** Use `envlink create --optional-pass` for convenient sharing without password requirements. These expire automatically after 1 hour and use an extended ID format (e.g., el_abc123xyz456_accesskey789).

Both types maintain client-side encryption - your data is always encrypted before transmission to the server.

</details>

<details>
<summary>What's the difference between password-protected and optional-password EnvLinks?</summary>

| Feature | Password-Protected | Optional-Password |
|---------|-------------------|-------------------|
| **Password Required** | Yes, for all operations | No password needed |
| **Server Can Decrypt** | **No** (Zero-knowledge) | **Yes** (Has access key) |
| **ID Format** | `el_abc123xyz456` | `el_abc123xyz456_accesskey789` |
| **Expiration** | Flexible (minutes to never) | Fixed 1 hour |
| **Update Support** | Yes (with current password) | No (install-only after creation) |
| **Security Level** | High (Zero-knowledge proof) | Lower (Convenience trade-off) |
| **Use Case** | Sensitive data, team sharing | Non-sensitive, temporary sharing |

Both types use client-side encryption, but only password-protected EnvLinks are zero-knowledge secure.

</details>

<details>
<summary>Can the server decrypt my data? 🔥 <i>(Most Asked)</i></summary>

**Password-Protected EnvLinks:** **No.** The server uses zero-knowledge proof (ZK-proof) authentication and only stores encrypted data and password hashes. Your password derives the encryption key through PBKDF2, and the server can verify you know the correct password **without ever seeing or storing the password itself**. The server **cannot decrypt your data**.

**Optional-Password EnvLinks:** **Yes.** For convenience, the server can decrypt your data since it stores the access key used for encryption. This trade-off provides password-free sharing but with reduced security. Use only for non-sensitive data or temporary sharing.

</details>

<details>
<summary>Can I add a reference label to my EnvLink?</summary>

Yes, use the `--ref` option to add a descriptive label (e.g., "production-api-keys", "staging-db"). This helps organize and identify EnvLinks, especially when managing multiple links.

</details>

<details>
<summary>How is my data secured?</summary>

All file content is encrypted using AES-256-GCM encryption before storage. The encryption uses a unique initialization vector (IV) and salt for each EnvLink.

**Password-Protected Security (ZK-Proof Authentication):**

```mermaid
graph LR
    A[Password + Files] --> B[SHA256 Hash Password]
    B --> C[Generate Salt + IV]
    C --> D[PBKDF2 Key Derivation]
    D --> E[AES-256-GCM Encrypt]
    E --> F[ZK-Proof Authentication]
    F --> G[Store: Encrypted Data + Salt + IV + Hash]

    H[Install: Password] --> I[Generate ZK-Proof]
    I --> J[Verify Server-side]
    J --> K[PBKDF2 with Salt]
    K --> L[AES-256-GCM Decrypt]
    L --> M[Original Files]
```

**Optional-Password Security (Access-Key Authentication):**

```mermaid
graph LR
    A[Files Only] --> B[Generate Access Key]
    B --> C[Generate Salt + IV]
    C --> D[Client-side Key Derivation]
    D --> E[AES-256-GCM Encrypt]
    E --> F[Store: Encrypted Data + Access Key]

    G[Install: Extended ID] --> H[Extract Access Key]
    H --> I[Verify Access Key]
    I --> J[Client-side Decryption]
    J --> K[Original Files]
```

**Server Security Guarantees:**
- **Password-Protected:** Server never stores passwords, encryption keys, or auth tokens - **Cannot decrypt your data**
- **Optional-Password:** Server stores access keys and **can decrypt your data** for convenience
- **Both:** Use AES-256-GCM encryption and PBKDF2 (100,000 iterations)

**⚠️ Security Trade-off:** Optional-password EnvLinks sacrifice security for convenience. Use only for non-sensitive data.

</details>

## File Limits

<details>
<summary>How many files can I share in one EnvLink?</summary>

You can share up to 10 .env files in a single EnvLink.

</details>

<details>
<summary>What is the file size limit?</summary>

Each individual file can be up to 100KB, and the total payload for all files combined cannot exceed 500KB.

</details>

<details>
<summary>What file naming patterns are accepted?</summary>

Files must follow the .env naming pattern: `.env` or `.env.{suffix}` where suffix can contain alphanumeric characters, underscores, or hyphens (e.g., .env, .env.local, .env.production).

</details>

## Technical

<details>
<summary>What is the format of an EnvLink ID?</summary>

**Password-Protected:** `el_` followed by 16 alphanumeric characters (e.g., `el_abc123xyz456`)

**Optional-Password:** Extended format with `el_` + 16 chars + `_` + access key (e.g., `el_abc123xyz456_accesskey789`)

The extended format allows secure access without password while maintaining encryption.

</details>

<details>
<summary>What happens if a file already exists during installation?</summary>

EnvLink will detect existing files and prompt you to confirm overwriting them. Files marked as existing will show a warning indicator during the selection process.

</details>

## Note:

> **"If EnvLink doesn't resonate with your workflow, that's perfectly fine—you're free to choose what works best for you. But if it does, I hope it makes sharing environment files just a little bit easier and safer for your team."**
>
> — _**envlink** developer team_
