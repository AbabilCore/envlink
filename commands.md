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

# Create with 5 day expiration
envlink create --exp 5d

# Create with password protection
envlink create --exp-pass <password>

# Create with 1 year expiration and password
envlink create --exp 1y --exp-pass <password>
```

**Expiration units:** `m` (minutes), `M` (hours), `d` (days), `y` (years), `never`

## Install Commands

```bash
# Install all files from EnvLink
envlink install <id>

# Install with file selection prompt
envlink install <id> -s
envlink install <id> --select-files
```

## Info Commands

```bash
# Show EnvLink details (status, files, expiry, install count)
envlink info <id>
```

## Update Commands

```bash
# Update files from current directory
envlink update <id> -f
envlink update <id> --files

# Update expiration to 30 days
envlink update <id> --exp 30d

# Update/set expiration password
envlink update <id> --exp-pass <new-password>

# Provide current password for protected EnvLink
envlink update <id> --current-pass <password>

# Update files and set to never expire
envlink update <id> -f --exp never

# Update files with authentication
envlink update <id> --files --current-pass <password>
```

## Expire Commands

```bash
# Manually expire an EnvLink (if not password protected)
envlink expire <id>

# Expire EnvLink with password validation
envlink expire <id> --exp-pass <password>
```

## Examples

### Basic Workflow

```bash
# 1. Create an EnvLink
envlink create

# 2. Check EnvLink status
envlink info el_abc123xyz456

# 3. Install on another machine
envlink install el_abc123xyz456
```

### Advanced Workflow

```bash
# 1. Create 7-day link with password
envlink create --exp 7d --exp-pass mypass123

# 2. Update files later
envlink update el_abc123xyz456 --files --current-pass mypass123

# 3. Manually expire when done
envlink expire el_abc123xyz456 --exp-pass mypass123
```

## Common Options

| Option                      | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| `--exp <duration>`          | Expiration duration: `30m`, `24M`, `5d`, `1y`, or `never` |
| `--exp-pass <password>`     | Password for protection/expiration                        |
| `--current-pass <password>` | Current password (required for updating protected links)  |
| `-f, --files`               | Update files flag                                         |
| `-s, --select-files`        | File selection mode for install                           |

## Notes

- **Default expiration:** 24 days if not specified
- **EnvLink ID format:** `el_<16-char-alphanumeric>`
- **Password protection:** Required for updates and manual expiration of protected links
- **Expired links:** Cannot be installed or updated
- **Never expire:** Use `--exp never` for permanent links
