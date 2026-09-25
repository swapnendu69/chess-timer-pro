export function formatTime(ms: number, showMilliseconds: boolean = false): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let timeString = '';
  if (hours > 0) {
    timeString = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // Under 20 seconds, optionally display decimal tenths for bullet/blitz excitement
    if (showMilliseconds && ms < 20000 && ms > 0) {
      const tenths = Math.floor((ms % 1000) / 100);
      const secs = Math.floor(ms / 1000);
      timeString = `${secs}.${tenths}`;
    } else {
      timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  return timeString;
}

export const translations = {
  appTitle: 'Chess Timer Pro',
  white: 'White',
  black: 'Black',
  moves: 'Moves',
  tapToPlay: 'Tap to Start',
  tapToSwitch: 'Tap when Move is Done',
  waiting: 'Waiting',
  playing: 'Active',
  paused: 'Paused',
  timeOut: 'Time Over!',
  winner: 'Winner!',
  play: 'Play',
  pause: 'Pause',
  reset: 'Reset',
  settings: 'Time Control',
  stats: 'Move History',
  faceToFace: 'Face-to-Face',
  sideBySide: 'Side-by-Side',
  portrait: 'Portrait',
  soundOn: 'Sound On',
  soundOff: 'Muted',
  haptics: 'Haptics',
  installApp: 'Install App',
  offlineReady: '100% Offline Ready',
  confirmReset: 'Do you want to reset the clocks?',
  cancel: 'Cancel',
  confirm: 'Yes, Reset',
  customTime: 'Custom Time Control',
  baseTime: 'Base Time (Minutes)',
  increment: 'Increment (Seconds/Move)',
  mode: 'Mode',
  saveAndApply: 'Save & Apply',
  timePresets: 'Time Presets',
  bullet: 'Bullet',
  blitz: 'Blitz',
  rapid: 'Rapid',
  classical: 'Classical',
  fischer: 'Fischer (+Seconds added)',
  delay: 'Simple Delay',
  suddenDeath: 'Sudden Death (No bonus)',
};
