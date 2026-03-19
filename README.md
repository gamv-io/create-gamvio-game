# create-gamvio-game

Scaffold a new game for the [Gamvio](https://gamv.io) Web3 game store platform.

## Usage

```bash
npx create-gamvio-game my-game
cd my-game
cp .env.example .env.local
npm install
npm run dev
```

## What you get

A Next.js 15 project pre-configured with:

- **@gamvio/game-sdk** — Authentication, score submission, leaderboards
- **Server Actions** — HMAC-signed anti-cheat scoring (secrets stay server-side)
- **TypeScript** — Full type safety
- **Dark theme** — Matching the Gamvio platform aesthetic

## Project structure

```
my-game/
├── app/
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Game UI + SDK hooks
├── lib/
│   └── gamvio.ts        # Server Actions (HMAC signing)
├── .env.example         # SDK credentials template
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Getting started

1. **Register** as a developer at [dev.gamv.io](https://dev.gamv.io)
2. **Create a game** and get your SDK keys
3. **Add credentials** to `.env.local`:
   ```
   GAMVIO_GAME_ID=your-game-uuid
   GAMVIO_API_SECRET=gv_secret_xxx
   ```
4. **Build your game** — replace the example in `app/page.tsx`
5. **Submit for review** at [gamv.io/developers/submit](https://gamv.io/developers/submit)

## Links

- [SDK Documentation](https://gamv.io/developers/docs)
- [API Reference](https://gamv.io/developers/api)
- [Developer Portal](https://dev.gamv.io)
- [Example Games (open source)](https://github.com/gamv-io/games)
