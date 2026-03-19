# Gamvio Game Starter

Build games for the Gamvio platform with Next.js and the Gamvio Game SDK.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config
cp .env.example .env.local

# 3. Fill in your credentials from https://dev.gamv.io
#    - GAMVIO_GAME_ID: Your game's UUID
#    - GAMVIO_API_SECRET: Your API secret key (gv_secret_xxx)

# 4. Start development
npm run dev
```

## How It Works

### Architecture

```
Browser (client)          Your Server (Next.js)          Gamvio API
─────────────────         ──────────────────────         ──────────
Game UI (React)    →      Server Actions            →    Score Verification
useGamvio() hook          HMAC signing (secret)          Leaderboard
                          Session management              Anti-cheat
```

**Key security feature:** HMAC signing keys and API secrets stay on your server.
The browser never sees them.

### Files

| File | Purpose |
|------|---------|
| `lib/gamvio.ts` | Server Actions — SDK setup, session & score functions |
| `app/page.tsx` | Game UI — React components with `useGamvio()` hook |
| `.env.local` | Your credentials (never commit this!) |

### SDK Usage

```tsx
// In your game component:
const { isReady, submitScore, getLeaderboard } = useGamvio();

// Submit a score after the player finishes a round:
const result = await submitScore(1500, { level: 5, combo: 12 });

// Fetch the leaderboard:
const entries = await getLeaderboard(20);
```

### Authentication

Players are authenticated via the Gamvio platform. When your game is embedded
on gamv.io, the platform passes a `platform_token` URL parameter that the SDK
uses automatically.

### Score Anti-Cheat

1. Before each round, the SDK starts a **game session** (server-side)
2. The server receives an HMAC key (never sent to browser)
3. When the round ends, the score is HMAC-signed on your server
4. Gamvio API verifies the signature, timing, and session validity

## Deploy

Deploy anywhere that supports Next.js:

- **Vercel**: `vercel deploy`
- **Docker**: Standard Next.js Dockerfile
- **Self-hosted**: `npm run build && npm start`

After deploying, register your game URL in the [Developer Portal](https://dev.gamv.io).

## Links

- [Developer Portal](https://dev.gamv.io)
- [SDK Documentation](https://dev.gamv.io/docs)
- [API Reference](https://gamv.io/api/docs)
