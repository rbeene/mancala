# Mancala (Kalah Variant) - Game Rules & AI Strategy Guide

This document provides a complete specification for implementing a Mancala video game using the Kalah variant, the most widely known and played version. It covers rules, edge cases, and AI strategies at three difficulty levels.

---

## 1. Board Setup

### Layout

```
         <--- Direction of play (Player 2)
   ┌─────────────────────────────────────────────┐
   │         P2 Pits (top row, indices 12-7)      │
   │  ┌────┬────┬────┬────┬────┬────┐            │
   │  │ 12 │ 11 │ 10 │  9 │  8 │  7 │            │
┌──┤  ├────┴────┴────┴────┴────┴────┤  ┌─────────┤
│P2│  │                              │  │   P1    │
│M │  │                              │  │   M     │
│13│  │                              │  │   6     │
└──┤  ├────┬────┬────┬────┬────┬────┤  └─────────┤
   │  │  0 │  1 │  2 │  3 │  4 │  5 │            │
   │  └────┴────┴────┴────┴────┴────┘            │
   │         P1 Pits (bottom row, indices 0-5)    │
   └─────────────────────────────────────────────┘
         Direction of play (Player 1) --->
```

### Indexing (Recommended Internal Representation)

Use a single array of 14 elements:

| Index | Meaning              |
|-------|----------------------|
| 0-5   | Player 1's pits (left to right from P1's perspective) |
| 6     | Player 1's mancala (store) |
| 7-12  | Player 2's pits (right to left from P2's perspective, i.e., continuing counter-clockwise) |
| 13    | Player 2's mancala (store) |

### Initial State

- Each of the 12 pits starts with **4 stones** (48 stones total).
- Both mancalas start at **0**.
- Initial array: `[4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]`

### Opposite Pit Mapping

When a capture occurs, you need to find the pit directly across the board. The opposite pit for index `i` is:

```
opposite(i) = 12 - i
```

| P1 Pit | Opposite P2 Pit |
|--------|-----------------|
| 0      | 12              |
| 1      | 11              |
| 2      | 10              |
| 3      | 9               |
| 4      | 8               |
| 5      | 7               |

---

## 2. Turn Mechanics

### Step-by-Step Turn Resolution

1. **Validate the move**: The selected pit must be on the current player's side and must contain at least 1 stone.
   - Player 1 may only choose from pits 0-5.
   - Player 2 may only choose from pits 7-12.
   - The selected pit must not be empty.

2. **Pick up stones**: Remove all stones from the selected pit (set it to 0). Store the count in a `hand` variable.

