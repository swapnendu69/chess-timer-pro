import React from 'react';
import { Player } from '../types/chess';
import { Trophy, RotateCcw, X, History } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  onClose: () => void;
  onRematch: () => void;
  onViewStats: () => void;
  t: (key: string) => string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  onClose,
  onRematch,
  onViewStats,
  t,
}) => {
  if (!isOpen || !winner) return null;

  const isWhiteWinner = winner === 'white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center overflow-hidden">
        {/* Close cross */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Trophy badge */}
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
          {t('timeOut')}
        </span>

        <h3 className="text-xl font-black text-slate-900 mt-2">
          {isWhiteWinner ? t('white') : t('black')} {t('winner')}
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          {isWhiteWinner ? 'Black' : 'White'} ran out of time on the clock!
        </p>

        {/* Actions */}
        <div className="space-y-2 mt-6">
          <button
            type="button"
            onClick={() => {
              onRematch();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch / New Game</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onViewStats();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
          >
            <History className="w-4 h-4" />
            <span>{t('stats')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
