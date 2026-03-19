'use server';

/**
 * Server-side Gamvio SDK setup.
 *
 * All functions here run on the server only.
 * HMAC signing keys and API secrets never reach the browser.
 *
 * Single game:  set GAMVIO_GAME_ID in .env.local
 * Multi game:   pass gameId param, or use resolveGameId(slug)
 */

import { createGameServer } from '@gamvio/game-sdk/server';

const API_URL = process.env.GAMVIO_API_URL || 'https://gamv.io';
const API_SECRET = process.env.GAMVIO_API_SECRET || '';
const DEFAULT_GAME_ID = process.env.GAMVIO_GAME_ID || '';

/** Create a server instance for a specific game (or default from env). */
function server(gameId?: string) {
  return createGameServer({
    apiUrl: API_URL,
    gameId: gameId || DEFAULT_GAME_ID,
    apiSecret: API_SECRET,
  });
}

/** Resolve a game ID from slug. Useful for multi-game projects. */
export async function resolveGameId(slug: string): Promise<string | null> {
  return server().resolveGameId(slug);
}

/** Start a new game session. Call before each game round. */
export async function startSession(accessToken: string, gameId?: string) {
  return server(gameId).startSession(accessToken);
}

/** Submit a score. HMAC signed server-side. */
export async function submitScore(
  accessToken: string,
  sessionId: string,
  hmacKey: string,
  score: number,
  metadata?: Record<string, unknown>,
) {
  return server().submitScore(accessToken, sessionId, hmacKey, score, metadata || {});
}

/** Get the leaderboard. Pass gameId for multi-game projects. */
export async function getLeaderboard(limit?: number, gameId?: string) {
  return server(gameId).getLeaderboard(limit);
}

/** Get the current player's rank. */
export async function getMyRank(accessToken: string, gameId?: string) {
  return server(gameId).getPlayerRank(accessToken);
}
