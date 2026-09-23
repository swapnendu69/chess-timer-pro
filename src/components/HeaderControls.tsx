import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface HeaderControlsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isOnline: boolean;
  t: (key: string) => string;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  t,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Fullscreen not supported
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-20 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs">
            ♘
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-tight">
              {t('appTitle')}
            </h1>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1.5 sm:p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-2xs"
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>
    </header>
  );
};

