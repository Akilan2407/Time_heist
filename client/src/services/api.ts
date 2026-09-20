import { Heist, HeistResult, PlayerAction } from '../../../shared/types.js';
import { generateHeist as localGenerateHeist } from '../../../shared/algorithms/generator.js';
import { solveDP as localSolveDP } from '../../../shared/algorithms/dp.js';
import { solveBranchAndBound as localSolveBnB } from '../../../shared/algorithms/branchAndBound.js';

const API_BASE = '/api/heist';

export async function apiGenerateHeist(options: {
  roomCount?: number;
  timeBudget?: number;
  difficulty?: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible';
}): Promise<Heist> {
  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API fetch failed, generating heist locally in browser:', err);
    return localGenerateHeist(options);
  }
}

export async function apiSolveHeist(heist: Heist): Promise<HeistResult> {
  try {
    const res = await fetch(`${API_BASE}/${heist.id}/solve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(heist)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API solve failed, computing solvers locally in browser:', err);
    const dpResult = localSolveDP(heist.rooms, heist.timeBudget);
    const bnbResult = localSolveBnB(heist.rooms, heist.timeBudget);

    return {
      heistId: heist.id,
      optimalValue: dpResult.optimalValue,
      dpPath: dpResult.executionPath,
      bnbPath: bnbResult.executionPath,
      bnbTree: bnbResult.tree,
      playerPath: [],
      playerTotalValue: 0,
      playerValidPath: true,
      bnbNodesExplored: bnbResult.nodesExplored,
      dpCellsComputed: dpResult.cellsComputed,
      bnbTimeMs: Math.round(bnbResult.timeMs * 100) / 100,
      dpTimeMs: Math.round(dpResult.timeMs * 100) / 100,
      prunedCount: bnbResult.prunedCount
    };
  }
}

export async function apiSubmitPlayerRun(
  heistId: string,
  actions: PlayerAction[],
  heist: Heist
): Promise<{ playerTotalValue: number; playerValidPath: boolean; lootedRoomCount: number }> {
  try {
    const res = await fetch(`${API_BASE}/${heistId}/submit-player-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actions, rooms: heist.rooms, timeBudget: heist.timeBudget })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API submit failed, scoring locally:', err);
    const roomMap = new Map(heist.rooms.map((r) => [r.id, r]));
    let playerTotalValue = 0;
    let playerTotalTime = 0;
    const lootedIds = new Set<string>();
    let valid = true;

    for (const act of actions) {
      const room = roomMap.get(act.roomId);
      if (!room || lootedIds.has(act.roomId)) {
        valid = false;
        continue;
      }
      lootedIds.add(act.roomId);
      playerTotalTime += room.timeCost;
      playerTotalValue += room.value;
    }

    if (playerTotalTime > heist.timeBudget) {
      valid = false;
    }

    return {
      playerTotalValue,
      playerTotalTime,
      playerValidPath: valid,
      lootedRoomCount: lootedIds.size
    };
  }
}
