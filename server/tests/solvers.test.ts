import { solveDP } from '../../shared/algorithms/dp.js';
import { solveBranchAndBound } from '../../shared/algorithms/branchAndBound.js';
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
  assert(dp.optimalValue === 0, 'DP optimalValue on empty input should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue on empty input should be 0');
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
  assert(dp.optimalValue === 0, 'DP optimalValue on 0 budget should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue on 0 budget should be 0');
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
  assert(dp.optimalValue === 0, 'DP optimalValue when budget too small should be 0');
  assert(bnb.optimalValue === 0, 'BnB optimalValue when budget too small should be 0');
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
  assert(dp.optimalValue === 220, 'DP should take all rooms');
  assert(bnb.optimalValue === 220, 'BnB should take all rooms');
  validateSubset(rooms, dp.selectedRoomIds, 100, 220, 'DP');
  validateSubset(rooms, bnb.selectedRoomIds, 100, 220, 'BnB');
}

// 5. Classic Knapsack Benchmark
console.log('Test 5: Classic textbook knapsack instance');
{
  const rooms: Room[] = [
    { id: 'r1', name: 'Diamond', value: 60, timeCost: 10 },
    { id: 'r2', name: 'Gold', value: 100, timeCost: 20 },
    { id: 'r3', name: 'Relic', value: 120, timeCost: 30 }
  ];
  const budget = 50;
  const dp = solveDP(rooms, budget);
  const bnb = solveBranchAndBound(rooms, budget);
  assert(dp.optimalValue === 220, 'DP textbook benchmark optimal value');
  assert(bnb.optimalValue === 220, 'BnB textbook benchmark optimal value');
  validateSubset(rooms, dp.selectedRoomIds, budget, 220, 'DP');
  validateSubset(rooms, bnb.selectedRoomIds, budget, 220, 'BnB');
}

// 6. 30 Randomized Heists of varying sizes and budgets
console.log('Test 6: 30 Randomized Heists (Stress & Parity Test)');
for (let i = 1; i <= 30; i++) {
  const roomCount = 3 + Math.floor(Math.random() * 12);
  const timeBudget = 15 + Math.floor(Math.random() * 60);
  const heist = generateHeist({ roomCount, timeBudget });

  const dp = solveDP(heist.rooms, heist.timeBudget);
  const bnb = solveBranchAndBound(heist.rooms, heist.timeBudget);

  assert(
    dp.optimalValue === bnb.optimalValue,
    `Heist #${i} (${roomCount} rooms, ${timeBudget}s): DP (${dp.optimalValue}) !== BnB (${bnb.optimalValue})`
  );

  validateSubset(heist.rooms, dp.selectedRoomIds, heist.timeBudget, dp.optimalValue, `DP (Run ${i})`);
  validateSubset(heist.rooms, bnb.selectedRoomIds, heist.timeBudget, bnb.optimalValue, `BnB (Run ${i})`);

  if (i % 10 === 0) {
    console.log(
      `   ✓ Verified ${i}/30 random heists. Latest: ${roomCount} rooms, budget: ${timeBudget}s, optimal: $${dp.optimalValue}k (DP cells: ${dp.cellsComputed}, BnB nodes: ${bnb.nodesExplored}, BnB pruned: ${bnb.prunedCount})`
    );
  }
}

console.log('\n====================================================');
console.log(`✅ ALL ${totalTests} TESTS PASSED WITH 100% PARITY!`);
console.log('====================================================');
