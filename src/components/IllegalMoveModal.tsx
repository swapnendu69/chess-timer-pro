import React, { useState } from 'react';
import { ShieldAlert, X, Scale, Check, Play } from 'lucide-react';
import { Player } from '../types/chess';
import { formatTime } from '../utils/translations';

interface IllegalMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  whiteTimeMs: number;
  blackTimeMs: number;
  onApplyPenalty: (beneficiary: Player, addedSeconds: number, reason: string, shouldResume: boolean) => void;
  onManualAdjust: (whiteDeltaSec: number, blackDeltaSec: number, shouldResume: boolean) => void;
  t: (key: string) => string;
}

export const IllegalMoveModal: React.FC<IllegalMoveModalProps> = ({
  isOpen,
  onClose,
  whiteTimeMs,
  blackTimeMs,
  onApplyPenalty,
  onManualAdjust,
}) => {
  const [selectedOffender, setSelectedOffender] = useState<Player>('white');
  const [penaltySeconds, setPenaltySeconds] = useState<number>(60); // Default 1 min (FIDE Blitz rule)
  const [customMinutes, setCustomMinutes] = useState<string>('1');
  const [customSeconds, setCustomSeconds] = useState<string>('0');
  const [activeTab, setActiveTab] = useState<'fide_penalty' | 'manual_adjust'>('fide_penalty');

  // Manual adjust state
  const [whiteDelta, setWhiteDelta] = useState<number>(0);
  const [blackDelta, setBlackDelta] = useState<number>(0);

  if (!isOpen) return null;

  const beneficiary: Player = selectedOffender === 'white' ? 'black' : 'white';

  const previewBeneficiaryNewTime =
    beneficiary === 'white'
      ? Math.max(1000, whiteTimeMs + penaltySeconds * 1000)
      : Math.max(1000, blackTimeMs + penaltySeconds * 1000);

  const previewWhiteManualTime = Math.max(1000, whiteTimeMs + whiteDelta * 1000);
  const previewBlackManualTime = Math.max(1000, blackTimeMs + blackDelta * 1000);

  const handleQuickPreset = (sec: number) => {
    setPenaltySeconds(sec);
    setCustomMinutes(String(Math.floor(sec / 60)));
    setCustomSeconds(String(sec % 60));
  };

  const handleCustomChange = (mins: string, secs: string) => {
    setCustomMinutes(mins);
    setCustomSeconds(secs);
    const m = parseInt(mins, 10) || 0;
    const s = parseInt(secs, 10) || 0;
    setPenaltySeconds(m * 60 + s);
  };

  const handleApply = (shouldResume: boolean) => {
    if (activeTab === 'fide_penalty') {
      const reason = `Illegal Move: +${Math.round(penaltySeconds / 60)}m to ${
        beneficiary === 'white' ? 'White' : 'Black'
      }`;
      onApplyPenalty(beneficiary, penaltySeconds, reason, shouldResume);
    } else {
      onManualAdjust(whiteDelta, blackDelta, shouldResume);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Illegal Move Penalty
              </h2>
              <p className="text-xs text-amber-800">
                Award penalty time to opponent or adjust clocks manually
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('fide_penalty')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'fide_penalty'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            FIDE Penalty
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual_adjust')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'manual_adjust'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manual Adjustment (+ / -)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'fide_penalty' ? (
            <>
              {/* Step 1: Who made the illegal move */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  1. Who made the illegal move?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOffender('white')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition text-left cursor-pointer ${
                      selectedOffender === 'white'
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-300 shadow-2xs flex items-center justify-center text-xs font-bold">
                      ♔
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      White
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      → Add time to Black
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOffender('black')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition text-left cursor-pointer ${
                      selectedOffender === 'black'
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-1 ring-amber-400'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white shadow-2xs flex items-center justify-center text-xs font-bold">
                      ♚
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      Black
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      → Add time to White
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 2: Time to add to opponent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  2. Penalty time to award opponent:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset(60)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center cursor-pointer ${
                      penaltySeconds === 60
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>+1 Minute</span>
                    <span className="text-[10px] opacity-85 font-normal">FIDE Blitz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset(120)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center cursor-pointer ${
                      penaltySeconds === 120
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>+2 Minutes</span>
                    <span className="text-[10px] opacity-85 font-normal">FIDE Rapid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickPreset(30)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center cursor-pointer ${
                      penaltySeconds === 30
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>+30 Seconds</span>
                    <span className="text-[10px] opacity-85 font-normal">Bullet / Fast</span>
                  </button>
                </div>

                {/* Custom input */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Custom Time:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={customMinutes}
                        onChange={(e) => handleCustomChange(e.target.value, customSeconds)}
                        className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center text-sm font-bold text-slate-800"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customSeconds}
                        onChange={(e) => handleCustomChange(customMinutes, e.target.value)}
                        className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center text-sm font-bold text-slate-800"
                      />
                      <span className="text-xs text-slate-500">sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview card */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  <span>Preview Result:</span>
                </div>
                <div className="mt-2 text-xs text-emerald-900 leading-relaxed">
                  <strong>{beneficiary === 'white' ? 'White' : 'Black'}</strong> clock will increase from{' '}
                  <span className="font-mono font-bold">
                    {formatTime(beneficiary === 'white' ? whiteTimeMs : blackTimeMs, false)}
                  </span>{' '}
                  to{' '}
                  <span className="font-mono font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-sm">
                    {formatTime(previewBeneficiaryNewTime, false)}
                  </span>
                  {' '}(+{penaltySeconds}s)
                </div>
              </div>
            </>
          ) : (
            /* Manual Adjust Tab */
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Directly adjust either player's remaining time on the clock:
              </p>

              {/* White time adjust */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
                    <span className="text-xs font-bold text-slate-800">White Clock:</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800">
                    {formatTime(previewWhiteManualTime, false)}{' '}
                    {whiteDelta !== 0 && (
                      <span
                        className={`text-xs ${
                          whiteDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        ({whiteDelta > 0 ? `+${whiteDelta}` : whiteDelta}s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWhiteDelta((d) => d - 60)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    -1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhiteDelta((d) => d - 30)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    -30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhiteDelta((d) => d + 30)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhiteDelta((d) => d + 60)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhiteDelta((d) => d + 120)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +2m
                  </button>
                </div>
              </div>

              {/* Black time adjust */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-800" />
                    <span className="text-xs font-bold text-slate-800">Black Clock:</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800">
                    {formatTime(previewBlackManualTime, false)}{' '}
                    {blackDelta !== 0 && (
                      <span
                        className={`text-xs ${
                          blackDelta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        ({blackDelta > 0 ? `+${blackDelta}` : blackDelta}s)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBlackDelta((d) => d - 60)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    -1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackDelta((d) => d - 30)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    -30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackDelta((d) => d + 30)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +30s
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackDelta((d) => d + 60)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +1m
                  </button>
                  <button
                    type="button"
                    onClick={() => setBlackDelta((d) => d + 120)}
                    className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    +2m
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleApply(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Apply & Keep Paused
          </button>
          <button
            type="button"
            onClick={() => handleApply(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Apply & Resume Game
          </button>
        </div>
      </div>
    </div>
  );
};
