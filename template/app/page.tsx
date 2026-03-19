'use client';

import { GamvioGameProvider, useGamvio } from '@gamvio/game-sdk/client';
import { startSession, submitScore, getLeaderboard, getMyRank } from '@/lib/gamvio';

/**
 * Example game using the Gamvio Game SDK.
 *
 * In production, accessToken and user info come from the platform
 * via URL parameter (?platform_token=xxx) or session cookie.
 *
 * This is a minimal example — replace the game logic with your own!
 */
export default function GamePage() {
  // In production, these come from the Gamvio platform:
  // - platform_token URL param (iframe embed)
  // - NextAuth session cookie (same-domain)
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  const accessToken = params.get('platform_token') || '';
  const gameId = process.env.NEXT_PUBLIC_GAMVIO_GAME_ID || '';

  if (!accessToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Waiting for platform authentication...</p>
      </div>
    );
  }

  return (
    <GamvioGameProvider
      accessToken={accessToken}
      user={{ id: '', name: 'Player' }}
      gameId={gameId}
      onStartSession={startSession}
      onSubmitScore={submitScore}
      onGetLeaderboard={getLeaderboard}
      onGetMyRank={getMyRank}
    >
      <MyGame />
    </GamvioGameProvider>
  );
}

/** Your game component — replace this with your actual game! */
function MyGame() {
  const { user, isReady, submitScore } = useGamvio();

  async function handlePlay() {
    // Your game logic here...
    const score = Math.floor(Math.random() * 1000);

    // Submit the score via the SDK
    try {
      const result = await submitScore(score, { example: true });
      alert(`Score submitted! ID: ${result.score_id}`);
    } catch (err) {
      console.error('Score submission failed:', err);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 40, textAlign: 'center' }}>
      <h1>My Gamvio Game</h1>
      <p>Player: {user?.name || 'Unknown'}</p>
      <p>Status: {isReady ? 'Ready' : 'Loading...'}</p>

      <button
        onClick={handlePlay}
        disabled={!isReady}
        style={{
          marginTop: 24,
          padding: '16px 32px',
          fontSize: 18,
          fontWeight: 600,
          background: isReady ? '#fbbf24' : '#333',
          color: '#000',
          border: 'none',
          borderRadius: 12,
          cursor: isReady ? 'pointer' : 'not-allowed',
        }}
      >
        {isReady ? 'Play!' : 'Loading...'}
      </button>
    </div>
  );
}
