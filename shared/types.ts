export interface Room {
  id: string;
  name: string;
  value: number;       // loot value ($k)
  timeCost: number;    // seconds to loot
  description?: string;
  icon?: string;
  securityLevel?: 'Low' | 'Medium' | 'High' | 'Extreme';
  guarded?: boolean;
}

export interface RoomPosition {
  roomId: string;
  x: number;   // pixel or percentage coordinate
  y: number;
}

export interface GuardPatrolWaypoint {
  roomId: string;
  stayDuration: number; // seconds the guard inspects this room
}

export interface Guard {
  id: string;
  name: string;
  color: string;
  patrolRoute: GuardPatrolWaypoint[]; // sequence of rooms to inspect
  travelSpeed: number; // pixels per second (e.g. 110)
}

export interface GuardPositionResult {
  x: number;
  y: number;
  status: 'patrolling' | 'inspecting';
  currentRoomId: string | null;
  targetRoomId: string | null;
  facing: 'left' | 'right';
  progress: number; // 0 to 1
}

export type CharacterStatus = 'idle' | 'running' | 'looting' | 'caught';

export interface CharacterState {
  x: number;
  y: number;
  status: CharacterStatus;
  currentTargetRoomId: string | null;
  queue: string[];        // roomIds queued up, in order
}

export interface MovementLogEntry {
  timestamp: number;      // ms or seconds since heist start
  roomId: string;
  eventType: 'arrived' | 'lootStart' | 'lootComplete' | 'caught';
}

export interface Heist {
  id: string;
  name: string;
  difficulty: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible';
  rooms: Room[];
  guards: Guard[];
  timeBudget: number;   // total seconds available
  createdAt: number;
}

export interface DPStep {
  timestamp: number;    // ms since solve start (simulated, for replay pacing)
  roomIndex: number;
  budgetRemaining: number;
  tableCellsFilled: number;
  actionDescription?: string;
}

export interface BnBStep {
  timestamp: number;
  nodeId: string;
  parentId: string | null;
  level: number;
  includedRoomId: string | null;   // room this node decided to include, or null if it's a "skip" branch
  branchType: 'include' | 'exclude' | 'root';
  currentValue: number;
  currentTimeCost: number;
  bound: number;                    // upper bound estimate at this node
  status: 'explored' | 'pruned' | 'best-so-far' | 'leaf';
  pruneReason?: 'time_exceeded' | 'bound_too_low';
  selectedSoFar: string[];
}

export interface PlayerAction {
  timestamp: number;   // seconds elapsed when room was looted
  roomId: string;
}

export interface PathItem {
  roomId: string;
  timestamp: number;   // seconds elapsed when looted
  duration: number;    // timeCost
  value: number;
}

export interface HeistResult {
  heistId: string;
  optimalValue: number;             // from DP, ground truth
  dpPath: PathItem[];
  bnbPath: PathItem[];
  bnbTree: BnBStep[];
  playerPath: PlayerAction[];
  playerMovementLog?: MovementLogEntry[];
  playerTotalValue: number;
  playerValidPath: boolean;
  bnbNodesExplored: number;
  dpCellsComputed: number;
  bnbTimeMs: number;
  dpTimeMs: number;
  prunedCount: number;
  breachCount?: number;
}

export interface PlayerStateAtTime {
  time: number;
  lootedRoomIds: string[];
  totalValue: number;
  timeUsed: number;
  currentActivity: string;
  activeRoomId: string | null;
}
