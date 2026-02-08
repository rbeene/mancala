export type Player = 0 | 1;

export type Board = number[];

export type GameMode = 'pvp' | 'pvc';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MoveResult {
  board: Board;
  extraTurn: boolean;
  captured: boolean;
  capturedCount: number;
  lastIndex: number;
  gameOver: boolean;
  path: number[];
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | null;
  isDraw: boolean;
  mode: GameMode;
  difficulty: Difficulty;
}

export const P1_PITS = [0, 1, 2, 3, 4, 5] as const;
export const P1_STORE = 6;
export const P2_PITS = [7, 8, 9, 10, 11, 12] as const;
export const P2_STORE = 13;
export const TOTAL_SLOTS = 14;
export const INITIAL_STONES = 4;

export function playerPits(player: Player): readonly number[] {
  return player === 0 ? P1_PITS : P2_PITS;
}

export function playerStore(player: Player): number {
  return player === 0 ? P1_STORE : P2_STORE;
}

export function opponentStore(player: Player): number {
  return player === 0 ? P2_STORE : P1_STORE;
}

export function opponent(player: Player): Player {
  return player === 0 ? 1 : 0;
}

export function opposite(index: number): number {
  return 12 - index;
}
