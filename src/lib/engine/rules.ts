import type { Board, Player } from './types.js';
import {
  playerPits,
  playerStore,
  P1_PITS,
  P2_PITS,
  P1_STORE,
  P2_STORE
} from './types.js';

export function isValidMove(board: Board, pitIndex: number, player: Player): boolean {
  const pits = playerPits(player);
  return pits.includes(pitIndex) && board[pitIndex] > 0;
}

export function getValidMoves(board: Board, player: Player): number[] {
  const pits = playerPits(player);
  return pits.filter(i => board[i] > 0);
}

export function isGameOver(board: Board): boolean {
  const p1Empty = P1_PITS.every(i => board[i] === 0);
  const p2Empty = P2_PITS.every(i => board[i] === 0);
  return p1Empty || p2Empty;
}

export function getScores(board: Board): [number, number] {
  return [board[P1_STORE], board[P2_STORE]];
}

export function getWinner(board: Board): Player | null {
  const [p1, p2] = getScores(board);
  if (p1 > p2) return 0;
  if (p2 > p1) return 1;
  return null;
}
