import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Heist, HeistResult, PlayerAction, Room } from '../../../shared/types.js';
import { TimerHeader } from './live/TimerHeader.js';
import { PlayerPanel } from './live/PlayerPanel.js';
import { DPCrewPanel } from './live/DPCrewPanel.js';
import { BnBCrewPanel } from './live/BnBCrewPanel.js';
import { soundFx } from '../utils/audio.js';

interface LiveHeistViewProps {
  heist: Heist;
  heistResult: HeistResult;
  onFinishHeist: (actions: PlayerAction[]) => void;
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
  const [activeLootingRoom, setActiveLootingRoom] = useState<{ room: Room; startElapsed: number } | null>(null);
  const [playerActions, setPlayerActions] = useState<PlayerAction[]>([]);

  const roomMap = useMemo(() => new Map(heist.rooms.map((r) => [r.id, r])), [heist.rooms]);

  // Master Clock Loop (100ms precision)
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        const next = Math.min(heist.timeBudget, prev + 0.1);

        // Check if player is currently looting a room
        if (activeLootingRoom) {
          const lootDuration = activeLootingRoom.room.timeCost;
          const timeSpentOnLoot = next - activeLootingRoom.startElapsed;

          if (timeSpentOnLoot >= lootDuration) {
            // Room lockpick completed!
            soundFx.playLootSuccess();
            setLootedRoomIds((old) => new Set(old).add(activeLootingRoom.room.id));
            setPlayerTotalValue((val) => val + activeLootingRoom.room.value);
            setPlayerActions((acts) => [
              ...acts,
              { roomId: activeLootingRoom.room.id, timestamp: activeLootingRoom.startElapsed }
            ]);
            setActiveLootingRoom(null);
          }
        }

        // Check if time is up
        if (next >= heist.timeBudget) {
          clearInterval(interval);
          setIsFinished(true);
          soundFx.playHeistAlarm();
          setTimeout(() => {
            onFinishHeist(playerActions);
          }, 1200);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isFinished, activeLootingRoom, heist.timeBudget, onFinishHeist, playerActions]);

  const handleLootRoom = (room: Room) => {
    if (activeLootingRoom || isFinished) return;
    const remaining = heist.timeBudget - timeElapsed;
    if (room.timeCost > remaining) return;

    setActiveLootingRoom({
      room,
      startElapsed: timeElapsed
    });
  };

  const handleAbort = () => {
    soundFx.playClick();
    setIsFinished(true);
    onFinishHeist(playerActions);
  };

  const timeRemaining = Math.max(0, heist.timeBudget - timeElapsed);

  const activeProgress = activeLootingRoom
    ? Math.min(1, Math.max(0, (timeElapsed - activeLootingRoom.startElapsed) / activeLootingRoom.room.timeCost))
    : 0;

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
        {/* Panel 1: Player Operator */}
        <PlayerPanel
          rooms={heist.rooms}
          timeBudget={heist.timeBudget}
          timeRemaining={timeRemaining}
          timeElapsed={timeElapsed}
          lootedRoomIds={lootedRoomIds}
          activeLootingRoomId={activeLootingRoom ? activeLootingRoom.room.id : null}
          activeLootingProgress={activeProgress}
          onLootRoom={handleLootRoom}
          playerTotalValue={playerTotalValue}
          isFinished={isFinished}
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
