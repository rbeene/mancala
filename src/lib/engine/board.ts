import type { Board, Player, MoveResult } from './types.js';
import {
  INITIAL_STONES,
  TOTAL_SLOTS,
  P1_PITS,
  P2_PITS,
  P1_STORE,
  P2_STORE,
  playerPits,
  playerStore,
  opponentStore,
  opposite
} from './types.js';

export function createBoard(): Board {
  const board: Board = new Array(TOTAL_SLOTS).fill(0);
  for (const i of P1_PITS) board[i] = INITIAL_STONES;
  for (const i of P2_PITS) board[i] = INITIAL_STONES;
  return board;
}

export function makeMove(board: Board, pitIndex: number, player: Player): MoveResult {
  const newBoard = [...board];
  const skipStore = opponentStore(player);
  const ownStore = playerStore(player);
  const ownPits = playerPits(player);

  let stones = newBoard[pitIndex];
  newBoard[pitIndex] = 0;

  let index = pitIndex;
  const path: number[] = [];

  while (stones > 0) {
    index = (index + 1) % TOTAL_SLOTS;
    if (index === skipStore) continue;
    newBoard[index] += 1;
    stones -= 1;
    path.push(index);
  }

  const lastIndex = index;
  let extraTurn = false;
  let captured = false;
  let capturedCount = 0;

  // Extra turn: last stone in own store
  if (lastIndex === ownStore) {
    extraTurn = true;
  }
  // Capture: last stone in empty own pit, opposite has stones
  else if (
    ownPits.includes(lastIndex) &&
    newBoard[lastIndex] === 1 &&
    newBoard[opposite(lastIndex)] > 0
  ) {
    captured = true;
    capturedCount = newBoard[lastIndex] + newBoard[opposite(lastIndex)];
    newBoard[ownStore] += capturedCount;
    newBoard[lastIndex] = 0;
    newBoard[opposite(lastIndex)] = 0;
  }

  // Check game over
  const p1Empty = P1_PITS.every(i => newBoard[i] === 0);
  const p2Empty = P2_PITS.every(i => newBoard[i] === 0);
  const gameOver = p1Empty || p2Empty;

  if (gameOver) {
    // Sweep remaining stones to respective stores
    for (const i of P1_PITS) {
      newBoard[P1_STORE] += newBoard[i];
      newBoard[i] = 0;
    }
    for (const i of P2_PITS) {
      newBoard[P2_STORE] += newBoard[i];
      newBoard[i] = 0;
    }
  }

  return {
    board: newBoard,
    extraTurn,
    captured,
    capturedCount,
    lastIndex,
    gameOver,
    path
  };
}
