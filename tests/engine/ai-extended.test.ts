import { describe, it, expect, vi } from 'vitest';
import { getAIMove } from '../../src/lib/engine/ai.js';
import { createBoard, makeMove } from '../../src/lib/engine/board.js';

describe('AI - Easy: randomness verification', () => {
  it('does not consistently pick the same move (statistical test)', () => {
    const board = createBoard();
    const moveCounts = new Map<number, number>();

    // Run 100 times and verify at least 2 different moves are chosen
    for (let i = 0; i < 100; i++) {
      const move = getAIMove(board, 1, 'easy');
      moveCounts.set(move, (moveCounts.get(move) || 0) + 1);
    }

    // With 6 valid moves and random selection, probability of picking same move 100 times
    // is astronomically low. We expect at least 2 different moves.
    expect(moveCounts.size).toBeGreaterThanOrEqual(2);
  });

  it('never returns an invalid move when only one pit available', () => {
    const board = [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 5, 0];
    for (let i = 0; i < 10; i++) {
      expect(getAIMove(board, 1, 'easy')).toBe(12);
    }
  });
});

describe('AI - Medium: priority system', () => {
  it('prefers extra turn with most stones among multiple options', () => {
    // P2: pit 9 has 4 (-> store 13, extra turn), pit 12 has 1 (-> store 13, extra turn)
    // Medium should pick pit 9 (more stones = higher contribution)
    const board = [4, 4, 4, 4, 4, 4, 0, 3, 3, 4, 3, 3, 1, 0];
    const move = getAIMove(board, 1, 'medium');
    expect(move).toBe(9); // 4 stones > 1 stone
  });

  it('picks largest capture when multiple captures available', () => {
    // P2 pit 8 has 1 -> lands at 9 (empty, opposite 3 has 10)
    // P2 pit 10 has 1 -> lands at 11 (empty, opposite 1 has 2)
    // Should pick pit 8 (captures 10 > 2)
    const board = [4, 2, 4, 10, 4, 4, 0, 3, 1, 0, 1, 0, 3, 0];
    const move = getAIMove(board, 1, 'medium');
    expect(move).toBe(8); // captures 10 stones vs 2
  });
});

describe('AI - Hard: strategic scenarios', () => {
  it('avoids moves that give opponent easy wins', () => {
    // P2 has a clear lead and should maintain it
    const board = [1, 0, 0, 0, 0, 1, 10, 0, 0, 1, 0, 0, 0, 22];
    // P2 only has pit 9 with 1 stone. Must play it.
    const move = getAIMove(board, 1, 'hard');
    expect(move).toBe(9);
  });

  it('works correctly when AI is player 1', () => {
    // Test that hard AI also works when called as player 0
    const board = createBoard();
    const move = getAIMove(board, 0, 'hard');
    expect(move).toBeGreaterThanOrEqual(0);
    expect(move).toBeLessThanOrEqual(5);
    expect(board[move]).toBeGreaterThan(0);
  });

  it('prefers extra turn on opening as P1 (pit 2 has 4 stones -> store)', () => {
    const board = createBoard();
    const move = getAIMove(board, 0, 'hard');
    // Pit 2 has 4 stones: 3,4,5,6(store). Extra turn.
    // Hard AI should recognize this is strong.
    expect(move).toBe(2);
  });

  it('handles near-endgame positions', () => {
    // Few stones left, should still find best move
    const board = [0, 0, 0, 0, 1, 0, 20, 0, 0, 0, 0, 0, 1, 18];
    const move1 = getAIMove(board, 0, 'hard');
    expect(move1).toBe(4); // only valid move for P1

    const move2 = getAIMove(board, 1, 'hard');
    expect(move2).toBe(12); // only valid move for P2
  });
});

describe('AI - all difficulties return valid moves', () => {
  const difficulties = ['easy', 'medium', 'hard'] as const;
  const boards = [
    { name: 'starting', board: createBoard() },
    { name: 'mid-game', board: [2, 3, 0, 1, 5, 4, 8, 0, 2, 3, 4, 1, 0, 10] },
    { name: 'late-game', board: [0, 0, 1, 0, 0, 0, 22, 0, 0, 0, 0, 1, 0, 20] },
  ];

  for (const diff of difficulties) {
    for (const { name, board } of boards) {
      it(`${diff} AI returns valid P1 move on ${name} board`, () => {
        const validP1 = [0,1,2,3,4,5].filter(i => board[i] > 0);
        if (validP1.length > 0) {
          const move = getAIMove(board, 0, diff);
          expect(validP1).toContain(move);
        }
      });

      it(`${diff} AI returns valid P2 move on ${name} board`, () => {
        const validP2 = [7,8,9,10,11,12].filter(i => board[i] > 0);
        if (validP2.length > 0) {
          const move = getAIMove(board, 1, diff);
          expect(validP2).toContain(move);
        }
      });
    }
  }
});
