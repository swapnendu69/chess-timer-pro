export type Player = 'white' | 'black';

export type TimeControlMode = 'fischer' | 'bronstein' | 'delay' | 'sudden_death';

export type OrientationMode = 'face_to_face' | 'side_by_side' | 'portrait';

export interface TimePreset {
  id: string;
  nameBn: string;
  nameEn: string;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical';
  baseMinutes: number;
  baseSeconds?: number;
  incrementSeconds: number;
  mode: TimeControlMode;
}

export interface PlayerSettings {
  initialMinutes: number;
  initialSeconds: number;
  incrementSeconds: number;
  delaySeconds?: number;
}

export interface MoveRecord {
  moveNumber: number;
  player: Player;
  timeSpentMs: number;
  timeRemainingMs: number;
  timestamp: number;
}

export interface GameStats {
  whiteMoves: number;
  blackMoves: number;
  whiteAvgTimeMs: number;
  blackAvgTimeMs: number;
  totalGameTimeMs: number;
  history: MoveRecord[];
}
