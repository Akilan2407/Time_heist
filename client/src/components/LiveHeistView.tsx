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

  const handleRecordAction = useCallback((action: PlayerAction, movementEntries: MovementLogEntry[]) => {
    setPlayerActions((prev) => [...prev, action]);
    setPlayerMovementLog((prev) => [...prev, ...movementEntries]);
  }, []);

  const handleLootSuccess = useCallback((room: Room) => {
    setLootedRoomIds((old) => new Set(old).add(room.id));
    setPlayerTotalValue((val) => val + room.value);
  }, []);

  const handleAbort = () => {
    soundFx.playClick();
    setIsFinished(true);
    onFinishHeist(playerActions, playerMovementLog);
  };

  const timeRemaining = Math.max(0, heist.timeBudget - timeElapsed);

  return (
    <div className="layout-container">
      {/* Master Countdown Timer Header */}
      <TimerHeader
        timeRemaining={timeRemaining}
        timeBudget={heist.timeBudget}
        timeElapsed={timeElapsed}
        onAbortHeist={handleAbort}
        isFinished={isFinished}
      />

      {/* 3-Column Live View HUD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        alignItems: 'stretch'
      }}>
        {/* Panel 1: Player Operator with Running Character Canvas */}
        <PlayerPanel
          rooms={heist.rooms}
          timeBudget={heist.timeBudget}
          timeRemaining={timeRemaining}
          timeElapsed={timeElapsed}
          onRecordAction={handleRecordAction}
          onLootSuccess={handleLootSuccess}
          playerTotalValue={playerTotalValue}
          isFinished={isFinished}
          lootedRoomIds={lootedRoomIds}
        />

        {/* Panel 2: DP Crew (Precomputed) */}
        <DPCrewPanel
          rooms={heist.rooms}
          dpPath={heistResult.dpPath}
          timeElapsed={timeElapsed}
          timeBudget={heist.timeBudget}
          dpCellsComputed={heistResult.dpCellsComputed}
          roomMap={roomMap}
        />

        {/* Panel 3: Branch & Bound Crew (Live Tree) */}
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
  );
};
