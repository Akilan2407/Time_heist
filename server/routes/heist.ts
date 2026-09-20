import { Router, Request, Response } from 'express';
import { generateHeist } from '../../shared/algorithms/generator.js';
import { solveDP } from '../../shared/algorithms/dp.js';
import { solveBranchAndBound } from '../../shared/algorithms/branchAndBound.js';
import { Heist, HeistResult, PlayerAction, Room } from '../../shared/types.js';

export const heistRouter = Router();

// In-memory heist cache with 1-hour expiration
const heistStore = new Map<string, { heist: Heist; expiresAt: number }>();

function cleanExpiredHeists() {
  const now = Date.now();
  for (const [id, record] of heistStore.entries()) {
    if (record.expiresAt < now) {
      heistStore.delete(id);
    }
  }
}

// Clean up every 10 minutes
setInterval(cleanExpiredHeists, 10 * 60 * 1000);

/**
 * POST /api/heist/generate
 * Generates a new heist scenario with rooms and time budget.
 */
heistRouter.post('/generate', (req: Request, res: Response) => {
  try {
    const { roomCount, timeBudget, difficulty } = req.body || {};
    const heist = generateHeist({ roomCount, timeBudget, difficulty });

    // Store for 1 hour
    heistStore.set(heist.id, {
      heist,
      expiresAt: Date.now() + 60 * 60 * 1000
    });

    res.json(heist);
  } catch (error: any) {
    console.error('Error generating heist:', error);
    res.status(500).json({ error: error.message || 'Failed to generate heist' });
  }
});

/**
 * GET /api/heist/:id
 * Retrieves a heist by ID.
 */
heistRouter.get('/:id', (req: Request, res: Response) => {
  const record = heistStore.get(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Heist not found or expired' });
  }
  res.json(record.heist);
});

/**
 * POST /api/heist/:id/solve
 * Runs both DP and Branch & Bound solvers server-side and returns full comparison data.
 */
heistRouter.post('/:id/solve', (req: Request, res: Response) => {
  try {
    const record = heistStore.get(req.params.id);
    let heist: Heist;

    if (!record) {
      if (req.body?.rooms && req.body?.timeBudget) {
        heist = {
          id: req.params.id,
          name: req.body.name || 'Custom Heist',
          difficulty: req.body.difficulty || 'Standard',
          rooms: req.body.rooms,
          timeBudget: req.body.timeBudget,
          createdAt: Date.now()
        };
      } else {
        return res.status(404).json({ error: 'Heist not found or expired' });
      }
    } else {
      heist = record.heist;
    }

    const dpResult = solveDP(heist.rooms, heist.timeBudget);
    const bnbResult = solveBranchAndBound(heist.rooms, heist.timeBudget);

    const result: HeistResult = {
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

    res.json(result);
  } catch (error: any) {
    console.error('Error solving heist:', error);
    res.status(500).json({ error: error.message || 'Failed to solve heist' });
  }
});

/**
 * POST /api/heist/:id/submit-player-run
 * Validates player's chosen actions, time costs, and returns scoring.
 */
heistRouter.post('/:id/submit-player-run', (req: Request, res: Response) => {
  try {
    const record = heistStore.get(req.params.id);
    let rooms: Room[] = [];
    let timeBudget = 0;

    if (record) {
      rooms = record.heist.rooms;
      timeBudget = record.heist.timeBudget;
    } else if (req.body?.rooms && req.body?.timeBudget) {
      rooms = req.body.rooms;
      timeBudget = req.body.timeBudget;
    } else {
      return res.status(404).json({ error: 'Heist not found or expired' });
    }

    const actions: PlayerAction[] = req.body.actions || [];
    const roomMap = new Map<string, Room>(rooms.map((r) => [r.id, r]));

    let playerTotalValue = 0;
    let playerTotalTime = 0;
    const lootedIds = new Set<string>();
    let valid = true;

    for (const act of actions) {
      const room = roomMap.get(act.roomId);
      if (!room) {
        valid = false;
        continue;
      }
      if (lootedIds.has(act.roomId)) {
        valid = false;
        continue;
      }
      lootedIds.add(act.roomId);
      playerTotalTime += room.timeCost;
      playerTotalValue += room.value;
    }

    if (playerTotalTime > timeBudget) {
      valid = false;
    }

    res.json({
      playerTotalValue,
      playerTotalTime,
      playerValidPath: valid,
      lootedRoomCount: lootedIds.size
    });
  } catch (error: any) {
    console.error('Error validating player run:', error);
    res.status(500).json({ error: error.message || 'Failed to validate player run' });
  }
});
