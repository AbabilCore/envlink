# EnvLink CLI Commands Reference

Complete command reference for EnvLink CLI tool.

> **Tip:** Use `npx envlink` to run without installing: `npx envlink create`

## Version & Help

```bash
# Show version number
npx envlink -v
npx envlink --version

# Show help for all commands
npx envlink --help

# Show help for a specific command
npx envlink help <command>

# Check for available updates
npx envlink check-update
```

## Create Commands

```bash
# Interactive creation - creates optional-password EnvLink by default
npx envlink create

# Create with 5 day expiration (no password, optional-password EnvLink)
npx envlink create --exp 5d

# Create password-protected EnvLink (will prompt for password)
npx envlink create --pass

# Create password-protected with provided password
npx envlink create --pass <password>

# Create with reference label
npx envlink create --pass "your password" --ref "production-api-keys"

# Create password-protected with all options
npx envlink create --pass <password> --exp 1y --ref "prod-env"
```

**Expiration units:** `m` (minutes), `h` (hours), `d` (days), `M` (months), `y` (years)

**Password:** Required for regular EnvLinks. If not provided via `--pass`, you'll be prompted.

**Optional-password:** Creates EnvLinks without password authentication using `--optional-pass` flag.

## Install Commands

```bash
# Install all files from EnvLink (password required for regular EnvLinks)
npx envlink install <id>

# Install with file selection prompt
npx envlink install <id> -s
npx envlink install <id> --select-files

# Install from optional-password EnvLink (no password required)
npx envlink install <extended_id>
```

**Note:** Password is required for regular EnvLinks. Optional-password EnvLinks use extended ID format and don't require passwords.

## Info Commands

```bash
# Show EnvLink details (status, files, expiry, install count)
npx envlink info <id>

# Show optional-password EnvLink details (no password required)
npx envlink info <extended_id>
```

**Note:** Password is required for regular EnvLinks. Optional-password EnvLinks use extended ID format and don't require passwords.

## Update Commands

```bash
# Update files from current directory (current password required)
npx envlink update <id> -f --current-pass <password>
npx envlink update <id> --files --current-pass <password>

# Update expiration to 30 days
npx envlink update <id> --exp 30d --current-pass <password>

# Update password (current password required for authentication)
npx envlink update <id> --pass <new-password> --current-pass <password>

# Update reference label
npx envlink update <id> --ref "staging-keys" --current-pass <password>

# Combine multiple updates
npx envlink update <id> --files --exp 7d --ref "temp-keys" --current-pass <password>
```

**Note:** Update operations are only supported for regular password-protected EnvLinks. Optional-password EnvLinks cannot be updated for security reasons.

## Expire Commands

```bash
# Manually expire a regular EnvLink (password required, will prompt)
npx envlink expire <id>

# Expire with password (non-interactive)
npx envlink expire <id> --pass <password>

# Expire optional-password EnvLink (no password required)
npx envlink expire <extended_id>
```

**Note:** Password is required for regular EnvLinks. Optional-password EnvLinks can be expired without passwords.

## Version Check Commands

```bash
# Check for available updates (manual check)
npx envlink version-check
npx envlink check-update

# Both commands are aliases and do the same thing:
# - Check NPM registry for the latest EnvLink version
# - Display update notification if newer version is available
# - Show "up to date" message if current version is latest
```

**Note:** Version checks help ensure you have the latest features and security updates.

## Examples

### Basic Workflow

```bash
# 1. Create an EnvLink (optional-password by default, no password needed)
npx envlink create

# 2. Check EnvLink status using extended ID (no password needed)
npx envlink info el_abc123def456ghi789jkl012mno345678
npx envlink info el_abc123xyz456

# 3. Install on another machine (password required, will prompt)
npx envlink install el_abc123xyz456
```

### Optional-Password Workflow

```bash
# 1. Create optional-password EnvLink (default behavior)
npx envlink create

# 2. Check status using extended ID (no password required)
npx envlink info el_abc123def456ghi789jkl012mno345678
npx envlink info el_abc123xyz456accesskey789

# 3. Install on another machine (no password required)
npx envlink install el_abc123xyz456accesskey789

# 4. Expire when done (no password required)
npx envlink expire el_abc123xyz456accesskey789
```

### Advanced Workflow

```bash
# 1. Check for updates first
npx envlink version-check

# 2. Create 7-day password-protected link with reference
npx envlink create --pass mypass123 --exp 7d --ref "prod-db-keys"

# 3. Update files later (current password required)
npx envlink update el_abc123xyz456 --files --current-pass mypass123

# 4. Manually expire when done (password required)
npx envlink expire el_abc123xyz456
```

### Version Management

```bash
# Check for EnvLink CLI updates
npx envlink version-check

# Alternative alias
npx envlink check-update

# Example output when update is available:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#   ⚠ Update Available!
#   Current: 2.0.0 → Latest: 2.2.2
#   Run: npx envlink (uses latest version automatically)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Common Commands

| Command                     | Description                                                               |
| --------------------------- | ------------------------------------------------------------------------- |
| `npx envlink create`        | Create a new EnvLink from local .env files (optional-password by default) |
| `npx envlink install <id>`  | Install environment files from an EnvLink                                 |
| `npx envlink info <id>`     | Show EnvLink information (files, expiry, install count)                   |
| `npx envlink update <id>`   | Update an existing EnvLink (regular EnvLinks only)                        |
| `npx envlink expire <id>`   | Manually expire an EnvLink                                                |
| `npx envlink version-check` | Check for available CLI updates                                           |

## Common Options

| Option                      | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `--exp <duration>`          | Expiration duration: `30m`, `24h`, `5d`, `6M`, `1y`   |
| `--pass <password>`         | Password (required for create/expire operations)      |
| `--current-pass <password>` | Current password (required for update operations)     |
| `--ref <reference>`         | Reference label (e.g., "prod-api-keys", "staging-db") |
| `-f, --files`               | Update files flag                                     |
| `-s, --select-files`        | File selection mode for install                       |

## Notes

- **Default expiration:** 1 day for regular EnvLinks, 1 hour (fixed) for optional-password EnvLinks
- **EnvLink ID formats:**
  - Regular: `el_<16-char-alphanumeric>`
  - Optional-password: `el_<32-char-alphanumeric>` (concatenated baseId + accessKey)
- **Password protection:** Required for regular EnvLinks (create, install, info, update, expire)
- **Optional-password EnvLinks:** No password required, use access key authentication via extended ID
- **Reference labels:** Optional labels for organizing regular EnvLinks (not supported for optional-password)
- **Expired links:** Cannot be installed or updated
- **Time units:** `m` (minutes), `h` (hours), `d` (days), `M` (months), `y` (years)
- **Operation support:**
  - Regular EnvLinks: create, info, install, update, expire
  - Optional-password EnvLinks: create, info, install, expire (update not supported for security)
- **Date format:** All dates displayed in DD/MM/YYYY H:M:S format
