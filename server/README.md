# EnvLink Server

Backend server for EnvLink - API server and documentation website built with Express, TypeScript, and MongoDB.

## Features

- **REST API** for environment file sharing with zero-knowledge encryption
- **Documentation Website** serving markdown docs as HTML pages
- **Stats Tracking** for created, installed, and expired shares
- **Rate Limiting** to prevent abuse
- **Auto-Expiration** cron job for expired entries

> **🔒 Zero-Knowledge Security**: This server cannot decrypt your shared environment files. All encryption/decryption happens client-side. The server only stores encrypted payloads and never has access to your plaintext data or encryption keys.

## Tech Stack

- **Runtime:** Bun / Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **View Engine:** EJS
- **Markdown:** Marked + Highlight.js

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=8000
DB_URI=mongodb://localhost:27017/envlink
PROD_SITE_URL=https://envlink.ababilspark.com
```

> **Note:** `PROD_SITE_URL` is only used in production mode (`bun run start`). In development and preview modes, the server automatically uses `http://localhost:{PORT}`.

### 3. Development

```bash
bun run dev
```

Server runs at: http://localhost:8000

### 4. Production

```bash
bun run build
bun run start
```

## Scripts

- `bun run dev` - Development mode with hot reload
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run start` - Run production build

## API Endpoints

- **POST** `/api/envlinks` - Create a new encrypted share
- **POST** `/api/envlinks/:id/info` - Get share metadata
- **POST** `/api/envlinks/:id/install` - Retrieve encrypted data
- **PUT** `/api/envlinks/:id` - Update existing share (password-protected only)
- **DELETE** `/api/envlinks/:id` - Expire a share
- **GET** `/api/envlinks/cron/cleanup` - Cleanup expired shares (protected by `CRON_SECRET` if set)
- **GET** `/api/stats` - Get platform statistics

> **Why POST for info/install?** These endpoints require `passwordProof` in the request body for password-protected shares. GET requests cannot have a body, so POST is used to securely transmit the proof without exposing it in URLs or query parameters.

## Documentation Routes

- `/` - Homepage (README.md)
- `/commands` - CLI commands reference
- `/faq` - Frequently asked questions
- `/self-host` - Self-hosting guide
- `/changelog` - Version history
- `/workflow` - Technical workflows
- `/workflow/encryption-flow` - Encryption diagram
- `/workflow/authentication-flow` - Authentication diagram

## Environment Variables

| Variable        | Description                            | Required | Example                             |
| --------------- | -------------------------------------- | -------- | ----------------------------------- |
| `PORT`          | Server port                            | Yes      | `8000`                              |
| `DB_URI`        | MongoDB connection string              | Yes      | `mongodb://localhost:27017/envlink` |
| `PROD_SITE_URL` | Production site URL                    | Yes      | `https://envlink.ababilspark.com`   |
| `CRON_SECRET`   | Secret token for cron cleanup endpoint | No       | `your-secret-token-here`            |

> **Note:** `NODE_ENV` is automatically set by the run scripts (`dev`, `start`, `preview`) and should not be added to `.env`.
>
> **Cron Protection:** If `CRON_SECRET` is set, the `/api/envlink/cron/cleanup` endpoint will require an `X-Cron-Secret` header matching this value.

## Deployment

For detailed deployment instructions, see the [Self-Hosting Guide](https://github.com/AbabilCore/envlink/blob/main/self-host.md).

## Cron Job Setup

The server provides an auto-cleanup endpoint for expired EnvLinks at `/api/envlinks/cron/cleanup`.

### Without Protection

If `CRON_SECRET` is not set, the endpoint is publicly accessible:

```bash
curl https://your-domain.com/api/envlinks/cron/cleanup
```

### With Protection (Recommended)

Set `CRON_SECRET` in your `.env`:

```env
CRON_SECRET=your-random-secret-token
```

Then configure your cron service with the secret header:

**Linux Cron:**

```bash
crontab -e
```

Add this line to run cleanup every hour:

```cron
0 * * * * curl -H "X-Cron-Secret: your-random-secret-token" https://your-domain.com/api/envlinks/cron/cleanup
```

**EasyCron / Cron-job.org:**

- URL: `https://your-domain.com/api/envlinks/cron/cleanup`
- Method: `GET`
- Headers: `X-Cron-Secret: your-random-secret-token`
- Schedule: Every hour

**Render / Railway Cron:**

Create a cron job with:

- Command: `curl -H "X-Cron-Secret: $CRON_SECRET" https://your-domain.com/api/envlinks/cron/cleanup`
- Schedule: `0 * * * *`

## License

MIT License - see [LICENSE](https://github.com/AbabilCore/envlink/blob/main/LICENSE) for details.