3. **Distribute (sow) stones counter-clockwise**: Starting from the pit immediately after the selected pit, place one stone in each consecutive pit, moving counter-clockwise around the board.
   - **Skip the opponent's mancala**: When distributing, always skip over the opponent's store.
     - If Player 1 is sowing, skip index 13 (P2's mancala).
     - If Player 2 is sowing, skip index 6 (P1's mancala).
   - Continue wrapping around the board if necessary (index wraps from 13 back to 0).

4. **Check where the last stone landed**: The index where the final stone was placed determines what happens next.

5. **Extra turn rule**: If the last stone lands in the **current player's own mancala** (index 6 for P1, index 13 for P2), the current player gets **another turn**.

6. **Capture rule**: If the last stone lands in an **empty pit on the current player's own side**, AND the **opposite pit is not empty**, then:
   - Remove the single stone just placed in the empty pit.
   - Remove all stones from the opposite pit.
   - Place all of these captured stones into the current player's mancala.
   - **Important**: The pit must have been empty *before* the last stone was placed (i.e., it now contains exactly 1 stone). A capture only happens when the last stone lands in a pit that was previously empty.

7. **No capture if opposite is empty**: If the last stone lands in an empty pit on your side but the opposite pit is also empty, no capture occurs.

### Distribution Example

Player 1 selects pit 2 which contains 6 stones:
```
Before: [4, 4, 6, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]
Pick up 6 stones from pit 2.
Distribute: pit 3, pit 4, pit 5, mancala(6), pit 7, pit 8
After:  [4, 4, 0, 5, 5, 5, 1, 5, 5, 4, 4, 4, 4, 0]
Last stone landed in pit 8 (P2's side) - no capture, no extra turn. P2's turn.
```

---

## 3. Game End Conditions

### When the Game Ends

The game ends **immediately** when, at the start of a player's turn (or after a move resolves), **all six pits on one player's side are empty**.

- If Player 1's pits (0-5) are all empty, the game ends.
- If Player 2's pits (7-12) are all empty, the game ends.

### Remaining Stone Collection

When the game ends, **all remaining stones on a player's side are moved into that player's mancala**:

- All stones remaining in pits 0-5 go into Player 1's mancala (index 6).
- All stones remaining in pits 7-12 go into Player 2's mancala (index 13).

**Clarification**: The stones go to the mancala of the player whose side they are on, NOT to the player who triggered the game end.

### Determining the Winner

- The player with the **most stones in their mancala wins**.
- If both mancalas have exactly 24 stones, the game is a **draw**.
- Since there are 48 total stones, the winner always has at least 25 stones (unless it's a draw at 24-24).

---

## 4. Edge Cases & Common Implementation Mistakes

### Wrap-Around Sowing (Pits with > 12 Stones)

A pit can accumulate more than 12 stones during play. When sowing from such a pit, the stones will wrap around the entire board and potentially pass the starting pit again. Key points:

- The starting pit is **not** skipped during wrap-around. Stones are dropped in it like any other pit if the sow path passes through it again.
- The opponent's mancala **is** still skipped on every pass around the board.
- Because you skip the opponent's mancala, a full revolution is 13 pits (not 14). So a pit with exactly 13 stones would place one stone in every pit and in your own mancala, ending exactly where it started (which could trigger a capture if the opposite pit has stones, since the starting pit was emptied and is now being filled).

### Capture Only on Your Own Side

A capture can **only** occur if the last stone lands on the **current player's own side**:
- Player 1: pits 0-5 only
- Player 2: pits 7-12 only

If the last stone lands on the opponent's side (even in an empty pit), no capture occurs.

### Invalid Move Handling

- Selecting an empty pit is **not allowed** and should be rejected. The player must choose again.
- Selecting a pit on the opponent's side is **not allowed** and should be rejected.
- If a player has no valid moves (all their pits are empty), the game ends immediately (see Game End Conditions).

### Extra Turn Does Not Stack Differently

If a player earns an extra turn and then earns another extra turn on their bonus turn, they simply continue getting turns. There is no limit to consecutive extra turns.

### Capture vs. Extra Turn Priority

These are **mutually exclusive** within a single move:
- A capture requires the last stone to land in an empty pit on your side.
- An extra turn requires the last stone to land in your mancala.
- A stone cannot simultaneously land in your mancala and in a pit, so these never conflict.

### Empty Side Check Timing

Check for game end **after each move resolves** (including after captures and before extra turns are taken). If a player's side is empty after their move, the game ends immediately. The extra turn is forfeited if the game-end condition is met.

**However**, the more common and traditional implementation is: check for game end only when it becomes a player's turn and they have no valid moves. Both are acceptable, but the latter is simpler to implement and produces the same results in practice.

---

## 5. AI Difficulty Levels

### Easy AI: Random Selection

**Algorithm:**
1. Collect all non-empty pits on the AI's side.
2. Select one at random (uniform distribution).
3. Execute the move.

**Behavior:**
- No strategy whatsoever.
- Does not consider captures, extra turns, or any position evaluation.
- Beatable by any player who understands basic strategy.
- Useful as a learning opponent and for testing.

**Implementation:**
```
function easyMove(board, player):
    validPits = [i for i in player.pits if board[i] > 0]
    return random.choice(validPits)
```

---

### Medium AI: One-Ply Priority System

**Algorithm (in priority order):**

1. **Extra turn moves**: Look for any pit where the stone count would make the last stone land exactly in the AI's mancala. If multiple exist, pick the one that contributes the most stones to the mancala (or pick randomly among ties).

2. **Capture moves**: Look for any pit where the last stone would land in an empty pit on the AI's side with a non-empty opposite pit. Among multiple capture moves, prefer the one that captures the most stones.

3. **Defensive moves** (optional enhancement): Avoid leaving pits empty on your side when the opponent could capture on their next turn. This can be omitted for a simpler medium AI.

4. **Random fallback**: If no extra turn or capture is available, choose a random non-empty pit.

**How to calculate where the last stone lands:**

```
function lastStoneIndex(board, pitIndex, player):
    stones = board[pitIndex]
    index = pitIndex
    for s in range(stones):
        index = (index + 1) % 14
        if index == opponent.mancala:
            index = (index + 1) % 14
    return index
```

**Behavior:**
- Looks exactly one move ahead.
- Will always take a free extra turn when available.
- Will always capture when possible and no extra turn is available.
- Feels like a competent casual player.
- Beatable with forward planning and defensive play.

**Implementation:**
```
function mediumMove(board, player):
    validPits = [i for i in player.pits if board[i] > 0]

    // Priority 1: Extra turns
    extraTurnMoves = [i for i in validPits
                       if lastStoneIndex(board, i, player) == player.mancala]
    if extraTurnMoves:
        return max(extraTurnMoves, key=stoneCount)  // or random

    // Priority 2: Captures
    captureMoves = []
    for i in validPits:
        lastIdx = lastStoneIndex(board, i, player)
        if lastIdx in player.pits
           and board[lastIdx] == 0
           and board[opposite(lastIdx)] > 0:
            captureMoves.append((i, board[opposite(lastIdx)]))
    if captureMoves:
        return max(captureMoves, key=capturedStones)

    // Priority 3: Random
    return random.choice(validPits)
```

---

### Hard AI: Minimax with Alpha-Beta Pruning

**Algorithm: Minimax**

Minimax is a recursive search algorithm that explores all possible game states to a given depth, alternating between maximizing (AI's turn) and minimizing (opponent's turn) the board evaluation score.

**Alpha-Beta Pruning**: An optimization that eliminates branches of the search tree that cannot influence the final decision. This allows searching deeper without exponential time growth.

**Search Depth**: 8 to 10 plies (half-moves). Adjust based on performance requirements:
- Depth 8: Fast, strong play. Suitable for most situations.
- Depth 10: Stronger but slower. May need time limit for responsive gameplay.
- Consider iterative deepening: search at depth 1, then 2, ..., up to the time limit. Use the best move found at the deepest completed level.

**Handling Extra Turns in Minimax**: When a move results in an extra turn, the *same* player moves again at the next level of the tree (do not alternate players). This is critical for correct evaluation.

**Implementation Pseudocode:**
```
function minimax(board, depth, alpha, beta, isMaximizing, player):
    if depth == 0 or gameOver(board):
        return evaluate(board, aiPlayer)

    currentPlayer = aiPlayer if isMaximizing else opponent
    validMoves = getNonEmptyPits(board, currentPlayer)

    if isMaximizing:
        maxEval = -INFINITY
        for pit in validMoves:
            newBoard, gotExtraTurn = simulateMove(board, pit, currentPlayer)
            if gotExtraTurn:
                eval = minimax(newBoard, depth - 1, alpha, beta, true, player)
            else:
                eval = minimax(newBoard, depth - 1, alpha, beta, false, player)
            maxEval = max(maxEval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break  // Beta cutoff
        return maxEval
    else:
        minEval = +INFINITY
        for pit in validMoves:
            newBoard, gotExtraTurn = simulateMove(board, pit, currentPlayer)
            if gotExtraTurn:
                eval = minimax(newBoard, depth - 1, alpha, beta, false, player)
            else:
                eval = minimax(newBoard, depth - 1, alpha, beta, true, player)
            minEval = min(minEval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break  // Alpha cutoff
        return minEval

function bestMove(board, aiPlayer):
    bestScore = -INFINITY
    bestPit = -1
    for pit in getNonEmptyPits(board, aiPlayer):
        newBoard, gotExtraTurn = simulateMove(board, pit, aiPlayer)
        if gotExtraTurn:
            score = minimax(newBoard, MAX_DEPTH - 1, -INF, +INF, true, aiPlayer)
        else:
            score = minimax(newBoard, MAX_DEPTH - 1, -INF, +INF, false, aiPlayer)
        if score > bestScore:
            bestScore = score
            bestPit = pit
    return bestPit
```

---

## 6. Board Evaluation Heuristic (Hard AI)

The evaluation function returns a score from the AI's perspective. Positive = favorable for AI, negative = favorable for opponent.

### Heuristic Components

| Factor | Description | Weight | Rationale |
|--------|-------------|--------|-----------|
| **Mancala Differential** | `AI_mancala - Opponent_mancala` | **6** | Direct measure of score. Highest priority. |
| **Stones on Own Side** | Total stones in AI's pits | **2** | More stones = more options and potential captures. |
| **Stones on Opponent's Side** | Total stones in opponent's pits (negative) | **-2** | Fewer opponent stones = less threat. |
| **Extra Turn Potential** | Number of pits that would grant an extra turn | **3** | Extra turns are very powerful; chaining them is devastating. |
| **Capture Potential** | Sum of capturable stones across all possible capture moves | **2** | Large captures swing the game. |
| **Empty Pit Vulnerability** | Number of AI pits that are empty with many stones in the opposite pit | **-1** | Opponent could feed these pits to set up captures. |
| **Game Over Bonus** | If game is over, `+1000` if AI wins, `-1000` if AI loses, `0` for draw | **N/A** | Terminal state override. |

### Evaluation Function

```
function evaluate(board, aiPlayer):
    if gameOver(board):
        aiScore = finalScore(board, aiPlayer)
        oppScore = finalScore(board, opponent)
        if aiScore > oppScore: return +1000
        if aiScore < oppScore: return -1000
        return 0

    score = 0

    // Mancala differential (most important)
    score += 6 * (board[aiPlayer.mancala] - board[opponent.mancala])

    // Stones on each side
    aiStones = sum(board[i] for i in aiPlayer.pits)
    oppStones = sum(board[i] for i in opponent.pits)
    score += 2 * (aiStones - oppStones)

    // Extra turn potential
    for pit in aiPlayer.pits:
        if board[pit] > 0:
            if lastStoneIndex(board, pit, aiPlayer) == aiPlayer.mancala:
                score += 3

    // Capture potential
    for pit in aiPlayer.pits:
        if board[pit] > 0:
            lastIdx = lastStoneIndex(board, pit, aiPlayer)
            if lastIdx in aiPlayer.pits and board[lastIdx] == 0:
                oppPit = opposite(lastIdx)
                if board[oppPit] > 0:
                    score += 2 * (board[oppPit] / maxCapturable)  // normalize

    // Defensive: penalize vulnerable empty pits
    for pit in aiPlayer.pits:
        if board[pit] == 0:
            oppPit = opposite(pit)
            if board[oppPit] > 4:
                score -= 1

    return score
```

### Weight Tuning Notes

- The weights above are starting values. They can be tuned through self-play or manual testing.
- The mancala differential should always be the dominant factor.
- In the **endgame** (fewer than ~10 stones in play on one side), increase the weight of "stones on own side" because controlling who empties first becomes critical.
- In the **opening**, extra turn potential is especially valuable because chained extra turns build early leads.

---

## 7. Strategy Principles (For Heuristic Refinement)

### Opening Strategy (First 5-8 Moves)

1. **Prioritize extra turns**: The rightmost pits (closest to your mancala) with the right stone count yield free turns. At the start, pit 5 (index 5 for P1) has 4 stones and lands exactly in the mancala. **This is always the best opening move for Player 1.**
2. **Build up the right side**: Keeping stones near your mancala creates more extra-turn opportunities.
3. **Avoid emptying left-side pits early**: Empty pits near the opponent's mancala are vulnerable to captures and don't threaten captures of your own (the opposite pits haven't accumulated yet).

### Mid-Game Strategy

1. **Chain extra turns**: Setting up sequences where one extra turn leads to another is the most powerful tactic. A chain of 3+ extra turns can swing 6-10 stones.
2. **Set up large captures**: Intentionally empty a pit on your side, then wait for the opponent to fill the opposite pit. Time your move to land in the empty pit.
3. **Defensive awareness**: If the opponent has an empty pit and your opposite pit is full, try to add stones to their empty pit or move your vulnerable stones.
4. **Stone hoarding**: Accumulating many stones in a single pit can be powerful for a big move but also makes you predictable.

### Endgame Strategy

1. **Control the pace**: If you're ahead, try to end the game quickly by emptying your side (remaining stones on your side go to your mancala, and stones on opponent's side go to theirs -- but you've already locked in your lead).
2. **If behind, keep the game going**: Feed stones to your opponent's side to prevent them from emptying out. Try to set up large captures to close the gap.
3. **Count stones**: When the total stones in play is low, you can calculate exact outcomes. The hard AI's search depth should handle this naturally at depth 8-10.
4. **The "25 stone" threshold**: Once a player reaches 25 stones in their mancala, they have guaranteed the win (majority of 48). The game can be called at this point as an optimization.

---

## 8. Implementation Notes

### Move Simulation Function

This is the core of the game engine, used by both gameplay and AI:

```
function simulateMove(board, pitIndex, player):
    newBoard = copy(board)
    stones = newBoard[pitIndex]
    newBoard[pitIndex] = 0

    index = pitIndex
    while stones > 0:
        index = (index + 1) % 14
        // Skip opponent's mancala
        if index == opponent(player).mancala:
            continue
        newBoard[index] += 1
        stones -= 1

    lastIndex = index
    extraTurn = false

    // Check for extra turn
    if lastIndex == player.mancala:
        extraTurn = true

    // Check for capture
    else if lastIndex in player.pits
            and newBoard[lastIndex] == 1
            and newBoard[opposite(lastIndex)] > 0:
        captured = newBoard[lastIndex] + newBoard[opposite(lastIndex)]
        newBoard[lastIndex] = 0
        newBoard[opposite(lastIndex)] = 0
        newBoard[player.mancala] += captured

    // Check for game end
    if allEmpty(newBoard, player1.pits) or allEmpty(newBoard, player2.pits):
        // Sweep remaining stones to their respective mancalas
        for i in player1.pits:
            newBoard[player1.mancala] += newBoard[i]
            newBoard[i] = 0
        for i in player2.pits:
            newBoard[player2.mancala] += newBoard[i]
            newBoard[i] = 0

    return (newBoard, extraTurn)
```

### Performance Considerations for Hard AI

- **Move ordering**: Evaluate moves that grant extra turns first, then captures, then others. Better move ordering improves alpha-beta pruning effectiveness dramatically.
- **Transposition table**: Cache evaluated board positions using a hash. Mancala has many transpositions (different move sequences reaching the same position).
- **Early termination**: If a player reaches 25+ stones in their mancala, the game result is decided. Return immediately with a terminal score.
- **Iterative deepening**: Search at increasing depths (1, 2, 3, ...) with a time limit. Always have a best move ready from the previous depth in case time runs out.

### Player and Pit Constants

```
PLAYER_1_PITS = [0, 1, 2, 3, 4, 5]
PLAYER_1_MANCALA = 6
PLAYER_2_PITS = [7, 8, 9, 10, 11, 12]
PLAYER_2_MANCALA = 13
TOTAL_PITS = 14
INITIAL_STONES = 4
```

### State Machine: Turn Flow

```
START_TURN
  → Validate move (reject invalid)
  → Sow stones
  → Last stone in own mancala?
      YES → EXTRA_TURN (same player goes again)
      NO  → Last stone in empty own pit with non-empty opposite?
              YES → CAPTURE → check game end → SWITCH_PLAYER
              NO  → check game end → SWITCH_PLAYER
  → Game ended?
      YES → SWEEP_REMAINING → DETERMINE_WINNER → GAME_OVER
      NO  → next player's turn (or same player if EXTRA_TURN)
```
