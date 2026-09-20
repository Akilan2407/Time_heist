import { Room, RoomPosition, CharacterStatus, MovementLogEntry, PathItem } from '../types.js';

export interface CharacterPositionResult {
  x: number;
  y: number;
  status: CharacterStatus;
  activeRoomId: string | null;
  facing: 'left' | 'right';
  progress: number; // 0 to 1
}

/**
 * Computes deterministic (x, y) coordinates for vault rooms on a 2D floor plan.
 */
export function computeRoomPositions(
  rooms: Room[],
  canvasWidth: number = 650,
  canvasHeight: number = 360
): RoomPosition[] {
  const n = rooms.length;
  if (n === 0) return [];

  // Determine grid dimensions
  let cols = 3;
  if (n <= 4) cols = 2;
  else if (n <= 9) cols = 3;
  else if (n <= 12) cols = 4;
  else cols = 4;

  const rows = Math.ceil(n / cols);

  const paddingX = 60;
  const paddingY = 50;
  const usableWidth = canvasWidth - 2 * paddingX;
  const usableHeight = canvasHeight - 2 * paddingY;

  const colSpacing = cols > 1 ? usableWidth / (cols - 1) : 0;
  const rowSpacing = rows > 1 ? usableHeight / (rows - 1) : 0;

  return rooms.map((room, idx) => {
    const r = Math.floor(idx / cols);
    // Alternate row direction (snake layout) for natural vault corridor traversal
    const isEvenRow = r % 2 === 0;
    const c = isEvenRow ? idx % cols : cols - 1 - (idx % cols);

    const x = Math.round(paddingX + (cols > 1 ? c * colSpacing : usableWidth / 2));
    const y = Math.round(paddingY + (rows > 1 ? r * rowSpacing : usableHeight / 2));

    return {
      roomId: room.id,
      x,
      y
    };
  });
}

/**
 * Converts precomputed execution path (DP or BnB) into discrete MovementLogEntry events.
 */
export function convertPathToMovementLog(
  path: PathItem[],
  roomPositions: RoomPosition[],
  pixelsPerSecond: number = 150
): MovementLogEntry[] {
  const posMap = new Map(roomPositions.map((p) => [p.roomId, p]));
  const log: MovementLogEntry[] = [];

  let currentX = 30;
  let currentY = 50;

  for (const item of path) {
    const targetPos = posMap.get(item.roomId);
    if (!targetPos) continue;

    const dx = targetPos.x - currentX;
    const dy = targetPos.y - currentY;
    const dist = Math.hypot(dx, dy);
    const travelTime = Math.max(0.4, dist / pixelsPerSecond);

    const startTime = item.timestamp;
    const arrivedTime = startTime + travelTime;
    const lootCompleteTime = item.timestamp + item.duration;

    log.push({
      timestamp: startTime,
      roomId: item.roomId,
      eventType: 'lootStart' // movement started towards room
    });

    log.push({
      timestamp: arrivedTime,
      roomId: item.roomId,
      eventType: 'arrived'
    });

    log.push({
      timestamp: Math.max(arrivedTime + 0.1, lootCompleteTime),
      roomId: item.roomId,
      eventType: 'lootComplete'
    });

    currentX = targetPos.x;
    currentY = targetPos.y;
  }

  return log;
}

/**
 * Core pure function for Replay & Live evaluation:
 * Maps any timestamp t to an interpolated (x, y) coordinate, character status, and facing direction.
 */
