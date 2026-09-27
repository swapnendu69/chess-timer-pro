import React, { useState, useEffect, useCallback } from 'react';
import { Player, TimePreset, TimeControlMode } from './types/chess';
import { TIME_PRESETS } from './utils/constants';
import { translations } from './utils/translations';
import { useChessTimer } from './hooks/useChessTimer';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { soundManager } from './utils/sound';

import { HeaderControls } from './components/HeaderControls';
import { PlayerClock } from './components/PlayerClock';
import { CenterControls } from './components/CenterControls';
import { TimeSettingsModal } from './components/TimeSettingsModal';
import { MoveHistoryModal } from './components/MoveHistoryModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { GameOverModal } from './components/GameOverModal';
import { IllegalMoveModal } from './components/IllegalMoveModal';

export default function App() {
  // Top Player position: 'white' or 'black'.
  // Clocks are ALWAYS face-to-face (top player rotated 180°, bottom player normal).
  // Clicking 180° swaps White and Black positions.
  const [topPlayer, setTopPlayer] = useState<Player>(() => {
    return (localStorage.getItem('chess_timer_top_player') as Player) || 'white';
  });

  const bottomPlayer: Player = topPlayer === 'white' ? 'black' : 'white';

  // Sound & Haptics preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_timer_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_timer_haptics');
    return saved !== null ? saved === 'true' : true;
  });

  // Toast / Status notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  }, []);

  // Current Time settings
  const [currentPreset, setCurrentPreset] = useState<TimePreset>(() => {
    const defaultPreset = TIME_PRESETS.find((p) => p.id === 'blitz_5_0') || TIME_PRESETS[0];
    const saved = localStorage.getItem('chess_timer_preset');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        return defaultPreset;
      }
    }
    return defaultPreset;
  });

  const [customSettings, setCustomSettings] = useState({
    whiteMin: currentPreset.baseMinutes,
    whiteSec: currentPreset.baseSeconds || 0,
    blackMin: currentPreset.baseMinutes,
    blackSec: currentPreset.baseSeconds || 0,
    incrementSec: currentPreset.incrementSeconds,
    mode: currentPreset.mode,
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isIllegalMoveOpen, setIsIllegalMoveOpen] = useState(false);

  // Connectivity hook
  const isOnline = useOnlineStatus();

  // Translation helper
  const t = useCallback((key: string): string => {
    const dict = translations as Record<string, string>;
    return dict[key] || key;
  }, []);

  // Timer Hook
  const {
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
    pauseGame,
    resumeGame,
    resetGame,
    adjustPlayerTime,
  } = useChessTimer({
    initialWhiteMinutes: customSettings.whiteMin,
    initialWhiteSeconds: customSettings.whiteSec,
    initialBlackMinutes: customSettings.blackMin,
    initialBlackSeconds: customSettings.blackSec,
    incrementSeconds: customSettings.incrementSec,
    timeControlMode: customSettings.mode,
    onGameOver: () => {
      setIsGameOverModalOpen(true);
    },
  });

  // Sync sound settings with soundManager
  useEffect(() => {
    soundManager.setSoundEnabled(soundEnabled);
    localStorage.setItem('chess_timer_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    soundManager.setHapticsEnabled(hapticsEnabled);
    localStorage.setItem('chess_timer_haptics', String(hapticsEnabled));
  }, [hapticsEnabled]);

  // Save topPlayer position preference
  useEffect(() => {
    localStorage.setItem('chess_timer_top_player', topPlayer);
  }, [topPlayer]);

  // Swap Sides (180° button action): Black and White swap places
  const handleSwapSides = () => {
    soundManager.playClick();
    setTopPlayer((prev) => {
      const next = prev === 'white' ? 'black' : 'white';
      showToast(
        next === 'white'
          ? 'Swapped Sides 180°: Top is White, Bottom is Black'
          : 'Swapped Sides 180°: Top is Black, Bottom is White'
      );
      return next;
    });
  };

  // Open Illegal Move Modal (pauses the game automatically as per chess rules)
  const handleOpenIllegalMove = () => {
    pauseGame();
    setIsIllegalMoveOpen(true);
  };

  // Apply FIDE Illegal Move Penalty
  const handleApplyPenalty = (
    beneficiary: Player,
    addedSeconds: number,
    reason: string,
    shouldResume: boolean
  ) => {
    adjustPlayerTime(beneficiary, addedSeconds * 1000, reason);
    soundManager.playClick();
    const beneficiaryName = beneficiary === 'white' ? 'White' : 'Black';
    showToast(`Illegal Move Penalty: +${Math.round(addedSeconds / 60)} min added to ${beneficiaryName}'s clock`);

    if (shouldResume) {
      resumeGame();
    }
  };

  // Apply Manual Time Adjustments
  const handleManualAdjust = (
    whiteDeltaSec: number,
    blackDeltaSec: number,
    shouldResume: boolean
  ) => {
    if (whiteDeltaSec !== 0) {
      adjustPlayerTime(
        'white',
        whiteDeltaSec * 1000,
        `Manual Adjust: ${whiteDeltaSec > 0 ? '+' : ''}${whiteDeltaSec}s`
      );
    }
    if (blackDeltaSec !== 0) {
      adjustPlayerTime(
        'black',
        blackDeltaSec * 1000,
        `Manual Adjust: ${blackDeltaSec > 0 ? '+' : ''}${blackDeltaSec}s`
      );
    }
    soundManager.playClick();
    showToast('Clocks successfully adjusted');

    if (shouldResume) {
      resumeGame();
    }
  };

  // Quick adjust from clock face when paused
  const handleQuickAdjust = (player: Player, seconds: number) => {
    adjustPlayerTime(
      player,
      seconds * 1000,
      `Quick Adjust: ${seconds > 0 ? '+' : ''}${seconds}s`
    );
    soundManager.playClick();
    const pName = player === 'white' ? 'White' : 'Black';
    showToast(`${pName} clock adjusted by ${seconds > 0 ? '+' : ''}${seconds}s`);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: TimePreset) => {
    setCurrentPreset(preset);
    setCustomSettings({
      whiteMin: preset.baseMinutes,
      whiteSec: preset.baseSeconds || 0,
      blackMin: preset.baseMinutes,
      blackSec: preset.baseSeconds || 0,
      incrementSec: preset.incrementSeconds,
      mode: preset.mode,
    });
    localStorage.setItem('chess_timer_preset', JSON.stringify(preset));
    resetGame();
    showToast(`Preset: ${preset.nameEn} (${preset.baseMinutes}+${preset.incrementSeconds})`);
  };

  // Handle Custom Time Apply
  const handleApplyCustomTime = (
    whiteMin: number,
    whiteSec: number,
    blackMin: number,
    blackSec: number,
    incrementSec: number,
    mode: TimeControlMode
  ) => {
    setCustomSettings({
      whiteMin,
      whiteSec,
      blackMin,
      blackSec,
      incrementSec,
      mode,
    });
    setCurrentPreset({
      id: 'custom',
      nameBn: 'Custom Time',
      nameEn: 'Custom Time',
      category: 'rapid',
      baseMinutes: whiteMin,
      baseSeconds: whiteSec,
      incrementSeconds: incrementSec,
      mode,
    });
    resetGame();
    showToast('Custom time applied');
  };

  // Keyboard shortcut support (Spacebar to switch turn, Escape to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isSettingsOpen ||
        isHistoryOpen ||
        isResetConfirmOpen ||
        isIllegalMoveOpen ||
        isGameOverModalOpen
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStatus === 'ready') {
          handlePlayerClockPress(topPlayer);
        } else if (gameStatus === 'running') {
          if (activePlayer) {
            handlePlayerClockPress(activePlayer);
          }
        }
      } else if (e.code === 'Escape') {
        togglePause();
      } else if (e.key === 'i' || e.key === 'I') {
        handleOpenIllegalMove();
      } else if (e.key === 's' || e.key === 'S') {
        handleSwapSides();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activePlayer,
    gameStatus,
    topPlayer,
    handlePlayerClockPress,
    togglePause,
    isSettingsOpen,
    isHistoryOpen,
    isResetConfirmOpen,
    isIllegalMoveOpen,
    isGameOverModalOpen,
  ]);

  return (
    <div className="h-dvh w-screen flex flex-col bg-slate-100 overflow-hidden select-none font-sans text-slate-800">
      {/* Top Application Bar */}
      <HeaderControls
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((s) => !s)}
        isOnline={isOnline}
        t={t}
      />

      {/* Main Chess Board Clocks Area */}
      {/* Player 1 and Player 2 are ALWAYS face-to-face (Top clock 180°, Bottom clock 0°) */}
      <main className="flex-1 w-full p-2 sm:p-3 flex flex-col relative overflow-hidden">
        {/* Floating Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-3 inset-x-0 mx-auto z-40 w-fit max-w-[90%] px-4 py-2 bg-slate-900/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-xl backdrop-blur-md animate-fade-in flex items-center gap-2 border border-slate-700">
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex-1 w-full flex flex-col gap-2 sm:gap-2.5 relative">
          {/* Top Player Clock (Rotated 180° for the player sitting opposite across the table) */}
          <div className="flex-1 w-full min-h-0">
            <PlayerClock
              player={topPlayer}
              timeMs={topPlayer === 'white' ? whiteTimeMs : blackTimeMs}
              isActive={activePlayer === topPlayer}
              isReady={gameStatus === 'ready'}
              isPaused={gameStatus === 'paused'}
              isFlagFall={gameStatus === 'flag_fall'}
              isWinner={winner === topPlayer}
              moves={topPlayer === 'white' ? whiteMoves : blackMoves}
              isFlipped={true}
              t={t}
              onPress={() => handlePlayerClockPress(topPlayer)}
              onQuickAdjust={(sec) => handleQuickAdjust(topPlayer, sec)}
            />
          </div>

          {/* Central Controls Bar (Play/Pause, Reset, Illegal Move, 180° Swap Sides, Settings, Stats, Sound) */}
          <div className="w-full flex items-center justify-center shrink-0 py-0.5">
            <CenterControls
              gameStatus={gameStatus}
              topPlayer={topPlayer}
              soundEnabled={soundEnabled}
              hapticsEnabled={hapticsEnabled}
              onTogglePlayPause={togglePause}
              onResetClick={() => setIsResetConfirmOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenIllegalMove={handleOpenIllegalMove}
              onSwapSides={handleSwapSides}
              onToggleSound={() => setSoundEnabled((s) => !s)}
              onToggleHaptics={() => setHapticsEnabled((h) => !h)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              t={t}
            />
          </div>

          {/* Bottom Player Clock (Oriented 0° for player sitting on this side) */}
          <div className="flex-1 w-full min-h-0">
            <PlayerClock
              player={bottomPlayer}
              timeMs={bottomPlayer === 'white' ? whiteTimeMs : blackTimeMs}
              isActive={activePlayer === bottomPlayer}
              isReady={gameStatus === 'ready'}
              isPaused={gameStatus === 'paused'}
              isFlagFall={gameStatus === 'flag_fall'}
              isWinner={winner === bottomPlayer}
              moves={bottomPlayer === 'white' ? whiteMoves : blackMoves}
              isFlipped={false}
              t={t}
              onPress={() => handlePlayerClockPress(bottomPlayer)}
              onQuickAdjust={(sec) => handleQuickAdjust(bottomPlayer, sec)}
            />
          </div>
        </div>
      </main>

      {/* Modals & Dialogs */}
      <TimeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPresetId={currentPreset.id}
        onSelectPreset={handleSelectPreset}
        onApplyCustomTime={handleApplyCustomTime}
        currentSettings={customSettings}
        t={t}
      />

      <IllegalMoveModal
        isOpen={isIllegalMoveOpen}
        onClose={() => setIsIllegalMoveOpen(false)}
        whiteTimeMs={whiteTimeMs}
        blackTimeMs={blackTimeMs}
        onApplyPenalty={handleApplyPenalty}
        onManualAdjust={handleManualAdjust}
        t={t}
      />

      <MoveHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        moveHistory={moveHistory}
        whiteMoves={whiteMoves}
        blackMoves={blackMoves}
        t={t}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetGame}
        t={t}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        winner={winner}
        onClose={() => setIsGameOverModalOpen(false)}
        onRematch={resetGame}
        onViewStats={() => setIsHistoryOpen(true)}
        t={t}
      />
    </div>
  );
}
