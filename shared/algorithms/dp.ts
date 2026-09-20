import { Room, DPStep, PathItem } from '../types.js';

export interface DPSolverResult {
  optimalValue: number;
  selectedRoomIds: string[];
  executionPath: PathItem[];
  steps: DPStep[];
  cellsComputed: number;
  timeMs: number;
}

/**
 * Solves 0/1 Knapsack using classic bottom-up Dynamic Programming.
 * Backtracks to reconstruct the optimal room selection and formats
 * an execution timeline for the DP crew.
 */
export function solveDP(rooms: Room[], timeBudget: number): DPSolverResult {
  const startTime = performance.now();
  const n = rooms.length;
  const W = Math.max(0, Math.floor(timeBudget));

  // Initialize DP Table: (n + 1) x (W + 1)
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const steps: DPStep[] = [];
  let cellsComputed = 0;

  // Fill DP Table
  for (let i = 1; i <= n; i++) {
    const room = rooms[i - 1];
    const { value, timeCost } = room;
    const cost = Math.max(0, Math.floor(timeCost));

    for (let w = 0; w <= W; w++) {
      cellsComputed++;
      if (cost <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - cost] + value);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }

    // Capture step summary for visual replay/explanation
    steps.push({
      timestamp: Math.round(i * (1000 / Math.max(1, n))),
      roomIndex: i - 1,
      budgetRemaining: W,
      tableCellsFilled: cellsComputed,
      actionDescription: `Processed room '${room.name}' (Value: $${value}k, Cost: ${timeCost}s)`
    });
  }

  const optimalValue = n > 0 && W >= 0 ? dp[n][W] : 0;

  // Backtracking to find the exact subset of rooms included
  const selectedRooms: Room[] = [];
  let currW = W;
  for (let i = n; i > 0 && currW > 0; i--) {
    if (dp[i][currW] !== dp[i - 1][currW]) {
      const room = rooms[i - 1];
      selectedRooms.push(room);
      currW -= Math.max(0, Math.floor(room.timeCost));
    }
  }

  // Reconstructed order (reversed to present in natural vault sequence)
  selectedRooms.reverse();
  const selectedRoomIds = selectedRooms.map((r) => r.id);

  // Build sequential execution timeline for the heist replay
  let currentTimestamp = 0;
  const executionPath: PathItem[] = [];

  for (const room of selectedRooms) {
    executionPath.push({
      roomId: room.id,
      timestamp: currentTimestamp,
      duration: room.timeCost,
      value: room.value
    });
    currentTimestamp += room.timeCost;
  }

  const timeMs = performance.now() - startTime;

  return {
    optimalValue,
    selectedRoomIds,
    executionPath,
    steps,
    cellsComputed,
    timeMs
  };
}
