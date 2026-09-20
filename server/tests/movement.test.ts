import { computeRoomPositions, getPositionAtTime, convertPathToMovementLog, getGuardPositionAtTime } from '../../shared/utils/movement.js';
import { Room, MovementLogEntry, PathItem, Guard } from '../../shared/types.js';

console.log('🧪 Testing Character & Guard Movement & Replay Interpolation...');

const mockRooms: Room[] = [
  { id: 'r1', name: 'Laser Vault', value: 80, timeCost: 10 },
  { id: 'r2', name: 'Diamond Safe', value: 120, timeCost: 15 },
  { id: 'r3', name: 'Gold Reserve', value: 70, timeCost: 8 }
];

// Test 1: Room Position Computation
const positions = computeRoomPositions(mockRooms, 740, 440);
if (positions.length !== 3) throw new Error('Expected 3 positions');
console.log('✓ Room positions computed:', positions);

// Test 2: Idle before start
const emptyPos = getPositionAtTime([], positions, 5);
if (emptyPos.status !== 'idle') throw new Error('Expected idle status on empty log');
console.log('✓ Empty log correctly yields idle status');

// Test 3: Interpolation during movement
const sampleLog: MovementLogEntry[] = [
  { timestamp: 0, roomId: 'r1', eventType: 'lootStart' },
  { timestamp: 2, roomId: 'r1', eventType: 'arrived' },
  { timestamp: 12, roomId: 'r1', eventType: 'lootComplete' },
  { timestamp: 12, roomId: 'r2', eventType: 'lootStart' },
  { timestamp: 14, roomId: 'r2', eventType: 'arrived' },
  { timestamp: 29, roomId: 'r2', eventType: 'lootComplete' }
];

const t1Pos = getPositionAtTime(sampleLog, positions, 1.0);
if (t1Pos.status !== 'running') throw new Error(`Expected running at t=1.0, got ${t1Pos.status}`);
console.log('✓ t=1.0s running interpolation verified');

const t5Pos = getPositionAtTime(sampleLog, positions, 5.0);
if (t5Pos.status !== 'looting') throw new Error(`Expected looting at t=5.0, got ${t5Pos.status}`);
console.log('✓ t=5.0s looting state verified');

// Test 4: Guard Cyclic Patrol Route
const mockGuard: Guard = {
  id: 'guard_1',
  name: 'Sentry Alpha',
  color: '#ef4444',
  patrolRoute: [
    { roomId: 'r1', stayDuration: 5 },
    { roomId: 'r2', stayDuration: 5 }
  ],
  travelSpeed: 100
};

// At t = 2s, guard is inspecting r1
const g2 = getGuardPositionAtTime(mockGuard, positions, 2.0);
if (g2.status !== 'inspecting' || g2.currentRoomId !== 'r1') {
  throw new Error(`Expected guard inspecting r1 at t=2.0s, got ${JSON.stringify(g2)}`);
}
console.log('✓ Guard inspecting r1 at t=2.0s');

// At t = 6s, guard is travelling towards r2
const g6 = getGuardPositionAtTime(mockGuard, positions, 6.0);
if (g6.status !== 'patrolling') {
  throw new Error(`Expected guard patrolling at t=6.0s, got ${JSON.stringify(g6)}`);
}
console.log('✓ Guard patrolling towards r2 at t=6.0s');

console.log('\n🎉 ALL MOVEMENT & GUARD PATROL TESTS PASSED!');
