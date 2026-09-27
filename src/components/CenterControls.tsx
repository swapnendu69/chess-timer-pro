import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  History,
  SmartphoneNfc,
  ShieldAlert,
  ArrowUpDown,
} from 'lucide-react';
import { Player } from '../types/chess';

interface CenterControlsProps {
  gameStatus: 'ready' | 'running' | 'paused' | 'flag_fall';
  topPlayer: Player;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onTogglePlayPause: () => void;
  onResetClick: () => void;
  onOpenSettings: () => void;
  onOpenIllegalMove: () => void;
  onSwapSides: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onOpenHistory: () => void;
  t: (key: string) => string;
}

export const CenterControls: React.FC<CenterControlsProps> = ({
  gameStatus,
  topPlayer,
  soundEnabled,
  hapticsEnabled,
  onTogglePlayPause,
  onResetClick,
  onOpenSettings,
  onOpenIllegalMove,
  onSwapSides,
  onToggleSound,
  onToggleHaptics,
  onOpenHistory,
  t,
}) => {
  const isRunning = gameStatus === 'running';
  const isReady = gameStatus === 'ready';

  return (
    <div className="z-10 flex items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-slate-200 shadow-lg text-slate-700">
      {/* Play / Pause Button */}
      <button
        type="button"
        onClick={onTogglePlayPause}
        disabled={isReady || gameStatus === 'flag_fall'}
        title={isRunning ? t('pause') : t('play')}
        className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
          isReady || gameStatus === 'flag_fall'
            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
            : isRunning
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 active:scale-95 ring-2 ring-emerald-300'
        }`}
      >
        {isRunning ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onResetClick}
        title={t('reset')}
        className="p-2 sm:p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="h-5 w-px bg-slate-200 mx-0.5" />

      {/* Illegal Move / Penalty Button */}
      <button
        type="button"
        onClick={onOpenIllegalMove}
        title="Illegal Move Penalty / Manual Time Increment (+Time)"
        className="p-2 sm:p-2.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 active:scale-95 transition-all cursor-pointer relative group"
      >
        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute -top-1 -right-1 text-[9px] bg-amber-600 text-white font-black px-1 rounded-full shadow-2xs">
          +
        </span>
      </button>

      {/* 180° Swap Sides Button (Player 1 & 2 switch sides) */}
      <button
        type="button"
        onClick={onSwapSides}
        title={`Swap Sides 180° (Currently Top: ${
          topPlayer === 'white' ? 'White' : 'Black'
        })`}
        className="p-2 sm:p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all relative cursor-pointer"
      >
        <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="absolute -top-1 -right-1 text-[9px] bg-blue-600 text-white font-bold px-1 rounded-full shadow-2xs">
          180°
        </span>
      </button>

      <div className="h-5 w-px bg-slate-200 mx-0.5" />

      {/* Time Settings / Preset Modal Button */}
      <button
        type="button"
        onClick={onOpenSettings}
        title={t('settings')}
        className="p-2 sm:p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
      >
        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Move History / Stats Button */}
      <button
        type="button"
        onClick={onOpenHistory}
        title={t('stats')}
        className="p-2 sm:p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all cursor-pointer"
      >
        <History className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Sound Toggle */}
      <button
        type="button"
        onClick={onToggleSound}
        title={soundEnabled ? t('soundOn') : t('soundOff')}
        className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer ${
          soundEnabled
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
        }`}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Haptics Toggle */}
      <button
        type="button"
        onClick={onToggleHaptics}
        title={t('haptics')}
        className={`p-2 sm:p-2.5 rounded-full transition-all hidden sm:flex cursor-pointer ${
          hapticsEnabled
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
        }`}
      >
        <SmartphoneNfc className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};
