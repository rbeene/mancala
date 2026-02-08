import { describe, it, expect } from 'vitest';
import { getAIMove } from '../../src/lib/engine/ai.js';
import { createBoard, makeMove } from '../../src/lib/engine/board.js';

describe('AI - Easy', () => {
  it('returns a valid move (non-empty P2 pit)', () => {
    const board = createBoard();
    const move = getAIMove(board, 1, 'easy');
    expect(move).toBeGreaterThanOrEqual(7);
    expect(move).toBeLessThanOrEqual(12);
    expect(board[move]).toBeGreaterThan(0);
  });

  it('picks from available pits when some are empty', () => {
    const board = [4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 3, 0];
    const move = getAIMove(board, 1, 'easy');
    expect(move).toBe(12); // only valid move
  });
});

describe('AI - Medium', () => {
  it('prefers extra turn moves', () => {
    // P2 pit 9 has 4 stones -> 10, 11, 12, 13(store) = extra turn
    const board = createBoard();
    const move = getAIMove(board, 1, 'medium');
    // Pit 9 gives extra turn (4 stones: 10, 11, 12, 13)
    expect(move).toBe(9);
  });

  it('prefers capture when no extra turn available', () => {
    // Setup where no extra turn exists but capture does
    // P2 pit 7 is empty, opposite pit 5 has many stones
    // P2 pit 8 has 1 stone, which would land in pit 9 (no extra turn, no capture)
    // P2 pit 12 has 6 stones -> 13(store, skip for P2? No, P2 doesn't skip own store) ... wait
    // Actually P2 does NOT skip own store. P2 skips P1 store (index 6).
    // P2 pit 12 has 1 stone -> goes to 13 (P2 store) = extra turn. Let me avoid that.

    // Let me set it up explicitly:
    // P2 pits: 7=0, 8=2, 9=0, 10=3, 11=0, 12=0
    // P1 pits: 0=0, 1=0, 2=0, 3=0, 4=0, 5=6 (opposite of 7)
    // P2 pit 8 has 2: 9, 10. Last at 10, pit 10 had 3, now 4 -> not capture
    // P2 pit 10 has 3: 11, 12, 13(store) -> extra turn! Avoid this.
    // Let me try: 7=0, 8=1, 9=0, 10=0, 11=3, 12=0
    // Pit 8 has 1: lands at 9 (empty, own side), opposite=3, P1 pit 3 = need stones there
    // Pit 11 has 3: 12, 13(store skip? No P2 doesn't skip 13), 12->13->0
    // 11->12, 12->13(store), 0 = lands at 0, not P2 side
    // Wait, pit 11 with 3 stones: 12, 13, 0. Last at 0 (P1 side, no capture for P2)

    const board = [0, 0, 0, 5, 0, 6, 0, 0, 1, 0, 0, 3, 0, 0];
    // Pit 8 (1 stone) -> lands at 9 (empty, P2 side), opposite(9)=3, P1 pit 3 has 5. CAPTURE!
    // Pit 11 (3 stones) -> 12, 13(store), 0. Last at 0. No capture for P2.
    // No extra turns available (check: 8->9, 11->12,13,0)
    // Pit 11 distributes 3: 12, 13, 0. Hmm wait, 11+3=14 means it passes through store.
    // Actually: from pit 11, going counter-clockwise: next is 12, then 13, then 0
    // Last stone at 0. Since P2 skips index 6 (not 13), all these are fine.
    // But pit 11 with 3 stones: does any landing in 13 = extra turn? The second stone lands at 13!
    // So pit 11 is NOT what I want. Let me use pit 11 with 2 stones instead.
    const board2 = [0, 0, 0, 5, 0, 6, 0, 0, 1, 0, 0, 2, 0, 0];
    // Pit 8 (1): -> 9. Capture (9 empty, opp=3 has 5). Captures 6 stones.
    // Pit 11 (2): -> 12, 13(store). Extra turn! Doh.
    // Let me use: 7=0, 8=1, 9=0, 10=2, 11=0, 12=0
    const board3 = [0, 0, 0, 5, 0, 6, 0, 0, 1, 0, 2, 0, 0, 0];
    // Pit 8 (1): -> 9. Empty, P2 side, opposite(9)=3 has 5. CAPTURE of 6!
    // Pit 10 (2): -> 11, 12. Last at 12 (empty, P2 side, opposite(12)=0 which has 0). No capture.
    // No extra turns: pit 8 lands at 9, pit 10 lands at 12. Neither is 13.
    const move = getAIMove(board3, 1, 'medium');
    expect(move).toBe(8); // capture move
  });

  it('falls back to random when no special moves', () => {
    // All P2 pits have stones, none give extra turn or capture
    const board = [4, 4, 4, 4, 4, 4, 0, 1, 1, 1, 1, 1, 1, 0];
    const move = getAIMove(board, 1, 'medium');
    expect(move).toBeGreaterThanOrEqual(7);
    expect(move).toBeLessThanOrEqual(12);
  });
});

describe('AI - Hard', () => {
  it('returns a valid move', () => {
    const board = createBoard();
    const move = getAIMove(board, 1, 'hard');
    expect(move).toBeGreaterThanOrEqual(7);
    expect(move).toBeLessThanOrEqual(12);
    expect(board[move]).toBeGreaterThan(0);
  });

  it('takes obvious winning capture', () => {
    // Setup where one move clearly wins
    const board = [0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 1, 3];
    // P2 only has pit 12 with 1 stone -> lands at 13 (store). Score becomes 4.
    // Game over since P2 side empty after. P1 gets 0 remaining.
    // P1: 20, P2: 4. P1 wins but P2 has no other choice.
    const move = getAIMove(board, 1, 'hard');
    expect(move).toBe(12);
  });

  it('prefers extra turn on opening board', () => {
    // On starting board for P2, pit 9 gives extra turn (4 stones: 10,11,12,13)
    const board = createBoard();
    const move = getAIMove(board, 1, 'hard');
    // Hard AI should recognize the extra turn at pit 9
    expect(move).toBe(9);
  });

  it('completes within reasonable time', () => {
    const board = createBoard();
    const start = Date.now();
    getAIMove(board, 1, 'hard');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000); // should complete within 5 seconds
  });
});
