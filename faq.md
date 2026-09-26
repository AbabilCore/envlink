# EnvLink FAQ

## General

<details>
<summary>What is EnvLink?</summary>

EnvLink is a secure and anonymous CLI tool for sharing environment (.env) files with your team. It allows you to share sensitive configuration files with built-in expiration and optional password protection without requiring signup or authentication.

</details>

<details>
<summary>How do I install EnvLink?</summary>

You can install EnvLink globally with `npm install -g envlink`, or use it without installation via `npx envlink`, `bunx envlink`, or `pnpm dlx envlink`.

</details>

<details>
<summary>What is the basic workflow for sharing .env files?</summary>

Run `envlink create` in your project directory to create an EnvLink and get a unique ID (e.g., el_abc123xyz456). Share this ID with your team, and they can run `envlink install el_abc123xyz456` to receive the files.

</details>

<details>
<summary>Do I need to create an account to use EnvLink?</summary>

No, EnvLink is completely anonymous and does not require any signup or authentication.

</details>

<details>
<summary>What Node.js version is required?</summary>

EnvLink requires Node.js version 18.0.0 or higher.

</details>

## Commands

<details>
<summary>How do I see all available commands?</summary>

Run `envlink --help` to see all commands, or `envlink <command> --help` for help with a specific command.

</details>

<details>
<summary>How do I check the status of an EnvLink?</summary>

Use `envlink info <id>` to view details including status, file count, expiration date, install count, and file names.

</details>

<details>
<summary>Can I update an existing EnvLink?</summary>

Yes, use `envlink update <id>` with options like `--files` to update files, `--exp` to change expiration, or `--exp-pass` to modify the password. Protected links require `--current-pass` for authentication.

</details>

<details>
<summary>How do I manually expire an EnvLink?</summary>

Use `envlink expire <id>` to manually expire a link. If the link is password-protected, include `--exp-pass <password>` for validation.

</details>

<details>
<summary>Can I select which files to install?</summary>

Yes, use `envlink install <id> --select-files` or `-s` to get a prompt allowing you to choose which files to install.

</details>

## Expiration

<details>
<summary>What expiration formats are supported?</summary>

EnvLink supports: minutes (m), hours (h), days (d), months (M), years (y), or 'never'. Examples: `30m` for 30 minutes, `24h` for 24 hours, `5d` for 5 days, `6M` for 6 months, `1y` for 1 year, or `never` for permanent links.

</details>

<details>
<summary>What is the default expiration time?</summary>

The default expiration time is 1 day if not specified during creation.

</details>

<details>
<summary>Can I create an EnvLink that never expires?</summary>

Yes, use `--exp never` when creating or updating an EnvLink to make it permanent.

</details>

<details>
<summary>What happens to expired EnvLinks?</summary>

Expired EnvLinks cannot be installed or updated. The status automatically changes to 'expired' when the expiration date is reached or when manually expired. Additionally, the record will be deleted from the EnvLink server after expiration.

</details>

## Security

<details>
<summary>Can I protect my EnvLink with a password?</summary>

Yes, use the `--exp-pass <password>` option when creating or updating an EnvLink. Password-protected links require authentication for updates and manual expiration.

</details>

<details>
<summary>How is my data secured?</summary>

All file content is encrypted using AES-256-GCM encryption before storage. The encryption uses a unique initialization vector (IV) for each EnvLink, and passwords are hashed using bcrypt.

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

EnvLink IDs follow the format `el_` followed by 16 alphanumeric characters (e.g., el_abc123xyz456).

</details>

<details>
<summary>What happens if a file already exists during installation?</summary>

EnvLink will detect existing files and prompt you to confirm overwriting them. Files marked as existing will show a warning indicator during the selection process.

</details>

## Note:

> **"If EnvLink doesn't resonate with your workflow, that's perfectly fine—you're free to choose what works best for you. But if it does, I hope it makes sharing environment files just a little bit easier and safer for your team."**
>
> — _**envlink** developer team_
