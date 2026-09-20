import { Room, BnBStep, PathItem } from '../../shared/types.js';

export interface BnBSolverResult {
  optimalValue: number;
  selectedRoomIds: string[];
  executionPath: PathItem[];
  tree: BnBStep[];
  nodesExplored: number;
  prunedCount: number;
  timeMs: number;
}

interface Node {
  id: string;
  parentId: string | null;
  level: number;                  // index in rooms array (-1 for root)
  currentValue: number;
  currentTimeCost: number;
  bound: number;                  // upper bound
  branchType: 'include' | 'exclude' | 'root';
  includedRoomId: string | null;
  selectedSoFar: string[];
}

/**
 * Computes fractional knapsack upper bound for remaining items.
 * Syllabus standard greedy method: items sorted by value / timeCost ratio.
 */
export function calculateFractionalKnapsackBound(
  nodeValue: number,
  nodeTimeCost: number,
  level: number,
  sortedRooms: Room[],
  timeBudget: number
): number {
  if (nodeTimeCost > timeBudget) {
    return -1;
  }

  let bound = nodeValue;
  let remainingBudget = timeBudget - nodeTimeCost;
  const n = sortedRooms.length;

  for (let i = level + 1; i < n; i++) {
    const item = sortedRooms[i];
    if (item.timeCost <= remainingBudget) {
      remainingBudget -= item.timeCost;
      bound += item.value;
    } else {
      if (remainingBudget > 0 && item.timeCost > 0) {
        bound += item.value * (remainingBudget / item.timeCost);
      }
      break;
    }
  }

  return bound;
}

/**
 * Simple Binary Max-Heap Priority Queue for Best-First Search
 */
class PriorityQueue<T> {
  private heap: { priority: number; item: T; insertionOrder: number }[] = [];
  private counter = 0;

  push(item: T, priority: number) {
    this.heap.push({ priority, item, insertionOrder: this.counter++ });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0].item;
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parent]) > 0) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[parent];
        this.heap[parent] = temp;
        index = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number) {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let highest = index;

      if (left < length && this.compare(this.heap[left], this.heap[highest]) > 0) {
        highest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[highest]) > 0) {
        highest = right;
      }

      if (highest !== index) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[highest];
        this.heap[highest] = temp;
        index = highest;
      } else {
        break;
      }
    }
  }

  private compare(
    a: { priority: number; insertionOrder: number },
    b: { priority: number; insertionOrder: number }
  ): number {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return b.insertionOrder - a.insertionOrder; // FIFO on equal priority
  }
}

/**
 * Solves 0/1 Knapsack using Best-First Branch and Bound with a Fractional Knapsack Upper Bound.
 * Generates an annotated tree of exploration steps and pruned states.
 */
