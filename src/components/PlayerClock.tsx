import React from 'react';
import { Player, OrientationMode } from '../types/chess';
import { formatTime } from '../utils/translations';
import { Flag, Play, CheckCircle2 } from 'lucide-react';

interface PlayerClockProps {
  player: Player;
  timeMs: number;
  isActive: boolean;
  isReady: boolean;
  isPaused: boolean;
  isFlagFall: boolean;
  isWinner: boolean;
  moves: number;
  orientation: OrientationMode;
  t: (key: string) => string;
  onPress: () => void;
}

export const PlayerClock: React.FC<PlayerClockProps> = ({
  player,
  timeMs,
  isActive,
  isReady,
  isPaused,
  isFlagFall,
  isWinner,
  moves,
  orientation,
  t,
  onPress,
}) => {
  const isWhite = player === 'white';
  const isTopPlayer = isWhite;
  const isFaceToFace = orientation === 'face_to_face' && isTopPlayer;
  const isLowTime = timeMs <= 15000 && timeMs > 0;
  const isOutOfTime = timeMs <= 0;

  // Format time string
  const timeDisplay = formatTime(timeMs, false, true);

  // Dynamic tactile styling
  let containerBg = 'bg-white';
  let borderColor = 'border-slate-200';
  let shadowEffect = 'shadow-md';
  let textColor = 'text-slate-900';

  if (isOutOfTime) {
    containerBg = 'bg-red-50';
    borderColor = 'border-red-400';
    textColor = 'text-red-700';
  } else if (isWinner) {
    containerBg = 'bg-emerald-50';
    borderColor = 'border-emerald-400';
    textColor = 'text-emerald-800';
  } else if (isActive) {
    if (isLowTime) {
      containerBg = 'bg-amber-50';
      borderColor = 'border-amber-400 ring-4 ring-amber-200/60';
      textColor = 'text-amber-900';
    } else {
      containerBg = isWhite ? 'bg-blue-50/80' : 'bg-indigo-50/80';
      borderColor = 'border-blue-500 ring-4 ring-blue-300/50';
      textColor = 'text-blue-950';
    }
    shadowEffect = 'shadow-xl scale-[0.99]';
  } else {
    // Inactive styling
    containerBg = isWhite ? 'bg-slate-50' : 'bg-slate-100';
    borderColor = 'border-slate-300';
    textColor = 'text-slate-600';
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={isPaused || isOutOfTime || isWinner}
      className={`relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-150 rounded-2xl sm:rounded-3xl border-2 sm:border-3 ${containerBg} ${borderColor} ${shadowEffect} active:scale-[0.98] cursor-pointer touch-manipulation select-none overflow-hidden ${
        isFaceToFace ? 'rotate-180' : ''
      }`}
    >
      {/* Top Header Row within Clock Button */}
      <div className="w-full flex items-center justify-between pointer-events-none">
        {/* Player Name and Piece Icon */}
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
              isWhite
                ? 'bg-white text-slate-800 border-slate-300 shadow-sm'
                : 'bg-slate-800 text-white border-slate-900 shadow-sm'
            }`}
          >
            {isWhite ? '♔' : '♚'}
          </span>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight leading-tight">
              {isWhite ? t('white') : t('black')}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {t('moves')}: {moves}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isOutOfTime ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-bounce shadow-sm">
              <Flag className="w-3.5 h-3.5 fill-current" />
              {t('timeOut')}
            </span>
          ) : isWinner ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('winner')}
            </span>
          ) : isActive ? (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                isLowTime ? 'bg-amber-600 animate-pulse' : 'bg-blue-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              {isLowTime ? 'Low Time!' : t('playing')}
            </span>
          ) : isReady ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
              <Play className="w-3 h-3 fill-current" />
              {t('tapToPlay')}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
              {t('waiting')}
            </span>
          )}
        </div>
      </div>

      {/* Main Large Time Display */}
      <div className="flex-1 flex flex-col items-center justify-center my-2 pointer-events-none">
        <span
          className={`font-mono tabular-nums font-black tracking-tight text-center transition-colors ${textColor} ${
            timeDisplay.length > 5
              ? 'text-5xl sm:text-7xl md:text-8xl'
              : 'text-6xl sm:text-8xl md:text-9xl'
          } ${isLowTime && isActive ? 'animate-warning-pulse text-amber-600' : ''}`}
        >
          {timeDisplay}
        </span>

        {/* Sub-label under clock */}
        <span className="text-xs sm:text-sm font-medium mt-1 text-slate-500">
          {isActive
            ? t('tapToSwitch')
            : isReady
            ? t('tapToPlay')
            : isOutOfTime
            ? t('timeOut')
            : t('waiting')}
        </span>
      </div>

      {/* Visual Plunger bar at bottom of the clock */}
      <div className="w-full pointer-events-none">
        <div
          className={`h-2 sm:h-2.5 w-full rounded-full transition-all duration-200 ${
            isActive
              ? isLowTime
                ? 'bg-amber-500 shadow-sm'
                : 'bg-blue-600 shadow-sm'
              : 'bg-slate-200'
          }`}
        />
      </div>
    </button>
  );
};
