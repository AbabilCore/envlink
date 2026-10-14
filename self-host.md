# Self-Hosting Guide

This guide covers how to self-host the EnvLink server and optionally contribute to CLI development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **Bun** (for server) - [Install Bun](https://bun.sh)
- **MongoDB** (local or cloud instance)
- **Git**

## Part 1: Server Setup

### 1. Clone Repository

```bash
git clone https://github.com/AbabilCore/envlink.git
cd envlink/server
```

### 2. Install Dependencies

```bash
bun install
```

### 3. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Use it in your `.env` file

#### Option B: Local MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb
brew services start mongodb-community
```

Connection string: `mongodb://localhost:27017/envlink`

### 4. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=8000
DB_URI=mongodb://localhost:27017/envlink
PROD_SITE_URL=https://your-domain.com
CRON_SECRET=your-random-secret-token
```

### 5. Start Server

**Development:**

```bash
bun run dev
```

Server runs at: http://localhost:8000

**Production:**

```bash
bun run build
bun run start
```

**Preview (test production build locally):**

```bash
bun run preview
```

### 6. Server Scripts Reference

- `bun run dev` - Development mode with hot reload
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run start` - Run production build
- `bun run test:api` - Run API test suite

### 7. Deployment Options

#### VPS Deployment (Most Control)

1. **Setup Server**
   - Ubuntu 20.04+ or similar
   - Install Node.js, Bun, MongoDB (or use MongoDB Atlas)
   - Configure firewall to allow port 8000

2. **Clone and Setup**

   ```bash
   git clone https://github.com/AbabilCore/envlink.git
   cd envlink/server
   bun install
   cp .env.example .env
   ```

3. **Configure Environment**
   - Edit `.env` file
   - Set your domain and MongoDB URI

4. **Process Manager (PM2)**

   ```bash
   npm install -g pm2
   pm2 start scripts/app.sh --name envlink-server --interpreter bash -- start
   pm2 save
   pm2 startup
   ```

5. **Reverse Proxy (Nginx)**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **SSL with Certbot**

   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

#### Cloud Platforms (Render / Railway)

1. Connect your GitHub repository
2. Set root directory: `./`
3. Set build command: `cd server && bun install && bun run build`
4. Set start command: `cd server && bun run start`
5. Add environment variables:
   - `PORT=8000`
   - `DB_URI=<your-mongodb-uri>`
   - `PROD_SITE_URL=<your-url>`
   - `CRON_SECRET=<optional-secret>`

### 8. Cron Job Setup

Set up automatic cleanup of expired EnvLinks:

**Without Protection:**

```bash
curl https://your-domain.com/api/envlinks/cron/cleanup
```

**With Protection (Recommended):**

If `CRON_SECRET` is set in `.env`, configure cron with the header:

**Linux Cron:**

```bash
crontab -e
```

Add this line (runs every hour):

```cron
0 * * * * curl -H "X-Cron-Secret: your-random-secret-token" https://your-domain.com/api/envlinks/cron/cleanup
```

**EasyCron / Cron-job.org:**

- URL: `https://your-domain.com/api/envlinks/cron/cleanup`
- Method: `GET`
- Headers: `X-Cron-Secret: your-random-secret-token`
- Schedule: Every hour

**Render / Railway Cron:**

- Command: `curl -H "X-Cron-Secret: $CRON_SECRET" https://your-domain.com/api/envlinks/cron/cleanup`
- Schedule: `0 * * * *`

### 9. Test Your Server

```bash
cd server
bun run test:api
```

For more server details, see the [server README](./server/README.md).

## Part 2: CLI Development (Optional)

Want to contribute to or modify the CLI? Here's how:

### 1. Setup CLI Development

From the repository root:

```bash
npm install
```

### 2. Development Mode

```bash
npm run dev
```

### 3. Local Testing

Test commands without building or linking:

```bash
npm run dev -- create
npm run dev -- install <id>
npm run dev -- info <id>
npm run dev -- update <id>
npm run dev -- expire <id>
```

Or use the Python automated test script:

```bash
npm run test:cli
```

### 4. CLI Scripts Reference

- `npm run dev` - Development mode with watch
- `npm run test` - Run CLI directly in interactive mode
- `npm run test:cli` - Run Python automated test script
- `npm run build` - Build for production
- `npm start` - Run built version

### 5. Build CLI

```bash
npm run build
```

### 6. Test Built Version

```bash
npm link
envlink create
```

### 7. Publishing Your Own CLI (Scoped Package)

Want to publish your modified version? Publish as a scoped package:

#### Update package.json

```json
{
  "name": "@your-username/envlink",
  "version": "1.0.0",
  "description": "Your custom EnvLink CLI"
}
```

#### Configure Your API Endpoint

Update [`src/config/index.ts`](https://github.com/AbabilCore/envlink/blob/main/src/config/index.ts#L6):

```typescript
const ENV = {
  IS_DEV: process.env.NODE_ENV === "development",
  get API_URL() {
    return this.IS_DEV
      ? "http://localhost:8000/api"
      : "https://your-domain.com/api"; // your production api URL
  },
};
```

#### Build and Publish

```bash
npm run build
npm login
npm publish --access public
```

#### Users Install Your CLI

```bash
npm install -g @your-username/envlink
npx @your-username/envlink create
```

## Code Quality

The project uses Biome for linting:

```bash
npx biome check .
npx biome check --apply .
```

## Repository Structure

This repository contains both the CLI tool and the web server:

- **CLI Tool** (root): The EnvLink command-line interface
- **Web Server** (`/server`): Documentation website and API server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both CLI and server if applicable)
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## License

MIT License - see [LICENSE](https://github.com/AbabilCore/envlink/blob/main/LICENSE) file for details.
