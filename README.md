# EnvLink

Secure and anonymous environment file sharing CLI - Share `.env` files with expiration and password protection.

[![npm version](https://img.shields.io/npm/v/envlink.svg)](https://www.npmjs.com/package/envlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

### Permanent Installation

```bash
npm install -g envlink
```

### One-Time Use (No Installation)

You can use EnvLink without installing it permanently:

```bash
# Using npx (Node.js)
npx envlink create
npx envlink install el_abc123xyz456

# Using bunx (Bun)
bunx envlink create
bunx envlink install el_abc123xyz456

# Using pnpm
pnpm dlx envlink create
pnpm dlx envlink install el_abc123xyz456
```

## Quick Start

### Create and Share

```bash
cd my-project
envlink create
```

Share the generated EnvLink ID with your team!

### Install on Another Machine

```bash
envlink install el_abc123xyz456
```

That's it! Your environment files are now installed.

## Documentation

- **[Command Reference](https://envlink.ababilspark.com)** - Complete command reference
- **[FAQ](https://envlink.ababilspark.com/faq)** - Frequently Asked Questions

## Security

- Auto-expiration (configurable)
- Optional password protection
- No signup required
- Anonymous sharing
