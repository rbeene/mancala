import { createBoard, makeMove } from '../engine/board.js';
import { isValidMove, getValidMoves, isGameOver, getWinner, getScores } from '../engine/rules.js';
import { getAIMove } from '../engine/ai.js';
import type { Board, Player, GameMode, Difficulty, MoveResult } from '../engine/types.js';
import { opponent, playerStore } from '../engine/types.js';
import { audio } from '../audio/sounds.js';
import { getCommentary } from '../engine/commentary.js';

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

export type FlyingStone = {
  active: boolean;
  fromPit: number;
  toPit: number;
  gemColor: { fill: string; mid: string; highlight: string; edge: string };
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
  let commentary = $state<string | null>(null);
  let commentaryTimer: ReturnType<typeof setTimeout> | null = null;

  function showCommentary(text: string) {
    if (mode !== 'pvc') return;
    if (commentaryTimer) clearTimeout(commentaryTimer);
    commentary = text;
    commentaryTimer = setTimeout(() => { commentary = null; }, 3000);
  }

  function triggerCommentary(who: 'player' | 'computer', result: MoveResult) {
    if (mode !== 'pvc') return;
    if (result.gameOver) return;

    const [p1Score, p2Score] = getScores(result.board);
    const scoreDiff = p2Score - p1Score;

    if (who === 'player') {
      if (result.captured) {
        showCommentary(getCommentary('playerCapture'));
      } else if (result.extraTurn) {
        showCommentary(getCommentary('playerExtraTurn'));
      } else if (Math.random() < 0.3) {
        if (scoreDiff >= 5) showCommentary(getCommentary('computerWinning'));
        else if (scoreDiff <= -5) showCommentary(getCommentary('playerWinning'));
        else if (Math.abs(scoreDiff) <= 2 && p1Score + p2Score > 6) showCommentary(getCommentary('closeGame'));
        else showCommentary(getCommentary('playerNormalMove'));
      }
    } else {
      if (result.captured) {
        showCommentary(getCommentary('computerCapture'));
      } else if (result.extraTurn) {
        showCommentary(getCommentary('computerExtraTurn'));
      } else if (Math.random() < 0.35) {
        if (scoreDiff >= 5) showCommentary(getCommentary('computerWinning'));
        else if (scoreDiff <= -5) showCommentary(getCommentary('playerWinning'));
        else if (Math.abs(scoreDiff) <= 2 && p1Score + p2Score > 6) showCommentary(getCommentary('closeGame'));
        else showCommentary(getCommentary('computerNormalMove'));
      }
    }
  }

  const gemPalette = [
    { fill: '#1A8C7A', mid: '#28A890', highlight: '#7EECD8', edge: '#0F6858' },
    { fill: '#1E7A8C', mid: '#2A96A8', highlight: '#80D8EC', edge: '#125868' },
    { fill: '#2A7860', mid: '#38946E', highlight: '#7AE0B0', edge: '#1A5840' },
    { fill: '#B8862A', mid: '#D4A040', highlight: '#F0D888', edge: '#8A6418' },
    { fill: '#8C2A2A', mid: '#A83838', highlight: '#E88080', edge: '#681818' },
    { fill: '#6A3D8C', mid: '#8458A8', highlight: '#C8A0E8', edge: '#4A2868' },
    { fill: '#2A5C8C', mid: '#3878A8', highlight: '#80B8E8', edge: '#183C68' },
    { fill: '#8C6A2A', mid: '#A88438', highlight: '#E8C878', edge: '#684A18' },
  ];

  let flyingStone = $state<FlyingStone>({
    active: false,
    fromPit: 0,
    toPit: 0,
    gemColor: gemPalette[0],
  });

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
    commentary = null;
    if (commentaryTimer) clearTimeout(commentaryTimer);
    screen = 'game';

    if (selectedMode === 'pvc') {
      showCommentary(getCommentary('gameStart'));
    }
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
    await delay(350);

    // Phase 2: Distribute one stone at a time with flying animation
    let tempBoard = [...board];
    for (let i = 0; i < path.length; i++) {
      const fromPit = i === 0 ? pitIndex : path[i - 1];
      const toPit = path[i];

      // Launch flying stone
      flyingStone = {
        active: true,
        fromPit,
        toPit,
        gemColor: gemPalette[Math.floor(Math.random() * gemPalette.length)],
      };

      // Wait for the stone to fly across
      await delay(280 + Math.random() * 60);

      // Land: increment the pit and play drop sound
      tempBoard = [...tempBoard];
      tempBoard[toPit] = (tempBoard[toPit] || 0) + 1;
      board = tempBoard;
      flyingStone = { ...flyingStone, active: false };
      audio.playDrop(i);

      // Brief pause before next stone
      await delay(40 + Math.random() * 20);
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

    // Commentary after move resolves
    const who = currentPlayer === 0 ? 'player' : 'computer';
    triggerCommentary(who as 'player' | 'computer', result);

    // Check game over
    if (result.gameOver) {
      gameOver = true;
      const [p1Score, p2Score] = getScores(result.board);
      const w = getWinner(result.board);
      winner = w;
      isDraw = w === null;
      if (mode === 'pvc') {
        showCommentary(getCommentary(w === 0 ? 'playerWins' : w === 1 ? 'computerWins' : 'closeGame'));
      }
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
    get commentary() { return commentary; },
    get flyingStone() { return flyingStone; },
    startGame,
    goToMenu,
    canClickPit,
    handlePitClick,
  };
}

export const game = createGameState();
