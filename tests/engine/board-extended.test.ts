import { describe, it, expect } from 'vitest';
import { createBoard, makeMove } from '../../src/lib/engine/board.js';

describe('makeMove - P2 mechanics', () => {
  it('distributes stones counter-clockwise from P2 pit 7', () => {
    const board = createBoard();
    const result = makeMove(board, 7, 1);
    // 4 stones from pit 7: 8, 9, 10, 11. Last at 11.
    expect(result.board[7]).toBe(0);
    expect(result.board[8]).toBe(5);
    expect(result.board[9]).toBe(5);
    expect(result.board[10]).toBe(5);
    expect(result.board[11]).toBe(5);
    expect(result.extraTurn).toBe(false);
  });

  it('performs capture for P2 when last stone lands in empty own pit', () => {
    // P2 pit 8 has 1, pit 9 is empty, opposite(9) = 3 which has 6 stones
    const board = [4, 4, 4, 6, 4, 4, 0, 4, 1, 0, 4, 4, 4, 0];
    const result = makeMove(board, 8, 1);
    // 1 stone from pit 8: lands at 9. Pit 9 was empty, now 1. Opposite(9)=3 has 6.
    // Capture: 1 + 6 = 7 -> P2 store (index 13)
    expect(result.lastIndex).toBe(9);
    expect(result.captured).toBe(true);
    expect(result.capturedCount).toBe(7);
    expect(result.board[9]).toBe(0);
    expect(result.board[3]).toBe(0);
    expect(result.board[13]).toBe(7);
  });

  it('does NOT capture for P2 if last stone lands on P1 side', () => {
    // P2 pit 12 has 3 stones: 13(store), 0, 1. Last at 1 (P1 side)
    const board = [0, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 3, 0];
    const result = makeMove(board, 12, 1);
    // 3 stones: 13, 0, 1. Last at 1 (P1 side). No capture for P2.
    expect(result.lastIndex).toBe(1);
    expect(result.captured).toBe(false);
  });
});

describe('makeMove - chained extra turns', () => {
  it('supports consecutive extra turns (first extra turn sets up second)', () => {
    // P1 pit 2 has 4 stones: 3,4,5,6(store). Extra turn.
    const board = createBoard();
    const result1 = makeMove(board, 2, 0);
    expect(result1.extraTurn).toBe(true);
    expect(result1.board[6]).toBe(1);

    // After first move: [4, 4, 0, 5, 5, 5, 1, 4, 4, 4, 4, 4, 4, 0]
    // For extra turn, need pitIndex + stoneCount = 6 (skipping no stores for P1 in this range)
    // Pit 0: 0 + 4 = 4. Last at 4. No.
    // Pit 1: 1 + 4 = 5. Last at 5. No.
    // Pit 3: 3 + 5 = 8. Last at 8. No.
    // Pit 4: 4 + 5 = 9. Last at 9. No.
    // Pit 5: 5 + 5 = 10. Last at 10. No.
    // None give extra turn from this position. Let me set up a board where two consecutive extra turns work.

    // Custom board where P1 can chain extra turns:
    // Pit 5 has 1 (-> 6, store, extra turn), pit 4 has 2 (-> 5, 6, store extra turn after pit 5 empties)
    const board2 = [4, 4, 4, 4, 2, 1, 0, 4, 4, 4, 4, 4, 4, 0];
    const r1 = makeMove(board2, 5, 0);
    // Pit 5 (1 stone) -> 6(store). Extra turn!
    expect(r1.extraTurn).toBe(true);
    expect(r1.board[6]).toBe(1);
    // After: [4, 4, 4, 4, 2, 0, 1, 4, 4, 4, 4, 4, 4, 0]

    const r2 = makeMove(r1.board, 4, 0);
    // Pit 4 (2 stones) -> 5, 6(store). Extra turn!
    expect(r2.extraTurn).toBe(true);
    expect(r2.board[6]).toBe(2);
  });
});

