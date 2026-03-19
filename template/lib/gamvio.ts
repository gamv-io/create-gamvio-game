'use server';

/**
 * Server-side Gamvio SDK setup.
 *
 * All functions here run on the server only.
 * HMAC signing keys and API secrets never reach the browser.
 */

import { createGameServer } from '@gamvio/game-sdk/server';

const gamvio = createGameServer({
  apiUrl: process.env.GAMVIO_API_URL || 'https://gamv.io',
  gameId: process.env.GAMVIO_GAME_ID || '',
  apiSecret: process.env.GAMVIO_API_SECRET || '',
});

/** Start a new game session. Call before each game round. */
export async function startSession(accessToken: string) {
  return gamvio.startSession(accessToken);
}

/** Submit a score. HMAC signed server-side. */
export async function submitScore(
  accessToken: string,
  sessionId: string,
  hmacKey: string,
  score: number,
  metadata?: Record<string, unknown>,
) {
  return gamvio.submitScore(accessToken, sessionId, hmacKey, score, metadata || {});
}

/** Get the leaderboard for this game. */
export async function getLeaderboard(limit?: number) {
  return gamvio.getLeaderboard(limit);
}

/** Get the current player's rank. */
export async function getMyRank(accessToken: string) {
  return gamvio.getPlayerRank(accessToken);
}
