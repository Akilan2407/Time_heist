import { computeRoomPositions, getPositionAtTime, convertPathToMovementLog } from '../../shared/utils/movement.js';
import { Room, MovementLogEntry, PathItem } from '../../shared/types.js';

console.log('🧪 Testing Character Movement & Replay Interpolation...');

const mockRooms: Room[] = [
  { id: 'r1', name: 'Laser Vault', value: 80, timeCost: 10 },
  { id: 'r2', name: 'Diamond Safe', value: 120, timeCost: 15 },
  { id: 'r3', name: 'Gold Reserve', value: 70, timeCost: 8 }
];

// Test 1: Room Position Computation
const positions = computeRoomPositions(mockRooms, 640, 340);
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

// At t = 1.0s, should be 'running' towards r1
const t1Pos = getPositionAtTime(sampleLog, positions, 1.0);
if (t1Pos.status !== 'running') throw new Error(`Expected running at t=1.0, got ${t1Pos.status}`);
if (t1Pos.activeRoomId !== 'r1') throw new Error('Expected activeRoomId r1');
console.log('✓ t=1.0s running interpolation:', t1Pos);

// At t = 5.0s, should be 'looting' r1
const t5Pos = getPositionAtTime(sampleLog, positions, 5.0);
if (t5Pos.status !== 'looting') throw new Error(`Expected looting at t=5.0, got ${t5Pos.status}`);
if (t5Pos.x !== positions[0].x || t5Pos.y !== positions[0].y) throw new Error('Coordinates must match r1');
console.log('✓ t=5.0s looting state:', t5Pos);

// At t = 13.0s, should be 'running' towards r2
const t13Pos = getPositionAtTime(sampleLog, positions, 13.0);
if (t13Pos.status !== 'running') throw new Error(`Expected running at t=13.0, got ${t13Pos.status}`);
if (t13Pos.activeRoomId !== 'r2') throw new Error('Expected activeRoomId r2');
console.log('✓ t=13.0s running towards r2:', t13Pos);

// At t = 20.0s, should be 'looting' r2
const t20Pos = getPositionAtTime(sampleLog, positions, 20.0);
if (t20Pos.status !== 'looting') throw new Error(`Expected looting at t=20.0, got ${t20Pos.status}`);
console.log('✓ t=20.0s looting r2:', t20Pos);

// At t = 35.0s, should be 'idle' at r2
const t35Pos = getPositionAtTime(sampleLog, positions, 35.0);
if (t35Pos.status !== 'idle') throw new Error(`Expected idle at t=35.0, got ${t35Pos.status}`);
console.log('✓ t=35.0s idle at final destination:', t35Pos);

// Test 4: Path to Movement Log Conversion
const mockPath: PathItem[] = [
  { roomId: 'r1', timestamp: 0, duration: 10, value: 80 },
  { roomId: 'r3', timestamp: 10, duration: 8, value: 70 }
];
const convertedLog = convertPathToMovementLog(mockPath, positions);
if (convertedLog.length !== 6) throw new Error(`Expected 6 log entries, got ${convertedLog.length}`);
console.log('✓ Converted path to movement log successfully');

console.log('\n🎉 ALL MOVEMENT & REPLAY INTERPOLATION TESTS PASSED!');
