import React from 'react';
import { History, X } from 'lucide-react';
import { MoveRecord } from '../types/chess';
import { formatTime } from '../utils/translations';

interface MoveHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  moveHistory: MoveRecord[];
  whiteMoves: number;
  blackMoves: number;
  t: (key: string) => string;
}

export const MoveHistoryModal: React.FC<MoveHistoryModalProps> = ({
  isOpen,
  onClose,
  moveHistory,
  whiteMoves,
  blackMoves,
  t,
}) => {
  if (!isOpen) return null;

  const whiteRecords = moveHistory.filter((m) => m.player === 'white');
  const blackRecords = moveHistory.filter((m) => m.player === 'black');

  const avgWhiteMs =
    whiteRecords.length > 0
      ? whiteRecords.reduce((acc, cur) => acc + cur.timeSpentMs, 0) / whiteRecords.length
      : 0;

  const avgBlackMs =
    blackRecords.length > 0
      ? blackRecords.reduce((acc, cur) => acc + cur.timeSpentMs, 0) / blackRecords.length
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">{t('stats')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/70 border-b border-slate-100">
          {/* White Stats */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
              <span>{t('white')}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">{t('moves')}:</span>
              <span className="text-base font-bold text-slate-800">{whiteMoves}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-slate-500">
              <span>Avg Time:</span>
              <span className="font-semibold text-slate-700">
                {Math.round(avgWhiteMs / 1000)}s
              </span>
            </div>
          </div>

          {/* Black Stats */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span>{t('black')}</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">{t('moves')}:</span>
              <span className="text-base font-bold text-slate-800">{blackMoves}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between text-xs text-slate-500">
              <span>Avg Time:</span>
              <span className="font-semibold text-slate-700">
                {Math.round(avgBlackMs / 1000)}s
              </span>
            </div>
          </div>
        </div>

        {/* Move History Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {moveHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No moves recorded yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                <span>#</span>
                <span>Player</span>
                <span>Time Spent</span>
                <span className="text-right">Clock</span>
              </div>
              {moveHistory.map((record, index) => {
                const isWhite = record.player === 'white';
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition border border-slate-100"
                  >
                    <div className="grid grid-cols-4 items-center text-xs">
                      <span className="font-mono text-slate-400 font-bold">
                        {record.moveNumber}
                      </span>
                      <span className="font-semibold flex items-center gap-1.5 text-slate-700">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isWhite ? 'bg-slate-300 border border-slate-400' : 'bg-slate-800'
                          }`}
                        />
                        {isWhite ? 'White' : 'Black'}
                      </span>
                      <span className="font-mono text-slate-600">
                        {record.timeSpentMs > 0 ? `${(record.timeSpentMs / 1000).toFixed(1)}s` : '-'}
                      </span>
                      <span className="font-mono font-bold text-right text-slate-800">
                        {formatTime(record.timeRemainingMs, false)}
                      </span>
                    </div>
                    {record.note && (
                      <div className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ⚠️ {record.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