export function solveBranchAndBound(rooms: Room[], timeBudget: number): BnBSolverResult {
  const startTime = performance.now();
  const n = rooms.length;
  const budget = Math.max(0, timeBudget);

  // If no rooms or zero budget, return empty result
  if (n === 0 || budget === 0) {
    return {
      optimalValue: 0,
      selectedRoomIds: [],
      executionPath: [],
      tree: [],
      nodesExplored: 0,
      prunedCount: 0,
      timeMs: performance.now() - startTime
    };
  }

  // Pre-sort rooms descending by value-to-cost ratio for optimal pruning efficiency
  const sortedRoomsWithOriginalIndices = rooms.map((room, originalIdx) => ({
    room,
    originalIdx,
    ratio: room.timeCost > 0 ? room.value / room.timeCost : Number.POSITIVE_INFINITY
  }));

  sortedRoomsWithOriginalIndices.sort((a, b) => b.ratio - a.ratio);
  const sortedRooms = sortedRoomsWithOriginalIndices.map((x) => x.room);

  const tree: BnBStep[] = [];
  const pq = new PriorityQueue<Node>();

  let bestValueSoFar = 0;
  let bestSolutionRoomIds: string[] = [];
  let nodeSequence = 0;
  let nodesExplored = 0;
  let prunedCount = 0;

  // Root node calculation
  const rootBound = calculateFractionalKnapsackBound(0, 0, -1, sortedRooms, budget);
  const rootNode: Node = {
    id: `node_0`,
    parentId: null,
    level: -1,
    currentValue: 0,
    currentTimeCost: 0,
    bound: rootBound,
    branchType: 'root',
    includedRoomId: null,
    selectedSoFar: []
  };

  pq.push(rootNode, rootNode.bound);

  // Synthetic step delay pacing for replay/animation (~60ms per action)
  let simulatedTimestamp = 0;
  const STEP_TIME_INCREMENT = 60;

  while (!pq.isEmpty()) {
    const current = pq.pop()!;
    nodesExplored++;
    simulatedTimestamp += STEP_TIME_INCREMENT;

    // Prune Check: if current node's upper bound is now <= bestValueSoFar (or < bestValueSoFar)
    // and it's not the root with 0
    if (current.level >= 0 && current.bound <= bestValueSoFar && bestValueSoFar > 0) {
      prunedCount++;
      tree.push({
        timestamp: simulatedTimestamp,
        nodeId: current.id,
        parentId: current.parentId,
        level: current.level,
        includedRoomId: current.includedRoomId,
        branchType: current.branchType,
        currentValue: current.currentValue,
        currentTimeCost: current.currentTimeCost,
        bound: current.bound,
        status: 'pruned',
        pruneReason: 'bound_too_low',
        selectedSoFar: [...current.selectedSoFar]
      });
      continue;
    }

    // Determine status of exploration
    const isBest = current.currentValue > bestValueSoFar;
    if (isBest) {
      bestValueSoFar = current.currentValue;
      bestSolutionRoomIds = [...current.selectedSoFar];
    }

    const isLeaf = current.level === n - 1;

    tree.push({
      timestamp: simulatedTimestamp,
      nodeId: current.id,
      parentId: current.parentId,
      level: current.level,
      includedRoomId: current.includedRoomId,
      branchType: current.branchType,
      currentValue: current.currentValue,
      currentTimeCost: current.currentTimeCost,
      bound: current.bound,
      status: isBest ? 'best-so-far' : isLeaf ? 'leaf' : 'explored',
      selectedSoFar: [...current.selectedSoFar]
    });

    // If reached bottom of search tree, don't branch further
    if (isLeaf) {
      continue;
    }

    const nextLevel = current.level + 1;
    const nextRoom = sortedRooms[nextLevel];

    // --- Branch 1: INCLUDE next room ---
    const withTimeCost = current.currentTimeCost + nextRoom.timeCost;
    const withValue = current.currentValue + nextRoom.value;
    const includeNodeId = `node_${++nodeSequence}`;

    if (withTimeCost <= budget) {
      const withBound = calculateFractionalKnapsackBound(
        withValue,
        withTimeCost,
        nextLevel,
        sortedRooms,
        budget
      );

      const includeNode: Node = {
        id: includeNodeId,
        parentId: current.id,
        level: nextLevel,
        currentValue: withValue,
        currentTimeCost: withTimeCost,
        bound: withBound,
        branchType: 'include',
        includedRoomId: nextRoom.id,
        selectedSoFar: [...current.selectedSoFar, nextRoom.id]
      };

      if (withBound > bestValueSoFar) {
        pq.push(includeNode, withBound);
      } else {
        // Upper bound cannot beat best so far -> Prune immediately
        prunedCount++;
        simulatedTimestamp += 20;
        tree.push({
          timestamp: simulatedTimestamp,
          nodeId: includeNode.id,
          parentId: current.id,
          level: nextLevel,
          includedRoomId: nextRoom.id,
          branchType: 'include',
          currentValue: withValue,
          currentTimeCost: withTimeCost,
          bound: withBound,
          status: 'pruned',
          pruneReason: 'bound_too_low',
          selectedSoFar: [...includeNode.selectedSoFar]
        });
      }
    } else {
      // Over capacity -> Prune immediately
      prunedCount++;
      simulatedTimestamp += 20;
      tree.push({
        timestamp: simulatedTimestamp,
        nodeId: includeNodeId,
        parentId: current.id,
        level: nextLevel,
        includedRoomId: nextRoom.id,
        branchType: 'include',
        currentValue: withValue,
        currentTimeCost: withTimeCost,
        bound: -1,
        status: 'pruned',
        pruneReason: 'time_exceeded',
        selectedSoFar: [...current.selectedSoFar, nextRoom.id]
      });
    }

    // --- Branch 2: EXCLUDE next room ---
    const withoutBound = calculateFractionalKnapsackBound(
      current.currentValue,
      current.currentTimeCost,
      nextLevel,
      sortedRooms,
      budget
    );

    const excludeNodeId = `node_${++nodeSequence}`;

    if (withoutBound > bestValueSoFar) {
      const excludeNode: Node = {
        id: excludeNodeId,
        parentId: current.id,
        level: nextLevel,
        currentValue: current.currentValue,
        currentTimeCost: current.currentTimeCost,
        bound: withoutBound,
        branchType: 'exclude',
        includedRoomId: null,
        selectedSoFar: [...current.selectedSoFar]
      };
      pq.push(excludeNode, withoutBound);
    } else {
      // Prune exclude branch if bound cannot beat best so far
      prunedCount++;
      simulatedTimestamp += 20;
      tree.push({
        timestamp: simulatedTimestamp,
        nodeId: excludeNodeId,
        parentId: current.id,
        level: nextLevel,
        includedRoomId: null,
        branchType: 'exclude',
        currentValue: current.currentValue,
        currentTimeCost: current.currentTimeCost,
        bound: withoutBound,
        status: 'pruned',
        pruneReason: 'bound_too_low',
        selectedSoFar: [...current.selectedSoFar]
      });
    }
  }

  // Build sequential execution timeline for BnB replay
  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  let currentTimestamp = 0;
  const executionPath: PathItem[] = [];

  for (const roomId of bestSolutionRoomIds) {
    const room = roomMap.get(roomId);
    if (room) {
      executionPath.push({
        roomId: room.id,
        timestamp: currentTimestamp,
        duration: room.timeCost,
        value: room.value
      });
      currentTimestamp += room.timeCost;
    }
  }

  const timeMs = performance.now() - startTime;

  return {
    optimalValue: bestValueSoFar,
    selectedRoomIds: bestSolutionRoomIds,
    executionPath,
    tree,
    nodesExplored,
    prunedCount,
    timeMs
  };
}
