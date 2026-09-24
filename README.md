# EnvLink

Secure and anonymous environment file sharing CLI - Share `.env` files with expiration and password protection.

[![npm version](https://img.shields.io/npm/v/envlink.svg)](https://www.npmjs.com/package/envlink)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Secure sharing with encryption
- Auto-expiration (minutes, hours, days, years, or never)
- Optional password protection
- No signup or authentication required
- Share multiple files at once
- Update existing EnvLinks

## Installation

```bash
npm install -g envlink
```

## Quick Start

### Create and Share

```bash
cd my-project
envlink create
```

### Install

```bash
envlink install <id>
```

## Usage

### Create EnvLink

```bash
# Interactive mode
envlink create

# With options
envlink create --exp 7d
envlink create --exp-pass mypassword
envlink create --exp 5d --exp-pass secretpass
```

**Expiration formats:** `30m`, `24h`, `5d`, `1y`, `never`

### Install EnvLink

```bash
envlink install <id>
```

### View Info

```bash
envlink info <id>
```

### Update EnvLink

```bash
envlink update <id> --files
envlink update <id> --exp never
```

### Expire EnvLink

```bash
envlink expire <id>
envlink expire <id> --exp-pass mypassword
```

### Help

```bash
envlink --help
envlink create --help
```

## Security

- End-to-end encryption
- Password hashing with bcrypt
- Automatic expiration
- HTTPS transport only
- No authentication required (anonymous)
