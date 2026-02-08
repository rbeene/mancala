import { describe, it, expect } from 'vitest';
import { isValidMove, getValidMoves, isGameOver, getWinner, getScores } from '../../src/lib/engine/rules.js';
import { createBoard } from '../../src/lib/engine/board.js';

describe('isValidMove', () => {
  it('allows P1 to select non-empty pits 0-5', () => {
    const board = createBoard();
    expect(isValidMove(board, 0, 0)).toBe(true);
    expect(isValidMove(board, 5, 0)).toBe(true);
  });

  it('rejects P1 selecting P2 pits', () => {
    const board = createBoard();
    expect(isValidMove(board, 7, 0)).toBe(false);
    expect(isValidMove(board, 12, 0)).toBe(false);
  });

  it('rejects selecting stores', () => {
    const board = createBoard();
    expect(isValidMove(board, 6, 0)).toBe(false);
    expect(isValidMove(board, 13, 1)).toBe(false);
  });

  it('rejects selecting empty pits', () => {
    const board = [0, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    expect(isValidMove(board, 0, 0)).toBe(false);
  });

  it('allows P2 to select non-empty pits 7-12', () => {
    const board = createBoard();
    expect(isValidMove(board, 7, 1)).toBe(true);
    expect(isValidMove(board, 12, 1)).toBe(true);
  });

  it('rejects P2 selecting P1 pits', () => {
    const board = createBoard();
    expect(isValidMove(board, 0, 1)).toBe(false);
    expect(isValidMove(board, 5, 1)).toBe(false);
  });
});

describe('getValidMoves', () => {
  it('returns all non-empty pits for P1 on starting board', () => {
    const board = createBoard();
    expect(getValidMoves(board, 0)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('returns all non-empty pits for P2 on starting board', () => {
    const board = createBoard();
    expect(getValidMoves(board, 1)).toEqual([7, 8, 9, 10, 11, 12]);
  });

  it('excludes empty pits', () => {
    const board = [0, 4, 0, 4, 0, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    expect(getValidMoves(board, 0)).toEqual([1, 3, 5]);
  });

  it('returns empty array when all pits are empty', () => {
    const board = [0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 24];
    expect(getValidMoves(board, 0)).toEqual([]);
    expect(getValidMoves(board, 1)).toEqual([]);
  });
});

describe('isGameOver', () => {
  it('returns false on starting board', () => {
    expect(isGameOver(createBoard())).toBe(false);
  });

  it('returns true when P1 side is empty', () => {
    const board = [0, 0, 0, 0, 0, 0, 24, 4, 4, 4, 4, 4, 4, 0];
    expect(isGameOver(board)).toBe(true);
  });

  it('returns true when P2 side is empty', () => {
    const board = [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 24];
    expect(isGameOver(board)).toBe(true);
  });

  it('returns true when both sides are empty', () => {
    const board = [0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 24];
    expect(isGameOver(board)).toBe(true);
  });
});

describe('getScores', () => {
  it('returns store values as scores', () => {
    const board = [0, 0, 0, 0, 0, 0, 25, 0, 0, 0, 0, 0, 0, 23];
    const scores = getScores(board);
    expect(scores).toEqual([25, 23]);
  });
});

describe('getWinner', () => {
  it('returns P1 when P1 has more stones', () => {
    const board = [0, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0, 18];
    expect(getWinner(board)).toBe(0);
  });

  it('returns P2 when P2 has more stones', () => {
    const board = [0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 30];
    expect(getWinner(board)).toBe(1);
  });

  it('returns null for a draw', () => {
    const board = [0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 24];
    expect(getWinner(board)).toBeNull();
  });
});
