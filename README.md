<h1 align="center">create-gamvio-game</h1>

<p align="center">
  Scaffold a production-ready game for the <a href="https://gamv.io">Gamvio</a> Web3 game store in seconds.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-gamvio-game"><img src="https://img.shields.io/npm/v/create-gamvio-game.svg?style=flat-square&color=fbbf24" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/create-gamvio-game"><img src="https://img.shields.io/npm/dm/create-gamvio-game.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/gamv-io/create-gamvio-game/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
</p>

<!-- screenshot here -->

---

## Usage

```bash
npx create-gamvio-game my-game
```

```
  ╔═══════════════════════════════════════╗
  ║       🎮 Create Gamvio Game 🎮        ║
  ╚═══════════════════════════════════════╝

Creating my-game...

✅ Done!

  cd my-game
  cp .env.example .env.local    # Add your SDK credentials
  npm install
  npm run dev

  📖 Docs: https://gamv.io/developers/docs
  🔑 Get SDK keys: https://dev.gamv.io
```

## What You Get

A **Next.js 15** project pre-configured with everything you need to ship a game on Gamvio:

| Feature | Description |
|---------|-------------|
| **@gamvio/game-sdk** | Authentication, score submission, leaderboards — all wired up |
| **Server Actions** | HMAC-signed anti-cheat scoring (secrets never leave the server) |
| **Test Mode** | Auto-detected on localhost with a live dashboard |
| **Multi-Game Support** | One project can host multiple games via `resolveGameId()` |
| **TypeScript** | Full type safety out of the box |
| **Dark Theme** | Matches the Gamvio platform aesthetic |

## Getting Started

1. **Create a developer account** at [dev.gamv.io](https://dev.gamv.io)

2. **Create a game** in the developer portal and copy your SDK keys

3. **Scaffold the project**

   ```bash
   npx create-gamvio-game my-game
   cd my-game
   ```

4. **Configure credentials**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your keys:

   ```env
   GAMVIO_GAME_ID=your-game-uuid
   GAMVIO_API_KEY=gv_live_xxx
   GAMVIO_API_SECRET=gv_secret_xxx
   ```

5. **Install dependencies and start developing**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3100](http://localhost:3100) — test mode activates automatically.

6. **Build your game** — replace the example component in `app/page.tsx` with your game logic

7. **Submit for review** at the [Developer Portal](https://dev.gamv.io) when you're ready to go live

## Test Mode

When running on `localhost` (or with `?test=1` in the URL), the starter automatically:

- Fetches a **test token** using your `GAMVIO_API_KEY` — no platform authentication needed
- Shows a **yellow "TEST MODE" banner** at the top of the page
- Renders a **live Test Dashboard** below your game with:
  - Connection status indicator
  - Last submitted score with ID and timestamp
  - Session info
  - Live leaderboard (top 5, refreshed every 10 seconds)
  - One-click test score submission

Test scores are real and persisted, but marked as test data. No additional configuration required — just `npm run dev` and start building.

## Multi-Game Support

A single project can host multiple games. Instead of hardcoding `GAMVIO_GAME_ID`, resolve it dynamically:

```tsx
// lib/gamvio.ts — already included
import { resolveGameId } from '@/lib/gamvio';

// Resolve by slug (e.g., from URL path)
const gameId = await resolveGameId('space-invaders');
```

Pass `gameId` to any server action:

```tsx
await startSession(accessToken, gameId);
await getLeaderboard(10, gameId);
await getMyRank(accessToken, gameId);
```

Your `GAMVIO_API_SECRET` works across all games under your developer account.

## Project Structure

```
my-game/
├── app/
│   ├── layout.tsx          # Root layout (dark theme, metadata)
│   └── page.tsx            # Game page with SDK hooks + test mode
├── lib/
│   └── gamvio.ts           # Server Actions (HMAC signing, sessions, leaderboards)
├── .env.example            # SDK credentials template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies (Next.js 15, React 19, @gamvio/game-sdk)
└── tsconfig.json           # TypeScript configuration
```

### Key Files

**`app/page.tsx`** — The main entry point. Contains three modes:
- **Production**: Reads `platform_token` from URL params (injected by Gamvio iframe)
- **Test mode**: Auto-fetches a test token and renders the test dashboard
- **Waiting**: Shown when neither token is available

**`lib/gamvio.ts`** — Server-only module. All sensitive operations (HMAC signing, API secret usage) happen here via Next.js Server Actions. Exports:
- `startSession()` — Begin a game session
- `submitScore()` — HMAC-signed score submission
- `getLeaderboard()` — Fetch top scores
- `getMyRank()` — Get current player's rank
- `getTestToken()` — Fetch a test token (localhost only)
- `resolveGameId()` — Resolve slug to game UUID (multi-game)

## SDK Integration

The Gamvio Game SDK has two layers:

### Client (`@gamvio/game-sdk/client`)

```tsx
import { GamvioGameProvider, useGamvio } from '@gamvio/game-sdk/client';

function MyGame() {
  const { user, isReady, submitScore } = useGamvio();

  const handleWin = async () => {
    const result = await submitScore(1500, { level: 3 });
    console.log('Score ID:', result.score_id);
  };
}
```

### Server (`@gamvio/game-sdk/server`)

```ts
import { createGameServer } from '@gamvio/game-sdk/server';

const server = createGameServer({
  apiUrl: 'https://gamv.io',
  gameId: 'your-game-id',
  apiSecret: 'gv_secret_xxx',
});
```

The starter wires both layers together through Server Actions — you just call `submitScore()` from your component and the HMAC signing happens server-side.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in the Vercel dashboard:

```
GAMVIO_GAME_ID=...
GAMVIO_API_KEY=...
GAMVIO_API_SECRET=...
GAMVIO_API_URL=https://gamv.io
```

### Docker

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3100
CMD ["node", "server.js"]
```

### Self-Hosted

```bash
npm run build
npm run start     # Starts on port 3100
```

Use a reverse proxy (Nginx, Caddy) to terminate SSL and forward to port 3100.

## Links

- [SDK Documentation](https://gamv.io/developers/docs) — Full API reference and guides
- [Developer Portal](https://dev.gamv.io) — Register, create games, manage keys
- [API Reference](https://gamv.io/developers/api) — REST API endpoints
- [Example Games](https://github.com/gamv-io/sample-arcade) — Arcade game samples
- [Gamvio Platform](https://gamv.io) — The game store

## License

[MIT](LICENSE)
