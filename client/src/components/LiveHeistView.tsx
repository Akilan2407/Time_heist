import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Heist, HeistResult, PlayerAction, MovementLogEntry, Room } from '../../../shared/types.js';
import { TimerHeader } from './live/TimerHeader.js';
import { PlayerPanel } from './live/PlayerPanel.js';
import { DPCrewPanel } from './live/DPCrewPanel.js';
import { BnBCrewPanel } from './live/BnBCrewPanel.js';
import { soundFx } from '../utils/audio.js';

interface LiveHeistViewProps {
  heist: Heist;
  heistResult: HeistResult;
  onFinishHeist: (actions: PlayerAction[], movementLog: MovementLogEntry[]) => void;
}

export const LiveHeistView: React.FC<LiveHeistViewProps> = ({
  heist,
  heistResult,
  onFinishHeist
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Player state
  const [lootedRoomIds, setLootedRoomIds] = useState<Set<string>>(new Set());
  const [playerTotalValue, setPlayerTotalValue] = useState(0);
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([]);
  const [playerMovementLog, setPlayerMovementLog] = useState<MovementLogEntry[]>([]);
  const prevTickSecondRef = useRef<number>(-1);

  const roomMap = useMemo(() => new Map(heist.rooms.map((r) => [r.id, r])), [heist.rooms]);

  // Master Clock Loop (100ms precision)
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const next = Math.min(heist.timeBudget, prev + 0.1);

        // Check if time is up
        if (next >= heist.timeBudget) {
          clearInterval(interval);
          setIsFinished(true);
          soundFx.playHeistAlarm();
          setTimeout(() => {
            onFinishHeist(playerActions, playerMovementLog);
          }, 1200);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isFinished, heist.timeBudget, onFinishHeist, playerActions, playerMovementLog]);

  // Play soft tick sound only during the final 10 seconds of the countdown
  useEffect(() => {
    const remaining = Math.ceil(Math.max(0, heist.timeBudget - timeElapsed));
    if (remaining <= 10 && remaining > 0 && remaining !== prevTickSecondRef.current && !isFinished) {
      prevTickSecondRef.current = remaining;
      soundFx.playCountdownTick();
    }
  }, [timeElapsed, heist.timeBudget, isFinished]);

  const handleRecordAction = useCallback((action: PlayerAction, movementEntries: MovementLogEntry[]) => {
    setPlayerActions((prev) => [...prev, action]);
    setPlayerMovementLog((prev) => [...prev, ...movementEntries]);
  }, []);

  const handleLootSuccess = useCallback((room: Room) => {
    setLootedRoomIds((old) => new Set(old).add(room.id));
    setPlayerTotalValue((val) => val + room.value);
  }, []);

  const handlePenaltyDeducted = useCallback((valuePenalty: number, timePenalty: number) => {
    setPlayerTotalValue((val) => Math.max(0, val - valuePenalty));
    setTimeElapsed((t) => Math.min(heist.timeBudget, t + timePenalty));
  }, [heist.timeBudget]);

  const handleAbort = () => {
    soundFx.playClick();
    setIsFinished(true);
    onFinishHeist(playerActions, playerMovementLog);
  };

  const timeRemaining = Math.max(0, heist.timeBudget - timeElapsed);

  return (
    <div style={{ maxWidth: '1680px', margin: '0 auto', padding: '16px 24px' }}>
      {/* Master Countdown Timer Header */}
      <TimerHeader
        timeRemaining={timeRemaining}
        timeBudget={heist.timeBudget}
        timeElapsed={timeElapsed}
        onAbortHeist={handleAbort}
        isFinished={isFinished}
      />

      {/* Prominent Hero Layout: Operator Panel is larger & wide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(600px, 1.85fr) minmax(320px, 1fr) minmax(320px, 1fr)',
        gap: '24px',
        alignItems: 'stretch'
      }}>
        {/* Panel 1: Enlarged Operator Panel with Guards and Running Character */}
        <div style={{ minWidth: 0 }}>
          <PlayerPanel
            rooms={heist.rooms}
            guards={heist.guards}
            timeBudget={heist.timeBudget}
            timeRemaining={timeRemaining}
            timeElapsed={timeElapsed}
            onRecordAction={handleRecordAction}
            onLootSuccess={handleLootSuccess}
            onPenaltyDeducted={handlePenaltyDeducted}
            playerTotalValue={playerTotalValue}
            isFinished={isFinished}
            lootedRoomIds={lootedRoomIds}
          />
        </div>

        {/* Panel 2: DP Crew (Precomputed) */}
        <div style={{ minWidth: 0 }}>
          <DPCrewPanel
            rooms={heist.rooms}
            dpPath={heistResult.dpPath}
            timeElapsed={timeElapsed}
            timeBudget={heist.timeBudget}
            dpCellsComputed={heistResult.dpCellsComputed}
            roomMap={roomMap}
          />
        </div>

        {/* Panel 3: Branch & Bound Crew (Live Tree) */}
        <div style={{ minWidth: 0 }}>
          <BnBCrewPanel
            rooms={heist.rooms}
            bnbTree={heistResult.bnbTree}
            timeElapsed={timeElapsed}
            timeBudget={heist.timeBudget}
            bnbNodesExplored={heistResult.bnbNodesExplored}
            prunedCount={heistResult.prunedCount}
            optimalValue={heistResult.optimalValue}
            roomMap={roomMap}
          />
        </div>
      </div>
    </div>
  );
};
