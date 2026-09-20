import { solveDP } from '../../shared/algorithms/dp.js';
import { solveBranchAndBound } from '../../shared/algorithms/branchAndBound.js';
import { getGreedyHint, solveGreedyKnapsack } from '../../shared/algorithms/greedy.js';
import { generateHeist } from '../../shared/algorithms/generator.js';
import { Room } from '../../shared/types.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
  }
}

function validateSubset(rooms: Room[], selectedIds: string[], budget: number, expectedVal: number, solverName: string) {
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  let totalTime = 0;
  let totalVal = 0;

  for (const id of selectedIds) {
    const r = roomMap.get(id);
    assert(r !== undefined, `${solverName}: Selected room ${id} must exist in input`);
    if (r) {
      totalTime += r.timeCost;
      totalVal += r.value;
    }
  }

  assert(
    totalTime <= budget,
    `${solverName}: Total time cost (${totalTime}) exceeded budget (${budget})`
  );
  assert(
    totalVal === expectedVal,
    `${solverName}: Reconstructed value (${totalVal}) does not match reported optimalValue (${expectedVal})`
  );
}

console.log('====================================================');
console.log('🧪 RUNNING "TIME HEIST" ALGORITHM TEST SUITE');
console.log('====================================================\n');

// 1. Edge Case: Empty Rooms
console.log('Test 1: Empty room list');
{
  const dp = solveDP([], 50);
  const bnb = solveBranchAndBound([], 50);
  const greedy = solveGreedyKnapsack([], 50);
  const hint = getGreedyHint([], 50, []);
  assert(dp.optimalValue === 0, 'DP optimalValue on empty input should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue on empty input should be 0');
  assert(greedy.totalValue === 0, 'Greedy totalValue on empty input should be 0');
  assert(hint === null, 'getGreedyHint on empty input should return null');
}

// 2. Edge Case: Zero Budget
console.log('Test 2: Zero budget');
{
  const rooms: Room[] = [
    { id: 'r1', name: 'Vault A', value: 100, timeCost: 10 },
    { id: 'r2', name: 'Vault B', value: 50, timeCost: 5 }
  ];
  const dp = solveDP(rooms, 0);
  const bnb = solveBranchAndBound(rooms, 0);
  const greedy = solveGreedyKnapsack(rooms, 0);
  const hint = getGreedyHint(rooms, 0, []);
  assert(dp.optimalValue === 0, 'DP optimalValue on 0 budget should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue on 0 budget should be 0');
  assert(greedy.totalValue === 0, 'Greedy totalValue on 0 budget should be 0');
  assert(hint === null, 'getGreedyHint on 0 budget should return null');
}

// 3. Edge Case: Budget smaller than any item
console.log('Test 3: Budget smaller than all items');
{
  const rooms: Room[] = [
    { id: 'r1', name: 'Vault A', value: 100, timeCost: 20 },
    { id: 'r2', name: 'Vault B', value: 50, timeCost: 15 }
  ];
  const dp = solveDP(rooms, 10);
  const bnb = solveBranchAndBound(rooms, 10);
  const greedy = solveGreedyKnapsack(rooms, 10);
  const hint = getGreedyHint(rooms, 10, []);
  assert(dp.optimalValue === 0, 'DP optimalValue when budget too small should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue when budget too small should be 0');
  assert(greedy.totalValue === 0, 'Greedy totalValue when budget too small should be 0');
  assert(hint === null, 'getGreedyHint should return null when budget too small');
}

// 4. Edge Case: Budget larger than sum of all items
console.log('Test 4: Budget exceeds sum of all items');
{
  const rooms: Room[] = [
    { id: 'r1', name: 'Vault A', value: 100, timeCost: 10 },
    { id: 'r2', name: 'Vault B', value: 80, timeCost: 15 },
    { id: 'r3', name: 'Vault C', value: 40, timeCost: 5 }
  ];
  const dp = solveDP(rooms, 100);
  const bnb = solveBranchAndBound(rooms, 100);
  const greedy = solveGreedyKnapsack(rooms, 100);
  assert(dp.optimalValue === 220, 'DP should take all rooms');
  assert(bnb.optimalValue === 220, 'BnB should take all rooms');
  assert(greedy.totalValue === 220, 'Greedy should take all rooms');
  validateSubset(rooms, dp.selectedRoomIds, 100, 220, 'DP');
  validateSubset(rooms, bnb.selectedRoomIds, 100, 220, 'BnB');
  validateSubset(rooms, greedy.selectedRoomIds, 100, 220, 'Greedy');
}

