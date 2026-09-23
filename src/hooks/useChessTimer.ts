import { useState, useEffect, useRef, useCallback } from 'react';
import { Player, TimeControlMode, MoveRecord } from '../types/chess';
import { soundManager } from '../utils/sound';

export interface UseChessTimerProps {
  initialWhiteMinutes: number;
  initialWhiteSeconds: number;
  initialBlackMinutes: number;
  initialBlackSeconds: number;
  incrementSeconds: number;
  timeControlMode: TimeControlMode;
  onGameOver?: (winner: Player, loser: Player) => void;
}

export function useChessTimer({
  initialWhiteMinutes,
  initialWhiteSeconds,
  initialBlackMinutes,
  initialBlackSeconds,
  incrementSeconds,
  timeControlMode,
  onGameOver,
}: UseChessTimerProps) {
  const getInitialWhiteMs = useCallback(
    () => (initialWhiteMinutes * 60 + initialWhiteSeconds) * 1000,
    [initialWhiteMinutes, initialWhiteSeconds]
  );

  const getInitialBlackMs = useCallback(
    () => (initialBlackMinutes * 60 + initialBlackSeconds) * 1000,
    [initialBlackMinutes, initialBlackSeconds]
  );

  const [whiteTimeMs, setWhiteTimeMs] = useState(getInitialWhiteMs());
  const [blackTimeMs, setBlackTimeMs] = useState(getInitialBlackMs());
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [gameStatus, setGameStatus] = useState<'ready' | 'running' | 'paused' | 'flag_fall'>('ready');
  const [winner, setWinner] = useState<Player | null>(null);
  const [whiteMoves, setWhiteMoves] = useState(0);
  const [blackMoves, setBlackMoves] = useState(0);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);

  const lastTickRef = useRef<number | null>(null);
  const moveStartTimestampRef = useRef<number>(Date.now());
  const lastWarnSecondRef = useRef<number>(-1);

  // Sync state if initial settings change while in 'ready' state
  useEffect(() => {
    if (gameStatus === 'ready') {
      setWhiteTimeMs(getInitialWhiteMs());
      setBlackTimeMs(getInitialBlackMs());
    }
  }, [getInitialWhiteMs, getInitialBlackMs, gameStatus]);

  // Main high-precision animation frame / interval ticker
  useEffect(() => {
    if (gameStatus !== 'running' || !activePlayer) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = performance.now();

    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const lastTick = lastTickRef.current ?? now;
      const delta = now - lastTick;
      lastTickRef.current = now;

      if (activePlayer === 'white') {
        setWhiteTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeExpired('white');
            return 0;
          }
          checkWarningTick(next);
          return next;
        });
      } else {
        setBlackTimeMs((prev) => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeExpired('black');
            return 0;
          }
          checkWarningTick(next);
          return next;
        });
      }
    }, 25); // 40fps for smooth countdown display

    return () => clearInterval(intervalId);
  }, [gameStatus, activePlayer]);

  const checkWarningTick = (remainingMs: number) => {
    if (remainingMs <= 10000 && remainingMs > 0) {
      const currentSecond = Math.floor(remainingMs / 1000);
      if (currentSecond !== lastWarnSecondRef.current) {
        lastWarnSecondRef.current = currentSecond;
        soundManager.playWarningTick();
      }
    }
  };

  const handleTimeExpired = (loser: Player) => {
    const gameWinner: Player = loser === 'white' ? 'black' : 'white';
    setGameStatus('flag_fall');
    setActivePlayer(null);
    setWinner(gameWinner);
    soundManager.playFlagFall();
    if (onGameOver) {
      onGameOver(gameWinner, loser);
    }
  };

  // Player clock touch / press
  const handlePlayerClockPress = useCallback(
    (pressedPlayer: Player) => {
      if (gameStatus === 'flag_fall') return;

      soundManager.playClick();
      const now = Date.now();
      const timeSpent = now - moveStartTimestampRef.current;
      moveStartTimestampRef.current = now;
      lastWarnSecondRef.current = -1;

      // If in ready state, tapping starts the game
      if (gameStatus === 'ready') {
        setGameStatus('running');
        // If White taps, Black plays; if Black taps, White plays
        const nextPlayer: Player = pressedPlayer === 'white' ? 'black' : 'white';
        setActivePlayer(nextPlayer);
        return;
      }

      // If paused, ignore clock tap (must click resume)
      if (gameStatus === 'paused') {
        return;
      }

      // Normal turn switch: only the active player can press their clock to finish turn
      if (activePlayer === pressedPlayer) {
        const nextPlayer: Player = pressedPlayer === 'white' ? 'black' : 'white';
        const incMs = incrementSeconds * 1000;

        if (pressedPlayer === 'white') {
          setWhiteMoves((m) => m + 1);
          setWhiteTimeMs((prev) => {
            const next = timeControlMode === 'fischer' ? prev + incMs : prev;
            setMoveHistory((hist) => [
              ...hist,
              {
                moveNumber: whiteMoves + 1,
                player: 'white',
                timeSpentMs: timeSpent,
                timeRemainingMs: next,
                timestamp: now,
              },
            ]);
            return next;
          });
        } else {
          setBlackMoves((m) => m + 1);
          setBlackTimeMs((prev) => {
            const next = timeControlMode === 'fischer' ? prev + incMs : prev;
            setMoveHistory((hist) => [
              ...hist,
              {
                moveNumber: blackMoves + 1,
                player: 'black',
                timeSpentMs: timeSpent,
                timeRemainingMs: next,
                timestamp: now,
              },
            ]);
            return next;
          });
        }

        setActivePlayer(nextPlayer);
      }
    },
    [gameStatus, activePlayer, incrementSeconds, timeControlMode, whiteMoves, blackMoves]
  );

  const togglePause = useCallback(() => {
    if (gameStatus === 'running') {
      setGameStatus('paused');
    } else if (gameStatus === 'paused') {
      setGameStatus('running');
      moveStartTimestampRef.current = Date.now();
      lastTickRef.current = performance.now();
    }
  }, [gameStatus]);

  const resetGame = useCallback(() => {
    setWhiteTimeMs(getInitialWhiteMs());
    setBlackTimeMs(getInitialBlackMs());
    setActivePlayer(null);
    setGameStatus('ready');
    setWinner(null);
    setWhiteMoves(0);
    setBlackMoves(0);
    setMoveHistory([]);
    lastWarnSecondRef.current = -1;
  }, [getInitialWhiteMs, getInitialBlackMs]);

  // Adjust time on the fly if needed (penalty/time bonus)
  const adjustPlayerTime = useCallback((player: Player, deltaMs: number) => {
    if (player === 'white') {
      setWhiteTimeMs((prev) => Math.max(1000, prev + deltaMs));
    } else {
      setBlackTimeMs((prev) => Math.max(1000, prev + deltaMs));
    }
  }, []);

  return {
    whiteTimeMs,
    blackTimeMs,
    activePlayer,
    gameStatus,
    winner,
    whiteMoves,
    blackMoves,
    moveHistory,
    handlePlayerClockPress,
    togglePause,
    resetGame,
    adjustPlayerTime,
  };
}
