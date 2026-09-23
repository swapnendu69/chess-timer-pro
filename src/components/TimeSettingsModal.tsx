import React, { useState } from 'react';
import { TIME_PRESETS } from '../utils/constants';
import { TimePreset, TimeControlMode } from '../types/chess';
import { X, Clock, Check } from 'lucide-react';

interface TimeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresetId: string;
  onSelectPreset: (preset: TimePreset) => void;
  onApplyCustomTime: (
    whiteMin: number,
    whiteSec: number,
    blackMin: number,
    blackSec: number,
    incrementSec: number,
    mode: TimeControlMode
  ) => void;
  currentSettings: {
    whiteMin: number;
    whiteSec: number;
    blackMin: number;
    blackSec: number;
    incrementSec: number;
    mode: TimeControlMode;
  };
  t: (key: string) => string;
}

export const TimeSettingsModal: React.FC<TimeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentPresetId,
  onSelectPreset,
  onApplyCustomTime,
  currentSettings,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'blitz' | 'rapid' | 'bullet' | 'classical'>('all');

  // Custom Form state
  const [customWhiteMin, setCustomWhiteMin] = useState(currentSettings.whiteMin);
  const [customWhiteSec, setCustomWhiteSec] = useState(currentSettings.whiteSec);
  const [customBlackMin, setCustomBlackMin] = useState(currentSettings.blackMin);
  const [customBlackSec, setCustomBlackSec] = useState(currentSettings.blackSec);
  const [customIncrement, setCustomIncrement] = useState(currentSettings.incrementSec);
  const [customMode, setCustomMode] = useState<TimeControlMode>(currentSettings.mode);
  const [syncBothPlayers, setSyncBothPlayers] = useState(true);

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBlackMin = syncBothPlayers ? customWhiteMin : customBlackMin;
    const finalBlackSec = syncBothPlayers ? customWhiteSec : customBlackSec;
    onApplyCustomTime(
      Math.max(0, customWhiteMin),
      Math.max(0, customWhiteSec),
      Math.max(0, finalBlackMin),
      Math.max(0, finalBlackSec),
      Math.max(0, customIncrement),
      customMode
    );
    onClose();
  };

  const filteredPresets =
    selectedCategory === 'all'
      ? TIME_PRESETS
      : TIME_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">{t('settings')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === 'presets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('timePresets')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('customTime')}
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'presets' ? (
            <div className="space-y-4">
              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'blitz', 'rapid', 'bullet', 'classical'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All' : t(cat)}
                  </button>
                ))}
              </div>

              {/* Presets grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {filteredPresets.map((preset) => {
                  const isSelected = currentPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectPreset(preset);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 ring-2 ring-blue-300'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {preset.nameEn}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {preset.baseMinutes} min + {preset.incrementSeconds}s
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  Sync time for both players
                </span>
                <input
                  type="checkbox"
                  checked={syncBothPlayers}
                  onChange={(e) => setSyncBothPlayers(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Player 1 Time Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  {syncBothPlayers ? 'Players Base Time (Min & Sec)' : t('white')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={customWhiteMin}
                      onChange={(e) => setCustomWhiteMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      Seconds
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customWhiteSec}
                      onChange={(e) => setCustomWhiteSec(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* If not synced, show Player 2 inputs */}
              {!syncBothPlayers && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    {t('black')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Minutes
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={customBlackMin}
                        onChange={(e) => setCustomBlackMin(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">
                        Seconds
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customBlackSec}
                        onChange={(e) => setCustomBlackSec(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Increment / Bonus */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  {t('increment')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={customIncrement}
                    onChange={(e) => setCustomIncrement(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">
                    seconds added per move
                  </span>
                </div>
              </div>

              {/* Time Control Type */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  {t('mode')}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCustomMode('fischer')}
                    className={`p-2.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                      customMode === 'fischer'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Fischer</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Adds increment on move
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomMode('sudden_death')}
                    className={`p-2.5 rounded-lg border text-left font-medium transition cursor-pointer ${
                      customMode === 'sudden_death'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-400'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold">Sudden Death</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Fixed time, no bonus
                    </div>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition active:scale-[0.99] cursor-pointer"
              >
                {t('saveAndApply')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