// 5. Classic Knapsack Benchmark & Pure getGreedyHint Verification
console.log('Test 5: Classic textbook knapsack instance and getGreedyHint pure function');
{
  const rooms: Room[] = [
    { id: 'r1', name: 'Diamond', value: 60, timeCost: 10 },  // ratio: 6.0
    { id: 'r2', name: 'Gold', value: 100, timeCost: 20 },     // ratio: 5.0
    { id: 'r3', name: 'Relic', value: 120, timeCost: 30 }     // ratio: 4.0
  ];
  const budget = 50;
  const dp = solveDP(rooms, budget);
  const bnb = solveBranchAndBound(rooms, budget);
  const greedy = solveGreedyKnapsack(rooms, budget);

  assert(dp.optimalValue === 220, 'DP textbook benchmark optimal value');
  assert(bnb.optimalValue === 220, 'BnB textbook benchmark optimal value');
  validateSubset(rooms, dp.selectedRoomIds, budget, 220, 'DP');
  validateSubset(rooms, bnb.selectedRoomIds, budget, 220, 'BnB');
  validateSubset(rooms, greedy.selectedRoomIds, budget, greedy.totalValue, 'Greedy');

  // getGreedyHint step 1: should pick r1 (ratio 6.0)
  const hint1 = getGreedyHint(rooms, 50, []);
  assert(hint1 !== null && hint1.id === 'r1', 'getGreedyHint step 1 should return r1 (highest ratio 6.0)');

  // getGreedyHint step 2: after looting r1 (budget 40), should pick r2 (ratio 5.0)
  const hint2 = getGreedyHint(rooms, 40, ['r1']);
  assert(hint2 !== null && hint2.id === 'r2', 'getGreedyHint step 2 should return r2 (next ratio 5.0)');

  // getGreedyHint step 3: after looting r1 and r2 (budget 20), r3 needs 30s so it cannot fit
  const hint3 = getGreedyHint(rooms, 20, ['r1', 'r2']);
  assert(hint3 === null, 'getGreedyHint step 3 should return null since r3 (30s) exceeds remaining budget (20s)');
}

// 6. 30 Randomized Heists of varying sizes and budgets
console.log('Test 6: 30 Randomized Heists (Stress & Parity Test with Greedy Heuristic)');
for (let i = 1; i <= 30; i++) {
  const roomCount = 3 + Math.floor(Math.random() * 12);
  const timeBudget = 15 + Math.floor(Math.random() * 60);
  const heist = generateHeist({ roomCount, timeBudget });

  const dp = solveDP(heist.rooms, heist.timeBudget);
  const bnb = solveBranchAndBound(heist.rooms, heist.timeBudget);
  const greedy = solveGreedyKnapsack(heist.rooms, heist.timeBudget);

  assert(
    dp.optimalValue === bnb.optimalValue,
    `Heist #${i} (${roomCount} rooms, ${timeBudget}s): DP (${dp.optimalValue}) !== BnB (${bnb.optimalValue})`
  );

  assert(
    greedy.totalValue <= dp.optimalValue,
    `Heist #${i}: Greedy (${greedy.totalValue}) cannot exceed optimal DP value (${dp.optimalValue})`
  );

  assert(
    greedy.totalTime <= heist.timeBudget,
    `Heist #${i}: Greedy total time (${greedy.totalTime}) cannot exceed time budget (${heist.timeBudget})`
  );

  validateSubset(heist.rooms, dp.selectedRoomIds, heist.timeBudget, dp.optimalValue, `DP (Run ${i})`);
  validateSubset(heist.rooms, bnb.selectedRoomIds, heist.timeBudget, bnb.optimalValue, `BnB (Run ${i})`);
  validateSubset(heist.rooms, greedy.selectedRoomIds, heist.timeBudget, greedy.totalValue, `Greedy (Run ${i})`);

  if (i % 10 === 0) {
    console.log(
      `   ✓ Verified ${i}/30 random heists. Latest: ${roomCount} rooms, budget: ${timeBudget}s, optimal: $${dp.optimalValue}k, greedy: $${greedy.totalValue}k (DP cells: ${dp.cellsComputed}, BnB nodes: ${bnb.nodesExplored}, BnB pruned: ${bnb.prunedCount})`
    );
  }
}

console.log('\n====================================================');
console.log(`✅ ALL ${totalTests} TESTS PASSED WITH 100% PARITY & VALIDATION!`);
console.log('====================================================');

