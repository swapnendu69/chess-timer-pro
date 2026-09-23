import React, { useState, useEffect, useCallback } from 'react';
import { OrientationMode, TimePreset, TimeControlMode } from './types/chess';
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

export default function App() {
  // Orientation mode: default 'face_to_face' for real two-player over-the-board play
  const [orientation, setOrientation] = useState<OrientationMode>(() => {
    return (localStorage.getItem('chess_timer_orientation') as OrientationMode) || 'face_to_face';
  });

  // Sound & Haptics preferences
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_timer_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('chess_timer_haptics');
    return saved !== null ? saved === 'true' : true;
  });

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

  // Connectivity hook
  const isOnline = useOnlineStatus();

  // Translation helper (English only)
  const t = useCallback((key: string): string => {
    const dict = translations.en as Record<string, string>;
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
    resetGame,
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

  // Save orientation
  useEffect(() => {
    localStorage.setItem('chess_timer_orientation', orientation);
  }, [orientation]);

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
  };

  // Keyboard shortcut support (Spacebar to switch turn, Escape to pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen || isHistoryOpen || isResetConfirmOpen) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (gameStatus === 'ready') {
          handlePlayerClockPress('white');
        } else if (gameStatus === 'running') {
          if (activePlayer) {
            handlePlayerClockPress(activePlayer);
          }
        }
      } else if (e.code === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activePlayer,
    gameStatus,
    handlePlayerClockPress,
    togglePause,
    isSettingsOpen,
    isHistoryOpen,
    isResetConfirmOpen,
  ]);

  const toggleOrientation = () => {
    if (orientation === 'face_to_face') {
      setOrientation('side_by_side');
    } else if (orientation === 'side_by_side') {
      setOrientation('portrait');
    } else {
      setOrientation('face_to_face');
    }
  };

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
      <main className="flex-1 w-full p-2 sm:p-4 flex flex-col relative overflow-hidden">
        {orientation === 'side_by_side' ? (
          // Side by Side (Horizontal) Layout
          <div className="flex-1 w-full flex flex-col md:flex-row gap-2 sm:gap-4 relative">
            <div className="flex-1 h-full">
              <PlayerClock
                player="white"
                timeMs={whiteTimeMs}
                isActive={activePlayer === 'white'}
                isReady={gameStatus === 'ready'}
                isPaused={gameStatus === 'paused'}
                isFlagFall={gameStatus === 'flag_fall'}
                isWinner={winner === 'white'}
                moves={whiteMoves}
                orientation="side_by_side"
                t={t}
                onPress={() => handlePlayerClockPress('white')}
              />
            </div>

            {/* Floating Center Controls in Middle */}
            <div className="my-auto mx-auto shrink-0 z-10 py-1">
              <CenterControls
                gameStatus={gameStatus}
                orientation={orientation}
                soundEnabled={soundEnabled}
                hapticsEnabled={hapticsEnabled}
                onTogglePlayPause={togglePause}
                onResetClick={() => setIsResetConfirmOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                onToggleHaptics={() => setHapticsEnabled((h) => !h)}
                onToggleOrientation={toggleOrientation}
                onOpenHistory={() => setIsHistoryOpen(true)}
                t={t}
              />
            </div>

            <div className="flex-1 h-full">
              <PlayerClock
                player="black"
                timeMs={blackTimeMs}
                isActive={activePlayer === 'black'}
                isReady={gameStatus === 'ready'}
                isPaused={gameStatus === 'paused'}
                isFlagFall={gameStatus === 'flag_fall'}
                isWinner={winner === 'black'}
                moves={blackMoves}
                orientation="side_by_side"
                t={t}
                onPress={() => handlePlayerClockPress('black')}
              />
            </div>
          </div>
        ) : (
          // Face to Face & Portrait Vertical Layouts
          <div className="flex-1 w-full flex flex-col gap-2 sm:gap-3 relative">
            {/* Top Clock (White, flipped 180° in face_to_face) */}
            <div className="flex-1 w-full min-h-0">
              <PlayerClock
                player="white"
                timeMs={whiteTimeMs}
                isActive={activePlayer === 'white'}
                isReady={gameStatus === 'ready'}
                isPaused={gameStatus === 'paused'}
                isFlagFall={gameStatus === 'flag_fall'}
                isWinner={winner === 'white'}
                moves={whiteMoves}
                orientation={orientation}
                t={t}
                onPress={() => handlePlayerClockPress('white')}
              />
            </div>

            {/* Central Controls Bar */}
            <div className="w-full flex items-center justify-center shrink-0 py-0.5">
              <CenterControls
                gameStatus={gameStatus}
                orientation={orientation}
                soundEnabled={soundEnabled}
                hapticsEnabled={hapticsEnabled}
                onTogglePlayPause={togglePause}
                onResetClick={() => setIsResetConfirmOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onToggleSound={() => setSoundEnabled((s) => !s)}
                onToggleHaptics={() => setHapticsEnabled((h) => !h)}
                onToggleOrientation={toggleOrientation}
                onOpenHistory={() => setIsHistoryOpen(true)}
                t={t}
              />
            </div>

            {/* Bottom Clock (Black, normal orientation) */}
            <div className="flex-1 w-full min-h-0">
              <PlayerClock
                player="black"
                timeMs={blackTimeMs}
                isActive={activePlayer === 'black'}
                isReady={gameStatus === 'ready'}
                isPaused={gameStatus === 'paused'}
                isFlagFall={gameStatus === 'flag_fall'}
                isWinner={winner === 'black'}
                moves={blackMoves}
                orientation="portrait"
                t={t}
                onPress={() => handlePlayerClockPress('black')}
              />
            </div>
          </div>
        )}
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