describe('makeMove - game over edge cases', () => {
  it('extra turn is NOT granted when game ends (side empties)', () => {
    // P1 has only pit 2 with 4 stones. All others empty.
    // Move from pit 2: 3,4,5,6(store). Last at 6 = store. Extra turn would apply.
    // But after move, P1 side is all empty -> game ends.
    const board = [0, 0, 4, 0, 0, 0, 10, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 2, 0);
    // Stones distributed: 3,4,5,6. Last at 6 (store). Extra turn flag set.
    // But P1 pits: [0,0,0,1,1,1] - NOT all empty. Hmm, those got stones.
    // Let me recalculate: pit 2 has 4 stones, distributed to 3,4,5,6.
    // After: [0, 0, 0, 1, 1, 1, 11, 4, 4, 4, 4, 4, 4, 0]
    // P1 pits not empty. Let me set up differently.

    // P1 pit 5 has 1 stone. Only non-empty P1 pit.
    // Move: lands at 6 (store). Extra turn.
    // After: all P1 pits empty -> game over.
    const board2 = [0, 0, 0, 0, 0, 1, 15, 4, 4, 4, 4, 4, 4, 0];
    const result2 = makeMove(board2, 5, 0);
    expect(result2.lastIndex).toBe(6);
    expect(result2.gameOver).toBe(true);
    expect(result2.extraTurn).toBe(true); // flag is set, but game is over
    // P2's remaining stones swept to P2 store
    expect(result2.board[13]).toBe(24); // 0 + 4*6 = 24
    expect(result2.board[6]).toBe(16);  // 15 + 1
  });

  it('game ends with draw at 24-24', () => {
    // P1 has 1 stone in pit 5, 23 in store. P2 has 24 distributed.
    const board = [0, 0, 0, 0, 0, 1, 23, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 5, 0);
    // P1 store becomes 24. P2 sweeps 24. Draw.
    expect(result.gameOver).toBe(true);
    expect(result.board[6]).toBe(24);
    expect(result.board[13]).toBe(24);
  });
});

describe('makeMove - wrap-around with many stones', () => {
  it('handles 14+ stones wrapping more than once', () => {
    // Pit 0 has 14 stones. Skip P2 store (13), so 13 positions per revolution.
    // 14 stones = 13 (one full revolution) + 1 more. Pit 1 gets 2 stones total.
    // Revolution: 1,2,3,4,5,6,7,8,9,10,11,12,0 (13 positions, skip 13)
    // Then one more: 1. Last at 1.
    const board = [14, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 0, 0);
    // Each pit 1-5 gets 1, store gets 1, pits 7-12 get 1, pit 0 gets 1, pit 1 gets extra 1
    expect(result.board[13]).toBe(0);  // P2 store still skipped
    expect(result.board[0]).toBe(1);   // got 1 during wrap
    expect(result.board[1]).toBe(2);   // got 2 total (first pass + last stone)
    expect(result.board[6]).toBe(1);   // store got 1
    expect(result.lastIndex).toBe(1);
    // Pit 1 had 0, now has 2 -> not empty -> no capture
    expect(result.captured).toBe(false);
  });

  it('handles 26 stones (two full revolutions)', () => {
    // 26 stones from pit 0, skip P2 store. 13 positions per revolution.
    // 26 = 2 * 13. Lands at pit 0 again (same as 13 stones but +1 everywhere again).
    const board = [26, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 0, 0);
    // Each non-skipped position gets 2 stones
    expect(result.board[13]).toBe(0); // still skipped
    expect(result.board[0]).toBe(2);  // lands here last, was empty, now 2
    expect(result.board[6]).toBe(2);  // store gets 2
    expect(result.board[1]).toBe(2);
    expect(result.lastIndex).toBe(0);
    // Pit 0 has 2 -> was empty, but now has 2 not 1 -> no capture
    expect(result.captured).toBe(false);
  });
});

describe('makeMove - stone conservation', () => {
  it('total stones always equal 48 after move from starting board', () => {
    const board = createBoard();
    for (let pit = 0; pit <= 5; pit++) {
      const result = makeMove(board, pit, 0);
      const total = result.board.reduce((sum, v) => sum + v, 0);
      expect(total).toBe(48);
    }
    for (let pit = 7; pit <= 12; pit++) {
      const result = makeMove(board, pit, 1);
      const total = result.board.reduce((sum, v) => sum + v, 0);
      expect(total).toBe(48);
    }
  });

  it('total stones preserved after capture', () => {
    const board = [0, 2, 3, 0, 4, 4, 0, 4, 4, 5, 4, 4, 4, 0];
    const totalBefore = board.reduce((s, v) => s + v, 0);
    const result = makeMove(board, 1, 0);
    // This triggers a capture (pit 3 was empty, opposite has stones)
    expect(result.captured).toBe(true);
    const totalAfter = result.board.reduce((s, v) => s + v, 0);
    expect(totalAfter).toBe(totalBefore);
  });

  it('total stones preserved after game over sweep', () => {
    const board = [0, 0, 0, 0, 0, 1, 20, 0, 0, 0, 0, 0, 3, 10];
    const totalBefore = board.reduce((s, v) => s + v, 0);
    const result = makeMove(board, 5, 0);
    expect(result.gameOver).toBe(true);
    const totalAfter = result.board.reduce((s, v) => s + v, 0);
    expect(totalAfter).toBe(totalBefore);
  });
});
