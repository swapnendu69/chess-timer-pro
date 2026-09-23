export type Language = 'bn' | 'en';

export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}

export function formatTime(ms: number, isBn: boolean = false, showMilliseconds: boolean = false): string {
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

  return isBn ? toBengaliNumber(timeString) : timeString;
}

export const translations = {
  bn: {
    appTitle: 'দাবা ঘড়ি প্রো',
    white: 'খেলোয়াড় ১ (সাদা)',
    black: 'খেলোয়াড় ২ (কালো)',
    moves: 'চাল',
    tapToPlay: 'শুরু করতে চাপুন',
    tapToSwitch: 'চাল শেষ করতে চাপুন',
    waiting: 'অপেক্ষমাণ',
    playing: 'চলছে...',
    paused: 'বিরতি',
    timeOut: 'সময় শেষ!',
    winner: 'বিজয়ী!',
    play: 'শুরু',
    pause: 'বিরতি',
    reset: 'রিসেট',
    settings: 'টাইম কন্ট্রোল',
    stats: 'মোভ হিস্ট্রি',
    faceToFace: 'মুখোমুখি',
    sideBySide: 'পাশাপাশি',
    portrait: 'একমুখী',
    soundOn: 'শব্দ চালু',
    soundOff: 'শব্দ বন্ধ',
    haptics: 'ভাইব্রেশন',
    installApp: 'ইনস্টল করুন',
    offlineReady: 'ইন্টারনেট ছাড়া অফলাইন রেডি',
    confirmReset: 'আপনি কি ঘড়িটি আবার নতুন করে শুরু করতে চান?',
    cancel: 'বাতিল',
    confirm: 'হ্যাঁ, রিসেট করুন',
    customTime: 'কাস্টম সময় নির্ধারণ',
    baseTime: 'মূল সময় (মিনিট)',
    increment: 'ইনক্রিমেন্ট (সেকেন্ড প্রতি চাল)',
    mode: 'মোড',
    saveAndApply: 'সংরক্ষণ ও প্রয়োগ',
    timePresets: 'টাইম প্রিসেটস',
    bullet: 'বুলেট',
    blitz: 'ব্লিটজ',
    rapid: 'র‍্যাপিড',
    classical: 'ক্লাসিক্যাল',
    fischer: 'ফিশার (+সেকেন্ড যুক্ত হবে)',
    delay: 'সিম্পল ডিলে',
    suddenDeath: 'স্থির সময় (নো বোনাস)',
    githubBuildGuide: 'অ্যান্ড্রয়েড ও গিটহাব বিল্ড গাইড',
    githubInstructions: 'ইন্টারনেট ছাড়া অ্যান্ড্রয়েডে অফলাইন অ্যাপ হিসেবে চালানোর নির্দেশিকা',
  },
  en: {
    appTitle: 'Chess Timer Pro',
    white: 'Player 1 (White)',
    black: 'Player 2 (Black)',
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
    githubBuildGuide: 'Android & GitHub Build Guide',
    githubInstructions: 'How to build APK and run offline on Android via GitHub',
  },
};
