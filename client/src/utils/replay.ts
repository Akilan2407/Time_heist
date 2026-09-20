import { PathItem, Room, PlayerStateAtTime } from '../../../shared/types.js';

export interface EntityStateAtTime {
  time: number;
  lootedRoomIds: string[];
  totalValue: number;
  timeUsed: number;
  currentActivity: string;
  activeRoomId: string | null;
  activeProgress: number; // 0 to 1
}

/**
 * Pure function to calculate exact entity state at any given timestamp t (in seconds).
 */
export function getStateAtTime(
  path: PathItem[],
  t: number,
  roomMap: Map<string, Room>
): EntityStateAtTime {
  const lootedRoomIds: string[] = [];
  let totalValue = 0;
  let timeUsed = 0;
  let activeRoomId: string | null = null;
  let activeProgress = 0;
  let currentActivity = 'Idle / Infiltrating';

  for (const item of path) {
    const start = item.timestamp;
    const end = item.timestamp + item.duration;
    const room = roomMap.get(item.roomId);
    const roomName = room ? room.name : item.roomId;

    if (t >= end) {
      // Completed looting
      lootedRoomIds.push(item.roomId);
      totalValue += item.value;
      timeUsed += item.duration;
    } else if (t >= start && t < end) {
      // Currently looting
      activeRoomId = item.roomId;
      activeProgress = Math.min(1, Math.max(0, (t - start) / item.duration));
      timeUsed += (t - start);
      currentActivity = `Looting: ${roomName} (${Math.round(activeProgress * 100)}%)`;
    }
  }

  if (activeRoomId === null) {
    if (lootedRoomIds.length === path.length && path.length > 0 && t >= (path[path.length - 1].timestamp + path[path.length - 1].duration)) {
      currentActivity = 'Heist Plan Completed / Exfiltrated';
    } else {
      currentActivity = 'Standby / Moving to target';
    }
  }

  return {
    time: t,
    lootedRoomIds,
    totalValue,
    timeUsed: Math.round(timeUsed * 10) / 10,
    currentActivity,
    activeRoomId,
    activeProgress
  };
}

/**
 * Calculates player state from recorded actions at timestamp t.
 */
export function getPlayerStateAtTime(
  actions: { roomId: string; timestamp: number }[],
  t: number,
  roomMap: Map<string, Room>
): EntityStateAtTime {
  const lootedRoomIds: string[] = [];
  let totalValue = 0;
  let timeUsed = 0;
  let activeRoomId: string | null = null;
  let activeProgress = 0;
  let currentActivity = 'Standby';

  for (const act of actions) {
    const room = roomMap.get(act.roomId);
    if (!room) continue;

    // In player actions, act.timestamp is when the looting finished or started
    // Let's assume act.timestamp is when looting started
    const start = act.timestamp;
    const end = act.timestamp + room.timeCost;

    if (t >= end) {
      lootedRoomIds.push(act.roomId);
      totalValue += room.value;
      timeUsed += room.timeCost;
    } else if (t >= start && t < end) {
      activeRoomId = act.roomId;
      activeProgress = Math.min(1, Math.max(0, (t - start) / room.timeCost));
      timeUsed += (t - start);
      currentActivity = `Lockpicking: ${room.name} (${Math.round(activeProgress * 100)}%)`;
    }
  }

  if (!activeRoomId && lootedRoomIds.length > 0) {
    currentActivity = 'Waiting for next room / Exfiltrating';
  }

  return {
    time: t,
    lootedRoomIds,
    totalValue,
    timeUsed: Math.round(timeUsed * 10) / 10,
    currentActivity,
    activeRoomId,
    activeProgress
  };
}
