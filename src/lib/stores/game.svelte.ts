import { createBoard, makeMove } from '../engine/board.js';
import { isValidMove, getValidMoves, isGameOver, getWinner, getScores } from '../engine/rules.js';
import { getAIMove } from '../engine/ai.js';
import type { Board, Player, GameMode, Difficulty, MoveResult } from '../engine/types.js';
import { opponent, playerStore } from '../engine/types.js';
import { audio } from '../audio/sounds.js';

export type Screen = 'menu' | 'game' | 'gameover';

export type AnimationState = {
  active: boolean;
  phase: 'idle' | 'scooping' | 'distributing' | 'capturing' | 'sweeping' | 'extra-turn';
  sourcePit: number;
  currentDropPit: number;
  capturePit: number;
  captureOppositePit: number;
  path: number[];
  pathIndex: number;
};

function createGameState() {
  let screen = $state<Screen>('menu');
  let board = $state<Board>(createBoard());
  let currentPlayer = $state<Player>(0);
  let gameOver = $state(false);
  let winner = $state<Player | null>(null);
  let isDraw = $state(false);
  let mode = $state<GameMode>('pvc');
  let difficulty = $state<Difficulty>('medium');
  let scores = $derived<[number, number]>([board[6], board[13]]);
  let isComputerTurn = $derived(mode === 'pvc' && currentPlayer === 1 && !gameOver);
  let animating = $state(false);
  let extraTurnMessage = $state(false);
  let lastMoveResult = $state<MoveResult | null>(null);
  let invalidPit = $state<number | null>(null);
  let thinking = $state(false);

  function startGame(selectedMode: GameMode, selectedDifficulty: Difficulty) {
    mode = selectedMode;
    difficulty = selectedDifficulty;
    board = createBoard();
    currentPlayer = 0;
    gameOver = false;
    winner = null;
    isDraw = false;
    animating = false;
    extraTurnMessage = false;
    lastMoveResult = null;
    invalidPit = null;
    thinking = false;
    screen = 'game';
  }

  function goToMenu() {
    screen = 'menu';
  }

  function canClickPit(pitIndex: number): boolean {
    if (animating || gameOver || thinking) return false;
    return isValidMove(board, pitIndex, currentPlayer);
  }

  async function handlePitClick(pitIndex: number) {
    if (!canClickPit(pitIndex)) {
      // Invalid move - shake
      if (!animating && !gameOver && !thinking) {
        audio.playInvalidMove();
        invalidPit = pitIndex;
        setTimeout(() => { invalidPit = null; }, 400);
      }
      return;
    }

    await executeMove(pitIndex);
  }

  async function executeMove(pitIndex: number) {
    animating = true;
    extraTurnMessage = false;

    const result = makeMove(board, pitIndex, currentPlayer);
    lastMoveResult = result;

    // Animate distribution
    const path = result.path;
    const oldBoard = [...board];

    // Phase 1: Scoop - empty the source pit
    audio.playPickup();
    board = board.map((v, i) => i === pitIndex ? 0 : v);
    await delay(200);

    // Phase 2: Distribute one stone at a time
    let tempBoard = [...board];
    for (let i = 0; i < path.length; i++) {
      tempBoard = [...tempBoard];
      tempBoard[path[i]] = (tempBoard[path[i]] || 0) + 1;
      board = tempBoard;
      audio.playDrop(i);
      await delay(150);
    }

    // Phase 3: If capture, animate it
    if (result.captured) {
      await delay(200);
      audio.playCapture();
      board = result.board;
      await delay(400);
    }

    // Phase 4: If game over, sweep remaining stones
    if (result.gameOver) {
      board = result.board;
      await delay(300);
    }

    // Set final board state
    board = result.board;

    // Check game over
    if (result.gameOver) {
      gameOver = true;
      const [p1Score, p2Score] = getScores(result.board);
      const w = getWinner(result.board);
      winner = w;
      isDraw = w === null;
      audio.playGameOver();
      animating = false;
      await delay(800);
      screen = 'gameover';
      return;
    }

    // Handle extra turn
    if (result.extraTurn) {
      audio.playExtraTurn();
      extraTurnMessage = true;
      animating = false;
      await delay(1200);
      extraTurnMessage = false;

      // If computer gets extra turn
      if (mode === 'pvc' && currentPlayer === 1) {
        await doComputerTurn();
      }
      return;
    }

    // Switch player
    currentPlayer = opponent(currentPlayer);
    animating = false;

    // Trigger computer turn if needed
    if (mode === 'pvc' && currentPlayer === 1) {
      await doComputerTurn();
    }
  }

  async function doComputerTurn() {
    thinking = true;
    await delay(500 + Math.random() * 400);

    const move = getAIMove(board, 1, difficulty);
    thinking = false;
    await executeMove(move);
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return {
    get screen() { return screen; },
    get board() { return board; },
    get currentPlayer() { return currentPlayer; },
    get gameOver() { return gameOver; },
    get winner() { return winner; },
    get isDraw() { return isDraw; },
    get mode() { return mode; },
    get difficulty() { return difficulty; },
    get scores() { return scores; },
    get isComputerTurn() { return isComputerTurn; },
    get animating() { return animating; },
    get extraTurnMessage() { return extraTurnMessage; },
    get invalidPit() { return invalidPit; },
    get thinking() { return thinking; },
    startGame,
    goToMenu,
    canClickPit,
    handlePitClick,
  };
}

export const game = createGameState();