export function getPositionAtTime(
  log: MovementLogEntry[],
  roomPositions: RoomPosition[],
  t: number,
  defaultStartX: number = 30,
  defaultStartY: number = 50
): CharacterPositionResult {
  const posMap = new Map(roomPositions.map((p) => [p.roomId, p]));

  if (!log || log.length === 0) {
    return {
      x: defaultStartX,
      y: defaultStartY,
      status: 'idle',
      activeRoomId: null,
      facing: 'right',
      progress: 0
    };
  }

  // Sort log entries chronologically
  const sorted = [...log].sort((a, b) => a.timestamp - b.timestamp);

  // Group into room sessions
  interface RoomSession {
    roomId: string;
    moveStartTime: number;
    arrivedTime: number;
    lootCompleteTime: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
  }

  const sessions: RoomSession[] = [];
  let lastX = defaultStartX;
  let lastY = defaultStartY;

  // Group by room occurrences
  const roomEvents = new Map<string, { start?: number; arrived?: number; complete?: number }[]>();

  for (const entry of sorted) {
    if (!roomEvents.has(entry.roomId)) {
      roomEvents.set(entry.roomId, []);
    }
    const list = roomEvents.get(entry.roomId)!;
    let curr = list[list.length - 1];

    if (!curr || (entry.eventType === 'lootStart' && curr.complete !== undefined)) {
      curr = {};
      list.push(curr);
    }

    if (entry.eventType === 'lootStart') curr.start = entry.timestamp;
    else if (entry.eventType === 'arrived') curr.arrived = entry.timestamp;
    else if (entry.eventType === 'lootComplete') curr.complete = entry.timestamp;
  }

  // Flatten chronological sessions
  const rawList: { roomId: string; start: number; arrived: number; complete: number }[] = [];
  for (const [roomId, occurrences] of roomEvents.entries()) {
    for (const occ of occurrences) {
      const start = occ.start ?? (occ.arrived ? occ.arrived - 0.8 : 0);
      const arrived = occ.arrived ?? (start + 0.8);
      const complete = occ.complete ?? (arrived + 2.0);
      rawList.push({ roomId, start, arrived, complete });
    }
  }

  rawList.sort((a, b) => a.start - b.start);

  for (const raw of rawList) {
    const targetPos = posMap.get(raw.roomId) || { x: lastX, y: lastY };
    sessions.push({
      roomId: raw.roomId,
      moveStartTime: raw.start,
      arrivedTime: raw.arrived,
      lootCompleteTime: raw.complete,
      startX: lastX,
      startY: lastY,
      targetX: targetPos.x,
      targetY: targetPos.y
    });
    lastX = targetPos.x;
    lastY = targetPos.y;
  }

  // Find active session for timestamp t
  for (let i = 0; i < sessions.length; i++) {
    const s = sessions[i];

    // Case 1: Running towards room
    if (t >= s.moveStartTime && t < s.arrivedTime) {
      const duration = Math.max(0.01, s.arrivedTime - s.moveStartTime);
      const alpha = Math.min(1, Math.max(0, (t - s.moveStartTime) / duration));
      const x = Math.round(s.startX + alpha * (s.targetX - s.startX));
      const y = Math.round(s.startY + alpha * (s.targetY - s.startY));
      const facing = s.targetX >= s.startX ? 'right' : 'left';

      return {
        x,
        y,
        status: 'running',
        activeRoomId: s.roomId,
        facing,
        progress: alpha
      };
    }

    // Case 2: Looting inside room
    if (t >= s.arrivedTime && t < s.lootCompleteTime) {
      const duration = Math.max(0.01, s.lootCompleteTime - s.arrivedTime);
      const alpha = Math.min(1, Math.max(0, (t - s.arrivedTime) / duration));
      const facing = s.targetX >= s.startX ? 'right' : 'left';

      return {
        x: s.targetX,
        y: s.targetY,
        status: 'looting',
        activeRoomId: s.roomId,
        facing,
        progress: alpha
      };
    }
  }

  // Before any actions
  if (sessions.length > 0 && t < sessions[0].moveStartTime) {
    return {
      x: defaultStartX,
      y: defaultStartY,
      status: 'idle',
      activeRoomId: null,
      facing: 'right',
      progress: 0
    };
  }

  // After all actions
  if (sessions.length > 0) {
    const last = sessions[sessions.length - 1];
    return {
      x: last.targetX,
      y: last.targetY,
      status: 'idle',
      activeRoomId: last.roomId,
      facing: 'right',
      progress: 1
    };
  }

  return {
    x: defaultStartX,
    y: defaultStartY,
    status: 'idle',
    activeRoomId: null,
    facing: 'right',
    progress: 0
  };
}
