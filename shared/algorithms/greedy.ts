import { Room, PathItem } from '../types.js';

export interface GreedySolverResult {
  totalValue: number;
  totalTime: number;
  selectedRoomIds: string[];
  executionPath: PathItem[];
  timeMs: number;
}

/**
 * Returns the next best room to loot given remaining budget and already-looted rooms,
 * sorting candidates by value-to-timeCost ratio descending.
 * 
 * Pure function: getGreedyHint(rooms, remainingBudget, lootedRoomIds)
 */
export function getGreedyHint(
  rooms: Room[],
  remainingBudget: number,
  lootedRoomIds: string[]
): Room | null {
  const lootedSet = new Set(lootedRoomIds);

  // Filter out rooms already looted and rooms that exceed the remaining budget
  const availableRooms = rooms.filter(
    (room) => !lootedSet.has(room.id) && room.timeCost <= remainingBudget && room.timeCost > 0
  );

  if (availableRooms.length === 0) {
    return null;
  }

  // Sort by efficiency ratio (value / timeCost) descending.
  // Tie-breaker: higher value first, then smaller timeCost.
  const sorted = [...availableRooms].sort((a, b) => {
    const ratioA = a.value / a.timeCost;
    const ratioB = b.value / b.timeCost;
    if (Math.abs(ratioB - ratioA) > 1e-6) {
      return ratioB - ratioA;
    }
    if (b.value !== a.value) {
      return b.value - a.value;
    }
    return a.timeCost - b.timeCost;
  });

  return sorted[0];
}

/**
 * Runs getGreedyHint repeatedly in a loop to simulate a full greedy heuristic knapsack run.
 */
export function solveGreedyKnapsack(rooms: Room[], timeBudget: number): GreedySolverResult {
  const startTime = performance.now();
  let remainingBudget = Math.max(0, timeBudget);
  const selectedRoomIds: string[] = [];
  const executionPath: PathItem[] = [];
  let totalValue = 0;
  let totalTime = 0;

  while (remainingBudget > 0) {
    const nextRoom = getGreedyHint(rooms, remainingBudget, selectedRoomIds);
    if (!nextRoom) break;

    selectedRoomIds.push(nextRoom.id);
    executionPath.push({
      roomId: nextRoom.id,
      timestamp: totalTime,
      duration: nextRoom.timeCost,
      value: nextRoom.value
    });

    totalValue += nextRoom.value;
    totalTime += nextRoom.timeCost;
    remainingBudget -= nextRoom.timeCost;
  }

  const timeMs = performance.now() - startTime;

  return {
    totalValue,
    totalTime,
    selectedRoomIds,
    executionPath,
    timeMs: Math.round(timeMs * 100) / 100
  };
}
