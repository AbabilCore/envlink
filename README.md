# EnvLink

Secure and anonymous environment file sharing CLI - Share `.env` files with expiration and optional password protection.

[![npm version](https://img.shields.io/npm/v/envlink.svg)](https://www.npmjs.com/package/envlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Key Features

- **Two Security Models**: Password-protected (zero-knowledge) and optional-password (convenient)
- **Quick Sharing**: Password-free sharing with extended IDs
- **Strong Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Auto-Expiration**: From minutes to never (password-protected) or fixed 1-hour (optional-password)
- **No Signup**: Completely anonymous
- **Update Support**: Modify password-protected EnvLinks after creation
- **Multi-File Support**: Share multiple .env files in one link (2.5MB payload limit)

## Installation

### Recommended: Use Without Installing

```bash
# Using npx (Node.js)
npx envlink create
npx envlink install el_abc123xyz456

# Using bunx (Bun)
bunx envlink create

# Using pnpm
pnpm dlx envlink create
```

### Optional: Install Globally

```bash
npm install -g envlink
```

## Quick Start

### Password-Protected (Secure)

Create a secure EnvLink with password protection:

```bash
npx envlink create --pass yourpassword
```

Share the ID and password with your team:

```bash
npx envlink install el_abc123xyz456 --pass yourpassword
```

### Optional-Password (Convenient, Default)

Create a convenient EnvLink without passwords (1-hour expiration):

```bash
npx envlink create
```

Share just the extended ID:

```bash
npx envlink install el_abc123xyz456accesskey789
```

## Documentation

- **[Command Reference](https://envlink.ababilspark.com/commands)** - Complete command reference
- **[FAQ](https://envlink.ababilspark.com/faq)** - Frequently Asked Questions

## Security

EnvLink offers two security models:

### Password-Protected EnvLinks

- **Zero-knowledge security** - Server cannot decrypt your data
- AES-256-GCM encryption with PBKDF2 key derivation
- Zero-knowledge proof authentication
- Flexible expiration (minutes to never)
- Full update support

### Optional-Password EnvLinks

- **Ultra-clean zero-knowledge security** - Server cannot decrypt your data
- AES-256-GCM encryption with client-side access keys
- Extended ID format embeds decryption key (never sent to server)
- Fixed 1-hour expiration
- Install-only after creation (no updates)
- **Perfect for convenient sharing while maintaining security**

**Both methods:**

- Complete zero-knowledge security
- No signup required
- Anonymous sharing
- Client-side encryption before transmission

## Self-Hosting

Want to run your own EnvLink server? See the [Self-Hosting Guide](https://envlink.ababilspark.com/self-host) for complete setup instructions.
