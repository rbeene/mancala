import type { Board, Player, Difficulty } from './types.js';
import {
  playerPits,
  playerStore,
  opponentStore,
  opponent,
  opposite,
  P1_PITS,
  P2_PITS,
  P1_STORE,
  P2_STORE,
  TOTAL_SLOTS
} from './types.js';
import { makeMove } from './board.js';
import { getValidMoves, isGameOver } from './rules.js';

export function getAIMove(board: Board, player: Player, difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return easyMove(board, player);
    case 'medium':
      return mediumMove(board, player);
    case 'hard':
      return hardMove(board, player);
  }
}

function easyMove(board: Board, player: Player): number {
  const moves = getValidMoves(board, player);
  return moves[Math.floor(Math.random() * moves.length)];
}

function lastStoneIndex(board: Board, pitIndex: number, player: Player): number {
  const skipStore = opponentStore(player);
  let stones = board[pitIndex];
  let index = pitIndex;
  while (stones > 0) {
    index = (index + 1) % TOTAL_SLOTS;
    if (index === skipStore) continue;
    stones--;
  }
  return index;
}

function mediumMove(board: Board, player: Player): number {
  const moves = getValidMoves(board, player);
  const store = playerStore(player);
  const pits = playerPits(player);

  // Priority 1: Extra turns
  const extraTurnMoves = moves.filter(m => lastStoneIndex(board, m, player) === store);
  if (extraTurnMoves.length > 0) {
    // Pick the one that puts most stones in store (highest pit count)
    return extraTurnMoves.reduce((best, m) =>
      board[m] > board[best] ? m : best
    );
  }

  // Priority 2: Captures (pick the biggest capture)
  let bestCapture = -1;
  let bestCaptureValue = 0;
  for (const m of moves) {
    const lastIdx = lastStoneIndex(board, m, player);
    if (
      pits.includes(lastIdx) &&
      board[lastIdx] === 0 &&
      board[opposite(lastIdx)] > 0
    ) {
      const value = board[opposite(lastIdx)];
      if (value > bestCaptureValue) {
        bestCaptureValue = value;
        bestCapture = m;
      }
    }
  }
  if (bestCapture !== -1) return bestCapture;

  // Priority 3: Random
  return moves[Math.floor(Math.random() * moves.length)];
}

function hardMove(board: Board, player: Player): number {
  const moves = getValidMoves(board, player);
  const MAX_DEPTH = 10;

  let bestScore = -Infinity;
  let bestPit = moves[0];

  // Move ordering: extra turns first, then captures, then others
  const ordered = orderMoves(board, moves, player);

  for (const pit of ordered) {
    const result = makeMove(board, pit, player);
    const score = result.extraTurn
      ? minimax(result.board, MAX_DEPTH - 1, -Infinity, Infinity, true, player)
      : minimax(result.board, MAX_DEPTH - 1, -Infinity, Infinity, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestPit = pit;
    }
  }

  return bestPit;
}

function orderMoves(board: Board, moves: number[], player: Player): number[] {
  const store = playerStore(player);
  const pits = playerPits(player);

  const scored = moves.map(m => {
    let priority = 0;
    const lastIdx = lastStoneIndex(board, m, player);
    if (lastIdx === store) priority = 2;
    else if (pits.includes(lastIdx) && board[lastIdx] === 0 && board[opposite(lastIdx)] > 0) {
      priority = 1;
    }
    return { move: m, priority };
  });

  scored.sort((a, b) => b.priority - a.priority);
  return scored.map(s => s.move);
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  if (depth === 0 || isGameOver(board)) {
    return evaluate(board, aiPlayer);
  }

  const currentPlayer = isMaximizing ? aiPlayer : opponent(aiPlayer);
  const moves = getValidMoves(board, currentPlayer);

  if (moves.length === 0) {
    return evaluate(board, aiPlayer);
  }

  const ordered = orderMoves(board, moves, currentPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const pit of ordered) {
      const result = makeMove(board, pit, currentPlayer);
      const nextIsMax = result.extraTurn ? true : false;
      const eval_ = minimax(result.board, depth - 1, alpha, beta, nextIsMax, aiPlayer);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const pit of ordered) {
      const result = makeMove(board, pit, currentPlayer);
      const nextIsMax = result.extraTurn ? false : true;
      const eval_ = minimax(result.board, depth - 1, alpha, beta, nextIsMax, aiPlayer);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluate(board: Board, aiPlayer: Player): number {
  const opp = opponent(aiPlayer);
  const aiStore = playerStore(aiPlayer);
  const oppStore = playerStore(opp);
  const aiPits = playerPits(aiPlayer);
  const oppPits = playerPits(opp);

  // Terminal state check
  if (isGameOver(board)) {
    const aiScore = board[aiStore];
    const oppScore = board[oppStore];
    if (aiScore > oppScore) return 1000;
    if (aiScore < oppScore) return -1000;
    return 0;
  }

  // Early win detection
  if (board[aiStore] >= 25) return 1000;
  if (board[oppStore] >= 25) return -1000;

  let score = 0;

  // Mancala differential (weight 6)
  score += 6 * (board[aiStore] - board[oppStore]);

  // Stones on each side (weight 2)
  const aiStones = aiPits.reduce((sum, i) => sum + board[i], 0);
  const oppStones = oppPits.reduce((sum, i) => sum + board[i], 0);
  score += 2 * (aiStones - oppStones);

  // Extra turn potential (weight 3)
  for (const pit of aiPits) {
    if (board[pit] > 0 && lastStoneIndex(board, pit, aiPlayer) === aiStore) {
      score += 3;
    }
  }

  // Capture potential (weight 2)
  for (const pit of aiPits) {
    if (board[pit] > 0) {
      const lastIdx = lastStoneIndex(board, pit, aiPlayer);
      if (aiPits.includes(lastIdx) && board[lastIdx] === 0 && board[opposite(lastIdx)] > 0) {
        score += 2 * (board[opposite(lastIdx)] / 12);
      }
    }
  }

  // Defensive: penalize vulnerable empty pits (weight -1)
  for (const pit of aiPits) {
    if (board[pit] === 0 && board[opposite(pit)] > 4) {
      score -= 1;
    }
  }

  return score;
}
