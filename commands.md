# EnvLink CLI Commands Reference

Complete command reference for EnvLink CLI tool.

## Version & Help

```bash
# Show version number
envlink -v
envlink -V
envlink --version

# Show help for all commands
envlink -h
envlink --help

# Show help for a specific command
envlink help <command>
```

## Create Commands

```bash
# Interactive creation (prompts for files, expiration, password)
envlink create

# Create with 5 day expiration (password required, will prompt)
envlink create --exp 5d

# Create with password (non-interactive)
envlink create --pass <password>

# Create with reference label
envlink create --ref "production-api-keys"

# Create with all options
envlink create --exp 1y --pass <password> --ref "prod-env"
```

**Expiration units:** `m` (minutes), `h` (hours), `d` (days), `M` (months), `y` (years), `never`

**Password:** Required for all EnvLinks. If not provided via `--pass`, you'll be prompted.

## Install Commands

```bash
# Install all files from EnvLink (password required, will prompt)
envlink install <id>

# Install with file selection prompt
envlink install <id> -s
envlink install <id> --select-files
```

**Note:** Password is required for installation. You'll be prompted if not provided.

## Info Commands

```bash
# Show EnvLink details (status, files, expiry, install count)
envlink info <id>
```

**Note:** Password is required and you'll be prompted for it.

## Update Commands

```bash
# Update files from current directory (current password required)
envlink update <id> -f --current-pass <password>
envlink update <id> --files --current-pass <password>

# Update expiration to 30 days
envlink update <id> --exp 30d --current-pass <password>

# Update password (current password required for authentication)
envlink update <id> --pass <new-password> --current-pass <password>

# Update reference label
envlink update <id> --ref "staging-keys" --current-pass <password>

# Update files and set to never expire
envlink update <id> -f --exp never --current-pass <password>

# Combine multiple updates
envlink update <id> --files --exp 7d --ref "temp-keys" --current-pass <password>
```

**Note:** Current password (`--current-pass`) is required for authentication in all update operations.

## Expire Commands

```bash
# Manually expire an EnvLink (password required, will prompt)
envlink expire <id>

# Expire with password (non-interactive)
envlink expire <id> --pass <password>
```

## Examples

### Basic Workflow

```bash
# 1. Create an EnvLink (password required, will prompt)
envlink create

# 2. Check EnvLink status (password required, will prompt)
envlink info el_abc123xyz456

# 3. Install on another machine (password required, will prompt)
envlink install el_abc123xyz456
```

### Advanced Workflow

```bash
# 1. Create 7-day link with password and reference
envlink create --exp 7d --pass mypass123 --ref "prod-db-keys"

# 2. Update files later (current password required)
envlink update el_abc123xyz456 --files --current-pass mypass123

# 3. Manually expire when done (password required)
envlink expire el_abc123xyz456
```

## Common Options

| Option                      | Description                                                     |
| --------------------------- | --------------------------------------------------------------- |
| `--exp <duration>`          | Expiration duration: `30m`, `24h`, `5d`, `6M`, `1y`, or `never` |
| `--pass <password>`         | Password (required for create/expire operations)                |
| `--current-pass <password>` | Current password (required for update operations)               |
| `--ref <reference>`         | Reference label (e.g., "prod-api-keys", "staging-db")           |
| `-f, --files`               | Update files flag                                               |
| `-s, --select-files`        | File selection mode for install                                 |

## Notes

- **Default expiration:** 1 day if not specified
- **EnvLink ID format:** `el_<16-char-alphanumeric>`
- **Password protection:** Required for all EnvLinks (create, install, info, update, expire)
- **Reference labels:** Optional labels for organizing EnvLinks (e.g., "prod", "staging")
- **Expired links:** Cannot be installed or updated
- **Never expire:** Use `--exp never` for permanent links
- **Time units:** `m` (minutes), `h` (hours), `d` (days), `M` (months), `y` (years)
