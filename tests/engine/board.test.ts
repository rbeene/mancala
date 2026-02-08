import { describe, it, expect } from 'vitest';
import { createBoard, makeMove } from '../../src/lib/engine/board.js';

describe('createBoard', () => {
  it('creates a board with 4 stones in each pit and 0 in stores', () => {
    const board = createBoard();
    expect(board).toEqual([4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]);
    expect(board.length).toBe(14);
  });
});

describe('makeMove', () => {
  it('distributes stones counter-clockwise from P1 pit 0', () => {
    const board = createBoard();
    const result = makeMove(board, 0, 0);
    expect(result.board[0]).toBe(0);
    expect(result.board[1]).toBe(5);
    expect(result.board[2]).toBe(5);
    expect(result.board[3]).toBe(5);
    expect(result.board[4]).toBe(5);
    expect(result.extraTurn).toBe(false);
  });

  it('distributes stones counter-clockwise from P1 pit 2 (example from rules)', () => {
    const board = [4, 4, 6, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 2, 0);
    expect(result.board).toEqual([4, 4, 0, 5, 5, 5, 1, 5, 5, 4, 4, 4, 4, 0]);
    expect(result.lastIndex).toBe(8);
    expect(result.extraTurn).toBe(false);
  });

  it('grants extra turn when last stone lands in own store (P1)', () => {
    const board = createBoard();
    const result = makeMove(board, 2, 0);
    expect(result.lastIndex).toBe(6);
    expect(result.extraTurn).toBe(true);
    expect(result.board[6]).toBe(1);
  });

  it('grants extra turn when last stone lands in own store (P2)', () => {
    const board = createBoard();
    const result = makeMove(board, 9, 1);
    expect(result.lastIndex).toBe(13);
    expect(result.extraTurn).toBe(true);
    expect(result.board[13]).toBe(1);
  });

  it('skips opponent store during P1 distribution', () => {
    // P1 pit 5 has 10 stones. P2 has stones so game won't end.
    // Distribute: 6(store), 7, 8, 9, 10, 11, 12, skip 13, 0, 1, 2
    // Wait — 10 stones: 6,7,8,9,10,11,12,0,1,2 (skip 13). Last at 2.
    // Pit 2 was 0, opposite(2)=10 got a stone from distribution (now 1).
    // Capture: 1+1=2 → store. Store = 1+2=3.
    // But we want to test the skip, so let's avoid capture:
    // Give P1 pits some stones so landing pit isn't empty.
    const board = [1, 1, 1, 1, 1, 10, 0, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 5, 0);
    // From pit 5 (10 stones): 6,7,8,9,10,11,12,skip 13,0,1,2
    // 10 stones placed at: 6,7,8,9,10,11,12,0,1,2
    expect(result.board[13]).toBe(0); // P2 store skipped
    expect(result.board[6]).toBe(1);  // P1 store gets one
    // Pit 0 had 1, now 2; pit 1 had 1, now 2; pit 2 had 1, now 2
    expect(result.board[0]).toBe(2);
    expect(result.board[1]).toBe(2);
    expect(result.board[2]).toBe(2);
  });

  it('skips opponent store during P2 distribution', () => {
    // P2 pit 12 has 10 stones. P1 has stones so game won't end.
    const board = [4, 4, 4, 4, 4, 4, 0, 1, 1, 1, 1, 1, 10, 0];
    const result = makeMove(board, 12, 1);
    // From pit 12 (10 stones): 13,0,1,2,3,4,5,skip 6,7,8,9
    // 10 stones placed at: 13,0,1,2,3,4,5,7,8,9
    expect(result.board[6]).toBe(0);  // P1 store skipped
    expect(result.board[13]).toBe(1); // P2 store gets one
    expect(result.board[0]).toBe(5);
    expect(result.board[7]).toBe(2);
  });

  it('performs capture when last stone lands in empty own pit', () => {
    // P1 pit 5 has 8 stones. Pit 0 is empty, opposite (12) has 5 stones.
    // Other P2 pits have stones to avoid game-over.
    const board = [0, 0, 0, 0, 0, 8, 0, 4, 4, 4, 4, 4, 5, 0];
    const result = makeMove(board, 5, 0);
    // From pit 5 (8 stones): 6,7,8,9,10,11,12,skip 13,0
    // 8 stones at: 6,7,8,9,10,11,12,0
    // Pit 12: was 5, now 6. Pit 0: was 0, now 1. Last at 0.
    // Capture: pit 0 (1) + opposite pit 12 (6) = 7 → P1 store
    // Store: 1 (distribution) + 7 (capture) = 8
    expect(result.lastIndex).toBe(0);
    expect(result.captured).toBe(true);
    expect(result.capturedCount).toBe(7);
    expect(result.board[0]).toBe(0);
    expect(result.board[12]).toBe(0);
    expect(result.board[6]).toBe(8);
  });

  it('does NOT capture if last stone lands on opponent side', () => {
    // P1 pit 5 has 2, P2 pits have stones. Last stone at 7 (P2 side).
    const board = [4, 4, 4, 4, 4, 2, 0, 0, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 5, 0);
    // 2 stones: 6(store), 7. Last at 7 (P2 side, empty). No capture for P1.
    expect(result.lastIndex).toBe(7);
    expect(result.captured).toBe(false);
    expect(result.board[7]).toBe(1);
  });

  it('does NOT capture if opposite pit is empty', () => {
    // P1 pit 1 has 2 stones, pit 3 is empty, opposite(3)=9 is also empty.
    // Other pits have stones to prevent game-over.
    const board = [4, 2, 4, 0, 4, 4, 0, 4, 4, 0, 4, 4, 4, 0];
    const result = makeMove(board, 1, 0);
    // 2 stones from pit 1: 2, 3. Last at 3.
    // Pit 3 was 0, now 1. Opposite(3)=9, which is 0. No capture.
    expect(result.lastIndex).toBe(3);
    expect(result.captured).toBe(false);
    expect(result.board[3]).toBe(1);
  });

  it('captures when landing pit was empty and opposite has stones', () => {
    // P1 pit 1 has 2 stones. Pit 3 is empty, opposite(3)=9 has 5.
    const board = [4, 2, 3, 0, 4, 4, 0, 4, 4, 5, 4, 4, 4, 0];
    const result = makeMove(board, 1, 0);
    // 2 stones from pit 1: 2, 3. Last at 3.
    // Pit 3 was 0, now 1. Opposite(3)=9 has 5. Capture!
    // Take 1 + 5 = 6 → P1 store.
    expect(result.lastIndex).toBe(3);
    expect(result.captured).toBe(true);
    expect(result.board[3]).toBe(0);
    expect(result.board[9]).toBe(0);
    expect(result.board[6]).toBe(6);
  });

  it('does NOT capture when landing pit already had stones', () => {
    // P1 pit 1 has 1 stone, pit 2 already has 3. No capture even if opposite has stones.
    const board = [4, 1, 3, 4, 4, 4, 0, 4, 4, 4, 5, 4, 4, 0];
    const result = makeMove(board, 1, 0);
    // 1 stone from pit 1: lands at 2. Pit 2 had 3, now 4. Not empty → no capture.
    expect(result.lastIndex).toBe(2);
    expect(result.captured).toBe(false);
    expect(result.board[2]).toBe(4);
  });

  it('handles wrap-around with 13 stones (full revolution)', () => {
    // Pit 0 has 13 stones, all other pits and stores have 0 except P2 side to avoid game-over.
    // Actually: 13 stones from pit 0, skip P2 store, = 13 positions.
    // 1,2,3,4,5,6(store),7,8,9,10,11,12,0. Lands at 0.
    // But pit 0 was emptied and now gets 1 stone again. Was empty → capture check.
    // Opposite(0) = 12, which now has 1 (got a stone during distribution). Capture fires.
    // To avoid capture and just test wrap-around, let's keep opposite with 0.
    // But index 12 gets a stone during distribution! So we can't avoid it unless we use
    // a board where the capture result is predictable.
    // Let's just test the wrap-around mechanics and accept the capture.
    const board = [13, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    const result = makeMove(board, 0, 0);
    // 13 stones: 1,2,3,4,5,6,7,8,9,10,11,12,0 (skip 13)
    // Each pit 1-12 gets +1, pit 0 gets 1, store gets 1
    // Pit 0 was emptied (13→0), then gets 1 stone → was empty → capture check
    // Opposite(0)=12: was 4, now 5. Capture: 1+5=6 → store
    // Store: 0+1(dist)+6(capture)=7
    expect(result.board[13]).toBe(0);  // P2 store skipped
    expect(result.board[6]).toBe(7);   // 1 from dist + 6 from capture
    expect(result.board[0]).toBe(0);   // captured
    expect(result.board[12]).toBe(0);  // captured opposite
    // Other pits: 1-5 get +1 each, 7-11 get +1 each
    expect(result.board[1]).toBe(5);
    expect(result.board[7]).toBe(5);
  });

  it('detects game over when P1 side is empty after move', () => {
    const board = [0, 0, 0, 0, 0, 1, 20, 0, 0, 0, 0, 0, 3, 10];
    const result = makeMove(board, 5, 0);
    expect(result.board[5]).toBe(0);
    expect(result.gameOver).toBe(true);
    expect(result.board[12]).toBe(0);
    expect(result.board[13]).toBe(13); // 10 + 3
    expect(result.board[6]).toBe(21);  // 20 + 1
  });

  it('detects game over when P2 side is empty after move', () => {
    const board = [3, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 1, 20];
    const result = makeMove(board, 12, 1);
    expect(result.gameOver).toBe(true);
    expect(result.board[0]).toBe(0);
    expect(result.board[6]).toBe(13);  // 10 + 3
    expect(result.board[13]).toBe(21); // 20 + 1
  });

  it('returns the distribution path', () => {
    const board = createBoard();
    const result = makeMove(board, 0, 0);
    expect(result.path).toEqual([1, 2, 3, 4]);
  });

  it('does not modify the original board', () => {
    const board = createBoard();
    const original = [...board];
    makeMove(board, 0, 0);
    expect(board).toEqual(original);
  });
});
