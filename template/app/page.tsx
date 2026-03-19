'use client';

import { useState, useEffect, useCallback } from 'react';
import { GamvioGameProvider, useGamvio } from '@gamvio/game-sdk/client';
import { startSession, submitScore, getLeaderboard, getMyRank, getTestToken } from '@/lib/gamvio';

/**
 * Example game using the Gamvio Game SDK.
 *
 * TWO modes:
 * - Production: platform_token comes from URL params (iframe embed)
 * - Test mode: auto-fetches a test token via API key (localhost or ?test=1)
 */
export default function GamePage() {
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  const platformToken = params.get('platform_token') || '';
  const gameId = process.env.NEXT_PUBLIC_GAMVIO_GAME_ID || '';

  const isTestMode = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.search.includes('test=1')
  );

  // Production mode: has platform_token
  if (platformToken) {
    return (
      <GamvioGameProvider
        accessToken={platformToken}
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

  // Test mode: localhost or ?test=1
  if (isTestMode) {
    return <TestModeWrapper gameId={gameId} />;
  }

  // Neither: waiting for authentication
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Waiting for platform authentication...</p>
    </div>
  );
}

/** Wraps the game in test mode with auto token fetching and test dashboard. */
function TestModeWrapper({ gameId }: { gameId: string }) {
  const [testToken, setTestToken] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchToken() {
      setStatus('loading');
      const result = await getTestToken();
      if (cancelled) return;
      if (result) {
        setTestToken(result.token);
        setPlayerId(result.player_id);
        setStatus('connected');
      } else {
        setStatus('error');
        setErrorMsg('Failed to fetch test token. Check GAMVIO_API_KEY in .env.local');
      }
    }
    fetchToken();
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <TestModeBanner />
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 18 }}>Fetching test token...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || !testToken) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 40, textAlign: 'center' }}>
        <TestModeBanner />
        <div style={{ marginTop: 40, padding: 20, background: '#fef2f2', borderRadius: 8 }}>
          <p style={{ color: '#dc2626', fontWeight: 600 }}>Connection Error</p>
          <p style={{ color: '#7f1d1d', fontSize: 14, marginTop: 8 }}>{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TestModeBanner />
      <GamvioGameProvider
        accessToken={testToken}
        user={{ id: playerId, name: 'SDK Test Player' }}
        gameId={gameId}
        onStartSession={startSession}
        onSubmitScore={submitScore}
        onGetLeaderboard={getLeaderboard}
        onGetMyRank={getMyRank}
      >
        <MyGame />
        <TestDashboard playerId={playerId} />
      </GamvioGameProvider>
    </div>
  );
}

/** Yellow/orange test mode banner. */
function TestModeBanner() {
  return (
    <div style={{
      background: 'linear-gradient(90deg, #f59e0b, #d97706)',
      color: '#000',
      textAlign: 'center',
      padding: '10px 16px',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: 1,
    }}>
      TEST MODE — Scores are real but marked as test
    </div>
  );
}

/** Your game component — replace this with your actual game! */
function MyGame() {
  const { user, isReady, submitScore } = useGamvio();

  async function handlePlay() {
    const score = Math.floor(Math.random() * 1000);
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

/** Live test dashboard shown below the game in test mode. */
function TestDashboard({ playerId }: { playerId: string }) {
  const { isReady, submitScore } = useGamvio();

  const [lastScore, setLastScore] = useState<{ score: number; id: string; time: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{ player_id: string; score: number; rank: number }>>([]);
  const [sessionInfo, setSessionInfo] = useState<{ session_id: string; started_at: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch leaderboard periodically
  const fetchLeaderboard = useCallback(async () => {
    try {
      const entries = await getLeaderboard(5);
      if (Array.isArray(entries)) {
        setLeaderboard(entries.map((e: Record<string, unknown>, i: number) => ({
          player_id: (e.player_id || e.user_id || '') as string,
          score: (e.score || 0) as number,
          rank: i + 1,
        })));
      }
    } catch {
      // Silently ignore leaderboard errors in test mode
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  async function handleTestScore() {
    if (!isReady || submitting) return;
    setSubmitting(true);
    try {
      const score = Math.floor(Math.random() * 500) + 100;
      const result = await submitScore(score, { test: true });
      setLastScore({
        score,
        id: result.score_id,
        time: new Date().toLocaleTimeString(),
      });
      setSessionInfo({
        session_id: result.session_id || 'N/A',
        started_at: new Date().toISOString(),
      });
      // Refresh leaderboard after score submission
      await fetchLeaderboard();
    } catch (err) {
      console.error('Test score submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      maxWidth: 600,
      margin: '24px auto',
      padding: 24,
      border: '2px solid #d97706',
      borderRadius: 12,
      background: '#fffbeb',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 18, color: '#92400e' }}>
        Test Dashboard
      </h2>

      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: isReady ? '#22c55e' : '#ef4444',
        }} />
        <span style={{ fontSize: 14, color: '#374151' }}>
          {isReady ? 'Connected' : 'Disconnected'}
        </span>
        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
          Player: {playerId.slice(0, 8)}...
        </span>
      </div>

      {/* Last score */}
      {lastScore && (
        <div style={{
          padding: 12,
          background: '#fff',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 14,
        }}>
          <strong>Last Score:</strong> {lastScore.score}
          <span style={{ color: '#9ca3af', marginLeft: 8 }}>
            ID: {lastScore.id.slice(0, 8)}... at {lastScore.time}
          </span>
        </div>
      )}

      {/* Session info */}
      {sessionInfo && (
        <div style={{
          padding: 12,
          background: '#fff',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 13,
          color: '#6b7280',
        }}>
          <div>Session: {sessionInfo.session_id.slice(0, 12)}...</div>
          <div>Started: {sessionInfo.started_at}</div>
        </div>
      )}

      {/* Leaderboard preview */}
      <div style={{
        padding: 12,
        background: '#fff',
        borderRadius: 8,
        marginBottom: 16,
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14, color: '#92400e' }}>
          Leaderboard (Top 5)
        </h3>
        {leaderboard.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No scores yet</p>
        ) : (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '4px 0', color: '#6b7280' }}>#</th>
                <th style={{ textAlign: 'left', padding: '4px 0', color: '#6b7280' }}>Player</th>
                <th style={{ textAlign: 'right', padding: '4px 0', color: '#6b7280' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '4px 0' }}>{entry.rank}</td>
                  <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>
                    {entry.player_id.slice(0, 8)}...
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px 0', fontWeight: 600 }}>
                    {entry.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit test score button */}
      <button
        onClick={handleTestScore}
        disabled={!isReady || submitting}
        style={{
          width: '100%',
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          background: isReady && !submitting ? '#d97706' : '#9ca3af',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: isReady && !submitting ? 'pointer' : 'not-allowed',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Test Score'}
      </button>
    </div>
  );
}
